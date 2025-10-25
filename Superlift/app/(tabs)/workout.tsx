import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { initDB, getAllWorkouts } from '@/database/database';
import { useAppStyles } from "@/constants/styles";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';

export default function HomeScreen() {
  const styles = useAppStyles();
  const [message, setMessage] = useState('');
  // Types for workouts data coming from the DB
  interface SetItem { id?: number; setOrder: number; weight: number; reps: number }
  interface ExerciseItem { id?: number; name: string; sets?: SetItem[] }
  interface WorkoutItem { id: string; name: string; duration?: string; date?: string; exercises?: ExerciseItem[] }

  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);

  useEffect(() => {
    axios.get('http://192.168.1.xxx:3000')
      .then(res => setMessage(res.data))
      .catch(err => console.log(err));
  }, []);

  // Initialize DB and load workouts (initDB auto-seeds mock data once)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initDB();
        const rows = await getAllWorkouts();
        if (mounted) setWorkouts(rows || []);
      } catch (e) {
        console.log('DB init/load error', e);
      } finally {
        if (mounted) setLoadingWorkouts(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <ThemedView style={[styles.container, { justifyContent: "flex-start", paddingTop: 20 }]}>
      <ThemedText style={styles.title}>Quick Start</ThemedText>

      <ThemedView style={[styles.rowContainer]}>
        <Pressable style={[styles.buttonStyle, styles.flexButton]}>
          <ThemedText style={styles.subtitle}>+ Start Empty Workout</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedText style={styles.title}>Routines</ThemedText>
      <ThemedText style={styles.subtitle}>{message}</ThemedText>

      <ThemedView style={[styles.rowContainer]}>
        <Pressable style={[styles.buttonStyle, styles.flexButton]}>
          <ThemedText style={styles.subtitle}>New Routine</ThemedText>
        </Pressable>
        <Pressable style={[styles.buttonStyle, styles.flexButton]}>
          <ThemedText style={styles.subtitle}>Explore</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedText style={styles.subtitle}>My Routines</ThemedText>

      <ScrollView 
        style={{ width: "100%", flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 7,  alignItems: "center" }}
        showsVerticalScrollIndicator={true}
      >
        {loadingWorkouts ? (
          <ThemedText style={styles.paragraph}>Loading workouts...</ThemedText>
        ) : (
          workouts.map((routine: WorkoutItem) => (
            <ThemedView key={routine.id} style={[styles.routineCard, { width: "100%", marginBottom: 10 }]}> 
              <ThemedText style={styles.subtitle}>{routine.name}</ThemedText>
              <ThemedText style={styles.paragraph}>Duration: {routine.duration}</ThemedText>
              <ThemedText style={styles.paragraph}>Date: {routine.date}</ThemedText>
              {Array.isArray(routine.exercises) && routine.exercises.map((exercise: ExerciseItem, index: number) => (
                <ThemedView key={exercise.id ?? index} style={[{ marginTop: 8 }, styles.exerciseCard]}>
                  <ThemedText style={[styles.paragraph, { fontWeight: 'bold' }]}>
                    {exercise.name}
                  </ThemedText>
                  {Array.isArray(exercise.sets) && exercise.sets.map((set: SetItem, setIndex: number) => (
                    <ThemedText key={set.id ?? setIndex} style={[styles.paragraph, { marginLeft: 10 }]}>
                      Set {set.setOrder}: {set.weight} lbs × {set.reps} reps
                    </ThemedText>
                  ))}
                </ThemedView>
              ))}
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}