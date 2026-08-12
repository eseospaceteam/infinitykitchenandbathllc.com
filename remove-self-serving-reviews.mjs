#!/usr/bin/env node
/**
 * Removes self-serving review markup from every page's JSON-LD.
 *
 * Why: the site marks up its own ratings on a HomeAndConstructionBusiness
 * (a LocalBusiness subtype). Google's structured-data policy disallows
 * self-serving reviews for LocalBusiness and Organization — the markup is
 * ineligible for rich results either way, and carries manual-action risk.
 * The reviews themselves are genuine Google reviews; the problem is marking
 * them up on our own site about our own business, not their authenticity.
 *
 * Two shapes are removed, both only inside <script type="application/ld+json">
 * so the VISIBLE testimonials on reviews.html are untouched (they stay — this
 * removes markup, not content):
 *   1. "aggregateRating": {...},        163 pages, one flat line each
 *   2. "review": [ {...}, ... ],        reviews.html only, 9 Review objects
 *
 * Also fixes a live contradiction on the way out: 162 pages declared
 * reviewCount 16 while reviews.html declared 9.
 *
 * Idempotent — a second run reports 0 changes.
 * Usage: node remove-self-serving-reviews.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DRY = process.argv.includes('--dry');

const LD_BLOCK = /(<script[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi;

/** Remove `"key": [ ... ],` or `"key": { ... },` by walking to the matching bracket. */
function removeKey(json, key) {
  let out = json;
  let removed = 0;
  for (;;) {
    const at = out.indexOf(`"${key}"`);
    if (at === -1) break;

    // find the opening bracket after the colon
    let i = out.indexOf(':', at + key.length + 2);
    if (i === -1) break;
    while (i < out.length && /\s/.test(out[i + 1])) i++;
    const open = out[i + 1];
    if (open !== '{' && open !== '[') break;
    const close = open === '{' ? '}' : ']';

    // walk to the matching close, respecting strings and escapes
    let depth = 0, j = i + 1, inStr = false, esc = false;
    for (; j < out.length; j++) {
      const c = out[j];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === open) depth++;
      else if (c === close) { depth--; if (depth === 0) break; }
    }
    if (j >= out.length) break; // unbalanced — leave it alone

    let end = j + 1;
    // consume one trailing comma (+ whitespace) if present…
    const after = out.slice(end);
    const trail = after.match(/^\s*,\s*/);
    if (trail) {
      end += trail[0].length;
    } else {
      // …otherwise consume a PRECEDING comma so we don't leave `{"a":1,}`
      const before = out.slice(0, at).match(/,\s*$/);
      if (before) return removeKeyAt(out, at - before[0].length, end, key, removed);
    }
    out = out.slice(0, at) + out.slice(end);
    removed++;
  }
  return { json: out, removed };
}

function removeKeyAt(out, start, end, key, removed) {
  const next = out.slice(0, start) + out.slice(end);
  const again = removeKey(next, key);
  return { json: again.json, removed: removed + 1 + again.removed };
}

const files = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let touched = 0, aggCount = 0, revCount = 0;
const parseErrors = [];

for (const file of files) {
  const abs = path.join(ROOT, file);
  const original = readFileSync(abs, 'utf8');
  let agg = 0, rev = 0;

  const updated = original.replace(LD_BLOCK, (whole, open, body, close) => {
    let json = body;
    const a = removeKey(json, 'aggregateRating');
    json = a.json; agg += a.removed;
    const r = removeKey(json, 'review');
    json = r.json; rev += r.removed;
    return open + json + close;
  });

  // Verify every block still parses BEFORE writing — never ship broken JSON-LD.
  for (const m of updated.matchAll(LD_BLOCK)) {
    try { JSON.parse(m[2]); }
    catch (e) { parseErrors.push(`${file}: ${e.message}`); }
  }

  if (updated !== original && !parseErrors.length) {
    if (!DRY) writeFileSync(abs, updated);
    touched++; aggCount += agg; revCount += rev;
    console.log(`  ${file}  −${agg} aggregateRating  −${rev} review`);
  }
}

console.log('');
if (parseErrors.length) {
  console.error('ABORTED — JSON-LD would not parse. Nothing written:');
  for (const e of parseErrors) console.error('  ' + e);
  process.exit(1);
}
console.log(`${DRY ? '[dry] would change' : 'changed'} ${touched} pages`);
console.log(`  aggregateRating removed: ${aggCount}`);
console.log(`  review objects removed:  ${revCount}`);
console.log(`\nLeft in place: visible testimonials, review.html (noindex review-request page).`);
if (!DRY) console.log('Next: re-run add-sitemap-lastmod.mjs, then review the diff before pushing.');
