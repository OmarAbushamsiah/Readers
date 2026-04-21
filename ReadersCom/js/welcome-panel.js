(function () {
  const overlay = document.getElementById("welcome-overlay");
  if (!overlay) return;

  const closeBtn = document.getElementById("welcome-close");
  const closeBtnBottom = document.getElementById("welcome-close-bottom");
  const email = document.getElementById("welcome-email");

  function open() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    // Focus email for convenience (no scroll jump)
    setTimeout(function () {
      if (email) email.focus();
    }, 0);
  }

  function close() {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    overlay.classList.remove("is-closing");
    overlay.setAttribute("aria-hidden", "true");
  }

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (closeBtnBottom) closeBtnBottom.addEventListener("click", close);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  // Open on every load/refresh (runs with other deferred scripts; DOM is ready)
  open();
})();

