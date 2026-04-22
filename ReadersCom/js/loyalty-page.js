/* Loyalty Card page — Readers Bookshop */
(function () {
  var STORAGE_KEY = "readers_loyalty_cards";

  /* ── Helpers ──────────────────────────────────────── */
  function pad(n) { return String(n).padStart(2, "0"); }

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function expiry(yearsAhead) {
    var d = new Date();
    d.setFullYear(d.getFullYear() + yearsAhead);
    return pad(d.getMonth() + 1) + "/" + String(d.getFullYear()).slice(2);
  }

  function formatDate(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    if (p.length < 3) return iso;
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return p[2] + " " + months[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  function generateCardNumber() {
    var groups = [];
    for (var i = 0; i < 4; i++) {
      groups.push(String(Math.floor(1000 + Math.random() * 9000)));
    }
    return groups.join(" ");
  }

  function loadCards() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveCards(cards) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); }
    catch (e) {}
  }

  /* ── DOM refs ─────────────────────────────────────── */
  var emptyEl   = document.getElementById("lc-empty");
  var activeEl  = document.getElementById("lc-active");
  var grid      = document.getElementById("lc-cards-grid");
  var form      = document.getElementById("lc-form");
  var alertEl   = document.getElementById("lc-alert");
  var alertMsg  = document.getElementById("lc-alert-msg");
  var addBtn    = document.getElementById("lc-add-card-btn");

  /* ── Show / hide states ───────────────────────────── */
  function showEmpty() {
    emptyEl.removeAttribute("hidden");
    activeEl.setAttribute("hidden", "");
    /* reset form */
    form.reset();
    clearErrors();
    hideAlert();
    /* uncheck picker */
    document.querySelectorAll('input[name="lc-type"]').forEach(function (r) { r.checked = false; });
  }

  function showActive() {
    emptyEl.setAttribute("hidden", "");
    activeEl.removeAttribute("hidden");
    renderCards();
  }

  /* ── Alert ────────────────────────────────────────── */
  function showAlert(msg) {
    alertMsg.textContent = msg;
    alertEl.removeAttribute("hidden");
    alertEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideAlert() {
    alertEl.setAttribute("hidden", "");
  }

  /* ── Validation ───────────────────────────────────── */
  function clearErrors() {
    document.querySelectorAll(".lc-field.has-error").forEach(function (f) {
      f.classList.remove("has-error");
    });
  }

  function setError(fieldId) {
    var el = document.getElementById(fieldId);
    if (el) el.classList.add("has-error");
  }

  function validate() {
    clearErrors();
    var ok = true;

    var type = document.querySelector('input[name="lc-type"]:checked');
    if (!type) {
      showAlert("Please select a card type (Gold or Blue) to continue.");
      ok = false;
    } else { hideAlert(); }

    var name = document.getElementById("lc-name").value.trim();
    if (!name) { setError("lc-f-name"); ok = false; }

    var email = document.getElementById("lc-email").value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("lc-f-email"); ok = false; }

    var phone = document.getElementById("lc-phone").value.replace(/\s/g, "");
    if (!phone || phone.length < 7) { setError("lc-f-phone"); ok = false; }

    var dob = document.getElementById("lc-dob").value;
    if (!dob) { setError("lc-f-dob"); ok = false; }

    var nat = document.getElementById("lc-nationality").value;
    if (!nat) { setError("lc-f-nationality"); ok = false; }

    return ok;
  }

  /* ── Card HTML builder ────────────────────────────── */
  function cardHtml(card) {
    var isGold  = card.type === "gold";
    var themeClass = isGold ? "lc-card--gold" : "lc-card--blue";
    var tierIcon   = isGold ? "fa-solid fa-crown" : "fa-solid fa-star";
    var tierLabel  = isGold ? "Gold" : "Blue";
    var infoTierClass = isGold ? "lc-card-info__tier--gold" : "lc-card-info__tier--blue";
    var numParts = card.number.split(" ");
    var maskedNum = numParts[0] + " " + numParts[1] + " •••• " + numParts[3];

    return (
      '<div class="lc-card-wrap">' +
        '<div class="lc-card ' + themeClass + '" data-card-id="' + card.id + '" role="button" tabindex="0"' +
          ' aria-label="' + tierLabel + ' loyalty card — click to see details">' +
          '<div class="lc-card__inner">' +

            /* ── Front ── */
            '<div class="lc-card__front">' +
              '<div class="lc-card__front-inner">' +
                '<div class="lc-card__top">' +
                  '<span class="lc-card__brand">Readers Bookshop</span>' +
                  '<span class="lc-card__tier">' +
                    '<i class="' + tierIcon + '" aria-hidden="true"></i> ' + tierLabel +
                  '</span>' +
                '</div>' +
                '<div class="lc-card__mid">' +
                  '<span class="lc-card__number-preview">' + maskedNum + '</span>' +
                '</div>' +
                '<div class="lc-card__bottom">' +
                  '<div class="lc-card__holder-wrap">' +
                    '<span class="lc-card__holder-label">Card holder</span>' +
                    '<span class="lc-card__holder-name">' + card.name.toUpperCase() + '</span>' +
                  '</div>' +
                  '<span class="lc-card__chip"></span>' +
                '</div>' +
                '<span class="lc-card__flip-hint"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Tap for details</span>' +
              '</div>' +
            '</div>' +

            /* ── Back ── */
            '<div class="lc-card__back">' +
              '<div class="lc-card__back-inner">' +
                '<div class="lc-card__stripe"></div>' +
                '<div class="lc-card__points-highlight">' +
                  '<span class="lc-card__back-label">Points balance</span>' +
                  '<span class="lc-card__points-value">' + card.points + ' pts</span>' +
                '</div>' +
                '<div class="lc-card__back-detail-row">' +
                  '<span class="lc-card__back-label">Card number</span>' +
                  '<span class="lc-card__back-value">' + card.number + '</span>' +
                '</div>' +
                '<div class="lc-card__back-row-split">' +
                  '<div class="lc-card__back-detail-row">' +
                    '<span class="lc-card__back-label">Member since</span>' +
                    '<span class="lc-card__back-value">' + formatDate(card.since) + '</span>' +
                  '</div>' +
                  '<div class="lc-card__back-detail-row">' +
                    '<span class="lc-card__back-label">Valid thru</span>' +
                    '<span class="lc-card__back-value">' + card.expiry + '</span>' +
                  '</div>' +
                '</div>' +
                '<div class="lc-card__back-detail-row">' +
                  '<span class="lc-card__back-label">Email</span>' +
                  '<span class="lc-card__back-value">' + card.email + '</span>' +
                '</div>' +
                '<span class="lc-card__flip-hint"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Tap to flip back</span>' +
              '</div>' +
            '</div>' +

          '</div>' +
        '</div>' +

        /* ── Info tile ── */
        '<div class="lc-card-info">' +
          '<div class="lc-card-info__left">' +
            '<span class="lc-card-info__tier ' + infoTierClass + '">' +
              '<i class="' + tierIcon + '" aria-hidden="true"></i> ' + tierLabel + ' Member' +
            '</span>' +
            '<span class="lc-card-info__name">' + card.name + '</span>' +
          '</div>' +
          '<span class="lc-card-info__points">' +
            '<i class="fa-solid fa-bolt" aria-hidden="true"></i>' +
            card.points + ' pts' +
          '</span>' +
        '</div>' +

      '</div>'
    );
  }

  /* ── Render cards ─────────────────────────────────── */
  function renderCards() {
    var cards = loadCards();
    grid.innerHTML = cards.map(cardHtml).join("");

    /* Flip toggle */
    grid.querySelectorAll(".lc-card").forEach(function (cardEl) {
      function toggle() { cardEl.classList.toggle("is-flipped"); }
      cardEl.addEventListener("click", toggle);
      cardEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ── Form submit ──────────────────────────────────── */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var type  = document.querySelector('input[name="lc-type"]:checked').value;
    var name  = document.getElementById("lc-name").value.trim();
    var email = document.getElementById("lc-email").value.trim();
    var phone = document.getElementById("lc-phone").value.trim();
    var dob   = document.getElementById("lc-dob").value;
    var nat   = document.getElementById("lc-nationality").value;

    var cards = loadCards();
    var newCard = {
      id:     Date.now(),
      type:   type,
      name:   name,
      email:  email,
      phone:  phone,
      dob:    dob,
      nationality: nat,
      number: generateCardNumber(),
      points: 0,
      since:  today(),
      expiry: expiry(3)
    };
    cards.push(newCard);
    saveCards(cards);
    showActive();
  });

  /* ── "Add another card" ───────────────────────────── */
  addBtn.addEventListener("click", showEmpty);

  /* ── Init ─────────────────────────────────────────── */
  var existing = loadCards();
  if (existing.length > 0) {
    showActive();
  } else {
    showEmpty();
  }

})();
