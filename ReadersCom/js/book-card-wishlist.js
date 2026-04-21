/**
 * Wish-list hearts — persists to localStorage and syncs across pages.
 */
(function () {
  var STORAGE_KEY = "readers_wishlist_v1";

  /* ── Storage helpers ─────────────────────────────── */
  function getList() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveList(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function isWishlisted(isbn) {
    return getList().some(function (i) { return i.isbn === isbn; });
  }

  function addItem(item) {
    var list = getList();
    if (!list.some(function (i) { return i.isbn === item.isbn; })) {
      list.push(item);
      saveList(list);
    }
  }

  function removeItem(isbn) {
    saveList(getList().filter(function (i) { return i.isbn !== isbn; }));
  }

  /* ── Extract book data from card DOM ─────────────── */
  function extractCardData(card) {
    var link = card.querySelector("a.book-card__link");
    var href = link ? link.getAttribute("href") : "#";
    var isbn = href.indexOf("#") !== -1 ? href.split("#")[1].trim() : "";
    var titleEl  = card.querySelector(".book-card__title");
    var authorEl = card.querySelector(".book-card__author");
    var priceEl  = card.querySelector(".book-card__price");
    var imgEl    = card.querySelector(".book-card__cover img");
    var price    = priceEl ? priceEl.textContent.replace(/[^0-9.]/g, "") : "0";
    return { isbn: isbn, title: titleEl ? titleEl.textContent.trim() : "",
      author: authorEl ? authorEl.textContent.trim() : "", price: price,
      img: imgEl ? imgEl.getAttribute("src") : "", href: href };
  }

  /* ── Apply button visual state ───────────────────── */
  function applyState(btn, pressed) {
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
    btn.setAttribute("aria-label", pressed ? "Remove from wish list" : "Add to wish list");
    var icon = btn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-regular", !pressed);
      icon.classList.toggle("fa-solid", pressed);
    }
  }

  /* ── Restore hearts for all cards already on the page ── */
  function restoreAll() {
    document.querySelectorAll(".book-card__wish").forEach(function (btn) {
      var card = btn.closest(".book-card");
      if (!card) return;
      var data = extractCardData(card);
      if (data.isbn) applyState(btn, isWishlisted(data.isbn));
    });
  }

  /* ── Click handler ───────────────────────────────── */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".book-card__wish");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    var next = btn.getAttribute("aria-pressed") !== "true";
    applyState(btn, next);

    var card = btn.closest(".book-card");
    if (!card) return;
    var data = extractCardData(card);
    if (!data.isbn) return;

    if (next) { addItem(data); } else { removeItem(data.isbn); }

    window.dispatchEvent(new CustomEvent("readers-wishlist-updated"));
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", restoreAll);
  } else {
    restoreAll();
  }

  /* ── Public API ──────────────────────────────────── */
  window.ReadersWishlist = {
    get: getList,
    add: addItem,
    remove: removeItem,
    isWishlisted: isWishlisted,
  };
})();
