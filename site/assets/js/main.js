/* Optimolds — small progressive enhancements. The site works without JS. */
(function () {
  "use strict";

  // ---- Settings you may want to change -------------------------------------
  // Google Analytics 4 measurement ID, e.g. "G-ABC123XYZ". Leave empty to disable.
  // Analytics only loads after the visitor accepts cookies.
  var GA_MEASUREMENT_ID = "";
  // Largest upload accepted by your form provider (Netlify Forms: 8 MB per submission).
  var MAX_UPLOAD_MB = 8;
  // true only when the site is hosted on Netlify, where Netlify Forms accept plain form posts.
  // On any other host (this site runs on Cloudflare Pages), set each form's data-endpoint instead.
  var NETLIFY_FORMS = false;
  // ---------------------------------------------------------------------------

  var CONSENT_KEY = "optimolds-cookie-consent";

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { /* storage blocked: fall back to asking each visit */ }
    return null;
  }

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        toggle.focus();
      }
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Cookie consent + analytics
  function loadAnalytics() {
    if (!GA_MEASUREMENT_ID || window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  var banner = document.querySelector(".cookie-banner");
  function showBanner() { if (banner) banner.hidden = false; }
  function hideBanner() { if (banner) banner.hidden = true; }
  function setConsent(value) {
    store(CONSENT_KEY, value);
    hideBanner();
    if (value === "accepted") loadAnalytics();
  }

  var consent = store(CONSENT_KEY);
  if (consent === "accepted") loadAnalytics();
  else if (consent !== "rejected") showBanner();

  document.querySelectorAll("[data-cookie-accept]").forEach(function (b) {
    b.addEventListener("click", function () { setConsent("accepted"); });
  });
  document.querySelectorAll("[data-cookie-reject]").forEach(function (b) {
    b.addEventListener("click", function () { setConsent("rejected"); });
  });
  document.querySelectorAll("[data-cookie-settings]").forEach(function (b) {
    b.addEventListener("click", showBanner);
  });

  // Project filters
  var filterBtns = document.querySelectorAll("[data-filter]");
  var projectItems = document.querySelectorAll("[data-services]");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      projectItems.forEach(function (item) {
        var services = item.getAttribute("data-services").split(" ");
        item.hidden = !(f === "all" || services.indexOf(f) !== -1);
      });
    });
  });

  // Forms: file size check, and optional submission to an external endpoint
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    function showError(msg) {
      if (!status) { window.alert(msg); return; }
      status.textContent = msg;
      status.classList.add("is-error");
      status.focus();
    }

    form.addEventListener("submit", function (e) {
      if (status) { status.textContent = ""; status.classList.remove("is-error"); }

      var total = 0;
      form.querySelectorAll('input[type="file"]').forEach(function (input) {
        Array.prototype.forEach.call(input.files || [], function (f) { total += f.size; });
      });
      if (total > MAX_UPLOAD_MB * 1024 * 1024) {
        e.preventDefault();
        showError("Your files are larger than " + MAX_UPLOAD_MB + " MB. Please paste a Google Drive or WeTransfer link instead.");
        return;
      }

      // If data-endpoint is set (e.g. a Formspree URL), post there with fetch and
      // redirect to the thank-you page. Without an endpoint, only Netlify can
      // receive the post; anywhere else, tell the visitor instead of losing it.
      var endpoint = form.getAttribute("data-endpoint");
      if (!endpoint) {
        if (NETLIFY_FORMS) return;
        e.preventDefault();
        showError("Sorry, our online form isn't connected yet. Please message us on LinkedIn or Fiverr (links at the bottom of the page) and we'll get back to you quickly.");
        return;
      }
      if (!window.fetch) { form.action = endpoint; return; }
      e.preventDefault();
      var submit = form.querySelector('[type="submit"]');
      if (submit) { submit.disabled = true; submit.dataset.label = submit.textContent; submit.textContent = "Sending…"; }
      fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          window.location.href = form.getAttribute("action") || "thank-you.html";
        })
        .catch(function () {
          showError("Sorry, something went wrong sending your request. Please try again, or email us directly.");
          if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label; }
        });
    });
  });
})();
