// Function to generate a workout routine based on exercise library and past workouts
export async function generateWorkoutRoutine(exercises, pastWorkouts = []) {
  try {
    // Build exercise list text
    const exerciseList = exercises.map(ex => `${ex.name} (${ex.category})`).join(', ');
    
    // Build past workout summary
    const pastWorkoutSummary = pastWorkouts.length > 0 
      ? pastWorkouts.map(w => `- ${w.name} on ${new Date(w.date).toLocaleDateString()} with ${w.exercises?.length || 0} exercises`).join('\n')
      : 'No previous workouts yet.';
    
    const prompt = `You are a professional fitness coach for Superlift app. Based on the following exercise library and user's workout history, generate a comprehensive workout routine.

AVAILABLE EXERCISES:
${exerciseList}

PAST WORKOUTS:
${pastWorkoutSummary}

Please generate a workout routine that:
1. Is well-balanced across muscle groups
2. Takes into account the user's recent activity
3. Includes 6-8 exercises
4. Provides sets and rep ranges for each exercise
5. Is challenging but realistic

Format your response as JSON with the following structure:
{
  "routineName": "Name of the workout",
  "description": "Brief description",
  "exercises": [
    {
      "name": "Exercise name",
      "category": "Muscle group",
      "sets": "3-4",
      "reps": "8-12"
    }
  ],
  "estimatedDuration": "60 minutes"
}`;

    // Call Gemini REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback: return a formatted response
    return {
      routineName: "AI-Generated Workout",
      description: responseText,
      exercises: [],
      estimatedDuration: "45-60 minutes"
    };
  } catch (error) {
    console.error('Error generating workout:', error);
    throw error;
  }
}