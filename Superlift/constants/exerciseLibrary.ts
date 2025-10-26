// exerciseLibrary.ts
export interface ExerciseDefinition {
  id: string;
  name: string;
  category: string;
}

export const EXERCISE_CATEGORIES = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
] as const;

export const EXERCISE_LIBRARY: ExerciseDefinition[] = [
  // Chest
  { id: 'bench-press-barbell', name: 'Bench Press (Barbell)', category: 'Chest' },
  { id: 'bench-press-dumbbell', name: 'Bench Press (Dumbbell)', category: 'Chest' },
  { id: 'incline-bench-press', name: 'Incline Bench Press', category: 'Chest' },
  { id: 'decline-bench-press', name: 'Decline Bench Press', category: 'Chest' },
  { id: 'chest-fly', name: 'Chest Fly', category: 'Chest' },
  { id: 'push-ups', name: 'Push-ups', category: 'Chest' },
  { id: 'cable-crossover', name: 'Cable Crossover', category: 'Chest' },

  // Back
  { id: 'deadlift-barbell', name: 'Deadlift (Barbell)', category: 'Back' },
  { id: 'bent-over-row', name: 'Bent Over Row', category: 'Back' },
  { id: 'pull-ups', name: 'Pull-ups', category: 'Back' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'Back' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', category: 'Back' },
  { id: 't-bar-row', name: 'T-Bar Row', category: 'Back' },
  { id: 'face-pulls', name: 'Face Pulls', category: 'Back' },

  // Legs
  { id: 'squat-barbell', name: 'Squat (Barbell)', category: 'Legs' },
  { id: 'leg-press', name: 'Leg Press', category: 'Legs' },
  { id: 'leg-extension', name: 'Leg Extension', category: 'Legs' },
  { id: 'leg-curl', name: 'Leg Curl', category: 'Legs' },
  { id: 'lunges', name: 'Lunges', category: 'Legs' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'Legs' },
  { id: 'calf-raises', name: 'Calf Raises', category: 'Legs' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'Legs' },

  // Shoulders
  { id: 'overhead-press', name: 'Overhead Press (Barbell)', category: 'Shoulders' },
  { id: 'shoulder-press-dumbbell', name: 'Shoulder Press (Dumbbell)', category: 'Shoulders' },
  { id: 'lateral-raises', name: 'Lateral Raises', category: 'Shoulders' },
  { id: 'front-raises', name: 'Front Raises', category: 'Shoulders' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', category: 'Shoulders' },
  { id: 'arnold-press', name: 'Arnold Press', category: 'Shoulders' },
  { id: 'shrugs', name: 'Shrugs', category: 'Shoulders' },

  // Arms
  { id: 'bicep-curl-barbell', name: 'Bicep Curl (Barbell)', category: 'Arms' },
  { id: 'bicep-curl-dumbbell', name: 'Bicep Curl (Dumbbell)', category: 'Arms' },
  { id: 'hammer-curl', name: 'Hammer Curl', category: 'Arms' },
  { id: 'preacher-curl', name: 'Preacher Curl', category: 'Arms' },
  { id: 'tricep-dips', name: 'Tricep Dips', category: 'Arms' },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'Arms' },
  { id: 'overhead-tricep-extension', name: 'Overhead Tricep Extension', category: 'Arms' },
  { id: 'skull-crushers', name: 'Skull Crushers', category: 'Arms' },

  // Core
  { id: 'planks', name: 'Planks', category: 'Core' },
  { id: 'crunches', name: 'Crunches', category: 'Core' },
  { id: 'russian-twists', name: 'Russian Twists', category: 'Core' },
  { id: 'leg-raises', name: 'Leg Raises', category: 'Core' },
  { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', category: 'Core' },
  { id: 'cable-crunch', name: 'Cable Crunch', category: 'Core' },

  // Full Body
  { id: 'burpees', name: 'Burpees', category: 'Full Body' },
  { id: 'kettlebell-swings', name: 'Kettlebell Swings', category: 'Full Body' },
  { id: 'clean-and-press', name: 'Clean and Press', category: 'Full Body' },
  { id: 'thrusters', name: 'Thrusters', category: 'Full Body' },
];

// Helper function to get exercises by category
export const getExercisesByCategory = (category: string): ExerciseDefinition[] => {
  return EXERCISE_LIBRARY.filter(exercise => exercise.category === category);
};

// Helper function to get all categories with exercises
export const getGroupedExercises = (): Record<string, ExerciseDefinition[]> => {
  const grouped: Record<string, ExerciseDefinition[]> = {};

  EXERCISE_CATEGORIES.forEach(category => {
    grouped[category] = getExercisesByCategory(category);
  });

  return grouped;
};
