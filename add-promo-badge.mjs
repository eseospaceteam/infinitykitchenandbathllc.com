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
 * Change it and re-run; the script rewrites the copy on pages that already
 * carry the bar rather than skipping them. This matters because the original
 * wording was "This Month", which is silently wrong from the 1st of the next
 * month with nothing to signal it — the bar just quietly starts advertising an
 * offer that has expired. Naming the month instead means it fails visibly.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const REMOVE = process.argv.includes('--remove');

// 2026-07-29: extended from July into August at the client's direction.
// Steve is honouring the 15% through the end of August.
const PERIOD = 'Through August';

const PROMO_FULL = `&#127881; Celebrating 15 Years in Business &mdash; <em>Save 15%</em> on Your Remodel ${PERIOD}`;
const PROMO_SHORT = `&#127881; 15 Years &mdash; <em>Save 15%</em> ${PERIOD}`;

const BAR = `  <a href="/contact.html?promo=15for15" id="promoBar" data-promo="15for15" aria-label="Claim 15 percent off your remodel — 15th anniversary offer">
    <span class="promo-inner">
      <span class="promo-text">
        <span class="promo-full">${PROMO_FULL}</span>
        <span class="promo-short">${PROMO_SHORT}</span>
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
    // Bar already present — bring its copy up to date with PERIOD.
    const before = out;
    out = out
      .replace(
        /<span class="promo-full">[\s\S]*?<\/span>/,
        `<span class="promo-full">${PROMO_FULL}</span>`
      )
      .replace(
        /<span class="promo-short">[\s\S]*?<\/span>/,
        `<span class="promo-short">${PROMO_SHORT}</span>`
      );
    if (out !== before) retexted++;
  }

  if (out !== html) writeFileSync(file, out);
}

if (REMOVE) console.log(`removed from ${touched} page(s)`);
else console.log(`injected into ${touched} page(s), re-texted ${retexted} page(s)`);
