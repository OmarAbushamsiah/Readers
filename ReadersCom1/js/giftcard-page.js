(function () {
  var selectedDesign = null;

  var designGradients = {
    1: "linear-gradient(140deg, #d4a44c 0%, #8b6012 100%)",
    2: "linear-gradient(140deg, #c41e3a 0%, #7b0d1e 100%)",
    3: "linear-gradient(140deg, #3d4046 0%, #111317 100%)",
    4: "linear-gradient(140deg, #7b2d8b 0%, #3d0a50 100%)",
    5: "linear-gradient(140deg, #1e88e5 0%, #0d47a1 100%)",
    6: "linear-gradient(140deg, #1a237e 0%, #050d3a 100%)",
    7: "linear-gradient(140deg, #e91e8c 0%, #880e4f 100%)",
    8: "linear-gradient(140deg, #2e7d32 0%, #0a3d0d 100%)",
  };

  var designIcons = {
    1: "fa-book-open",
    2: "fa-bookmark",
    3: "fa-feather-pointed",
    4: "fa-star",
    5: "fa-book",
    6: "fa-crown",
    7: "fa-heart",
    8: "fa-leaf",
  };

  // Elements
  var step1 = document.getElementById("gc-step-1");
  var step2 = document.getElementById("gc-step-2");
  var nextBtn = document.getElementById("gc-next-btn");
  var backBtn = document.getElementById("gc-back-btn");
  var alert = document.getElementById("gc-alert");
  var alertMsg = document.getElementById("gc-alert-msg");
  var prog1 = document.getElementById("gc-prog-1");
  var prog2 = document.getElementById("gc-prog-2");
  var progConnector = document.getElementById("gc-prog-connector");
  var previewCard = document.getElementById("gc-preview-card");
  var previewIcon = document.getElementById("gc-preview-icon");
  var previewAmount = document.getElementById("gc-preview-amount");
  var previewFrom = document.getElementById("gc-preview-from");
  var previewTo = document.getElementById("gc-preview-to");
  var emailFields = document.getElementById("gc-email-fields");
  var form = document.getElementById("gc-form");

  // Design card selection
  document.querySelectorAll(".gc-design-card").forEach(function (card) {
    card.addEventListener("click", function () {
      document.querySelectorAll(".gc-design-card").forEach(function (c) {
        c.classList.remove("is-selected");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("is-selected");
      card.setAttribute("aria-pressed", "true");
      selectedDesign = card.dataset.design;
      hideAlert();
    });
  });

  // Step navigation
  nextBtn.addEventListener("click", function () {
    if (!selectedDesign) {
      showAlert("Please select a gift card design to continue.");
      return;
    }
    goToStep2();
  });

  backBtn.addEventListener("click", goToStep1);

  function goToStep2() {
    step1.hidden = true;
    step2.hidden = false;
    prog1.classList.remove("is-active");
    prog1.classList.add("is-done");
    prog2.classList.add("is-active");
    progConnector.classList.add("is-done");
    applyDesignToPreview(selectedDesign);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToStep1() {
    step2.hidden = true;
    step1.hidden = false;
    prog2.classList.remove("is-active");
    prog1.classList.remove("is-done");
    prog1.classList.add("is-active");
    progConnector.classList.remove("is-done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyDesignToPreview(design) {
    previewCard.style.background = designGradients[design] || designGradients[1];
    var iconEl = previewIcon.querySelector("i");
    if (iconEl) {
      iconEl.className = "fa-solid " + (designIcons[design] || "fa-book-open");
    }
  }

  // Delivery mode toggle
  document.querySelectorAll("input[name='gc-delivery']").forEach(function (radio) {
    radio.addEventListener("change", function () {
      if (radio.value === "email") {
        emailFields.classList.remove("is-hidden");
      } else {
        emailFields.classList.add("is-hidden");
      }
    });
  });

  // Live preview: recipient name
  var toInput = document.getElementById("gc-to");
  if (toInput) {
    toInput.addEventListener("input", function () {
      previewTo.textContent = toInput.value.trim() || "For Someone Special";
    });
  }

  // Live preview: sender name
  var fromInput = document.getElementById("gc-from");
  if (fromInput) {
    fromInput.addEventListener("input", function () {
      previewFrom.textContent = fromInput.value.trim() || "Your Name";
    });
  }

  // Live preview: amount + "Other" custom input toggle
  var customAmountWrap = document.getElementById("gc-custom-amount-wrap");
  var customAmountInput = document.getElementById("gc-custom-amount");

  document.querySelectorAll("input[name='gc-amount']").forEach(function (radio) {
    radio.addEventListener("change", function () {
      var isOther = radio.value === "other";
      if (customAmountWrap) {
        customAmountWrap.style.maxHeight = isOther ? "120px" : "0";
        customAmountWrap.style.opacity = isOther ? "1" : "0";
        customAmountWrap.style.marginTop = isOther ? "0" : "0";
        if (isOther && customAmountInput) customAmountInput.focus();
      }
      if (!isOther) {
        previewAmount.textContent = "JOD " + radio.value + ".00";
      } else {
        previewAmount.textContent = "— JOD";
      }
    });
  });

  if (customAmountInput) {
    customAmountInput.addEventListener("input", function () {
      var val = parseFloat(customAmountInput.value);
      previewAmount.textContent = val > 0 ? "JOD " + val.toFixed(2) : "— JOD";
    });
  }

  // Form validation & submit
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;

    var fromVal = fromInput ? fromInput.value.trim() : "";
    var toVal = toInput ? toInput.value.trim() : "";
    var amountChecked = document.querySelector("input[name='gc-amount']:checked");
    var deliveryVal = document.querySelector("input[name='gc-delivery']:checked");
    var emailVal = document.getElementById("gc-email");

    setFieldError("gc-field-from", !fromVal);
    setFieldError("gc-field-to", !toVal);

    if (!fromVal || !toVal) valid = false;

    if (!amountChecked) {
      valid = false;
      var amtField = document.getElementById("gc-field-amount");
      if (amtField) {
        amtField.style.maxHeight = "60px";
        amtField.style.opacity = "1";
        amtField.style.marginTop = "0.65rem";
      }
    } else {
      var amtField = document.getElementById("gc-field-amount");
      if (amtField) {
        amtField.style.maxHeight = "0";
        amtField.style.opacity = "0";
        amtField.style.marginTop = "0";
      }
      if (amountChecked.value === "other") {
        var customVal = customAmountInput ? parseFloat(customAmountInput.value) : 0;
        var customErrEl = document.getElementById("gc-custom-amount-error");
        if (!customVal || customVal < 1) {
          valid = false;
          if (customAmountInput) customAmountInput.classList.add("gc-field--error");
          if (customErrEl) customErrEl.style.display = "block";
        } else {
          if (customAmountInput) customAmountInput.classList.remove("gc-field--error");
          if (customErrEl) customErrEl.style.display = "none";
        }
      }
    }

    if (deliveryVal && deliveryVal.value === "email" && emailVal) {
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.value.trim());
      setFieldError("gc-field-email", !emailOk);
      if (!emailOk) valid = false;
    }

    if (!valid) {
      showAlert("Please fill in all required fields before adding to cart.");
      return;
    }

    hideAlert();

    var finalAmount = amountChecked.value === "other"
      ? (customAmountInput ? parseFloat(customAmountInput.value) || 0 : 0)
      : parseFloat(amountChecked.value);

    if (window.ReadersCart) {
      var designLabels = {
        "1": "Little Readers", "2": "Readers in Red", "3": "Readers in Black",
        "4": "Little Readers in Purple", "5": "Little Readers in Blue",
        "6": "Little Readers in Royal Blue", "7": "Little Readers in Pink",
        "8": "Little Readers in Green"
      };
      ReadersCart.add({
        isbn: "READERS-GIFTCARD-" + Date.now(),
        title: "Gift Card – JOD " + finalAmount.toFixed(2),
        author: "From: " + fromVal + " · To: " + toVal,
        price: finalAmount.toFixed(2),
        format: "Gift Card" + (selectedDesign ? " · " + (designLabels[selectedDesign] || "Design " + selectedDesign) : ""),
        img: "gc-design:" + selectedDesign,
        dispatch: "Physical Card"
      }, 1);
    }

    var btn = form.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Added to Cart!';
    btn.style.background = "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)";
    btn.style.boxShadow = "0 4px 14px rgba(46,125,50,0.35)";
    setTimeout(function () {
      window.location.href = "cart.html";
    }, 1200);
  });

  function setFieldError(fieldId, hasError) {
    var el = document.getElementById(fieldId);
    if (!el) return;
    if (hasError) {
      el.classList.add("gc-field--error");
    } else {
      el.classList.remove("gc-field--error");
    }
  }

  function showAlert(msg) {
    alertMsg.textContent = msg;
    alert.hidden = false;
    alert.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideAlert() {
    alert.hidden = true;
  }
})();
