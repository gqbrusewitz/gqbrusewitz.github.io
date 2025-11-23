/* script.js — Weight What-If Calculator with Theme + Advanced Goals */

let compositionChart = null;
let scenarios = [];
const STORAGE_KEY = "weightWhatIfScenarios";
const THEME_KEY = "ww_theme";
const TAB_KEY = "ww_active_tab";

/* ---------- Theme handling ---------- */

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
  }
}

function initTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch {
    stored = null;
  }

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initial = stored || (prefersDark ? "dark" : "light");
  applyTheme(initial);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current =
        document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // ignore
      }
    });
  }
}

/* ---------- Tabs ---------- */

function initTabs() {
  const buttons = Array.from(document.querySelectorAll(".tab-button"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));
  if (!buttons.length || !panels.length) return;

  let stored = null;
  try {
    stored = localStorage.getItem(TAB_KEY);
  } catch {
    stored = null;
  }

  const initial = stored === "workout" ? "workout" : "calculator";
  setActiveTab(initial, buttons, panels);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      setActiveTab(target, buttons, panels);
    });
  });
}

function setActiveTab(tab, buttons, panels) {
  const targetId = `${tab}Tab`;
  buttons.forEach((btn) => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
    btn.setAttribute("tabindex", isActive ? "0" : "-1");
  });

  panels.forEach((panel) => {
    const match = panel.id === targetId;
    panel.hidden = !match;
    panel.setAttribute("aria-hidden", match ? "false" : "true");
  });

  try {
    localStorage.setItem(TAB_KEY, tab);
  } catch {
    // ignore
  }
}

/* ---------- Startup ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initTabs();

  // Current inputs
  ["currentWeight", "currentFat", "currentMuscle"].forEach((id) => {
    document.getElementById(id).addEventListener("input", recalc);
  });

  // Goal type + values
  document.getElementById("targetType").addEventListener("change", recalc);
  document.getElementById("targetValue").addEventListener("input", recalc);
  document.getElementById("targetValue2").addEventListener("input", recalc);
  document.getElementById("targetValue3").addEventListener("input", recalc);

  // Reset goal
  document
    .getElementById("copyCurrentToTarget")
    .addEventListener("click", () => {
      document.getElementById("targetType").value = "same_weight";
      document.getElementById("targetValue").value = "";
      document.getElementById("targetValue2").value = "";
      document.getElementById("targetValue3").value = "";
      recalc();
    });

  // Scenarios
  document
    .getElementById("saveScenarioButton")
    .addEventListener("click", saveCurrentScenario);

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

/* ---------- Goal handling ---------- */

function getGoal() {
  const type = document.getElementById("targetType").value;
  const v1 = parseFloat(document.getElementById("targetValue").value) || 0;
  const v2 = parseFloat(document.getElementById("targetValue2").value) || 0;
  const v3 = parseFloat(document.getElementById("targetValue3").value) || 0;

  updateGoalHelper(type);
  updateGoalValueEnabled(type);

  return { type, value: v1, value2: v2, value3: v3 };
}

function updateGoalHelper(type) {
  const helper = document.getElementById("targetHelper");
  const label1 = document.getElementById("targetValueLabel");
  const label2 = document.getElementById("targetValue2Label");
  const label3 = document.getElementById("targetValue3Label");

  let text = "";
  let l1 = "Goal value";
  let l2 = "Second goal value";
  let l3 = "Third goal value";

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
      text = "Enter target weight + body fat percent.";
      l1 = "Target weight (lbs)";
      l2 = "Target body fat (%)";
      break;
    case "target_weight_muscle_pct":
      text = "Enter target weight + muscle percent.";
      l1 = "Target weight (lbs)";
      l2 = "Target muscle (%)";
      break;
    case "target_weight_fat_muscle_pct":
      text = "Enter target weight, fat %, and muscle %.";
      l1 = "Target weight (lbs)";
      l2 = "Target body fat (%)";
      l3 = "Target muscle (%)";
      break;
  }

  helper.textContent = text;
  label1.textContent = l1;
  label2.textContent = l2;
  label3.textContent = l3;
}

function updateGoalValueEnabled(type) {
  const v1 = document.getElementById("targetValue");
  const v2 = document.getElementById("targetValue2");
  const v3 = document.getElementById("targetValue3");
  const w2 = document.getElementById("targetValue2Wrapper");
  const w3 = document.getElementById("targetValue3Wrapper");

  // Default
  v1.disabled = false;
  v2.disabled = true;
  v3.disabled = true;
  w2.style.display = "none";
  w3.style.display = "none";

  if (type === "same_weight") {
    v1.disabled = true;
    v1.value = "";
    v2.value = "";
    v3.value = "";
  }

  if (type === "target_weight_fat_pct" || type === "target_weight_muscle_pct") {
    v2.disabled = false;
    w2.style.display = "";
  }

  if (type === "target_weight_fat_muscle_pct") {
    v2.disabled = false;
    v3.disabled = false;
    w2.style.display = "";
    w3.style.display = "";
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
    bonePct: toPct(b),
  };
}

/* ---------- Target calculation ---------- */

function computeTargetFromGoal(curr, goal) {
  const { weight: cw, fat: cf, muscle: cm } = curr;
  const currentBone = computeBone(cw, cf, cm);

  let tw = cw;
  let tf = cf;
  let tm = cm;

  const v = goal.value;
  const v2 = goal.value2;
  const v3 = goal.value3;

  switch (goal.type) {
    case "target_weight": {
      tw = Math.max(v, 0);
      if (cw > 0) {
        const fatRatio = cf / cw;
        const muscleRatio = cm / cw;
        tf = tw * fatRatio;
        tm = tw * muscleRatio;
      }
      break;
    }

    case "target_fat_mass": {
      tf = Math.max(v, 0);
      tm = cm;
      tw = tf + tm + currentBone;
      break;
    }

    case "target_fat_pct": {
      const p = v / 100;
      if (p > 0 && p < 1) {
        tw = (cm + currentBone) / (1 - p);
        tf = tw * p;
        tm = cm;
      }
      break;
    }

    case "target_muscle_mass": {
      tm = Math.max(v, 0);
      tf = cf;
      tw = tf + tm + currentBone;
      break;
    }

    case "target_muscle_pct": {
      const p = v / 100;
      if (p > 0 && p < 1) {
        tw = (cf + currentBone) / (1 - p);
        tm = tw * p;
        tf = cf;
      }
      break;
    }

    case "target_weight_fat_pct": {
      tw = Math.max(v, 0);
      const p = v2 / 100;
      tf = tw * p;
      tm = tw - tf - currentBone;
      if (tm < 0) tm = 0;
      break;
    }

    case "target_weight_muscle_pct": {
      tw = Math.max(v, 0);
      const p = v2 / 100;
      tm = tw * p;
      tf = tw - tm - currentBone;
      if (tf < 0) tf = 0;
      break;
    }

    case "target_weight_fat_muscle_pct": {
      tw = Math.max(v, 0);
      let pF = Math.max(v2 / 100, 0);
      let pM = Math.max(v3 / 100, 0);
      let sum = pF + pM;

      if (sum > 1 && sum > 0) {
        // Normalize so fat% + muscle% = 100%, bone% = 0
        pF = pF / sum;
        pM = pM / sum;
      }

      tf = tw * pF;
      tm = tw * pM;
      // Bone will be whatever remainder is left; could be 0 if sums to 1
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

/* ---------- Summary pill ---------- */

function updateSummaryPill(currentComp, targetComp) {
  const pill = document.getElementById("summaryPill");
  if (!pill) return;

  if (currentComp.weight <= 0 || targetComp.weight <= 0) {
    pill.textContent =
      "Enter your current stats and goal to see a quick summary here.";
    return;
  }

  const cw = currentComp.weight.toFixed(1);
  const cFat = currentComp.fatPct.toFixed(1);
  const tw = targetComp.weight.toFixed(1);
  const tFat = targetComp.fatPct.toFixed(1);
  const tMuscle = targetComp.musclePct.toFixed(1);

  pill.textContent = "";
  const strong = document.createElement("strong");
  strong.textContent = `${cw} lbs · ${cFat}% fat`;
  const arrow = document.createTextNode("  →  ");
  const targetSpan = document.createElement("span");
  targetSpan.textContent = `${tw} lbs · ${tFat}% fat · ${tMuscle}% muscle`;

  pill.appendChild(strong);
  pill.appendChild(arrow);
  pill.appendChild(targetSpan);
}

/* ---------- Main calculation ---------- */

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

  // Percentages
  setText("currentFatPct", currentComp.fatPct.toFixed(1));
  setText("currentMusclePct", currentComp.musclePct.toFixed(1));
  setText("currentBonePct", currentComp.bonePct.toFixed(1));

  setText("targetFatPct", targetComp.fatPct.toFixed(1));
  setText("targetMusclePct", targetComp.musclePct.toFixed(1));
  setText("targetBonePct", targetComp.bonePct.toFixed(1));

  // Differences
  const wDiff = targetComp.weight - currentComp.weight;
  const fDiff = targetComp.fatMass - currentComp.fatMass;
  const mDiff = targetComp.muscleMass - currentComp.muscleMass;

  setText("weightDiffText", diffText(wDiff));
  setText("fatChangeText", diffText(fDiff));
  setText("muscleChangeText", diffText(mDiff));

  updateQuickSummary(wDiff, fDiff, mDiff);
  updateChart(currentComp, targetComp);
  updateSummaryPill(currentComp, targetComp);
}

function diffText(delta) {
  if (!Number.isFinite(delta) || Math.abs(delta) < 0.01) {
    return "No change";
  }
  const sign = delta > 0 ? "+" : "−";
  return `${sign}${Math.abs(delta).toFixed(2)} lbs`;
}

function updateQuickSummary(w, f, m) {
  const el = document.getElementById("quickSummary");
  const parts = [];

  if (Math.abs(w) >= 0.1) {
    const dir = w < 0 ? "lighter" : "heavier";
    parts.push(`${Math.abs(w).toFixed(1)} lbs ${dir}`);
  }
  if (Math.abs(f) >= 0.1) {
    const dir = f < 0 ? "less fat" : "more fat";
    parts.push(`${Math.abs(f).toFixed(1)} lbs ${dir}`);
  }
  if (Math.abs(m) >= 0.1) {
    const dir = m < 0 ? "less muscle" : "more muscle";
    parts.push(`${Math.abs(m).toFixed(1)} lbs ${dir}`);
  }

  el.textContent =
    parts.length === 0
      ? "Current and what-if numbers are effectively the same."
      : parts.join(" • ");
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
          label: (ctx) =>
            `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} lbs`,
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
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

/* ---------- Scenarios (full state) ---------- */

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch {
    // ignore
  }
}

function saveCurrentScenario() {
  const nameInput = document.getElementById("scenarioName");
  const name =
    (nameInput && nameInput.value.trim()) ||
    `Scenario ${scenarios.length + 1}`;

  const scenario = {
    id: Date.now(),
    name,
    inputs: {
      currentWeight: getNumber("currentWeight"),
      currentFat: getNumber("currentFat"),
      currentMuscle: getNumber("currentMuscle"),
      targetType: document.getElementById("targetType").value,
      targetValue1:
        parseFloat(document.getElementById("targetValue").value) || "",
      targetValue2:
        parseFloat(document.getElementById("targetValue2").value) || "",
      targetValue3:
        parseFloat(document.getElementById("targetValue3").value) || "",
    },
  };

  scenarios.push(scenario);
  saveScenariosToStorage();
  renderScenarioList();

  if (nameInput) nameInput.value = "";
}

function renderScenarioList() {
  const list = document.getElementById("scenarioList");
  list.innerHTML = "";

  if (!scenarios.length) {
    list.innerHTML =
      '<li style="color:#9ca3af;font-size:0.8rem;">No saved scenarios yet.</li>';
    return;
  }

  scenarios.forEach((s) => {
    const li = document.createElement("li");
    li.className = "scenario-item";

    const nameSpan = document.createElement("span");
    nameSpan.className = "scenario-name";
    nameSpan.textContent = s.name;

    const actions = document.createElement("div");
    actions.className = "scenario-actions";

    const loadBtn = document.createElement("button");
    loadBtn.textContent = "Load";
    loadBtn.addEventListener("click", () => applyScenario(s));

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", () => deleteScenario(s.id));

    actions.append(loadBtn, delBtn);
    li.append(nameSpan, actions);
    list.appendChild(li);
  });
}

function applyScenario(scenario) {
  const inp = scenario.inputs || {};

  document.getElementById("currentWeight").value =
    inp.currentWeight ?? "";
  document.getElementById("currentFat").value = inp.currentFat ?? "";
  document.getElementById("currentMuscle").value =
    inp.currentMuscle ?? "";

  document.getElementById("targetType").value =
    inp.targetType || "same_weight";

  document.getElementById("targetValue").value =
    inp.targetValue1 ?? "";
  document.getElementById("targetValue2").value =
    inp.targetValue2 ?? "";
  document.getElementById("targetValue3").value =
    inp.targetValue3 ?? "";

  recalc();
}

function deleteScenario(id) {
  scenarios = scenarios.filter((s) => s.id !== id);
  saveScenariosToStorage();
  renderScenarioList();
}
