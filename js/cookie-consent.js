/*!
 * Infinity Kitchen & Bath — Cookie consent banner
 * Works with Google Consent Mode v2 (defaults set inline in <head>).
 * - US visitors: analytics granted by default (opt-out). Declining sets analytics_storage=denied.
 * - EU/EEA/UK/CH visitors: analytics denied by default (opt-in). Accepting sets analytics_storage=granted.
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
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
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
      '@media(max-width:560px){#ikb-cc .ikb-cc-btns{width:100%;}#ikb-cc button{flex:1 1 auto;}}';
    var s = document.createElement('style');
    s.id = 'ikb-cc-styles';
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }

  function removeBanner() {
    var el = document.getElementById('ikb-cc');
    if (el && el.parentNode) el.parentNode.removeChild(el);
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
