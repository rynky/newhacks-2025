import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { LineChart } from "react-native-chart-kit";
import { useAppStyles } from "@/constants/styles";
import { getAllWorkouts } from "@/database/database";

// Helper: Calculate 1RM using Bryzcki formula: weight / (1.0278 - 0.0278 * reps)
const calculate1RM = (weight: number, reps: number) => {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight / (1.0278 - 0.0278 * reps);
};

// Get the best 1RM for each main lift in a workout
const getBest1RMForLift = (workout: any, liftName: string) => {
  const liftExercises = workout.exercises.filter((exercise: any) => 
    exercise.name.toLowerCase().includes(liftName.toLowerCase())
  );

  let best1RM = 0;
  
  liftExercises.forEach((exercise: any) => {
    exercise.sets.forEach((set: any) => {
      const oneRepMax = calculate1RM(set.weight, set.reps);
      if (oneRepMax > best1RM) {
        best1RM = oneRepMax;
      }
    });
  });
  
  return best1RM;
};

export default function InfoChart() {
  const styles = useAppStyles();
  const [labels, setLabels] = useState<string[]>([]);
  const [dataPoints, setDataPoints] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const workouts = await getAllWorkouts();
      if (workouts.length === 0) return;

      // Sort workouts by date ascending
      const sortedWorkouts = workouts.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Generate labels using actual dates (Month/Day)
      const newLabels = sortedWorkouts.map(workout => {
        const date = new Date(workout.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });

      // Calculate strength score = sum of best 1RM for Squat, Bench, Deadlift
      const newDataPoints = sortedWorkouts.map((workout) => {
        const squat1RM = getBest1RMForLift(workout, "Squat (Barbell)");
        const bench1RM = getBest1RMForLift(workout, "Bench Press (Barbell)");
        const deadlift1RM = getBest1RMForLift(workout, "Deadlift (Barbell)");
        
        // Sum the best 1RM from each main lift
        const totalStrengthScore = squat1RM + bench1RM + deadlift1RM;
        return Math.round(totalStrengthScore);
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
        paddingLeft: 16, // Fixed padding to prevent title clipping
        backgroundColor: styles.container.backgroundColor,
      }}
    >
      <ThemedText style={[styles.title, { marginBottom: 16 }]}>
        Strength Score Over Time
      </ThemedText>
      <LineChart
        data={{
          labels: labels.length ? labels : ["2/21", "2/22", "2/23", "3/2", "4/18"],
          datasets: [
            {
              data: dataPoints.length ? dataPoints : [315, 405, 450, 495, 540],
            },
          ],
        }}
        width={Dimensions.get("window").width - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: styles.card.backgroundColor,
          backgroundGradientFrom: styles.card.backgroundColor,
          backgroundGradientTo: styles.card.backgroundColor,
          fillShadowGradientFrom: styles.card.backgroundColor,
          fillShadowGradientTo: styles.card.backgroundColor,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(75, 123, 236, ${opacity})`,
          labelColor: () => '#FFFFFF', // White X and Y axis labels
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#4B7BEC",
          },
          propsForLabels: {
            fill: '#FFFFFF', // White text for labels
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
          backgroundColor: styles.card.backgroundColor,
        }}
      />
    </ThemedView>
  );
}