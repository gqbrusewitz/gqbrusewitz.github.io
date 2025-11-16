// js/charts.js
import { db } from "./storage.js";

/*
  CHART TYPES:
  1. Weekly Volume Chart
  2. Workout Frequency Chart

  These charts update every time the analytics tab is opened.
*/

let volumeChart = null;
let frequencyChart = null;

/* -----------------------------------------------
   Main entry point for rendering all analytics
------------------------------------------------ */
export function renderCharts(options = {}) {
  const workouts = [...db.workouts];
  const metric = options.metric || "volume";
  const exerciseName = options.exerciseName || "all";

  renderWeeklyVolume(workouts, metric, exerciseName);
  renderWorkoutFrequency(workouts);
}

/* -----------------------------------------------
   Weekly Volume Chart
   - Uses workout.summary.totalVolume
   - Groups by week (YYYY-Wxx)
------------------------------------------------ */
function renderWeeklyVolume(workouts, metric, exerciseName) {
  const ctx = document.getElementById("volume-chart");
  const titleEl = document.getElementById("volume-chart-title");
  if (!ctx) return;

  // Group workouts by week key
  const weekly = {};

  workouts.forEach(w => {
    if (!w.date) return;
    const weekKey = getWeekKey(w.date);
    const total = getWorkoutMetric(w, metric, exerciseName);
    if (total === 0) return;
    weekly[weekKey] = (weekly[weekKey] || 0) + total;
  });

  const labels = Object.keys(weekly).sort();
  const data = labels.map(l => weekly[l]);

  const metricLabel = metric === "reps" ? "Reps" : "Volume";
  const exerciseLabel = exerciseName && exerciseName !== "all" ? ` - ${exerciseName}` : "";

  if (titleEl) {
    titleEl.textContent = `${metricLabel} per Week${exerciseLabel}`;
  }

  if (volumeChart) volumeChart.destroy();

  volumeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: `${metricLabel} per Week${exerciseLabel}`,
          data,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/* -----------------------------------------------
   Calculate total metric for a workout
------------------------------------------------ */
function getWorkoutMetric(workout, metric, exerciseName) {
  let total = 0;

  (workout.exercises || []).forEach(ex => {
    if (!matchesExercise(ex, exerciseName)) return;
    (ex.sets || []).forEach(set => {
      const reps = Number(set.reps || 0);
      const weight = Number(set.weight || 0);
      if (metric === "reps") {
        total += reps;
      } else {
        total += reps * weight;
      }
    });
  });

  return total;
}

function matchesExercise(exercise, exerciseName) {
  if (!exerciseName || exerciseName === "all") return true;
  return (exercise.name || "").trim().toLowerCase() === exerciseName.trim().toLowerCase();
}

/* -----------------------------------------------
   Workout Frequency Chart
   - Count workouts per week
------------------------------------------------ */
function renderWorkoutFrequency(workouts) {
  const ctx = document.getElementById("frequency-chart");
  if (!ctx) return;

  const weekly = {};

  workouts.forEach(w => {
    if (!w.date) return;
    const weekKey = getWeekKey(w.date);
    weekly[weekKey] = (weekly[weekKey] || 0) + 1;
  });

  const labels = Object.keys(weekly).sort();
  const data = labels.map(l => weekly[l]);

  if (frequencyChart) frequencyChart.destroy();

  frequencyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Workouts per Week",
          data,
          fill: false,
          borderWidth: 2,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

/* -----------------------------------------------
   Convert a date to a weekly key (YYYY-W##)
------------------------------------------------ */
function getWeekKey(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return "Unknown";

  const year = d.getFullYear();

  // ISO week (Monday = 1)
  const temp = new Date(d);
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 4 - (temp.getDay() || 7));

  const yearStart = new Date(temp.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((temp - yearStart) / 86400000 + 1) / 7);

  return `${year}-W${String(weekNo).padStart(2, "0")}`;
}
