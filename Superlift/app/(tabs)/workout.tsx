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

      // Close modal
      setModalVisible(false);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.container.backgroundColor }} edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.container, { paddingTop: 0 }]}>
        {/* Workout Modal */}
        <WorkoutModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveWorkout}
        />

        <ScrollView
          style={{ width: "100%", flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Hero Greeting */}
            <ThemedText style={styles.heroGreeting}>
              Ready to crush it, NewHacks Attendee?
            </ThemedText>

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