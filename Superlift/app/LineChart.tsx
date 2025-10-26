import React, { useEffect, useState } from "react";
import { Dimensions, View, Text } from "react-native";
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

  useEffect(() => {
    const fetchData = async () => {
      const workouts = (await getAllWorkouts()) as WorkoutRecord[];
      if (workouts.length === 0) return;

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

      // Calculate strength score at each point = sum of HIGHEST 1RM up to that workout
      const newDataPoints: number[] = [];
      let maxSquat = 0;
      let maxBench = 0;
      let maxDeadlift = 0;

      sortedWorkouts.forEach((workout: WorkoutRecord) => {
        const currentSquat = getBest1RMForLift(workout, "Squat (Barbell)");
        const currentBench = getBest1RMForLift(workout, "Bench Press (Barbell)");
        const currentDeadlift = getBest1RMForLift(workout, "Deadlift (Barbell)");

        // Update max values if current workout has better 1RMs
        if (currentSquat > maxSquat) maxSquat = currentSquat;
        if (currentBench > maxBench) maxBench = currentBench;
        if (currentDeadlift > maxDeadlift) maxDeadlift = currentDeadlift;

        // Strength score is the sum of highest 1RMs achieved so far, multiplied by 25
        newDataPoints.push(Math.round((maxSquat + maxBench + maxDeadlift) * 25));
      });

      setLabels(newLabels);
      setDataPoints(newDataPoints);
    };

    fetchData();
  }, []);

  return (
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
          color: '#FFFFFF',
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
                strokeWidth: 5, // Thicker, more vibrant line
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
            fillShadowGradientFrom: 'rgba(62, 220, 129, 0.1)', // Subtle gradient fill matching success color
            fillShadowGradientTo: 'rgba(62, 220, 129, 0.05)',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(62, 220, 129, ${opacity})`, // Match strength score green (#3EDC81)
            labelColor: () => '#D1D5DB', // Lighter gray for labels
            propsForBackgroundLines: {
              strokeWidth: 1,
              stroke: 'rgba(156, 163, 175, 0.15)', // Very muted grid lines
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
              fill: '#D1D5DB', // Lighter gray for labels
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
    </ThemedView>
  );
}