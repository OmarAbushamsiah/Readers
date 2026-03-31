(() => {
  const root = document.documentElement;
  const layer = document.querySelector(".site-footer__day-stars");
  if (!layer) return;

  const STAR_COUNT = 70;

  function isDark() {
    return root?.dataset?.theme === "dark";
  }

  function clearStars() {
    while (layer.firstChild) layer.removeChild(layer.firstChild);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function renderStars() {
    clearStars();

    const frag = document.createDocumentFragment();

    for (let i = 0; i < STAR_COUNT; i++) {
      const s = document.createElement("span");
      s.className = "site-footer__star";

      // Distribute over whole footer background
      s.style.left = `${rand(2, 98).toFixed(3)}%`;
      s.style.top = `${rand(4, 96).toFixed(3)}%`;

      // Slightly bigger so they’re visible
      const size = rand(1.4, 2.6);
      s.style.setProperty("--star-size", `${size.toFixed(2)}px`);

      // Each star twinkles independently
      const dur = rand(3.2, 7.8);
      const delay = -rand(0, dur);
      s.style.setProperty("--twinkle-dur", `${dur.toFixed(2)}s`);
      s.style.setProperty("--twinkle-delay", `${delay.toFixed(2)}s`);

      const baseAlpha = rand(0.45, 0.9);
      s.style.setProperty("--star-alpha", baseAlpha.toFixed(2));

      // Stronger glow overall (still “far”, but more visible)
      const glow = isDark() ? rand(6, 16) : rand(7, 18);
      s.style.setProperty("--star-glow", `${glow.toFixed(1)}px`);

      frag.appendChild(s);
    }

    layer.appendChild(frag);
  }

  // Initial render + re-render on theme toggle
  renderStars();

  const mo = new MutationObserver(() => {
    renderStars();
  });

  mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
})();

