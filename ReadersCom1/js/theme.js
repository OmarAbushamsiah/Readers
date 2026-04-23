(function () {
  const storageKey = "readers_theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark") root.dataset.theme = "dark";
    else delete root.dataset.theme;
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function setSavedTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // ignore
    }
  }

  const initial = getSavedTheme();
  applyTheme(initial === "dark" ? "dark" : "light");

  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  function syncPressed() {
    const isDark = root.dataset.theme === "dark";
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
  }

  btn.addEventListener("click", function () {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setSavedTheme(next);
    syncPressed();
  });

  syncPressed();
})();

