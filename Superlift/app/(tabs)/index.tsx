import React from 'react';
import { ScrollView, TextInput, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStyles } from "@/constants/styles";
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ChatScreen() {
  const styles = useAppStyles();
  const colorScheme = useColorScheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const placeholderColor = colorScheme === 'dark' ? '#666666' : '#999999';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.container.backgroundColor }} edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.container, { paddingTop: 0 }]}>
        {/* Header */}
        <ThemedText style={[styles.title, { marginTop: 16, marginBottom: 8 }]}>AI Chatbot</ThemedText>

      {/* Chat Messages */}
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Bot message */}
          <ThemedView style={styles.messageBubbleBot}>
            <ThemedText style={styles.paragraph}>
              Hello! How can I help you today?
            </ThemedText>
          </ThemedView>

          {/* User message */}
          <ThemedView style={styles.messageBubbleUser}>
            <ThemedText style={styles.messageBubbleUserText}>
              Hi! Tell me a joke.
            </ThemedText>
          </ThemedView>

          {/* Bot reply */}
          <ThemedView style={styles.messageBubbleBot}>
            <ThemedText style={styles.paragraph}>
              Why did the developer go broke? Because he used up all his cache!
            </ThemedText>
          </ThemedView>
        </Animated.View>
      </ScrollView>

      {/* Input Bar */}
      <ThemedView
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          gap: 10,
          paddingBottom: 10,
        }}
      >
        <TextInput
          placeholder="Type a message..."
          placeholderTextColor={placeholderColor}
          style={[styles.input, { flex: 1 }]}
        />
        <Pressable style={styles.sendButton}>
          <IconSymbol name="paperplane.fill" size={20} color="#FFFFFF" />
        </Pressable>
      </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}