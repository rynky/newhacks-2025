import { useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const GEMINI_API_KEY = "AIzaSyBni3ytRBPycX36XrqUuZHj8_OLy-PPtNY"; 

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    try {
      // Combine identity + conversation + latest user message
      const identityPrompt = process.env.GEMINI_PROMPT || "You are a helpful assistant.";
      const chatAsString = [
        identityPrompt,
        ...messages.map(m => m.content), // previous messages only
        newMessage.content,              // latest user input
      ].join('\n');

      // Call Gemini REST API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: chatAsString }] }],
          }),
        }
      );

      const data = await response.json();

      // Extract AI-generated message
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "Sorry, I didn’t get that.";

      // Append Gemini response to chat
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: aiText },
      ]);
    } catch (err) {
      console.error("Gemini API error:", err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "⚠️ Failed to connect to Gemini." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, input, setInput, sendMessage, loading };
}
