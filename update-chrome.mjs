#!/usr/bin/env node
/**
 * Sitewide nav/footer maintenance. Idempotent — safe to re-run.
 *
 *  1. Removes "Home Additions" and "Garage Conversion & ADU" from the Services
 *     mega-menu and the mobile nav. The pages themselves stay live; only the
 *     nav entries go away. Body-copy links to those pages are left alone —
 *     edits are scoped to the nav region only.
 *  2. Adds "Featured In" to the footer Company column (after the FAQ link).
 *
 * Usage: node update-chrome.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);

// Nav entries to drop (matched by href, anywhere inside the nav region).
const DROP_HREFS = ['home-additions.html', 'garage-conversion-adu.html'];

function pageFiles() {
  const files = readdirSync(ROOT)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(ROOT, f));
  const lpDir = path.join(ROOT, 'lp');
  for (const slug of readdirSync(lpDir, { withFileTypes: true })) {
    if (slug.isDirectory()) files.push(path.join(lpDir, slug.name, 'index.html'));
  }
  return files;
}

/**
 * The nav region runs from <nav id="navbar"> through the end of the mobile nav
 * drawer, which closes with two </div> after .mobile-nav-cta. Everything after
 * that is page content and must not be touched.
 */
function navRegion(html) {
  const start = html.indexOf('<nav id="navbar"');
  if (start === -1) return null;
  const cta = html.indexOf('mobile-nav-cta', start);
  if (cta === -1) return null;
  const firstClose = html.indexOf('</div>', cta);
  const secondClose = html.indexOf('</div>', firstClose + 6);
  if (firstClose === -1 || secondClose === -1) return null;
  return [start, secondClose + 6];
}

function stripNavItems(html) {
  const region = navRegion(html);
  if (!region) return { html, removed: 0 };
  const [start, end] = region;
  let nav = html.slice(start, end);
  let removed = 0;
  for (const href of DROP_HREFS) {
    // Anchors never nest, so a non-greedy match to the first </a> is exact.
    const re = new RegExp(`<a href="/?${href.replace('.', '\\.')}"[^>]*>[\\s\\S]*?</a>`, 'g');
    nav = nav.replace(re, () => {
      removed++;
      return '';
    });
  }
  return { html: html.slice(0, start) + nav + html.slice(end), removed };
}

function addFeaturedInFooterLink(html) {
  if (html.includes('featured-in.html')) return { html, added: 0 };
  let added = 0;
  const out = html.replace(
    /<li><a href="(\/?)faq\.html">FAQ<\/a><\/li>/,
    (m, slash) => {
      added++;
      return `${m}<li><a href="${slash}featured-in.html">Featured In</a></li>`;
    }
  );
  return { html: out, added };
}

let navTouched = 0;
let footerTouched = 0;
let navItemsRemoved = 0;

for (const file of pageFiles()) {
  const original = readFileSync(file, 'utf8');
  const a = stripNavItems(original);
  const b = addFeaturedInFooterLink(a.html);
  if (b.html !== original) writeFileSync(file, b.html);
  if (a.removed) {
    navTouched++;
    navItemsRemoved += a.removed;
  }
  if (b.added) footerTouched++;
}

console.log(`nav: removed ${navItemsRemoved} link(s) across ${navTouched} page(s)`);
console.log(`footer: added "Featured In" to ${footerTouched} page(s)`);
