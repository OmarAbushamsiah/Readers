(function () {
  var RATINGS_KEY = "readers_order_ratings";

  // ── Mock order data ────────────────────────────────
  var ORDERS = [
    {
      id: "RD-2026-00412",
      date: "April 14, 2026",
      status: "delivered",
      items: [
        { title: "Atomic Habits", author: "James Clear", qty: 1, price: 14.00, format: "Paperback" },
        { title: "The Psychology of Money", author: "Morgan Housel", qty: 1, price: 13.50, format: "Paperback" },
        { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", qty: 1, price: 15.00, format: "Hardcover" }
      ],
      subtotal: 42.50,
      shipping: 2.50,
      discount: 5.00,
      total: 40.00
    },
    {
      id: "RD-2026-00389",
      date: "April 8, 2026",
      status: "shipped",
      items: [
        { title: "Sapiens", author: "Yuval Noah Harari", qty: 1, price: 16.00, format: "Paperback" },
        { title: "Educated", author: "Tara Westover", qty: 1, price: 14.50, format: "Paperback" }
      ],
      subtotal: 30.50,
      shipping: 2.50,
      discount: 0,
      total: 33.00
    },
    {
      id: "RD-2026-00371",
      date: "March 30, 2026",
      status: "processing",
      items: [
        { title: "The Alchemist", author: "Paulo Coelho", qty: 2, price: 11.00, format: "Paperback" }
      ],
      subtotal: 22.00,
      shipping: 0,
      discount: 0,
      total: 22.00
    },
    {
      id: "RD-2025-00894",
      date: "December 19, 2025",
      status: "cancelled",
      items: [
        { title: "1984", author: "George Orwell", qty: 1, price: 10.50, format: "Paperback" },
        { title: "Brave New World", author: "Aldous Huxley", qty: 1, price: 11.00, format: "Paperback" }
      ],
      subtotal: 21.50,
      shipping: 2.50,
      discount: 0,
      total: 24.00
    }
  ];

  // ── Saved ratings ──────────────────────────────────
  function loadRatings() {
    try { return JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}"); } catch (e) { return {}; }
  }

  function saveRating(orderId, stars) {
    var r = loadRatings();
    r[orderId] = stars;
    try { localStorage.setItem(RATINGS_KEY, JSON.stringify(r)); } catch (e) {}
  }

  // ── Status helpers ─────────────────────────────────
  var STATUS_LABELS = {
    delivered:  "Delivered",
    shipped:    "Shipped",
    processing: "Processing",
    cancelled:  "Cancelled"
  };

  var STATUS_ICONS = {
    delivered:  "fa-circle-check",
    shipped:    "fa-truck",
    processing: "fa-clock",
    cancelled:  "fa-ban"
  };

  // ── Build book cover placeholder ───────────────────
  var COVER_COLORS = [
    ["#2a4f88","#1e3d6e"], ["#235a47","#194535"], ["#9c2535","#7b1b28"],
    ["#7b2d8b","#4a1060"], ["#1e88e5","#0d47a1"], ["#1a237e","#050d3a"],
    ["#c87941","#8b5c28"], ["#2e7d32","#1b5e20"]
  ];

  function coverStyle(index) {
    var c = COVER_COLORS[index % COVER_COLORS.length];
    return "background:linear-gradient(140deg," + c[0] + " 0%," + c[1] + " 100%);";
  }

  // ── Render a single order card ─────────────────────
  function renderCard(order, ratings) {
    var rated = ratings[order.id] || 0;
    var canRate = order.status === "delivered";

    // Thumbnails (max 3 shown + overflow badge)
    var thumbsHtml = "";
    var maxThumbs = Math.min(order.items.length, 3);
    for (var i = 0; i < maxThumbs; i++) {
      thumbsHtml +=
        '<span class="order-card__thumb-placeholder" style="' + coverStyle(i) + '" aria-hidden="true">' +
          '<i class="fa-solid fa-book-open" style="color:rgba(255,255,255,0.5);font-size:0.8rem;"></i>' +
        '</span>';
    }
    if (order.items.length > 3) {
      thumbsHtml +=
        '<span class="order-card__thumb-placeholder" aria-hidden="true">+' + (order.items.length - 3) + '</span>';
    }

    // Item titles summary
    var titleList = order.items.map(function (it) { return it.title; }).join(", ");
    var itemCountLabel = order.items.length === 1
      ? "1 item"
      : order.items.length + " items";

    // Star rating HTML
    var starsHtml = "";
    for (var s = 1; s <= 5; s++) {
      var activeClass = s <= rated ? " is-active" : "";
      var icon = s <= rated ? "fa-solid fa-star" : "fa-regular fa-star";
      starsHtml +=
        '<button type="button" class="order-rating__star' + activeClass + '"' +
          ' data-order="' + order.id + '" data-star="' + s + '"' +
          ' aria-label="Rate ' + s + ' out of 5"' +
          (rated > 0 || !canRate ? ' disabled style="cursor:default;"' : '') +
        '>' +
          '<i class="' + icon + '" aria-hidden="true"></i>' +
        '</button>';
    }

    var ratingLabel = rated > 0
      ? "Your rating: " + rated + "/5"
      : (canRate ? "Rate this order" : "");

    // Breakdown rows
    var breakdownHtml =
      '<div class="order-breakdown__row">' +
        '<span class="order-breakdown__label">Subtotal</span>' +
        '<span class="order-breakdown__amount">JOD ' + order.subtotal.toFixed(2) + '</span>' +
      '</div>';

    if (order.shipping > 0) {
      breakdownHtml +=
        '<div class="order-breakdown__row">' +
          '<span class="order-breakdown__label">Shipping</span>' +
          '<span class="order-breakdown__amount">JOD ' + order.shipping.toFixed(2) + '</span>' +
        '</div>';
    } else {
      breakdownHtml +=
        '<div class="order-breakdown__row">' +
          '<span class="order-breakdown__label">Shipping</span>' +
          '<span class="order-breakdown__amount" style="color:#2e7d32;">Free</span>' +
        '</div>';
    }

    if (order.discount > 0) {
      breakdownHtml +=
        '<div class="order-breakdown__row">' +
          '<span class="order-breakdown__label">Discount</span>' +
          '<span class="order-breakdown__amount" style="color:#2e7d32;">- JOD ' + order.discount.toFixed(2) + '</span>' +
        '</div>';
    }

    breakdownHtml +=
      '<div class="order-breakdown__row order-breakdown__row--total">' +
        '<span class="order-breakdown__label">Total</span>' +
        '<span class="order-breakdown__amount">JOD ' + order.total.toFixed(2) + '</span>' +
      '</div>';

    // Item rows inside expanded details
    var itemRowsHtml = order.items.map(function (item, idx) {
      return (
        '<div class="order-item-row">' +
          '<span class="order-item-row__cover-placeholder" style="' + coverStyle(idx) + '">' +
            '<i class="fa-solid fa-book-open" style="color:rgba(255,255,255,0.45);font-size:1rem;" aria-hidden="true"></i>' +
          '</span>' +
          '<div class="order-item-row__info">' +
            '<p class="order-item-row__title">' + esc(item.title) + '</p>' +
            '<p class="order-item-row__author">' + esc(item.author) + '</p>' +
            '<p class="order-item-row__meta">' + esc(item.format) + ' &nbsp;·&nbsp; Qty: ' + item.qty + '</p>' +
          '</div>' +
          '<div class="order-item-row__price">' +
            'JOD ' + (item.price * item.qty).toFixed(2) +
            '<span class="order-item-row__price-sub">JOD ' + item.price.toFixed(2) + ' each</span>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    var detailsBtnId = "details-btn-" + order.id;
    var detailsPanelId = "details-panel-" + order.id;

    var reorderBtn = order.status !== "cancelled"
      ? '<button type="button" class="order-card__btn order-card__btn--ghost">' +
          '<i class="fa-solid fa-rotate-right" aria-hidden="true"></i> Reorder' +
        '</button>'
      : "";

    return (
      '<article class="order-card" data-status="' + order.status + '" data-id="' + esc(order.id) + '">' +
        '<div class="order-card__strip" aria-hidden="true"></div>' +

        '<div class="order-card__header">' +
          '<div class="order-card__id-group">' +
            '<span class="order-card__id">Order #' + esc(order.id) + '</span>' +
            '<span class="order-card__date"><i class="fa-regular fa-calendar" aria-hidden="true"></i> ' + esc(order.date) + '</span>' +
          '</div>' +
          '<div class="order-card__header-right">' +
            '<span class="order-status order-status--' + order.status + '" role="status">' +
              '<span class="order-status__dot" aria-hidden="true"></span>' +
              '<i class="fa-solid ' + STATUS_ICONS[order.status] + '" aria-hidden="true"></i> ' +
              STATUS_LABELS[order.status] +
            '</span>' +
          '</div>' +
        '</div>' +

        '<div class="order-card__summary">' +
          '<div class="order-card__thumbs" aria-hidden="true">' + thumbsHtml + '</div>' +
          '<div class="order-card__summary-info">' +
            '<span class="order-card__item-count">' + itemCountLabel + '</span>' +
            '<span class="order-card__item-titles">' + esc(titleList) + '</span>' +
          '</div>' +
        '</div>' +

        '<div class="order-card__footer">' +
          '<div class="order-card__left">' +
            (canRate || rated > 0
              ? '<div class="order-rating' + (rated > 0 ? ' order-rating--rated' : '') + '" aria-label="Order rating">' +
                  '<span class="order-rating__label">' + ratingLabel + '</span>' +
                  '<div class="order-rating__stars">' + starsHtml + '</div>' +
                '</div>'
              : '') +
            '<div class="order-card__cost">' +
              '<span class="order-card__cost-label">Order Total</span>' +
              '<span class="order-card__cost-amount">JOD ' + order.total.toFixed(2) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="order-card__actions">' +
            '<button type="button" class="order-card__btn order-card__btn--details"' +
              ' id="' + detailsBtnId + '" aria-expanded="false" aria-controls="' + detailsPanelId + '">' +
              'View Details <i class="fa-solid fa-chevron-down btn-chevron" aria-hidden="true"></i>' +
            '</button>' +
            reorderBtn +
          '</div>' +
        '</div>' +

        '<div class="order-details" id="' + detailsPanelId + '" role="region" aria-label="Order details">' +
          '<div class="order-details__inner">' +
            '<p class="order-details__section-title">Items</p>' +
            '<div class="order-items-list">' + itemRowsHtml + '</div>' +
            '<p class="order-details__section-title">Cost Summary</p>' +
            '<div class="order-breakdown">' + breakdownHtml + '</div>' +
          '</div>' +
        '</div>' +

      '</article>'
    );
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ── Render all / filtered orders ──────────────────
  var listEl    = document.getElementById("orders-list");
  var countEl   = document.getElementById("orders-count");
  var searchEl  = document.getElementById("orders-search");
  var filterEl  = document.getElementById("orders-filter");

  function renderAll() {
    var ratings   = loadRatings();
    var query     = searchEl.value.trim().toLowerCase();
    var statusVal = filterEl.value;

    var visible = ORDERS.filter(function (o) {
      var matchStatus = statusVal === "all" || o.status === statusVal;
      var matchQuery  = !query ||
        o.id.toLowerCase().includes(query) ||
        o.items.some(function (it) { return it.title.toLowerCase().includes(query); });
      return matchStatus && matchQuery;
    });

    if (visible.length === 0) {
      listEl.innerHTML =
        '<div class="orders-no-results">' +
          '<i class="fa-solid fa-magnifying-glass" style="font-size:1.5rem;color:#ddd;display:block;margin-bottom:0.65rem;" aria-hidden="true"></i>' +
          'No orders match your search.' +
        '</div>';
    } else {
      listEl.innerHTML = visible.map(function (o) { return renderCard(o, ratings); }).join("");
      bindCardEvents();
    }

    var n = visible.length;
    countEl.textContent = n + (n === 1 ? " order" : " orders");
  }

  // ── Event binding ──────────────────────────────────
  function bindCardEvents() {
    // Details accordion
    document.querySelectorAll(".order-card__btn--details").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panelId  = btn.getAttribute("aria-controls");
        var panel    = document.getElementById(panelId);
        var expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        if (!expanded) {
          panel.classList.add("is-open");
          btn.innerHTML = 'Hide Details <i class="fa-solid fa-chevron-down btn-chevron" aria-hidden="true" style="transform:rotate(180deg);display:inline-block;"></i>';
        } else {
          panel.classList.remove("is-open");
          btn.innerHTML = 'View Details <i class="fa-solid fa-chevron-down btn-chevron" aria-hidden="true"></i>';
        }
      });
    });

    // Star rating
    document.querySelectorAll(".order-rating__star:not([disabled])").forEach(function (star) {
      star.addEventListener("click", function () {
        var orderId = star.dataset.order;
        var stars   = parseInt(star.dataset.star, 10);
        saveRating(orderId, stars);
        renderAll();
      });

      star.addEventListener("mouseenter", function () {
        var starNum = parseInt(star.dataset.star, 10);
        var group   = star.closest(".order-rating__stars");
        if (!group) return;
        group.querySelectorAll(".order-rating__star").forEach(function (s) {
          var n = parseInt(s.dataset.star, 10);
          var icon = s.querySelector("i");
          if (icon) icon.className = n <= starNum ? "fa-solid fa-star" : "fa-regular fa-star";
        });
      });

      star.addEventListener("mouseleave", function () {
        var orderId = star.dataset.order;
        var saved   = loadRatings()[orderId] || 0;
        var group   = star.closest(".order-rating__stars");
        if (!group) return;
        group.querySelectorAll(".order-rating__star").forEach(function (s) {
          var n = parseInt(s.dataset.star, 10);
          var icon = s.querySelector("i");
          if (icon) icon.className = n <= saved ? "fa-solid fa-star" : "fa-regular fa-star";
        });
      });
    });

    // Reorder button
    document.querySelectorAll(".order-card__btn--ghost").forEach(function (btn) {
      if (btn.textContent.trim().startsWith("Reorder")) {
        btn.addEventListener("click", function () {
          window.location.href = "index.html";
        });
      }
    });
  }

  // ── Stats counters ─────────────────────────────────
  function updateStats() {
    var total     = ORDERS.length;
    var delivered = ORDERS.filter(function (o) { return o.status === "delivered"; }).length;
    var active    = ORDERS.filter(function (o) { return o.status === "processing" || o.status === "shipped"; }).length;

    var totalEl     = document.getElementById("stat-total");
    var deliveredEl = document.getElementById("stat-delivered");
    var activeEl    = document.getElementById("stat-active");

    if (totalEl)     totalEl.textContent     = total;
    if (deliveredEl) deliveredEl.textContent = delivered;
    if (activeEl)    activeEl.textContent    = active;
  }

  // ── Search & filter listeners ──────────────────────
  var searchTimer;
  searchEl.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderAll, 200);
  });

  filterEl.addEventListener("change", renderAll);

  // ── Init ───────────────────────────────────────────
  updateStats();
  renderAll();
})();
