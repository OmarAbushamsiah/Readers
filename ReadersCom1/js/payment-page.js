/**
 * Payment Methods page — save / manage card details (browser-local demo).
 */
(function () {
  /* Only run on the payment page */
  if (!document.getElementById("pay-cards-grid")) return;

  var STORAGE_KEY = "readers_payment_methods_v1";

  /* ── Storage helpers ──────────────────────────────── */
  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { cards: [] };
      var d = JSON.parse(raw);
      if (!d || !Array.isArray(d.cards)) return { cards: [] };
      return d;
    } catch (e) {
      return { cards: [] };
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {/* ignore */}
  }

  function generateId() {
    return "card_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
  }

  /* ── Card helpers ─────────────────────────────────── */
  function detectBrand(number) {
    var n = number.replace(/\s/g, "");
    if (/^4/.test(n)) return "visa";
    if (/^5[1-5]/.test(n) || /^2[2-7]\d{2}/.test(n)) return "mastercard";
    return "other";
  }

  function brandLabel(brand) {
    if (brand === "visa") return "VISA";
    if (brand === "mastercard") return "MASTERCARD";
    return "CARD";
  }

  function maskNumber(last4) {
    return "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 " + last4;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ── Render ───────────────────────────────────────── */
  function render() {
    var data = loadData();
    renderCards(data);
    updateCount(data);
  }

  function renderCards(data) {
    var grid = document.getElementById("pay-cards-grid");
    if (!grid) return;

    if (!data.cards.length) {
      grid.innerHTML =
        '<div class="pay-empty">' +
        '<span class="pay-empty__icon"><i class="fa-regular fa-credit-card" aria-hidden="true"></i></span>' +
        '<p class="pay-empty__text">No saved cards yet</p>' +
        '<p class="pay-empty__hint">Click &ldquo;Add New Card&rdquo; above to save your first card.</p>' +
        "</div>";
      return;
    }

    grid.innerHTML = data.cards.map(cardTileHtml).join("");

    /* Bind tile action buttons */
    grid.querySelectorAll("[data-pay-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-pay-action");
        var id = btn.getAttribute("data-card-id");
        if (action === "set-default") setDefault(id);
        if (action === "delete") deleteCard(id);
      });
    });
  }

  function cardTileHtml(card) {
    var brandCls = "pay-card-tile--" + card.brand;
    var defaultBadge = card.isDefault
      ? '<span class="pay-card-tile__default-badge">Default</span>'
      : "";
    var defaultBtnCls =
      "pay-card-actions__btn pay-card-actions__btn--default" +
      (card.isDefault ? " is-active" : "");
    var defaultBtnContent = card.isDefault
      ? '<i class="fa-solid fa-check" aria-hidden="true"></i> Default'
      : "Set as Default";

    return (
      '<div class="pay-card-wrap">' +
      /* ── Tile ── */
      '<div class="pay-card-tile ' + brandCls + '" aria-label="' + escapeHtml(brandLabel(card.brand)) + ' card ending ' + escapeHtml(card.last4) + '">' +
      defaultBadge +
      '<div class="pay-card-tile__brand">' + escapeHtml(brandLabel(card.brand)) + "</div>" +
      '<div class="pay-card-tile__mid">' +
      '<div class="pay-card-tile__chip" aria-hidden="true"></div>' +
      '<div class="pay-card-tile__number">' + escapeHtml(maskNumber(card.last4)) + "</div>" +
      "</div>" +
      '<div class="pay-card-tile__bottom">' +
      '<div class="pay-card-tile__name-group">' +
      '<span class="pay-card-tile__label">Card Holder</span>' +
      '<span class="pay-card-tile__name">' + escapeHtml(card.nameOnCard) + "</span>" +
      "</div>" +
      '<div class="pay-card-tile__exp-group">' +
      '<span class="pay-card-tile__label">Expires</span>' +
      '<span class="pay-card-tile__exp">' + escapeHtml(card.expiry) + "</span>" +
      "</div>" +
      "</div>" +
      "</div>" +
      /* ── Actions ── */
      '<div class="pay-card-actions">' +
      '<button type="button" class="' + defaultBtnCls + '" data-pay-action="set-default" data-card-id="' + escapeHtml(card.id) + '">' +
      defaultBtnContent +
      "</button>" +
      '<button type="button" class="pay-card-actions__btn pay-card-actions__btn--delete" data-pay-action="delete" data-card-id="' + escapeHtml(card.id) + '" aria-label="Delete card ending ' + escapeHtml(card.last4) + '">' +
      '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>' +
      "</button>" +
      "</div>" +
      "</div>"
    );
  }

  function updateCount(data) {
    var el = document.getElementById("pay-cards-count");
    if (!el) return;
    var n = data.cards.length;
    el.textContent = n + (n === 1 ? " card saved" : " cards saved");
  }

  /* ── Card actions ─────────────────────────────────── */
  function setDefault(id) {
    var data = loadData();
    data.cards.forEach(function (c) {
      c.isDefault = c.id === id;
    });
    saveData(data);
    render();
    showToast("Default card updated.");
  }

  function deleteCard(id) {
    var data = loadData();
    data.cards = data.cards.filter(function (c) { return c.id !== id; });
    /* Promote first remaining card to default if none is set */
    if (data.cards.length && !data.cards.some(function (c) { return c.isDefault; })) {
      data.cards[0].isDefault = true;
    }
    saveData(data);
    render();
    showToast("Card removed.");
  }

  /* ── Add-card toggle ──────────────────────────────── */
  var formSection = document.getElementById("pay-form-section");
  var addBtn = document.getElementById("pay-add-btn");

  function openForm() {
    if (!formSection) return;
    formSection.hidden = false;
    if (addBtn) {
      addBtn.classList.add("is-open");
      addBtn.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i> Cancel';
    }
    setTimeout(function () {
      formSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 60);
  }

  function closeForm() {
    if (!formSection) return;
    formSection.hidden = true;
    if (addBtn) {
      addBtn.classList.remove("is-open");
      addBtn.innerHTML = '<i class="fa-solid fa-plus" aria-hidden="true"></i> Add New Card';
    }
    var form = document.getElementById("pay-card-form");
    if (form) {
      form.reset();
      /* Clear brand badge */
      var badge = document.getElementById("pay-brand-badge");
      if (badge) { badge.textContent = ""; badge.className = "pay-form-brand-badge"; }
      /* Clear error states */
      form.querySelectorAll(".pay-form-input").forEach(function (i) { i.classList.remove("has-error"); });
      form.querySelectorAll(".pay-form-field__error").forEach(function (e) { e.classList.remove("is-visible"); });
    }
  }

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      if (formSection && !formSection.hidden) {
        closeForm();
      } else {
        openForm();
      }
    });
  }

  var cancelBtn = document.getElementById("pay-form-cancel");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeForm);
  }

  /* ── Form interactions ────────────────────────────── */
  var numInput = document.getElementById("pay-num");
  var brandBadge = document.getElementById("pay-brand-badge");

  if (numInput && brandBadge) {
    numInput.addEventListener("input", function () {
      var raw = numInput.value.replace(/\D/g, "").slice(0, 16);
      /* Format with spaces every 4 digits */
      numInput.value = raw.match(/.{1,4}/g) ? raw.match(/.{1,4}/g).join(" ") : raw;
      var brand = detectBrand(raw);
      brandBadge.className = "pay-form-brand-badge" + (brand !== "other" ? " brand-" + brand : "");
      brandBadge.textContent = brand !== "other" ? brandLabel(brand) : "";
    });
  }

  var expInput = document.getElementById("pay-expiry");
  if (expInput) {
    expInput.addEventListener("input", function () {
      var raw = expInput.value.replace(/\D/g, "").slice(0, 4);
      expInput.value = raw.length > 2 ? raw.slice(0, 2) + "/" + raw.slice(2) : raw;
    });
  }

  var cvvInput = document.getElementById("pay-cvv");
  if (cvvInput) {
    cvvInput.addEventListener("input", function () {
      cvvInput.value = cvvInput.value.replace(/\D/g, "").slice(0, 4);
    });
  }

  /* ── Form submission ──────────────────────────────── */
  var form = document.getElementById("pay-card-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateForm()) return;

      var data = loadData();
      var rawNum = numInput ? numInput.value.replace(/\s/g, "") : "";
      var last4 = rawNum.slice(-4);
      var brand = detectBrand(rawNum);
      var nameEl = document.getElementById("pay-name");
      var makeDefault = document.getElementById("pay-default");
      var setAsDefault = (makeDefault && makeDefault.checked) || data.cards.length === 0;

      if (setAsDefault) {
        data.cards.forEach(function (c) { c.isDefault = false; });
      }

      data.cards.push({
        id: generateId(),
        nameOnCard: nameEl ? nameEl.value.trim() : "",
        last4: last4,
        brand: brand,
        expiry: expInput ? expInput.value.trim() : "",
        isDefault: setAsDefault,
      });

      saveData(data);
      render();
      closeForm();
      showToast("Card saved successfully!");
    });
  }

  /* ── Validation ───────────────────────────────────── */
  function validateForm() {
    var valid = true;

    function check(inputId, errorId, testFn, message) {
      var inp = document.getElementById(inputId);
      var err = document.getElementById(errorId);
      if (!inp || !err) return;
      var fail = testFn(inp.value);
      inp.classList.toggle("has-error", fail);
      err.textContent = message;
      err.classList.toggle("is-visible", fail);
      if (fail) valid = false;
    }

    check("pay-name", "pay-name-err",
      function (v) { return !v.trim(); },
      "Please enter the cardholder name.");

    check("pay-num", "pay-num-err",
      function (v) { var d = v.replace(/\s/g, ""); return d.length < 13 || d.length > 19; },
      "Please enter a valid card number.");

    check("pay-expiry", "pay-expiry-err",
      function (v) { return !/^\d{2}\/\d{2}$/.test(v.trim()); },
      "Please enter expiry as MM/YY.");

    check("pay-cvv", "pay-cvv-err",
      function (v) { return !/^\d{3,4}$/.test(v.trim()); },
      "Please enter a 3 or 4 digit CVV.");

    return valid;
  }

  /* ── Toast ────────────────────────────────────────── */
  function showToast(msg) {
    var toast = document.getElementById("pay-toast");
    if (!toast) return;
    var msgEl = document.getElementById("pay-toast-msg");
    if (msgEl) msgEl.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toast._tid);
    toast._tid = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3000);
  }

  /* ── Init ─────────────────────────────────────────── */
  render();
})();
