import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Animated, Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { initDB, getAllWorkouts } from '@/database/database';
import { useAppStyles } from "@/constants/styles";
import axios from 'axios';

export default function HomeScreen() {
  const styles = useAppStyles();
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.container.backgroundColor }} edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.container, { paddingTop: 0 }]}>
        {/* Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContainer}
            onPress={() => setModalVisible(false)}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <ThemedText style={[styles.title, { marginBottom: 16 }]}>Hello World</ThemedText>
              <ThemedText style={[styles.paragraph, { marginBottom: 24 }]}>
                Your workout tracking will start here!
              </ThemedText>
              <Pressable
                style={styles.primaryButton}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.primaryButtonText}>Close</ThemedText>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        <ScrollView
          style={{ width: "100%", flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Quick Start Section */}
            <ThemedText style={[styles.title, { marginBottom: 16 }]}>Quick Start</ThemedText>

            {/* Primary Action Button */}
            <Pressable
              style={[styles.primaryButton, { marginBottom: 32 }]}
              onPress={() => setModalVisible(true)}
            >
              <ThemedText style={styles.primaryButtonText}>+ Start Empty Workout</ThemedText>
            </Pressable>

            {/* Routines Section */}
            <ThemedText style={[styles.title, { marginBottom: 16 }]}>Routines</ThemedText>
            {message ? <ThemedText style={[styles.paragraph, { marginBottom: 12 }]}>{message}</ThemedText> : null}

            <ThemedView style={[styles.rowContainer, { marginBottom: 24 }]}>
              <Pressable style={[styles.subtleButton, styles.flexButton]}>
                <ThemedText style={styles.subtitle}>Create Routine</ThemedText>
              </Pressable>
              <Pressable style={[styles.subtleButton, styles.flexButton]}>
                <ThemedText style={styles.subtitle}>Select Routine</ThemedText>
              </Pressable>
            </ThemedView>

          {/* Past Workouts */}
          <ThemedText style={[styles.title, { marginBottom: 8 }]}>Past Workouts</ThemedText>

          {loadingWorkouts ? (
            <ThemedText style={styles.paragraph}>Loading workouts...</ThemedText>
          ) : (
            workouts.map((routine) => (
              <ThemedView key={routine.id} style={styles.routineCard}>
                <ThemedText style={styles.subtitle}>{routine.name}</ThemedText>
                <ThemedText style={[styles.paragraph, { opacity: 0.7, marginTop: 4 }]}>
                  {routine.duration} • {new Date(routine.date).toLocaleDateString()}
                </ThemedText>

                <ThemedView style={{ marginTop: 12, gap: 6 }}>
                  {routine.exercises && routine.exercises.map((exercise: any, index: number) => (
                    <ThemedText key={index} style={[styles.paragraph, { opacity: 0.9 }]}>
                      {exercise.sets?.length || 0}x {exercise.name}
                    </ThemedText>
                  ))}
                </ThemedView>
              </ThemedView>
            ))
          )}
        </Animated.View>
      </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}