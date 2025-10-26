import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStyles } from '@/constants/styles';
import { getGroupedExercisesWithVideos, ExerciseDefinition } from '@/constants/exerciseLibrary';

interface WorkoutSet {
  setOrder: number;
  weight: string;
  reps: string;
}

interface WorkoutExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

interface WorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (workoutName: string, exercises: WorkoutExercise[]) => void;
}

export default function WorkoutModal({ visible, onClose, onSave }: WorkoutModalProps) {
  const styles = useAppStyles();
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [workoutName, setWorkoutName] = useState('');

  const handleAddExercise = (exercise: ExerciseDefinition) => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString() + Math.random(),
      name: exercise.name,
      sets: [{ setOrder: 1, weight: '', reps: '' }],
    };
    setExercises([...exercises, newExercise]);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSetOrder = ex.sets.length + 1;
        return {
          ...ex,
          sets: [...ex.sets, { setOrder: newSetOrder, weight: '', reps: '' }],
        };
      }
      return ex;
    }));
  };

  const handleRemoveSet = (exerciseId: string, setOrder: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const updatedSets = ex.sets
          .filter(set => set.setOrder !== setOrder)
          .map((set, index) => ({ ...set, setOrder: index + 1 }));
        return { ...ex, sets: updatedSets };
      }
      return ex;
    }));
  };

  const handleUpdateSet = (
    exerciseId: string,
    setOrder: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set =>
            set.setOrder === setOrder ? { ...set, [field]: value } : set
          ),
        };
      }
      return ex;
    }));
  };

  const handleFinish = () => {
    if (exercises.length === 0) {
      onClose();
      return;
    }
    setShowFinishDialog(true);
  };

  const handleSaveWorkout = () => {
    const finalName = workoutName.trim() || 'Untitled Workout';
    onSave(finalName, exercises);

    // Reset state
    setExercises([]);
    setWorkoutName('');
    setShowFinishDialog(false);
  };

  const handleCancel = () => {
    // Reset state
    setExercises([]);
    setWorkoutName('');
    setShowFinishDialog(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={styles.fullScreenModal} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.workoutModalHeader}>
          <Pressable onPress={handleCancel} style={styles.headerButton}>
            <ThemedText style={[styles.headerButtonText, styles.closeButtonText]}>
              Cancel
            </ThemedText>
          </Pressable>
          <ThemedText style={styles.title}>New Workout</ThemedText>
          <Pressable onPress={handleFinish} style={styles.headerButton}>
            <ThemedText style={[styles.headerButtonText, styles.finishButtonText]}>
              Finish
            </ThemedText>
          </Pressable>
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.workoutModalContent}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {exercises.length === 0 ? (
              <View style={styles.emptyWorkoutState}>
                <ThemedText style={[styles.paragraph, { opacity: 0.6, marginBottom: 20 }]}>
                  No exercises yet. Tap the button below to add your first exercise.
                </ThemedText>
              </View>
            ) : (
              exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onRemoveExercise={handleRemoveExercise}
                  onAddSet={handleAddSet}
                  onRemoveSet={handleRemoveSet}
                  onUpdateSet={handleUpdateSet}
                />
              ))
            )}

            <Pressable
              style={styles.addExerciseButton}
              onPress={() => setShowExercisePicker(true)}
            >
              <ThemedText style={styles.addExerciseButtonText}>+ Add Exercise</ThemedText>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Exercise Picker Modal */}
        <ExercisePicker
          visible={showExercisePicker}
          onClose={() => setShowExercisePicker(false)}
          onSelect={handleAddExercise}
        />

        {/* Finish Workout Dialog */}
        <FinishWorkoutDialog
          visible={showFinishDialog}
          workoutName={workoutName}
          onChangeName={setWorkoutName}
          onSave={handleSaveWorkout}
          onCancel={() => setShowFinishDialog(false)}
        />
      </SafeAreaView>
    </Modal>
  );
}

// Exercise Card Component
interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onRemoveExercise: (id: string) => void;
  onAddSet: (id: string) => void;
  onRemoveSet: (id: string, setOrder: number) => void;
  onUpdateSet: (id: string, setOrder: number, field: 'weight' | 'reps', value: string) => void;
}

function ExerciseCard({
  exercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: ExerciseCardProps) {
  const styles = useAppStyles();

  return (
    <View style={styles.workoutExerciseCard}>
      <View style={styles.exerciseHeader}>
        <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
        <Pressable
          onPress={() => onRemoveExercise(exercise.id)}
          style={styles.removeExerciseButton}
        >
          <ThemedText style={styles.removeExerciseText}>Remove</ThemedText>
        </Pressable>
      </View>

      {exercise.sets.map((set) => (
        <View key={set.setOrder} style={styles.setRow}>
          <ThemedText style={styles.setLabel}>{set.setOrder}</ThemedText>

          <View style={styles.setInputContainer}>
            <ThemedText style={styles.setInputLabel}>Weight (lbs)</ThemedText>
            <TextInput
              style={styles.setInput}
              value={set.weight}
              onChangeText={(value) => onUpdateSet(exercise.id, set.setOrder, 'weight', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.setInputContainer}>
            <ThemedText style={styles.setInputLabel}>Reps</ThemedText>
            <TextInput
              style={styles.setInput}
              value={set.reps}
              onChangeText={(value) => onUpdateSet(exercise.id, set.setOrder, 'reps', value)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#999999"
            />
          </View>

          {exercise.sets.length > 1 && (
            <Pressable
              onPress={() => onRemoveSet(exercise.id, set.setOrder)}
              style={styles.removeSetButton}
            >
              <ThemedText style={styles.removeSetText}>×</ThemedText>
            </Pressable>
          )}
        </View>
      ))}

      <Pressable style={styles.addSetButton} onPress={() => onAddSet(exercise.id)}>
        <ThemedText style={styles.addSetButtonText}>+ Add Set</ThemedText>
      </Pressable>
    </View>
  );
}

// Exercise Picker Component
interface ExercisePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseDefinition) => void;
}

function ExercisePicker({ visible, onClose, onSelect }: ExercisePickerProps) {
  const styles = useAppStyles();
  const groupedExercises = getGroupedExercisesWithVideos();
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, Video | null>>({});

  const handleVideoPress = async (exerciseId: string) => {
    const videoRef = videoRefs.current[exerciseId];
    if (!videoRef) return;

    // If this video is already playing, pause it
    if (playingVideoId === exerciseId) {
      await videoRef.pauseAsync();
      setPlayingVideoId(null);
    } else {
      // Pause currently playing video if any
      if (playingVideoId && videoRefs.current[playingVideoId]) {
        await videoRefs.current[playingVideoId]?.pauseAsync();
      }
      // Play the new video
      await videoRef.playAsync();
      setPlayingVideoId(exerciseId);
    }
  };

  const handleExerciseSelect = async (exercise: ExerciseDefinition) => {
    // Pause any playing video
    if (playingVideoId && videoRefs.current[playingVideoId]) {
      await videoRefs.current[playingVideoId]?.pauseAsync();
    }
    setPlayingVideoId(null);
    onSelect(exercise);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.pickerModalContainer} onPress={onClose}>
        <Pressable
          style={styles.pickerModalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.pickerHeader}>
            <ThemedText style={styles.pickerTitle}>Select Exercise</ThemedText>
            <Pressable onPress={onClose} style={styles.headerButton}>
              <ThemedText style={[styles.headerButtonText, styles.closeButtonText]}>
                Close
              </ThemedText>
            </Pressable>
          </View>

          <ScrollView
            style={styles.pickerList}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(groupedExercises).map(([category, exercises]) => (
              <View key={category}>
                <ThemedText style={styles.categoryHeader}>{category}</ThemedText>
                {exercises.map((exercise) => (
                  <View key={exercise.id} style={styles.exercisePickerItem}>
                    {/* Video Thumbnail - Pressable */}
                    <Pressable
                      onPress={() => handleVideoPress(exercise.id)}
                      style={styles.exerciseVideoThumbnail}
                    >
                      <Video
                        ref={(ref) => {
                          videoRefs.current[exercise.id] = ref;
                        }}
                        source={exercise.videoSource}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode={ResizeMode.COVER}
                        isLooping
                        isMuted
                        shouldPlay={false}
                      />
                    </Pressable>

                    {/* Exercise Name - Pressable */}
                    <Pressable
                      style={styles.exercisePickerTextArea}
                      onPress={() => handleExerciseSelect(exercise)}
                    >
                      <ThemedText style={styles.exercisePickerText}>
                        {exercise.name}
                      </ThemedText>
                      <ThemedText style={styles.exercisePickerCategory}>
                        {category}
                      </ThemedText>
                    </Pressable>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Finish Workout Dialog Component
interface FinishWorkoutDialogProps {
  visible: boolean;
  workoutName: string;
  onChangeName: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function FinishWorkoutDialog({
  visible,
  workoutName,
  onChangeName,
  onSave,
  onCancel,
}: FinishWorkoutDialogProps) {
  const styles = useAppStyles();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <Pressable style={styles.dialogOverlay} onPress={onCancel}>
        <Pressable
          style={styles.dialogContent}
          onPress={(e) => e.stopPropagation()}
        >
          <ThemedText style={styles.dialogTitle}>Name Your Workout</ThemedText>
          <TextInput
            style={styles.dialogInput}
            value={workoutName}
            onChangeText={onChangeName}
            placeholder="Enter workout name"
            placeholderTextColor="#999999"
            autoFocus
          />
          <View style={styles.dialogButtons}>
            <Pressable
              style={[styles.dialogButton, styles.dialogButtonCancel]}
              onPress={onCancel}
            >
              <ThemedText style={[styles.dialogButtonText, styles.dialogButtonTextCancel]}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.dialogButton, styles.dialogButtonSave]}
              onPress={onSave}
            >
              <ThemedText style={[styles.dialogButtonText, styles.dialogButtonTextSave]}>
                Save
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
