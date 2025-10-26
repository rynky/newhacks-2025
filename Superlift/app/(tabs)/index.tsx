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
  const { messages, input, setInput, sendMessage } = useChat();

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const placeholderColor = colorScheme === 'dark' ? '#666666' : '#999999';
  const borderColor = colorScheme === 'dark' ? '#666666' : '#CCCCCC';
  const sendButtonColor = '#007AFF'; // blue circle

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.container.backgroundColor }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // 'height' on Android avoids over-moving
      >
        <ThemedView style={[styles.container, { paddingTop: 0, flex: 1 }]}>
          {/* Header */}
          <ThemedText style={[styles.title, { marginTop: 16, marginBottom: 8 }]}>AI Chatbot</ThemedText>

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
            </Animated.View>
          </ScrollView>

          {/* Input Bar */}
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              gap: 10,
              paddingHorizontal: 10,
              paddingBottom: 10,
              backgroundColor: 'transparent', // fully transparent, no black box
            }}
          >
            {/* Text Input */}
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
                },
              ]}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />

            {/* Send Button */}
            <Pressable
              onPress={sendMessage}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: sendButtonColor,
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
