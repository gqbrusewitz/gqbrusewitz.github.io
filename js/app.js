// js/app.js
import {
  db,
  loadDB,
  saveDB,
  createWorkoutFromForm,
  calculateSummary,
  updateSettings,
  exportJSON,
  importJSON,
  exportCSV,
  importCSV,
  computePRs
} from "./storage.js";
import { initTimers, getWorkoutTimes, resetWorkoutTimes } from "./timer.js";
import { initTheme } from "./theme.js";
import { renderCharts } from "./charts.js";

document.addEventListener("DOMContentLoaded", () => {
  loadDB();

  const themeToggleBtn = document.getElementById("theme-toggle");
  initTheme(themeToggleBtn);

  initTabs();
  initLogTab();
  initHistoryTab();
  initSettingsTab();
  updateHistoryList();
  updateAnalyticsUI();
});

/* -----------------------------------
   Tabs (Log / History / Analytics / Settings)
------------------------------------ */
function initTabs() {
  const buttons = document.querySelectorAll(".tab-button");
  const tabs = document.querySelectorAll(".tab");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      buttons.forEach(b => b.classList.toggle("active", b === btn));
      tabs.forEach(section => {
        section.classList.toggle("active", section.id === `tab-${tab}`);
      });

      if (tab === "history") {
        updateHistoryList();
      } else if (tab === "analytics") {
        updateAnalyticsUI();
      }
    });
  });
}

/* -----------------------------------
   Log tab (today's workout)
------------------------------------ */

let currentExercises = [];
let templateSelectEl = null;

function initLogTab() {
  const dateInput = document.getElementById("workout-date");
  const notesInput = document.getElementById("workout-notes");
  const exerciseList = document.getElementById("exercise-list");
  const addExerciseBtn = document.getElementById("add-exercise");
  const saveWorkoutBtn = document.getElementById("save-workout");
  templateSelectEl = document.getElementById("template-select");
  const importTemplateBtn = document.getElementById("import-template");
  const importTemplateFileBtn = document.getElementById("import-template-file-btn");
  const templateFileInput = document.getElementById("template-file-input");

  const summarySets = document.getElementById("summary-sets");
  const summaryReps = document.getElementById("summary-reps");
  const summaryVolume = document.getElementById("summary-volume");

  const restInput = document.getElementById("rest-seconds");
  const restDisplay = document.getElementById("rest-display");
  const startRestBtn = document.getElementById("start-rest");

  const startWorkoutBtn = document.getElementById("start-workout");
  const endWorkoutBtn = document.getElementById("end-workout");
  const durationDisplay = document.getElementById("workout-duration");

  // default date: today
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;

  restInput.value = db.settings.defaultRestSeconds ?? 60;

  // Add exercise
  addExerciseBtn.addEventListener("click", () => {
    const ex = {
      name: "",
      muscleGroup: "",
      location: "home", // "home" or "gym"
      sets: [
        { reps: "", weight: "", rpe: "", custom: "" }
      ]
    };
    currentExercises.push(ex);
    renderExerciseList(exerciseList, summarySets, summaryReps, summaryVolume);
  });

  if (importTemplateBtn) {
    importTemplateBtn.addEventListener("click", () => {
      if (!templateSelectEl) return;
      const workoutId = templateSelectEl.value;
      if (!workoutId) {
        alert("Select a saved workout to import as a template.");
        return;
      }
      const workout = db.workouts.find(w => w.id === workoutId);
      if (!workout) {
        alert("Workout template not found.");
        return;
      }
      currentExercises = cloneExercises(workout.exercises);
      renderExerciseList(exerciseList, summarySets, summaryReps, summaryVolume);
    });
  }

  if (importTemplateFileBtn && templateFileInput) {
    importTemplateFileBtn.addEventListener("click", () => {
      templateFileInput.click();
    });

    templateFileInput.addEventListener("change", async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const templateData = JSON.parse(text);
        const exercises = extractExercisesFromTemplate(templateData);
        if (!exercises) {
          throw new Error("Invalid template format");
        }
        currentExercises = cloneExercises(exercises);
        renderExerciseList(exerciseList, summarySets, summaryReps, summaryVolume);
        applyTemplateMetadata(templateData, notesInput);
        alert("Template imported from file.");
      } catch (err) {
        console.error("Failed to import template", err);
        alert("Unable to import that template file. Please make sure it is valid JSON.");
      } finally {
        templateFileInput.value = "";
      }
    });
  }

  // Save workout
  saveWorkoutBtn.addEventListener("click", () => {
    const { startTime, endTime } = getWorkoutTimes();
    const formData = {
      date: dateInput.value || today,
      notes: notesInput.value || "",
      exercises: currentExercises,
      startTime,
      endTime
    };

    const summary = calculateSummary(currentExercises, startTime, endTime);
    const workout = createWorkoutFromForm(formData);
    workout.summary = summary;
    saveDB();

    // reset UI
    currentExercises = [];
    notesInput.value = "";
    renderExerciseList(exerciseList, summarySets, summaryReps, summaryVolume);
    refreshTemplateSelectOptions();
    if (templateSelectEl) templateSelectEl.value = "";
    resetWorkoutTimes();
    durationDisplay.textContent = "Duration: 0:00";

    updateHistoryList();
    updateAnalyticsUI();
    alert("Workout saved!");
  });

  // Initialize timers
  initTimers({
    restInput,
    restDisplay,
    startRestButton: startRestBtn,
    startWorkoutButton: startWorkoutBtn,
    endWorkoutButton: endWorkoutBtn,
    workoutDurationDisplay: durationDisplay,
    onWorkoutStart: () => {},
    onWorkoutEnd: () => {}
  });

  // initial blank list
  renderExerciseList(exerciseList, summarySets, summaryReps, summaryVolume);
  refreshTemplateSelectOptions();
}

/* -----------------------------------
   Render exercise list in Log tab
------------------------------------ */
function renderExerciseList(container, summarySetsEl, summaryRepsEl, summaryVolumeEl) {
  container.innerHTML = "";

  currentExercises.forEach((ex, exIndex) => {
    const card = document.createElement("div");
    card.className = "exercise-card";

    // Header: name + delete exercise
    const header = document.createElement("div");
    header.className = "exercise-header";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Exercise name (e.g., Squat)";
    nameInput.value = ex.name;
    nameInput.addEventListener("input", () => {
      ex.name = nameInput.value;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-secondary";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      currentExercises.splice(exIndex, 1);
      renderExerciseList(container, summarySetsEl, summaryRepsEl, summaryVolumeEl);
    });

    header.appendChild(nameInput);
    header.appendChild(deleteBtn);

    // Muscle group
    const muscleInputRow = document.createElement("div");
    muscleInputRow.className = "field-row";

    const label = document.createElement("label");
    label.textContent = "Muscle group (optional)";

    const muscleInput = document.createElement("input");
    muscleInput.type = "text";
    muscleInput.placeholder = "e.g., Legs, Back, Chest";
    muscleInput.value = ex.muscleGroup;
    muscleInput.addEventListener("input", () => {
      ex.muscleGroup = muscleInput.value;
    });

    muscleInputRow.appendChild(label);
    muscleInputRow.appendChild(muscleInput);

    // Location row: home / gym
    const locRow = document.createElement("div");
    locRow.className = "field-row";

    const locLabel = document.createElement("label");
    locLabel.textContent = "Location";

    const locSelect = document.createElement("select");
    ["home", "gym"].forEach(opt => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt === "home" ? "Home" : "Gym";
      if ((ex.location || "home") === opt) o.selected = true;
      locSelect.appendChild(o);
    });
    locSelect.addEventListener("change", () => {
      ex.location = locSelect.value;
    });

    locRow.appendChild(locLabel);
    locRow.appendChild(locSelect);

    // Sets container
    const setsContainer = document.createElement("div");

    (ex.sets || []).forEach((set, setIndex) => {
      const row = document.createElement("div");
      row.className = "set-row";

      // reps
      const repsInput = document.createElement("input");
      repsInput.type = "number";
      repsInput.min = "0";
      repsInput.placeholder = "Reps";
      repsInput.value = set.reps;
      repsInput.addEventListener("input", () => {
        set.reps = repsInput.value;
        updateSummary(summarySetsEl, summaryRepsEl, summaryVolumeEl);
      });

      // weight
      const weightInput = document.createElement("input");
      weightInput.type = "number";
      weightInput.min = "0";
      weightInput.placeholder = "Weight";
      weightInput.value = set.weight;
      weightInput.addEventListener("input", () => {
        set.weight = weightInput.value;
        updateSummary(summarySetsEl, summaryRepsEl, summaryVolumeEl);
      });

      // RPE
      const rpeInput = document.createElement("input");
      rpeInput.type = "number";
      rpeInput.min = "1";
      rpeInput.max = "10";
      rpeInput.placeholder = "RPE";
      rpeInput.value = set.rpe || "";
      rpeInput.addEventListener("input", () => {
        set.rpe = rpeInput.value;
      });

      // Custom notes
      const customInput = document.createElement("input");
      customInput.type = "text";
      customInput.placeholder = "Notes (optional)";
      customInput.value = set.custom || "";
      customInput.addEventListener("input", () => {
        set.custom = customInput.value;
      });

      // delete set
      const removeSetBtn = document.createElement("button");
      removeSetBtn.className = "btn-secondary";
      removeSetBtn.textContent = "−";
      removeSetBtn.addEventListener("click", () => {
        ex.sets.splice(setIndex, 1);
        if (ex.sets.length === 0) {
          ex.sets.push({ reps: "", weight: "", rpe: "", custom: "" });
        }
        renderExerciseList(container, summarySetsEl, summaryRepsEl, summaryVolumeEl);
      });

      row.appendChild(repsInput);
      row.appendChild(weightInput);
      row.appendChild(rpeInput);
      row.appendChild(customInput);
      row.appendChild(removeSetBtn);

      setsContainer.appendChild(row);
    });

    const addSetBtn = document.createElement("button");
    addSetBtn.className = "btn-secondary";
    addSetBtn.textContent = "+ Add Set";
    addSetBtn.addEventListener("click", () => {
      ex.sets.push({ reps: "", weight: "", rpe: "", custom: "" });
      renderExerciseList(container, summarySetsEl, summaryRepsEl, summaryVolumeEl);
    });

    card.appendChild(header);
    card.appendChild(muscleInputRow);
    card.appendChild(locRow);
    card.appendChild(setsContainer);
    card.appendChild(addSetBtn);
    container.appendChild(card);
  });

  updateSummary(summarySetsEl, summaryRepsEl, summaryVolumeEl);
}

/* -----------------------------------
   Summary display for Log tab
------------------------------------ */
function updateSummary(summarySetsEl, summaryRepsEl, summaryVolumeEl) {
  const { totalSets, totalReps, totalVolume } = calculateSummary(currentExercises);
  summarySetsEl.textContent = totalSets;
  summaryRepsEl.textContent = totalReps;
  summaryVolumeEl.textContent = totalVolume;
}

function refreshTemplateSelectOptions() {
  if (!templateSelectEl) return;
  templateSelectEl.innerHTML = "";
  const hasWorkouts = db.workouts.length > 0;
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = hasWorkouts ? "Choose a saved workout" : "No saved workouts yet";
  templateSelectEl.appendChild(placeholder);
  templateSelectEl.disabled = !hasWorkouts;

  if (!hasWorkouts) {
    return;
  }

  const workouts = [...db.workouts].sort((a, b) => {
    const dateA = a.date || "";
    const dateB = b.date || "";
    return dateB.localeCompare(dateA);
  });

  workouts.forEach(w => {
    if (!w.id) return;
    const opt = document.createElement("option");
    const exerciseCount = (w.exercises || []).length;
    const dateLabel = w.date || "Undated";
    opt.value = w.id;
    opt.textContent = `${dateLabel} • ${exerciseCount} exercise${exerciseCount === 1 ? "" : "s"}`;
    templateSelectEl.appendChild(opt);
  });

  templateSelectEl.value = "";
}

function cloneExercises(exercises = []) {
  const safeValue = value => (value === undefined || value === null ? "" : String(value));
  return (exercises || []).map(ex => {
    const baseSets = Array.isArray(ex.sets) && ex.sets.length > 0
      ? ex.sets
      : [{ reps: "", weight: "", rpe: "", custom: "" }];

    const sets = baseSets.map(set => {
      const s = set || {};
      return {
        reps: safeValue(s.reps),
        weight: safeValue(s.weight),
        rpe: safeValue(s.rpe),
        custom: safeValue(s.custom)
      };
    });

    return {
      name: ex.name || "",
      muscleGroup: ex.muscleGroup || "",
      location: ex.location || "home",
      sets
    };
  });
}

function extractExercisesFromTemplate(template) {
  if (!template) return null;
  if (Array.isArray(template)) return template;
  if (typeof template === "object" && Array.isArray(template.exercises)) {
    return template.exercises;
  }
  return null;
}

function applyTemplateMetadata(template, notesInput) {
  if (!notesInput || !template || typeof template !== "object") return;
  const trimmed = value => typeof value === "string" ? value.trim() : "";
  const notes = trimmed(template.notes);
  if (notes) {
    notesInput.value = notes;
    return;
  }
  if (notesInput.value.trim()) return;
  const description = trimmed(template.description);
  if (description) {
    notesInput.value = description;
    return;
  }
  const title = trimmed(template.title);
  if (title) {
    notesInput.value = title;
  }
}

/* -----------------------------------
   History tab
------------------------------------ */
function initHistoryTab() {
  const searchInput = document.getElementById("history-search");
  const sortSelect = document.getElementById("history-sort");
  const exportCsvBtn = document.getElementById("export-csv");
  const importCsvInput = document.getElementById("import-csv");

  searchInput.addEventListener("input", updateHistoryList);
  sortSelect.addEventListener("change", updateHistoryList);

  exportCsvBtn.addEventListener("click", () => {
    const csv = exportCSV();
    downloadFile(csv, "workouts.csv", "text/csv");
  });

  importCsvInput.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    importCSV(text);
    updateHistoryList();
    updateAnalyticsUI();
    refreshTemplateSelectOptions();
    alert("CSV imported.");
    e.target.value = "";
  });
}

function updateHistoryList() {
  const list = document.getElementById("history-list");
  const searchInput = document.getElementById("history-search");
  const sortSelect = document.getElementById("history-sort");

  const query = (searchInput.value || "").trim().toLowerCase();
  const sortValue = sortSelect.value;

  let workouts = [...db.workouts];

  if (query) {
    workouts = workouts.filter(w =>
      (w.exercises || []).some(ex =>
        (ex.name || "").toLowerCase().includes(query)
      )
    );
  }

  workouts.sort((a, b) => {
    if (sortValue === "date-desc") {
      return (b.date || "").localeCompare(a.date || "");
    } else if (sortValue === "date-asc") {
      return (a.date || "").localeCompare(b.date || "");
    } else if (sortValue === "volume-desc") {
      return (b.summary?.totalVolume || 0) - (a.summary?.totalVolume || 0);
    } else if (sortValue === "volume-asc") {
      return (a.summary?.totalVolume || 0) - (b.summary?.totalVolume || 0);
    }
    return 0;
  });

  list.innerHTML = "";

  if (workouts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "history-meta";
    empty.textContent = "No workouts logged yet.";
    list.appendChild(empty);
    return;
  }

  workouts.forEach(w => {
    const item = document.createElement("div");
    item.className = "history-item";

    const date = w.date || "Unknown date";
    const volume = w.summary?.totalVolume || 0;
    const sets = w.summary?.totalSets || 0;
    const duration = w.summary?.durationSeconds || 0;
    const mins = Math.round(duration / 60);

    const meta = document.createElement("div");
    meta.className = "history-meta";
    meta.textContent = `${date} • Volume: ${volume} • Sets: ${sets} • Duration: ${mins} min`;

    const exer = document.createElement("div");
    exer.className = "history-exercises";

    const exerciseLines = (w.exercises || []).map(ex => {
      const locationLabel = ex.location === "gym" ? "gym" : "home";
      const setText = (ex.sets || [])
        .map(s => {
          const base = `${s.reps || 0}×${s.weight || 0}`;
          const rpePart = s.rpe ? ` @ RPE ${s.rpe}` : "";
          const customPart = s.custom ? ` (${s.custom})` : "";
          return base + rpePart + customPart;
        })
        .join("; ");
      return `${ex.name || "Unnamed"} (${locationLabel}) — ${setText}`;
    });

    exer.textContent = exerciseLines.join(" | ");

    item.appendChild(meta);
    item.appendChild(exer);

    if (w.notes) {
      const notes = document.createElement("div");
      notes.className = "history-meta";
      notes.textContent = `Notes: ${w.notes}`;
      item.appendChild(notes);
    }

    list.appendChild(item);
  });
}

/* -----------------------------------
   Settings tab
------------------------------------ */
function initSettingsTab() {
  const unitsSelect = document.getElementById("units-select");
  const defaultRestInput = document.getElementById("default-rest");
  const saveSettingsBtn = document.getElementById("save-settings");

  const exportJsonBtn = document.getElementById("export-json");
  const importJsonInput = document.getElementById("import-json");

  unitsSelect.value = db.settings.units || "lbs";
  defaultRestInput.value = db.settings.defaultRestSeconds ?? 60;

  saveSettingsBtn.addEventListener("click", () => {
    updateSettings({
      units: unitsSelect.value,
      defaultRestSeconds: Number(defaultRestInput.value || 60)
    });
    saveDB();
    alert("Settings saved.");
  });

  exportJsonBtn.addEventListener("click", () => {
    const data = exportJSON();
    downloadFile(data, "workouts-backup.json", "application/json");
  });

  importJsonInput.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    importJSON(text);
    updateHistoryList();
    updateAnalyticsUI();
    refreshTemplateSelectOptions();
    alert("Backup imported.");
    e.target.value = "";
  });
  const downloadSampleBtn = document.getElementById("download-sample-template");
  if (downloadSampleBtn) {
    downloadSampleBtn.addEventListener("click", () => {
      const sampleContent = JSON.stringify(SAMPLE_WORKOUT_TEMPLATE, null, 2);
      downloadFile(sampleContent, "sample-workout-template.json", "application/json");
    });
  }
}

/* -----------------------------------
   Analytics UI
------------------------------------ */
function updateAnalyticsUI() {
  renderCharts();

  const prListEl = document.getElementById("pr-list");
  const prs = computePRs();
  prListEl.innerHTML = "";
  if (prs.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No personal records yet. Log some workouts!";
    prListEl.appendChild(li);
    return;
  }

  prs.forEach(pr => {
    const li = document.createElement("li");
    li.textContent = `${pr.name}: ${pr.weight} × ${pr.reps} (Volume: ${pr.volume})`;
    prListEl.appendChild(li);
  });
}

const SAMPLE_WORKOUT_TEMPLATE = {
  title: "Full Body Primer (Sample)",
  description: "A balanced routine that hits the main movement patterns in about 45 minutes.",
  exercises: [
    {
      name: "Back Squat",
      muscleGroup: "Legs",
      location: "gym",
      sets: [
        { reps: 5, weight: 135, rpe: 7, custom: "Warm up" },
        { reps: 5, weight: 185, rpe: 8, custom: "Working" },
        { reps: 5, weight: 185, rpe: 8, custom: "Working" }
      ]
    },
    {
      name: "Bench Press",
      muscleGroup: "Chest",
      location: "gym",
      sets: [
        { reps: 8, weight: 135, rpe: 7, custom: "" },
        { reps: 8, weight: 145, rpe: 8, custom: "" },
        { reps: 8, weight: 145, rpe: 8, custom: "" }
      ]
    },
    {
      name: "Bent-Over Row",
      muscleGroup: "Back",
      location: "gym",
      sets: [
        { reps: 10, weight: 95, rpe: 7, custom: "" },
        { reps: 10, weight: 105, rpe: 8, custom: "" },
        { reps: 10, weight: 105, rpe: 8, custom: "" }
      ]
    },
    {
      name: "Plank",
      muscleGroup: "Core",
      location: "home",
      sets: [
        { reps: 60, weight: 0, rpe: "", custom: "seconds" },
        { reps: 60, weight: 0, rpe: "", custom: "seconds" },
        { reps: 60, weight: 0, rpe: "", custom: "seconds" }
      ]
    }
  ]
};

/* -----------------------------------
   Download helper
------------------------------------ */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
