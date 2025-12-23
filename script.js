const STORAGE_KEYS = {
  workouts: "lift_workouts_v1",
  exercises: "lift_exercises_v1",
  settings: "lift_settings_v1",
  scenarios: "lift_scenarios_v1",
  tab: "lift_tab_v1",
};

const DEFAULT_EXERCISES = [
  // Upper Body - Chest
  { name: "Bench Press", category: "Upper" },
  { name: "Incline Bench Press", category: "Upper" },
  { name: "Decline Bench Press", category: "Upper" },
  { name: "Dumbbell Bench Press", category: "Upper" },
  { name: "Incline Dumbbell Bench", category: "Upper" },
  { name: "Dumbbell Flyes", category: "Upper" },
  { name: "Cable Flyes", category: "Upper" },
  { name: "Push-Ups", category: "Upper" },
  { name: "Chest Dips", category: "Upper" },
  { name: "Machine Chest Press", category: "Upper" },
  { name: "Pec Deck", category: "Upper" },

  // Upper Body - Shoulders
  { name: "Overhead Press", category: "Upper" },
  { name: "Dumbbell Shoulder Press", category: "Upper" },
  { name: "Arnold Press", category: "Upper" },
  { name: "Lateral Raises", category: "Upper" },
  { name: "Front Raises", category: "Upper" },
  { name: "Rear Delt Flyes", category: "Upper" },
  { name: "Face Pulls", category: "Upper" },
  { name: "Upright Row", category: "Upper" },
  { name: "Shrugs", category: "Upper" },

  // Back
  { name: "Pull-Up", category: "Back" },
  { name: "Chin-Up", category: "Back" },
  { name: "Lat Pulldown", category: "Back" },
  { name: "Barbell Row", category: "Back" },
  { name: "Dumbbell Row", category: "Back" },
  { name: "T-Bar Row", category: "Back" },
  { name: "Seated Cable Row", category: "Back" },
  { name: "Single-Arm Dumbbell Row", category: "Back" },
  { name: "Chest Supported Row", category: "Back" },
  { name: "Inverted Row", category: "Back" },
  { name: "Pendlay Row", category: "Back" },

  // Arms - Biceps
  { name: "Biceps Curl", category: "Arms" },
  { name: "Hammer Curl", category: "Arms" },
  { name: "Preacher Curl", category: "Arms" },
  { name: "Concentration Curl", category: "Arms" },
  { name: "Cable Curl", category: "Arms" },
  { name: "EZ-Bar Curl", category: "Arms" },
  { name: "Incline Dumbbell Curl", category: "Arms" },

  // Arms - Triceps
  { name: "Triceps Pushdown", category: "Arms" },
  { name: "Overhead Triceps Extension", category: "Arms" },
  { name: "Skull Crushers", category: "Arms" },
  { name: "Close-Grip Bench Press", category: "Arms" },
  { name: "Triceps Dips", category: "Arms" },
  { name: "Rope Triceps Extension", category: "Arms" },
  { name: "Diamond Push-Ups", category: "Arms" },

  // Lower Body - Quads
  { name: "Squat", category: "Lower" },
  { name: "Front Squat", category: "Lower" },
  { name: "Goblet Squat", category: "Lower" },
  { name: "Bulgarian Split Squat", category: "Lower" },
  { name: "Leg Press", category: "Lower" },
  { name: "Leg Extension", category: "Lower" },
  { name: "Hack Squat", category: "Lower" },
  { name: "Walking Lunges", category: "Lower" },
  { name: "Reverse Lunges", category: "Lower" },
  { name: "Step-Ups", category: "Lower" },

  // Posterior Chain & Glutes
  { name: "Deadlift", category: "Posterior" },
  { name: "Romanian Deadlift", category: "Posterior" },
  { name: "Sumo Deadlift", category: "Posterior" },
  { name: "Stiff-Leg Deadlift", category: "Posterior" },
  { name: "Good Mornings", category: "Posterior" },
  { name: "Leg Curl", category: "Posterior" },
  { name: "Nordic Curl", category: "Posterior" },
  { name: "Glute-Ham Raise", category: "Posterior" },
  { name: "Hip Thrust", category: "Glutes" },
  { name: "Barbell Glute Bridge", category: "Glutes" },
  { name: "Single-Leg Hip Thrust", category: "Glutes" },
  { name: "Cable Pull-Through", category: "Glutes" },
  { name: "Kickbacks", category: "Glutes" },
  { name: "Calf Raises", category: "Lower" },
  { name: "Seated Calf Raises", category: "Lower" },

  // Core
  { name: "Plank", category: "Core" },
  { name: "Side Plank", category: "Core" },
  { name: "Dead Bug", category: "Core" },
  { name: "Bird Dog", category: "Core" },
  { name: "Pallof Press", category: "Core" },
  { name: "Ab Wheel Rollout", category: "Core" },
  { name: "Hanging Leg Raise", category: "Core" },
  { name: "Hanging Knee Raise", category: "Core" },
  { name: "Cable Crunch", category: "Core" },
  { name: "Russian Twist", category: "Core" },
  { name: "Bicycle Crunches", category: "Core" },
  { name: "Mountain Climbers", category: "Core" },
  { name: "Hollow Body Hold", category: "Core" },
  { name: "L-Sit", category: "Core" },
  { name: "Dragon Flag", category: "Core" },
  { name: "Landmine Twist", category: "Core" },
  { name: "Woodchoppers", category: "Core" },
  { name: "Leg Raises", category: "Core" },
  { name: "V-Ups", category: "Core" },
  { name: "Crunches", category: "Core" },

  // Stretching & Yoga
  { name: "Downward Dog", category: "Stretching" },
  { name: "Child's Pose", category: "Stretching" },
  { name: "Cat-Cow Stretch", category: "Stretching" },
  { name: "Cobra Pose", category: "Stretching" },
  { name: "Pigeon Pose", category: "Stretching" },
  { name: "Seated Forward Fold", category: "Stretching" },
  { name: "Standing Forward Fold", category: "Stretching" },
  { name: "Hip Flexor Stretch", category: "Stretching" },
  { name: "Hamstring Stretch", category: "Stretching" },
  { name: "Quad Stretch", category: "Stretching" },
  { name: "Calf Stretch", category: "Stretching" },
  { name: "Butterfly Stretch", category: "Stretching" },
  { name: "Figure 4 Stretch", category: "Stretching" },
  { name: "Thread the Needle", category: "Stretching" },
  { name: "Spinal Twist", category: "Stretching" },
  { name: "Neck Rolls", category: "Stretching" },
  { name: "Shoulder Circles", category: "Stretching" },
  { name: "Arm Circles", category: "Stretching" },
  { name: "Wrist Circles", category: "Stretching" },
  { name: "Chest Opener Stretch", category: "Stretching" },
  { name: "Triceps Stretch", category: "Stretching" },
  { name: "Side Bend Stretch", category: "Stretching" },
  { name: "Warrior I", category: "Stretching" },
  { name: "Warrior II", category: "Stretching" },
  { name: "Triangle Pose", category: "Stretching" },
  { name: "Tree Pose", category: "Stretching" },
  { name: "Mountain Pose", category: "Stretching" },
  { name: "Bridge Pose", category: "Stretching" },
  { name: "Happy Baby Pose", category: "Stretching" },
  { name: "Legs Up the Wall", category: "Stretching" },

  // Olympic Lifts & Variations
  { name: "Clean", category: "Olympic" },
  { name: "Power Clean", category: "Olympic" },
  { name: "Hang Clean", category: "Olympic" },
  { name: "Snatch", category: "Olympic" },
  { name: "Power Snatch", category: "Olympic" },
  { name: "Hang Snatch", category: "Olympic" },
  { name: "Clean and Jerk", category: "Olympic" },
  { name: "Push Press", category: "Olympic" },
  { name: "Push Jerk", category: "Olympic" },
  { name: "Split Jerk", category: "Olympic" },
  { name: "Muscle Snatch", category: "Olympic" },
  { name: "Muscle Clean", category: "Olympic" },

  // Powerlifting Variations
  { name: "Box Squat", category: "Powerlifting" },
  { name: "Pause Squat", category: "Powerlifting" },
  { name: "Pause Bench Press", category: "Powerlifting" },
  { name: "Board Press", category: "Powerlifting" },
  { name: "Floor Press", category: "Powerlifting" },
  { name: "Pin Press", category: "Powerlifting" },
  { name: "Deficit Deadlift", category: "Powerlifting" },
  { name: "Pause Deadlift", category: "Powerlifting" },
  { name: "Block Pull", category: "Powerlifting" },
  { name: "Rack Pull", category: "Powerlifting" },
  { name: "Speed Squats", category: "Powerlifting" },
  { name: "Speed Bench", category: "Powerlifting" },
  { name: "Speed Deadlifts", category: "Powerlifting" },

  // Cardio & Conditioning
  { name: "Running", category: "Cardio" },
  { name: "Sprints", category: "Cardio" },
  { name: "Rowing", category: "Cardio" },
  { name: "Assault Bike", category: "Cardio" },
  { name: "Jump Rope", category: "Cardio" },
  { name: "Burpees", category: "Cardio" },
  { name: "Box Jumps", category: "Cardio" },
  { name: "Jumping Jacks", category: "Cardio" },
  { name: "High Knees", category: "Cardio" },
  { name: "Butt Kicks", category: "Cardio" },
  { name: "Battle Ropes", category: "Cardio" },
  { name: "Sled Push", category: "Cardio" },
  { name: "Sled Pull", category: "Cardio" },
  { name: "Prowler Push", category: "Cardio" },
  { name: "Farmer's Walk", category: "Cardio" },
  { name: "Stair Climber", category: "Cardio" },
  { name: "Elliptical", category: "Cardio" },
  { name: "Cycling", category: "Cardio" },
  { name: "Swimming", category: "Cardio" },

  // Bodyweight Exercises
  { name: "Handstand Push-Up", category: "Bodyweight" },
  { name: "Pistol Squat", category: "Bodyweight" },
  { name: "Archer Push-Up", category: "Bodyweight" },
  { name: "Pike Push-Up", category: "Bodyweight" },
  { name: "Decline Push-Up", category: "Bodyweight" },
  { name: "Wide Push-Up", category: "Bodyweight" },
  { name: "Clapping Push-Up", category: "Bodyweight" },
  { name: "Muscle-Up", category: "Bodyweight" },
  { name: "Front Lever", category: "Bodyweight" },
  { name: "Back Lever", category: "Bodyweight" },
  { name: "Human Flag", category: "Bodyweight" },
  { name: "Planche", category: "Bodyweight" },
  { name: "Skin the Cat", category: "Bodyweight" },
  { name: "Wall Sit", category: "Bodyweight" },
  { name: "Glute Bridge", category: "Bodyweight" },
  { name: "Superman Hold", category: "Bodyweight" },

  // Functional & CrossFit
  { name: "Thruster", category: "Functional" },
  { name: "Wall Ball", category: "Functional" },
  { name: "Kettlebell Swing", category: "Functional" },
  { name: "Turkish Get-Up", category: "Functional" },
  { name: "Kettlebell Snatch", category: "Functional" },
  { name: "Kettlebell Clean", category: "Functional" },
  { name: "Goblet Squat", category: "Functional" },
  { name: "Devil's Press", category: "Functional" },
  { name: "Dumbbell Snatch", category: "Functional" },
  { name: "Sandbag Carry", category: "Functional" },
  { name: "Sandbag Clean", category: "Functional" },
  { name: "Bear Crawl", category: "Functional" },
  { name: "Crab Walk", category: "Functional" },
  { name: "Duck Walk", category: "Functional" },

  // Strongman
  { name: "Atlas Stone Lift", category: "Strongman" },
  { name: "Log Press", category: "Strongman" },
  { name: "Yoke Walk", category: "Strongman" },
  { name: "Tire Flip", category: "Strongman" },
  { name: "Axle Press", category: "Strongman" },
  { name: "Car Deadlift", category: "Strongman" },
  { name: "Keg Carry", category: "Strongman" },
  { name: "Circus Dumbbell Press", category: "Strongman" },

  // Plyometrics
  { name: "Depth Jump", category: "Plyometric" },
  { name: "Broad Jump", category: "Plyometric" },
  { name: "Tuck Jump", category: "Plyometric" },
  { name: "Lateral Bound", category: "Plyometric" },
  { name: "Single-Leg Box Jump", category: "Plyometric" },
  { name: "Plyo Push-Up", category: "Plyometric" },
  { name: "Medicine Ball Slam", category: "Plyometric" },
  { name: "Medicine Ball Throw", category: "Plyometric" },
  { name: "Bounding", category: "Plyometric" },

  // Isolation & Accessories
  { name: "Cable Crossover", category: "Isolation" },
  { name: "Chest Fly Machine", category: "Isolation" },
  { name: "Leg Abduction", category: "Isolation" },
  { name: "Leg Adduction", category: "Isolation" },
  { name: "Hip Abduction", category: "Isolation" },
  { name: "Hip Adduction", category: "Isolation" },
  { name: "Reverse Fly", category: "Isolation" },
  { name: "Cable Lateral Raise", category: "Isolation" },
  { name: "Reverse Pec Deck", category: "Isolation" },
  { name: "Wrist Curl", category: "Isolation" },
  { name: "Reverse Wrist Curl", category: "Isolation" },
  { name: "Forearm Curl", category: "Isolation" },
  { name: "Zottman Curl", category: "Isolation" },
  { name: "Spider Curl", category: "Isolation" },
  { name: "Waiter Curl", category: "Isolation" },
  { name: "Drag Curl", category: "Isolation" },
  { name: "21s", category: "Isolation" },
  { name: "JM Press", category: "Isolation" },
  { name: "Tate Press", category: "Isolation" },
  { name: "Lying Triceps Extension", category: "Isolation" },

  // Machines
  { name: "Smith Machine Squat", category: "Machine" },
  { name: "Smith Machine Bench", category: "Machine" },
  { name: "Leg Press Machine", category: "Machine" },
  { name: "Chest Press Machine", category: "Machine" },
  { name: "Shoulder Press Machine", category: "Machine" },
  { name: "Lat Pulldown Machine", category: "Machine" },
  { name: "Cable Row Machine", category: "Machine" },
  { name: "Preacher Curl Machine", category: "Machine" },
  { name: "Leg Curl Machine", category: "Machine" },
  { name: "Leg Extension Machine", category: "Machine" },
  { name: "Hack Squat Machine", category: "Machine" },
  { name: "Pendulum Squat", category: "Machine" },
  { name: "Belt Squat", category: "Machine" },
  { name: "Hip Thrust Machine", category: "Machine" },

  // Rehabilitation & Prehab
  { name: "Band Pull-Apart", category: "Prehab" },
  { name: "External Rotation", category: "Prehab" },
  { name: "Internal Rotation", category: "Prehab" },
  { name: "YTW Raises", category: "Prehab" },
  { name: "Scapular Push-Up", category: "Prehab" },
  { name: "Wall Slide", category: "Prehab" },
  { name: "Band Triceps Extension", category: "Prehab" },
  { name: "Clamshells", category: "Prehab" },
  { name: "Fire Hydrants", category: "Prehab" },
  { name: "Monster Walks", category: "Prehab" },
  { name: "Lateral Band Walk", category: "Prehab" },
  { name: "Ankle Mobility", category: "Prehab" },
  { name: "Single-Leg Deadlift", category: "Prehab" },
  { name: "Copenhagen Plank", category: "Prehab" },

  // Additional Upper Body
  { name: "Landmine Press", category: "Upper" },
  { name: "Landmine Row", category: "Upper" },
  { name: "Svend Press", category: "Upper" },
  { name: "Guillotine Press", category: "Upper" },
  { name: "Larsen Press", category: "Upper" },
  { name: "Spoto Press", category: "Upper" },
  { name: "Bradford Press", category: "Upper" },
  { name: "Z Press", category: "Upper" },
  { name: "Viking Press", category: "Upper" },
  { name: "Meadows Row", category: "Back" },
  { name: "Seal Row", category: "Back" },
  { name: "Helms Row", category: "Back" },
  { name: "Kroc Row", category: "Back" },
  { name: "Batwing Row", category: "Back" },

  // Additional Lower Body
  { name: "Hatfield Squat", category: "Lower" },
  { name: "Zercher Squat", category: "Lower" },
  { name: "Anderson Squat", category: "Lower" },
  { name: "Sissy Squat", category: "Lower" },
  { name: "Spanish Squat", category: "Lower" },
  { name: "Poliquin Step-Up", category: "Lower" },
  { name: "Peterson Step-Up", category: "Lower" },
  { name: "Cossack Squat", category: "Lower" },
  { name: "Curtsy Lunge", category: "Lower" },
  { name: "Skater Squat", category: "Lower" },
  { name: "Reverse Hyperextension", category: "Posterior" },
  { name: "Back Extension", category: "Posterior" },
  { name: "45-Degree Back Extension", category: "Posterior" },
  { name: "Trap Bar Deadlift", category: "Posterior" },
  { name: "Snatch Grip Deadlift", category: "Posterior" },
  { name: "Jefferson Deadlift", category: "Posterior" },
  { name: "B-Stance RDL", category: "Posterior" },
  { name: "Single-Leg RDL", category: "Posterior" },
];

let workouts = [];
let exerciseLibrary = [];
let scenarios = [];
let compositionChart;
let volumeChart;
let frequencyChart;
let deferredPrompt = null;

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings));
    return stored || { unit: "lbs", theme: "system" };
  } catch {
    return { unit: "lbs", theme: "system" };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function applyTheme(themePref) {
  const root = document.documentElement;
  let theme = themePref;
  if (themePref === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    theme = prefersDark ? "dark" : "light";
  }
  root.setAttribute("data-theme", theme);
  const toggle = qs("#themeToggle");
  if (toggle) {
    const label = theme === "dark" ? "☀️ Light" : "🌙 Dark";
    toggle.textContent = label;
  }
  const select = qs("#themeSelect");
  if (select && select.value !== themePref) select.value = themePref;
}

function initTheme() {
  const settings = loadSettings();
  applyTheme(settings.theme);
  const toggle = qs("#themeToggle");
  toggle?.addEventListener("click", () => {
    const currentPref = loadSettings().theme;
    const next = currentPref === "dark" ? "light" : currentPref === "light" ? "contrast" : "dark";
    const updated = { ...loadSettings(), theme: next };
    saveSettings(updated);
    applyTheme(next);
  });
  const select = qs("#themeSelect");
  select?.addEventListener("change", (e) => {
    const updated = { ...loadSettings(), theme: e.target.value };
    saveSettings(updated);
    applyTheme(e.target.value);
  });
}

function initTabs() {
  const buttons = qsa(".tab-button");
  const panels = qsa(".tab-panel");
  const stored = localStorage.getItem(STORAGE_KEYS.tab) || "workouts";
  const allowed = ["workouts", "library", "analytics", "calculators", "settings"];
  const initial = allowed.includes(stored) ? stored : "workouts";
  setActiveTab(initial, buttons, panels);
  buttons.forEach((btn) =>
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab, buttons, panels))
  );
}

function setActiveTab(tab, buttons, panels) {
  buttons.forEach((btn) => {
    const active = btn.dataset.tab === tab;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active);
  });
  panels.forEach((panel) => {
    const active = panel.id === `${tab}Tab`;
    panel.hidden = !active;
  });
  localStorage.setItem(STORAGE_KEYS.tab, tab);
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function initData() {
  workouts = loadFromStorage(STORAGE_KEYS.workouts, []);
  exerciseLibrary = loadFromStorage(STORAGE_KEYS.exercises, DEFAULT_EXERCISES);
  scenarios = loadFromStorage(STORAGE_KEYS.scenarios, []);
}

function renderExerciseLibrary() {
  const container = qs("#exerciseLibrary");
  container.innerHTML = "";
  exerciseLibrary.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "exercise-chip";
    div.innerHTML = `<div><strong>${item.name}</strong><br/><span>${item.category}</span></div>`;
    const actions = document.createElement("div");
    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.className = "button-secondary";
    edit.addEventListener("click", () => {
      const name = prompt("Edit exercise name", item.name) || item.name;
      const category = prompt("Edit category", item.category) || item.category;
      exerciseLibrary[idx] = { name, category };
      saveToStorage(STORAGE_KEYS.exercises, exerciseLibrary);
      renderExerciseLibrary();
      refreshExerciseDatalists();
    });
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "button-secondary";
    del.addEventListener("click", () => {
      exerciseLibrary.splice(idx, 1);
      saveToStorage(STORAGE_KEYS.exercises, exerciseLibrary);
      renderExerciseLibrary();
      refreshExerciseDatalists();
    });
    actions.append(edit, del);
    actions.style.display = "flex";
    actions.style.gap = "0.35rem";
    div.append(actions);
    container.append(div);
  });
}

function refreshExerciseDatalists() {
  const names = exerciseLibrary.map((e) => e.name);
  qsa(".exercise-name").forEach((input) => {
    input.setAttribute("list", "exerciseList");
  });
  let list = qs("#exerciseList");
  if (!list) {
    list = document.createElement("datalist");
    list.id = "exerciseList";
    document.body.appendChild(list);
  }
  list.innerHTML = names.map((name) => `<option value="${name}"></option>`).join("");
}

function addExerciseCard(prefillName = "") {
  const area = qs("#exerciseArea");
  const card = document.createElement("div");
  card.className = "exercise-card";
  card.innerHTML = `
    <div class="exercise-header">
      <label class="field" style="flex:1;">
        <span>Exercise</span>
        <input type="text" class="exercise-name" value="${prefillName}" placeholder="Select or type" />
      </label>
      <button class="button-secondary remove-exercise" type="button">Remove</button>
    </div>
    <div class="exercise-sets"></div>
    <div class="helper-row">
      <button class="button-secondary add-set" type="button">+ Add set</button>
      <div class="pill exercise-totals">0 sets · 0 reps · 0 volume</div>
    </div>
  `;
  area.append(card);
  card.querySelector(".remove-exercise").addEventListener("click", () => {
    card.remove();
    updateSessionTotals();
  });
  card.querySelector(".add-set").addEventListener("click", () => addSetRow(card));
  refreshExerciseDatalists();
  addSetRow(card);
}

function addSetRow(card, cloneData = null) {
  const sets = card.querySelector(".exercise-sets");
  const row = document.createElement("div");
  row.className = "set-row";
  row.innerHTML = `
    <label class="field"><span>Reps</span><input type="number" inputmode="numeric" class="set-reps" value="${cloneData?.reps || ""}" /></label>
    <label class="field"><span>Weight</span><input type="number" inputmode="decimal" class="set-weight" value="${cloneData?.weight || ""}" /></label>
    <label class="field"><span>Notes</span><input type="text" class="set-note" value="${cloneData?.note || ""}" placeholder="tempo, paused..." /></label>
    <div class="helper-row">
      <button class="button-secondary duplicate-set" type="button">Duplicate</button>
      <button class="button-secondary remove-set" type="button">Delete</button>
    </div>
  `;
  sets.append(row);
  row.querySelectorAll("input").forEach((input) =>
    input.addEventListener("input", updateSessionTotals)
  );
  row.querySelector(".remove-set").addEventListener("click", () => {
    row.remove();
    updateSessionTotals();
  });
  row.querySelector(".duplicate-set").addEventListener("click", () => {
    const data = {
      reps: row.querySelector(".set-reps").value,
      weight: row.querySelector(".set-weight").value,
      note: row.querySelector(".set-note").value,
    };
    addSetRow(card, data);
  });
  updateSessionTotals();
}

function updateSessionTotals() {
  let setsCount = 0;
  let repsTotal = 0;
  let volumeTotal = 0;
  qsa(".exercise-card").forEach((card) => {
    let cardSets = 0;
    let cardReps = 0;
    let cardVolume = 0;
    card.querySelectorAll(".set-row").forEach((row) => {
      const reps = Number(row.querySelector(".set-reps").value) || 0;
      const weight = Number(row.querySelector(".set-weight").value) || 0;
      if (reps || weight) {
        cardSets += 1;
        cardReps += reps;
        cardVolume += reps * weight;
      }
    });
    setsCount += cardSets;
    repsTotal += cardReps;
    volumeTotal += cardVolume;
    const totals = card.querySelector(".exercise-totals");
    totals.textContent = `${cardSets} sets · ${cardReps} reps · ${cardVolume.toFixed(1)} volume`;
  });
  qs("#sessionTotals").textContent = `${setsCount} sets · ${repsTotal} reps · ${volumeTotal.toFixed(1)} volume`;
}

function gatherWorkout() {
  const title = qs("#workoutTitle").value.trim() || "Untitled";
  const date = qs("#workoutDate").value || new Date().toISOString().slice(0, 10);
  const notes = qs("#workoutNotes").value.trim();
  const exercises = qsa(".exercise-card").map((card) => {
    const name = card.querySelector(".exercise-name").value.trim();
    const sets = card.querySelectorAll(".set-row");
    const setData = [];
    sets.forEach((row) => {
      const reps = Number(row.querySelector(".set-reps").value);
      const weight = Number(row.querySelector(".set-weight").value);
      const note = row.querySelector(".set-note").value.trim();
      if (!name || (!reps && !weight)) return;
      setData.push({ reps, weight, note, volume: reps * weight });
    });
    if (!name || !setData.length) return null;
    return { name, sets: setData };
  }).filter(Boolean);
  const totals = exercises.reduce(
    (acc, ex) => {
      ex.sets.forEach((s) => {
        acc.sets += 1;
        acc.reps += s.reps;
        acc.volume += s.volume;
      });
      return acc;
    },
    { sets: 0, reps: 0, volume: 0 }
  );
  return { id: crypto.randomUUID(), title, date, notes, exercises, totals };
}

function saveWorkout() {
  const data = gatherWorkout();
  if (!data.exercises.length) {
    alert("Add at least one exercise with sets");
    return;
  }
  workouts.unshift(data);
  saveToStorage(STORAGE_KEYS.workouts, workouts);
  renderHistory();
  updateAnalytics();
  resetWorkoutForm();
}

function saveAsWorkout() {
  const data = gatherWorkout();
  if (!data.exercises.length) {
    alert("Add at least one exercise with sets");
    return;
  }
  const newTitle = prompt("Enter workout title:", data.title);
  if (!newTitle) return;
  data.title = newTitle;
  data.id = crypto.randomUUID();
  workouts.unshift(data);
  saveToStorage(STORAGE_KEYS.workouts, workouts);
  renderHistory();
  updateAnalytics();
  alert(`Workout saved as "${newTitle}"`);
}

function loadWorkoutFromButton() {
  if (!workouts.length) {
    alert("No saved workouts yet. Create and save a workout first!");
    return;
  }
  const workoutList = workouts
    .map((w, idx) => `${idx + 1}. ${w.title} (${w.date}) - ${w.totals.sets} sets, ${w.totals.volume.toFixed(0)} volume`)
    .join("\n");
  const choice = prompt(`Select a workout to load (enter number 1-${workouts.length}):\n\n${workoutList}`);
  if (!choice) return;
  const idx = parseInt(choice) - 1;
  if (idx >= 0 && idx < workouts.length) {
    loadWorkoutIntoForm(workouts[idx]);
    alert(`Loaded: ${workouts[idx].title}`);
  } else {
    alert("Invalid selection");
  }
}

function resetWorkoutForm() {
  qs("#workoutTitle").value = "";
  qs("#workoutNotes").value = "";
  qs("#workoutDate").value = new Date().toISOString().slice(0, 10);
  qs("#exerciseArea").innerHTML = "";
  addExerciseCard();
  updateSessionTotals();
}

function renderHistory() {
  const list = qs("#workoutHistory");
  const search = qs("#historySearch").value.toLowerCase();
  const exerciseFilter = qs("#historyExerciseFilter").value.toLowerCase();
  const minVolume = Number(qs("#historyVolumeFilter").value) || 0;
  const minReps = Number(qs("#historyRepsFilter").value) || 0;
  list.innerHTML = "";
  const filtered = workouts.filter((w) => {
    const matchesSearch =
      w.title.toLowerCase().includes(search) ||
      w.exercises.some((ex) => ex.name.toLowerCase().includes(search));
    const matchesExercise = exerciseFilter
      ? w.exercises.some((ex) => ex.name.toLowerCase().includes(exerciseFilter))
      : true;
    const matchesVolume = w.totals.volume >= minVolume;
    const matchesReps = w.totals.reps >= minReps;
    return matchesSearch && matchesExercise && matchesVolume && matchesReps;
  });
  if (!filtered.length) {
    const empty = document.createElement("li");
    empty.textContent = "No workouts match these filters yet.";
    list.append(empty);
    return;
  }
  filtered.forEach((w) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="helper-row" style="justify-content: space-between;">
        <div>
          <strong>${w.title}</strong>
          <p class="workout-meta">${w.date} · ${w.totals.sets} sets · ${w.totals.reps} reps · ${w.totals.volume.toFixed(1)} volume</p>
        </div>
        <button class="button-secondary" type="button">Load</button>
      </div>
      <p>${w.notes || "No notes"}</p>
      <ul class="feature-list">${w.exercises
        .map(
          (ex) => `<li><strong>${ex.name}</strong> — ${ex.sets
            .map((s) => `${s.reps} reps @ ${s.weight}${loadSettings().unit}${s.note ? ` (${s.note})` : ""}`)
            .join("; ")}</li>`
        )
        .join("")}</ul>
    `;
    li.querySelector("button").addEventListener("click", () => loadWorkoutIntoForm(w));
    list.append(li);
  });
}

function loadWorkoutIntoForm(workout) {
  qs("#workoutTitle").value = workout.title;
  qs("#workoutDate").value = workout.date;
  qs("#workoutNotes").value = workout.notes;
  qs("#exerciseArea").innerHTML = "";
  workout.exercises.forEach((ex) => {
    addExerciseCard(ex.name);
    const card = qsa(".exercise-card").slice(-1)[0];
    card.querySelector(".exercise-sets").innerHTML = "";
    ex.sets.forEach((s) => addSetRow(card, s));
  });
  updateSessionTotals();
}

function addExerciseToLibrary() {
  const name = qs("#newExerciseName").value.trim();
  const category = qs("#newExerciseCategory").value.trim() || "General";
  if (!name) return;
  exerciseLibrary.push({ name, category });
  saveToStorage(STORAGE_KEYS.exercises, exerciseLibrary);
  qs("#newExerciseName").value = "";
  qs("#newExerciseCategory").value = "";
  renderExerciseLibrary();
  refreshExerciseDatalists();
}

function updateAnalytics() {
  renderHistory();
  renderPRs();
  buildCharts();
}

function buildCharts() {
  const weekly = aggregateWeekly();
  const ctxVolume = qs("#volumeChart");
  const ctxFreq = qs("#frequencyChart");
  const labels = weekly.map((w) => w.label);
  const volumes = weekly.map((w) => w.volume);
  const sessions = weekly.map((w) => w.count);
  if (volumeChart) volumeChart.destroy();
  if (frequencyChart) frequencyChart.destroy();
  volumeChart = new Chart(ctxVolume, {
    type: "bar",
    data: { labels, datasets: [{ label: "Total volume", data: volumes, backgroundColor: "#5dd0ff" }] },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
  frequencyChart = new Chart(ctxFreq, {
    type: "line",
    data: { labels, datasets: [{ label: "Sessions", data: sessions, borderColor: "#7cf17d", tension: 0.3 }] },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
}

function aggregateWeekly() {
  const map = new Map();
  workouts.forEach((w) => {
    const weekKey = getWeekKey(w.date);
    const current = map.get(weekKey) || { label: weekKey, volume: 0, count: 0 };
    current.volume += w.totals.volume;
    current.count += 1;
    map.set(weekKey, current);
  });
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function getWeekKey(dateStr) {
  const date = new Date(dateStr);
  const onejan = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function renderPRs() {
  const prMap = new Map();
  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        const existing = prMap.get(ex.name);
        if (!existing || s.weight > existing.weight) {
          prMap.set(ex.name, { ...s, date: w.date });
        }
      });
    });
  });
  const list = qs("#prList");
  list.innerHTML = "";
  if (!prMap.size) {
    const li = document.createElement("li");
    li.textContent = "Log workouts to see PRs.";
    list.append(li);
    return;
  }
  prMap.forEach((val, name) => {
    const li = document.createElement("li");
    li.className = "pr-card";
    li.innerHTML = `<strong>${name}</strong><p class="workout-meta">${val.weight}${loadSettings().unit} x ${val.reps} on ${val.date}${val.note ? ` — ${val.note}` : ""}</p>`;
    list.append(li);
  });
}

/* Calculator logic reused from previous app */
function getNumber(id) {
  const val = parseFloat(qs(`#${id}`).value);
  return Number.isFinite(val) ? val : 0;
}

function setText(id, text) {
  qs(`#${id}`).textContent = text;
}

function updateGoalHelper(type) {
  const helper = qs("#targetHelper");
  const label1 = qs("#targetValueLabel");
  const label2 = qs("#targetValue2Label");
  const label3 = qs("#targetValue3Label");
  const w2 = qs("#targetValue2Wrapper");
  const w3 = qs("#targetValue3Wrapper");
  w2.hidden = true;
  w3.hidden = true;
  switch (type) {
    case "target_weight":
      helper.textContent = "Enter a goal weight.";
      label1.textContent = "Goal weight (lbs)";
      break;
    case "target_fat_mass":
      helper.textContent = "Enter a target fat mass.";
      label1.textContent = "Body fat (lbs)";
      break;
    case "target_fat_pct":
      helper.textContent = "Enter a target fat percentage.";
      label1.textContent = "Body fat (%)";
      break;
    case "target_muscle_mass":
      helper.textContent = "Enter a target muscle mass.";
      label1.textContent = "Muscle (lbs)";
      break;
    case "target_muscle_pct":
      helper.textContent = "Enter a target muscle percentage.";
      label1.textContent = "Muscle (%)";
      break;
    case "target_weight_fat_pct":
      helper.textContent = "Set weight and body fat %";
      label1.textContent = "Goal weight (lbs)";
      label2.textContent = "Body fat (%)";
      w2.hidden = false;
      break;
    case "target_weight_muscle_pct":
      helper.textContent = "Set weight and muscle %";
      label1.textContent = "Goal weight (lbs)";
      label2.textContent = "Muscle (%)";
      w2.hidden = false;
      break;
    case "target_weight_fat_muscle_pct":
      helper.textContent = "Set weight, fat %, and muscle %";
      label1.textContent = "Goal weight (lbs)";
      label2.textContent = "Body fat (%)";
      label3.textContent = "Muscle (%)";
      w2.hidden = false;
      w3.hidden = false;
      break;
    default:
      helper.textContent = "Using your current weight and composition.";
      label1.textContent = "Goal value";
  }
}

function getGoal() {
  const type = qs("#targetType").value;
  const v1 = parseFloat(qs("#targetValue").value) || 0;
  const v2 = parseFloat(qs("#targetValue2").value) || 0;
  const v3 = parseFloat(qs("#targetValue3").value) || 0;
  updateGoalHelper(type);
  return { type, value: v1, value2: v2, value3: v3 };
}

function recalc() {
  const currentWeight = getNumber("currentWeight");
  const fatMass = getNumber("currentFat");
  const muscleMass = getNumber("currentMuscle");
  const otherMass = Math.max(currentWeight - fatMass - muscleMass, 0);
  const fatPct = currentWeight ? (fatMass / currentWeight) * 100 : 0;
  const musclePct = currentWeight ? (muscleMass / currentWeight) * 100 : 0;
  const bonePct = currentWeight ? (otherMass / currentWeight) * 100 : 0;
  setText("currentFatPct", fatPct.toFixed(1));
  setText("currentMusclePct", musclePct.toFixed(1));
  setText("currentBonePct", bonePct.toFixed(1));
  const goal = getGoal();
  const target = computeTarget(goal, { currentWeight, fatMass, muscleMass, otherMass });
  updateTargetUI(target);
  updateQuickSummary({ currentWeight, fatMass, muscleMass }, target);
  renderCompositionChart({ fatPct, musclePct, bonePct }, target);
}

function computeTarget(goal, current) {
  let weight = current.currentWeight;
  let fat = current.fatMass;
  let muscle = current.muscleMass;
  switch (goal.type) {
    case "target_weight":
      weight = goal.value;
      break;
    case "target_fat_mass":
      fat = goal.value;
      weight = fat + current.muscleMass + current.otherMass;
      break;
    case "target_fat_pct":
      weight = current.currentWeight;
      fat = (goal.value / 100) * weight;
      break;
    case "target_muscle_mass":
      muscle = goal.value;
      weight = muscle + current.fatMass + current.otherMass;
      break;
    case "target_muscle_pct":
      weight = current.currentWeight;
      muscle = (goal.value / 100) * weight;
      break;
    case "target_weight_fat_pct":
      weight = goal.value;
      fat = (goal.value2 / 100) * weight;
      break;
    case "target_weight_muscle_pct":
      weight = goal.value;
      muscle = (goal.value2 / 100) * weight;
      break;
    case "target_weight_fat_muscle_pct":
      weight = goal.value;
      fat = (goal.value2 / 100) * weight;
      muscle = (goal.value3 / 100) * weight;
      break;
    default:
      break;
  }
  const other = Math.max(weight - fat - muscle, 0);
  return { weight, fat, muscle, other };
}

function updateTargetUI(target) {
  const total = target.weight || 1;
  setText("targetFatPct", ((target.fat / total) * 100 || 0).toFixed(1));
  setText("targetMusclePct", ((target.muscle / total) * 100 || 0).toFixed(1));
  setText("targetBonePct", ((target.other / total) * 100 || 0).toFixed(1));
  const weightDiff = target.weight - getNumber("currentWeight");
  const fatDiff = target.fat - getNumber("currentFat");
  const muscleDiff = target.muscle - getNumber("currentMuscle");
  setText("weightDiffText", `${weightDiff >= 0 ? "+" : ""}${weightDiff.toFixed(1)} lbs`);
  setText("fatChangeText", `${fatDiff >= 0 ? "+" : ""}${fatDiff.toFixed(1)} lbs fat`);
  setText("muscleChangeText", `${muscleDiff >= 0 ? "+" : ""}${muscleDiff.toFixed(1)} lbs muscle`);
}

function updateQuickSummary(current, target) {
  const diff = target.weight - current.currentWeight;
  const summary = qs("#quickSummary");
  if (!current.currentWeight) {
    summary.textContent = "Enter your stats to see a quick difference summary.";
    return;
  }
  summary.textContent =
    diff === 0
      ? "You'd maintain your current weight and composition."
      : diff > 0
      ? `Gain ${diff.toFixed(1)} lbs while shifting composition.`
      : `Lose ${Math.abs(diff).toFixed(1)} lbs while shifting composition.`;
}

function renderCompositionChart(current, target) {
  const ctx = qs("#compositionChart");
  const data = {
    labels: ["Current", "Target"],
    datasets: [
      { label: "Fat", data: [current.fatPct, (target.fat / target.weight) * 100 || 0], backgroundColor: "#ef4444" },
      { label: "Muscle", data: [current.musclePct, (target.muscle / target.weight) * 100 || 0], backgroundColor: "#22c55e" },
      { label: "Other", data: [current.bonePct, (target.other / target.weight) * 100 || 0], backgroundColor: "#3b82f6" },
    ],
  };
  if (compositionChart) compositionChart.destroy();
  compositionChart = new Chart(ctx, {
    type: "bar",
    data,
    options: { responsive: true, plugins: { legend: { position: "bottom" } }, scales: { x: { stacked: true }, y: { stacked: true } } },
  });
}

function saveScenario() {
  const name = prompt("Scenario name?");
  if (!name) return;
  const scenario = {
    name,
    currentWeight: getNumber("currentWeight"),
    currentFat: getNumber("currentFat"),
    currentMuscle: getNumber("currentMuscle"),
    goal: getGoal(),
  };
  scenarios.push(scenario);
  saveToStorage(STORAGE_KEYS.scenarios, scenarios);
  renderScenarioList();
}

function renderScenarioList() {
  const list = qs("#scenarioList");
  list.innerHTML = scenarios
    .map(
      (s, i) => `
      <li>
        <div class="helper-row" style="justify-content: space-between;">
          <div><strong>${s.name}</strong><p class="workout-meta">Goal type: ${s.goal.type}</p></div>
          <div class="helper-row">
            <button class="button-secondary" data-idx="${i}" data-action="load">Load</button>
            <button class="button-secondary" data-idx="${i}" data-action="delete">Delete</button>
          </div>
        </div>
      </li>`
    )
    .join("");
  list.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.idx);
      const action = btn.dataset.action;
      if (action === "delete") {
        scenarios.splice(idx, 1);
        saveToStorage(STORAGE_KEYS.scenarios, scenarios);
        renderScenarioList();
      } else {
        const s = scenarios[idx];
        qs("#currentWeight").value = s.currentWeight;
        qs("#currentFat").value = s.currentFat;
        qs("#currentMuscle").value = s.currentMuscle;
        qs("#targetType").value = s.goal.type;
        qs("#targetValue").value = s.goal.value;
        qs("#targetValue2").value = s.goal.value2;
        qs("#targetValue3").value = s.goal.value3;
        recalc();
      }
    });
  });
}

function initCalculator() {
  ["currentWeight", "currentFat", "currentMuscle"].forEach((id) =>
    qs(`#${id}`).addEventListener("input", recalc)
  );
  ["targetType", "targetValue", "targetValue2", "targetValue3"].forEach((id) =>
    qs(`#${id}`).addEventListener("input", recalc)
  );
  qs("#copyCurrentToTarget").addEventListener("click", () => {
    qs("#targetType").value = "same_weight";
    qs("#targetValue").value = "";
    qs("#targetValue2").value = "";
    qs("#targetValue3").value = "";
    recalc();
  });
  qs("#saveScenarioButton").addEventListener("click", saveScenario);
  renderScenarioList();
  recalc();
}

function exportCsv() {
  const rows = [
    ["date", "title", "notes", "exercise", "reps", "weight", "set_note"],
  ];
  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        rows.push([w.date, w.title, w.notes, ex.name, s.reps, s.weight, s.note]);
      });
    });
  });
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  downloadFile(csv, "workouts.csv", "text/csv");
}

function importFile(type) {
  const picker = qs("#filePicker");
  picker.accept = type === "csv" ? ".csv" : ".json";
  picker.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (type === "csv") {
      importCsv(text);
    } else {
      importJson(text);
    }
    picker.value = "";
  };
  picker.click();
}

function importCsv(text) {
  const lines = text.trim().split(/\r?\n/).slice(1);
  lines.forEach((line) => {
    const cols = line.match(/\"([^\"]*)\"/g)?.map((c) => c.replace(/\"/g, "")) || [];
    const [date, title, notes, exercise, reps, weight, note] = cols;
    const existing = workouts.find((w) => w.date === date && w.title === title) || {
      id: crypto.randomUUID(),
      date,
      title,
      notes,
      exercises: [],
      totals: { sets: 0, reps: 0, volume: 0 },
    };
    let ex = existing.exercises.find((e) => e.name === exercise);
    if (!ex) {
      ex = { name: exercise, sets: [] };
      existing.exercises.push(ex);
    }
    const set = { reps: Number(reps), weight: Number(weight), note, volume: Number(reps) * Number(weight) };
    ex.sets.push(set);
    existing.totals.sets += 1;
    existing.totals.reps += set.reps;
    existing.totals.volume += set.volume;
    if (!workouts.includes(existing)) workouts.push(existing);
  });
  saveToStorage(STORAGE_KEYS.workouts, workouts);
  updateAnalytics();
}

function exportJson() {
  const payload = { workouts, exercises: exerciseLibrary, settings: loadSettings(), scenarios };
  downloadFile(JSON.stringify(payload, null, 2), "lift-ledger-backup.json", "application/json");
}

function importJson(text) {
  try {
    const data = JSON.parse(text);
    workouts = data.workouts || workouts;
    exerciseLibrary = data.exercises || exerciseLibrary;
    scenarios = data.scenarios || scenarios;
    saveToStorage(STORAGE_KEYS.workouts, workouts);
    saveToStorage(STORAGE_KEYS.exercises, exerciseLibrary);
    saveToStorage(STORAGE_KEYS.scenarios, scenarios);
    renderExerciseLibrary();
    refreshExerciseDatalists();
    updateAnalytics();
    renderScenarioList();
  } catch (e) {
    alert("Invalid JSON file");
  }
}

function downloadFile(content, name, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function initImportExport() {
  qs("#exportCsv").addEventListener("click", exportCsv);
  qs("#exportJson").addEventListener("click", exportJson);
  qs("#importCsv").addEventListener("click", () => importFile("csv"));
  qs("#importJson").addEventListener("click", () => importFile("json"));
}

function initUnitSelect() {
  const select = qs("#unitSelect");
  const settings = loadSettings();
  select.value = settings.unit;
  select.addEventListener("change", () => {
    const updated = { ...loadSettings(), unit: select.value };
    saveSettings(updated);
    updateAnalytics();
  });
}

function registerPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    qs("#installButton").disabled = false;
  });
  qs("#installButton").addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
}

function boot() {
  initData();
  initTheme();
  initTabs();
  renderExerciseLibrary();
  refreshExerciseDatalists();
  resetWorkoutForm();
  updateAnalytics();
  initCalculator();
  initImportExport();
  initUnitSelect();
  qs("#addExercise").addEventListener("click", () => addExerciseCard());
  qs("#loadWorkout").addEventListener("click", loadWorkoutFromButton);
  qs("#saveAsWorkout").addEventListener("click", saveAsWorkout);
  qs("#saveWorkout").addEventListener("click", saveWorkout);
  qs("#historySearch").addEventListener("input", renderHistory);
  qs("#historyExerciseFilter").addEventListener("input", renderHistory);
  qs("#historyVolumeFilter").addEventListener("input", renderHistory);
  qs("#historyRepsFilter").addEventListener("input", renderHistory);
  qs("#addExerciseLibrary").addEventListener("click", addExerciseToLibrary);
  registerPwa();
}

document.addEventListener("DOMContentLoaded", boot);
