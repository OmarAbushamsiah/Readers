(function () {
  const carousel = document.getElementById("hero-carousel");
  const track = document.getElementById("hero-track");
  if (!carousel || !track) return;

  const slides = track.querySelectorAll(".hero-slide");
  const dots = carousel.querySelectorAll(".hero-dot");
  const prevBtn = document.getElementById("hero-prev");
  const nextBtn = document.getElementById("hero-next");
  let index = 0;
  let timer = null;
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
    timer = window.setInterval(function () {
      goTo(index + 1);
    }, autoplayMs);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var i = Number(dot.getAttribute("data-index"));
      if (Number.isNaN(i)) return;
      goTo(i);
      startAutoplay();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      goTo(index - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      goTo(index + 1);
      startAutoplay();
    });
  }

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);

  reducedMotion.addEventListener("change", function () {
    applyReducedMotion();
    startAutoplay();
  });

  applyReducedMotion();
  goTo(0);
  startAutoplay();
})();
