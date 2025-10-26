// mockRoutines.tsx
// Helper to generate dates relative to today
const getDateDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const pastWorkouts = [
  {
    id: "1",
    name: "Upper Body Push",
    duration: "45min",
    date: getDateDaysAgo(1), // Yesterday
    exercises: [
      {
        name: "Bench Press (Barbell)",
        sets: [
          { setOrder: 1, weight: 45, reps: 8 },
          { setOrder: 2, weight: 45, reps: 10 },
          { setOrder: 3, weight: 45, reps: 12 }
        ]
      },
      {
        name: "Bicep Curl (Barbell)",
        sets: [
          { setOrder: 1, weight: 25, reps: 10 },
          { setOrder: 2, weight: 25, reps: 10 },
          { setOrder: 3, weight: 30, reps: 8 }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Leg Day",
    duration: "52min",
    date: getDateDaysAgo(3), // 3 Days Ago
    exercises: [
      {
        name: "Squat (Barbell)",
        sets: [
          { setOrder: 1, weight: 135, reps: 8 },
          { setOrder: 2, weight: 155, reps: 6 },
          { setOrder: 3, weight: 165, reps: 5 },
          { setOrder: 4, weight: 155, reps: 6 }
        ]
      },
      {
        name: "Leg Press",
        sets: [
          { setOrder: 1, weight: 180, reps: 12 },
          { setOrder: 2, weight: 200, reps: 10 },
          { setOrder: 3, weight: 220, reps: 8 }
        ]
      },
      {
        name: "Leg Curl",
        sets: [
          { setOrder: 1, weight: 60, reps: 12 },
          { setOrder: 2, weight: 70, reps: 10 },
          { setOrder: 3, weight: 70, reps: 10 }
        ]
      },
      {
        name: "Calf Raises",
        sets: [
          { setOrder: 1, weight: 100, reps: 15 },
          { setOrder: 2, weight: 120, reps: 12 },
          { setOrder: 3, weight: 120, reps: 12 }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Pull Day",
    duration: "48min",
    date: getDateDaysAgo(5), // 5 Days Ago
    exercises: [
      {
        name: "Deadlift (Barbell)",
        sets: [
          { setOrder: 1, weight: 135, reps: 8 },
          { setOrder: 2, weight: 185, reps: 5 },
          { setOrder: 3, weight: 205, reps: 3 },
          { setOrder: 4, weight: 185, reps: 5 }
        ]
      },
      {
        name: "Pull-ups",
        sets: [
          { setOrder: 1, weight: 0, reps: 10 },
          { setOrder: 2, weight: 0, reps: 8 },
          { setOrder: 3, weight: 0, reps: 7 }
        ]
      },
      {
        name: "Bent Over Row",
        sets: [
          { setOrder: 1, weight: 95, reps: 10 },
          { setOrder: 2, weight: 115, reps: 8 },
          { setOrder: 3, weight: 115, reps: 8 }
        ]
      },
      {
        name: "Bicep Curl (Barbell)",
        sets: [
          { setOrder: 1, weight: 40, reps: 12 },
          { setOrder: 2, weight: 50, reps: 10 },
          { setOrder: 3, weight: 50, reps: 8 }
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Core & Cardio",
    duration: "35min",
    date: getDateDaysAgo(7), // 7 Days Ago (1 Week Ago)
    exercises: [
      {
        name: "Planks",
        sets: [
          { setOrder: 1, weight: 0, reps: 60 },
          { setOrder: 2, weight: 0, reps: 60 },
          { setOrder: 3, weight: 0, reps: 45 }
        ]
      },
      {
        name: "Russian Twists",
        sets: [
          { setOrder: 1, weight: 25, reps: 30 },
          { setOrder: 2, weight: 25, reps: 30 },
          { setOrder: 3, weight: 25, reps: 25 }
        ]
      },
      {
        name: "Leg Raises",
        sets: [
          { setOrder: 1, weight: 0, reps: 15 },
          { setOrder: 2, weight: 0, reps: 12 },
          { setOrder: 3, weight: 0, reps: 10 }
        ]
      }
    ]
  },
  {
    id: "5",
    name: "Full Body Strength",
    duration: "1h 5min",
    date: getDateDaysAgo(10), // 10 Days Ago
    exercises: [
      {
        name: "Bench Press (Barbell)",
        sets: [
          { setOrder: 1, weight: 135, reps: 10 },
          { setOrder: 2, weight: 155, reps: 8 },
          { setOrder: 3, weight: 165, reps: 6 },
          { setOrder: 4, weight: 175, reps: 4 }
        ]
      },
      {
        name: "Deadlift (Barbell)",
        sets: [
          { setOrder: 1, weight: 185, reps: 8 },
          { setOrder: 2, weight: 205, reps: 6 },
          { setOrder: 3, weight: 225, reps: 4 }
        ]
      },
      {
        name: "Squat (Barbell)",
        sets: [
          { setOrder: 1, weight: 135, reps: 10 },
          { setOrder: 2, weight: 155, reps: 8 },
          { setOrder: 3, weight: 165, reps: 6 }
        ]
      },
      {
        name: "Overhead Press (Barbell)",
        sets: [
          { setOrder: 1, weight: 65, reps: 10 },
          { setOrder: 2, weight: 75, reps: 8 },
          { setOrder: 3, weight: 85, reps: 6 }
        ]
      },
      {
        name: "Bent Over Row",
        sets: [
          { setOrder: 1, weight: 95, reps: 10 },
          { setOrder: 2, weight: 115, reps: 8 },
          { setOrder: 3, weight: 125, reps: 6 }
        ]
      }
    ]
  }
];

export const armsOnly = [
  {
    id: "1",
    name: "Biceps Focus",
    duration: "40min",
    date: getDateDaysAgo(1),
    exercises: [
      {
        name: "Barbell Curl",
        sets: [
          { setOrder: 1, weight: 40, reps: 12 },
          { setOrder: 2, weight: 45, reps: 10 },
          { setOrder: 3, weight: 50, reps: 8 }
        ]
      },
      {
        name: "Incline Dumbbell Curl",
        sets: [
          { setOrder: 1, weight: 20, reps: 10 },
          { setOrder: 2, weight: 20, reps: 10 },
          { setOrder: 3, weight: 25, reps: 8 }
        ]
      },
      {
        name: "Hammer Curl",
        sets: [
          { setOrder: 1, weight: 25, reps: 12 },
          { setOrder: 2, weight: 25, reps: 10 },
          { setOrder: 3, weight: 30, reps: 8 }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Triceps Focus",
    duration: "42min",
    date: getDateDaysAgo(3),
    exercises: [
      {
        name: "Tricep Dips (Bodyweight)",
        sets: [
          { setOrder: 1, weight: 0, reps: 15 },
          { setOrder: 2, weight: 0, reps: 12 },
          { setOrder: 3, weight: 0, reps: 10 }
        ]
      },
      {
        name: "Overhead Tricep Extension (Dumbbell)",
        sets: [
          { setOrder: 1, weight: 30, reps: 12 },
          { setOrder: 2, weight: 35, reps: 10 },
          { setOrder: 3, weight: 35, reps: 8 }
        ]
      },
      {
        name: "Tricep Pushdown (Cable)",
        sets: [
          { setOrder: 1, weight: 40, reps: 12 },
          { setOrder: 2, weight: 45, reps: 10 },
          { setOrder: 3, weight: 50, reps: 8 }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Arms Superset Day",
    duration: "50min",
    date: getDateDaysAgo(5),
    exercises: [
      {
        name: "Close-Grip Bench Press",
        sets: [
          { setOrder: 1, weight: 95, reps: 10 },
          { setOrder: 2, weight: 105, reps: 8 },
          { setOrder: 3, weight: 115, reps: 6 }
        ]
      },
      {
        name: "Cable Curl",
        sets: [
          { setOrder: 1, weight: 35, reps: 12 },
          { setOrder: 2, weight: 40, reps: 10 },
          { setOrder: 3, weight: 45, reps: 8 }
        ]
      },
      {
        name: "Skull Crushers (EZ Bar)",
        sets: [
          { setOrder: 1, weight: 45, reps: 10 },
          { setOrder: 2, weight: 50, reps: 8 },
          { setOrder: 3, weight: 55, reps: 6 }
        ]
      },
      {
        name: "Concentration Curl",
        sets: [
          { setOrder: 1, weight: 20, reps: 12 },
          { setOrder: 2, weight: 25, reps: 10 },
          { setOrder: 3, weight: 25, reps: 8 }
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Pump & Burn",
    duration: "35min",
    date: getDateDaysAgo(7),
    exercises: [
      {
        name: "Preacher Curl (Machine)",
        sets: [
          { setOrder: 1, weight: 50, reps: 12 },
          { setOrder: 2, weight: 55, reps: 10 },
          { setOrder: 3, weight: 60, reps: 8 }
        ]
      },
      {
        name: "Rope Overhead Tricep Extension",
        sets: [
          { setOrder: 1, weight: 35, reps: 12 },
          { setOrder: 2, weight: 40, reps: 10 },
          { setOrder: 3, weight: 45, reps: 8 }
        ]
      },
      {
        name: "Reverse Curl (EZ Bar)",
        sets: [
          { setOrder: 1, weight: 30, reps: 12 },
          { setOrder: 2, weight: 35, reps: 10 },
          { setOrder: 3, weight: 35, reps: 8 }
        ]
      }
    ]
  }
];

export const legsOnly = [
  {
    id: "1",
    name: "Quad Dominant Day",
    duration: "50min",
    date: getDateDaysAgo(1),
    exercises: [
      {
        name: "Back Squat (Barbell)",
        sets: [
          { setOrder: 1, weight: 135, reps: 10 },
          { setOrder: 2, weight: 155, reps: 8 },
          { setOrder: 3, weight: 175, reps: 6 },
          { setOrder: 4, weight: 155, reps: 8 }
        ]
      },
      {
        name: "Leg Press (Machine)",
        sets: [
          { setOrder: 1, weight: 200, reps: 12 },
          { setOrder: 2, weight: 220, reps: 10 },
          { setOrder: 3, weight: 240, reps: 8 }
        ]
      },
      {
        name: "Walking Lunges (Dumbbell)",
        sets: [
          { setOrder: 1, weight: 30, reps: 20 },
          { setOrder: 2, weight: 35, reps: 16 },
          { setOrder: 3, weight: 35, reps: 16 }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Hamstring & Glutes",
    duration: "45min",
    date: getDateDaysAgo(3),
    exercises: [
      {
        name: "Romanian Deadlift (Dumbbell)",
        sets: [
          { setOrder: 1, weight: 60, reps: 10 },
          { setOrder: 2, weight: 70, reps: 8 },
          { setOrder: 3, weight: 70, reps: 8 }
        ]
      },
      {
        name: "Hip Thrust (Barbell)",
        sets: [
          { setOrder: 1, weight: 135, reps: 12 },
          { setOrder: 2, weight: 155, reps: 10 },
          { setOrder: 3, weight: 175, reps: 8 }
        ]
      },
      {
        name: "Leg Curl (Machine)",
        sets: [
          { setOrder: 1, weight: 60, reps: 12 },
          { setOrder: 2, weight: 70, reps: 10 },
          { setOrder: 3, weight: 75, reps: 8 }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Athletic Leg Power",
    duration: "55min",
    date: getDateDaysAgo(5),
    exercises: [
      {
        name: "Front Squat (Barbell)",
        sets: [
          { setOrder: 1, weight: 95, reps: 10 },
          { setOrder: 2, weight: 115, reps: 8 },
          { setOrder: 3, weight: 125, reps: 6 }
        ]
      },
      {
        name: "Bulgarian Split Squat (Dumbbell)",
        sets: [
          { setOrder: 1, weight: 25, reps: 10 },
          { setOrder: 2, weight: 30, reps: 8 },
          { setOrder: 3, weight: 30, reps: 8 }
        ]
      },
      {
        name: "Step-Ups (Weighted)",
        sets: [
          { setOrder: 1, weight: 25, reps: 12 },
          { setOrder: 2, weight: 25, reps: 10 },
          { setOrder: 3, weight: 30, reps: 8 }
        ]
      },
      {
        name: "Calf Raises (Standing)",
        sets: [
          { setOrder: 1, weight: 0, reps: 20 },
          { setOrder: 2, weight: 0, reps: 18 },
          { setOrder: 3, weight: 0, reps: 15 }
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Leg Endurance & Burnout",
    duration: "40min",
    date: getDateDaysAgo(7),
    exercises: [
      {
        name: "Goblet Squat",
        sets: [
          { setOrder: 1, weight: 40, reps: 15 },
          { setOrder: 2, weight: 45, reps: 12 },
          { setOrder: 3, weight: 50, reps: 10 }
        ]
      },
      {
        name: "Leg Extension (Machine)",
        sets: [
          { setOrder: 1, weight: 70, reps: 15 },
          { setOrder: 2, weight: 80, reps: 12 },
          { setOrder: 3, weight: 85, reps: 10 }
        ]
      },
      {
        name: "Seated Calf Raise (Machine)",
        sets: [
          { setOrder: 1, weight: 70, reps: 15 },
          { setOrder: 2, weight: 80, reps: 12 },
          { setOrder: 3, weight: 85, reps: 10 }
        ]
      }
    ]
  }
];
