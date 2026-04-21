/**
 * Wish list page — renders persisted wishlist from localStorage.
 */
(function () {
  var mount = document.getElementById("wishlist-page-mount");
  if (!mount) return;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    var items = window.ReadersWishlist ? window.ReadersWishlist.get() : [];

    if (!items.length) {
      mount.innerHTML =
        '<div class="wishlist-empty">' +
          '<i class="fa-regular fa-heart wishlist-empty__icon" aria-hidden="true"></i>' +
          '<h2 class="wishlist-empty__title">Your wish list is empty</h2>' +
          '<p class="wishlist-empty__hint">Tap the heart icon on any book to save it here.</p>' +
          '<a class="wishlist-empty__cta" href="index.html">Browse books</a>' +
        '</div>';
      return;
    }

    var cards = items.map(function (item) {
      var href = item.href || ("product.html#" + item.isbn);
      return (
        '<div class="wishlist-card-wrap">' +
          '<article class="book-card" data-isbn="' + escapeHtml(item.isbn) + '">' +
            '<a href="' + escapeHtml(href) + '" class="book-card__link">' +
              '<span class="visually-hidden">View ' + escapeHtml(item.title) + '</span>' +
            '</a>' +
            '<div class="book-card__cover">' +
              '<img src="' + escapeHtml(item.img) + '" alt="Cover: ' + escapeHtml(item.title) + '" width="600" height="770" loading="lazy" decoding="async" />' +
              '<div class="book-card__overlay">' +
                '<div class="book-card__actions">' +
                  '<button type="button" class="book-card__cta">Add to cart</button>' +
                  '<button type="button" class="book-card__wish" aria-label="Remove from wish list" aria-pressed="true">' +
                    '<i class="fa-solid fa-heart" aria-hidden="true"></i>' +
                  '</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="book-card__body">' +
              '<h3 class="book-card__title">' + escapeHtml(item.title) + '</h3>' +
              '<p class="book-card__author">' + escapeHtml(item.author) + '</p>' +
              '<p class="book-card__price"><span class="book-card__currency">JOD</span> ' + escapeHtml(item.price) + '</p>' +
            '</div>' +
          '</article>' +
          '<button type="button" class="wishlist-card__remove" data-remove-isbn="' + escapeHtml(item.isbn) + '">' +
            '<i class="fa-solid fa-trash-can" aria-hidden="true"></i> Remove' +
          '</button>' +
        '</div>'
      );
    }).join("");

    mount.innerHTML =
      '<div class="wishlist-header">' +
        '<h1 class="wishlist-title">My Wish List</h1>' +
        '<p class="wishlist-count">' + items.length + (items.length === 1 ? " book" : " books") + '</p>' +
      '</div>' +
      '<div class="wishlist-grid">' + cards + '</div>';

    /* Bind remove buttons */
    mount.querySelectorAll("[data-remove-isbn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isbn = btn.getAttribute("data-remove-isbn");
        if (window.ReadersWishlist) {
          window.ReadersWishlist.remove(isbn);
          window.dispatchEvent(new CustomEvent("readers-wishlist-updated"));
        }
      });
    });
  }

  /* Re-render on wishlist changes (same tab or other tabs) */
  window.addEventListener("readers-wishlist-updated", render);
  window.addEventListener("storage", function (e) {
    if (e.key === "readers_wishlist_v1") render();
  });

  render();
})();
