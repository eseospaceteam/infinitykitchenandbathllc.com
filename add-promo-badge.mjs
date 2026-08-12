#!/usr/bin/env node
/**
 * Injects the 15th-anniversary promo bar (#promoBar) as the first child of
 * #navbar on every page. Idempotent — safe to re-run.
 *
 * The bar is one big <a> so the whole strip is clickable; it lands on
 * contact.html?promo=15for15, where js/main.js shows a confirmation ribbon,
 * preselects the in-home consult option, and stamps the message field.
 *
 *   node add-promo-badge.mjs            inject, or re-text an existing bar
 *   node add-promo-badge.mjs --remove   pull it back out when the offer ends
 *
 * When removing, also reset --nav-height in css/styles.css to 118px (and the
 * max-width:768px override to 108px).
 *
 * ── THE OFFER PERIOD LIVES IN ONE PLACE: `PERIOD` BELOW ──
 * Change it and re-run; the script rewrites the WHOLE bar on pages that already
 * carry one rather than skipping them, so both the copy and the markup have a
 * single source of truth. This matters because the original wording was "This
 * Month", which is silently wrong from the 1st of the next month with nothing
 * to signal it — the bar just quietly starts advertising an offer that has
 * expired. Naming a hard end date instead means it fails visibly, and it is the
 * urgency that makes the offer worth putting in front of every visitor.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const REMOVE = process.argv.includes('--remove');

// 2026-07-29: extended from July into August at the client's direction.
// Steve is honouring the 15% through the end of August.
// 2026-08-12: switched from a period ("Through August") to a hard end date, so
// the bar reads as a deadline rather than as permanent chrome.
const PERIOD = 'Ends Aug 31';

const BAR = `  <a href="/contact.html?promo=15for15" id="promoBar" data-promo="15for15" aria-label="Save 15 percent on your remodel — 15th anniversary offer, ${PERIOD}">
    <span class="promo-inner">
      <span class="promo-full">
        <span class="promo-kicker">&#127881; Celebrating 15 Years</span>
        <span class="promo-offer"><em>Save 15%</em> on Your Remodel</span>
        <span class="promo-deadline">${PERIOD}</span>
      </span>
      <span class="promo-short">
        <span class="promo-offer"><em>Save 15%</em></span>
        <span class="promo-deadline">${PERIOD}</span>
      </span>
      <span class="promo-claim">Claim Offer</span>
    </span>
  </a>
`;

function pageFiles() {
  const files = readdirSync(ROOT)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(ROOT, f));
  for (const d of readdirSync(path.join(ROOT, 'lp'), { withFileTypes: true })) {
    if (d.isDirectory()) files.push(path.join(ROOT, 'lp', d.name, 'index.html'));
  }
  return files;
}

let touched = 0;
let retexted = 0;
for (const file of pageFiles()) {
  const html = readFileSync(file, 'utf8');
  let out = html;

  if (REMOVE) {
    out = out.replace(/ *<a href="[^"]*" id="promoBar"[\s\S]*?<\/a>\n/, '');
    if (out !== html) touched++;
  } else if (!html.includes('id="promoBar"')) {
    // Insert directly after the opening <nav id="navbar" ...> tag.
    out = html.replace(/(<nav id="navbar"[^>]*>\n)/, `$1${BAR}`);
    if (out !== html) touched++;
  } else {
    // Bar already present — swap the whole element for the current BAR. Patching
    // the copy in place would leave older markup behind on pages that were
    // stamped by an earlier version of this script; replacing wholesale means
    // every page carries whatever BAR says today. The bar contains no nested
    // <a>, so the non-greedy match to the first </a> is exact.
    const before = out;
    out = out.replace(/ *<a href="[^"]*" id="promoBar"[\s\S]*?<\/a>\n/, BAR);
    if (out !== before) retexted++;
  }

  if (out !== html) writeFileSync(file, out);
}

if (REMOVE) console.log(`removed from ${touched} page(s)`);
else console.log(`injected into ${touched} page(s), re-texted ${retexted} page(s)`);
