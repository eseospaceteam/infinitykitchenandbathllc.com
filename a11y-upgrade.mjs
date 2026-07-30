#!/usr/bin/env node
/**
 * a11y-upgrade.mjs — sitewide accessibility remediation. Idempotent: safe to
 * re-run after any content change, and every step guards on its own marker.
 *
 * Runs over *.html plus lp/<slug>/index.html (the noindex PPC pages), because
 * the PPC pages carry the same chrome and the same lead forms.
 *
 * What it does per page:
 *   1. Skip-to-content link as the first child of <body> (WCAG 2.4.1).
 *   2. Wraps the content region in <main id="main" tabindex="-1"> — the site
 *      had NO main landmark anywhere, so there was nothing to skip TO. The
 *      region is delimited by the close of `div.mobile-nav` (last piece of
 *      chrome the nav emits) through to `<footer`. Verified across all pages:
 *      that slice always starts at the hero section.
 *   3. Adds an "Accessibility" link to the footer legal row.
 *   4. contact.html only: a role="status" live region for submit feedback.
 *
 * Sibling edits made by hand, NOT here (they are one-file changes):
 *   css/styles.css      — .skip-link + :focus-visible rules, placeholder contrast
 *   js/main.js          — announces contact-form status into #contactStatus
 *   js/estimate-tab.js  — dialog focus management + aria-live on success
 *   accessibility.html  — built by build-accessibility.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);

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

const pages = pageFiles();

const SKIP_LINK =
  '<a class="skip-link" href="#main">Skip to main content</a>';

/** Walk <div>/</div> from the opening tag at `start` to its matching close. */
function matchDiv(html, start) {
  let depth = 0;
  const re = /<(\/?)div\b[^>]*?(\/?)>/g;
  re.lastIndex = start;
  let m;
  while ((m = re.exec(html))) {
    if (m[1] === '/') {
      depth -= 1;
      if (depth === 0) return re.lastIndex;
    } else if (m[2] !== '/') {
      depth += 1;
    }
  }
  return null;
}

const stats = { skip: 0, main: 0, footer: 0, status: 0, skipped: [] };

for (const file of pages) {
  let html = readFileSync(file, 'utf8');
  const before = html;

  // ---- 1. skip link ----------------------------------------------------
  if (!html.includes('class="skip-link"')) {
    const body = html.match(/<body[^>]*>/);
    if (!body) {
      stats.skipped.push([file, 'no <body>']);
      continue;
    }
    const at = body.index + body[0].length;
    html = html.slice(0, at) + '\n' + SKIP_LINK + html.slice(at);
    stats.skip += 1;
  }

  // ---- 2. <main> landmark ----------------------------------------------
  if (!html.includes('<main id="main"')) {
    const mn = html.indexOf('<div class="mobile-nav"');
    const end = mn === -1 ? null : matchDiv(html, mn);
    const footer = html.indexOf('<footer');
    if (end === null || footer === -1 || end > footer) {
      stats.skipped.push([file, 'could not locate main-wrap boundary']);
    } else {
      // Splice the closing tag first so the opening insert cannot shift it.
      html =
        html.slice(0, footer) + '</main>\n\n' + html.slice(footer);
      html =
        html.slice(0, end) +
        '\n\n<main id="main" tabindex="-1">' +
        html.slice(end);
      stats.main += 1;
    }
  }

  // ---- 3. footer legal row --------------------------------------------
  // The /lp/ pages are served from a subdirectory, so their chrome links are
  // root-absolute (build-lp.mjs rootAbs()) — a bare "accessibility.html" there
  // would resolve to /lp/<slug>/accessibility.html and 404.
  // Guard on the anchor text, not on the filename: accessibility.html's own
  // canonical URL contains "accessibility.html", so a filename check would
  // skip the one page that most needs the link present.
  if (
    html.includes('footer-bottom-links') &&
    !html.includes('>Accessibility</a>')
  ) {
    const anchor = '<a href="#" class="ikb-cookie-prefs"';
    if (html.includes(anchor)) {
      const href = html.includes('href="/privacy-policy.html"')
        ? '/accessibility.html'
        : 'accessibility.html';
      html = html.replace(
        anchor,
        `<a href="${href}">Accessibility</a>` + anchor
      );
      stats.footer += 1;
    }
  }

  // ---- 4. contact-form live region -------------------------------------
  // The submit button's own label was the ONLY success/failure signal, and a
  // disabled button's changed text is not announced — so screen-reader users
  // got no confirmation that a lead was sent.
  if (html.includes('id="contactForm"') && !html.includes('id="contactStatus"')) {
    const btn = html.match(
      /<button[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/
    );
    if (btn) {
      const at = btn.index + btn[0].length;
      html =
        html.slice(0, at) +
        '\n              <p id="contactStatus" class="form-status" role="status" aria-live="polite"></p>' +
        html.slice(at);
      stats.status += 1;
    }
  }

  if (html !== before) writeFileSync(file, html);
}

console.log(`pages scanned            ${pages.length}`);
console.log(`skip links added         ${stats.skip}`);
console.log(`<main> landmarks added   ${stats.main}`);
console.log(`footer links added       ${stats.footer}`);
console.log(`form status regions      ${stats.status}`);
if (stats.skipped.length) {
  console.log('\nSKIPPED:');
  for (const [f, why] of stats.skipped) console.log(`  ${f} — ${why}`);
}
