(function () {
  const overlay = document.getElementById("welcome-overlay");
  if (!overlay) return;

  const closeBtn = document.getElementById("welcome-close");
  const closeBtnBottom = document.getElementById("welcome-close-bottom");
  const email = document.getElementById("welcome-email");
  const panel = overlay.querySelector(".welcome-panel");
  let isClosing = false;

  function open() {
    overlay.classList.add("is-open");
    // Focus email for convenience (no scroll jump)
    setTimeout(function () {
      if (email) email.focus();
    }, 0);
  }

  function close() {
    if (isClosing) return;
    isClosing = true;

    overlay.classList.add("is-closing");

    const done = function () {
      overlay.classList.remove("is-open");
      overlay.classList.remove("is-closing");
      isClosing = false;
    };

    if (!panel) {
      done();
      return;
    }

    const onEnd = function (e) {
      if (e && e.target !== panel) return;
      // Multiple properties fire transitionend; wait for the slide (transform) to finish
      if (e && e.propertyName && e.propertyName !== "transform") return;
      panel.removeEventListener("transitionend", onEnd);
      done();
    };

    panel.addEventListener("transitionend", onEnd);
    // Safety: if transitionend doesn’t fire (match longest close transition ~5.8s)
    window.setTimeout(onEnd, 6200);
  }

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (closeBtnBottom) closeBtnBottom.addEventListener("click", close);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  // Open on every load/refresh (as requested)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", open);
  } else {
    open();
  }
})();

