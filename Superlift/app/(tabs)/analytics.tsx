import React from 'react';
import { ScrollView, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStyles } from '@/constants/styles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ExampleChart from '@/app/LineChartExample';

export default function AnalyticsScreen() {
  const styles = useAppStyles();
  const strengthScore = 254900;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.container.backgroundColor }} edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.container, { paddingTop: 0, gap: 0 }]}>
        {/* Header */}
        <ThemedText style={[styles.title, { marginTop: 12, marginBottom: 16 }]}>Your Progress</ThemedText>

        <ScrollView
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={{ paddingBottom: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Strength Score Card */}
          <View style={styles.statCard}>
            <ThemedText style={ styles.subtitle }>Your Strength Score</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12, flexWrap: 'wrap' }}>
              <ThemedText style={[styles.largeNumber, { flexShrink: 1 }]}>
                {strengthScore.toLocaleString()}
              </ThemedText>
              <ThemedText style={[styles.largeNumber, { fontSize: 36, marginLeft: 4 }]}>
                {' ↑'}
              </ThemedText>
            </View>
            <ThemedText style={[styles.paragraph, { opacity: 0.7, marginTop: 4 }]}>
              +20% month over month! Keep up the fantastic work.
            </ThemedText>
          </View>

          {/* Chart Card */}
          <View style={styles.card}>
            <ThemedText style={[styles.subtitle, { paddingBottom: 15 }]}>Strength Score - Monthly View</ThemedText>
            <View style={styles.chartPlaceholder}>
              <ExampleChart/>
            </View>
          </View>

          {/* Previous Workouts Section */}
          <View style={styles.card}>
            <ThemedText style={styles.subtitle}>Previous Workouts</ThemedText>
            <ThemedText style={[styles.paragraph, { opacity: 0.5, marginTop: 8 }]}>
              Check the Workout tab to view your history
            </ThemedText>
          </View>
        </Animated.View>
      </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}