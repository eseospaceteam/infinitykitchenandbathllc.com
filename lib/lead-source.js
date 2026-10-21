/**
 * Lead source, server half (added 2026-10-20): where a lead came from, shown
 * in the lead email and stored with the lead.
 *
 * `raw` is what the browser posted (see lead-source-client): f = first touch,
 * l = latest touch from outside, n = pages viewed, p = the last few paths,
 * page = the page with the form. It is visitor-supplied, so every field is
 * whitelisted and length-capped by cleanLeadSource(). City/region come from
 * Vercel's geo headers. The IP address and the raw user-agent string are NOT
 * included. Nothing here can throw into a form route.
 *
 * Same scheme as hopecenterforbehaviorchange / quotemypolicy.com.
 *
 * IMPORTANT: the rows are added to the email AFTER the blocklist screen
 * (applyBlockedSenders) runs. A referrer URL or a campaign name like
 * "seo-backlinks" is our data, not the sender's words, and must never be what
 * re-routes a real lead to the review inbox.
 */
const TZ = "America/Phoenix";
const TZ_LABEL = "MST";
const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|brave|yandex|baidu)\./i;
const AI =
  /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|claude\.ai)$/i;
const SOCIAL =
  /(^|\.)(facebook|instagram|linkedin|nextdoor|yelp|youtube|tiktok|pinterest|reddit|x|twitter|t|threads)\.(com|co|net)$|(^|\.)(fb\.me|lnkd\.in)$/i;
const CLICK_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "fbclid",
];
const str = (v, max = 300) =>
  typeof v === "string" || typeof v === "number" ? String(v).trim().slice(0, max) : "";
const hostOf = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};
const dec = (v) => {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};
function toTouch(v) {
  if (!v || typeof v !== "object") return null;
  const o = v;
  const t = Number(o.t);
  if (!Number.isFinite(t) || t <= 0) return null;
  const q = {};
  if (o.q && typeof o.q === "object") {
    for (const k of CLICK_KEYS) {
      const s = str(o.q[k], 150);
      if (s) q[k] = s;
    }
  }
  return { t, lp: str(o.lp, 200), ref: str(o.ref, 200), q };
}
/**
 * Whitelists what the browser posted and adds the city/region from the
 * request's geo headers. Returns null when nothing usable was sent.
 */
export function cleanLeadSource(raw, req) {
  try {
    const src = raw && typeof raw === "object" ? raw : {};
    const out = {};
    const f = toTouch(src.f);
    const l = toTouch(src.l);
    if (f) out.f = f;
    if (l) out.l = l;
    const n = Number(src.n);
    if (Number.isFinite(n) && n > 0) out.n = Math.min(Math.round(n), 10000);
    if (Array.isArray(src.p)) {
      const p = src.p
        .slice(-6)
        .map((x) => str(x, 80))
        .filter(Boolean);
      if (p.length) out.p = p;
    }
    const page = str(src.page, 200);
    if (page) out.page = page;
    const form = str(src.form, 40);
    if (form) out.form = form;
    const gcl = str(src.gcl, 200);
    if (gcl) out.gcl = gcl;
    if (req) {
      const h = (k) => {
        try {
          return req.headers.get(k) || "";
        } catch {
          return "";
        }
      };
      const geo = [dec(h("x-vercel-ip-city")), h("x-vercel-ip-country-region"), h("x-vercel-ip-country")]
        .filter(Boolean)
        .join(", ")
        .slice(0, 120);
      if (geo) out.geo = geo;
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}
/** [short name, full wording] for one touch. */
export function channelOf(t, gcl = "") {
  const q = t.q || {};
  const h = hostOf(t.ref);
  const med = (q.utm_medium ?? "").toLowerCase();
  const src = q.utm_source ?? "";
  if (q.gclid || q.gbraid || q.wbraid) return ["Google Ads", "Google Ads (paid click)"];
  if (q.msclkid) return ["Microsoft Ads", "Microsoft Ads (paid click)"];
  if (q.fbclid) return ["Facebook / Instagram", "Facebook / Instagram"];
  if (/^(gbp|gmb|google_?business|googlemybusiness|google_?maps)$/i.test(src) || /^(gbp|gmb)$/i.test(med))
    return ["Google Business Profile", "Google Business Profile"];
  if (/^(cpc|ppc|paid|paidsearch|paid_search|paid_social)/.test(med))
    return ["Paid ad", `Paid ad${src ? `: ${src}` : ""}${med ? ` / ${med}` : ""}`];
  if (src) return [src, `Tagged link: ${src}${med ? ` / ${med}` : ""}`];
  if (gcl) return ["Google Ads", "Google Ads (paid click, from Google's ad cookie)"];
  if (AI.test(h)) return ["AI assistant", `AI assistant: ${h}`];
  if (SEARCH.test(h)) return ["Organic search", `Organic search: ${h}`];
  if (SOCIAL.test(h)) return ["Social", `Social: ${h}`];
  if (h) return ["Referral", `Referral: ${h}`];
  return ["Direct", "Direct (typed the address, a bookmark, or the source was hidden)"];
}
export function when(ms) {
  try {
    return (
      new Date(ms).toLocaleString("en-US", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" }) +
      (TZ_LABEL ? ` ${TZ_LABEL}` : "")
    );
  } catch {
    return "";
  }
}
/** The touch that gets the credit: the latest outside arrival, else the first. */
function creditTouch(s) {
  return s.l || s.f;
}
/** Short summary for an admin table: label + landing page. */
export function leadSourceSummary(s) {
  try {
    const t = s ? creditTouch(s) : undefined;
    if (!s || !t) return { label: "not recorded", landing: "" };
    return { label: channelOf(t, s.l ? "" : s.gcl || "")[1], landing: t.lp || "" };
  } catch {
    return { label: "not recorded", landing: "" };
  }
}
/** Label/value rows for the email; an empty label is a divider. */
export function leadSourceRows(s) {
  const rows = [];
  try {
    const add = (label, value) => {
      const v = str(value);
      if (v) rows.push([label, v]);
    };
    const touch = (label, t, cookieClick) => {
      add(label, channelOf(t, cookieClick)[1]);
      add("Campaign", t.q.utm_campaign);
      add("Keyword", t.q.utm_term);
      add("Ad content", t.q.utm_content);
      add("Referring page", t.ref);
      add("Landing page", t.lp);
    };
    const first = s?.f;
    const last = s?.l;
    if (s && last) {
      touch("Came from", last, "");
      add("Latest visit", when(last.t));
      if (first)
        add(
          "First visit",
          `${channelOf(first, s.gcl || "")[1]}, ${when(first.t)}${first.lp ? `, landed on ${first.lp}` : ""}`,
        );
    } else if (s && first) {
      touch("Came from", first, s.gcl || "");
      add("First visit", when(first.t));
    } else {
      add(
        "Came from",
        "Not recorded (storage blocked, an old page, or the form was posted without visiting a page)",
      );
    }
    if (s) {
      add("Pages viewed", s.n);
      add("Form page", s.page);
      if (s.p && s.p.length > 1) add("Path to the form", s.p.join("  →  "));
      add("Location (by IP)", s.geo);
    }
  } catch {
    /* never block a lead */
  }
  return rows;
}
export function leadSourceText(rows) {
  return [
    "",
    "--- Where this lead came from ---",
    ...rows.filter(([l]) => l).map(([l, v]) => `${l}: ${v}`),
  ].join("\n");
}
