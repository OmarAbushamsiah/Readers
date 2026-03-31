(function () {
  var header = document.querySelector(".site-header");
  if (header) {
    var threshold = 8;
    function syncScrollShadow() {
      var y = window.scrollY || document.documentElement.scrollTop;
      header.classList.toggle("site-header--scrolled", y > threshold);
    }
    window.addEventListener("scroll", syncScrollShadow, { passive: true });
    syncScrollShadow();
  }

  var menuBtn = document.getElementById("main-header-menu-btn");
  var navPanel = document.getElementById("main-header-nav-panel");
  var mqMobileNav = window.matchMedia("(max-width: 768px)");

  function closeMobileNav() {
    if (!header || !menuBtn || !navPanel) return;
    header.classList.remove("site-header--nav-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open navigation menu");
  }

  function openMobileNav() {
    if (!header || !menuBtn || !navPanel) return;
    header.classList.add("site-header--nav-open");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close navigation menu");
  }

  function toggleMobileNav() {
    if (!header || !menuBtn) return;
    if (header.classList.contains("site-header--nav-open")) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  if (menuBtn && navPanel && header) {
    menuBtn.addEventListener("click", function () {
      if (!mqMobileNav.matches) return;
      toggleMobileNav();
    });

    navPanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (mqMobileNav.matches) closeMobileNav();
      });
    });

    function onMqNavChange(e) {
      if (!e.matches) closeMobileNav();
    }
    if (typeof mqMobileNav.addEventListener === "function") {
      mqMobileNav.addEventListener("change", onMqNavChange);
    } else if (typeof mqMobileNav.addListener === "function") {
      mqMobileNav.addListener(onMqNavChange);
    }

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobileNav();
    });
  }

  function closeAllLangMenus() {
    document.querySelectorAll(".lang-switcher").forEach(function (sw) {
      var menu = sw.querySelector(".lang-switcher__menu");
      var toggle = sw.querySelector(".lang-switcher__toggle");
      if (menu) menu.hidden = true;
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll(".lang-switcher").forEach(function (root) {
    var btn = root.querySelector(".lang-switcher__toggle");
    var menu = root.querySelector(".lang-switcher__menu");
    var valueEl = root.querySelector(".lang-switcher__value");
    if (!btn || !menu) return;

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var wasClosed = menu.hidden;
      closeAllLangMenus();
      if (wasClosed) {
        menu.hidden = false;
        btn.setAttribute("aria-expanded", "true");
      }
    });

    menu.querySelectorAll(".lang-switcher__option").forEach(function (opt) {
      opt.addEventListener("click", function (e) {
        e.stopPropagation();
        var label = opt.textContent.trim();
        var code = opt.getAttribute("data-lang") || "en";
        if (valueEl) {
          valueEl.textContent = label;
          valueEl.setAttribute("lang", code === "ar" ? "ar" : "en");
        }
        menu.querySelectorAll(".lang-switcher__option").forEach(function (o) {
          o.setAttribute("aria-selected", o === opt ? "true" : "false");
        });
        closeAllLangMenus();
      });
    });
  });

  document.addEventListener("click", closeAllLangMenus);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllLangMenus();
  });
})();
