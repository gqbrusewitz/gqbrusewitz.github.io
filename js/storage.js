// js/storage.js
export const db = {
  workouts: [],
  templates: [],
  exerciseLibrary: [],
  settings: {
    units: "lbs",
    defaultRestSeconds: 60,
    theme: "light",
  }
};

const STORAGE_KEY = "workoutDB_v1";

const DEFAULT_EXERCISES = [
  {
    id: "ex_back_squat",
    name: "Back Squat",
    muscleGroup: "Legs",
    location: "gym",
    notes: "Barbell squat focusing on bracing and depth.",
  },
  {
    id: "ex_front_squat",
    name: "Front Squat",
    muscleGroup: "Legs",
    location: "gym",
    notes: "Keep elbows tall to maintain an upright torso.",
  },
  {
    id: "ex_bench",
    name: "Bench Press",
    muscleGroup: "Chest",
    location: "gym",
    notes: "Squeeze shoulder blades; slow controlled descent.",
  },
  {
    id: "ex_pushup",
    name: "Push-Up",
    muscleGroup: "Chest",
    location: "home",
    notes: "Maintain a straight line from head to heels; use knees for a regression.",
  },
  {
    id: "ex_ohp",
    name: "Overhead Press",
    muscleGroup: "Shoulders",
    location: "home",
    notes: "Brace your core and press in a straight line overhead.",
  },
  {
    id: "ex_row",
    name: "Bent-Over Row",
    muscleGroup: "Back",
    location: "gym",
    notes: "Hinge at the hips and pull elbows toward the ribs.",
  },
  {
    id: "ex_pullup",
    name: "Pull-Up / Lat Pulldown",
    muscleGroup: "Back",
    location: "gym",
    notes: "Drive elbows down; use bands or lighter weight for assistance.",
  },
  {
    id: "ex_rdl",
    name: "Romanian Deadlift",
    muscleGroup: "Hamstrings",
    location: "gym",
    notes: "Soft knees, push hips back, keep lats tight.",
  },
  {
    id: "ex_deadlift",
    name: "Deadlift",
    muscleGroup: "Full Posterior",
    location: "gym",
    notes: "Set the lats, drive through the floor, and keep the bar close.",
  },
  {
    id: "ex_split_squat",
    name: "Bulgarian Split Squat",
    muscleGroup: "Legs",
    location: "home",
    notes: "Elevate back foot; keep front knee tracking over toes.",
  },
  {
    id: "ex_goblet",
    name: "Goblet Squat",
    muscleGroup: "Legs",
    location: "home",
    notes: "Hold the bell close to your chest and sit between your heels.",
  },
  {
    id: "ex_hip_thrust",
    name: "Hip Thrust",
    muscleGroup: "Glutes",
    location: "gym",
    notes: "Squeeze glutes at the top; keep shins vertical.",
  },
  {
    id: "ex_floor_press",
    name: "Dumbbell Floor Press",
    muscleGroup: "Chest",
    location: "home",
    notes: "Pause elbows on the floor for stability and control.",
  },
  {
    id: "ex_single_arm_row",
    name: "Single-Arm Row",
    muscleGroup: "Back",
    location: "home",
    notes: "Brace with the opposite hand on a bench or chair.",
  },
  {
    id: "ex_carry",
    name: "Farmer's Carry",
    muscleGroup: "Grip & Core",
    location: "gym",
    notes: "Walk tall with braced core and controlled steps.",
  },
  {
    id: "ex_plank",
    name: "Plank",
    muscleGroup: "Core",
    location: "home",
    notes: "Hold a straight line; squeeze glutes and abs.",
  },
  {
    id: "ex_hollow",
    name: "Hollow Body Hold",
    muscleGroup: "Core",
    location: "home",
    notes: "Lower back stays pressed to the floor; scale by tucking knees.",
  },
  {
    id: "ex_interval",
    name: "Bike / Rower Intervals",
    muscleGroup: "Conditioning",
    location: "gym",
    notes: "1-2 minute pushes followed by equal or longer rest.",
  },
  {
    id: "ex_walk",
    name: "Brisk Walk",
    muscleGroup: "Conditioning",
    location: "home",
    notes: "10-20 minute brisk walk between strength work.",
  },
];

const DEFAULT_TEMPLATES = [
  {
    id: "tpl_full_body_foundation",
    name: "Full Body Foundation",
    description: "Classic strength day hitting all major movements.",
    exercises: [
      {
        name: "Back Squat",
        muscleGroup: "Legs",
        location: "gym",
        notes: "Build to a challenging set of 5.",
        sets: [
          { reps: 8, weight: 95, rpe: 6, custom: "" },
          { reps: 5, weight: 135, rpe: 7, custom: "" },
          { reps: 5, weight: 155, rpe: 8, custom: "" }
        ]
      },
      {
        name: "Bench Press",
        muscleGroup: "Chest",
        location: "gym",
        notes: "Controlled tempo; pause briefly on the chest.",
        sets: [
          { reps: 8, weight: 115, rpe: 7, custom: "" },
          { reps: 8, weight: 125, rpe: 8, custom: "" },
          { reps: 8, weight: 125, rpe: 8, custom: "" }
        ]
      },
      {
        name: "Bent-Over Row",
        muscleGroup: "Back",
        location: "gym",
        notes: "Pull elbows to ribs and pause for control.",
        sets: [
          { reps: 10, weight: 95, rpe: 7, custom: "" },
          { reps: 10, weight: 105, rpe: 8, custom: "" },
          { reps: 10, weight: 105, rpe: 8, custom: "" }
        ]
      },
      {
        name: "Overhead Press",
        muscleGroup: "Shoulders",
        location: "home",
        notes: "Keep ribs down and brace.",
        sets: [
          { reps: 10, weight: 65, rpe: 7, custom: "" },
          { reps: 10, weight: 70, rpe: 8, custom: "" },
          { reps: 10, weight: 70, rpe: 8, custom: "" }
        ]
      },
      {
        name: "Plank",
        muscleGroup: "Core",
        location: "home",
        notes: "Hold for quality tension.",
        sets: [
          { reps: 60, weight: 0, rpe: "", custom: "seconds" },
          { reps: 60, weight: 0, rpe: "", custom: "seconds" },
          { reps: 60, weight: 0, rpe: "", custom: "seconds" }
        ]
      }
    ]
  },
  {
    id: "tpl_upper_push",
    name: "Upper Body Push",
    description: "Pressing focused day with chest, shoulders, and triceps.",
    exercises: [
      {
        name: "Bench Press",
        muscleGroup: "Chest",
        location: "gym",
        notes: "Ramp to 3 challenging sets of 8.",
        sets: [
          { reps: 10, weight: 95, rpe: 6, custom: "" },
          { reps: 8, weight: 125, rpe: 7, custom: "" },
          { reps: 8, weight: 135, rpe: 8, custom: "" }
        ]
      },
      {
        name: "Overhead Press",
        muscleGroup: "Shoulders",
        location: "home",
        notes: "Perform strict reps; no leg drive.",
        sets: [
          { reps: 10, weight: 55, rpe: 6, custom: "" },
          { reps: 10, weight: 65, rpe: 7, custom: "" },
          { reps: 10, weight: 70, rpe: 8, custom: "" }
        ]
      },
      {
        name: "Push-Up",
        muscleGroup: "Chest",
        location: "home",
        notes: "Elevate hands or add weight to match difficulty.",
        sets: [
          { reps: 15, weight: 0, rpe: "", custom: "" },
          { reps: 15, weight: 0, rpe: "", custom: "" },
          { reps: 15, weight: 0, rpe: "", custom: "" }
        ]
      },
      {
        name: "Farmer's Carry",
        muscleGroup: "Grip & Core",
        location: "gym",
        notes: "Walk 40-60 yards per effort.",
        sets: [
          { reps: 60, weight: 35, rpe: "", custom: "seconds" },
          { reps: 60, weight: 35, rpe: "", custom: "seconds" }
        ]
      }
    ]
  },
  {
    id: "tpl_upper_pull",
    name: "Upper Body Pull",
    description: "Back and biceps emphasis with vertical and horizontal pulls.",
    exercises: [
      {
        name: "Bent-Over Row",
        muscleGroup: "Back",
        location: "gym",
        notes: "Add tempo for control.",
        sets: [
          { reps: 10, weight: 95, rpe: 7, custom: "" },
          { reps: 10, weight: 105, rpe: 8, custom: "" },
          { reps: 10, weight: 105, rpe: 8, custom: "" }
        ]
      },
      {
        name: "Pull-Up / Lat Pulldown",
        muscleGroup: "Back",
        location: "gym",
        notes: "Use bands or machine to stay in 6-10 rep range.",
        sets: [
          { reps: 8, weight: 0, rpe: 7, custom: "" },
          { reps: 8, weight: 0, rpe: 8, custom: "" },
          { reps: 8, weight: 0, rpe: 8, custom: "" }
        ]
      },
      {
        name: "Farmer's Carry",
        muscleGroup: "Grip & Core",
        location: "gym",
        notes: "Keep shoulders pulled down and back.",
        sets: [
          { reps: 45, weight: 40, rpe: "", custom: "seconds" },
          { reps: 45, weight: 40, rpe: "", custom: "seconds" }
        ]
      },
      {
        name: "Plank",
        muscleGroup: "Core",
        location: "home",
        notes: "Brace hard; squeeze glutes.",
        sets: [
          { reps: 45, weight: 0, rpe: "", custom: "seconds" },
          { reps: 45, weight: 0, rpe: "", custom: "seconds" }
        ]
      }
    ]
  },
  {
    id: "tpl_lower_strength",
    name: "Lower Body Strength",
    description: "Squat and hinge focused lower session.",
    exercises: [
      {
        name: "Front Squat",
        muscleGroup: "Legs",
        location: "gym",
        notes: "Use lighter load with upright torso.",
        sets: [
          { reps: 6, weight: 95, rpe: 6, custom: "" },
          { reps: 6, weight: 115, rpe: 7, custom: "" },
          { reps: 6, weight: 125, rpe: 8, custom: "" }
        ]
      },
      {
        name: "Romanian Deadlift",
        muscleGroup: "Hamstrings",
        location: "gym",
        notes: "Stretch hamstrings; avoid rounding.",
        sets: [
          { reps: 8, weight: 135, rpe: 7, custom: "" },
          { reps: 8, weight: 155, rpe: 8, custom: "" },
          { reps: 8, weight: 155, rpe: 8, custom: "" }
        ]
      },
      {
        name: "Bulgarian Split Squat",
        muscleGroup: "Legs",
        location: "home",
        notes: "Elevate back foot on bench or box.",
        sets: [
          { reps: 10, weight: 0, rpe: 7, custom: "per leg" },
          { reps: 10, weight: 0, rpe: 8, custom: "per leg" }
        ]
      },
      {
        name: "Plank",
        muscleGroup: "Core",
        location: "home",
        notes: "Keep ribs down.",
        sets: [
          { reps: 60, weight: 0, rpe: "", custom: "seconds" },
          { reps: 60, weight: 0, rpe: "", custom: "seconds" }
        ]
      }
    ]
  },
  {
    id: "tpl_home_dumbbell",
    name: "Home Dumbbell Circuit",
    description: "Minimal equipment template using one pair of dumbbells.",
    exercises: [
      {
        name: "Goblet Squat",
        muscleGroup: "Legs",
        location: "home",
        notes: "Hold bell close; keep chest tall.",
        sets: [
          { reps: 12, weight: 25, rpe: 7, custom: "" },
          { reps: 12, weight: 25, rpe: 7, custom: "" },
          { reps: 12, weight: 25, rpe: 7, custom: "" }
        ]
      },
      {
        name: "Dumbbell Floor Press",
        muscleGroup: "Chest",
        location: "home",
        notes: "Pause elbows on floor briefly each rep.",
        sets: [
          { reps: 12, weight: 25, rpe: 7, custom: "" },
          { reps: 12, weight: 25, rpe: 7, custom: "" },
          { reps: 12, weight: 25, rpe: 7, custom: "" }
        ]
      },
      {
        name: "Single-Arm Row",
        muscleGroup: "Back",
        location: "home",
        notes: "Brace with opposite hand on bench or chair.",
        sets: [
          { reps: 12, weight: 25, rpe: 7, custom: "per arm" },
          { reps: 12, weight: 25, rpe: 7, custom: "per arm" }
        ]
      },
      {
        name: "Hollow Body Hold",
        muscleGroup: "Core",
        location: "home",
        notes: "Tuck knees as needed to hold tension.",
        sets: [
          { reps: 30, weight: 0, rpe: "", custom: "seconds" },
          { reps: 30, weight: 0, rpe: "", custom: "seconds" }
        ]
      },
      {
        name: "Brisk Walk",
        muscleGroup: "Conditioning",
        location: "home",
        notes: "10 minute walk to finish.",
        sets: [
          { reps: 10, weight: 0, rpe: "", custom: "minutes" }
        ]
      }
    ]
  },
  {
    id: "tpl_conditioning_core",
    name: "Conditioning + Core",
    description: "Intervals with simple core finishers.",
    exercises: [
      {
        name: "Bike / Rower Intervals",
        muscleGroup: "Conditioning",
        location: "gym",
        notes: "5-8 rounds: 1 minute hard, 1-2 minutes easy.",
        sets: [
          { reps: 60, weight: 0, rpe: "", custom: "seconds on" },
          { reps: 90, weight: 0, rpe: "", custom: "seconds easy" },
          { reps: 60, weight: 0, rpe: "", custom: "seconds on" },
          { reps: 90, weight: 0, rpe: "", custom: "seconds easy" }
        ]
      },
      {
        name: "Plank",
        muscleGroup: "Core",
        location: "home",
        notes: "Two quality holds between intervals.",
        sets: [
          { reps: 45, weight: 0, rpe: "", custom: "seconds" },
          { reps: 45, weight: 0, rpe: "", custom: "seconds" }
        ]
      },
      {
        name: "Hollow Body Hold",
        muscleGroup: "Core",
        location: "home",
        notes: "Finish with controlled hollow holds.",
        sets: [
          { reps: 30, weight: 0, rpe: "", custom: "seconds" },
          { reps: 30, weight: 0, rpe: "", custom: "seconds" }
        ]
      }
    ]
  }
];

function buildWorkoutName(date, exercises = []) {
  const dateLabel = date || new Date().toISOString().split("T")[0];
  const firstNamedExercise = (exercises || []).find(ex => (ex.name || "").trim());
  if (firstNamedExercise) {
    return `${firstNamedExercise.name.trim()} (${dateLabel})`;
  }
  return `Workout ${dateLabel}`;
}

export function getWorkoutName(workout) {
  if (!workout) return "Workout";
  return (workout.name || "").trim() || buildWorkoutName(workout.date, workout.exercises);
}

/* -----------------------------
   Load/save database
------------------------------ */
export function loadDB() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.workouts) {
        db.workouts = parsed.workouts.map(w => ({
          ...w,
          name: (w.name || "").trim() || buildWorkoutName(w.date, w.exercises)
        }));
      }
      if (Array.isArray(parsed.templates)) db.templates = parsed.templates.map(t => cloneTemplate(t));
      if (Array.isArray(parsed.exerciseLibrary)) db.exerciseLibrary = parsed.exerciseLibrary.map(ex => normalizeExercise(ex));
      if (parsed.settings) db.settings = { ...db.settings, ...parsed.settings };
    } catch (e) {
      console.error("Failed to parse DB", e);
    }
  }

  mergeDefaultLibrary();
}

export function saveDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/* -----------------------------
   Create a workout
------------------------------ */
export function createWorkoutFromForm(formData) {
  const now = new Date();
  const id = `w_${now.getTime()}`;
  const {
    name,
    date,
    notes,
    exercises,
    startTime,
    endTime
  } = formData;

  const normalizedExercises = (exercises || []).map(ex => normalizeExercise(ex));
  const summary = calculateSummary(normalizedExercises, startTime, endTime);

  const workout = {
    id,
    name: (name || "").trim() || buildWorkoutName(date, normalizedExercises),
    date,
    notes,
    exercises: normalizedExercises,
    startTime,
    endTime,
    summary
  };

  db.workouts.push(workout);
  saveDB();
  return workout;
}

/* -----------------------------
   Summary calculations
------------------------------ */
export function calculateSummary(exercises, startTime, endTime) {
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;

  (exercises || []).forEach(ex => {
    (ex.sets || []).forEach(s => {
      const reps = Number(s.reps || 0);
      const weight = Number(s.weight || 0);
      totalSets += 1;
      totalReps += reps;
      totalVolume += reps * weight;
    });
  });

  let durationSeconds = 0;
  if (startTime && endTime) {
    durationSeconds = Math.max(0, Math.round((endTime - startTime) / 1000));
  }

  return {
    totalSets,
    totalReps,
    totalVolume,
    durationSeconds
  };
}

/* -----------------------------
   Settings
------------------------------ */
export function updateSettings(partial) {
  db.settings = { ...db.settings, ...partial };
  saveDB();
}

/* -----------------------------
   Templates
------------------------------ */
export function getAllTemplates() {
  const builtIn = DEFAULT_TEMPLATES.map(t => cloneTemplate(t, true));
  const custom = (db.templates || []).map(t => cloneTemplate(t));
  return [...builtIn, ...custom];
}

export function saveCustomTemplate(template) {
  const now = Date.now();
  const existingIndex = db.templates.findIndex(t => t.id === template.id);
  const payload = {
    id: template.id || `tpl_${now}`,
    name: (template.name || "Untitled Template").trim(),
    description: (template.description || "").trim(),
    exercises: (template.exercises || []).map(ex => normalizeExercise(ex))
  };

  if (existingIndex >= 0) {
    db.templates[existingIndex] = payload;
  } else {
    db.templates.push(payload);
  }

  saveDB();
  return payload;
}

/* -----------------------------
   Exercise Library
------------------------------ */
export function getExerciseLibrary() {
  return db.exerciseLibrary.map(ex => cloneExercise(ex));
}

export function addExerciseToLibrary(entry) {
  const now = Date.now();
  const normalized = {
    id: entry.id || `lib_${now}`,
    name: (entry.name || "").trim(),
    muscleGroup: (entry.muscleGroup || "").trim(),
    location: normalizeLocation(entry.location),
    notes: (entry.notes || "").trim(),
  };

  if (!normalized.name) return null;

  const existingIndex = db.exerciseLibrary.findIndex(ex => ex.name.toLowerCase() === normalized.name.toLowerCase());
  if (existingIndex >= 0) {
    db.exerciseLibrary[existingIndex] = { ...db.exerciseLibrary[existingIndex], ...normalized };
  } else {
    db.exerciseLibrary.push(normalized);
  }

  saveDB();
  return normalized;
}

/* -----------------------------
   CSV Export
------------------------------ */
export function exportCSV() {
  const rows = [];
  rows.push([
    "id",
    "date",
    "workoutName",
    "notes",
    "exerciseName",
    "muscleGroup",
    "exerciseLocation",
    "exerciseNotes",
    "setIndex",
    "reps",
    "weight",
    "setRPE",
    "setCustom",
    "totalSets",
    "totalReps",
    "totalVolume",
    "durationSeconds"
  ]);

  db.workouts.forEach(w => {
      (w.exercises || []).forEach(ex => {
        (ex.sets || []).forEach((s, i) => {
          rows.push([
            w.id,
            w.date,
            (getWorkoutName(w) || "").replace(/\n/g, " ").replace(/,/g, " "),
            (w.notes || "").replace(/\n/g, " "),
            ex.name,
            ex.muscleGroup || "",
            ex.location || "home",
            ex.notes ? ex.notes.replace(/\n/g, " ") : "",
            i + 1,
            s.reps,
            s.weight,
            s.rpe || "",
            (s.custom || "").replace(/,/g, " "),
            w.summary?.totalSets ?? 0,
            w.summary?.totalReps ?? 0,
            w.summary?.totalVolume ?? 0,
            w.summary?.durationSeconds ?? 0
          ]);
      });
    });
  });

  return rows.map(r => r.join(",")).join("\n");
}

/* -----------------------------
   CSV Import
------------------------------ */
export function importCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length <= 1) return;
  const header = lines[0].split(",");

  const idx = name => header.indexOf(name);

  const map = {
    id: idx("id"),
    date: idx("date"),
    workoutName: idx("workoutName"),
    notes: idx("notes"),
    exerciseName: idx("exerciseName"),
    muscleGroup: idx("muscleGroup"),
    exerciseLocation: idx("exerciseLocation"),
    exerciseNotes: idx("exerciseNotes"),
    setIndex: idx("setIndex"),
    reps: idx("reps"),
    weight: idx("weight"),
    setRPE: idx("setRPE"),
    setCustom: idx("setCustom"),
    totalSets: idx("totalSets"),
    totalReps: idx("totalReps"),
    totalVolume: idx("totalVolume"),
    durationSeconds: idx("durationSeconds")
  };

  const workoutsMap = new Map();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const wid = map.id >= 0 ? cols[map.id] : null;
    if (!wid) continue;

    if (!workoutsMap.has(wid)) {
      workoutsMap.set(wid, {
        id: wid,
        date: map.date >= 0 ? cols[map.date] : "",
        name: map.workoutName >= 0 ? cols[map.workoutName] : "",
        notes: map.notes >= 0 ? cols[map.notes] : "",
        exercises: [],
        startTime: null,
        endTime: null,
        summary: {
          totalSets: Number(map.totalSets >= 0 ? cols[map.totalSets] || 0 : 0),
          totalReps: Number(map.totalReps >= 0 ? cols[map.totalReps] || 0 : 0),
          totalVolume: Number(map.totalVolume >= 0 ? cols[map.totalVolume] || 0 : 0),
          durationSeconds: Number(map.durationSeconds >= 0 ? cols[map.durationSeconds] || 0 : 0)
        }
      });
    }

    const w = workoutsMap.get(wid);
    const exName = map.exerciseName >= 0 ? cols[map.exerciseName] : "";
    if (!exName) continue;

    let ex = w.exercises.find(e => e.name === exName);
    if (!ex) {
      ex = {
        name: exName,
        muscleGroup: map.muscleGroup >= 0 ? cols[map.muscleGroup] : "",
        location: map.exerciseLocation >= 0 ? (cols[map.exerciseLocation] || "home") : "home",
        notes: map.exerciseNotes >= 0 ? cols[map.exerciseNotes] || "" : "",
        sets: []
      };
      w.exercises.push(ex);
    }

    ex.sets.push({
      reps: Number(map.reps >= 0 ? cols[map.reps] || 0 : 0),
      weight: Number(map.weight >= 0 ? cols[map.weight] || 0 : 0),
      rpe: map.setRPE >= 0 ? cols[map.setRPE] || "" : "",
      custom: map.setCustom >= 0 ? cols[map.setCustom] || "" : ""
    });
  }

  workoutsMap.forEach(w => {
    w.name = (w.name || "").trim() || buildWorkoutName(w.date, w.exercises);
    w.exercises = (w.exercises || []).map(ex => normalizeExercise(ex));
    db.workouts.push(w);
  });
  saveDB();
}

/* -----------------------------
   Personal Records (heaviest set)
------------------------------ */
export function computePRs() {
  const prMap = new Map();

  db.workouts.forEach(w => {
    (w.exercises || []).forEach(ex => {
      (ex.sets || []).forEach(s => {
        const key = (ex.name || "").trim().toLowerCase();
        const weight = Number(s.weight || 0);
        const reps = Number(s.reps || 0);
        const volume = weight * reps;
        const existing = prMap.get(key);
        if (!existing || weight > existing.weight) {
          prMap.set(key, {
            name: ex.name,
            weight,
            reps,
            volume
          });
        }
      });
    });
  });

  return Array.from(prMap.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20);
}

function normalizeLocation(value) {
  const normalized = (value || "").toLowerCase();
  if (normalized === "gym" || normalized === "home") return normalized;
  return "home";
}

function normalizeExercise(exercise = {}) {
  const safeSets = Array.isArray(exercise.sets) && exercise.sets.length > 0
    ? exercise.sets
    : [{ reps: "", weight: "", rpe: "", custom: "" }];

  return {
    name: (exercise.name || "").trim(),
    muscleGroup: (exercise.muscleGroup || "").trim(),
    location: normalizeLocation(exercise.location),
    notes: (exercise.notes || "").trim(),
    sets: safeSets.map(set => ({
      reps: set.reps ?? "",
      weight: set.weight ?? "",
      rpe: set.rpe ?? "",
      custom: set.custom ?? "",
    }))
  };
}

function cloneExercise(exercise = {}) {
  return normalizeExercise({ ...exercise, sets: (exercise.sets || []).map(set => ({ ...set })) });
}

function mergeDefaultLibrary() {
  const existingNames = new Set(db.exerciseLibrary.map(ex => (ex.name || "").toLowerCase()));
  DEFAULT_EXERCISES.forEach(ex => {
    if (!existingNames.has(ex.name.toLowerCase())) {
      db.exerciseLibrary.push({ ...ex });
    }
  });
  db.exerciseLibrary = db.exerciseLibrary.map(ex => normalizeExercise(ex));
}

function cloneTemplate(template = {}, builtIn = false) {
  return {
    ...template,
    builtIn,
    exercises: (template.exercises || []).map(ex => cloneExercise(ex))
  };
}
