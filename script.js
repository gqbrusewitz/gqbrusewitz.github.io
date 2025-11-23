let compositionChart = null;
let scenarios = [];

const STORAGE_KEY = "weightWhatIfScenarios";

document.addEventListener("DOMContentLoaded", () => {
  const numberInputs = ["currentWeight", "currentFat", "currentMuscle"];
  numberInputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", recalc);
  });

  const targetTypeEl = document.getElementById("targetType");
  const targetValueEl = document.getElementById("targetValue");
  const targetValue2El = document.getElementById("targetValue2");

  if (targetTypeEl) {
    targetTypeEl.addEventListener("change", recalc);
  }
  if (targetValueEl) {
    targetValueEl.addEventListener("input", recalc);
  }
  if (targetValue2El) {
    targetValue2El.addEventListener("input", recalc);
  }

  const resetBtn = document.getElementById("copyCurrentToTarget");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const typeEl = document.getElementById("targetType");
      const valueEl = document.getElementById("targetValue");
      const value2El = document.getElementById("targetValue2");

      if (typeEl) typeEl.value = "same_weight";
      if (valueEl) valueEl.value = "";
      if (value2El) value2El.value = "";

      recalc();
    });
  }

  const saveBtn = document.getElementById("saveScenarioButton");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveCurrentScenario);
  }

  loadScenariosFromStorage();
  recalc();
});

/* ---------- Helpers ---------- */

function getNumber(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const val = parseFloat(el.value);
  return Number.isFinite(val) ? val : 0;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* Goal reading and UI helpers */

function getGoal() {
  const typeEl = document.getElementById("targetType");
  const valueEl = document.getElementById("targetValue");
  const value2El = document.getElementById("targetValue2");

  const type = typeEl ? typeEl.value : "same_weight";

  const v1Raw = valueEl ? parseFloat(valueEl.value) : NaN;
  const v2Raw = value2El ? parseFloat(value2El.value) : NaN;

  const value = Number.isFinite(v1Raw) ? v1Raw : 0;
  const value2 = Number.isFinite(v2Raw) ? v2Raw : 0;

  updateGoalHelper(type);
  updateGoalValueEnabled(type);

  return { type, value, value2 };
}

function updateGoalHelper(type) {
  const helper = document.getElementById("targetHelper");
  const label1 = document.getElementById("targetValueLabel");
  const label2 = document.getElementById("targetValue2Label");

  if (!helper || !label1 || !label2) return;

  let h = "";
  let l1 = "Goal value";
  let l2 = "Second goal value";

  switch (type) {
    case "same_weight":
      h = "Using your current weight, fat, and muscle as the target.";
      l1 = "Goal value";
      break;

    case "target_weight":
      h = "Set a new total weight. Fat & muscle keep the same proportions.";
      l1 = "Target weight (lbs)";
      break;

    case "target_fat_mass":
      h = "Set a specific fat mass (lbs). Muscle and bone stay the same.";
      l1 = "Target fat mass (lbs)";
      break;

    case "target_fat_pct":
      h = "Set a target body fat percentage. Muscle and bone stay the same.";
      l1 = "Target body fat (%)";
      break;

    case "target_muscle_mass":
      h = "Set a specific muscle mass (lbs). Fat and bone stay the same.";
      l1 = "Target muscle mass (lbs)";
      break;

    case "target_muscle_pct":
      h = "Set a target muscle percentage. Fat and bone stay the same.";
      l1 = "Target muscle (%)";
      break;

    case "target_weight_fat_pct":
      h = "Set a target weight and body fat percentage.";
      l1 = "Target weight (lbs)";
      l2 = "Target body fat (%)";
      break;

    case "target_weight_muscle_pct":
      h = "Set a target weight and muscle percentage.";
      l1 = "Target weight (lbs)";
      l2 = "Target muscle (%)";
      break;
  }

  helper.textContent = h;
  label1.textContent = l1;
  label2.textContent = l2;
}

function updateGoalValueEnabled(type) {
  const valueEl = document.getElementById("targetValue");
  const value2El = document.getElementById("targetValue2");
  const value2Wrapper = document.getElementById("targetValue2Wrapper");

  if (!valueEl || !value2El || !value2Wrapper) return;

  // Default: hide second field
  value2Wrapper.style.display = "none";
  value2El.disabled = true;

  if (type === "same_weight") {
    valueEl.disabled = true;
    valueEl.placeholder = "No value needed for this goal";
    valueEl.value = "";
  } else if (type === "target_weight_fat_pct" || type === "target_weight_muscle_pct") {
    valueEl.disabled = false;
    valueEl.placeholder = "Enter target weight";
    value2Wrapper.style.display = "";
    value2El.disabled = false;
    value2El.placeholder = "Enter target %";
  } else {
    valueEl.disabled = false;
    valueEl.placeholder = "Enter your goal";
  }
}

/* ---------- Composition helpers ---------- */

function computeBone(weight, fat, muscle) {
  const bone = weight - (fat + muscle);
  return bone > 0 ? bone : 0;
}

function makeComposition(weight, fat, muscle, bone) {
  const safeW = weight > 0 ? weight : 0;
  const f = Math.max(fat, 0);
  const m = Math.max(muscle, 0);
  const b = Math.max(bone, 0);
  const pct = (x) => (safeW > 0 ? (x / safeW) * 100 : 0);

  return {
    weight: safeW,
    fatMass: f,
    muscleMass: m,
    boneMass: b,
    fatPct: pct(f),
    musclePct: pct(m),
    bonePct: pct(b),
  };
}

/* ---------- Target calculation ---------- */

function computeTargetFromGoal(current, goal) {
  const { weight: cw, fat: cf, muscle: cm } = current;
  const currentBone = computeBone(cw, cf, cm);

  let tw = cw;
  let tf = cf;
  let tm = cm;

  const v1 = goal.value;
  const v2 = goal.value2;

  switch (goal.type) {
    case "target_weight": {
      tw = Math.max(v1, 0);
      if (cw > 0) {
        const fatRatio = cf / cw;
        const muscleRatio = cm / cw;
        tf = tw * fatRatio;
        tm = tw * muscleRatio;
      }
      break;
    }

    case "target_fat_mass": {
      tf = Math.max(v1, 0);
      tm = cm;
      tw = tf + tm + currentBone;
      break;
    }

    case "target_fat_pct": {
      const p = v1 / 100;
      if (p > 0 && p < 1) {
        tw = (cm + currentBone) / (1 - p);
        tf = tw * p;
        tm = cm;
      }
      break;
    }

    case "target_muscle_mass": {
      tm = Math.max(v1, 0);
      tf = cf;
      tw = tf + tm + currentBone;
      break;
    }

    case "target_muscle_pct": {
      const p = v1 / 100;
      if (p > 0 && p < 1) {
        tw = (cf + currentBone) / (1 - p);
        tm = tw * p;
        tf = cf;
      }
      break;
    }

    case "target_weight_fat_pct": {
      const targetWeight = Math.max(v1, 0);
      const p = v2 / 100; // fat %
      tw = targetWeight;
      if (tw > 0 && p >= 0 && p <= 1) {
        tf = tw * p;
        // keep bone approx same as current, muscle is remainder
        tm = tw - tf - currentBone;
        if (tm < 0) tm = 0;
      }
      break;
    }

    case "target_weight_muscle_pct": {
      const targetWeight = Math.max(v1, 0);
      const p = v2 / 100; // muscle %
      tw = targetWeight;
      if (tw > 0 && p >= 0 && p <= 1) {
        tm = tw * p;
        tf = tw - tm - currentBone;
        if (tf < 0) tf = 0;
      }
      break;
    }

    case "same_weight":
    default: {
      tw = cw;
      tf = cf;
      tm = cm;
      break;
    }
  }

  const tb = computeBone(tw, tf, tm);
  return { weight: tw, fat: tf, muscle: tm, bone: tb };
}

/* ---------- Main recalc ---------- */

function recalc() {
  const current = {
    weight: getNumber("currentWeight"),
    fat: getNumber("currentFat"),
    muscle: getNumber("currentMuscle"),
  };

  const currentBone = computeBone(current.weight, current.fat, current.muscle);
  const currentComp = makeComposition(
    current.weight,
    current.fat,
    current.muscle,
    currentBone
  );

  const goal = getGoal();
  const target = computeTargetFromGoal(current, goal);
  const targetComp = makeComposition(
    target.weight,
    target.fat,
    target.muscle,
    target.bone
  );

  // Update % displays
  setText("currentFatPct", currentComp.fatPct.toFixed(1));
  setText("currentMusclePct", currentComp.musclePct.toFixed(1));
  setText("currentBonePct", currentComp.bonePct.toFixed(1));

  setText("targetFatPct", targetComp.fatPct.toFixed(1));
  setText("targetMusclePct", targetComp.musclePct.toFixed(1));
  setText("targetBonePct", targetComp.bonePct.toFixed(1));

  // Differences
  const weightDiff = targetComp.weight - currentComp.weight;
  const fatDiff = targetComp.fatMass - currentComp.fatMass;
  const muscleDiff = targetComp.muscleMass - currentComp.muscleMass;

  setText("weightDiffText", diffText(weightDiff));
  setText("fatChangeText", diffText(fatDiff));
  setText("muscleChangeText", diffText(muscleDiff));

  updateQuickSummary(weightDiff, fatDiff, muscleDiff);

  // Chart
  updateChart(currentComp, targetComp);
}

function diffText(delta) {
  if (!Number.isFinite(delta) || Math.abs(delta) < 0.01) {
    return "No change";
  }
  const sign = delta > 0 ? "+" : "−";
  const abs = Math.abs(delta).toFixed(2);
  return `${sign}${abs} lbs`;
}

function updateQuickSummary(weightDiff, fatDiff, muscleDiff) {
  const el = document.getElementById("quickSummary");
  if (!el) return;

  const parts = [];

  if (Math.abs(weightDiff) >= 0.1) {
    const dir = weightDiff < 0 ? "lighter" : "heavier";
    parts.push(`${Math.abs(weightDiff).toFixed(1)} lbs ${dir}`);
  }

  if (Math.abs(fatDiff) >= 0.1) {
    const dir = fatDiff < 0 ? "less fat" : "more fat";
    parts.push(`${Math.abs(fatDiff).toFixed(1)} lbs ${dir}`);
  }

  if (Math.abs(muscleDiff) >= 0.1) {
    const dir = muscleDiff < 0 ? "less muscle" : "more muscle";
    parts.push(`${Math.abs(muscleDiff).toFixed(1)} lbs ${dir}`);
  }

  if (!parts.length) {
    el.textContent =
      "Current and what-if numbers are effectively the same.";
  } else {
    el.textContent = parts.join(" • ");
  }
}

/* ---------- Chart ---------- */

function updateChart(currentComp, targetComp) {
  const ctx = document.getElementById("compositionChart");
  if (!ctx) return;

  const data = {
    labels: ["Current", "What-If"],
    datasets: [
      {
        label: "Fat",
        data: [currentComp.fatMass, targetComp.fatMass],
      },
      {
        label: "Muscle",
        data: [currentComp.muscleMass, targetComp.muscleMass],
      },
      {
        label: "Bone (auto)",
        data: [currentComp.boneMass, targetComp.boneMass],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            const label = ctx.dataset.label || "";
            const value = ctx.parsed.y;
            return `${label}: ${value.toFixed(2)} lbs`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        title: { display: true, text: "Weight (lbs)" },
      },
    },
  };

  if (compositionChart) {
    compositionChart.data = data;
    compositionChart.update();
  } else {
    compositionChart = new Chart(ctx, {
      type: "bar",
      data,
      options,
    });
  }
}

/* ---------- Saved scenarios ---------- */

function loadScenariosFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    scenarios = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(scenarios)) scenarios = [];
  } catch {
    scenarios = [];
  }
  renderScenarioList();
}

function saveScenariosToStorage() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch {
    // ignore
  }
}

function saveCurrentScenario() {
  const nameInput = document.getElementById("scenarioName");
  const typeEl = document.getElementById("targetType");
  const valueEl = document.getElementById("targetValue");
  const value2El = document.getElementById("targetValue2");

  const name =
    (nameInput && nameInput.value.trim()) ||
    `Scenario ${scenarios.length + 1}`;

  const goalType = typeEl ? typeEl.value : "same_weight";
  const v1Raw = valueEl ? parseFloat(valueEl.value) : NaN;
  const v2Raw = value2El ? parseFloat(value2El.value) : NaN;

  const goalValue = Number.isFinite(v1Raw) ? v1Raw : 0;
  const goalValue2 = Number.isFinite(v2Raw) ? v2Raw : 0;

  const scenario = {
    id: Date.now(),
    name,
    current: {
      weight: getNumber("currentWeight"),
      fat: getNumber("currentFat"),
      muscle: getNumber("currentMuscle"),
    },
    goal: {
      type: goalType,
      value: goalValue,
      value2: goalValue2,
    },
  };

  scenarios.push(scenario);
  saveScenariosToStorage();
  renderScenarioList();

  if (nameInput) nameInput.value = "";
}

function renderScenarioList() {
  const list = document.getElementById("scenarioList");
  if (!list) return;

  list.innerHTML = "";

  if (!scenarios.length) {
    const li = document.createElement("li");
    li.textContent = "No saved scenarios yet.";
    li.style.color = "#9ca3af";
    li.style.fontSize = "0.8rem";
    list.appendChild(li);
    return;
  }

  scenarios.forEach((scenario) => {
    const li = document.createElement("li");
    li.className = "scenario-item";

    const nameSpan = document.createElement("span");
    nameSpan.className = "scenario-name";
    nameSpan.textContent = scenario.name;

    const actions = document.createElement("div");
    actions.className = "scenario-actions";

    const loadBtn = document.createElement("button");
    loadBtn.textContent = "Load";
    loadBtn.addEventListener("click", () => applyScenario(scenario));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => deleteScenario(scenario.id));

    actions.appendChild(loadBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(nameSpan);
    li.appendChild(actions);

    list.appendChild(li);
  });
}

function applyScenario(scenario) {
  const map = [
    ["currentWeight", scenario.current.weight],
    ["currentFat", scenario.current.fat],
    ["currentMuscle", scenario.current.muscle],
  ];

  map.forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = Number.isFinite(val) ? val : "";
  });

  const typeEl = document.getElementById("targetType");
  const valueEl = document.getElementById("targetValue");
  const value2El = document.getElementById("targetValue2");

  if (typeEl) typeEl.value = scenario.goal.type || "same_weight";

  if (valueEl) {
    valueEl.value =
      Number.isFinite(scenario.goal.value) &&
      scenario.goal.type !== "same_weight"
        ? scenario.goal.value
        : "";
  }

  if (value2El) {
    value2El.value =
      Number.isFinite(scenario.goal.value2) &&
      (scenario.goal.type === "target_weight_fat_pct" ||
        scenario.goal.type === "target_weight_muscle_pct")
        ? scenario.goal.value2
        : "";
  }

  recalc();
}

function deleteScenario(id) {
  scenarios = scenarios.filter((s) => s.id !== id);
  saveScenariosToStorage();
  renderScenarioList();
}
