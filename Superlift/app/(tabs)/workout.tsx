import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Animated, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { initDB, getAllWorkouts, insertWorkout } from '@/database/database';
import { useAppStyles } from "@/constants/styles";
import WorkoutModal from '@/components/WorkoutModal';

export default function HomeScreen() {
  const styles = useAppStyles();
  const [modalVisible, setModalVisible] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [rotationAnimations, setRotationAnimations] = useState<{[key: string]: Animated.Value}>({});
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Initialize rotation animations for each workout
  useEffect(() => {
    const initialAnimations: {[key: string]: Animated.Value} = {};
    workouts.forEach(workout => {
      initialAnimations[workout.id] = new Animated.Value(expandedWorkoutId === workout.id ? 1 : 0);
    });
    setRotationAnimations(initialAnimations);
  }, [workouts]);

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

      // Close modal
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

<<<<<<< HEAD
  const toggleWorkoutExpansion = (workoutId: string) => {
    const isExpanding = expandedWorkoutId !== workoutId;
    const newExpandedId = isExpanding ? workoutId : null;
    
    // Animate the triangle
    if (rotationAnimations[workoutId]) {
      Animated.timing(rotationAnimations[workoutId], {
        toValue: isExpanding ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      // Create animation if it doesn't exist
      const newAnim = new Animated.Value(isExpanding ? 1 : 0);
      setRotationAnimations(prev => ({
        ...prev,
        [workoutId]: newAnim
      }));
    }
    
    setExpandedWorkoutId(newExpandedId);
  };

  // Rotation interpolation for smooth triangle animation
  const getRotationStyle = (workoutId: string) => {
    const rotateAnim = rotationAnimations[workoutId]?.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '90deg'] // ▶ to ▼
    });

    return {
      transform: [{ rotate: rotateAnim || '0deg' }]
    };
=======
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
>>>>>>> 6e7d7f17b4d5049d427d79b0076111d1c1f2063d
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.container.backgroundColor }} edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.container, { paddingTop: 0, backgroundColor: styles.container.backgroundColor }]}>
        {/* Workout Modal */}
        <WorkoutModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveWorkout}
        />

        <ScrollView
          style={{ width: "100%", flex: 1, backgroundColor: styles.container.backgroundColor }}
          contentContainerStyle={{ 
            paddingBottom: 20, 
            paddingTop: 16,
            backgroundColor: styles.container.backgroundColor 
          }}
          showsVerticalScrollIndicator={false}
        >
<<<<<<< HEAD
          <Animated.View style={{ 
            opacity: fadeAnim, 
            backgroundColor: styles.container.backgroundColor 
          }}>
            {/* Quick Start Section */}
            <ThemedText style={[styles.title, { marginBottom: 16 }]}>Quick Start</ThemedText>
=======
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Hero Greeting */}
            <ThemedText style={styles.heroGreeting}>
              Ready to crush it, NewHacks Attendee?
            </ThemedText>
>>>>>>> 6e7d7f17b4d5049d427d79b0076111d1c1f2063d

            {/* AI Workout Card */}
            <Pressable
              style={styles.aiWorkoutCard}
              onPress={() => setModalVisible(true)}
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
                  Full Body Strength - Phase 2
                </ThemedText>
                <ThemedText style={styles.aiWorkoutDetails}>
                  Est. 60 mins | 8 Exercises
                </ThemedText>
                <Pressable
                  style={styles.startWorkoutButton}
                  onPress={() => setModalVisible(true)}
                >
                  <ThemedText style={styles.startWorkoutButtonText}>
                    Start Workout
                  </ThemedText>
                </Pressable>
              </LinearGradient>
            </Pressable>

            {/* Recent Activity */}
            <ThemedText style={styles.recentActivityHeader}>
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

<<<<<<< HEAD
            {/* Past Workouts */}
            <ThemedText style={[styles.title, { marginBottom: 8 }]}>Past Workouts</ThemedText>

            {loadingWorkouts ? (
              <ThemedText style={styles.paragraph}>Loading workouts...</ThemedText>
            ) : (
              workouts.map((routine) => (
                <Pressable 
                  key={routine.id} 
                  onPress={() => toggleWorkoutExpansion(routine.id)}
                >
                  <ThemedView style={[
                    styles.routineCard, 
                    expandedWorkoutId === routine.id && { 
                      borderWidth: 1, 
                      borderColor: styles.primaryButton?.backgroundColor || '#4B7BEC' 
                    }
                  ]}>
                    {/* Workout Header */}
                    <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <ThemedView style={[{ flex: 1 }, styles.secondaryThemeContainer]}>
                        <ThemedText style={styles.subtitle}>{routine.name}</ThemedText>
                        <ThemedText style={[styles.paragraph, { opacity: 0.7, marginTop: 4 }]}>
                          {routine.duration} • {new Date(routine.date).toLocaleDateString()}
                        </ThemedText>
                      </ThemedView>
                      <Animated.Text 
                        style={[
                          styles.paragraph, 
                          { 
                            opacity: 0.7,
                            fontSize: 16,
                            marginLeft: 8
                          },
                          getRotationStyle(routine.id)
                        ]}
                      >
                        ▶
                      </Animated.Text>
                    </ThemedView>

                    {/* Exercise Summary (always visible) */}
                    <ThemedView style={[{ marginTop: 12, gap: 6 }]}>
                      {routine.exercises && routine.exercises.map((exercise: any, index: number) => (
                        <ThemedText key={index} style={[styles.paragraph, { opacity: 0.9 }]}>
                          {exercise.sets?.length || 0}x {exercise.name}
                        </ThemedText>
                      ))}
                    </ThemedView>

                    {/* Detailed Set Information (expanded view) */}
                    {expandedWorkoutId === routine.id && (
                      <ThemedView style={{ marginTop: 16, gap: 12 }}>
                        {routine.exercises && routine.exercises.map((exercise: any, exerciseIndex: number) => (
                          <ThemedView key={exerciseIndex} style={{ gap: 8 }}>
                            <ThemedText style={[styles.subtitle, { fontSize: 16 }]}>
                              {exercise.name}
                            </ThemedText>
                            
                            {/* Sets Table Header */}
                            <ThemedView style={{ 
                              flexDirection: 'row', 
                              paddingHorizontal: 8,
                              backgroundColor: styles.card.backgroundColor,
                              paddingVertical: 8,
                              borderRadius: 4
                            }}>
                              <ThemedText style={[styles.paragraph, { flex: 1, fontWeight: 'bold', opacity: 0.8 }]}>
                                Set
                              </ThemedText>
                              <ThemedText style={[styles.paragraph, { flex: 1, fontWeight: 'bold', opacity: 0.8 }]}>
                                Weight
                              </ThemedText>
                              <ThemedText style={[styles.paragraph, { flex: 1, fontWeight: 'bold', opacity: 0.8 }]}>
                                Reps
                              </ThemedText>
                            </ThemedView>
                            
                            {/* Sets Data */}
                            {exercise.sets && exercise.sets.map((set: any, setIndex: number) => (
                              <ThemedView 
                                key={setIndex} 
                                style={{ 
                                  flexDirection: 'row', 
                                  paddingHorizontal: 8,
                                  paddingVertical: 6,
                                  backgroundColor: setIndex % 2 === 0 
                                    ? (styles.card.backgroundColor + '80') // Add transparency
                                    : styles.container.backgroundColor,
                                  borderRadius: 4
                                }}
                              >
                                <ThemedText style={[styles.paragraph, { flex: 1, opacity: 0.9 }]}>
                                  {set.setOrder}
                                </ThemedText>
                                <ThemedText style={[styles.paragraph, { flex: 1, opacity: 0.9 }]}>
                                  {set.weight} lbs
                                </ThemedText>
                                <ThemedText style={[styles.paragraph, { flex: 1, opacity: 0.9 }]}>
                                  {set.reps}
                                </ThemedText>
                              </ThemedView>
                            ))}
                            
                            {/* Exercise Summary */}
                            {exercise.sets && exercise.sets.length > 0 && (
                              <ThemedView style={{ 
                                flexDirection: 'row', 
                                justifyContent: 'space-between',
                                marginTop: 8,
                                paddingTop: 8,
                                borderTopWidth: 1,
                                borderTopColor: styles.text?.color + '30' // Add transparency
                              }}>
                                <ThemedText style={[styles.paragraph, { opacity: 0.7 }]}>
                                  Volume: {exercise.sets.reduce((sum: number, set: any) => sum + (set.weight * set.reps), 0)} lbs
                                </ThemedText>
                                <ThemedText style={[styles.paragraph, { opacity: 0.7 }]}>
                                  Best: {Math.max(...exercise.sets.map((set: any) => set.weight))} lbs
                                </ThemedText>
                              </ThemedView>
                            )}
                          </ThemedView>
                        ))}
                      </ThemedView>
                    )}
                  </ThemedView>
                </Pressable>
=======
                  <ThemedText style={styles.activityTimestamp}>
                    {getRelativeDate(workout.date)}
                  </ThemedText>

                  {workout.exercises && workout.exercises.map((exercise: any, index: number) => (
                    <ThemedText key={index} style={styles.activityExerciseList}>
                      {exercise.sets?.length || 0}x {exercise.name}
                    </ThemedText>
                  ))}
                </View>
>>>>>>> 6e7d7f17b4d5049d427d79b0076111d1c1f2063d
              ))
            )}
          </Animated.View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}