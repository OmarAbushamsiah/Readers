/* Address Book page — Readers Bookshop */
(function () {
  var STORAGE_KEY = "readers_addresses";

  /* ── Amman, Jordan default center ─────────────────── */
  var DEFAULT_LAT = 31.9539;
  var DEFAULT_LNG = 35.9106;
  var DEFAULT_ZOOM = 13;

  var map, marker;
  var selectedLat = null;
  var selectedLng = null;
  var geocodeTimer = null;

  /* ── DOM refs ─────────────────────────────────────── */
  var alertEl      = document.getElementById("ab-alert");
  var alertMsg     = document.getElementById("ab-alert-msg");
  var mapSelected  = document.getElementById("ab-map-selected");
  var mapSelText   = document.getElementById("ab-map-selected-text");
  var mapSelCoords = document.getElementById("ab-map-selected-coords");
  var mapHint      = document.getElementById("ab-map-hint");
  var searchInput  = document.getElementById("ab-search-input");
  var searchBtn    = document.getElementById("ab-search-btn");
  var resultsEl    = document.getElementById("ab-map-results");
  var locateBtn    = document.getElementById("ab-locate-btn");
  var form         = document.getElementById("ab-form");
  var condUnit     = document.getElementById("ab-cond-unit");
  var unitLabel    = document.getElementById("ab-unit-label");
  var unitError    = document.getElementById("ab-unit-error");
  var savedGrid    = document.getElementById("ab-saved-grid");

  /* ── Storage ──────────────────────────────────────── */
  function loadAddresses() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveAddresses(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
    catch (e) {}
  }

  /* ── Alert ────────────────────────────────────────── */
  function showAlert(msg) {
    alertMsg.textContent = msg;
    alertEl.removeAttribute("hidden");
    alertEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideAlert() { alertEl.setAttribute("hidden", ""); }

  /* ── Map init ─────────────────────────────────────── */
  function initMap() {
    map = L.map("ab-map", {
      center: [DEFAULT_LAT, DEFAULT_LNG],
      zoom: DEFAULT_ZOOM,
      zoomControl: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    /* Custom red pin icon */
    var pinIcon = L.divIcon({
      className: "",
      html: '<div style="width:32px;height:40px;position:relative;">' +
              '<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M16 0C9.37 0 4 5.37 4 12c0 8.5 12 28 12 28s12-19.5 12-28C28 5.37 22.63 0 16 0z" fill="#c41e3a"/>' +
                '<circle cx="16" cy="12" r="5" fill="#fff"/>' +
              '</svg>' +
            '</div>',
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40]
    });

    /* Click to place marker */
    map.on("click", function (e) {
      placeMarker(e.latlng.lat, e.latlng.lng, pinIcon);
    });

    /* Place markers for saved addresses */
    var saved = loadAddresses();
    saved.forEach(function (addr) {
      if (addr.lat && addr.lng) {
        L.marker([addr.lat, addr.lng], { icon: pinIcon })
          .addTo(map)
          .bindPopup("<strong>" + escHtml(addr.label || addr.type) + "</strong><br>" + escHtml(addr.street));
      }
    });
  }

  function placeMarker(lat, lng, icon) {
    selectedLat = lat;
    selectedLng = lng;

    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      if (!icon) {
        icon = L.divIcon({
          className: "",
          html: '<div style="width:32px;height:40px;">' +
                  '<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">' +
                    '<path d="M16 0C9.37 0 4 5.37 4 12c0 8.5 12 28 12 28s12-19.5 12-28C28 5.37 22.63 0 16 0z" fill="#c41e3a"/>' +
                    '<circle cx="16" cy="12" r="5" fill="#fff"/>' +
                  '</svg>' +
                '</div>',
          iconSize: [32, 40],
          iconAnchor: [16, 40]
        });
      }
      marker = L.marker([lat, lng], { icon: icon, draggable: true }).addTo(map);
      marker.on("dragend", function (e) {
        var pos = e.target.getLatLng();
        placeMarker(pos.lat, pos.lng);
      });
    }

    mapHint.setAttribute("hidden", "");
    mapSelected.removeAttribute("hidden");
    mapSelCoords.textContent = lat.toFixed(5) + ", " + lng.toFixed(5);
    mapSelText.textContent = "Locating address…";

    /* Reverse geocode with Nominatim (debounced) */
    clearTimeout(geocodeTimer);
    geocodeTimer = setTimeout(function () {
      reverseGeocode(lat, lng);
    }, 600);
  }

  function reverseGeocode(lat, lng) {
    var url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
      lat + "&lon=" + lng + "&zoom=18&addressdetails=1";
    fetch(url, { headers: { "Accept-Language": "en" } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var display = data.display_name || (lat.toFixed(5) + ", " + lng.toFixed(5));
        mapSelText.textContent = display;
        /* Auto-fill street/area/city if fields are empty */
        var addr = data.address || {};
        var streetEl = document.getElementById("ab-street");
        var areaEl   = document.getElementById("ab-area");
        var cityEl   = document.getElementById("ab-city");
        if (streetEl && !streetEl.value) {
          streetEl.value = addr.road || addr.pedestrian || addr.path || "";
        }
        if (areaEl && !areaEl.value) {
          areaEl.value = addr.suburb || addr.neighbourhood || addr.quarter || addr.district || "";
        }
        if (cityEl && !cityEl.value) {
          var cityName = (addr.city || addr.town || addr.village || "").toLowerCase();
          /* Try to match select option */
          for (var i = 0; i < cityEl.options.length; i++) {
            if (cityEl.options[i].value === cityName ||
                cityEl.options[i].text.toLowerCase() === cityName) {
              cityEl.value = cityEl.options[i].value;
              break;
            }
          }
        }
      })
      .catch(function () {
        mapSelText.textContent = lat.toFixed(5) + ", " + lng.toFixed(5);
      });
  }

  /* ── Search ───────────────────────────────────────── */
  function doSearch() {
    var q = searchInput.value.trim();
    if (!q) return;
    searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    var url = "https://nominatim.openstreetmap.org/search?format=json&q=" +
      encodeURIComponent(q) + "&limit=5&addressdetails=1";
    fetch(url, { headers: { "Accept-Language": "en" } })
      .then(function (r) { return r.json(); })
      .then(function (results) {
        searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Search';
        showSearchResults(results);
      })
      .catch(function () {
        searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Search';
        resultsEl.setAttribute("hidden", "");
      });
  }

  function showSearchResults(results) {
    if (!results.length) {
      resultsEl.innerHTML = '<div style="padding:0.75rem 0.9rem;color:#aaa;font-family:\'DM Sans\',sans-serif;font-size:0.8rem;">No results found.</div>';
      resultsEl.removeAttribute("hidden");
      return;
    }
    resultsEl.innerHTML = results.map(function (r) {
      return '<button type="button" class="ab-map-result-item" data-lat="' + r.lat + '" data-lng="' + r.lon + '">' +
        '<i class="fa-solid fa-location-dot"></i>' +
        '<span>' + escHtml(r.display_name) + '</span>' +
        '</button>';
    }).join("");
    resultsEl.removeAttribute("hidden");

    resultsEl.querySelectorAll(".ab-map-result-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lat = parseFloat(btn.dataset.lat);
        var lng = parseFloat(btn.dataset.lng);
        map.setView([lat, lng], 16, { animate: true });
        placeMarker(lat, lng);
        resultsEl.setAttribute("hidden", "");
        searchInput.value = btn.querySelector("span").textContent;
      });
    });
  }

  searchBtn.addEventListener("click", doSearch);
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); doSearch(); }
  });

  document.addEventListener("click", function (e) {
    if (!resultsEl.contains(e.target) && e.target !== searchInput && e.target !== searchBtn) {
      resultsEl.setAttribute("hidden", "");
    }
  });

  /* ── Use my location ──────────────────────────────── */
  locateBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
      showAlert("Geolocation is not supported by your browser.");
      return;
    }
    locateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating…';
    locateBtn.disabled = true;
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        map.setView([lat, lng], 16, { animate: true });
        placeMarker(lat, lng);
        locateBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Use my location';
        locateBtn.disabled = false;
      },
      function () {
        locateBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Use my location';
        locateBtn.disabled = false;
        showAlert("Could not get your location. Please allow location access or pin manually on the map.");
      }
    );
  });

  /* ── Address type → conditional fields ───────────── */
  function onTypeChange() {
    var type = document.querySelector('input[name="ab-type"]:checked');
    if (!type) return;
    var val = type.value;
    if (val === "apartment" || val === "office") {
      condUnit.classList.add("is-visible");
      condUnit.setAttribute("aria-hidden", "false");
      /* Update label dynamically */
      if (val === "office") {
        unitLabel.innerHTML = 'Office number <span class="pf-required" aria-hidden="true">*</span>';
        unitError.textContent = "Office number is required.";
        document.getElementById("ab-unit").placeholder = "e.g. 201";
      } else {
        unitLabel.innerHTML = 'Apartment number <span class="pf-required" aria-hidden="true">*</span>';
        unitError.textContent = "Apartment number is required.";
        document.getElementById("ab-unit").placeholder = "e.g. 4B";
      }
    } else {
      condUnit.classList.remove("is-visible");
      condUnit.setAttribute("aria-hidden", "true");
    }
  }

  document.querySelectorAll('input[name="ab-type"]').forEach(function (r) {
    r.addEventListener("change", onTypeChange);
  });

  /* ── Validation ───────────────────────────────────── */
  function fieldErr(id, show) {
    var el = document.getElementById(id);
    if (!el) return;
    if (show) el.classList.add("has-error");
    else el.classList.remove("has-error");
  }

  function clearErrors() {
    ["ab-f-bldnum", "ab-f-street", "ab-f-area", "ab-f-floor", "ab-f-unit"].forEach(function (id) {
      fieldErr(id, false);
    });
  }

  function validate() {
    clearErrors();
    var ok = true;

    if (!document.getElementById("ab-bldnum").value.trim()) { fieldErr("ab-f-bldnum", true); ok = false; }
    if (!document.getElementById("ab-street").value.trim()) { fieldErr("ab-f-street", true); ok = false; }
    if (!document.getElementById("ab-area").value.trim())   { fieldErr("ab-f-area", true); ok = false; }

    var type = document.querySelector('input[name="ab-type"]:checked');
    if (type && (type.value === "apartment" || type.value === "office")) {
      if (!document.getElementById("ab-floor").value.trim()) { fieldErr("ab-f-floor", true); ok = false; }
      if (!document.getElementById("ab-unit").value.trim())  { fieldErr("ab-f-unit", true); ok = false; }
    }

    return ok;
  }

  /* ── Form submit ──────────────────────────────────── */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    hideAlert();
    if (!validate()) {
      showAlert("Please fill in all required fields.");
      return;
    }

    var type    = document.querySelector('input[name="ab-type"]:checked').value;
    var bldnum  = document.getElementById("ab-bldnum").value.trim();
    var bldname = document.getElementById("ab-bldname").value.trim();
    var street  = document.getElementById("ab-street").value.trim();
    var area    = document.getElementById("ab-area").value.trim();
    var city    = document.getElementById("ab-city");
    var cityVal = city.options[city.selectedIndex].text;
    var label   = document.getElementById("ab-label").value.trim();
    var dirs    = document.getElementById("ab-directions").value.trim();
    var floor   = document.getElementById("ab-floor").value.trim();
    var unit    = document.getElementById("ab-unit").value.trim();

    var typeLabels = { house: "House / Villa", apartment: "Apartment", office: "Office" };

    var addrLine = "Bldg " + bldnum;
    if (bldname) addrLine += " (" + bldname + ")";
    addrLine += ", " + street;
    if (type === "apartment" || type === "office") {
      addrLine += ", Floor " + floor;
      addrLine += type === "apartment" ? ", Apt " + unit : ", Office " + unit;
    }
    addrLine += ", " + area + ", " + cityVal;

    var newAddr = {
      id:         Date.now(),
      type:       type,
      typeLabel:  typeLabels[type],
      bldnum:     bldnum,
      bldname:    bldname,
      street:     street,
      area:       area,
      city:       cityVal,
      floor:      floor,
      unit:       unit,
      label:      label,
      directions: dirs,
      addrLine:   addrLine,
      lat:        selectedLat,
      lng:        selectedLng,
      mapText:    mapSelText.textContent !== "Locating address…" ? mapSelText.textContent : null
    };

    var addresses = loadAddresses();
    addresses.push(newAddr);
    saveAddresses(addresses);

    renderSaved();
    form.reset();
    clearErrors();
    condUnit.classList.remove("is-visible");
    condUnit.setAttribute("aria-hidden", "true");
    selectedLat = null;
    selectedLng = null;
    if (marker) { map.removeLayer(marker); marker = null; }
    mapSelected.setAttribute("hidden", "");
    mapHint.removeAttribute("hidden");

    /* Scroll to saved section */
    document.getElementById("ab-saved-section").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ── Helpers ──────────────────────────────────────── */
  function escHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var TYPE_ICONS = { house: "fa-house", apartment: "fa-building", office: "fa-briefcase" };
  var TYPE_BADGE = { house: "ab-addr-card__type-badge--house", apartment: "ab-addr-card__type-badge--apartment", office: "ab-addr-card__type-badge--office" };

  /* ── Render saved addresses ───────────────────────── */
  function renderSaved() {
    var addresses = loadAddresses();
    if (!addresses.length) {
      savedGrid.innerHTML =
        '<div class="ab-saved-empty">' +
          '<i class="fa-regular fa-map" aria-hidden="true"></i>' +
          '<p>No saved addresses yet. Add your first one above.</p>' +
        '</div>';
      return;
    }

    savedGrid.innerHTML = addresses.map(function (addr, idx) {
      var icon  = TYPE_ICONS[addr.type] || "fa-location-dot";
      var badge = TYPE_BADGE[addr.type] || "";
      var isFirst = idx === 0;

      return (
        '<div class="ab-addr-card" data-addr-id="' + addr.id + '">' +
          '<div class="ab-addr-card__top">' +
            '<span class="ab-addr-card__type-badge ' + badge + '">' +
              '<i class="fa-solid ' + icon + '" aria-hidden="true"></i> ' + escHtml(addr.typeLabel) +
            '</span>' +
            (isFirst
              ? '<span class="ab-addr-card__default-badge"><i class="fa-solid fa-check" aria-hidden="true"></i> Default</span>'
              : '<button type="button" class="ab-addr-card__delete" aria-label="Delete address" data-id="' + addr.id + '">' +
                  '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' +
                '</button>'
            ) +
          '</div>' +
          '<div class="ab-addr-card__label">' + escHtml(addr.label || addr.addrLine.split(",")[0]) + '</div>' +
          '<div class="ab-addr-card__body">' +
            '<strong>' + escHtml(addr.addrLine) + '</strong>' +
            (addr.directions ? '<br><span style="color:#aaa;">' + escHtml(addr.directions) + '</span>' : "") +
          '</div>' +
          (addr.lat && addr.lng
            ? '<div class="ab-addr-card__map-tag">' +
                '<i class="fa-solid fa-location-dot" aria-hidden="true"></i>' +
                escHtml((addr.lat).toFixed(4)) + ', ' + escHtml((addr.lng).toFixed(4)) +
              '</div>'
            : "") +
          '<div class="ab-addr-card__actions">' +
            '<button type="button" class="ab-addr-card__action-btn ab-addr-card__action-btn--primary" data-edit="' + addr.id + '">' +
              '<i class="fa-solid fa-pen" aria-hidden="true"></i> Edit' +
            '</button>' +
            (addr.lat && addr.lng
              ? '<button type="button" class="ab-addr-card__action-btn" data-view="' + addr.id + '">' +
                  '<i class="fa-solid fa-map-location-dot" aria-hidden="true"></i> View on map' +
                '</button>'
              : "") +
          '</div>' +
        '</div>'
      );
    }).join("");

    /* Delete */
    savedGrid.querySelectorAll("[data-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = parseInt(btn.dataset.id, 10);
        var addresses = loadAddresses().filter(function (a) { return a.id !== id; });
        saveAddresses(addresses);
        renderSaved();
      });
    });

    /* View on map */
    savedGrid.querySelectorAll("[data-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = parseInt(btn.dataset.view, 10);
        var addr = loadAddresses().find(function (a) { return a.id === id; });
        if (addr && addr.lat && addr.lng) {
          map.setView([addr.lat, addr.lng], 17, { animate: true });
          document.getElementById("ab-map").scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });
  }

  /* ── Init ─────────────────────────────────────────── */
  initMap();
  renderSaved();

})();
