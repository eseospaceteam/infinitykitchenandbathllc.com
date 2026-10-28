/*!
 * Infinity Kitchens and Baths — Cookie consent banner
 * STRICT opt-in (27 Oct 2026, owner's instruction, California CIPA exposure): the Google
 * tag (GA4 G-EK9HSW7F90 + Google Ads AW-17095449186) is NOT in the page <head> any more.
 * It is loaded by loadGoogleTag() below only after the visitor clicks Accept, or on later
 * visits once they have. Decline, or a browser sending Global Privacy Control, loads
 * nothing at all (Consent Mode "denied" still sent cookieless pings, so it was replaced).
 * Choice is stored in localStorage under "site_consent" ("granted" | "denied"); an older
 * "ikb_consent" choice is honoured and migrated.
 * Site code calls gtag only behind `typeof gtag !== 'undefined'`, so nothing breaks
 * while the tag is not loaded.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'site_consent';
  var OLD_KEY = 'ikb_consent';
  var GA_ID = 'G-EK9HSW7F90';
  var ADS_ID = 'AW-17095449186';

  function getChoice() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === 'granted' || v === 'denied') return v;
      v = localStorage.getItem(OLD_KEY);
      if (v === 'granted' || v === 'denied') { localStorage.setItem(STORAGE_KEY, v); return v; }
    } catch (e) {}
    return null;
  }
  function setChoice(v) {
    try { localStorage.setItem(STORAGE_KEY, v); localStorage.removeItem(OLD_KEY); } catch (e) {}
  }
  function clearChoice() {
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(OLD_KEY); } catch (e) {}
  }

  // Same tag, IDs and config the <head> used to carry; runs only after Accept.
  var tagLoaded = false;
  function loadGoogleTag() {
    if (tagLoaded) return;
    tagLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    window.gtag('config', ADS_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  // Remove Google Analytics / Ads cookies already set (someone who accepted earlier and
  // now declines). GA writes them on the registrable domain, so clear every level.
  function clearGoogleCookies() {
    var names = document.cookie.split(';').map(function (c) { return c.split('=')[0].trim(); })
      .filter(function (n) { return /^(_ga|_gid|_gat|_gcl_)/.test(n); });
    var parts = location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < parts.length - 1; i++) domains.push('; domain=.' + parts.slice(i).join('.'));
    names.forEach(function (n) {
      domains.forEach(function (d) {
        document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
      });
    });
  }

  function applyConsent(state) {
    // state: "granted" | "denied". Granted loads the tag; if it was already loaded this
    // visit (Accept, then Decline via Cookie Preferences), denied stops it storing.
    if (state === 'granted') { loadGoogleTag(); return; }
    if (tagLoaded && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    }
  }

  function injectStyles() {
    if (document.getElementById('ikb-cc-styles')) return;
    var css =
      '#ikb-cc{position:fixed;left:1rem;right:1rem;bottom:1rem;z-index:99999;max-width:760px;margin:0 auto;' +
      'background:#1B4332;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:12px;' +
      'box-shadow:0 12px 40px rgba(0,0,0,.35);padding:1.15rem 1.35rem;font-family:inherit;' +
      'display:flex;flex-wrap:wrap;align-items:center;gap:.9rem 1.25rem;animation:ikbccin .35s ease both;}' +
      '@keyframes ikbccin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
      '#ikb-cc p{margin:0;flex:1 1 320px;font-size:.88rem;line-height:1.55;color:rgba(255,255,255,.88);}' +
      '#ikb-cc a{color:#E9C46A;text-decoration:underline;}' +
      '#ikb-cc .ikb-cc-btns{display:flex;gap:.6rem;flex:0 0 auto;flex-wrap:wrap;}' +
      '#ikb-cc button{font-family:inherit;font-size:.82rem;font-weight:600;cursor:pointer;border-radius:8px;' +
      'padding:.6rem 1.15rem;border:1px solid transparent;transition:opacity .15s,background .15s;}' +
      // Accept and Decline carry the same size and weight (no nudging toward Accept).
      '#ikb-cc .ikb-cc-accept,#ikb-cc .ikb-cc-decline{background:#E9C46A;color:#1B4332;min-width:110px;}' +
      '#ikb-cc .ikb-cc-accept:hover,#ikb-cc .ikb-cc-decline:hover{opacity:.9;}' +
      '#ikb-cc button:focus-visible{outline:2px solid #fff;outline-offset:2px;}' +
      '@media(max-width:560px){#ikb-cc .ikb-cc-btns{width:100%;}#ikb-cc button{flex:1 1 auto;}}' +
      // Below 768px the sticky action bar from estimate-tab.js occupies the
      // bottom 58px. At bottom:1rem this notice sat on top of it, so Call Now
      // and Free Estimate could not be tapped while consent was pending.
      // Kept in step with estimate-tab.js, which now shows the mobile bar up to
      // 768px inclusive (it used to stop at 767px, one pixel short of the
      // stylesheet's own layout breakpoint). If this stayed at 767px the notice
      // would sit on top of the bar at exactly 768px.
      '@media(max-width:768px){#ikb-cc{bottom:calc(58px + 1rem);}}' +
      // The notice is position:fixed, so it takes no space in flow and simply
      // sat on top of whatever the page ended with — on a 360px screen that was
      // every footer link (Privacy Policy, Cookie Policy, Accessibility, Cookie
      // Preferences) plus the last service and blog cards. None of them could be
      // tapped until the notice was dismissed. Reserve the strip it covers at
      // the end of the document so that content can be scrolled clear of it.
      // --ikb-cc-reserve is measured from the live notice by reserveSpace().
      'body.ikb-cc-open footer{padding-bottom:calc(var(--ikb-cc-reserve,0px) + 1rem);}';
    var s = document.createElement('style');
    s.id = 'ikb-cc-styles';
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }

  // --- Space reserved at the end of the document for the fixed notice --------
  // The notice covers a strip at the bottom of the viewport. Publish that strip's
  // height so the footer can grow by it; without this the page simply ends
  // underneath the notice and its last links are untappable.
  var reserveObserver = null;

  function measureReserve() {
    var bar = document.getElementById('ikb-cc');
    if (!bar) return;
    var top = bar.getBoundingClientRect().top;
    // Top of the notice to the bottom of the viewport — everything the notice
    // and the gap below it sit over.
    var reserve = Math.max(0, Math.round(window.innerHeight - top));
    document.documentElement.style.setProperty('--ikb-cc-reserve', reserve + 'px');
  }

  function reserveSpace() {
    var bar = document.getElementById('ikb-cc');
    if (!bar) return;
    document.body.classList.add('ikb-cc-open');
    measureReserve();
    // The notice reflows (and changes height) on rotation and on any width
    // change, so the reserved strip has to be re-measured, not measured once.
    window.addEventListener('resize', measureReserve);
    window.addEventListener('orientationchange', measureReserve);
    if (typeof ResizeObserver === 'function') {
      reserveObserver = new ResizeObserver(measureReserve);
      reserveObserver.observe(bar);
    }
  }

  function releaseSpace() {
    document.body.classList.remove('ikb-cc-open');
    document.documentElement.style.removeProperty('--ikb-cc-reserve');
    window.removeEventListener('resize', measureReserve);
    window.removeEventListener('orientationchange', measureReserve);
    if (reserveObserver) { reserveObserver.disconnect(); reserveObserver = null; }
  }

  function removeBanner() {
    var el = document.getElementById('ikb-cc');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    releaseSpace();
  }

  function showBanner() {
    if (document.getElementById('ikb-cc')) return;
    injectStyles();
    var bar = document.createElement('div');
    bar.id = 'ikb-cc';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML =
      '<p>We use cookies from Google Analytics and Google Ads to measure visits and ads. ' +
      'Nothing loads unless you click Accept. ' +
      'See our <a href="/cookie-policy.html">Cookie Policy</a> and ' +
      '<a href="/privacy-policy.html">Privacy Policy</a>.</p>' +
      '<div class="ikb-cc-btns">' +
      '<button type="button" class="ikb-cc-decline">Decline</button>' +
      '<button type="button" class="ikb-cc-accept">Accept</button>' +
      '</div>';
    document.body.appendChild(bar);
    bar.querySelector('.ikb-cc-accept').addEventListener('click', function () {
      setChoice('granted'); applyConsent('granted'); removeBanner();
    });
    bar.querySelector('.ikb-cc-decline').addEventListener('click', function () {
      setChoice('denied'); applyConsent('denied'); clearGoogleCookies(); removeBanner();
    });
    reserveSpace();
  }

  // Let visitors reopen the banner to change their choice (wired to the footer "Cookie Preferences" link).
  window.ikbCookieSettings = function () {
    clearChoice();
    removeBanner();
    showBanner();
    var b = document.querySelector('#ikb-cc button');
    if (b) b.focus();
  };

  function init() {
    var choice = getChoice();
    if (choice === 'granted') { loadGoogleTag(); return; }
    if (choice === 'denied') return;
    // Global Privacy Control = the California opt-out signal: treat as Decline, no banner.
    if (navigator.globalPrivacyControl === true) return;
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
