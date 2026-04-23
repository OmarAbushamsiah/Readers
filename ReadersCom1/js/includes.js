/* ── Component injector ─────────────────────────────────────────────────
   Runs as the first deferred script. Injects the shared header and footer
   into their placeholder divs so every subsequent script finds them in DOM.
──────────────────────────────────────────────────────────────────────── */
(function () {
  /* Inject header */
  var hw = document.getElementById("site-header-wrap");
  if (hw && window.SITE_HEADER_HTML) {
    hw.outerHTML = window.SITE_HEADER_HTML;
  }

  /* Inject footer */
  var fw = document.getElementById("site-footer-wrap");
  if (fw && window.SITE_FOOTER_HTML) {
    fw.outerHTML = window.SITE_FOOTER_HTML;
  }

  /* Mark active nav link based on current page filename */
  var page = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".utility-nav a").forEach(function (a) {
    var href = (a.getAttribute("href") || "").split("#")[0].split("/").pop();
    if (href && href === page) {
      a.setAttribute("aria-current", "page");
    }
  });

  document.querySelectorAll(".primary-nav a").forEach(function (a) {
    var href = (a.getAttribute("href") || "").split("#")[0].split("/").pop();
    if (!href) return;
    if (href === page || (page === "" && href === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });
})();
