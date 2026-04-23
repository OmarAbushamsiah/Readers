/**
 * Client-side cart (localStorage). Static prototype — no backend.
 */
(function () {
  var STORAGE_KEY = "readers_cart_v1";

  function readLines() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeLines(lines) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch (e) {
      /* ignore quota / private mode */
    }
    try {
      window.dispatchEvent(new CustomEvent("readers-cart-updated"));
    } catch (e2) {
      /* ignore */
    }
  }

  function normalizeMeta(item) {
    return {
      isbn: String(item.isbn || "").trim(),
      title: String(item.title || "").trim(),
      author: String(item.author || "").trim(),
      price: String(item.price != null ? item.price : "0").trim(),
      format: String(item.format || "Paperback").trim(),
      img: String(item.img || "").trim(),
      dispatch: String(item.dispatch || "Usually dispatched within 1–2 days").trim(),
    };
  }

  window.ReadersCart = {
    getLines: function () {
      return readLines().map(function (l) {
        return Object.assign({}, l);
      });
    },

    getTotalQty: function () {
      return readLines().reduce(function (sum, l) {
        return sum + (parseInt(l.qty, 10) || 0);
      }, 0);
    },

    /** Number of distinct products (line items), ignoring per-line quantity. */
    getProductCount: function () {
      return readLines().length;
    },

    /** Subtotal as number (JOD). */
    getSubtotal: function () {
      return readLines().reduce(function (sum, l) {
        var unit = parseFloat(l.price, 10);
        if (isNaN(unit)) unit = 0;
        var q = parseInt(l.qty, 10) || 0;
        return sum + unit * q;
      }, 0);
    },

    add: function (item, qty) {
      var meta = normalizeMeta(item);
      if (!meta.isbn) return;
      qty = Math.max(1, parseInt(qty, 10) || 1);
      var lines = readLines();
      var idx = -1;
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].isbn === meta.isbn) {
          idx = i;
          break;
        }
      }
      if (idx >= 0) {
        lines[idx] = Object.assign({}, meta, {
          qty: (parseInt(lines[idx].qty, 10) || 0) + qty,
        });
      } else {
        lines.push(Object.assign({}, meta, { qty: qty }));
      }
      writeLines(lines);
    },

    setQty: function (isbn, qty) {
      isbn = String(isbn || "").trim();
      if (!isbn) return;
      qty = parseInt(qty, 10);
      var lines = readLines();
      var idx = -1;
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].isbn === isbn) {
          idx = i;
          break;
        }
      }
      if (idx < 0) return;
      if (!qty || qty < 1) {
        lines.splice(idx, 1);
      } else {
        lines[idx].qty = qty;
      }
      writeLines(lines);
    },

    remove: function (isbn) {
      isbn = String(isbn || "").trim();
      if (!isbn) return;
      writeLines(readLines().filter(function (l) {
        return l.isbn !== isbn;
      }));
    },

    /** Insert a line at index (e.g. undo restore). Drops any existing line with the same ISBN first. */
    insertLineAt: function (index, item, qty) {
      var meta = normalizeMeta(item);
      if (!meta.isbn) return;
      var q = qty != null ? qty : item.qty;
      q = Math.max(1, parseInt(q, 10) || 1);
      var lines = readLines().filter(function (l) {
        return l.isbn !== meta.isbn;
      });
      if (index < 0) index = 0;
      if (index > lines.length) index = lines.length;
      lines.splice(index, 0, Object.assign({}, meta, { qty: q }));
      writeLines(lines);
    },
  };
})();
