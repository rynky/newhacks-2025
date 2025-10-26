import React from "react";
import { Dimensions } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { LineChart } from "react-native-chart-kit";
import { useAppStyles } from "@/constants/styles";

export default function InfoChart() {
  const styles = useAppStyles(); // get theme colors

  return (
    <ThemedView style={[{ backgroundColor: styles.container.backgroundColor }, { marginTop: 25 }]}>
      <ThemedText style={[styles.title, { padding: 5 }]}>Strength Score — Monthly Chart</ThemedText>
      <LineChart
        data={{
          // x-axis shows time; replace with your real timestamps if available
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              data: [
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
              ],
            },
          ],
        }}
        width={Dimensions.get("window").width - 32}
        height={220}
        // remove currency prefixes; this chart shows Strength Score values
        yAxisLabel={""}
        yAxisSuffix={""}
        yAxisInterval={1}
        chartConfig={{
          // use the card background (where the chart is placed) so the chart
          // matches the surrounding UI on both web and native. If card color
          // isn't present, fall back to transparent to avoid a black fill.
          backgroundColor: styles.card?.backgroundColor ?? 'transparent',
          backgroundGradientFrom: styles.card?.backgroundColor ?? 'transparent',
          backgroundGradientTo: styles.card?.backgroundColor ?? 'transparent',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(75, 123, 236, ${opacity})`, // line color
          labelColor: (opacity = 1) =>
            `${styles.title.color}`, // axis labels use theme.text
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#4B7BEC",
          },
        }}
        bezier
        style={{
          marginTop: 0,
          borderRadius: 16,
          marginBottom: 25,
        }}
      />
      {/* Axis titles (chart-kit doesn't provide built-in axis title props) */}
      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <ThemedText style={[styles.paragraph, { opacity: 0.7 }]}>X: Time</ThemedText>
        <ThemedText style={[styles.paragraph, { opacity: 0.7 }]}>Y: Strength Score</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}
