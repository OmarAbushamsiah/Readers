/**
 * Cart checkout — Basket & Payment (static; delivery fields under Cash on Delivery).
 */
(function () {
  var mount = document.getElementById("cart-page-mount");
  if (!mount || !window.ReadersCart) return;

  var FREE_THRESHOLD = 50;
  var DELIVERY_STORAGE_KEY = "readers_checkout_delivery_v1";
  var PAYMENT_STORAGE_KEY = "readers_checkout_payment_v1";

  var currentStep = "basket";
  var pendingUndos = [];
  /** Order ISBNs first appeared in the cart this session (keeps restore order after multiple removes). */
  var sessionLineOrder = [];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatMoney(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  function loadDelivery() {
    try {
      var raw = localStorage.getItem(DELIVERY_STORAGE_KEY);
      if (!raw) return {};
      var o = JSON.parse(raw);
      return o && typeof o === "object" ? o : {};
    } catch (e) {
      return {};
    }
  }

  function saveDeliveryField(name, value) {
    var d = loadDelivery();
    d[name] = value;
    try {
      localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(d));
    } catch (e) {
      /* ignore */
    }
  }

  function loadPayment() {
    var defaults = {
      method: "pickup",
      nameOnCard: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      promoCode: "",
      shipmentType: "standard",
      addressMode: "default",
      cardMode: "default",
    };
    try {
      var raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
      if (!raw) return Object.assign({}, defaults);
      var o = JSON.parse(raw);
      if (!o || typeof o !== "object") return Object.assign({}, defaults);
      var merged = Object.assign({}, defaults, o);
      if (["pickup", "cash", "visa", "card"].indexOf(merged.method) === -1) {
        merged.method = defaults.method;
      }
      return merged;
    } catch (e) {
      return Object.assign({}, defaults);
    }
  }

  function savePaymentPatch(patch) {
    var d = loadPayment();
    Object.assign(d, patch);
    try {
      localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(d));
    } catch (e) {
      /* ignore */
    }
  }

  var UPSELL_PRODUCT = {
    isbn: "9781529155419",
    title: "Land of Sweet Forever",
    author: "Harper Lee",
    wasPrice: "28.00",
    price: "22.50",
    format: "Hardcover",
    img: "https://readers.jo/image/cache/catalog/product/9781529155419-600x770.jpg",
    href: "product.html#9781529155419",
    description:
      "A posthumous collection of newly discovered short stories and essays from the author of To Kill a Mockingbird—an intimate look at Harper Lee’s voice, wit, and enduring love of the American South.",
  };

  function promotionCodeHtml(p) {
    var code = (p && p.promoCode) || "";
    return (
      '<div class="cart-promo-code">' +
      '<label class="cart-promo-code__label" for="cart-promo-code-input">Promotion code</label>' +
      '<div class="cart-promo-code__row">' +
      '<input class="cart-promo-code__input" type="text" id="cart-promo-code-input" value="' +
      escapeHtml(code) +
      '" placeholder="Enter code" autocomplete="off" maxlength="40" />' +
      '<button type="button" class="cart-promo-code__apply" id="cart-promo-code-apply">Apply</button>' +
      "</div>" +
      '<p class="cart-promo-code__hint">Demo only — codes are not validated.</p>' +
      "</div>"
    );
  }

  function cartUpsellHtml() {
    var u = UPSELL_PRODUCT;
    return (
      '<section class="cart-upsell" aria-labelledby="cart-upsell-heading">' +
      '<div class="cart-upsell__inner">' +
      '<h2 id="cart-upsell-heading" class="cart-upsell__title">You might like as well</h2>' +
      '<article class="cart-upsell-card">' +
      '<a class="cart-upsell-card__media" href="' +
      escapeHtml(u.href) +
      '">' +
      '<img class="cart-upsell-card__img" src="' +
      escapeHtml(u.img) +
      '" alt="" width="112" height="144" loading="lazy" decoding="async" />' +
      "</a>" +
      '<div class="cart-upsell-card__body">' +
      '<h3 class="cart-upsell-card__title"><a href="' +
      escapeHtml(u.href) +
      '">' +
      escapeHtml(u.title) +
      "</a></h3>" +
      '<p class="cart-upsell-card__author">' +
      escapeHtml(u.author) +
      "</p>" +
      '<p class="cart-upsell-card__price">' +
      '<span class="cart-upsell-card__price-was" aria-hidden="true">JOD ' +
      escapeHtml(u.wasPrice) +
      "</span> " +
      '<span class="cart-upsell-card__price-now"><span class="visually-hidden">Sale price </span>JOD ' +
      escapeHtml(u.price) +
      "</span></p>" +
      "<p class=\"cart-upsell-card__desc\">" +
      escapeHtml(u.description) +
      "</p>" +
      '<button type="button" class="cart-upsell-card__cta" data-upsell-isbn="' +
      escapeHtml(u.isbn) +
      '">Add to basket</button>' +
      "</div></article></div></section>"
    );
  }

  function cartSummaryHtml(currentStep, lines, subtotal) {
    var count = lines.length;
    var note = "";
    if (!count) {
      note = "Your basket is empty.";
    } else if (currentStep === "basket") {
      note = "Continue to Payment when ready.";
    } else {
      note = "Static prototype — no payment is processed.";
    }
    var meta =
      count > 0
        ? '<p class="cart-summary__meta">' +
          count +
          (count === 1 ? " product" : " products") +
          "</p>"
        : "";
    var amountCol =
      '<span class="cart-summary__amount-col">' +
      '<span class="cart-summary__amount">JOD ' +
      escapeHtml(formatMoney(subtotal)) +
      "</span>";
    if (currentStep === "basket" && count > 0) {
      amountCol +=
        '<button type="button" class="cart-summary__action" id="cart-summary-next">Next</button>';
    } else if (currentStep === "payment" && count > 0) {
      amountCol +=
        '<button type="button" class="cart-summary__action cart-summary__action--purchase" id="cart-summary-purchase">PURCHASE</button>';
    }
    amountCol += "</span>";
    return (
      '<div class="cart-summary">' +
      '<p class="cart-summary__row">' +
      "<span>Subtotal</span>" +
      amountCol +
      "</p>" +
      meta +
      '<p class="cart-summary__note">' +
      escapeHtml(note) +
      "</p>" +
      "</div>"
    );
  }

  function promoBannerHtml(subtotal) {
    if (subtotal >= FREE_THRESHOLD) {
      return (
        '<div class="cart-promo cart-promo--ok" role="status">' +
        '<span class="cart-promo__icon" aria-hidden="true"><i class="fa-solid fa-truck"></i></span>' +
        "<p class=\"cart-promo__text\">Your order qualifies for <strong>free delivery in Amman</strong>.</p>" +
        "</div>"
      );
    }
    var need = FREE_THRESHOLD - subtotal;
    return (
      '<div class="cart-promo" role="status">' +
      '<span class="cart-promo__icon" aria-hidden="true"><i class="fa-solid fa-truck"></i></span>' +
      "<p class=\"cart-promo__text\">Spend another <strong>JOD " +
      escapeHtml(formatMoney(need)) +
      "</strong> to qualify for free delivery in Amman.</p>" +
      "</div>"
    );
  }

  function qtyOptions(selected) {
    var opts = "";
    for (var i = 1; i <= 10; i++) {
      opts +=
        "<option value=\"" +
        i +
        "\"" +
        (i === selected ? " selected" : "") +
        ">" +
        i +
        "</option>";
    }
    return opts;
  }

  function cloneLineForUndo(line) {
    return {
      isbn: String(line.isbn || "").trim(),
      title: String(line.title || "").trim(),
      author: String(line.author || "").trim(),
      price: String(line.price != null ? line.price : "0").trim(),
      format: String(line.format || "Paperback").trim(),
      img: String(line.img || "").trim(),
      dispatch: String(line.dispatch || "").trim(),
      qty: parseInt(line.qty, 10) || 1,
    };
  }

  function syncSessionOrder(lines) {
    lines.forEach(function (l) {
      var id = String(l.isbn || "").trim();
      if (!id) return;
      if (sessionLineOrder.indexOf(id) < 0) sessionLineOrder.push(id);
    });
  }

  function restoreInsertFromSession(cartLines, restoredIsbn) {
    restoredIsbn = String(restoredIsbn || "").trim();
    if (!restoredIsbn) return cartLines.length;
    if (sessionLineOrder.indexOf(restoredIsbn) < 0) sessionLineOrder.push(restoredIsbn);
    var ri = sessionLineOrder.indexOf(restoredIsbn);
    var insertAt = cartLines.length;
    for (var c = 0; c < cartLines.length; c++) {
      var cid = String(cartLines[c].isbn || "").trim();
      var ci = sessionLineOrder.indexOf(cid);
      if (ci < 0) continue;
      if (ci > ri) {
        insertAt = c;
        break;
      }
    }
    return insertAt;
  }

  function effectiveUndoGroupKey(u, cartLines) {
    var id = String(u.line.isbn || "").trim();
    var ri = sessionLineOrder.indexOf(id);
    if (ri < 0) return "__end__";
    for (var s = ri + 1; s < sessionLineOrder.length; s++) {
      var cand = sessionLineOrder[s];
      for (var i = 0; i < cartLines.length; i++) {
        if (cartLines[i].isbn === cand) return cand;
      }
    }
    return "__end__";
  }

  function undoRowHtml(line) {
    return (
      '<article class="cart-line cart-line--undo" role="status" data-undo-isbn="' +
      escapeHtml(line.isbn) +
      '">' +
      '<div class="cart-line__undo-inner">' +
      '<span class="cart-line__undo-text"><span class="cart-line__undo-intro">Removed</span> ' +
      '<span class="cart-line__undo-title">' +
      escapeHtml(line.title) +
      "</span></span>" +
      '<button type="button" class="cart-line__undo-btn">Undo</button>' +
      "</div></article>"
    );
  }

  function basketLinesHtmlMerged(cartLines) {
    var groups = {};
    pendingUndos.forEach(function (u) {
      var k = effectiveUndoGroupKey(u, cartLines);
      if (!groups[k]) groups[k] = [];
      groups[k].push(u);
    });
    Object.keys(groups).forEach(function (k) {
      groups[k].sort(function (a, b) {
        var ia = sessionLineOrder.indexOf(a.line.isbn);
        var ib = sessionLineOrder.indexOf(b.line.isbn);
        if (ia < 0) ia = 1e9;
        if (ib < 0) ib = 1e9;
        if (ia !== ib) return ia - ib;
        return a.atIndex - b.atIndex;
      });
    });
    var html = "";
    cartLines.forEach(function (line) {
      var k = line.isbn;
      if (groups[k]) {
        groups[k].forEach(function (u) {
          html += undoRowHtml(u.line);
        });
        delete groups[k];
      }
      html += lineRow(line);
    });
    if (groups.__end__) {
      groups.__end__.forEach(function (u) {
        html += undoRowHtml(u.line);
      });
    }
    return html;
  }

  var GC_GRADIENTS = {
    "1": "linear-gradient(140deg,#d4a44c 0%,#8b6012 100%)",
    "2": "linear-gradient(140deg,#c41e3a 0%,#7b0d1e 100%)",
    "3": "linear-gradient(140deg,#3d4046 0%,#111317 100%)",
    "4": "linear-gradient(140deg,#7b2d8b 0%,#3d0a50 100%)",
    "5": "linear-gradient(140deg,#1e88e5 0%,#0d47a1 100%)",
    "6": "linear-gradient(140deg,#1a237e 0%,#050d3a 100%)",
    "7": "linear-gradient(140deg,#e91e8c 0%,#880e4f 100%)",
    "8": "linear-gradient(140deg,#2e7d32 0%,#0a3d0d 100%)",
  };
  var GC_ICONS = {
    "1": "fa-book-open", "2": "fa-bookmark",      "3": "fa-feather-pointed",
    "4": "fa-star",      "5": "fa-book",           "6": "fa-crown",
    "7": "fa-heart",     "8": "fa-leaf",
  };

  function lineMediaHtml(line) {
    if (line.img && line.img.indexOf("gc-design:") === 0) {
      var id = line.img.split(":")[1] || "1";
      var bg = GC_GRADIENTS[id] || GC_GRADIENTS["1"];
      var icon = GC_ICONS[id] || "fa-gift";
      return (
        '<div class="cart-line__gc-visual" style="background:' + bg + '" aria-hidden="true">' +
          '<span class="cart-line__gc-brand">Readers</span>' +
          '<i class="fa-solid ' + icon + ' cart-line__gc-icon"></i>' +
        '</div>'
      );
    }
    return (
      '<img class="cart-line__img" src="' +
      escapeHtml(line.img) +
      '" alt="" width="72" height="92" loading="lazy" decoding="async" />'
    );
  }

  function lineRow(line) {
    var unit = parseFloat(line.price, 10);
    if (isNaN(unit)) unit = 0;
    var qty = parseInt(line.qty, 10) || 1;
    var lineTotal = unit * qty;
    return (
      '<article class="cart-line" data-isbn="' +
      escapeHtml(line.isbn) +
      '">' +
      '<div class="cart-line__media">' +
      lineMediaHtml(line) +
      "</div>" +
      '<div class="cart-line__main">' +
      '<h2 class="cart-line__title">' +
      escapeHtml(line.title) +
      "</h2>" +
      '<p class="cart-line__author">' +
      escapeHtml(line.author) +
      "</p>" +
      '<p class="cart-line__unit"><span class="cart-line__unit-label">JOD</span> ' +
      escapeHtml(formatMoney(unit)) +
      "</p>" +
      '<p class="cart-line__format">' +
      escapeHtml(line.format) +
      "</p>" +
      '<p class="cart-line__dispatch">' +
      escapeHtml(line.dispatch) +
      "</p>" +
      '<button type="button" class="cart-line__remove">Remove</button>' +
      "</div>" +
      '<div class="cart-line__qty">' +
      '<label class="visually-hidden" for="cart-qty-' +
      escapeHtml(line.isbn) +
      '">Quantity</label>' +
      '<select class="cart-line__select" id="cart-qty-' +
      escapeHtml(line.isbn) +
      '" data-isbn="' +
      escapeHtml(line.isbn) +
      '">' +
      qtyOptions(qty) +
      "</select>" +
      "</div>" +
      '<div class="cart-line__total">JOD ' +
      escapeHtml(formatMoney(lineTotal)) +
      "</div>" +
      "</article>"
    );
  }

  function stepsNavHtml(activeStep) {
    var steps = [
      { id: "basket", label: "Basket" },
      { id: "payment", label: "Payment" },
    ];
    var activeIdx = 0;
    steps.forEach(function (s, i) {
      if (s.id === activeStep) activeIdx = i;
    });

    var parts = [];
    steps.forEach(function (s, i) {
      var isActive = s.id === activeStep;
      var isDone = i < activeIdx;
      var cls = "cart-steps__item";
      if (isActive) cls += " is-active";
      if (isDone) cls += " is-done";

      var numContent = isDone
        ? '<i class="fa-solid fa-check" aria-hidden="true"></i>'
        : String(i + 1);

      parts.push(
        '<li class="' + cls + '" role="presentation">' +
        '<button type="button" class="cart-steps__btn" id="cart-tab-' + s.id + '"' +
        ' role="tab" aria-selected="' + (isActive ? "true" : "false") + '"' +
        ' data-cart-step="' + s.id + '">' +
        '<span class="cart-steps__num" aria-hidden="true">' + numContent + '</span>' +
        '<span class="cart-steps__label">' + escapeHtml(s.label) + '</span>' +
        '</button></li>'
      );

      if (i < steps.length - 1) {
        var connCls = "cart-steps__connector" + (isDone ? " is-done" : "");
        parts.push(
          '<li class="' + connCls + '" role="presentation" aria-hidden="true">' +
          '<span class="cart-steps__connector-fill"></span>' +
          '</li>'
        );
      }
    });

    return (
      '<nav class="cart-steps" aria-label="Checkout progress">' +
      '<ol class="cart-steps__list" role="tablist">' +
      parts.join("") +
      "</ol></nav>"
    );
  }

  function deliveryFieldRow(id, name, label, type, value, placeholder, autocomplete) {
    type = type || "text";
    var inputHtml =
      '<input class="cart-field-line__input" type="' +
      type +
      '" id="' +
      id +
      '" name="' +
      escapeHtml(name) +
      '" value="' +
      escapeHtml(value) +
      '" placeholder="' +
      escapeHtml(placeholder) +
      '" autocomplete="' +
      escapeHtml(autocomplete || "on") +
      '" />';
    if (type === "tel") {
      var prefixHtml = typeof window._phonePrefixHtml === "function" ? window._phonePrefixHtml() : "";
      var telPlaceholder = (window._phoneCountries && window._phoneCountries[0])
        ? window._phoneCountries[0].placeholder : "7X XXX XXXX";
      inputHtml =
        '<div class="phone-field">' +
          prefixHtml +
          '<input class="cart-field-line__input" type="tel" id="' +
          id +
          '" name="' +
          escapeHtml(name) +
          '" value="' +
          escapeHtml(value) +
          '" placeholder="' + telPlaceholder + '" autocomplete="tel" />' +
        '</div>';
    }
    return (
      '<div class="cart-field-line">' +
      '<label class="cart-field-line__label" for="' +
      id +
      '">' +
      escapeHtml(label) +
      "</label>" +
      '<div class="cart-field-line__control">' +
      inputHtml +
      "</div></div>"
    );
  }

  function cashDeliverySectionHtml() {
    var d = loadDelivery();
    return (
      '<div class="cart-cash-delivery" id="cart-cash-delivery">' +
      '<p class="cart-cash-delivery__title" id="cart-cash-delivery-title">Delivery details</p>' +
      '<div class="cart-step-lines" role="group" aria-labelledby="cart-cash-delivery-title">' +
      deliveryFieldRow(
        "cart-delivery-first",
        "firstName",
        "First name",
        "text",
        d.firstName || "",
        "First name",
        "given-name"
      ) +
      deliveryFieldRow(
        "cart-delivery-last",
        "lastName",
        "Last name",
        "text",
        d.lastName || "",
        "Last name",
        "family-name"
      ) +
      deliveryFieldRow(
        "cart-delivery-address",
        "address",
        "Address",
        "text",
        d.address || "",
        "Street, building, apartment",
        "street-address"
      ) +
      deliveryFieldRow(
        "cart-delivery-city",
        "city",
        "City",
        "text",
        d.city || "",
        "City",
        "address-level2"
      ) +
      deliveryFieldRow(
        "cart-delivery-phone",
        "phone",
        "Phone number",
        "tel",
        d.phone || "",
        "+962 7X XXX XXXX",
        "tel"
      ) +
      "</div>" +
      '<p class="cart-step-footnote">Details are saved in this browser only (demo).</p>' +
      "</div>"
    );
  }

  function pickupLocationHtml() {
    var line = "Readers Jo : Issa An-Nouri St. , 7th Circle , Amman-Jordan";
    return (
      '<div class="cart-pickup-location" id="cart-pickup-location" role="region" aria-labelledby="cart-pickup-location-title">' +
      '<p class="cart-pickup-location__title" id="cart-pickup-location-title">Pick up location</p>' +
      '<p class="cart-pickup-location__address">' + escapeHtml(line) + "</p>" +
      '<div class="cart-pickup-reminder" role="note">' +
      '<i class="fa-solid fa-clock" aria-hidden="true"></i>' +
      '<p class="cart-pickup-reminder__text">You have to pickup your order within <strong>1 week</strong> of receiving the &ldquo;Ready for Pickup&rdquo; notification.</p>' +
      '</div>' +
      "</div>"
    );
  }

  function loadDefaultAddress() {
    try {
      var raw = localStorage.getItem("readers_address_book_v1");
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.addresses) || !data.addresses.length) return null;
      var found = null;
      if (data.defaultId) {
        data.addresses.forEach(function (a) {
          if (String(a.id) === String(data.defaultId)) found = a;
        });
      }
      return found || data.addresses[0];
    } catch (e) {
      return null;
    }
  }

  function loadDefaultCard() {
    try {
      var raw = localStorage.getItem("readers_payment_methods_v1");
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.cards) || !data.cards.length) return null;
      var found = null;
      data.cards.forEach(function (c) { if (c.isDefault) found = c; });
      return found || data.cards[0];
    } catch (e) {
      return null;
    }
  }

  function expressShipmentHtml(p) {
    var type = (p && p.shipmentType) || "standard";
    return (
      '<div class="cart-express" id="cart-express-section" role="group" aria-labelledby="cart-express-title">' +
      '<p class="cart-express__title" id="cart-express-title">Shipment speed</p>' +
      '<div class="cart-express__options">' +
      '<label class="cart-express__option' + (type === "standard" ? " is-selected" : "") + '" for="cart-express-standard">' +
      '<input type="radio" name="cart-shipment-type" id="cart-express-standard" value="standard"' + (type === "standard" ? " checked" : "") + ' />' +
      '<span class="cart-express__icon" aria-hidden="true"><i class="fa-solid fa-truck"></i></span>' +
      '<span class="cart-express__info">' +
      '<span class="cart-express__name">Standard</span>' +
      '<span class="cart-express__detail">3 – 5 business days</span>' +
      '</span>' +
      '<span class="cart-express__price">Free</span>' +
      '</label>' +
      '<label class="cart-express__option' + (type === "express" ? " is-selected" : "") + '" for="cart-express-express">' +
      '<input type="radio" name="cart-shipment-type" id="cart-express-express" value="express"' + (type === "express" ? " checked" : "") + ' />' +
      '<span class="cart-express__icon" aria-hidden="true"><i class="fa-solid fa-bolt"></i></span>' +
      '<span class="cart-express__info">' +
      '<span class="cart-express__name">Express</span>' +
      '<span class="cart-express__detail">Next business day</span>' +
      '</span>' +
      '<span class="cart-express__price">+ JOD 2.50</span>' +
      '</label>' +
      '</div>' +
      '</div>'
    );
  }

  function addressSectionHtml(p) {
    var mode = (p && p.addressMode) || "default";
    var defAddr = loadDefaultAddress();
    var defaultContent = "";
    if (mode === "default") {
      if (defAddr) {
        var parts = [];
        if (defAddr.type) parts.push(escapeHtml(String(defAddr.type)));
        if (defAddr.buildingNumber) parts.push("Building " + escapeHtml(String(defAddr.buildingNumber)));
        if (defAddr.buildingName) parts.push(escapeHtml(String(defAddr.buildingName)));
        if (defAddr.street) parts.push(escapeHtml(String(defAddr.street)));
        if (defAddr.area) parts.push(escapeHtml(String(defAddr.area)));
        if (defAddr.city) parts.push(escapeHtml(String(defAddr.city)));
        var addrText = parts.join(", ") || "Saved address";
        defaultContent =
          '<div class="cart-default-addr">' +
          '<i class="fa-solid fa-location-dot cart-default-addr__icon" aria-hidden="true"></i>' +
          '<p class="cart-default-addr__text">' + addrText + '</p>' +
          '<a href="addressbook.html" class="cart-default-addr__edit">Edit</a>' +
          '</div>';
      } else {
        defaultContent =
          '<div class="cart-default-addr cart-default-addr--empty">' +
          '<i class="fa-solid fa-location-dot cart-default-addr__icon" aria-hidden="true"></i>' +
          '<p class="cart-default-addr__text">No default address saved. <a href="addressbook.html">Add one</a> or select &ldquo;New address&rdquo; to enter details below.</p>' +
          '</div>';
      }
    }
    return (
      '<div class="cart-address-section" id="cart-address-section" role="group" aria-labelledby="cart-address-section-title">' +
      '<p class="cart-address-section__title" id="cart-address-section-title">Delivery address</p>' +
      '<div class="cart-address-modes">' +
      '<label class="cart-address-mode' + (mode === "default" ? " is-selected" : "") + '" for="cart-addr-mode-default">' +
      '<input type="radio" name="cart-address-mode" id="cart-addr-mode-default" value="default"' + (mode === "default" ? " checked" : "") + ' />' +
      '<i class="fa-solid fa-bookmark" aria-hidden="true"></i>' +
      '<span>Default</span>' +
      '</label>' +
      '<label class="cart-address-mode' + (mode === "new" ? " is-selected" : "") + '" for="cart-addr-mode-new">' +
      '<input type="radio" name="cart-address-mode" id="cart-addr-mode-new" value="new"' + (mode === "new" ? " checked" : "") + ' />' +
      '<i class="fa-solid fa-plus" aria-hidden="true"></i>' +
      '<span>New address</span>' +
      '</label>' +
      '</div>' +
      defaultContent +
      '</div>'
    );
  }

  function cardSectionHtml(p) {
    var mode = (p && p.cardMode) || "default";
    var defCard = loadDefaultCard();
    var defaultContent = "";
    if (mode === "default") {
      if (defCard) {
        var brandLabel = defCard.brand === "visa" ? "VISA" : defCard.brand === "mastercard" ? "MASTERCARD" : "CARD";
        var masked = "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 " + escapeHtml(defCard.last4 || "****");
        defaultContent =
          '<div class="cart-default-addr">' +
          '<i class="fa-solid fa-credit-card cart-default-addr__icon" aria-hidden="true"></i>' +
          '<p class="cart-default-addr__text">' +
          '<strong>' + brandLabel + '</strong> ' + masked +
          (defCard.expiry ? ' &nbsp;&middot;&nbsp; Expires ' + escapeHtml(defCard.expiry) : '') +
          (defCard.nameOnCard ? '<br><span style="font-size:0.85em;color:#666;">' + escapeHtml(defCard.nameOnCard) + '</span>' : '') +
          '</p>' +
          '<a href="payment.html" class="cart-default-addr__edit">Edit</a>' +
          '</div>';
      } else {
        defaultContent =
          '<div class="cart-default-addr cart-default-addr--empty">' +
          '<i class="fa-solid fa-credit-card cart-default-addr__icon" aria-hidden="true"></i>' +
          '<p class="cart-default-addr__text">No saved card. <a href="payment.html">Add one</a> or select &ldquo;New card&rdquo; to enter details below.</p>' +
          '</div>';
      }
    }
    var newCardContent = mode === "new" ? cardFormHtml(p) : "";
    return (
      '<div class="cart-address-section" id="cart-card-section" role="group" aria-labelledby="cart-card-section-title">' +
      '<p class="cart-address-section__title" id="cart-card-section-title">Card details</p>' +
      '<div class="cart-address-modes">' +
      '<label class="cart-address-mode' + (mode === "default" ? " is-selected" : "") + '" for="cart-card-mode-default">' +
      '<input type="radio" name="cart-card-mode" id="cart-card-mode-default" value="default"' + (mode === "default" ? " checked" : "") + ' />' +
      '<i class="fa-solid fa-bookmark" aria-hidden="true"></i>' +
      '<span>Default</span>' +
      '</label>' +
      '<label class="cart-address-mode' + (mode === "new" ? " is-selected" : "") + '" for="cart-card-mode-new">' +
      '<input type="radio" name="cart-card-mode" id="cart-card-mode-new" value="new"' + (mode === "new" ? " checked" : "") + ' />' +
      '<i class="fa-solid fa-plus" aria-hidden="true"></i>' +
      '<span>New card</span>' +
      '</label>' +
      '</div>' +
      defaultContent +
      newCardContent +
      '</div>'
    );
  }

  function paymentRadio(value, label, current) {
    var id = "cart-pay-method-" + value;
    var checked = current === value ? " checked" : "";
    return (
      '<label class="cart-payment-method" for="' +
      id +
      '">' +
      '<input type="radio" name="cart-payment-method" id="' +
      id +
      '" value="' +
      value +
      '"' +
      checked +
      " />" +
      '<span class="cart-payment-method__text">' +
      escapeHtml(label) +
      "</span></label>"
    );
  }

  function cardPaymentFieldRow(id, dataKey, labelText, value, placeholder, autocomplete, inputmode, maxlength) {
    inputmode = inputmode || "text";
    var maxAttr =
      maxlength != null && maxlength !== "" ? ' maxlength="' + escapeHtml(String(maxlength)) + '"' : "";
    return (
      '<div class="cart-field-line">' +
      '<label class="cart-field-line__label" for="' +
      id +
      '">' +
      escapeHtml(labelText) +
      ' <span class="cart-pay-req" aria-hidden="true">*</span>' +
      "</label>" +
      '<div class="cart-field-line__control">' +
      '<input class="cart-field-line__input cart-pay-input" type="text" id="' +
      id +
      '" data-payment-field="' +
      escapeHtml(dataKey) +
      '" value="' +
      escapeHtml(value) +
      '" placeholder="' +
      escapeHtml(placeholder) +
      '" autocomplete="' +
      escapeHtml(autocomplete) +
      '" inputmode="' +
      escapeHtml(inputmode) +
      '"' +
      maxAttr +
      " />" +
      "</div></div>"
    );
  }

  function cardFormHtml(p) {
    return (
      '<div class="cart-card-form" id="cart-card-form">' +
      '<div class="cart-step-lines" role="group" aria-label="New card details">' +
      '<div class="cart-field-line cart-field-line--message">' +
      '<p class="cart-card-form__intro">' +
      "Please enter your payment details carefully below, leaving no spaces in the card number." +
      "</p></div>" +
      cardPaymentFieldRow(
        "cart-pay-cardname",
        "nameOnCard",
        "Name on card",
        p.nameOnCard || "",
        "Cardholder name",
        "cc-name",
        "text",
        null
      ) +
      cardPaymentFieldRow(
        "cart-pay-cardnum",
        "cardNumber",
        "Card number",
        p.cardNumber || "",
        "Card number",
        "cc-number",
        "numeric",
        null
      ) +
      cardPaymentFieldRow(
        "cart-pay-expiry",
        "expiry",
        "Expiry date",
        p.expiry || "",
        "MM/YY",
        "cc-exp",
        "numeric",
        null
      ) +
      '<div class="cart-field-line">' +
      '<label class="cart-field-line__label" for="cart-pay-cvv">Security code <span class="cart-pay-req" aria-hidden="true">*</span></label>' +
      '<div class="cart-field-line__control">' +
      '<input class="cart-field-line__input cart-pay-input cart-field-line__input--narrow" type="text" id="cart-pay-cvv" data-payment-field="cvv" value="' +
      escapeHtml(p.cvv || "") +
      '" placeholder="CVV" autocomplete="cc-csc" inputmode="numeric" maxlength="4" />' +
      "</div></div>" +
      "</div>" +
      '<p class="cart-step-footnote">Details are saved in this browser only (demo).</p>' +
      '<div class="cart-pay-actions">' +
      '<p class="cart-pay-required-note"><span class="cart-pay-req" aria-hidden="true">*</span> Required fields</p>' +
      '<button type="button" class="cart-pay-continue" id="cart-pay-continue-btn">Continue</button>' +
      "</div></div>"
    );
  }

  function paymentBodyHtml() {
    var p = loadPayment();
    var method = p.method || "pickup";
    var showCard = method === "card";
    var showCash = method === "cash";
    var showPickup = method === "pickup";
    var showVisa = method === "visa";

    /* Express section for all delivery methods + pickup */
    var showExpress = showPickup || showCash || showVisa || showCard;
    /* Address toggle (default vs new) for all delivery methods */
    var showAddressSection = showCash || showVisa || showCard;
    var addressMode = (p && p.addressMode) || "default";
    /* Delivery details only when "new address" is chosen (all delivery methods) */
    var showDeliveryDetails = (showCash || showVisa || showCard) && addressMode === "new";

    return (
      '<div class="cart-step-panel" id="cart-panel-payment" role="tabpanel" aria-labelledby="cart-tab-payment">' +
      '<div class="cart-payment">' +
      '<p class="cart-payment-demo">Static checkout — no payment is processed.</p>' +
      '<div class="cart-payment-methods" role="radiogroup" aria-label="Payment method">' +
      paymentRadio("pickup", "Pick up From Store", method) +
      paymentRadio("cash", "Cash on Delivery", method) +
      paymentRadio("visa", "Visa on Delivery", method) +
      paymentRadio("card", "Credit/Debit Card", method) +
      "</div>" +
      (showPickup ? pickupLocationHtml() : "") +
      (showExpress ? expressShipmentHtml(p) : "") +
      (showAddressSection ? addressSectionHtml(p) : "") +
      (showDeliveryDetails ? cashDeliverySectionHtml() : "") +
      (showCard ? cardSectionHtml(p) : "") +
      "</div></div>"
    );
  }

  function basketBodyHtml(lines, subtotal) {
    if (!lines.length && !pendingUndos.length) {
      sessionLineOrder = [];
      return (
        '<div class="cart-step-panel" id="cart-panel-basket" role="tabpanel" aria-labelledby="cart-tab-basket">' +
        promoBannerHtml(subtotal) +
        '<p class="cart-empty">Your basket is empty.</p>' +
        '<p class="cart-empty__hint"><a href="index.html">Continue shopping</a></p>' +
        "</div>"
      );
    }
    var rows = basketLinesHtmlMerged(lines);
    return (
      '<div class="cart-step-panel" id="cart-panel-basket" role="tabpanel" aria-labelledby="cart-tab-basket">' +
      promoBannerHtml(subtotal) +
      '<div class="cart-lines" role="list">' +
      rows +
      "</div></div>"
    );
  }

  function bindStepNav() {
    mount.querySelectorAll(".cart-steps__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = btn.getAttribute("data-cart-step");
        if (next && next !== currentStep) {
          if (currentStep === "basket" && next !== "basket") {
            pendingUndos = [];
          }
          currentStep = next;
          render();
        }
      });
    });
  }

  function bindBasketLines() {
    mount.querySelectorAll(".cart-line__select").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var isbn = sel.getAttribute("data-isbn");
        ReadersCart.setQty(isbn, sel.value);
        render();
      });
    });
    mount.querySelectorAll(".cart-line__remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = btn.closest(".cart-line");
        if (!row || row.classList.contains("cart-line--undo")) return;
        var isbn = row && row.getAttribute("data-isbn");
        if (!isbn) return;
        var lines = ReadersCart.getLines();
        var idx = -1;
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].isbn === isbn) {
            idx = i;
            break;
          }
        }
        if (idx < 0) return;
        var snapshot = cloneLineForUndo(lines[idx]);
        pendingUndos.push({
          line: snapshot,
          atIndex: idx,
        });
        ReadersCart.remove(isbn);
        render();
      });
    });
    mount.querySelectorAll(".cart-line__undo-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = btn.closest(".cart-line--undo");
        var isbn = row && row.getAttribute("data-undo-isbn");
        if (!isbn) return;
        for (var i = 0; i < pendingUndos.length; i++) {
          if (pendingUndos[i].line.isbn === isbn) {
            var u = pendingUndos[i];
            var snap = u.line;
            pendingUndos.splice(i, 1);
            var cartLines = ReadersCart.getLines();
            var insertAt = restoreInsertFromSession(cartLines, snap.isbn);
            ReadersCart.insertLineAt(insertAt, snap, snap.qty);
            render();
            return;
          }
        }
      });
    });
  }

  function bindCashDeliveryFields() {
    var fields = [
      { id: "cart-delivery-first", name: "firstName" },
      { id: "cart-delivery-last", name: "lastName" },
      { id: "cart-delivery-address", name: "address" },
      { id: "cart-delivery-city", name: "city" },
      { id: "cart-delivery-phone", name: "phone" },
    ];
    fields.forEach(function (f) {
      var el = document.getElementById(f.id);
      if (!el) return;
      el.addEventListener("input", function () {
        saveDeliveryField(f.name, el.value);
      });
      el.addEventListener("blur", function () {
        saveDeliveryField(f.name, el.value);
      });
    });
  }

  function bindPaymentForm() {
    mount.querySelectorAll('input[name="cart-payment-method"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (radio.checked) {
          savePaymentPatch({ method: radio.value });
          render();
        }
      });
    });

    /* Shipment type — update is-selected classes without a full re-render */
    mount.querySelectorAll('input[name="cart-shipment-type"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (radio.checked) {
          savePaymentPatch({ shipmentType: radio.value });
          mount.querySelectorAll(".cart-express__option").forEach(function (lbl) {
            var inp = lbl.querySelector("input[type='radio']");
            lbl.classList.toggle("is-selected", !!(inp && inp.checked));
          });
        }
      });
    });

    /* Address mode — re-render to show / hide the delivery details form */
    mount.querySelectorAll('input[name="cart-address-mode"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (radio.checked) {
          savePaymentPatch({ addressMode: radio.value });
          render();
        }
      });
    });

    /* Card mode — re-render to show default card or new card form */
    mount.querySelectorAll('input[name="cart-card-mode"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (radio.checked) {
          savePaymentPatch({ cardMode: radio.value });
          render();
        }
      });
    });

    mount.querySelectorAll(".cart-pay-input").forEach(function (el) {
      var key = el.getAttribute("data-payment-field");
      if (!key) return;
      function saveVal() {
        var patch = {};
        patch[key] = el.value;
        savePaymentPatch(patch);
      }
      el.addEventListener("input", saveVal);
      el.addEventListener("blur", saveVal);
    });
    var cont = document.getElementById("cart-pay-continue-btn");
    if (cont) {
      cont.addEventListener("click", function () {
        /* Static demo — no gateway */
      });
    }
    bindCashDeliveryFields();
  }

  function render() {
    var lines = ReadersCart.getLines();
    syncSessionOrder(lines);
    var subtotal = ReadersCart.getSubtotal();

    var stepBasket = basketBodyHtml(lines, subtotal);
    var stepPayment = paymentBodyHtml();

    var panels = currentStep === "basket" ? stepBasket : stepPayment;

    var pay = loadPayment();
    var promoBlock = currentStep === "payment" ? promotionCodeHtml(pay) : "";
    var upsellBlock = currentStep === "basket" ? cartUpsellHtml() : "";

    mount.innerHTML =
      '<div class="cart-panel">' +
      stepsNavHtml(currentStep) +
      '<div class="cart-step-content">' +
      panels +
      upsellBlock +
      promoBlock +
      cartSummaryHtml(currentStep, lines, subtotal) +
      "</div></div>";

    bindStepNav();
    bindSummaryCtas();

    if (currentStep === "basket") {
      bindBasketLines();
      bindUpsellAdd();
    }
    if (currentStep === "payment") {
      bindPaymentForm();
      bindPromotionCode();
    }
  }

  function bindSummaryCtas() {
    var nextBtn = document.getElementById("cart-summary-next");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        pendingUndos = [];
        currentStep = "payment";
        render();
      });
    }
    var purchaseBtn = document.getElementById("cart-summary-purchase");
    if (purchaseBtn) {
      purchaseBtn.addEventListener("click", function () {
        /* Static demo — no checkout gateway */
      });
    }
  }

  function bindPromotionCode() {
    var input = document.getElementById("cart-promo-code-input");
    var apply = document.getElementById("cart-promo-code-apply");
    if (input) {
      input.addEventListener("input", function () {
        savePaymentPatch({ promoCode: input.value });
      });
      input.addEventListener("blur", function () {
        savePaymentPatch({ promoCode: input.value });
      });
    }
    if (apply) {
      apply.addEventListener("click", function () {
        if (input) savePaymentPatch({ promoCode: input.value.trim() });
      });
    }
  }

  function bindUpsellAdd() {
    var btn = mount.querySelector(".cart-upsell-card__cta");
    if (!btn || !window.ReadersCart) return;
    btn.addEventListener("click", function () {
      var isbn = btn.getAttribute("data-upsell-isbn");
      if (!isbn || isbn !== UPSELL_PRODUCT.isbn) return;
      ReadersCart.add(
        {
          isbn: UPSELL_PRODUCT.isbn,
          title: UPSELL_PRODUCT.title,
          author: UPSELL_PRODUCT.author,
          price: UPSELL_PRODUCT.price,
          format: UPSELL_PRODUCT.format,
          img: UPSELL_PRODUCT.img,
        },
        1
      );
    });
  }

  window.addEventListener("readers-cart-updated", function () {
    render();
  });
  window.addEventListener("storage", function (e) {
    if (e.key === "readers_cart_v1") render();
  });

  render();
})();
