(function () {
  var STORAGE_KEY = "readers_profile";

  // ── Load / save profile from localStorage ──────────
  function loadProfile() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function saveProfile(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  // ── Elements ───────────────────────────────────────
  var firstnameEl  = document.getElementById("firstname");
  var lastnameEl   = document.getElementById("lastname");
  var birthdayEl   = document.getElementById("birthday");
  var phoneEl      = document.getElementById("phone");
  var emailEl      = document.getElementById("email");
  var avatarEl     = document.getElementById("profile-avatar");
  var heroNameEl   = document.getElementById("profile-hero-name");
  var unsavedTag   = document.getElementById("info-unsaved-tag");
  var infoForm     = document.getElementById("profile-info-form");
  var infoSaveBtn  = document.getElementById("info-save-btn");
  var infoResetBtn = document.getElementById("info-reset-btn");

  // Password elements
  var pwdForm      = document.getElementById("profile-pwd-form");
  var pwdTrigger   = document.getElementById("pwd-accordion-trigger");
  var pwdBody      = document.getElementById("pwd-accordion-body");
  var newPwdEl     = document.getElementById("new-pwd");
  var confirmPwdEl = document.getElementById("confirm-pwd");
  var currentPwdEl = document.getElementById("current-pwd");
  var pwdResetBtn  = document.getElementById("pwd-reset-btn");

  // Toast
  var toast    = document.getElementById("pf-toast");
  var toastMsg = document.getElementById("pf-toast-msg");
  var toastTimer;

  // ── Populate from storage ──────────────────────────
  var savedProfile = loadProfile();
  var originalData = {};

  function populate() {
    firstnameEl.value = savedProfile.firstname || "";
    lastnameEl.value  = savedProfile.lastname  || "";
    birthdayEl.value  = savedProfile.birthday  || "";
    phoneEl.value     = savedProfile.phone     || "";
    emailEl.value     = savedProfile.email     || "";

    if (savedProfile.gender) {
      var radio = document.querySelector("input[name='gender'][value='" + savedProfile.gender + "']");
      if (radio) radio.checked = true;
    }

    snapshotOriginal();
    updateHero();
    updateAvatar();
  }

  function snapshotOriginal() {
    originalData = {
      firstname: firstnameEl.value,
      lastname:  lastnameEl.value,
      birthday:  birthdayEl.value,
      phone:     phoneEl.value,
      email:     emailEl.value,
      gender:    getGender(),
    };
  }

  function getGender() {
    var checked = document.querySelector("input[name='gender']:checked");
    return checked ? checked.value : "";
  }

  // ── Avatar initials ────────────────────────────────
  function updateAvatar() {
    var fn = firstnameEl.value.trim();
    var ln = lastnameEl.value.trim();
    var initials = (fn ? fn[0] : "") + (ln ? ln[0] : "");
    avatarEl.textContent = initials.toUpperCase() || "RD";
  }

  function updateHero() {
    var fn = firstnameEl.value.trim();
    var ln = lastnameEl.value.trim();
    var full = (fn + " " + ln).trim();
    heroNameEl.textContent = full || "My Profile";

    // Also update session name if logged in
    if (full && window.readersSession) {
      window.readersSession.set(fn || full);
    }
  }

  // ── Unsaved changes indicator ──────────────────────
  function hasChanges() {
    return (
      firstnameEl.value !== originalData.firstname ||
      lastnameEl.value  !== originalData.lastname  ||
      birthdayEl.value  !== originalData.birthday  ||
      phoneEl.value     !== originalData.phone     ||
      emailEl.value     !== originalData.email     ||
      getGender()       !== originalData.gender
    );
  }

  function checkUnsaved() {
    if (hasChanges()) {
      unsavedTag.classList.add("is-visible");
    } else {
      unsavedTag.classList.remove("is-visible");
    }
  }

  // Live updates
  [firstnameEl, lastnameEl, birthdayEl, phoneEl, emailEl].forEach(function (el) {
    el.addEventListener("input", function () {
      updateAvatar();
      updateHero();
      checkUnsaved();
      clearFieldError(el.id);
    });
  });

  document.querySelectorAll("input[name='gender']").forEach(function (r) {
    r.addEventListener("change", checkUnsaved);
  });

  // ── Info form validation & save ────────────────────
  infoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateInfoForm()) return;

    var data = {
      firstname: firstnameEl.value.trim(),
      lastname:  lastnameEl.value.trim(),
      birthday:  birthdayEl.value,
      phone:     phoneEl.value.trim(),
      email:     emailEl.value.trim(),
      gender:    getGender(),
    };

    saveProfile(Object.assign(savedProfile, data));
    snapshotOriginal();
    unsavedTag.classList.remove("is-visible");
    showSaveSuccess(infoSaveBtn);
    showToast("Profile updated successfully!");
  });

  infoResetBtn.addEventListener("click", function () {
    firstnameEl.value = originalData.firstname;
    lastnameEl.value  = originalData.lastname;
    birthdayEl.value  = originalData.birthday;
    phoneEl.value     = originalData.phone;
    emailEl.value     = originalData.email;

    if (originalData.gender) {
      var r = document.querySelector("input[name='gender'][value='" + originalData.gender + "']");
      if (r) r.checked = true;
    } else {
      document.querySelectorAll("input[name='gender']").forEach(function (r) { r.checked = false; });
    }

    updateAvatar();
    updateHero();
    unsavedTag.classList.remove("is-visible");
    clearAllInfoErrors();
  });

  function validateInfoForm() {
    var ok = true;

    if (!firstnameEl.value.trim()) {
      showFieldError("field-firstname"); ok = false;
    }
    if (!lastnameEl.value.trim()) {
      showFieldError("field-lastname"); ok = false;
    }
    if (!emailEl.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      showFieldError("field-email"); ok = false;
    }

    return ok;
  }

  function clearAllInfoErrors() {
    ["field-firstname", "field-lastname", "field-email", "field-phone"].forEach(clearFieldErrorById);
  }

  // ── Password accordion ─────────────────────────────
  pwdTrigger.addEventListener("click", function () {
    var expanded = pwdTrigger.getAttribute("aria-expanded") === "true";
    pwdTrigger.setAttribute("aria-expanded", String(!expanded));
    if (!expanded) {
      pwdBody.classList.add("is-open");
    } else {
      pwdBody.classList.remove("is-open");
      pwdForm.reset();
      resetStrengthMeter();
      clearAllPwdErrors();
    }
  });

  pwdResetBtn.addEventListener("click", function () {
    pwdForm.reset();
    pwdTrigger.setAttribute("aria-expanded", "false");
    pwdBody.classList.remove("is-open");
    resetStrengthMeter();
    clearAllPwdErrors();
  });

  // ── Password strength meter ────────────────────────
  if (newPwdEl) {
    newPwdEl.addEventListener("input", function () {
      updateStrength(newPwdEl.value);
      clearFieldError("new-pwd");
      if (confirmPwdEl.value) checkConfirmMatch();
    });
  }

  function updateStrength(pwd) {
    var score = 0;
    if (pwd.length >= 8)            score++;
    if (/[A-Z]/.test(pwd))          score++;
    if (/[0-9]/.test(pwd))          score++;
    if (/[^A-Za-z0-9]/.test(pwd))   score++;

    var bars   = [
      document.getElementById("str-bar-1"),
      document.getElementById("str-bar-2"),
      document.getElementById("str-bar-3"),
      document.getElementById("str-bar-4"),
    ];
    var label  = document.getElementById("str-label");
    var labels = ["", "Weak", "Fair", "Good", "Strong"];
    var colors = ["", "#c41e3a", "#e87722", "#d4a017", "#2e7d32"];

    bars.forEach(function (b, i) {
      b.className = "pf-strength__bar";
      if (i < score) b.classList.add("active-" + score);
    });

    label.textContent  = pwd.length ? labels[score] || "Weak" : "";
    label.style.color  = pwd.length ? colors[score] || colors[1] : "#bbb";
  }

  function resetStrengthMeter() {
    updateStrength("");
    document.getElementById("str-label").textContent = "";
  }

  // ── Password form validation & save ───────────────
  pwdForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validatePwdForm()) return;

    pwdForm.reset();
    pwdTrigger.setAttribute("aria-expanded", "false");
    pwdBody.classList.remove("is-open");
    resetStrengthMeter();
    clearAllPwdErrors();
    showToast("Password updated successfully!");
  });

  function validatePwdForm() {
    var ok = true;
    var currentVal = currentPwdEl.value;
    var newVal     = newPwdEl.value;
    var confirmVal = confirmPwdEl.value;

    if (!currentVal) {
      showFieldError("field-current-pwd"); ok = false;
    }
    if (!newVal || newVal.length < 8) {
      showFieldError("field-new-pwd"); ok = false;
    }
    if (!confirmVal || confirmVal !== newVal) {
      showFieldError("field-confirm-pwd"); ok = false;
    }

    return ok;
  }

  function checkConfirmMatch() {
    if (confirmPwdEl.value && confirmPwdEl.value !== newPwdEl.value) {
      showFieldError("field-confirm-pwd");
    } else {
      clearFieldErrorById("field-confirm-pwd");
    }
  }

  if (confirmPwdEl) {
    confirmPwdEl.addEventListener("input", function () {
      checkConfirmMatch();
    });
  }

  function clearAllPwdErrors() {
    ["field-current-pwd", "field-new-pwd", "field-confirm-pwd"].forEach(clearFieldErrorById);
  }

  // ── Password show/hide toggles ─────────────────────
  document.querySelectorAll(".pf-password-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.dataset.target;
      var input    = document.getElementById(targetId);
      if (!input) return;
      var isVisible = input.type === "text";
      input.type = isVisible ? "password" : "text";
      var icon = btn.querySelector("i");
      if (icon) {
        icon.className = isVisible ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
      }
      btn.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
    });
  });

  // ── Field error helpers ────────────────────────────
  function showFieldError(fieldId) {
    var el = document.getElementById(fieldId);
    if (el) el.classList.add("has-error");
  }

  function clearFieldError(inputId) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var field = input.closest(".pf-field");
    if (field) field.classList.remove("has-error");
  }

  function clearFieldErrorById(fieldId) {
    var el = document.getElementById(fieldId);
    if (el) el.classList.remove("has-error");
  }

  // ── Save success button state ──────────────────────
  function showSaveSuccess(btn) {
    var originalHtml = btn.innerHTML;
    btn.classList.remove("pf-btn--primary");
    btn.classList.add("pf-btn--success");
    btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Saved!';
    setTimeout(function () {
      btn.classList.remove("pf-btn--success");
      btn.classList.add("pf-btn--primary");
      btn.innerHTML = originalHtml;
    }, 2200);
  }

  // ── Toast ──────────────────────────────────────────
  function showToast(msg) {
    clearTimeout(toastTimer);
    toastMsg.textContent = msg;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  // ── Init ───────────────────────────────────────────
  populate();
})();
