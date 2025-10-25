import { Image } from 'expo-image';
import { Platform, StyleSheet, ScrollView } from 'react-native';
import { TextInput } from "react-native";
import { useAppStyles } from "@/constants/styles";
import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function ChatScreen() {
  const styles = useAppStyles();

  return (
    <ThemedView style={styles.container}>
      
      {/* Header */}
      <ThemedText style={styles.title}>AI Chatbot</ThemedText>

      {/* Chat Messages */}
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
      >
        {/* Bot message */}
        <ThemedView
          style={[
            {
              alignSelf: "flex-start",
              backgroundColor: "#332940ff",
              padding: 10,
              borderRadius: 20,
              maxWidth: "75%",
            },
            { backgroundColor: styles.buttonStyle.backgroundColor }
          ]}
        >
          <ThemedText>Hello! How can I help you today?</ThemedText>
        </ThemedView>

        {/* User message */}
        <ThemedView
          style={{
            alignSelf: "flex-end",
            backgroundColor: "#4B7BEC",
            padding: 10,
            borderRadius: 20,
            maxWidth: "75%",
          }}
        >
          <ThemedText style={{ color: "#fff" }}>Hi! Tell me a joke.</ThemedText>
        </ThemedView>

        {/* Bot reply */}
        <ThemedView
          style={[
            {
              alignSelf: "flex-start",
              backgroundColor: "#332940ff",
              padding: 10,
              borderRadius: 20,
              maxWidth: "75%",
            },
            { backgroundColor: styles.buttonStyle.backgroundColor }
          ]}
        >
          <ThemedText>Why did the developer go broke? Because he used up all his cache!</ThemedText>
        </ThemedView>
      </ScrollView>

      {/* Input Bar */}
      <ThemedView
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          gap: 10,
          marginTop: 10,
        }}
      >
        <TextInput
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: 10,
            backgroundColor: "#f1f1f1",
            borderRadius: 20,
          }}
        />
        <IconSymbol
          name="paperplane.fill"
          size={24}
          color="#fff"
          style={{
            backgroundColor: "#4B7BEC",
            padding: 10,
            borderRadius: 20,
          }}
        />
      </ThemedView>
    </ThemedView>
  );
}