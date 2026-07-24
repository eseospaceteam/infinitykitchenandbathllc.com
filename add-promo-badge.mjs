#!/usr/bin/env node
/**
 * Injects the 15th-anniversary promo bar (#promoBar) as the first child of
 * #navbar on every page. Idempotent — safe to re-run.
 *
 * The bar is one big <a> so the whole strip is clickable; it lands on
 * contact.html?promo=15for15, where js/main.js shows a confirmation ribbon,
 * preselects the in-home consult option, and stamps the message field.
 *
 *   node add-promo-badge.mjs            inject
 *   node add-promo-badge.mjs --remove   pull it back out when the offer ends
 *
 * When removing, also reset --nav-height in css/styles.css to 118px (and the
 * max-width:768px override to 108px).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const REMOVE = process.argv.includes('--remove');

const BAR = `  <a href="/contact.html?promo=15for15" id="promoBar" data-promo="15for15" aria-label="Claim 15 percent off your remodel — 15th anniversary offer">
    <span class="promo-inner">
      <span class="promo-text">
        <span class="promo-full">&#127881; Celebrating 15 Years in Business &mdash; <em>Save 15%</em> on Your Remodel This Month</span>
        <span class="promo-short">&#127881; 15 Years &mdash; <em>Save 15%</em> This Month</span>
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
for (const file of pageFiles()) {
  const html = readFileSync(file, 'utf8');
  let out = html;

  if (REMOVE) {
    out = out.replace(/ *<a href="[^"]*" id="promoBar"[\s\S]*?<\/a>\n/, '');
  } else if (!html.includes('id="promoBar"')) {
    // Insert directly after the opening <nav id="navbar" ...> tag.
    out = html.replace(/(<nav id="navbar"[^>]*>\n)/, `$1${BAR}`);
  }

  if (out !== html) {
    writeFileSync(file, out);
    touched++;
  }
}

console.log(`${REMOVE ? 'removed from' : 'injected into'} ${touched} page(s)`);
