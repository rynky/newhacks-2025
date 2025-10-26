import { Platform } from 'react-native';
import { pastWorkouts, armsOnly, legsOnly } from '@/constants/mockWorkouts';

let db = null;
let isWeb = Platform.OS === 'web';

// Web storage using localStorage
const WEB_STORAGE_KEY = 'superlift_workouts_db';

// Get web database from localStorage
const getWebDB = () => {
  try {
    const data = localStorage.getItem(WEB_STORAGE_KEY);
    if (!data) {
      return { workouts: [], exercises: [], sets: [], nextExerciseId: 1, nextSetId: 1 };
    }
    return JSON.parse(data);
  } catch (e) {
    return { workouts: [], exercises: [], sets: [], nextExerciseId: 1, nextSetId: 1 };
  }
};

// Save web database to localStorage
const saveWebDB = (data) => {
  try {
    localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

// Get or open database (native)
const getDB = () => {
  if (isWeb) return null;

  if (!db) {
    try {
      const SQLite = require('expo-sqlite');
      db = SQLite.openDatabaseSync('workouts.db');
    } catch (e) {
      console.error('Error opening native database:', e);
    }
  }
  return db;
};

// Initialize database
export const initDB = async () => {
  if (isWeb) {
    // Web: Check if we need to seed
    const webDB = getWebDB();
    if (webDB.workouts.length === 0) {
      await seedDataWeb();
    }
    return true;
  }

  // Native: Use SQLite
  const database = getDB();
  if (!database) return false;

  try {
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

    const result = database.getFirstSync('SELECT COUNT(*) as count FROM workouts');
    if (result && result.count === 0) {
      await seedDataNative();
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Seed data for web
const seedDataWeb = async () => {
  const webDB = getWebDB();
  let exerciseId = 1;
  let setId = 1;

  for (const workout of pastWorkouts) {
    webDB.workouts.push({
      id: workout.id,
      name: workout.name,
      duration: workout.duration,
      date: workout.date
    });

    if (Array.isArray(workout.exercises)) {
      for (const exercise of workout.exercises) {
        const currentExerciseId = exerciseId++;
        webDB.exercises.push({
          id: currentExerciseId,
          workoutId: workout.id,
          name: exercise.name
        });

        if (Array.isArray(exercise.sets)) {
          for (const set of exercise.sets) {
            webDB.sets.push({
              id: setId++,
              exerciseId: currentExerciseId,
              setOrder: set.setOrder,
              weight: set.weight,
              reps: set.reps
            });
          }
        }
      }
    }
  }

  webDB.nextExerciseId = exerciseId;
  webDB.nextSetId = setId;
  saveWebDB(webDB);
};

// Seed data for native
const seedDataNative = async () => {
  const database = getDB();
  if (!database) return;

  for (const workout of pastWorkouts) {
    try {
      database.runSync(
        'INSERT INTO workouts (id, name, duration, date) VALUES (?, ?, ?, ?)',
        [workout.id, workout.name, workout.duration, workout.date]
      );

      if (Array.isArray(workout.exercises)) {
        for (const exercise of workout.exercises) {
          const result = database.runSync(
            'INSERT INTO exercises (workoutId, name) VALUES (?, ?)',
            [workout.id, exercise.name]
          );

          const exerciseId = result.lastInsertRowId;

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

// Get all workouts
export const getAllWorkouts = async () => {
  if (isWeb) {
    return getAllWorkoutsWeb();
  }
  return getAllWorkoutsNative();
};

// Get all workouts from web storage
const getAllWorkoutsWeb = async () => {
  const webDB = getWebDB();

  const workoutsWithDetails = webDB.workouts
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .map(workout => {
      const exercises = webDB.exercises.filter(e => e.workoutId === workout.id);

      const exercisesWithSets = exercises.map(exercise => {
        const sets = webDB.sets
          .filter(s => s.exerciseId === exercise.id)
          .sort((a, b) => a.setOrder - b.setOrder);

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
};

// Get all workouts from native database
const getAllWorkoutsNative = async () => {
  const database = getDB();
  if (!database) return [];

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

// Insert a new workout
export const insertWorkout = async (workout) => {
  if (isWeb) {
    return insertWorkoutWeb(workout);
  }
  return insertWorkoutNative(workout);
};

// Insert workout on web
const insertWorkoutWeb = async (workout) => {
  const webDB = getWebDB();

  webDB.workouts.push({
    id: workout.id,
    name: workout.name,
    duration: workout.duration || '',
    date: workout.date || new Date().toISOString()
  });

  if (Array.isArray(workout.exercises)) {
    for (const exercise of workout.exercises) {
      const exerciseId = webDB.nextExerciseId++;
      webDB.exercises.push({
        id: exerciseId,
        workoutId: workout.id,
        name: exercise.name
      });

      if (Array.isArray(exercise.sets)) {
        for (const set of exercise.sets) {
          webDB.sets.push({
            id: webDB.nextSetId++,
            exerciseId: exerciseId,
            setOrder: set.setOrder || 1,
            weight: set.weight || 0,
            reps: set.reps || 0
          });
        }
      }
    }
  }

  saveWebDB(webDB);
  return true;
};

// Insert workout on native
const insertWorkoutNative = async (workout) => {
  const database = getDB();
  if (!database) return false;

  try {
    database.runSync(
      'INSERT INTO workouts (id, name, duration, date) VALUES (?, ?, ?, ?)',
      [workout.id, workout.name, workout.duration || '', workout.date || new Date().toISOString()]
    );

    if (Array.isArray(workout.exercises)) {
      for (const exercise of workout.exercises) {
        const result = database.runSync(
          'INSERT INTO exercises (workoutId, name) VALUES (?, ?)',
          [workout.id, exercise.name]
        );

        const exerciseId = result.lastInsertRowId;

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
    return false;
  }
};

// Delete a workout
export const deleteWorkout = async (id) => {
  if (isWeb) {
    return deleteWorkoutWeb(id);
  }
  return deleteWorkoutNative(id);
};

// Delete workout on web
const deleteWorkoutWeb = async (id) => {
  const webDB = getWebDB();

  const exerciseIds = webDB.exercises
    .filter(e => e.workoutId === id)
    .map(e => e.id);

  webDB.sets = webDB.sets.filter(s => !exerciseIds.includes(s.exerciseId));
  webDB.exercises = webDB.exercises.filter(e => e.workoutId !== id);
  webDB.workouts = webDB.workouts.filter(w => w.id !== id);

  saveWebDB(webDB);
  return true;
};

// Delete workout on native
const deleteWorkoutNative = async (id) => {
  const database = getDB();
  if (!database) return false;

  try {
    const exercises = database.getAllSync(
      'SELECT id FROM exercises WHERE workoutId = ?',
      [id]
    );

    for (const exercise of exercises) {
      database.runSync('DELETE FROM sets WHERE exerciseId = ?', [exercise.id]);
    }

    database.runSync('DELETE FROM exercises WHERE workoutId = ?', [id]);
    database.runSync('DELETE FROM workouts WHERE id = ?', [id]);

    return true;
  } catch (error) {
    console.error('Error deleting workout:', error);
    return false;
  }
};

export default {
  initDB,
  getAllWorkouts,
  insertWorkout,
  deleteWorkout
};
