import { Platform } from 'react-native';
let db;
let SQLite = null;
// Try to load a statically-bundled mockWorkouts JS wrapper (preferred on native).
let bundledMockWorkouts = null;
try {
  // static require with literal path so Metro includes the file in the bundle
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bm = require('../constants/mockWorkouts');
  if (bm && bm.pastWorkouts) bundledMockWorkouts = bm.pastWorkouts;
} catch (e) {
  // ignore; we'll attempt dynamic paths later
}

// Lightweight web fallback using localStorage to emulate the small subset of
// SQL operations this app uses (works when @expo/wa-sqlite is not available).
const createWebFallbackDB = () => {
  const STORAGE_KEY = 'superlift_sqlite_fallback_v1';

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { workouts: [], exercises: [], sets: [], meta: { exId: 1, setId: 1 } };
      return JSON.parse(raw);
    } catch (e) {
      return { workouts: [], exercises: [], sets: [], meta: { exId: 1, setId: 1 } };
    }
  };

  const save = (dbState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dbState));
  };

  const runSelect = (sql, params) => {
    const state = load();
    const trim = s => s.trim().toUpperCase();

    if (trim(sql).startsWith('SELECT COUNT(*)')) {
      return { rows: { length: 1, item: (i) => ({ c: state.workouts.length }) } };
    }

    if (/SELECT \* FROM workouts/i.test(sql)) {
      const rows = [...state.workouts].sort((a,b) => (b.date || '').localeCompare(a.date || ''));
      return { rows: { length: rows.length, item: (i) => rows[i] } };
    }

    if (/SELECT id FROM workouts WHERE id = \?/i.test(sql)) {
      const id = params[0];
      const found = state.workouts.filter(w => w.id === id);
      return { rows: { length: found.length, item: (i) => found[i] } };
    }

    if (/SELECT \* FROM exercises WHERE workoutId = \?/i.test(sql)) {
      const wid = params[0];
      const rows = state.exercises.filter(e => e.workoutId === wid);
      return { rows: { length: rows.length, item: (i) => rows[i] } };
    }

    if (/SELECT \* FROM sets WHERE exerciseId = \?/i.test(sql)) {
      const exId = params[0];
      const rows = state.sets.filter(s => s.exerciseId === exId).sort((a,b) => (a.setOrder||0)-(b.setOrder||0));
      return { rows: { length: rows.length, item: (i) => rows[i] } };
    }

    return { rows: { length: 0, item: () => null } };
  };

  const runInsert = (sql, params) => {
    const state = load();
    if (/INSERT OR REPLACE INTO workouts/i.test(sql) || /INSERT INTO workouts/i.test(sql)) {
      const [id, name, duration, date] = params;
      // replace if exists
      const existsIdx = state.workouts.findIndex(w => w.id === id);
      const row = { id: id, name: name, duration: duration, date: date };
      if (existsIdx >= 0) state.workouts[existsIdx] = row; else state.workouts.push(row);
      save(state);
      return { insertId: null };
    }

    if (/INSERT INTO exercises/i.test(sql)) {
      const [workoutId, name] = params;
      const id = state.meta.exId++;
      const row = { id, workoutId, name };
      state.exercises.push(row);
      save(state);
      return { insertId: id };
    }

    if (/INSERT INTO sets/i.test(sql)) {
      const [exerciseId, setOrder, weight, reps] = params;
      const id = state.meta.setId++;
      const row = { id, exerciseId, setOrder, weight, reps };
      state.sets.push(row);
      save(state);
      return { insertId: id };
    }

    return { insertId: null };
  };

  const runDelete = (sql, params) => {
    const state = load();
    if (/DELETE FROM sets WHERE exerciseId IN \(SELECT id FROM exercises WHERE workoutId = \?\)/i.test(sql)) {
      const wid = params[0];
      const exIds = state.exercises.filter(e => e.workoutId === wid).map(e => e.id);
      state.sets = state.sets.filter(s => !exIds.includes(s.exerciseId));
      save(state);
      return {};
    }

    if (/DELETE FROM exercises WHERE workoutId = \?/i.test(sql)) {
      const wid = params[0];
      state.exercises = state.exercises.filter(e => e.workoutId !== wid);
      save(state);
      return {};
    }

    if (/DELETE FROM workouts WHERE id = \?/i.test(sql)) {
      const id = params[0];
      state.workouts = state.workouts.filter(w => w.id !== id);
      save(state);
      return {};
    }

    if (/DROP TABLE IF EXISTS sets/i.test(sql)) {
      state.sets = [];
      save(state);
      return {};
    }
    if (/DROP TABLE IF EXISTS exercises/i.test(sql)) {
      state.exercises = [];
      save(state);
      return {};
    }
    if (/DROP TABLE IF EXISTS workouts/i.test(sql)) {
      state.workouts = [];
      save(state);
      return {};
    }

    return {};
  };

  const tx = {
    executeSql: (sql, params = [], success = () => {}, error = () => {}) => {
      try {
        const s = sql.trim().toUpperCase();
        if (s.startsWith('SELECT')) {
          const res = runSelect(sql, params);
          success(tx, res);
        } else if (s.startsWith('INSERT') || s.includes('INSERT')) {
          const res = runInsert(sql, params);
          success(tx, res);
        } else if (s.startsWith('DELETE') || s.startsWith('DROP')) {
          const res = runDelete(sql, params);
          success(tx, res);
        } else if (s.startsWith('CREATE')) {
          // no-op for create table in fallback
          success(tx, { rows: { length: 0, item: () => null } });
        } else {
          success(tx, { rows: { length: 0, item: () => null } });
        }
      } catch (e) {
        error(tx, e);
      }
    }
  };

  return {
    // transaction should match expo-sqlite's signature: transaction(cb, error, success)
    // ensure the fallback calls the provided error/success callbacks so callers
    // that await transaction completion (like initDB) don't hang.
    transaction: (cb, error = () => {}, success = () => {}) => {
      try {
        // execute the callback synchronously like the real implementation
        cb(tx);
        // call the success callback to indicate transaction finished
        try {
          if (typeof success === 'function') success();
        } catch (e) {
          // swallow errors from success callback
        }
      } catch (e) {
        // on error call the provided error callback if present
        try {
          if (typeof error === 'function') error(e);
        } catch (err) {
          // swallow
        }
      }
    }
  };
};

// In-memory fallback for native environments when sqlite isn't available.
// This mirrors the web fallback behaviour but stores state only for the session
// (no localStorage) which avoids runtime ReferenceErrors on native platforms.
const createInMemoryFallbackDB = () => {
  const state = { workouts: [], exercises: [], sets: [], meta: { exId: 1, setId: 1 } };

  const load = () => state;
  const save = () => { /* no-op for in-memory */ };

  const runSelect = (sql, params) => {
    const s = sql.trim().toUpperCase();
    if (s.startsWith('SELECT COUNT(*)')) {
      return { rows: { length: 1, item: (i) => ({ c: state.workouts.length }) } };
    }
    if (/SELECT \* FROM workouts/i.test(sql)) {
      const rows = [...state.workouts].sort((a,b) => (b.date || '').localeCompare(a.date || ''));
      return { rows: { length: rows.length, item: (i) => rows[i] } };
    }
    if (/SELECT id FROM workouts WHERE id = \?/i.test(sql)) {
      const id = params[0];
      const found = state.workouts.filter(w => w.id === id);
      return { rows: { length: found.length, item: (i) => found[i] } };
    }
    if (/SELECT \* FROM exercises WHERE workoutId = \?/i.test(sql)) {
      const wid = params[0];
      const rows = state.exercises.filter(e => e.workoutId === wid);
      return { rows: { length: rows.length, item: (i) => rows[i] } };
    }
    if (/SELECT \* FROM sets WHERE exerciseId = \?/i.test(sql)) {
      const exId = params[0];
      const rows = state.sets.filter(s => s.exerciseId === exId).sort((a,b) => (a.setOrder||0)-(b.setOrder||0));
      return { rows: { length: rows.length, item: (i) => rows[i] } };
    }
    return { rows: { length: 0, item: () => null } };
  };

  const runInsert = (sql, params) => {
    if (/INSERT OR REPLACE INTO workouts/i.test(sql) || /INSERT INTO workouts/i.test(sql)) {
      const [id, name, duration, date] = params;
      const existsIdx = state.workouts.findIndex(w => w.id === id);
      const row = { id: id, name: name, duration: duration, date: date };
      if (existsIdx >= 0) state.workouts[existsIdx] = row; else state.workouts.push(row);
      save(state);
      return { insertId: null };
    }
    if (/INSERT INTO exercises/i.test(sql)) {
      const [workoutId, name] = params;
      const id = state.meta.exId++;
      const row = { id, workoutId, name };
      state.exercises.push(row);
      save(state);
      return { insertId: id };
    }
    if (/INSERT INTO sets/i.test(sql)) {
      const [exerciseId, setOrder, weight, reps] = params;
      const id = state.meta.setId++;
      const row = { id, exerciseId, setOrder, weight, reps };
      state.sets.push(row);
      save(state);
      return { insertId: id };
    }
    return { insertId: null };
  };

  const runDelete = (sql, params) => {
    if (/DELETE FROM sets WHERE exerciseId IN \(SELECT id FROM exercises WHERE workoutId = \?\)/i.test(sql)) {
      const wid = params[0];
      const exIds = state.exercises.filter(e => e.workoutId === wid).map(e => e.id);
      state.sets = state.sets.filter(s => !exIds.includes(s.exerciseId));
      save(state);
      return {};
    }
    if (/DELETE FROM exercises WHERE workoutId = \?/i.test(sql)) {
      const wid = params[0];
      state.exercises = state.exercises.filter(e => e.workoutId !== wid);
      save(state);
      return {};
    }
    if (/DELETE FROM workouts WHERE id = \?/i.test(sql)) {
      const id = params[0];
      state.workouts = state.workouts.filter(w => w.id !== id);
      save(state);
      return {};
    }
    if (/DROP TABLE IF EXISTS sets/i.test(sql)) {
      state.sets = [];
      save(state);
      return {};
    }
    if (/DROP TABLE IF EXISTS exercises/i.test(sql)) {
      state.exercises = [];
      save(state);
      return {};
    }
    if (/DROP TABLE IF EXISTS workouts/i.test(sql)) {
      state.workouts = [];
      save(state);
      return {};
    }
    return {};
  };

  const tx = {
    executeSql: (sql, params = [], success = () => {}, error = () => {}) => {
      try {
        const s = sql.trim().toUpperCase();
        if (s.startsWith('SELECT')) {
          const res = runSelect(sql, params);
          success(tx, res);
        } else if (s.startsWith('INSERT') || s.includes('INSERT')) {
          const res = runInsert(sql, params);
          success(tx, res);
        } else if (s.startsWith('DELETE') || s.startsWith('DROP')) {
          const res = runDelete(sql, params);
          success(tx, res);
        } else if (s.startsWith('CREATE')) {
          success(tx, { rows: { length: 0, item: () => null } });
        } else {
          success(tx, { rows: { length: 0, item: () => null } });
        }
      } catch (e) {
        error(tx, e);
      }
    }
  };

  return {
    transaction: (cb, error = () => {}, success = () => {}) => {
      try {
        cb(tx);
        try { if (typeof success === 'function') success(); } catch (e) {}
      } catch (e) {
        try { if (typeof error === 'function') error(e); } catch (err) {}
      }
    }
  };
};

// Get or open the DB instance. On web try to use @expo/wa-sqlite if available,
// otherwise fall back to expo-sqlite's openDatabase.
const getDB = () => {
  if (db) return db;

  try {
    if (Platform.OS === 'web') {
      // Try to use wa-sqlite on web for better compatibility (if installed).
      // Use a dynamic require via eval to avoid Metro's static module resolution
      // (Metro will throw if the package isn't installed even inside try/catch).
      // eslint-disable-next-line no-eval
      let wa = null;
      try {
        wa = eval("require")('@expo/wa-sqlite');
      } catch (err) {
        wa = null;
      }

      if (wa && wa.openDatabase) {
        db = wa.openDatabase('workouts.db');
      } else {
        // use the localStorage-based fallback so web still works
        db = createWebFallbackDB();
      }
    } else {
      // native platforms: load expo-sqlite dynamically
      try {
        // eslint-disable-next-line no-eval
        const nativeSqlite = eval("require")('expo-sqlite');
        if (nativeSqlite && nativeSqlite.openDatabase) {
          SQLite = nativeSqlite;
          db = SQLite.openDatabase('workouts.db');
        }
      } catch (err) {
        // leave db null so fallback or error can be handled below
      }
    }
  } catch (e) {
    // ignore, fallback to expo-sqlite
  }

  if (!db) {
    // final fallback: if we have SQLite (native) use it, otherwise use a
    // runtime-appropriate fallback (web uses localStorage, native uses
    // an in-memory fallback to avoid referencing localStorage on devices).
    if (SQLite && SQLite.openDatabase) {
      db = SQLite.openDatabase('workouts.db');
    } else if (Platform.OS === 'web') {
      db = createWebFallbackDB();
    } else {
      // native: in-memory fallback (session only) to avoid crashes when
      // no sqlite implementation is available during development.
      db = createInMemoryFallbackDB();
    }
  }

  return db;
};

// Initialize schema for workouts, exercises and sets.
export const initDB = async () => {
  const database = getDB();

  // Wrap in a Promise so callers can await DB initialization and seeding.
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        duration TEXT,
        date TEXT
      );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workoutId TEXT NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY(workoutId) REFERENCES workouts(id)
      );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exerciseId INTEGER NOT NULL,
        setOrder INTEGER,
        weight REAL,
        reps INTEGER,
        FOREIGN KEY(exerciseId) REFERENCES exercises(id)
      );`
      );
    }, err => {
      // transaction error
      reject(err);
    }, async () => {
      // on success, attempt one-time seed from mock data
      try {
        // seedMockIfEmpty is a named export below; calling it here will seed only when empty
        // eslint-disable-next-line no-use-before-define
        const seeded = await seedMockIfEmpty();
        resolve({ seeded });
      } catch (e) {
        // ignore seeding failures but resolve init as success
        resolve({ seeded: false });
      }
    });
  });
};

// Generic execute helper returning a Promise.
export const executeSql = (sql, params = []) => {
  const database = getDB();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    }, err => reject(err));
  });
};

// Insert a single workout with exercises and sets in one transaction.
// workout: { id, name, duration, date, exercises: [{ name, sets: [{setOrder, weight, reps}...] }] }
export const insertWorkout = async workout => {
  const database = getDB();

  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO workouts (id, name, duration, date) VALUES (?, ?, ?, ?);`,
        [workout.id, workout.name, workout.duration, workout.date]
      );

      if (Array.isArray(workout.exercises)) {
        workout.exercises.forEach(ex => {
          tx.executeSql(
            `INSERT INTO exercises (workoutId, name) VALUES (?, ?);`,
            [workout.id, ex.name],
            (_, res) => {
              const exerciseId = res.insertId;
              if (Array.isArray(ex.sets)) {
                ex.sets.forEach(s => {
                  tx.executeSql(
                    `INSERT INTO sets (exerciseId, setOrder, weight, reps) VALUES (?, ?, ?, ?);`,
                    [exerciseId, s.setOrder, s.weight, s.reps]
                  );
                });
              }
            }
          );
        });
      }
    }, err => reject(err), () => resolve(true));
  });
};

// Fetch all workouts with nested exercises and sets.
// Use the `executeSql` helper (separate transactions) instead of nesting
// `tx.executeSql` calls inside a single transaction. Nested callbacks can
// behave differently across platforms (web vs native), causing missing data
// on some devices. This implementation is reliable across platforms.
export const getAllWorkouts = async () => {
  try {
    const workoutsRes = await executeSql(`SELECT * FROM workouts ORDER BY date DESC;`, []);
    const rows = workoutsRes.rows;
    const rowCount = rows.length;
    const workouts = [];

    for (let i = 0; i < rowCount; i++) {
      const w = rows.item(i);
      const workout = {
        id: w.id,
        name: w.name,
        duration: w.duration,
        date: w.date,
        exercises: []
      };

      // fetch exercises for this workout
      try {
        const exRes = await executeSql(`SELECT * FROM exercises WHERE workoutId = ?;`, [w.id]);
        const exRows = exRes.rows;
        const exCount = exRows.length;

        for (let j = 0; j < exCount; j++) {
          const exRow = exRows.item(j);
          const exercise = { id: exRow.id, name: exRow.name, sets: [] };

          // fetch sets for this exercise
          try {
            const setsRes = await executeSql(`SELECT * FROM sets WHERE exerciseId = ? ORDER BY setOrder ASC;`, [exRow.id]);
            const sets = [];
            for (let k = 0; k < setsRes.rows.length; k++) {
              const s = setsRes.rows.item(k);
              sets.push({ id: s.id, setOrder: s.setOrder, weight: s.weight, reps: s.reps });
            }
            exercise.sets = sets;
          } catch (e) {
            // continue even if sets query fails for this exercise
            console.warn('[database] failed to load sets for exercise', exRow.id, e && e.message ? e.message : e);
          }

          workout.exercises.push(exercise);
        }
      } catch (e) {
        console.warn('[database] failed to load exercises for workout', w.id, e && e.message ? e.message : e);
      }

      workouts.push(workout);
    }

    return workouts;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const deleteWorkout = id => {
  const database = getDB();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(`DELETE FROM sets WHERE exerciseId IN (SELECT id FROM exercises WHERE workoutId = ?);`, [id]);
      tx.executeSql(`DELETE FROM exercises WHERE workoutId = ?;`, [id]);
      tx.executeSql(`DELETE FROM workouts WHERE id = ?;`, [id]);
    }, err => reject(err), () => resolve(true));
  });
};

export const clearDB = () => {
  const database = getDB();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(`DROP TABLE IF EXISTS sets;`);
      tx.executeSql(`DROP TABLE IF EXISTS exercises;`);
      tx.executeSql(`DROP TABLE IF EXISTS workouts;`);
    }, err => reject(err), () => resolve(true));
  });
};

// Seed an array of workouts (like the mock data) into the DB.
export const seedWorkouts = async workouts => {
  // simple approach: insert each workout (id should be provided)
  for (const w of workouts) {
    // eslint-disable-next-line no-await-in-loop
    // check if workout exists
    // If exists, skip to avoid duplicates
    // Use executeSql to check
    // eslint-disable-next-line no-await-in-loop
    const exists = await executeSql(`SELECT id FROM workouts WHERE id = ?;`, [w.id]);
    if (exists.rows.length === 0) {
      // eslint-disable-next-line no-await-in-loop
      await insertWorkout(w);
    }
  }
};

// Seed from the project's mockWorkouts file if the workouts table is empty.
// This is a safe one-time extraction: it checks the row count and only seeds when 0.
export const seedMockIfEmpty = async () => {
  try {
    const countRes = await executeSql(`SELECT COUNT(*) as c FROM workouts;`);
    const count = countRes.rows && countRes.rows.length ? countRes.rows.item(0).c : 0;
    if (count === 0) {
      // try to load the mock data file. Relative path from this file to the constants folder.
      let mock;
      const tryPaths = [
        '../constants/mockWorkouts',
        '../constants/mockWorkouts.tsx',
        '../constants/mockWorkouts.ts',
        './../constants/mockWorkouts',
        './../constants/mockWorkouts.tsx',
        './../constants/mockWorkouts.ts'
      ];

      // Attempt multiple require paths and log failures to help native bundler debugging
      for (const p of tryPaths) {
        try {
          // use eval('require') to avoid Metro's static require analysis
          const mod = eval("require")(p);
          if (mod && mod.pastWorkouts) {
            mock = mod.pastWorkouts;
            console.log('[database] loaded mockWorkouts from', p, 'count=', Array.isArray(mock) ? mock.length : '??');
            break;
          }
        } catch (err) {
          // log the error for visibility on device
          console.warn('[database] require failed for', p, err && err.message ? err.message : err);
        }
      }

      // As a last-resort fallback (so native/dev devices still show something),
      // provide a minimal inline seed and log that we used it. This avoids
      // the app appearing empty while we debug bundler resolution.
      if (!mock) {
        console.warn('[database] mockWorkouts not found via require; using inline fallback seed');
        mock = [
          {
            id: 'seed-1',
            name: 'Seed Workout (dev)',
            duration: '10min',
            date: new Date().toISOString(),
            exercises: [
              { name: 'Pushups', sets: [{ setOrder: 1, weight: 0, reps: 10 }] }
            ]
          }
        ];
      }

      if (Array.isArray(mock) && mock.length > 0) {
        await seedWorkouts(mock);
        return true;
      }
    }

    return false;
  } catch (e) {
    // swallow or propagate depending on needs. Return false to indicate no seed done.
    return false;
  }
};

export default {
  getDB,
  initDB,
  executeSql,
  insertWorkout,
  getAllWorkouts,
  deleteWorkout,
  clearDB,
  seedWorkouts
  ,seedMockIfEmpty
};
