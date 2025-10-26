import * as SQLite from 'expo-sqlite';
import { pastWorkouts } from '../constants/mockWorkouts';

let db = null;

// Get or open database
const getDB = () => {
  if (!db) {
    db = SQLite.openDatabaseSync('workouts.db');
  }
  return db;
};

// Initialize database schema and seed data
export const initDB = async () => {
  const database = getDB();

  try {
    // Create tables
    database.execSync(`
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        duration TEXT,
        date TEXT
      );
    `);

    database.execSync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workoutId TEXT NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY(workoutId) REFERENCES workouts(id)
      );
    `);

    database.execSync(`
      CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exerciseId INTEGER NOT NULL,
        setOrder INTEGER,
        weight REAL,
        reps INTEGER,
        FOREIGN KEY(exerciseId) REFERENCES exercises(id)
      );
    `);

    // Check if we need to seed data
    const result = database.getFirstSync('SELECT COUNT(*) as count FROM workouts');

    if (result && result.count === 0) {
      // Seed data from mockWorkouts.tsx
      await seedData();
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Seed initial data from mockWorkouts
const seedData = async () => {
  const database = getDB();

  for (const workout of pastWorkouts) {
    try {
      // Insert workout
      database.runSync(
        'INSERT INTO workouts (id, name, duration, date) VALUES (?, ?, ?, ?)',
        [workout.id, workout.name, workout.duration, workout.date]
      );

      // Insert exercises and sets
      if (Array.isArray(workout.exercises)) {
        for (const exercise of workout.exercises) {
          const result = database.runSync(
            'INSERT INTO exercises (workoutId, name) VALUES (?, ?)',
            [workout.id, exercise.name]
          );

          const exerciseId = result.lastInsertRowId;

          // Insert sets
          if (Array.isArray(exercise.sets)) {
            for (const set of exercise.sets) {
              database.runSync(
                'INSERT INTO sets (exerciseId, setOrder, weight, reps) VALUES (?, ?, ?, ?)',
                [exerciseId, set.setOrder, set.weight, set.reps]
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error seeding workout:', workout.id, error);
    }
  }
};

// Get all workouts with exercises and sets
export const getAllWorkouts = async () => {
  const database = getDB();

  try {
    const workouts = database.getAllSync('SELECT * FROM workouts ORDER BY date DESC');

    const workoutsWithDetails = workouts.map(workout => {
      const exercises = database.getAllSync(
        'SELECT * FROM exercises WHERE workoutId = ?',
        [workout.id]
      );

      const exercisesWithSets = exercises.map(exercise => {
        const sets = database.getAllSync(
          'SELECT * FROM sets WHERE exerciseId = ? ORDER BY setOrder',
          [exercise.id]
        );

        return {
          ...exercise,
          sets
        };
      });

      return {
        ...workout,
        exercises: exercisesWithSets
      };
    });

    return workoutsWithDetails;
  } catch (error) {
    console.error('Error getting workouts:', error);
    return [];
  }
};

// Insert a new workout with exercises and sets
export const insertWorkout = async (workout) => {
  const database = getDB();

  try {
    // Insert workout
    database.runSync(
      'INSERT INTO workouts (id, name, duration, date) VALUES (?, ?, ?, ?)',
      [workout.id, workout.name, workout.duration || '', workout.date || new Date().toISOString()]
    );

    // Insert exercises and sets
    if (Array.isArray(workout.exercises)) {
      for (const exercise of workout.exercises) {
        const result = database.runSync(
          'INSERT INTO exercises (workoutId, name) VALUES (?, ?)',
          [workout.id, exercise.name]
        );

        const exerciseId = result.lastInsertRowId;

        // Insert sets
        if (Array.isArray(exercise.sets)) {
          for (const set of exercise.sets) {
            database.runSync(
              'INSERT INTO sets (exerciseId, setOrder, weight, reps) VALUES (?, ?, ?, ?)',
              [exerciseId, set.setOrder || 1, set.weight || 0, set.reps || 0]
            );
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error inserting workout:', error);
    throw error;
  }
};

// Delete a workout and all related data
export const deleteWorkout = async (id) => {
  const database = getDB();

  try {
    // Get exercise IDs for this workout
    const exercises = database.getAllSync(
      'SELECT id FROM exercises WHERE workoutId = ?',
      [id]
    );

    // Delete sets for all exercises
    for (const exercise of exercises) {
      database.runSync('DELETE FROM sets WHERE exerciseId = ?', [exercise.id]);
    }

    // Delete exercises
    database.runSync('DELETE FROM exercises WHERE workoutId = ?', [id]);

    // Delete workout
    database.runSync('DELETE FROM workouts WHERE id = ?', [id]);

    return true;
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
};

export default {
  initDB,
  getAllWorkouts,
  insertWorkout,
  deleteWorkout
};
