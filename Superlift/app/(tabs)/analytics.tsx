import React from 'react';
import { Animated, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStyles } from '@/constants/styles';
import InfoChart, { getLatestStrengthScore } from '@/app/LineChart';

export default function AnalyticsScreen() {
  const styles = useAppStyles();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [strengthScore, setStrengthScore] = React.useState<number | null>(null);
  const [isLoadingScore, setIsLoadingScore] = React.useState(true);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const latestScore = await getLatestStrengthScore();
        if (mounted) {
          setStrengthScore(latestScore);
        }
      } finally {
        if (mounted) {
          setIsLoadingScore(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const scoreDisplay = isLoadingScore
    ? 'Loading...'
    : strengthScore != null
      ? strengthScore.toLocaleString()
      : '0';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: styles.container.backgroundColor }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <ThemedView
        style={[
          styles.container,
          {
            flex: 1,
            paddingTop: 0,
            gap: 0,
            backgroundColor: styles.container.backgroundColor,
          },
        ]}
      >
        <ThemedText style={[styles.title, { marginTop: 12, marginBottom: 16 }]}>
          Your Progress
        </ThemedText>

        <ScrollView
          style={{ flex: 1, width: '100%', backgroundColor: styles.container.backgroundColor }}
          contentContainerStyle={{ paddingBottom: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{ opacity: fadeAnim, backgroundColor: styles.container.backgroundColor }}
          >
            {/* Strength Score Card */}
            <View style={[styles.statCard, { backgroundColor: styles.card.backgroundColor }]}>
              <ThemedText style={styles.subtitle}>Your Strength Score</ThemedText>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 12,
                  flexWrap: 'wrap',
                }}
              >
                <ThemedText style={[styles.largeNumber, { flexShrink: 1 }]}>
                  {scoreDisplay}
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
            <View style={[styles.card, { backgroundColor: styles.card.backgroundColor, borderRadius: 16, overflow: 'hidden' }]}>
              <InfoChart />
            </View>
          </Animated.View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
