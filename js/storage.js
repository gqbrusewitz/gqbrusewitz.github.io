// js/storage.js
export const db = {
  workouts: [],
  settings: {
    units: "lbs",
    defaultRestSeconds: 60,
  }
};

const STORAGE_KEY = "workoutDB_v1";

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
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.workouts) {
      db.workouts = parsed.workouts.map(w => ({
        ...w,
        name: (w.name || "").trim() || buildWorkoutName(w.date, w.exercises)
      }));
    }
    if (parsed.settings) db.settings = { ...db.settings, ...parsed.settings };
  } catch (e) {
    console.error("Failed to parse DB", e);
  }
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

  const summary = calculateSummary(exercises, startTime, endTime);

  const workout = {
    id,
    name: (name || "").trim() || buildWorkoutName(date, exercises),
    date,
    notes,
    exercises,
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
