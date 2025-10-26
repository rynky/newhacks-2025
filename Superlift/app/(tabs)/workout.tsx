import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { pastWorkouts } from "@/constants/mockWorkouts";
import { useAppStyles } from "@/constants/styles";
import axios from 'axios';

export default function HomeScreen() {
  const styles = useAppStyles();
  const [message, setMessage] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    axios.get('http://192.168.1.xxx:3000')
      .then(res => setMessage(res.data))
      .catch(err => console.log(err));

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.container.backgroundColor }} edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.container, { paddingTop: 0 }]}>
        <ScrollView
          style={{ width: "100%", flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Quick Start Section */}
            <ThemedText style={styles.title}>Quick Start</ThemedText>
          <ThemedView style={[styles.rowContainer, { marginBottom: 20 }]}>
            <Pressable style={[styles.buttonStyle, styles.flexButton, { padding: 16 }]}>
              <ThemedText style={styles.subtitle}>+ Start Empty Workout</ThemedText>
            </Pressable>
          </ThemedView>

          {/* Routines Section */}
          <ThemedText style={styles.title}>Routines</ThemedText>
          {message ? <ThemedText style={styles.paragraph}>{message}</ThemedText> : null}

          <ThemedView style={[styles.rowContainer, { marginBottom: 20 }]}>
            <Pressable style={[styles.buttonStyle, styles.flexButton, { padding: 16 }]}>
              <ThemedText style={styles.subtitle}>New Routine</ThemedText>
            </Pressable>
            <Pressable style={[styles.buttonStyle, styles.flexButton, { padding: 16 }]}>
              <ThemedText style={styles.subtitle}>Explore</ThemedText>
            </Pressable>
          </ThemedView>

          {/* My Routines */}
          <ThemedText style={[styles.title, { marginBottom: 8 }]}>My Routines</ThemedText>

          {pastWorkouts.map((routine) => (
            <ThemedView key={routine.id} style={styles.routineCard}>
              <ThemedText style={styles.subtitle}>{routine.name}</ThemedText>
              <ThemedText style={[styles.paragraph, { opacity: 0.7, marginTop: 4 }]}>
                Duration: {routine.duration}
              </ThemedText>
              <ThemedText style={[styles.paragraph, { opacity: 0.7 }]}>
                Date: {routine.date}
              </ThemedText>

              {routine.exercises.map((exercise, index) => (
                <ThemedView key={index} style={styles.exerciseCard}>
                  <ThemedText style={[styles.paragraph, { fontWeight: 'bold' }]}>
                    {exercise.name}
                  </ThemedText>
                  {exercise.sets.map((set, setIndex) => (
                    <ThemedText key={setIndex} style={[styles.paragraph, { marginLeft: 10, opacity: 0.8 }]}>
                      Set {set.setOrder}: {set.weight} lbs × {set.reps} reps
                    </ThemedText>
                  ))}
                </ThemedView>
              ))}
            </ThemedView>
          ))}
        </Animated.View>
      </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}