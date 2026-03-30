(function () {
  function gapPx(track) {
    var g = getComputedStyle(track).gap;
    if (!g || g === "normal") return 0;
    var v = parseFloat(g);
    return Number.isFinite(v) ? v : 0;
  }

  function perView() {
    var w = window.innerWidth;
    if (w <= 600) return 2;
    if (w <= 1100) return 3;
    return 6;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function bindCarousel(carousel) {
    var track = carousel.querySelector(".bestsellers__track");
    var prevBtn = carousel.querySelector(".bestsellers__nav--prev");
    var nextBtn = carousel.querySelector(".bestsellers__nav--next");
    if (!track || !prevBtn || !nextBtn) return;

    var popOnTransitionEnd = null;

    function detachPopTransitionListener() {
      if (popOnTransitionEnd) {
        track.removeEventListener("transitionend", popOnTransitionEnd);
        popOnTransitionEnd = null;
      }
    }

    function attachPopAfterSlide(dir) {
      detachPopTransitionListener();
      popOnTransitionEnd = function (e) {
        if (e.target !== track) return;
        var prop = e.propertyName;
        if (prop !== "transform" && prop !== "-webkit-transform") return;
        detachPopTransitionListener();
        runEdgePop(dir);
      };
      track.addEventListener("transitionend", popOnTransitionEnd);
    }

    function cards() {
      return track.querySelectorAll(".book-card");
    }

    function stepPx() {
      var list = cards();
      if (!list.length) return 0;
      return list[0].getBoundingClientRect().width + gapPx(track);
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

    function runEdgePop(dir) {
      if (prefersReducedMotion()) return;
      var list = cards();
      var v = perView();
      var el =
        dir === "next"
          ? list[index + v - 1]
          : list[index];
      if (!el) return;
      var cover = el.querySelector(".book-card__cover");
      if (!cover) return;
      el.classList.remove("book-card--pop");
      void cover.offsetWidth;
      el.classList.add("book-card--pop");
      function onPopEnd(e) {
        if (e.target !== cover) return;
        cover.removeEventListener("animationend", onPopEnd);
        el.classList.remove("book-card--pop");
      }
      cover.addEventListener("animationend", onPopEnd);
    }

    function apply(instant) {
      var max = maxIndex();
      index = Math.min(Math.max(0, index), max);
      var step = stepPx();
      if (instant) {
        track.classList.add("bestsellers__track--instant");
      }
      track.style.transform = step
        ? "translate3d(-" + index * step + "px, 0, 0)"
        : "none";
      updateButtons();
      if (instant) {
        void track.offsetHeight;
        track.classList.remove("bestsellers__track--instant");
      }
    }

    prevBtn.addEventListener("click", function () {
      var before = index;
      var newIndex = Math.max(0, index - 1);
      if (newIndex !== before && !prefersReducedMotion()) {
        attachPopAfterSlide("prev");
      }
      index = newIndex;
      apply(false);
    });

    nextBtn.addEventListener("click", function () {
      var before = index;
      var newIndex = Math.min(maxIndex(), index + 1);
      if (newIndex !== before && !prefersReducedMotion()) {
        attachPopAfterSlide("next");
      }
      index = newIndex;
      apply(false);
    });

    window.addEventListener(
      "resize",
      function () {
        detachPopTransitionListener();
        index = Math.min(index, maxIndex());
        apply(true);
      },
      { passive: true }
    );

    function runApply() {
      requestAnimationFrame(function () {
        apply(true);
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(runApply);
    } else {
      window.addEventListener("load", runApply);
    }

    runApply();
  }

  document.querySelectorAll(".bestsellers__carousel").forEach(bindCarousel);
})();
