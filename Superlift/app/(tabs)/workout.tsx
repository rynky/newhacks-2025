
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { mockRoutines } from "@/constants/mockRoutines";
import { useAppStyles } from "@/constants/styles";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';

export default function WorkoutScreen() {
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

      {mockRoutines.map((routine) => (
        <ThemedView key={routine.id} style={[styles.routineCard, { width: "100%" }]}>
          <ThemedText style={styles.subtitle}>{routine.name}</ThemedText>
          <ThemedText style={styles.paragraph}>{routine.duration}</ThemedText>
          <ThemedText style={styles.paragraph}>
            {routine.exercises.join(", ")}
          </ThemedText>
        </ThemedView>
      ))}

    </ThemedView>
  );
}