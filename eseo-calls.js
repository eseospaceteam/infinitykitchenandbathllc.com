/* eSEOspace phone-tap counter: one anonymous beacon per tap on a tel: link.
   No cookies, no personal data. sessionStorage holds where this visit came from. */
(function () {
  try {
    var E = 'https://eseospace-leads.vercel.app/api/t';
    var K = 'eseo_visit_src';
    function channel() {
      var q = new URLSearchParams(location.search), r = '', h = '';
      try { r = document.referrer; h = r ? new URL(r).hostname.replace(/^www\./, '') : ''; } catch (_) {}
      if (q.get('gclid') || q.get('gbraid') || q.get('wbraid')) return 'Google Ads (paid click)';
      if (q.get('msclkid')) return 'Microsoft Ads';
      if (q.get('fbclid')) return 'Facebook / Instagram';
      var us = (q.get('utm_source') || '').toLowerCase();
      if (/^(gbp|gmb|google_business|googlemybusiness)/.test(us)) return 'Google Business Profile';
      if (us) return (us + ' / ' + (q.get('utm_medium') || '')).replace(/ \/ $/, '');
      if (!h || h === location.hostname.replace(/^www\./, '')) return '';
      if (/chatgpt|openai|perplexity|gemini\.google|copilot|claude\.ai/.test(h)) return 'AI assistant';
      if (/(^|\.)(google|bing|yahoo|duckduckgo|ecosia|baidu|yandex)\./.test(h)) return 'Organic search';
      if (/facebook|instagram|linkedin|twitter|x\.com|t\.co|tiktok|youtube|pinterest|reddit|nextdoor|yelp/.test(h)) return 'Social: ' + h;
      return 'Referral: ' + h;
    }
    var c = channel();
    try {
      if (c) sessionStorage.setItem(K, c);
      else c = sessionStorage.getItem(K) || '';
      if (!sessionStorage.getItem(K)) sessionStorage.setItem(K, c = c || 'Direct');
    } catch (_) { c = c || 'Direct'; }
    var q0 = new URLSearchParams(location.search);
    var cp = q0.get('utm_campaign') || '';
    document.addEventListener('click', function (e) {
      try {
        var a = e.target && e.target.closest && e.target.closest('a[href^="tel:"]');
        if (!a) return;
        var b = JSON.stringify({ k: 'call', s: location.hostname, p: location.pathname,
          n: a.getAttribute('href').slice(4).replace(/[^\d+]/g, ''), c: c || 'Direct', cp: cp });
        if (navigator.sendBeacon) navigator.sendBeacon(E, b);
        else fetch(E, { method: 'POST', body: b, keepalive: true, mode: 'no-cors' });
      } catch (_) {}
    }, true);
  } catch (_) {}
})();
