/**
 * Grant Google Ads consent signals for US traffic (opt-out), keeping EU/EEA/UK/CH
 * denied until opt-in. Needed for AW-17095449186 to record real (not just modeled)
 * conversions now that the account runs Search ads.
 *
 * Touches, in order:
 *   1. sitewide head block — US `consent default` line: ad_* denied -> granted
 *   2. sitewide head block — stored-choice re-apply: carry ad_* alongside analytics
 *   3. js/cookie-consent.js — stop hardcoding ad_* to denied on every update
 *   4. cookie-policy.html / privacy-policy.html — correct the now-inaccurate
 *      "we do not use advertising cookies" claims
 *
 * The EU/EEA/UK/CH `region` default line is left untouched. Idempotent.
 * Run: node enable-ads-consent.mjs
 */
import { readFileSync, writeFileSync, globSync } from "node:fs";

const US_OLD = "gtag('consent', 'default', {'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'granted'});";
const US_NEW = "gtag('consent', 'default', {'ad_storage':'granted','ad_user_data':'granted','ad_personalization':'granted','analytics_storage':'granted'});";

const REAPPLY_OLD = "gtag('consent','update',{'analytics_storage':_ikbc});";
const REAPPLY_NEW = "gtag('consent','update',{'analytics_storage':_ikbc,'ad_storage':_ikbc,'ad_user_data':_ikbc,'ad_personalization':_ikbc});";

const files = globSync("**/*.html", { cwd: process.cwd() });
let us = 0, re = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  let out = src;
  // Only the US line matches: the EU line ends with 'analytics_storage':'denied','region':[...]
  if (out.includes(US_OLD)) { out = out.split(US_OLD).join(US_NEW); us++; }
  if (out.includes(REAPPLY_OLD)) { out = out.split(REAPPLY_OLD).join(REAPPLY_NEW); re++; }
  if (out !== src) writeFileSync(f, out);
}
console.log(`consent defaults updated on ${us} page(s); re-apply line updated on ${re} page(s)`);

// --- 3. banner must toggle ad_* too, not pin it to denied ---
const CC = "js/cookie-consent.js";
let cc = readFileSync(CC, "utf8");
const CC_OLD = `    gtag('consent', 'update', {
      analytics_storage: state,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });`;
const CC_NEW = `    gtag('consent', 'update', {
      analytics_storage: state,
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state
    });`;
if (cc.includes(CC_OLD)) {
  cc = cc.replace(CC_OLD, CC_NEW);
  cc = cc.replace(
    " * - US visitors: analytics granted by default (opt-out). Declining sets analytics_storage=denied.",
    " * - US visitors: analytics + ads granted by default (opt-out). Declining denies both."
  );
  cc = cc.replace(
    " * - EU/EEA/UK/CH visitors: analytics denied by default (opt-in). Accepting sets analytics_storage=granted.",
    " * - EU/EEA/UK/CH visitors: everything denied by default (opt-in). Accepting grants both."
  );
  writeFileSync(CC, cc);
  console.log("js/cookie-consent.js: banner now toggles ad_* with analytics");
} else {
  console.log("js/cookie-consent.js: already updated (or shape changed) — check manually");
}

// --- 4. policy text corrections ---
const POLICY_EDITS = [
  ["cookie-policy.html",
   "We keep our use of cookies deliberately minimal. We use them only to remember your consent preference and to understand, in aggregate, how visitors find and use our Site so we can improve it. <strong>We do not use advertising, remarketing, or social media tracking cookies, and we do not sell your personal information.</strong>",
   "We keep our use of cookies deliberately minimal. We use them to remember your consent preference, to understand in aggregate how visitors find and use our Site, and to measure the performance of our Google Ads campaigns &mdash; for example, to know which ad led to a contact form submission. <strong>We do not use social media tracking cookies, and we do not sell your personal information.</strong> You can decline advertising and analytics cookies at any time using the &ldquo;Cookie Preferences&rdquo; link in our footer."],
  ["privacy-policy.html",
   "These third parties are contractually restricted from using your information for purposes other than those described. We do not currently integrate with advertising platforms, remarketing services, or social media tracking pixels.",
   "These third parties are contractually restricted from using your information for purposes other than those described. We use Google Ads conversion measurement to understand which of our advertisements lead to enquiries. We do not integrate with social media tracking pixels, and we do not sell your personal information."],
];
for (const [file, oldText, newText] of POLICY_EDITS) {
  const src = readFileSync(file, "utf8");
  if (src.includes(oldText)) {
    writeFileSync(file, src.replace(oldText, newText));
    console.log(`${file}: advertising-cookie language corrected`);
  } else if (src.includes(newText)) {
    console.log(`${file}: already corrected`);
  } else {
    console.log(`!! ${file}: expected policy text NOT found — review manually`);
  }
}
