/**
 * Cart link + badge on every page; "Add to cart" on home book cards.
 */
(function () {
  var CART_HREF = "cart.html";

  function formatQty(n) {
    return "+" + String(Math.min(99, n));
  }

  function ensureBadge(anchor) {
    var existing = anchor.querySelector(".btn-cart__count");
    if (existing) return existing;
    var span = document.createElement("span");
    span.className = "btn-cart__count";
    span.setAttribute("aria-hidden", "true");
    anchor.appendChild(span);
    return span;
  }

  function syncCartLinks() {
    if (!window.ReadersCart) return;
    var n = ReadersCart.getProductCount();
    document.querySelectorAll("a.btn-cart").forEach(function (a) {
      a.setAttribute("href", CART_HREF);
      var badge = ensureBadge(a);
      if (n > 0) {
        badge.textContent = formatQty(n);
        badge.hidden = false;
        a.setAttribute("aria-label", "Cart, " + n + (n === 1 ? " product" : " products"));
      } else {
        badge.textContent = "";
        badge.hidden = true;
        a.setAttribute("aria-label", "Cart");
      }
    });
  }

  function parseCardPrice(card) {
    var priceEl = card.querySelector(".book-card__price");
    if (!priceEl) return "0";
    var text = priceEl.textContent.replace(/\s+/g, " ").trim();
    var m = text.match(/([\d.]+)\s*$/);
    return m ? m[1] : "0";
  }

  function onBookCardCtaClick(e) {
    var btn = e.target.closest(".book-card__cta");
    if (!btn || !window.ReadersCart) return;
    var label = (btn.textContent || "").trim().toLowerCase();
    if (label.indexOf("add to cart") === -1) return;
    var card = btn.closest(".book-card");
    if (!card) return;
    var link = card.querySelector('a.book-card__link[href*="product.html#"]');
    if (!link) return;
    var href = link.getAttribute("href") || "";
    var hash = href.split("#")[1];
    if (!hash) return;
    var titleEl = card.querySelector(".book-card__title");
    var authorEl = card.querySelector(".book-card__author");
    var imgEl = card.querySelector(".book-card__cover img");
    ReadersCart.add(
      {
        isbn: hash.trim(),
        title: titleEl ? titleEl.textContent.trim() : "",
        author: authorEl ? authorEl.textContent.trim() : "",
        price: parseCardPrice(card),
        format: "Paperback",
        img: imgEl ? imgEl.getAttribute("src") || "" : "",
      },
      1
    );
  }

  document.addEventListener("click", onBookCardCtaClick);

  window.addEventListener("readers-cart-updated", syncCartLinks);
  window.addEventListener("storage", function (e) {
    if (e.key === "readers_cart_v1") syncCartLinks();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncCartLinks);
  } else {
    syncCartLinks();
  }
})();
