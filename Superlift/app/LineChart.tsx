import React, { useEffect, useState, useCallback } from "react";
import { Dimensions, View, RefreshControl, ScrollView } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { LineChart } from "react-native-chart-kit";
import { useAppStyles } from "@/constants/styles";
import { getAllWorkouts } from "@/database/database";

type WorkoutRecord = {
  id?: string | number;
  date: string;
  exercises?: Array<{
    name: string;
    sets?: Array<{ weight: number; reps: number }>;
  }>;
};

// Helper: Calculate 1RM using Bryzcki formula: weight / (1.0278 - 0.0278 * reps)
const calculate1RM = (weight: number, reps: number) => {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight / (1.0278 - 0.0278 * reps);
};

// Get the best 1RM for each main lift in a workout
const getBest1RMForLift = (workout: any, liftName: string) => {
  const exercises: any[] = workout?.exercises || [];
  const liftExercises = exercises.filter((exercise: any) =>
    exercise?.name?.toLowerCase?.().includes(liftName.toLowerCase())
  );

  let best1RM = 0;
  
  liftExercises.forEach((exercise: any) => {
    (exercise.sets || []).forEach((set: any) => {
      const oneRepMax = calculate1RM(set.weight, set.reps);
      if (oneRepMax > best1RM) {
        best1RM = oneRepMax;
      }
    });
  });
  
  return best1RM;
};

// Calculate strength score for a single workout
const calculateWorkoutStrengthScore = (workout: WorkoutRecord): number => {
  const squat1RM = getBest1RMForLift(workout, "Squat (Barbell)");
  const bench1RM = getBest1RMForLift(workout, "Bench Press (Barbell)");
  const deadlift1RM = getBest1RMForLift(workout, "Deadlift (Barbell)");

  return Math.round((squat1RM + bench1RM + deadlift1RM) * 25);
};

// Export function to get the highest ever strength score
export const getLatestStrengthScore = async (): Promise<number> => {
  const workouts = (await getAllWorkouts()) as WorkoutRecord[];
  if (workouts.length === 0) return 0;

  // Find the highest 1RM ever achieved for each lift across all workouts
  let maxSquat = 0;
  let maxBench = 0;
  let maxDeadlift = 0;

  workouts.forEach((workout: WorkoutRecord) => {
    const currentSquat = getBest1RMForLift(workout, "Squat (Barbell)");
    const currentBench = getBest1RMForLift(workout, "Bench Press (Barbell)");
    const currentDeadlift = getBest1RMForLift(workout, "Deadlift (Barbell)");

    if (currentSquat > maxSquat) maxSquat = currentSquat;
    if (currentBench > maxBench) maxBench = currentBench;
    if (currentDeadlift > maxDeadlift) maxDeadlift = currentDeadlift;
  });

  // Return the sum of highest ever 1RMs, multiplied by 25
  return Math.round((maxSquat + maxBench + maxDeadlift) * 25);
};

export default function InfoChart() {
  const styles = useAppStyles();
  const [labels, setLabels] = useState<string[]>([]);
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Get theme-aware colors
  const isDarkMode = styles.container.backgroundColor === '#1F1B24';

  const fetchChartData = useCallback(async () => {
    const workouts = (await getAllWorkouts()) as WorkoutRecord[];
    if (workouts.length === 0) {
      setLabels([]);
      setDataPoints([]);
      return;
    }

    // Sort workouts by date ascending
    const sortedWorkouts = [...workouts].sort(
      (a: WorkoutRecord, b: WorkoutRecord) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Generate labels using actual dates (Month/Day)
    const newLabels = sortedWorkouts.map((workout: WorkoutRecord) => {
      const date = new Date(workout.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    // Calculate strength score for EACH INDIVIDUAL WORKOUT
    const newDataPoints = sortedWorkouts.map((workout: WorkoutRecord) => 
      calculateWorkoutStrengthScore(workout)
    );

    setLabels(newLabels);
    setDataPoints(newDataPoints);
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChartData();
    setRefreshing(false);
  }, [fetchChartData]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView
        style={{
          padding: 16,
          backgroundColor: styles.card.backgroundColor,
        }}
      >
        {/* Chart Title */}
        <ThemedText
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#121212',
            marginBottom: 20,
            letterSpacing: 0.3,
          }}
        >
          Strength Score Over Time
        </ThemedText>

        <View style={{ alignItems: 'center', width: '100%' }}>
          <LineChart
            data={{
              labels: labels.length ? labels : ["2/21", "2/22", "2/23", "3/2", "4/18"],
              datasets: [
                {
                  data: dataPoints.length ? dataPoints : [315, 405, 450, 495, 540].map(v => v * 25),
                  strokeWidth: 6, // Even thicker line for better visibility
                  color: (opacity = 1) => `rgba(62, 220, 129, 1)`, // Force full opacity
                },
              ],
            }}
            width={Dimensions.get("window").width - 64}
            height={260}
            yAxisLabel=""
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: styles.card.backgroundColor,
              backgroundGradientFrom: styles.card.backgroundColor,
              backgroundGradientTo: styles.card.backgroundColor,
              fillShadowGradientFrom: 'rgba(62, 220, 129, 0.25)', // More prominent gradient fill
              fillShadowGradientTo: 'rgba(62, 220, 129, 0.08)',
              fillShadowGradientFromOpacity: 0.25, // Increased opacity
              fillShadowGradientToOpacity: 0.08,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(62, 220, 129, 1)`, // Full opacity for vibrant line
              labelColor: () => isDarkMode ? '#E5E7EB' : '#374151', // Dark gray for light theme, light gray for dark theme
              propsForBackgroundLines: {
                strokeWidth: 1,
                stroke: isDarkMode ? 'rgba(156, 163, 175, 0.2)' : 'rgba(107, 114, 128, 0.25)', // Theme-aware grid lines
                strokeDasharray: '0', // Solid lines instead of dashed
              },
              style: {
                borderRadius: 0,
              },
              propsForDots: {
                r: "0", // Hide dots for continuous line
                strokeWidth: "0",
              },
              propsForLabels: {
                fill: isDarkMode ? '#E5E7EB' : '#374151', // Dark gray for light theme, light gray for dark theme
                fontSize: 11,
              },
            }}
            withDots={false} // Remove dots for continuous line
            withInnerLines={true}
            withOuterLines={false} // Remove outer border for cleaner look
            withVerticalLines={false} // Remove vertical grid lines for cleaner look
            withHorizontalLines={true}
            bezier
            style={{
              marginVertical: 0,
              borderRadius: 0,
              backgroundColor: styles.card.backgroundColor,
            }}
          />
        </View>
        
        {/* Refresh Hint */}
        <ThemedText
          style={{
            fontSize: 12,
            textAlign: 'center',
            marginTop: 12,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            fontStyle: 'italic',
          }}
        >
          Pull down to refresh chart data
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}