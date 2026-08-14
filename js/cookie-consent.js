/*!
 * Infinity Kitchens and Baths — Cookie consent banner
 * Works with Google Consent Mode v2 (defaults set inline in <head>).
 * - US visitors: analytics + ads granted by default (opt-out). Declining denies both.
 * - EU/EEA/UK/CH visitors: everything denied by default (opt-in). Accepting grants both.
 * Choice is stored in localStorage under "ikb_consent" ("granted" | "denied").
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ikb_consent';
  var gtag = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); };

  function getChoice() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setChoice(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }

  function applyConsent(state) {
    // state: "granted" | "denied"
    gtag('consent', 'update', {
      analytics_storage: state,
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state
    });
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
      '#ikb-cc .ikb-cc-accept{background:#E9C46A;color:#1B4332;}' +
      '#ikb-cc .ikb-cc-accept:hover{opacity:.9;}' +
      '#ikb-cc .ikb-cc-decline{background:transparent;color:#fff;border-color:rgba(255,255,255,.4);}' +
      '#ikb-cc .ikb-cc-decline:hover{background:rgba(255,255,255,.1);}' +
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
      '<p>We use cookies to analyze site traffic and improve your experience. ' +
      'See our <a href="cookie-policy.html">Cookie Policy</a> and ' +
      '<a href="privacy-policy.html">Privacy Policy</a>.</p>' +
      '<div class="ikb-cc-btns">' +
      '<button type="button" class="ikb-cc-decline">Decline</button>' +
      '<button type="button" class="ikb-cc-accept">Accept</button>' +
      '</div>';
    document.body.appendChild(bar);
    bar.querySelector('.ikb-cc-accept').addEventListener('click', function () {
      setChoice('granted'); applyConsent('granted'); removeBanner();
    });
    bar.querySelector('.ikb-cc-decline').addEventListener('click', function () {
      setChoice('denied'); applyConsent('denied'); removeBanner();
    });
    reserveSpace();
  }

  // Let visitors reopen the banner to change their choice (wired to the footer "Cookie Preferences" link).
  window.ikbCookieSettings = function () {
    removeBanner();
    showBanner();
  };

  function init() {
    var choice = getChoice();
    if (choice === 'granted' || choice === 'denied') {
      // Re-affirm prior choice (the inline <head> snippet already applied it before GA config).
      applyConsent(choice);
      return;
    }
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
