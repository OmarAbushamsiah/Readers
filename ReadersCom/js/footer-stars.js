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

      s.style.left = `${rand(2, 98).toFixed(3)}%`;
      s.style.top = `${rand(4, 96).toFixed(3)}%`;

      const size = rand(0.9, 3.6);
      s.style.setProperty("--star-size", `${size.toFixed(2)}px`);

      const baseAlpha = rand(0.45, 0.9);
      s.style.setProperty("--star-alpha", baseAlpha.toFixed(2));

      const glow = size * (isDark() ? rand(2.8, 6.2) : rand(3.2, 6.8));
      s.style.setProperty("--star-glow", `${glow.toFixed(1)}px`);

      frag.appendChild(s);
    }

    layer.appendChild(frag);
  }

  const mo = new MutationObserver(() => {
    renderStars();
  });

  mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  function scheduleFirst() {
    requestAnimationFrame(function () {
      requestAnimationFrame(renderStars);
    });
  }

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(scheduleFirst, { timeout: 260 });
  } else {
    setTimeout(scheduleFirst, 1);
  }
})();
