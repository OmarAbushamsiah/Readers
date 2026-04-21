(function () {
  function runPosters() {
  function init() {
    var track = document.getElementById("posters-track");
    var viewport = track && track.closest(".posters__viewport");
    var prevBtn = document.getElementById("posters-prev");
    var nextBtn = document.getElementById("posters-next");
    if (!track || !viewport || !prevBtn || !nextBtn) return;
    if (track.dataset.readersPostersInit === "1") return;
    track.dataset.readersPostersInit = "1";

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
  }

  if (!document.getElementById("posters-track")) return;

  var postersRoot = document.querySelector(".posters");

  function arm() {
    init();
  }

  if (typeof IntersectionObserver === "function" && postersRoot) {
    var io = new IntersectionObserver(
      function (entries) {
        if (!entries.some(function (e) {
          return e.isIntersecting;
        })) return;
        io.disconnect();
        arm();
      },
      { root: null, rootMargin: "280px 0px", threshold: 0.01 }
    );
    io.observe(postersRoot);
    window.addEventListener("load", arm, { once: true });
  } else {
    arm();
  }
  }

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(runPosters, { timeout: 240 });
  } else {
    setTimeout(runPosters, 1);
  }
})();
