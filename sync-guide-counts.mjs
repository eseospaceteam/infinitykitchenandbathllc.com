#!/usr/bin/env node
/**
 * Keeps every "N guides" count equal to the real guide list.
 *
 * The source of truth is each category hub's own list: the area-pill links
 * under its "All N guides in this category" heading. From that list this
 * script rewrites
 *   - the hub heading        "All N guides in this category"
 *   - every guide's up-link  "Part of our <hub> ... see all N guides in this category."
 *   - the "N guides" on category cards (blog.html, guides.html) and the
 *     "<Number> categories, N guides" heading above those cards
 * so the numbers can no longer drift when a guide is added, merged or moved.
 *
 * The site is static HTML with no build step, so run it after any change to a
 * hub list (it is idempotent and only touches a count that is wrong):
 *   node sync-guide-counts.mjs           dry run, prints what would change
 *   node sync-guide-counts.mjs --apply   writes the files
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const HEADING = /All (\d+) guides in this category<\/h2>/;
const pages = readdirSync(".").filter((f) => f.endsWith(".html"));
const buf = new Map();
const read = (f) => buf.get(f) ?? readFileSync(f, "utf8");

/* A hub is any page with the "All N guides in this category" heading. */
const hubs = new Map();
for (const f of pages) {
  const h = read(f);
  const m = h.match(HEADING);
  if (!m) continue;
  const grid = h.indexOf("display:grid", m.index);
  const end = h.indexOf("</div>", grid);
  if (grid < 0 || end < 0) { console.log(`SKIP  ${f}: no guide grid under the heading`); continue; }
  const n = [...h.slice(grid, end).matchAll(/<a href="[^"]+" class="area-pill"/g)].length;
  if (!n) { console.log(`SKIP  ${f}: guide grid is empty`); continue; }
  hubs.set(f, n);
}

let changes = 0;
const fix = (f, from, to, what) => {
  if (from === to) return;
  buf.set(f, read(f).replace(from, to));
  console.log(`${APPLY ? "FIX " : "WOULD FIX"}  ${f}: ${what}`);
  changes++;
};

for (const [hub, n] of hubs) {
  const h = read(hub);
  const m = h.match(HEADING);
  fix(hub, m[0], `All ${n} guides in this category</h2>`, `heading ${m[1]} -> ${n}`);
}

for (const f of pages) {
  const re = /(Part of our <a href="([^"]+)"><strong>[^<]*<\/strong><\/a> [^<]*?see all )(\d+)( guides in this category)/g;
  for (const m of read(f).matchAll(re)) {
    const n = hubs.get(m[2]);
    if (n === undefined || String(n) === m[3]) continue;
    fix(f, m[0], `${m[1]}${n}${m[4]}`, `up-link to ${m[2]} ${m[3]} -> ${n}`);
  }
}

/* Category cards that link to a hub and show "N guides" (blog.html, guides.html). */
const CARD = /(<a href="([^"]+)"[^>]*>(?:(?!<\/a>)[\s\S])*?>)(\d+)( guides<\/span>)/g;
for (const f of pages) {
  for (const m of read(f).matchAll(CARD)) {
    const n = hubs.get(m[2]);
    if (n === undefined || String(n) === m[3]) continue;
    fix(f, m[0], `${m[1]}${n}${m[4]}`, `card for ${m[2]} ${m[3]} -> ${n}`);
  }
}

/* "<Number> categories, N guides" headings: count and sum the hub cards in that section. */
const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
for (const f of pages) {
  const h = read(f);
  const m = h.match(/<h2>(\w+) categories, (\d+) guides<\/h2>/);
  if (!m) continue;
  const end = h.indexOf("</section>", m.index);
  const cards = [...h.slice(m.index, end).matchAll(CARD)].filter((c) => hubs.has(c[2]));
  if (!cards.length) continue;
  const total = cards.reduce((s, c) => s + hubs.get(c[2]), 0);
  const word = WORDS[cards.length] ?? String(cards.length);
  fix(f, m[0], `<h2>${word} categories, ${total} guides</h2>`, `summary "${m[1]} categories, ${m[2]}" -> "${word} categories, ${total}"`);
}

if (APPLY) for (const [f, s] of buf) writeFileSync(f, s);
console.log(`${hubs.size} hubs, ${changes} count(s) ${APPLY ? "fixed" : "to fix"}${APPLY ? "" : " (dry run; add --apply)"}`);
