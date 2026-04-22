(function () {
  var header = document.querySelector(".site-header");
  if (header) {
    var threshold = 8;
    function syncScrollShadow() {
      var y = window.scrollY || document.documentElement.scrollTop;
      header.classList.toggle("site-header--scrolled", y > threshold);
    }
    window.addEventListener("scroll", syncScrollShadow, { passive: true });
    requestAnimationFrame(syncScrollShadow);
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

  function closeAllAccountMenus() {
    document.querySelectorAll(".account-menu").forEach(function (root) {
      var menu = root.querySelector(".account-menu__dropdown");
      var toggle = root.querySelector(".account-menu__toggle");
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
      closeAllAccountMenus();
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

  document.querySelectorAll(".account-menu").forEach(function (root) {
    var btn = root.querySelector(".account-menu__toggle");
    var menu = root.querySelector(".account-menu__dropdown");
    if (!btn || !menu) return;

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var wasClosed = menu.hidden;
      closeAllLangMenus();
      closeAllAccountMenus();
      if (wasClosed) {
        menu.hidden = false;
        btn.setAttribute("aria-expanded", "true");
      }
    });

    /* Delegation so dynamically rebuilt dropdown links still close the menu */
    root.addEventListener("click", function (e) {
      if (e.target.closest(".account-menu__dropdown a")) {
        closeAllAccountMenus();
      }
    });
  });

  document.addEventListener("click", function () {
    closeAllLangMenus();
    closeAllAccountMenus();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllLangMenus();
      closeAllAccountMenus();
    }
  });
})();

/* ── Country flag toggle + Phone prefix selector ────── */
(function () {
  /* Inject flag-icons stylesheet for real flag images */
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css";
  document.head.appendChild(link);

  var COUNTRIES = [
    { code: "jo", name: "Jordan",       dialCode: "+962", placeholder: "7X XXX XXXX" },
    { code: "sa", name: "Saudi Arabia", dialCode: "+966", placeholder: "5X XXX XXXX" }
  ];

  var currentIdx = 0;

  function flagSpan(code, extraClass) {
    return '<span class="' + (extraClass ? extraClass + " " : "") + 'fi fi-' + code + '" aria-hidden="true"></span>';
  }

  /* ── Inject flag toggle into every .utility-controls ─ */
  document.querySelectorAll(".utility-controls").forEach(function (controls) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "country-toggle";
    btn.setAttribute("aria-label", "Currently Jordan \u2014 click to switch to Saudi Arabia");
    btn.innerHTML =
      flagSpan("jo", "country-toggle__flag") +
      '<svg class="country-toggle__arrow" viewBox="0 0 24 24" width="10" height="10" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M8 5l8 7-8 7V5z"/></svg>';
    controls.insertBefore(btn, controls.firstChild);
  });

  /* ── Phone prefix HTML builder ───────────────────────── */
  function prefixSelectorHtml() {
    return (
      '<div class="phone-prefix">' +
        '<button type="button" class="phone-prefix__btn" aria-expanded="false" aria-haspopup="listbox">' +
          flagSpan("jo", "phone-prefix__flag") +
          '<span class="phone-prefix__code">+962</span>' +
          '<svg class="phone-prefix__chevron" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" focusable="false">' +
            '<path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>' +
          '</svg>' +
        '</button>' +
        '<ul class="phone-prefix__menu" role="listbox" hidden>' +
          '<li role="presentation">' +
            '<button type="button" class="phone-prefix__option" role="option" aria-selected="true" data-idx="0">' +
              flagSpan("jo") + ' Jordan +962' +
            '</button>' +
          '</li>' +
          '<li role="presentation">' +
            '<button type="button" class="phone-prefix__option" role="option" aria-selected="false" data-idx="1">' +
              flagSpan("sa") + ' Saudi Arabia +966' +
            '</button>' +
          '</li>' +
        '</ul>' +
      '</div>'
    );
  }

  /* ── Wrap a static <input type="tel"> ────────────────── */
  function wrapPhoneInput(input) {
    if (input.closest(".phone-field")) return;
    var parent = input.parentElement;

    var icon = parent.querySelector(".pf-input-icon");
    if (icon) icon.remove();
    input.classList.remove("has-icon");

    var wrapper = document.createElement("div");
    wrapper.className = "phone-field";
    wrapper.innerHTML = prefixSelectorHtml();
    parent.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    input.placeholder = COUNTRIES[0].placeholder;
  }

  function initPhonePrefixes() {
    document.querySelectorAll('input[type="tel"]').forEach(wrapPhoneInput);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPhonePrefixes);
  } else {
    initPhonePrefixes();
  }

  /* ── Helpers ──────────────────────────────────────────── */
  function closeAllPhoneMenus() {
    document.querySelectorAll(".phone-prefix__menu").forEach(function (menu) {
      menu.hidden = true;
      var prefixBtn = menu.parentElement && menu.parentElement.querySelector(".phone-prefix__btn");
      if (prefixBtn) prefixBtn.setAttribute("aria-expanded", "false");
    });
  }

  function setPhonePrefixCountry(prefixEl, idx) {
    var c = COUNTRIES[idx];
    var flagEl = prefixEl.querySelector(".phone-prefix__flag");
    var codeEl = prefixEl.querySelector(".phone-prefix__code");
    if (flagEl) flagEl.className = "phone-prefix__flag fi fi-" + c.code;
    if (codeEl) codeEl.textContent = c.dialCode;

    var field = prefixEl.closest(".phone-field");
    var inp = field && field.querySelector('input[type="tel"]');
    if (inp) inp.placeholder = c.placeholder;

    prefixEl.querySelectorAll(".phone-prefix__option").forEach(function (opt, i) {
      opt.setAttribute("aria-selected", i === idx ? "true" : "false");
    });
  }

  function syncToggleLabel(idx) {
    var next = COUNTRIES[1 - idx].name;
    document.querySelectorAll(".country-toggle").forEach(function (btn) {
      var flagEl = btn.querySelector(".country-toggle__flag");
      if (flagEl) flagEl.className = "country-toggle__flag fi fi-" + COUNTRIES[idx].code;
      btn.setAttribute("aria-label", "Currently " + COUNTRIES[idx].name + " \u2014 click to switch to " + next);
    });
  }

  /* ── Event delegation ────────────────────────────────── */
  document.addEventListener("click", function (e) {
    if (e.target.closest(".country-toggle")) {
      currentIdx = 1 - currentIdx;
      syncToggleLabel(currentIdx);
      document.querySelectorAll(".phone-prefix").forEach(function (p) {
        setPhonePrefixCountry(p, currentIdx);
      });
      return;
    }

    var prefixBtn = e.target.closest(".phone-prefix__btn");
    if (prefixBtn) {
      e.stopPropagation();
      var prefix = prefixBtn.closest(".phone-prefix");
      var menu = prefix.querySelector(".phone-prefix__menu");
      var wasOpen = !menu.hidden;
      closeAllPhoneMenus();
      closeAllLangMenus();
      if (!wasOpen) {
        menu.hidden = false;
        prefixBtn.setAttribute("aria-expanded", "true");
      }
      return;
    }

    var opt = e.target.closest(".phone-prefix__option");
    if (opt) {
      e.stopPropagation();
      var idx = parseInt(opt.getAttribute("data-idx"), 10);
      var prefixEl = opt.closest(".phone-prefix");
      setPhonePrefixCountry(prefixEl, idx);
      closeAllPhoneMenus();
      currentIdx = idx;
      syncToggleLabel(idx);
      return;
    }

    closeAllPhoneMenus();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllPhoneMenus();
  });
})();
