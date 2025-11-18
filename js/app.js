// js/app.js
import {
  db,
  loadDB,
  saveDB,
  createWorkoutFromForm,
  calculateSummary,
  updateSettings,
  exportCSV,
  importCSV,
  getWorkoutName,
  computePRs,
  getAllTemplates,
  saveCustomTemplate,
  getExerciseLibrary,
  addExerciseToLibrary
} from "./storage.js";
import { initTimers, getWorkoutTimes, resetWorkoutTimes } from "./timer.js";
import { initTheme } from "./theme.js";
import { renderCharts } from "./charts.js";

document.addEventListener("DOMContentLoaded", () => {
  loadDB();

  const themeSelect = document.getElementById("theme-select");
  initTheme(themeSelect);

  initTabs();
  initLogTab();
  initLibraryTab();
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
let logUI = {};

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
  const templateNameInput = document.getElementById("template-name");
  const templateDescriptionInput = document.getElementById("template-description");
  const saveTemplateBtn = document.getElementById("save-template");

  const summarySets = document.getElementById("summary-sets");
  const summaryReps = document.getElementById("summary-reps");
  const summaryVolume = document.getElementById("summary-volume");

  const restInput = document.getElementById("rest-seconds");
  const restDisplay = document.getElementById("rest-display");
  const startRestBtn = document.getElementById("start-rest");

  const startWorkoutBtn = document.getElementById("start-workout");
  const endWorkoutBtn = document.getElementById("end-workout");
  const durationDisplay = document.getElementById("workout-duration");

  logUI = {
    exerciseList,
    summarySets,
    summaryReps,
    summaryVolume
  };

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
      notes: "",
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
      const selection = parseTemplateSelection(templateSelectEl.value);
      if (!selection?.id) {
        alert("Select a template or past workout to import.");
        return;
      }
      const exercises = resolveTemplateExercises(selection);
      if (!exercises) {
        alert("Template not found.");
        return;
      }
      currentExercises = cloneExercises(exercises);
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
        const exercises = parseExercisesFromCSV(text);
        if (!exercises) {
          throw new Error("Invalid template format");
        }
        currentExercises = cloneExercises(exercises);
        renderExerciseList(exerciseList, summarySets, summaryReps, summaryVolume);
        alert("Template imported from CSV.");
      } catch (err) {
        console.error("Failed to import template", err);
        alert("Unable to import that template file. Please make sure it is valid CSV.");
      } finally {
        templateFileInput.value = "";
      }
    });
  }

  if (saveTemplateBtn) {
    saveTemplateBtn.addEventListener("click", () => {
      const name = (templateNameInput?.value || "").trim();
      if (!name) {
        alert("Give your template a name first.");
        return;
      }
      const description = templateDescriptionInput?.value || "";
      saveCustomTemplate({ name, description, exercises: cloneExercises(currentExercises) });
      refreshTemplateSelectOptions();
      if (templateNameInput) templateNameInput.value = "";
      if (templateDescriptionInput) templateDescriptionInput.value = "";
      alert("Template saved. You can load it anytime from the picker.");
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
   Exercise Library tab
------------------------------------ */
function initLibraryTab() {
  const exerciseSearchInput = document.getElementById("exercise-search");
  const exerciseLibraryContainer = document.getElementById("exercise-library-list");
  const libraryNameInput = document.getElementById("custom-exercise-name");
  const libraryGroupInput = document.getElementById("custom-exercise-group");
  const libraryLocationSelect = document.getElementById("custom-exercise-location");
  const libraryNotesInput = document.getElementById("custom-exercise-notes");
  const addLibraryExerciseBtn = document.getElementById("add-exercise-library");

  initExerciseLibrary({
    searchInput: exerciseSearchInput,
    container: exerciseLibraryContainer,
    addButton: addLibraryExerciseBtn,
    nameInput: libraryNameInput,
    groupInput: libraryGroupInput,
    locationSelect: libraryLocationSelect,
    notesInput: libraryNotesInput,
    onAddToWorkout: exercise => {
      currentExercises.push({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        location: exercise.location || "home",
        notes: exercise.notes || "",
        sets: [{ reps: "", weight: "", rpe: "", custom: "" }]
      });
      const { exerciseList, summarySets, summaryReps, summaryVolume } = logUI;
      if (exerciseList) {
        renderExerciseList(
          exerciseList,
          summarySets,
          summaryReps,
          summaryVolume
        );
      }
    }
  });
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

    const notesRow = document.createElement("div");
    notesRow.className = "field-row";

    const notesLabel = document.createElement("label");
    notesLabel.textContent = "Notes / tutorial link (optional)";

    const notesInput = document.createElement("input");
    notesInput.type = "text";
    notesInput.placeholder = "Add cues, setup tips, or a video URL";
    notesInput.value = ex.notes || "";
    notesInput.addEventListener("input", () => {
      ex.notes = notesInput.value;
    });

    notesRow.appendChild(notesLabel);
    notesRow.appendChild(notesInput);

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
    card.appendChild(notesRow);
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
  const templates = getAllTemplates();
  const hasWorkouts = db.workouts.length > 0;
  const hasTemplates = templates.length > 0;
  const hasOptions = hasWorkouts || hasTemplates;

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = hasOptions ? "Choose a template or workout" : "No templates or workouts yet";
  templateSelectEl.appendChild(placeholder);
  templateSelectEl.disabled = !hasOptions;

  if (hasTemplates) {
    const templateGroup = document.createElement("optgroup");
    templateGroup.label = "Workout templates";
    templates.forEach(t => {
      const opt = document.createElement("option");
      const count = (t.exercises || []).length;
      opt.value = `template:${t.id}`;
      opt.textContent = `${t.name} • ${count} exercise${count === 1 ? "" : "s"}${t.description ? ` — ${t.description}` : ""}`;
      if (t.builtIn) opt.dataset.builtin = "true";
      templateGroup.appendChild(opt);
    });
    templateSelectEl.appendChild(templateGroup);
  }

  if (hasWorkouts) {
    const workoutsGroup = document.createElement("optgroup");
    workoutsGroup.label = "Past workouts";
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
      const workoutLabel = getWorkoutName(w);
      opt.value = `workout:${w.id}`;
      opt.textContent = `${workoutLabel} — ${dateLabel} • ${exerciseCount} exercise${exerciseCount === 1 ? "" : "s"}`;
      workoutsGroup.appendChild(opt);
    });
    templateSelectEl.appendChild(workoutsGroup);
  }

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
      notes: ex.notes || "",
      sets
    };
  });
}

function parseTemplateSelection(value) {
  if (!value || !value.includes(":")) return null;
  const [type, ...rest] = value.split(":");
  return { type, id: rest.join(":") };
}

function resolveTemplateExercises(selection) {
  if (!selection) return null;
  if (selection.type === "template") {
    const template = getAllTemplates().find(t => t.id === selection.id);
    return template ? template.exercises : null;
  }
  if (selection.type === "workout") {
    const workout = db.workouts.find(w => w.id === selection.id);
    return workout ? workout.exercises : null;
  }
  return null;
}

function parseExercisesFromCSV(text) {
  if (!text) return null;
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim());
  if (lines.length <= 1) return null;

  const header = lines[0].split(",").map(col => col.trim());
  const idx = name => header.indexOf(name);
  const exerciseIdx = idx("exerciseName");
  if (exerciseIdx === -1) return null;

  const workoutIdIdx = idx("id");
  let targetWorkoutId = null;

  const map = {
    muscleGroup: idx("muscleGroup"),
    exerciseLocation: idx("exerciseLocation"),
    exerciseNotes: idx("exerciseNotes"),
    setIndex: idx("setIndex"),
    reps: idx("reps"),
    weight: idx("weight"),
    setRPE: idx("setRPE"),
    setCustom: idx("setCustom")
  };

  const exercises = new Map();
  const getValue = (cols, key) => {
    const columnIndex = map[key];
    if (columnIndex === undefined || columnIndex < 0) return "";
    return (cols[columnIndex] || "").trim();
  };

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length === 1 && !cols[0].trim()) continue;

    if (workoutIdIdx >= 0) {
      const rowWorkoutId = (cols[workoutIdIdx] || "").trim();
      if (!targetWorkoutId && rowWorkoutId) {
        targetWorkoutId = rowWorkoutId;
      }
      if (targetWorkoutId && rowWorkoutId && rowWorkoutId !== targetWorkoutId) {
        continue;
      }
    }

    const name = (cols[exerciseIdx] || "").trim();
    if (!name) continue;

    let ex = exercises.get(name);
    if (!ex) {
      ex = {
        name,
        muscleGroup: getValue(cols, "muscleGroup"),
        location: normalizeLocation(getValue(cols, "exerciseLocation")),
        notes: getValue(cols, "exerciseNotes"),
        sets: []
      };
      exercises.set(name, ex);
    }

    const setIndexRaw = getValue(cols, "setIndex");
    const setIndex = setIndexRaw ? Number(setIndexRaw) : null;
    const hasValidIndex = Number.isFinite(setIndex);

    ex.sets.push({
      reps: getValue(cols, "reps"),
      weight: getValue(cols, "weight"),
      rpe: getValue(cols, "setRPE"),
      custom: getValue(cols, "setCustom"),
      _order: hasValidIndex ? setIndex : ex.sets.length
    });
  }

  const result = Array.from(exercises.values()).map(ex => {
    if (!ex.sets.length) {
      ex.sets.push({ reps: "", weight: "", rpe: "", custom: "" });
    }
    ex.sets.sort((a, b) => {
      const aOrder = typeof a._order === "number" ? a._order : 0;
      const bOrder = typeof b._order === "number" ? b._order : 0;
      return aOrder - bOrder;
    });
    ex.sets.forEach(set => delete set._order);
    if (!ex.location) ex.location = "home";
    return ex;
  });

  return result.length ? result : null;
}

function initExerciseLibrary({ searchInput, container, addButton, nameInput, groupInput, locationSelect, notesInput, onAddToWorkout }) {
  if (!container) return;

  const render = () => {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const library = getExerciseLibrary()
      .filter(ex => {
        if (!query) return true;
        return [ex.name, ex.muscleGroup, ex.notes]
          .some(val => (val || "").toLowerCase().includes(query));
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    container.innerHTML = "";
    if (library.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No exercises match your search yet.";
      container.appendChild(empty);
      return;
    }

    library.forEach(ex => {
      const item = document.createElement("div");
      item.className = "exercise-library-item";

      const header = document.createElement("div");
      header.className = "library-item-header";

      const title = document.createElement("div");
      title.className = "library-item-title";
      title.textContent = ex.name;

      const tags = document.createElement("div");
      tags.className = "library-tags";
      if (ex.muscleGroup) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = ex.muscleGroup;
        tags.appendChild(tag);
      }
      const locTag = document.createElement("span");
      locTag.className = "tag subtle";
      locTag.textContent = ex.location === "gym" ? "Gym" : "Home";
      tags.appendChild(locTag);

      header.appendChild(title);
      header.appendChild(tags);

      const notes = document.createElement("p");
      notes.className = "library-notes";
      notes.textContent = ex.notes || "Quick add to your workout.";

      const actions = document.createElement("div");
      actions.className = "library-actions";
      const addBtn = document.createElement("button");
      addBtn.className = "btn-secondary";
      addBtn.type = "button";
      addBtn.textContent = "Add to workout";
      addBtn.addEventListener("click", () => {
        onAddToWorkout?.(ex);
      });
      actions.appendChild(addBtn);

      item.appendChild(header);
      item.appendChild(notes);
      item.appendChild(actions);
      container.appendChild(item);
    });
  };

  if (searchInput) {
    searchInput.addEventListener("input", render);
  }

  if (addButton) {
    addButton.addEventListener("click", () => {
      const name = (nameInput?.value || "").trim();
      const muscleGroup = (groupInput?.value || "").trim();
      const location = locationSelect?.value || "home";
      const notes = (notesInput?.value || "").trim();
      if (!name) {
        alert("Please enter a name for the exercise.");
        return;
      }
      addExerciseToLibrary({ name, muscleGroup, location, notes });
      if (nameInput) nameInput.value = "";
      if (groupInput) groupInput.value = "";
      if (locationSelect) locationSelect.value = location;
      if (notesInput) notesInput.value = "";
      render();
      alert("Exercise added to your library.");
    });
  }

  render();
}

function normalizeLocation(value) {
  const normalized = (value || "").toLowerCase();
  if (normalized === "gym" || normalized === "home") return normalized;
  return "home";
}

function buildTemplateCSV(exercises = []) {
  const header = [
    "exerciseName",
    "muscleGroup",
    "exerciseLocation",
    "exerciseNotes",
    "setIndex",
    "reps",
    "weight",
    "setRPE",
    "setCustom"
  ];
  const rows = [header.join(",")];
  const safeValue = value => (value === undefined || value === null ? "" : String(value));

  exercises.forEach(ex => {
    const sets = Array.isArray(ex.sets) && ex.sets.length > 0
      ? ex.sets
      : [{ reps: "", weight: "", rpe: "", custom: "" }];

    sets.forEach((set, idx) => {
      const customValue = (set.custom ?? "").replace(/,/g, " ");
      const noteValue = (ex.notes ?? "").replace(/,/g, " ");
      rows.push([
        safeValue(ex.name),
        safeValue(ex.muscleGroup),
        safeValue(ex.location || "home"),
        safeValue(noteValue),
        idx + 1,
        safeValue(set.reps),
        safeValue(set.weight),
        safeValue(set.rpe),
        safeValue(customValue)
      ].join(","));
    });
  });

  return rows.join("\n");
}

function getSampleTemplateCSV() {
  const templates = getAllTemplates();
  const sampleExercises = templates.length ? templates[0].exercises : [];
  return buildTemplateCSV(sampleExercises);
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
    workouts = workouts.filter(w => {
      const nameMatch = getWorkoutName(w).toLowerCase().includes(query);
      const exerciseMatch = (w.exercises || []).some(ex =>
        (ex.name || "").toLowerCase().includes(query)
      );
      return nameMatch || exerciseMatch;
    });
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

    const titleRow = document.createElement("div");
    titleRow.className = "history-title";

    const title = document.createElement("div");
    title.className = "history-name";
    title.textContent = getWorkoutName(w);

    const actions = document.createElement("div");
    actions.className = "history-actions";

    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.className = "history-rename";
    renameBtn.textContent = "Rename";
    renameBtn.addEventListener("click", () => {
      const currentName = getWorkoutName(w);
      const newName = prompt("New name for this workout", currentName);
      if (newName === null) return;
      const trimmed = newName.trim();
      if (!trimmed) {
        alert("Workout name cannot be empty.");
        return;
      }
      w.name = trimmed;
      saveDB();
      updateHistoryList();
      refreshTemplateSelectOptions();
    });

    actions.appendChild(renameBtn);
    titleRow.appendChild(title);
    titleRow.appendChild(actions);
    item.appendChild(titleRow);

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
      const notePart = ex.notes ? ` — ${ex.notes}` : "";
      return `${ex.name || "Unnamed"} (${locationLabel}) — ${setText}${notePart}`;
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

  const exportBackupCsvBtn = document.getElementById("export-backup-csv");
  const importBackupCsvInput = document.getElementById("import-backup-csv");

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

  exportBackupCsvBtn.addEventListener("click", () => {
    const csv = exportCSV();
    downloadFile(csv, "workouts-backup.csv", "text/csv");
  });

  importBackupCsvInput.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    importCSV(text);
    updateHistoryList();
    updateAnalyticsUI();
    refreshTemplateSelectOptions();
    alert("Backup imported.");
    e.target.value = "";
  });
  const downloadSampleBtn = document.getElementById("download-sample-template");
  if (downloadSampleBtn) {
    downloadSampleBtn.addEventListener("click", () => {
      downloadFile(getSampleTemplateCSV(), "sample-workout-template.csv", "text/csv");
    });
  }
}

/* -----------------------------------
   Analytics UI
------------------------------------ */
function updateAnalyticsUI() {
  const metricSelect = document.getElementById("analytics-metric");
  const exerciseSelect = document.getElementById("analytics-exercise");

  if (metricSelect && !metricSelect.dataset.bound) {
    metricSelect.addEventListener("change", updateAnalyticsUI);
    metricSelect.dataset.bound = "true";
  }

  if (exerciseSelect && !exerciseSelect.dataset.bound) {
    exerciseSelect.addEventListener("change", updateAnalyticsUI);
    exerciseSelect.dataset.bound = "true";
  }

  const workouts = [...db.workouts];

  if (exerciseSelect) {
    const previousValue = exerciseSelect.value || "all";
    const exerciseNames = new Set();

    workouts.forEach(w => {
      (w.exercises || []).forEach(ex => {
        const name = (ex.name || "").trim();
        if (name) exerciseNames.add(name);
      });
    });

    const sortedNames = Array.from(exerciseNames).sort((a, b) => a.localeCompare(b));

    exerciseSelect.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All exercises";
    exerciseSelect.appendChild(allOption);

    sortedNames.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      exerciseSelect.appendChild(opt);
    });

    exerciseSelect.value = sortedNames.includes(previousValue) ? previousValue : "all";
  }

  const metric = metricSelect ? metricSelect.value : "volume";
  const exercise = exerciseSelect ? exerciseSelect.value : "all";

  renderCharts({ metric, exerciseName: exercise });

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
