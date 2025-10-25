
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { pastWorkouts } from "@/constants/mockWorkouts";
import { useAppStyles } from "@/constants/styles";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';

export default function HomeScreen() {
  const styles = useAppStyles();

  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://192.168.1.xxx:3000')
      .then(res => setMessage(res.data))
      .catch(err => console.log(err));
  }, []);

    
  return (
    <ThemedView style={[styles.container, { justifyContent : "flex-start" }, { paddingTop : 20 }]}>
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

      <ThemedView style={[{ width: "100%" }, styles.routineCard]}>
        {pastWorkouts.map((routine) => (
          <ThemedView key={routine.id} style={[styles.routineCard, { width: "100%", marginBottom: 10 }]}>
            <ThemedText style={styles.subtitle}>{routine.name}</ThemedText>
            <ThemedText style={styles.paragraph}>Duration: {routine.duration}</ThemedText>
            <ThemedText style={styles.paragraph}>Date: {routine.date}</ThemedText>
            
            {routine.exercises.map((exercise, index) => (
              <ThemedView key={index} style={[{ marginTop: 8 }, styles.exerciseCard]}>
                <ThemedText style={[styles.paragraph, { fontWeight: 'bold' }]}>
                  {exercise.name}
                </ThemedText>
                {exercise.sets.map((set, setIndex) => (
                  <ThemedText key={setIndex} style={[styles.paragraph, { marginLeft: 10 }]}>
                    Set {set.setOrder}: {set.weight} lbs × {set.reps} reps
                  </ThemedText>
                ))}
              </ThemedView>
            ))}
          </ThemedView>
        ))}
      </ThemedView>

    </ThemedView>
  );
}