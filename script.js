let compositionChart = null;
let scenarios = [];

document.addEventListener("DOMContentLoaded", () => {
  const inputs = [
    "currentWeight",
    "currentFat",
    "currentMuscle",
    "targetWeight",
    "targetFat",
    "targetMuscle"
  ];

  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", recalc);
  });

  document.getElementById("copyCurrentToTarget")
    .addEventListener("click", copyCurrentToTarget);

  document.getElementById("saveScenarioButton")
    .addEventListener("click", saveCurrentScenario);

  loadScenariosFromStorage();
  recalc();
});

/* ---------- Helpers ---------- */

function getNumber(id) {
  const val = parseFloat(document.getElementById(id).value);
  return Number.isFinite(val) ? val : 0;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function copyCurrentToTarget() {
  document.getElementById("targetWeight").value =
    document.getElementById("currentWeight").value;
  document.getElementById("targetFat").value =
    document.getElementById("currentFat").value;
  document.getElementById("targetMuscle").value =
    document.getElementById("currentMuscle").value;
  recalc();
}

/* ---------- Main Calculation ---------- */

function recalc() {
  const current = {
    weight: getNumber("currentWeight"),
    fat: getNumber("currentFat"),
    muscle: getNumber("currentMuscle")
  };

  const target = {
    weight: getNumber("targetWeight"),
    fat: getNumber("targetFat"),
    muscle: getNumber("targetMuscle")
  };

  const currentComp = computeComposition(current);
  const targetComp = computeComposition(target);

  // Update displayed percentages
  setText("currentFatPct", currentComp.fatPct.toFixed(1));
  setText("currentMusclePct", currentComp.musclePct.toFixed(1));
  setText("currentBonePct", currentComp.bonePct.toFixed(1));

  setText("targetFatPct", targetComp.fatPct.toFixed(1));
  setText("targetMusclePct", targetComp.musclePct.toFixed(1));
  setText("targetBonePct", targetComp.bonePct.toFixed(1));

  // Differences
  const weightDiff = target.weight - current.weight;
  const fatDiff = target.fat - current.fat;
  const muscleDiff = target.muscle - current.muscle;

  setText("weightDiffText", diffText(weightDiff));
  setText("fatChangeText", diffText(fatDiff));
  setText("muscleChangeText", diffText(muscleDiff));

  updateQuickSummary(weightDiff, fatDiff, muscleDiff);
  updateChart(currentComp, targetComp);
}

function computeComposition({ weight, fat, muscle }) {
  const safeWeight = Math.max(weight, 0);
  const fatMass = Math.max(fat, 0);
  const muscleMass = Math.max(muscle, 0);

  // NEW: Bone = remainder
  let boneMass = safeWeight - (fatMass + muscleMass);
  if (boneMass < 0) boneMass = 0;

  const pct = (m) => safeWeight > 0 ? (m / safeWeight) * 100 : 0;

  return {
    fatMass,
    muscleMass,
    boneMass,
    fatPct: pct(fatMass),
    musclePct: pct(muscleMass),
    bonePct: pct(boneMass)
  };
}

function diffText(v) {
  if (Math.abs(v) < 0.001) return "No change";
  return v > 0 ? `+${v.toFixed(2)} lbs` : `-${Math.abs(v).toFixed(2)} lbs`;
}

function updateQuickSummary(weight, fat, muscle) {
  const el = document.getElementById("quickSummary");
  const parts = [];

  if (Math.abs(weight) > 0.01) parts.push(diffText(weight) + " weight");
  if (Math.abs(fat) > 0.01) parts.push(diffText(fat) + " fat");
  if (Math.abs(muscle) > 0.01) parts.push(diffText(muscle) + " muscle");

  el.textContent = parts.length ? parts.join(" • ") : "No differences.";
}

/* ---------- Chart ---------- */

function updateChart(current, target) {
  const ctx = document.getElementById("compositionChart");
  if (!ctx) return;

  const data = {
    labels: ["Current", "What-If"],
    datasets: [
      { label: "Fat", data: [current.fatMass, target.fatMass] },
      { label: "Muscle", data: [current.muscleMass, target.muscleMass] },
      { label: "Bone (Auto)", data: [current.boneMass, target.boneMass] }
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    }
  };

  if (compositionChart) {
    compositionChart.data = data;
    compositionChart.update();
  } else {
    compositionChart = new Chart(ctx, { type: "bar", data, options });
  }
}

/* ---------- Saved Scenarios ---------- */

const STORAGE_KEY = "weightWhatIfScenarios";

function loadScenariosFromStorage() {
  try {
    scenarios = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    scenarios = [];
  }
  renderScenarioList();
}

function saveScenariosToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

function saveCurrentScenario() {
  const name = document.getElementById("scenarioName").value.trim()
    || `Scenario ${scenarios.length + 1}`;

  const scenario = {
    id: Date.now(),
    name,
    current: {
      weight: getNumber("currentWeight"),
      fat: getNumber("currentFat"),
      muscle: getNumber("currentMuscle")
    },
    target: {
      weight: getNumber("targetWeight"),
      fat: getNumber("targetFat"),
      muscle: getNumber("targetMuscle")
    }
  };

  scenarios.push(scenario);
  saveScenariosToStorage();
  renderScenarioList();
}

function renderScenarioList() {
  const list = document.getElementById("scenarioList");
  list.innerHTML = "";

  if (!scenarios.length) {
    list.innerHTML = `<li style="color:#888;font-size:.8rem;">No saved scenarios yet.</li>`;
    return;
  }

  scenarios.forEach((s) => {
    const li = document.createElement("li");
    li.className = "scenario-item";

    const name = document.createElement("span");
    name.textContent = s.name;

    const load = document.createElement("button");
    load.textContent = "Load";
    load.addEventListener("click", () => applyScenario(s));

    const del = document.createElement("button");
    del.textContent = "✕";
    del.addEventListener("click", () => deleteScenario(s.id));

    const actions = document.createElement("div");
    actions.className = "scenario-actions";
    actions.appendChild(load);
    actions.appendChild(del);

    li.appendChild(name);
    li.appendChild(actions);

    list.appendChild(li);
  });
}

function applyScenario(s) {
  document.getElementById("currentWeight").value = s.current.weight;
  document.getElementById("currentFat").value = s.current.fat;
  document.getElementById("currentMuscle").value = s.current.muscle;

  document.getElementById("targetWeight").value = s.target.weight;
  document.getElementById("targetFat").value = s.target.fat;
  document.getElementById("targetMuscle").value = s.target.muscle;

  recalc();
}

function deleteScenario(id) {
  scenarios = scenarios.filter((s) => s.id !== id);
  saveScenariosToStorage();
  renderScenarioList();
}
