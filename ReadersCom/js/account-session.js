(function () {
  var STORAGE_KEY = "readers_session";

  function getSession() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || typeof data.name !== "string" || !data.name.trim()) return null;
      return { name: data.name.trim() };
    } catch (e) {
      return null;
    }
  }

  function setSession(name) {
    var n = String(name || "").trim() || "Reader";
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: n }));
    } catch (e) {}
  }

  function clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function guestMenuHtml() {
    return (
      '<li role="none"><a role="menuitem" href="login.html" class="account-menu__link">Login</a></li>' +
      '<li role="none"><a role="menuitem" href="register.html" class="account-menu__link">Register</a></li>'
    );
  }

  function userMenuHtml() {
    return (
      '<li role="none"><a role="menuitem" href="AccountDashboard.html" class="account-menu__link">My Account</a></li>' +
      '<li role="none"><a role="menuitem" href="orders.html" class="account-menu__link">Orders</a></li>' +
      '<li role="none"><a role="menuitem" href="wishlist.html" class="account-menu__link">Wish List</a></li>' +
      '<li role="none"><a role="menuitem" href="#" class="account-menu__link" data-readers-sign-out>Sign Out</a></li>'
    );
  }

  function refreshAccountMenus() {
    var session = getSession();
    var labelText = session ? session.name : "Account";

    document.querySelectorAll(".account-menu").forEach(function (root) {
      var label = root.querySelector(".btn-account__label");
      var menu = root.querySelector(".account-menu__dropdown");
      var toggle = root.querySelector(".account-menu__toggle");
      if (!menu || !toggle) return;

      if (label) label.textContent = labelText;
      toggle.setAttribute("aria-label", session ? "Account menu for " + session.name : "Account menu");

      menu.innerHTML = session ? userMenuHtml() : guestMenuHtml();
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");

      menu.querySelectorAll("[data-readers-sign-out]").forEach(function (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          clearSession();
          refreshAccountMenus();
          if (window.location.pathname.indexOf("AccountDashboard") !== -1) {
            window.location.href = "index.html";
          }
        });
      });
    });
  }

  function init() {
    if (document.body.classList.contains("account-dashboard-page")) {
      var dashSession = getSession();
      if (!dashSession) {
        window.location.replace("login.html");
        return;
      }
      var h2 = document.getElementById("account-dashboard-greeting");
      if (h2) {
        h2.textContent = "Hi " + dashSession.name + ", welcome to your account dashboard";
      }
      refreshAccountMenus();
      return;
    }
    function runMenus() {
      refreshAccountMenus();
    }
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(runMenus, { timeout: 40 });
    } else {
      setTimeout(runMenus, 0);
    }
  }

  window.readersSession = {
    get: getSession,
    set: setSession,
    clear: clearSession,
    refreshAccountMenus: refreshAccountMenus,
  };

  init();
})();
