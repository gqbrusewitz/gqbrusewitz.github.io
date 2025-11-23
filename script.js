let compositionChart = null;
let scenarios = [];

document.addEventListener("DOMContentLoaded", () => {
  const inputs = [
    "currentWeight",
    "currentFat",
    "currentMuscle",
    "currentBone",
    "targetWeight",
    "targetFat",
    "targetMuscle",
    "targetBone",
  ];

  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", recalc);
    }
  });

  const copyBtn = document.getElementById("copyCurrentToTarget");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyCurrentToTarget);
  }

  const saveBtn = document.getElementById("saveScenarioButton");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveCurrentScenario);
  }

  loadScenariosFromStorage();
  recalc(); // initial render (will just show placeholders)
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

function copyCurrentToTarget() {
  const map = [
    ["currentWeight", "targetWeight"],
    ["currentFat", "targetFat"],
    ["currentMuscle", "targetMuscle"],
    ["currentBone", "targetBone"],
  ];

  map.forEach(([fromId, toId]) => {
    const fromEl = document.getElementById(fromId);
    const toEl = document.getElementById(toId);
    if (fromEl && toEl) {
      toEl.value = fromEl.value;
    }
  });

  recalc();
}

/* ---------- Main calculation ---------- */

function recalc() {
  const current = {
    weight: getNumber("currentWeight"),
    fat: getNumber("currentFat"),
    muscle: getNumber("currentMuscle"),
    bone: getNumber("currentBone"),
  };

  const target = {
    weight: getNumber("targetWeight"),
    fat: getNumber("targetFat"),
    muscle: getNumber("targetMuscle"),
    bone: getNumber("targetBone"),
  };

  const currentComp = computeComposition(current);
  const targetComp = computeComposition(target);

  // Update percentages
  setText("currentFatPct", formatPct(currentComp.fatPct));
  setText("currentMusclePct", formatPct(currentComp.musclePct));
  setText("currentBonePct", formatPct(currentComp.bonePct));
  setText("currentOtherPct", formatPct(currentComp.otherPct));

  setText("targetFatPct", formatPct(targetComp.fatPct));
  setText("targetMusclePct", formatPct(targetComp.musclePct));
  setText("targetBonePct", formatPct(targetComp.bonePct));
  setText("targetOtherPct", formatPct(targetComp.otherPct));

  // Diffs
  const weightDiff = target.weight - current.weight;
  const fatDiff = target.fat - current.fat;
  const muscleDiff = target.muscle - current.muscle;

  // Weight text
  let weightText = "–";
  if (current.weight > 0 && target.weight > 0) {
    const diffAbs = Math.abs(weightDiff).toFixed(2);
    if (Math.abs(weightDiff) < 0.01) {
      weightText = "Same weight.";
    } else if (weightDiff < 0) {
      weightText = `−${diffAbs} lbs (lighter).`;
    } else {
      weightText = `+${diffAbs} lbs (heavier).`;
    }
  }
  setText("weightDiffText", weightText);

  // Fat text
  let fatText = "–";
  if (current.fat > 0 && target.fat > 0) {
    const diffAbs = Math.abs(fatDiff).toFixed(2);
    if (Math.abs(fatDiff) < 0.01) {
      fatText = "No change in fat mass.";
    } else if (fatDiff < 0) {
      fatText = `Lose ${diffAbs} lbs of fat.`;
    } else {
      fatText = `Gain ${diffAbs} lbs of fat.`;
    }
  }
  setText("fatChangeText", fatText);

  // Muscle text
  let muscleText = "–";
  if (current.muscle > 0 && target.muscle > 0) {
    const diffAbs = Math.abs(muscleDiff).toFixed(2);
    if (Math.abs(muscleDiff) < 0.01) {
      muscleText = "No change in muscle mass.";
    } else if (muscleDiff < 0) {
      muscleText = `Lose ${diffAbs} lbs of muscle.`;
    } else {
      muscleText = `Gain ${diffAbs} lbs of muscle.`;
    }
  }
  setText("muscleChangeText", muscleText);

  // Quick summary sentence
  updateQuickSummary(weightDiff, fatDiff, muscleDiff);

  // Chart
  updateChart(current, target);
}

function computeComposition({ weight, fat, muscle, bone }) {
  const safeWeight = weight > 0 ? weight : 0;
  const fatMass = Math.max(fat, 0);
  const muscleMass = Math.max(muscle, 0);
  const boneMass = Math.max(bone, 0);
  const otherMass = Math.max(safeWeight - (fatMass + muscleMass + boneMass), 0);

  const toPct = (mass) =>
    safeWeight > 0 ? (mass / safeWeight) * 100 : 0;

  return {
    fatMass,
    muscleMass,
    boneMass,
    otherMass,
    fatPct: toPct(fatMass),
    musclePct: toPct(muscleMass),
    bonePct: toPct(boneMass),
    otherPct: toPct(otherMass),
  };
}

function formatPct(value) {
  if (!Number.isFinite(value) || value <= 0) return "0.0";
  return value.toFixed(1);
}

function updateQuickSummary(weightDiff, fatDiff, muscleDiff) {
  const summaryEl = document.getElementById("quickSummary");
  if (!summaryEl) return;

  if (
    !Number.isFinite(weightDiff) ||
    !Number.isFinite(fatDiff) ||
    !Number.isFinite(muscleDiff)
  ) {
    summaryEl.textContent =
      "Enter your current and what-if numbers to see a summary.";
    return;
  }

  const parts = [];

  if (Math.abs(weightDiff) >= 0.01) {
    const dir = weightDiff < 0 ? "lighter" : "heavier";
    parts.push(`${Math.abs(weightDiff).toFixed(1)} lbs ${dir}`);
  }

  if (Math.abs(fatDiff) >= 0.01) {
    const dir = fatDiff < 0 ? "less fat" : "more fat";
    parts.push(`${Math.abs(fatDiff).toFixed(1)} lbs ${dir}`);
  }

  if (Math.abs(muscleDiff) >= 0.01) {
    const dir = muscleDiff < 0 ? "less muscle" : "more muscle";
    parts.push(`${Math.abs(muscleDiff).toFixed(1)} lbs ${dir}`);
  }

  if (parts.length === 0) {
    summaryEl.textContent =
      "Current and what-if numbers are effectively the same.";
  } else {
    summaryEl.textContent = parts.join(" • ");
  }
}

/* ---------- Chart ---------- */

function updateChart(current, target) {
  const ctx = document.getElementById("compositionChart");
  if (!ctx) return;

  const currentComp = computeComposition(current);
  const targetComp = computeComposition(target);

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
        label: "Bone",
        data: [currentComp.boneMass, targetComp.boneMass],
      },
      {
        label: "Other",
        data: [currentComp.otherMass, targetComp.otherMass],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
        },
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
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "Weight (lbs)",
        },
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

const STORAGE_KEY = "weightWhatIfScenarios";

function loadScenariosFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      scenarios = [];
      renderScenarioList();
      return;
    }
    const parsed = JSON.parse(raw);
    scenarios = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    scenarios = [];
  }
  renderScenarioList();
}

function saveScenariosToStorage() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch (e) {
    // ignore if storage unavailable
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
    current: {
      weight: getNumber("currentWeight"),
      fat: getNumber("currentFat"),
      muscle: getNumber("currentMuscle"),
      bone: getNumber("currentBone"),
    },
    target: {
      weight: getNumber("targetWeight"),
      fat: getNumber("targetFat"),
      muscle: getNumber("targetMuscle"),
      bone: getNumber("targetBone"),
    },
  };

  scenarios.push(scenario);
  saveScenariosToStorage();
  renderScenarioList();

  if (nameInput) {
    nameInput.value = "";
  }
}

function renderScenarioList() {
  const list = document.getElementById("scenarioList");
  if (!list) return;

  list.innerHTML = "";

  if (scenarios.length === 0) {
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
    ["currentBone", scenario.current.bone],
    ["targetWeight", scenario.target.weight],
    ["targetFat", scenario.target.fat],
    ["targetMuscle", scenario.target.muscle],
    ["targetBone", scenario.target.bone],
  ];

  map.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) {
      el.value =
        value && Number.isFinite(value) ? value.toString() : "";
    }
  });

  recalc();
}

function deleteScenario(id) {
  scenarios = scenarios.filter((s) => s.id !== id);
  saveScenariosToStorage();
  renderScenarioList();
}
