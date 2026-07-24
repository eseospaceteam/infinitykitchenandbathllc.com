#!/usr/bin/env node
/**
 * Repairs two pre-existing markup defects. Idempotent.
 *
 * 1. The 16 West Valley city pages were produced by a generator that omitted
 *    the </div> closing .service-card-body, so each service card left a <div>
 *    open and every page carried 6 unclosed divs. Every other city page on the
 *    site has the closing tag — this restores the same structure.
 *
 * 2. review.html carries one stray </section> just before <footer> with no
 *    matching open tag (the real section already closes earlier).
 *
 * Usage: node fix-markup.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);

// --- 1. unclosed .service-card-body divs ------------------------------------
const BROKEN = '<span class="service-card-link">Learn More</span></a>';
const FIXED = '<span class="service-card-link">Learn More</span></div></a>';

let cardFiles = 0;
let cardFixes = 0;
for (const name of readdirSync(ROOT).filter((f) => f.endsWith('.html'))) {
  const p = path.join(ROOT, name);
  const html = readFileSync(p, 'utf8');
  const n = html.split(BROKEN).length - 1;
  if (!n) continue;
  writeFileSync(p, html.split(BROKEN).join(FIXED));
  cardFiles++;
  cardFixes += n;
  console.log(`${name}: closed ${n} service-card-body div(s)`);
}

// --- 2. stray </section> in review.html --------------------------------------
{
  const p = path.join(ROOT, 'review.html');
  const html = readFileSync(p, 'utf8');
  // The orphan is the </section> sitting between the tracking script and the
  // footer; the legitimate one closes well above it.
  const stray = '</script>\n\n</section>\n\n<footer>';
  if (html.includes(stray)) {
    writeFileSync(p, html.replace(stray, '</script>\n\n<footer>'));
    console.log('review.html: removed 1 stray </section>');
  } else {
    console.log('review.html: nothing to fix');
  }
}

console.log(`\n${cardFixes} div(s) closed across ${cardFiles} page(s)`);
