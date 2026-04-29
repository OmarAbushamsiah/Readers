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
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css";
  document.head.appendChild(link);

  var COUNTRIES = [
    { code: "jo", name: "Jordan",         dialCode: "+962", placeholder: "7X XXX XXXX" },
    { code: "sa", name: "Saudi Arabia",   dialCode: "+966", placeholder: "5X XXX XXXX" },
    { code: "ae", name: "UAE",            dialCode: "+971", placeholder: "5X XXX XXXX" },
    { code: "eg", name: "Egypt",          dialCode: "+20",  placeholder: "1X XXXX XXXX" },
    { code: "kw", name: "Kuwait",         dialCode: "+965", placeholder: "XXXX XXXX" },
    { code: "qa", name: "Qatar",          dialCode: "+974", placeholder: "XXXX XXXX" },
    { code: "bh", name: "Bahrain",        dialCode: "+973", placeholder: "XXXX XXXX" },
    { code: "om", name: "Oman",           dialCode: "+968", placeholder: "XXXX XXXX" },
    { code: "lb", name: "Lebanon",        dialCode: "+961", placeholder: "X XXX XXX" },
    { code: "iq", name: "Iraq",           dialCode: "+964", placeholder: "7XX XXX XXXX" },
    { code: "sy", name: "Syria",          dialCode: "+963", placeholder: "9XX XXX XXX" },
    { code: "ps", name: "Palestine",      dialCode: "+970", placeholder: "5X XXXX XXXX" },
    { code: "ye", name: "Yemen",          dialCode: "+967", placeholder: "7XX XXX XXX" },
    { code: "ly", name: "Libya",          dialCode: "+218", placeholder: "9X XXX XXXX" },
    { code: "tn", name: "Tunisia",        dialCode: "+216", placeholder: "2X XXX XXX" },
    { code: "dz", name: "Algeria",        dialCode: "+213", placeholder: "5XX XX XX XX" },
    { code: "ma", name: "Morocco",        dialCode: "+212", placeholder: "6XX XXX XXX" },
    { code: "sd", name: "Sudan",          dialCode: "+249", placeholder: "9X XXX XXXX" },
    { code: "us", name: "United States",  dialCode: "+1",   placeholder: "(XXX) XXX-XXXX" },
    { code: "gb", name: "United Kingdom", dialCode: "+44",  placeholder: "7XXX XXXXXX" },
    { code: "de", name: "Germany",        dialCode: "+49",  placeholder: "1XX XXXXXXXX" },
    { code: "fr", name: "France",         dialCode: "+33",  placeholder: "6XX XX XX XX" },
    { code: "tr", name: "Turkey",         dialCode: "+90",  placeholder: "5XX XXX XXXX" },
    { code: "pk", name: "Pakistan",       dialCode: "+92",  placeholder: "3XX XXXXXXX" },
    { code: "in", name: "India",          dialCode: "+91",  placeholder: "XXXXX XXXXX" },
    { code: "ca", name: "Canada",         dialCode: "+1",   placeholder: "(XXX) XXX-XXXX" },
  ];

  var currentIdx = 0;

  function escHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function flagSpan(code, extraClass) {
    return '<span class="' + (extraClass ? extraClass + " " : "") + 'fi fi-' + code + '" aria-hidden="true"></span>';
  }

  /* ── Inject flag toggle into every .utility-controls ─ */
  document.querySelectorAll(".utility-controls").forEach(function (controls) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "country-toggle";
    btn.setAttribute("aria-label", "Currently Jordan — click to switch to Saudi Arabia");
    btn.innerHTML =
      flagSpan("jo", "country-toggle__flag") +
      '<svg class="country-toggle__arrow" viewBox="0 0 24 24" width="10" height="10" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M8 5l8 7-8 7V5z"/></svg>';
    controls.insertBefore(btn, controls.firstChild);
  });

  /* ── Phone prefix HTML builder ───────────────────────── */
  function prefixSelectorHtml() {
    var c0 = COUNTRIES[0];
    var listItems = COUNTRIES.map(function (c, i) {
      return (
        '<li role="presentation">' +
          '<button type="button" class="phone-prefix__option" role="option" ' +
            'aria-selected="' + (i === 0 ? "true" : "false") + '" data-idx="' + i + '">' +
            flagSpan(c.code) +
            '<span class="phone-prefix__option-name">' + escHtml(c.name) + '</span>' +
            '<span class="phone-prefix__option-dial">' + escHtml(c.dialCode) + '</span>' +
          '</button>' +
        '</li>'
      );
    }).join('');

    return (
      '<div class="phone-prefix">' +
        '<button type="button" class="phone-prefix__btn" aria-expanded="false" aria-haspopup="listbox">' +
          flagSpan(c0.code, "phone-prefix__flag") +
          '<span class="phone-prefix__code">' + escHtml(c0.dialCode) + '</span>' +
          '<svg class="phone-prefix__chevron" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" focusable="false">' +
            '<path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>' +
          '</svg>' +
        '</button>' +
        '<div class="phone-prefix__menu" hidden>' +
          '<div class="phone-prefix__search-wrap">' +
            '<i class="fa-solid fa-magnifying-glass phone-prefix__search-icon" aria-hidden="true"></i>' +
            '<input type="text" class="phone-prefix__search" placeholder="Search country…" autocomplete="off" aria-label="Search country">' +
          '</div>' +
          '<ul class="phone-prefix__list" role="listbox">' +
            listItems +
          '</ul>' +
        '</div>' +
      '</div>'
    );
  }

  /* Expose for use in other scripts (e.g. cart-page.js) */
  window._phonePrefixHtml = prefixSelectorHtml;
  window._phoneCountries  = COUNTRIES;

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
      /* Reset search */
      var si = menu.querySelector(".phone-prefix__search");
      if (si) si.value = "";
      menu.querySelectorAll(".phone-prefix__list li").forEach(function (li) {
        li.style.display = "";
      });
    });
  }

  function setPhonePrefixCountry(prefixEl, idx) {
    var c = COUNTRIES[idx];
    if (!c) return;
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
    var c = COUNTRIES[Math.min(idx, 1)];
    var next = COUNTRIES[idx === 0 ? 1 : 0].name;
    document.querySelectorAll(".country-toggle").forEach(function (btn) {
      var flagEl = btn.querySelector(".country-toggle__flag");
      if (flagEl) flagEl.className = "country-toggle__flag fi fi-" + COUNTRIES[idx].code;
      btn.setAttribute("aria-label", "Currently " + COUNTRIES[idx].name + " — click to switch to " + next);
    });
  }

  /* ── Search filter ────────────────────────────────────── */
  document.addEventListener("input", function (e) {
    var searchInput = e.target.closest && e.target.closest(".phone-prefix__search");
    if (!searchInput) return;
    var query = searchInput.value.toLowerCase();
    var list = searchInput.closest(".phone-prefix__menu").querySelector(".phone-prefix__list");
    if (!list) return;
    list.querySelectorAll("li").forEach(function (li) {
      var text = li.textContent.toLowerCase();
      li.style.display = text.indexOf(query) !== -1 ? "" : "none";
    });
  });

  /* ── Event delegation ────────────────────────────────── */
  document.addEventListener("click", function (e) {
    /* Clicks inside the search input must not close the menu */
    if (e.target.closest && e.target.closest(".phone-prefix__search-wrap")) {
      e.stopPropagation();
      return;
    }

    if (e.target.closest(".country-toggle")) {
      currentIdx = currentIdx === 0 ? 1 : 0;
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
        var si = menu.querySelector(".phone-prefix__search");
        if (si) setTimeout(function () { si.focus(); }, 0);
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

  function closeAllLangMenus() {
    document.querySelectorAll(".lang-switcher").forEach(function (sw) {
      var menu = sw.querySelector(".lang-switcher__menu");
      var toggle = sw.querySelector(".lang-switcher__toggle");
      if (menu) menu.hidden = true;
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllPhoneMenus();
  });
})();
