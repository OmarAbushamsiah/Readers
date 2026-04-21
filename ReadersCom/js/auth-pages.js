(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function wirePasswordToggles() {
    qsa(".auth-password__toggle").forEach(function (btn) {
      var wrap = btn.closest(".auth-password");
      if (!wrap) return;
      var input = wrap.querySelector('input[type="password"], input[type="text"]');
      if (!input) return;
      btn.addEventListener("click", function () {
        var show = input.getAttribute("type") === "password";
        input.setAttribute("type", show ? "text" : "password");
        btn.setAttribute("aria-pressed", show ? "true" : "false");
        btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        var i = btn.querySelector("i");
        if (i) {
          i.className = show ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
        }
      });
    });
  }

  function openOtp(modal) {
    if (!modal) return;
    var input = qs(".otp-modal__input", modal);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (input) {
      input.value = "";
      setTimeout(function () {
        input.focus();
      }, 0);
    }
  }

  function closeOtp(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function wireOtpModal(modal, onApply) {
    if (!modal) return;
    var applyBtn = qs(".otp-modal__apply", modal);
    var cancelBtn = qs(".otp-modal__cancel", modal);
    var input = qs(".otp-modal__input", modal);

    function apply() {
      if (input) {
        var digits = String(input.value || "").replace(/\D/g, "");
        if (digits.length !== 6) {
          input.focus();
          return;
        }
      }
      if (typeof onApply === "function") onApply();
    }

    if (applyBtn) applyBtn.addEventListener("click", apply);
    if (cancelBtn) cancelBtn.addEventListener("click", function () {
      closeOtp(modal);
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeOtp(modal);
    });
    if (input) {
      input.addEventListener("input", function () {
        input.value = String(input.value || "").replace(/\D/g, "").slice(0, 6);
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") apply();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeOtp(modal);
      }
    });
  }

  var loginRoot = qs(".auth-page--login");
  if (loginRoot) {
    wirePasswordToggles();
    var modal = qs("#auth-otp-modal", loginRoot);
    var tabs = qsa(".auth-tab", loginRoot);
    var panels = qsa(".auth-panel", loginRoot);

    function activateTab(id) {
      tabs.forEach(function (t) {
        t.classList.toggle("is-active", t.getAttribute("data-auth-tab") === id);
        t.setAttribute("aria-selected", t.getAttribute("data-auth-tab") === id ? "true" : "false");
      });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("id") === "auth-panel-" + id);
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateTab(tab.getAttribute("data-auth-tab"));
      });
    });

    wireOtpModal(modal, function () {
      if (window.readersSession && typeof window.readersSession.set === "function") {
        window.readersSession.set("Omar");
      }
      window.location.href = "index.html";
    });

    var phoneForm = qs("#auth-login-phone-form", loginRoot);
    var emailForm = qs("#auth-login-email-form", loginRoot);

    if (phoneForm) {
      phoneForm.addEventListener("submit", function (e) {
        e.preventDefault();
        openOtp(modal);
      });
    }
    if (emailForm) {
      emailForm.addEventListener("submit", function (e) {
        e.preventDefault();
        openOtp(modal);
      });
    }
  }

  var registerRoot = qs(".auth-page--register");
  if (registerRoot) {
    wirePasswordToggles();
    var regModal = qs("#auth-otp-modal", registerRoot);
    wireOtpModal(regModal, function () {
      var full = "";
      var nameInput = qs("#reg-fullname", registerRoot);
      if (nameInput) full = String(nameInput.value || "").trim();
      if (window.readersSession && typeof window.readersSession.set === "function") {
        window.readersSession.set(full || "Reader");
      }
      window.location.href = "index.html";
    });
    var regForm = qs("#auth-register-form", registerRoot);
    if (regForm) {
      regForm.addEventListener("submit", function (e) {
        e.preventDefault();
        openOtp(regModal);
      });
    }
  }

  var recoverRoot = qs(".auth-page--recover-flow");
  if (recoverRoot) {
    wirePasswordToggles();
    var forgotForm = qs("#auth-forgot-form", recoverRoot);
    if (forgotForm) {
      forgotForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!forgotForm.checkValidity()) {
          forgotForm.reportValidity();
          return;
        }
        window.location.href = "reset-password.html";
      });
    }
    var resetForm = qs("#auth-reset-password-form", recoverRoot);
    if (resetForm) {
      var newPass = qs("#auth-new-password", resetForm);
      var confirmPass = qs("#auth-confirm-password", resetForm);
      resetForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (confirmPass) confirmPass.setCustomValidity("");
        if (!newPass || !confirmPass) return;
        if (newPass.value !== confirmPass.value) {
          confirmPass.setCustomValidity("Passwords do not match.");
          confirmPass.reportValidity();
          return;
        }
        if (!resetForm.checkValidity()) {
          resetForm.reportValidity();
          return;
        }
        window.location.href = "login.html";
      });
      if (confirmPass) {
        confirmPass.addEventListener("input", function () {
          confirmPass.setCustomValidity("");
        });
      }
    }
  }
})();
