/* FULL script.js — Weight What-If Calculator */

let compositionChart = null;
let scenarios = [];

const STORAGE_KEY = "weightWhatIfScenarios";

document.addEventListener("DOMContentLoaded", () => {

  // Event: Current inputs
  ["currentWeight", "currentFat", "currentMuscle"].forEach(id => {
    document.getElementById(id).addEventListener("input", recalc);
  });

  // Event: Goal type
  document.getElementById("targetType").addEventListener("change", recalc);

  // Event: Goal value fields
  document.getElementById("targetValue").addEventListener("input", recalc);
  document.getElementById("targetValue2").addEventListener("input", recalc);

  // Reset goal to same weight
  document.getElementById("copyCurrentToTarget").addEventListener("click", () => {
    document.getElementById("targetType").value = "same_weight";
    document.getElementById("targetValue").value = "";
    document.getElementById("targetValue2").value = "";
    recalc();
  });

  // Scenarios
  document.getElementById("saveScenarioButton").addEventListener("click", saveCurrentScenario);

  loadScenariosFromStorage();
  recalc();
});

/* ---------- Utilities ---------- */

function getNumber(id) {
  const val = parseFloat(document.getElementById(id).value);
  return Number.isFinite(val) ? val : 0;
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

/* Goal reading */

function getGoal() {
  const type = document.getElementById("targetType").value;
  const value = parseFloat(document.getElementById("targetValue").value) || 0;
  const value2 = parseFloat(document.getElementById("targetValue2").value) || 0;

  updateGoalHelper(type);
  updateGoalValueEnabled(type);

  return { type, value, value2 };
}

function updateGoalHelper(type) {
  const helper = document.getElementById("targetHelper");
  const label1 = document.getElementById("targetValueLabel");
  const label2 = document.getElementById("targetValue2Label");

  let text = "";
  let l1 = "Goal value";
  let l2 = "Second goal value";

  switch (type) {
    case "same_weight":
      text = "Using your current composition as the target.";
      break;
    case "target_weight":
      text = "Set a new total weight. Fat & muscle scale proportionally.";
      l1 = "Target weight (lbs)";
      break;
    case "target_fat_mass":
      text = "Set a fat mass. Muscle stays the same.";
      l1 = "Target fat mass (lbs)";
      break;
    case "target_fat_pct":
      text = "Set a body fat percentage. Muscle stays the same.";
      l1 = "Target body fat (%)";
      break;
    case "target_muscle_mass":
      text = "Set a muscle mass. Fat stays the same.";
      l1 = "Target muscle mass (lbs)";
      break;
    case "target_muscle_pct":
      text = "Set a muscle percentage. Fat stays the same.";
      l1 = "Target muscle (%)";
      break;
    case "target_weight_fat_pct":
      text = "Enter target weight + target fat percent.";
      l1 = "Target weight (lbs)";
      l2 = "Target fat (%)";
      break;
    case "target_weight_muscle_pct":
      text = "Enter target weight + target muscle percent.";
      l1 = "Target weight (lbs)";
      l2 = "Target muscle (%)";
      break;
  }

  helper.textContent = text;
  label1.textContent = l1;
  label2.textContent = l2;
}

function updateGoalValueEnabled(type) {
  const v1 = document.getElementById("targetValue");
  const v2 = document.getElementById("targetValue2");
  const w2 = document.getElementById("targetValue2Wrapper");

  v1.disabled = false;
  v2.disabled = true;
  w2.style.display = "none";

  if (type === "same_weight") {
    v1.disabled = true;
    v1.value = "";
  }

  if (type === "target_weight_fat_pct" || type === "target_weight_muscle_pct") {
    v2.disabled = false;
    w2.style.display = "";
  }
}

/* ---------- Composition ---------- */

function computeBone(weight, fat, muscle) {
  const bone = weight - (fat + muscle);
  return bone > 0 ? bone : 0;
}

function makeComposition(weight, fat, muscle, bone) {
  const w = Math.max(weight, 0);
  const f = Math.max(fat, 0);
  const m = Math.max(muscle, 0);
  const b = Math.max(bone, 0);

  const toPct = (x) => (w > 0 ? (x / w) * 100 : 0);

  return {
    weight: w,
    fatMass: f,
    muscleMass: m,
    boneMass: b,
    fatPct: toPct(f),
    musclePct: toPct(m),
    bonePct: toPct(b)
  };
}

/* ---------- Target Calculation ---------- */

function computeTargetFromGoal(curr, goal) {
  const { weight: cw, fat: cf, muscle: cm } = curr;
  const currentBone = computeBone(cw, cf, cm);

  let tw = cw, tf = cf, tm = cm;

  const v = goal.value;
  const v2 = goal.value2;

  switch (goal.type) {
    case "target_weight":
      tw = Math.max(v, 0);
      if (cw > 0) {
        const fr = cf / cw;
        const mr = cm / cw;
        tf = tw * fr;
        tm = tw * mr;
      }
      break;

    case "target_fat_mass":
      tf = Math.max(v, 0);
      tm = cm;
      tw = tf + tm + currentBone;
      break;

    case "target_fat_pct": {
      const p = v / 100;
      if (p > 0 && p < 1) {
        tw = (cm + currentBone) / (1 - p);
        tf = tw * p;
        tm = cm;
      }
    } break;

    case "target_muscle_mass":
      tm = Math.max(v, 0);
      tf = cf;
      tw = tf + tm + currentBone;
      break;

    case "target_muscle_pct": {
      const p = v / 100;
      if (p > 0 && p < 1) {
        tw = (cf + currentBone) / (1 - p);
        tm = tw * p;
        tf = cf;
      }
    } break;

    case "target_weight_fat_pct": {
      tw = Math.max(v, 0);
      const p = v2 / 100;
      tf = tw * p;
      tm = tw - tf - currentBone;
      if (tm < 0) tm = 0;
    } break;

    case "target_weight_muscle_pct": {
      tw = Math.max(v, 0);
      const p = v2 / 100;
      tm = tw * p;
      tf = tw - tm - currentBone;
      if (tf < 0) tf = 0;
    } break;

    case "same_weight":
    default:
      tw = cw; tf = cf; tm = cm;
  }

  const tb = computeBone(tw, tf, tm);

  return { weight: tw, fat: tf, muscle: tm, bone: tb };
}

/* ---------- Main Calculation ---------- */

function recalc() {
  const current = {
    weight: getNumber("currentWeight"),
    fat: getNumber("currentFat"),
    muscle: getNumber("currentMuscle")
  };

  const currentBone = computeBone(current.weight, current.fat, current.muscle);
  const currentComp = makeComposition(
    current.weight, current.fat, current.muscle, currentBone
  );

  const goal = getGoal();
  const target = computeTargetFromGoal(current, goal);
  const targetComp = makeComposition(
    target.weight, target.fat, target.muscle, target.bone
  );

  // Display % values
  setText("currentFatPct", currentComp.fatPct.toFixed(1));
  setText("currentMusclePct", currentComp.musclePct.toFixed(1));
  setText("currentBonePct", currentComp.bonePct.toFixed(1));

  setText("targetFatPct", targetComp.fatPct.toFixed(1));
  setText("targetMusclePct", targetComp.musclePct.toFixed(1));
  setText("targetBonePct", targetComp.bonePct.toFixed(1));

  const wDiff = targetComp.weight - currentComp.weight;
  const fDiff = targetComp.fatMass - currentComp.fatMass;
  const mDiff = targetComp.muscleMass - currentComp.muscleMass;

  setText("weightDiffText", diffText(wDiff));
  setText("fatChangeText", diffText(fDiff));
  setText("muscleChangeText", diffText(mDiff));

  updateQuickSummary(wDiff, fDiff, mDiff);

  updateChart(currentComp, targetComp);
}

function diffText(delta) {
  if (Math.abs(delta) < 0.01) return "No change";
  const sign = delta > 0 ? "+" : "−";
  return `${sign}${Math.abs(delta).toFixed(2)} lbs`;
}

function updateQuickSummary(w, f, m) {
  const el = document.getElementById("quickSummary");
  const parts = [];

  if (Math.abs(w) >= 0.1)
    parts.push(`${Math.abs(w).toFixed(1)} lbs ${w < 0 ? "lighter" : "heavier"}`);
  if (Math.abs(f) >= 0.1)
    parts.push(`${Math.abs(f).toFixed(1)} lbs ${f < 0 ? "less fat" : "more fat"}`);
  if (Math.abs(m) >= 0.1)
    parts.push(`${Math.abs(m).toFixed(1)} lbs ${m < 0 ? "less muscle" : "more muscle"}`);

  el.textContent = parts.length ? parts.join(" • ") : "No differences.";
}

/* ---------- Chart ---------- */

function updateChart(currentComp, targetComp) {
  const ctx = document.getElementById("compositionChart");

  const data = {
    labels: ["Current", "What-If"],
    datasets: [
      { label: "Fat", data: [currentComp.fatMass, targetComp.fatMass] },
      { label: "Muscle", data: [currentComp.muscleMass, targetComp.muscleMass] },
      { label: "Bone (auto)", data: [currentComp.boneMass, targetComp.boneMass] }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    },
    plugins: { legend: { position: "bottom" } }
  };

  if (compositionChart) {
    compositionChart.data = data;
    compositionChart.update();
  } else {
    compositionChart = new Chart(ctx, { type: "bar", data, options });
  }
}

/* ---------- Scenario Saving (FULL STATE) ---------- */

function loadScenariosFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    scenarios = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(scenarios)) scenarios = [];
  } catch {
    scenarios = [];
  }
  renderScenarioList();
}

function saveScenariosToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

function saveCurrentScenario() {
  const nameInput = document.getElementById("scenarioName");

  const name = nameInput.value.trim() || `Scenario ${scenarios.length + 1}`;

  const scenario = {
    id: Date.now(),
    name,
    inputs: {
      currentWeight: getNumber("currentWeight"),
      currentFat: getNumber("currentFat"),
      currentMuscle: getNumber("currentMuscle"),
      targetType: document.getElementById("targetType").value,
      targetValue1: Number(document.getElementById("targetValue").value) || "",
      targetValue2: Number(document.getElementById("targetValue2").value) || ""
    }
  };

  scenarios.push(scenario);
  saveScenariosToStorage();
  renderScenarioList();
  nameInput.value = "";
}

function renderScenarioList() {
  const list = document.getElementById("scenarioList");
  list.innerHTML = "";

  if (!scenarios.length) {
    list.innerHTML = `<li style="color:#9ca3af;font-size:0.8rem;">No saved scenarios yet.</li>`;
    return;
  }

  scenarios.forEach(s => {
    const li = document.createElement("li");
    li.className = "scenario-item";

    const name = document.createElement("span");
    name.className = "scenario-name";
    name.textContent = s.name;

    const actions = document.createElement("div");
    actions.className = "scenario-actions";

    const loadBtn = document.createElement("button");
    loadBtn.textContent = "Load";
    loadBtn.addEventListener("click", () => applyScenario(s));

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", () => deleteScenario(s.id));

    actions.append(loadBtn, delBtn);
    li.append(name, actions);

    list.appendChild(li);
  });
}

function applyScenario(scenario) {
  const inp = scenario.inputs;

  document.getElementById("currentWeight").value = inp.currentWeight;
  document.getElementById("currentFat").value = inp.currentFat;
  document.getElementById("currentMuscle").value = inp.currentMuscle;

  document.getElementById("targetType").value = inp.targetType;
  document.getElementById("targetValue").value = inp.targetValue1;
  document.getElementById("targetValue2").value = inp.targetValue2;

  recalc();
}

function deleteScenario(id) {
  scenarios = scenarios.filter(s => s.id !== id);
  saveScenariosToStorage();
  renderScenarioList();
}
