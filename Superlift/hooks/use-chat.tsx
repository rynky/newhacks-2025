import { useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // TODO: 🔗 Integrate your AI call here
    // For now, just simulate a response
    setTimeout(() => {
      const mockReply: Message = {
        role: 'assistant',
        content: `You said: "${newMessage.content}"`,
      };
      setMessages(prev => [...prev, mockReply]);
    }, 600);
  };

  // Combine messages into one prompt string (for API calls)
  const chatAsString = messages.map(m => `${m.role}: ${m.content}`).join('\n');

  return { messages, input, setInput, sendMessage, chatAsString };
}
