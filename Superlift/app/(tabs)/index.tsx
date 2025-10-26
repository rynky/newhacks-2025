import React, { useRef, useEffect } from 'react';
import { ScrollView, TextInput, Pressable, Animated, KeyboardAvoidingView, Platform, View, Image } from 'react-native';
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

  const isDarkMode = colorScheme === 'dark';

  // Colors
  const primaryBlue = '#1E40AF';
  const accentCyan = '#06B6D4';
  const coachCardBg = isDarkMode ? '#FFFFFF' : '#FFFFFF';
  const coachTextColor = '#1F2937';

  const quickActions = [
    "Show my recent workouts",
    "Recommend a workout",
    "Give me a strength tip"
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  // Add welcome message if no messages
  const displayMessages = messages.length === 0 ? [
    {
      role: 'assistant',
      content: "👋 I'm Coach, your AI strength trainer. Ask me about progressive overload, workout recommendations, or breaking through plateaus."
    }
  ] : messages;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: styles.container.backgroundColor }}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ThemedView style={[styles.container, { paddingTop: 16, flex: 1 }]}>
          {/* Header */}
          <View
            style={{
              paddingTop: 4,
              paddingBottom: 12,
              paddingHorizontal: 0,
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              marginBottom: 12,
              alignItems: 'center',
            }}
          >
            <ThemedText
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: isDarkMode ? '#FFFFFF' : '#121212',
                textAlign: 'center',
                lineHeight: 34,
              }}
            >
              Coach - AI Trainer
            </ThemedText>
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1, width: "100%" }}
            contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 4 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              {displayMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';

                return (
                  <Animated.View
                    key={idx}
                    style={{
                      width: isUser ? '80%' : '85%',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      marginBottom: 16,
                      opacity: fadeAnim,
                      transform: [{
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      }]
                    }}
                  >
                    {isUser ? (
                      // User message (blue bubble)
                      <View
                        style={{
                          backgroundColor: primaryBlue,
                          borderRadius: 12,
                          padding: 14,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <ThemedText
                          style={{
                            fontSize: 15,
                            lineHeight: 22,
                            color: '#FFFFFF',
                            fontWeight: '500',
                          }}
                        >
                          {msg.content}
                        </ThemedText>
                      </View>
                    ) : (
                      // Coach message (white card with cyan border)
                      <View
                        style={{
                          backgroundColor: coachCardBg,
                          borderRadius: 12,
                          borderLeftWidth: 3,
                          borderLeftColor: accentCyan,
                          padding: 14,
                          paddingLeft: 16,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.12,
                          shadowRadius: 6,
                          elevation: 3,
                        }}
                      >
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <Image
                            source={require('@/assets/images/coach.jpg')}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              marginTop: 2,
                            }}
                          />
                          <View style={{ flex: 1 }}>
                            <ThemedText
                              style={{
                                fontSize: 15,
                                lineHeight: 22,
                                color: coachTextColor,
                                fontWeight: '500',
                              }}
                            >
                              {msg.content}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                    )}
                  </Animated.View>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <Animated.View
                  style={{
                    width: '85%',
                    alignSelf: 'flex-start',
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: coachCardBg,
                      borderRadius: 12,
                      borderLeftWidth: 3,
                      borderLeftColor: accentCyan,
                      padding: 14,
                      paddingLeft: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12,
                      shadowRadius: 6,
                      elevation: 3,
                    }}
                  >
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Image
                        source={require('@/assets/images/coach.jpg')}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          marginTop: 2,
                        }}
                      />
                      <View style={{ flex: 1, paddingTop: 8 }}>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          {[0, 1, 2].map((dot) => (
                            <Animated.View
                              key={dot}
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#9CA3AF',
                                opacity: fadeAnim,
                              }}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          </ScrollView>

          {/* Quick Action Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 4, maxHeight: 42 }}
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
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
                style={{
                  backgroundColor: loading
                    ? 'rgba(153, 153, 153, 0.3)'
                    : 'rgba(0, 122, 255, 0.3)',
                  paddingHorizontal: 12,
                  height: 42,
                  borderRadius: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  minWidth: 50,
                  paddingVertical: 0,
                  overflow: 'hidden',
                }}
              >
                <ThemedText
                  style={{
                    color: '#007AFF',
                    fontSize: 14,
                    textAlign: 'center',
                    backgroundColor: 'transparent',
                  }}
                >
                  {label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          {/* Input Bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              gap: 10,
              paddingHorizontal: 0,
              paddingTop: 8,
              paddingBottom: 10,
              backgroundColor: styles.container.backgroundColor,
              borderTopWidth: 1,
              borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }}
          >
            <TextInput
              placeholder="Ask Coach anything..."
              placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
              style={{
                flex: 1,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                borderWidth: 1.5,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                borderRadius: 24,
                paddingHorizontal: 18,
                paddingVertical: 12,
                fontSize: 15,
                color: isDarkMode ? '#FFFFFF' : '#121212',
                maxHeight: 120,
              }}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline={true}
              onContentSizeChange={() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }}
            />

            <Pressable
              onPress={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: (loading || !input.trim()) ? '#9CA3AF' : primaryBlue,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <IconSymbol name="arrow.up" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
