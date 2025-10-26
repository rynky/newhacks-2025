import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Animated, View, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { initDB, getAllWorkouts, insertWorkout } from '@/database/database';
import { useAppStyles } from "@/constants/styles";
import WorkoutModal from '@/components/WorkoutModal';
import { EXERCISE_LIBRARY } from '@/constants/exerciseLibrary';

interface AIWorkout {
  routineName: string;
  description: string;
  exercises: Array<{
    name: string;
    category: string;
    sets: string;
    reps: string;
  }>;
  estimatedDuration: string;
}

const GEMINI_API_KEY = "AIzaSyBni3ytRBPycX36XrqUuZHj8_OLy-PPtNY";
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const styles = useAppStyles();
  const [modalVisible, setModalVisible] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [aiWorkout, setAiWorkout] = useState<AIWorkout | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Initialize DB and load workouts (initDB auto-seeds mock data once)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initDB();
        const rows = await getAllWorkouts();
        if (mounted) {
          console.log('[workout] loaded workouts', Array.isArray(rows) ? rows.length : typeof rows, rows);
          setWorkouts(rows || []);
        }
      } catch (e) {
        console.log('DB init/load error', e);
      } finally {
        if (mounted) setLoadingWorkouts(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const handleSaveWorkout = async (workoutName: string, exercises: any[]) => {
    try {
      // Transform the data to match database format
      const workoutData = {
        id: Date.now().toString(),
        name: workoutName,
        duration: '0min',
        date: new Date().toISOString(),
        exercises: exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets
            .filter((set: any) => set.weight && set.reps) // Only include completed sets
            .map((set: any) => ({
              setOrder: set.setOrder,
              weight: parseFloat(set.weight) || 0,
              reps: parseInt(set.reps) || 0,
            })),
        })).filter(exercise => exercise.sets.length > 0), // Only include exercises with sets
      };

      // Save to database
      await insertWorkout(workoutData);

      // Refresh workout list
      const updatedWorkouts = await getAllWorkouts();
      setWorkouts(updatedWorkouts || []);

      // Close modal and reset selected exercises
      setModalVisible(false);
      setSelectedExercises([]);
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  // Helper function to format relative dates
  const getRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays <= 7) return `${diffInDays} Days Ago`;
    if (diffInDays <= 30) return `${Math.floor(diffInDays / 7)} Weeks Ago`;
    return date.toLocaleDateString();
  };

  // Generate AI workout suggestion
  const generateAIWorkout = async () => {
    setLoadingAI(true);
    try {
      // Build exercise list
      const exerciseList = EXERCISE_LIBRARY.map(ex => `${ex.name} (${ex.category})`).join(', ');
      
      // Build past workout summary
      const pastWorkoutSummary = workouts.length > 0 
        ? workouts.slice(0, 5).map(w => `- ${w.name} on ${new Date(w.date).toLocaleDateString()} with ${w.exercises?.length || 0} exercises`).join('\n')
        : 'No previous workouts yet.';
      
      const prompt = `You are a professional fitness coach for Superlift app. Based on the following exercise library and user's workout history, generate a comprehensive workout routine.

AVAILABLE EXERCISES:
${exerciseList}

PAST WORKOUTS:
${pastWorkoutSummary}

Please generate a workout routine that:
1. Is well-balanced across muscle groups
2. Takes into account the user's recent activity
3. Includes 6-8 exercises
4. Provides sets and rep ranges for each exercise
5. Is challenging but realistic

Format your response as JSON with the following structure:
{
  "routineName": "Name of the workout",
  "description": "Brief description",
  "exercises": [
    {
      "name": "Exercise name",
      "category": "Muscle group",
      "sets": "3-4",
      "reps": "8-12"
    }
  ],
  "estimatedDuration": "60 minutes"
}`;

      console.log('🤖 Calling Gemini API directly...');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      let workoutRoutine;
      
      if (jsonMatch) {
        workoutRoutine = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if JSON parsing fails
        workoutRoutine = {
          routineName: "AI-Generated Workout",
          description: responseText,
          exercises: [],
          estimatedDuration: "45-60 minutes"
        };
      }
      
      setAiWorkout(workoutRoutine);
      setShowAISuggestion(true);
      console.log('✅ AI workout generated successfully:', workoutRoutine);
    } catch (error: any) {
      console.error('❌ Error generating AI workout:', error);
      alert(`Failed to generate AI workout: ${error.message}`);
    } finally {
      setLoadingAI(false);
    }
  };

  // Convert AI workout exercises to modal format and open modal
  const startAIWorkout = () => {
    if (!aiWorkout) return;

    // Convert AI exercises to the format expected by the modal
    const exercisesForModal = aiWorkout.exercises.map(exercise => {
      // Extract set count from the sets string (e.g., "3-4" -> 3)
      const setCount = parseInt(exercise.sets.split('-')[0]) || 3;
      
      // Create empty sets for the modal
      const sets = Array.from({ length: setCount }, (_, index) => ({
        setOrder: index + 1,
        weight: '',
        reps: '',
        completed: false
      }));

      return {
        name: exercise.name,
        category: exercise.category,
        sets: sets,
        targetReps: exercise.reps,
        targetSets: exercise.sets
      };
    });

    setSelectedExercises(exercisesForModal);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.container.backgroundColor }} edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.container, { paddingTop: 0 }]}>
        {/* Workout Modal */}
        <WorkoutModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedExercises([]);
          }}
          onSave={handleSaveWorkout}
          preSelectedExercises={selectedExercises}
          workoutName={aiWorkout?.routineName || 'AI Generated Workout'}
        />

        <ScrollView
          style={{ width: "100%", flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Hero Greeting */}
            <ThemedText style={styles.heroGreeting}>
              Ready to crush it, NewHacks attendee?
            </ThemedText>

            {/* AI Workout Card */}
            <Pressable
              style={styles.aiWorkoutCard}
              onPress={aiWorkout ? startAIWorkout : () => setModalVisible(true)}
            >
              <LinearGradient
                colors={['#4B7BEC', '#2E5AAC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiWorkoutCardContent}
              >
                <ThemedText style={styles.aiWorkoutLabel}>
                  Today's AI-Optimized Workout
                </ThemedText>
                <ThemedText style={styles.aiWorkoutTitle}>
                  {aiWorkout?.routineName || 'Full Body Strength - Phase 2'}
                </ThemedText>
                <ThemedText style={styles.aiWorkoutDetails}>
                  {aiWorkout ? `${aiWorkout.estimatedDuration} | ${aiWorkout.exercises.length} Exercises` : 'Est. 60 mins | 8 Exercises'}
                </ThemedText>
                <Pressable
                  style={styles.startWorkoutButton}
                  onPress={aiWorkout ? startAIWorkout : () => setModalVisible(true)}
                >
                  <ThemedText style={styles.startWorkoutButtonText}>
                    Start Workout
                  </ThemedText>
                </Pressable>
              </LinearGradient>
            </Pressable>

            {/* Generate AI Suggestion Button */}
            <Pressable
              style={{
                backgroundColor: '#6366F1',
                padding: 16,
                borderRadius: 12,
                marginTop: 16,
                alignItems: 'center',
                opacity: loadingAI ? 0.6 : 1,
              }}
              onPress={generateAIWorkout}
              disabled={loadingAI}
            >
              {loadingAI ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                  🤖 Generate AI Workout Suggestion
                </ThemedText>
              )}
            </Pressable>

            {/* AI Workout Suggestion Display */}
            {showAISuggestion && aiWorkout && (
              <View style={[styles.aiWorkoutCard, { marginTop: 16 }]}>
                <LinearGradient
                  colors={['#4B7BEC', '#2E5AAC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    padding: 20,
                    borderRadius: 16,
                    maxHeight: screenHeight * 0.6, // Limit height for smaller screens
                  }}
                >
                  <ScrollView 
                    style={{ maxHeight: screenHeight * 0.55 }}
                    showsVerticalScrollIndicator={true}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <ThemedText style={[styles.aiWorkoutTitle, { flex: 1, marginRight: 16 }]}>
                        {aiWorkout.routineName}
                      </ThemedText>
                      <Pressable 
                        onPress={() => setShowAISuggestion(false)}
                        style={{ padding: 4 }}
                      >
                        <ThemedText style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>✕</ThemedText>
                      </Pressable>
                    </View>
                    
                    <ThemedText style={[styles.aiWorkoutDetails, { marginBottom: 16, lineHeight: 20 }]}>
                      {aiWorkout.description}
                    </ThemedText>
                    
                    <ThemedText style={{ fontSize: 16, marginBottom: 12, color: '#FFFFFF', fontWeight: '600' }}>
                      Exercises:
                    </ThemedText>
                    
                    {aiWorkout.exercises.map((exercise, index) => (
                      <View key={index} style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                      }}>
                        <ThemedText style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>
                          {exercise.name}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 13, color: '#FFFFFF', opacity: 0.9, lineHeight: 18 }}>
                          {exercise.sets} sets × {exercise.reps} reps • {exercise.category}
                        </ThemedText>
                      </View>
                    ))}
                    
                    <ThemedText style={{ fontSize: 13, color: '#FFFFFF', marginTop: 12, opacity: 0.9 }}>
                      ⏱️ Duration: {aiWorkout.estimatedDuration}
                    </ThemedText>

                    <Pressable
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginTop: 16,
                      }}
                      onPress={startAIWorkout}
                    >
                      <ThemedText style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                        🏋️ Start This Workout
                      </ThemedText>
                    </Pressable>
                  </ScrollView>
                </LinearGradient>
              </View>
            )}

            {/* Recent Activity */}
            <ThemedText style={[styles.recentActivityHeader, { marginTop: 32 }]}>
              Recent Activity
            </ThemedText>

            {loadingWorkouts ? (
              <ThemedText style={styles.paragraph}>Loading workouts...</ThemedText>
            ) : (
              workouts.map((workout) => (
                <View key={workout.id} style={styles.activityCard}>
                  <View style={styles.activityCardHeader}>
                    <ThemedText style={styles.activityTitle}>
                      {workout.name}
                    </ThemedText>
                    <Pressable onPress={() => console.log('View details:', workout.id)}>
                      <ThemedText style={styles.viewDetailsLink}>
                        View Details &gt;
                      </ThemedText>
                    </Pressable>
                  </View>

                  <ThemedText style={styles.activityTimestamp}>
                    {getRelativeDate(workout.date)}
                  </ThemedText>

                  {workout.exercises && workout.exercises.map((exercise: any, index: number) => (
                    <ThemedText key={index} style={styles.activityExerciseList}>
                      {exercise.sets?.length || 0}x {exercise.name}
                    </ThemedText>
                  ))}
                </View>
              ))
            )}
          </Animated.View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}