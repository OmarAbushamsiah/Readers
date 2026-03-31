(function () {
  const carousel = document.getElementById("hero-carousel");
  const track = document.getElementById("hero-track");
  if (!carousel || !track) return;

  const slides = track.querySelectorAll(".hero-slide");
  const dots = carousel.querySelectorAll(".hero-dot");
  const toggleBtn = document.getElementById("hero-toggle");

  carousel.style.setProperty("--hero-slides", String(slides.length));
  let index = 0;
  let timer = null;
  let isPlaying = true;
  const autoplayMs = 5500;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function applyReducedMotion() {
    carousel.dataset.reducedMotion = reducedMotion.matches ? "true" : "false";
  }

  function goTo(i) {
    index = ((i % slides.length) + slides.length) % slides.length;
    var pct = (100 / slides.length) * index;
    track.style.transform = "translateX(-" + pct + "%)";

    slides.forEach(function (slide, j) {
      var active = j === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    dots.forEach(function (dot, j) {
      var active = j === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (reducedMotion.matches) return;
    if (!isPlaying) return;
    timer = window.setInterval(function () {
      goTo(index + 1);
    }, autoplayMs);
  }

  function setPlaying(nextPlaying) {
    isPlaying = Boolean(nextPlaying);
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      const label = toggleBtn.querySelector(".hero-toggle__label");
      if (label) label.textContent = isPlaying ? "Pause" : "Play";
    }
    if (isPlaying) startAutoplay();
    else stopAutoplay();
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var i = Number(dot.getAttribute("data-index"));
      if (Number.isNaN(i)) return;
      goTo(i);
      if (isPlaying) startAutoplay();
    });
  });

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      setPlaying(!isPlaying);
    });
  }

  reducedMotion.addEventListener("change", function () {
    applyReducedMotion();
    if (reducedMotion.matches) setPlaying(false);
    else setPlaying(true);
  });

  applyReducedMotion();
  goTo(0);
  setPlaying(!reducedMotion.matches);
})();
