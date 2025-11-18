// js/theme.js
import { db, updateSettings, saveDB } from "./storage.js";

const THEMES = ["light", "dark", "high-contrast", "midnight", "neon"];

/*
  Theme system:
  - Allows multiple named themes
  - Saves user preference to db.settings.theme
  - Applies CSS theme via <html data-theme="...">
*/

export function initTheme(selectEl) {
  const saved = sanitizeTheme(db.settings.theme || "light");
  applyTheme(saved);
  updateThemeSelect(selectEl, saved);

  selectEl?.addEventListener("change", event => {
    const nextTheme = sanitizeTheme(event.target.value);
    applyTheme(nextTheme);
    updateSettings({ theme: nextTheme });
  });
}

/* ------------------------------------
   Apply theme to the <html> element
------------------------------------- */
function applyTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
}

/* ------------------------------------
   Keep the dropdown in sync
------------------------------------- */
function updateThemeSelect(selectEl, theme) {
  if (!selectEl) return;
  selectEl.value = theme;
}

function sanitizeTheme(theme) {
  if (THEMES.includes(theme)) return theme;
  return "light";
}
