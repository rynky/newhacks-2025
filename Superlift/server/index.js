import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateWorkoutRoutine } from './gemini.js';
import { EXERCISE_LIBRARY } from './exercises.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});

// Endpoint to generate workout suggestions
app.post('/generate-workout', async (req, res) => {
  try {
    const { pastWorkouts = [] } = req.body;
    
    // Generate workout routine using Gemini
    const workoutRoutine = await generateWorkoutRoutine(EXERCISE_LIBRARY, pastWorkouts);
    
    res.json(workoutRoutine);
  } catch (error) {
    console.error('Error generating workout:', error);
    res.status(500).json({ 
      error: 'Failed to generate workout routine',
      message: error.message 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Server accessible at http://10.0.0.217:${PORT}`);
});
