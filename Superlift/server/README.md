# Superlift Server

This is the backend server for the Superlift app that provides AI-powered workout generation using Google's Gemini API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

To get a Gemini API key, visit [Google AI Studio](https://makersuite.google.com/app/apikey).

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### POST `/generate-workout`

Generates a personalized workout routine based on the user's exercise library and past workouts.

**Request body:**
```json
{
  "pastWorkouts": [
    {
      "id": "workout-id",
      "name": "Full Body Strength",
      "date": "2025-01-20",
      "exercises": [...]
    }
  ]
}
```

**Response:**
```json
{
  "routineName": "Upper Body Power",
  "description": "A balanced upper body workout focusing on strength and power",
  "exercises": [
    {
      "name": "Bench Press (Barbell)",
      "category": "Chest",
      "sets": "3-4",
      "reps": "8-12"
    }
  ],
  "estimatedDuration": "60 minutes"
}
```

## Features

- AI-powered workout generation using Google Gemini API
- Personalized recommendations based on user's workout history
- Access to full exercise library
- Context-aware exercise selection

