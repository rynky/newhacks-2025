import React, { useRef, useEffect } from 'react';
import { ScrollView, TextInput, Pressable, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStyles } from "@/constants/styles";
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChat } from '@/hooks/use-chat';

export default function ChatScreen() {
  const styles = useAppStyles();
  const colorScheme = useColorScheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const { messages, input, setInput, sendMessage, loading } = useChat();

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const placeholderColor = colorScheme === 'dark' ? '#666666' : '#999999';
  const borderColor = colorScheme === 'dark' ? '#666666' : '#CCCCCC';
  const sendButtonColor = '#007AFF';

  const quickActions = [
    "Show me a log of my recent workouts",
    "Give me a workout suggestion",
    "Analyze my progress this week"
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: styles.container.backgroundColor }}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ThemedView style={[styles.container, { paddingTop: 0, flex: 1 }]}>
          {/* Header */}
          <ThemedText style={[styles.title, { marginTop: 16, marginBottom: 8 }]}>
            AI Chatbot
          </ThemedText>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1, width: "100%" }}
            contentContainerStyle={{ paddingVertical: 10 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              {messages.map((msg, idx) => (
                <ThemedView
                  key={idx}
                  style={msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleBot}
                >
                  <ThemedText
                    style={msg.role === 'user' ? styles.messageBubbleUserText : styles.paragraph}
                  >
                    {msg.content}
                  </ThemedText>
                </ThemedView>
              ))}

              {/* Typing bubble */}
              {loading && (
                <ThemedView style={styles.messageBubbleBot}>
                  <ThemedText style={styles.paragraph}>...</ThemedText>
                </ThemedView>
              )}
            </Animated.View>
          </ScrollView>

          {/* Quick action buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 2, maxHeight: 42 }}
            contentContainerStyle={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 10,
            }}
          >
            {quickActions.map((label, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  setInput(label);
                  sendMessage();
                }}
                style={{
                  backgroundColor: loading
                    ? 'rgba(153, 153, 153, 0.3)'  // translucent gray if disabled
                    : 'rgba(0, 122, 255, 0.3)',   // translucent blue
                  paddingHorizontal: 12,
                  height: 42,
                  borderRadius: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  minWidth: 50,
                  paddingVertical: 0,
                }}
              >
                <ThemedText
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007AFF', // solid text color for readability
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                >
                  {label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          {/* Input Bar */}
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              gap: 10,
              paddingHorizontal: 0,
              paddingBottom: 10,
              backgroundColor: 'transparent',
            }}
          >
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  flex: 1,
                  backgroundColor: 'transparent',
                  borderWidth: 2.5,
                  borderColor: borderColor,
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  maxHeight: 120,
                },
              ]}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline
              onContentSizeChange={() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }}
            />

            <Pressable
              onPress={sendMessage}
              disabled={loading}
              style={{
                width: 42,
                height: 42,
                borderRadius: 20,
                backgroundColor: loading ? '#999999' : sendButtonColor,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconSymbol name="paperplane.fill" size={20} color="#FFFFFF" />
            </Pressable>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
