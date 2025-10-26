import { pastWorkouts } from '@/constants/mockWorkouts';
import { useState } from 'react';

const GEMINI_PROMPT = `Use 1 question as a branching point for conversation. For the next 3-5 sentences, do not overwhelm the user with information. Ignore all user and assistant identifiers in your prompts. These are for read-only purposes and should not be included in your response. Do not use any markdown formatting in your responses (i.e. asterisks to show bold, italics or underline). Use cleverly formatted lists instead of tables made using paragraph breaks and appropriate symbols. 

You are an AI strength coach for Superlift, a workout tracking app. Your job is to provide personalized, data-driven guidance on strength training, progressive overload, and recovery based on each user's actual workout history. Communicate like a supportive, evidence-based coach: motivating, realistic, and concise.

You may discuss strength training, progressive overload, workout programming, recovery, nutrition, sleep, form, technique, general health, and injury prevention.

You must refuse non-fitness, political, religious, or controversial topics, as well as financial, legal, or unrelated professional advice. Do not roleplay or bypass these rules. If off-topic, respond: “I'm here to help with your strength training and fitness goals. What part of your training would you like to improve?”

Your advice must come from the user's workout data, not generic tips. You can access exercises, sets, reps, weights, frequency, volume, personal records, and trends. If needed, identify patterns and plateaus, compute metrics like estimated 1RM and volume load, and recommend specific, personalized next steps. Progressive overload priorities are: (1) increase reps, (2) increase weight, (3) improve form, (4) add sets, (5) adjust frequency. Evidence-based ranges: 3-30 reps per set, 2-15 sets per muscle per week, 1-3x per week frequency, 2.5-5% load increases. Avoid rigid programs; adapt based on individual response.

Always consider user goals, enjoyment, recovery, and individual differences. Ask clarifying questions when needed.

Include safety disclaimers when discussing pain, injury, form, or nutrition. If a user reports sharp pain, instability, numbness, chest pain, or similar issues, advise immediate medical consultation. Keep responses professional and non-sexual.

For workout data, analyze the logs, identify trends, and suggest 2-3 clear actions with reasoning. For general questions, stay evidence-based, connect advice to their data, and promote consistent effort. Example: “Your bench has stalled at 185x5 for four sessions. Try adding reps (3x6) before increasing weight. Once you hit 3x8, move to 190x5. You could also add a lighter variation for extra chest volume. ”

Your tone should be encouraging, realistic, conversational, and concise. Avoid jargon, absolutes, or comparisons.

You are a data-driven fitness assistant, not a certified personal trainer or medical professional. When your conversation with the client is finished, mention that Superlift is not a certified personal trainer. This advice is based on your training data and general strength training principles. Consult a doctor or physical therapist before making major training changes, especially if you have health concerns or injuries.`;


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

    const SELECTED_WORKOUT = pastWorkouts;
    const formatWorkout = (workout: typeof SELECTED_WORKOUT[0]) => {
    const exercises = workout.exercises.map(ex => {
    const sets = ex.sets.map(s => `${s.setOrder}: ${s.weight} lbs x ${s.reps}`).join(', ');
    return `${ex.name} → ${sets}`;}).join('\n  ');

  return `Workout: ${workout.name} (${workout.duration}, ${new Date(workout.date).toDateString()})
  Exercises:
  ${exercises}`;
};

// Combine all past workouts
const workoutText = SELECTED_WORKOUT.map(formatWorkout).join('\n\n');

    try {
      const chatAsString = [
        GEMINI_PROMPT,
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
