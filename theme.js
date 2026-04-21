(function () {
  function readTheme() {
    try {
      return localStorage.getItem("fitTrackTheme") === "dark"
        ? "dark"
        : "light";
    } catch (error) {
      return "light";
    }
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.toggle("dark", isDark);
    return isDark;
  }

  applyTheme(readTheme());

  window.toggleThemeGlobal = function toggleThemeGlobal() {
    const isDark = !document.body.classList.contains("dark");
    applyTheme(isDark ? "dark" : "light");

    try {
      localStorage.setItem("fitTrackTheme", isDark ? "dark" : "light");
    } catch (error) {
      console.warn("Unable to save theme preference:", error);
    }

    return isDark;
  };
})();
