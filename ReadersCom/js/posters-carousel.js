(function () {
  var track = document.getElementById("posters-track");
  var viewport = track && track.closest(".posters__viewport");
  var prevBtn = document.getElementById("posters-prev");
  var nextBtn = document.getElementById("posters-next");
  if (!track || !viewport || !prevBtn || !nextBtn) return;

  function cards() {
    return track.querySelectorAll(".poster-card");
  }

  function perView() {
    var w = window.innerWidth;
    if (w <= 520) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  function gapPx() {
    var g = getComputedStyle(track).gap;
    if (!g || g === "normal") return 0;
    var v = parseFloat(g);
    return Number.isFinite(v) ? v : 0;
  }

  function stepPx() {
    var list = cards();
    if (!list.length) return 0;
    return list[0].getBoundingClientRect().width + gapPx();
  }

  function maxIndex() {
    var n = cards().length;
    var v = perView();
    return Math.max(0, n - v);
  }

  var index = 0;

  function updateButtons() {
    var max = maxIndex();
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= max;
  }

  function apply() {
    var max = maxIndex();
    index = Math.min(Math.max(0, index), max);
    var step = stepPx();
    track.style.transform = step ? "translateX(-" + index * step + "px)" : "none";
    updateButtons();
  }

  prevBtn.addEventListener("click", function () {
    index = Math.max(0, index - 1);
    apply();
  });

  nextBtn.addEventListener("click", function () {
    index = Math.min(maxIndex(), index + 1);
    apply();
  });

  window.addEventListener(
    "resize",
    function () {
      index = Math.min(index, maxIndex());
      apply();
    },
    { passive: true }
  );

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    track.style.transitionDuration = "0.01ms";
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      requestAnimationFrame(apply);
    });
  } else {
    window.addEventListener("load", function () {
      requestAnimationFrame(apply);
    });
  }

  requestAnimationFrame(apply);
})();
