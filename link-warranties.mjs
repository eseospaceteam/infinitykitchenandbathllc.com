#!/usr/bin/env node
/**
 * De-orphans warranties.html. Idempotent.
 *
 * The page is 1,634 words of genuine trust content and had exactly ONE inbound
 * link (from licensing-insurance.html) — effectively orphaned, which is the
 * real defect behind the Jul 29 audit's incorrect claim that no warranty page
 * existed at all.
 *
 * 53 pages discuss warranties in body copy without linking to it. Linking all
 * 53 would read as over-optimisation, so this targets the pages where a
 * warranty is an actual buying criterion — the "how to choose" guides, the FAQ
 * hubs, and the service pages that make a warranty claim.
 *
 * Links the FIRST eligible plain-text mention in the page body. Guards:
 *   - inside <main> only, with <script>/<style>/<footer> removed from scope
 *   - never inside a heading (linking an h2 looks broken and adds nothing)
 *   - never inside an existing <a> (no nested anchors)
 *   - never inside a tag's attributes
 *
 * Usage: node link-warranties.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);

const TARGETS = [
  'how-to-choose-contractor',
  'best-home-remodeling-contractor-prescott',
  'best-kitchen-remodeler-prescott',
  'best-bathroom-remodeler-prescott',
  'best-countertop-installer-prescott',
  'best-cabinet-maker-prescott',
  'best-flooring-contractor-prescott',
  'best-outdoor-kitchen-builder-prescott',
  'best-walk-in-shower-installer-prescott',
  'best-ada-bathroom-remodeler-prescott',
  'best-aging-in-place-remodeler-yavapai-county',
  'best-remodeling-contractor-prescott-valley',
  'best-remodeling-contractor-chino-valley',
  'best-remodeling-contractor-dewey-humboldt',
  'best-remodeling-contractor-cottonwood',
  'best-remodeling-contractor-sedona',
  'groutless-shower-systems',
  'faq',
  'prescott-remodeling-faq',
  'kitchen-remodel-cost',
  'bathroom-remodel-cost',
];

/**
 * Link the first plain-text occurrence of warranty/warranties in `body`.
 *
 * Single pass over the REAL body, returning the rewritten string directly.
 * An earlier version tokenised a masked copy and then re-applied the insertion
 * to the original by byte offset — which silently corrupted text ("a lifetime
 * warranty" became "a lifet<a…>warranty</a>anty", deleting 8 characters)
 * because the tokeniser dropped HTML comments, so every offset after the first
 * comment was wrong. Never map offsets between two differently-tokenised
 * copies of a document; rewrite the one you are walking.
 *
 * The tokeniser must be LOSSLESS — comments and stray "<" included — or the
 * output quietly loses content.
 */
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/** Elements a link must never be inserted inside. */
function isNoLinkZone(tag, startTag) {
  if (tag === 'a' || tag === 'script' || tag === 'style' || tag === 'footer') return true;
  if (/^h[1-6]$/.test(tag)) return true;
  // FAQ questions are marked up as divs here rather than headings, so the
  // heading rule alone misses them. A link inside the question reads as a
  // mistake, and the answer below it is the better target anyway.
  if (/class="[^"]*faq-q/.test(startTag)) return true;
  return false;
}

function linkFirstMention(body) {
  const re = /<!--[\s\S]*?-->|<\/?([a-z0-9]+)[^>]*>|[^<]+|</gi;
  // Stack of open elements, each flagged as a no-link zone or not, so nesting
  // is handled correctly rather than by counting close tags.
  const stack = [];
  let blocked = 0;
  let out = '';
  let done = false;
  let m;
  while ((m = re.exec(body))) {
    const chunk = m[0];
    if (chunk.startsWith('<!--') || chunk === '<') {
      out += chunk;
      continue;
    }
    if (chunk[0] === '<' && m[1]) {
      const tag = m[1].toLowerCase();
      const closing = chunk[1] === '/';
      const selfClosing = /\/>$/.test(chunk) || VOID_TAGS.has(tag);
      if (!selfClosing) {
        if (closing) {
          // Unwind to the matching open tag; tolerate sloppy nesting.
          const i = stack.map((e) => e.tag).lastIndexOf(tag);
          if (i !== -1) {
            for (let k = stack.length - 1; k >= i; k--) {
              if (stack[k].blocks) blocked -= 1;
            }
            stack.length = i;
          }
        } else {
          const blocks = isNoLinkZone(tag, chunk);
          stack.push({ tag, blocks });
          if (blocks) blocked += 1;
        }
      }
      out += chunk;
      continue;
    }
    if (done || blocked > 0) {
      out += chunk;
      continue;
    }
    const w = chunk.match(/\bwarranties\b|\bwarranty\b/i);
    if (!w) {
      out += chunk;
      continue;
    }
    out +=
      chunk.slice(0, w.index) +
      `<a href="warranties.html">${w[0]}</a>` +
      chunk.slice(w.index + w[0].length);
    done = true;
  }
  return done ? out : null;
}

let linked = 0;
const skipped = [];

for (const slug of TARGETS) {
  const file = path.join(ROOT, `${slug}.html`);
  let html;
  try {
    html = readFileSync(file, 'utf8');
  } catch {
    skipped.push([slug, 'file not found']);
    continue;
  }
  if (html.includes('href="warranties.html"')) continue; // already linked

  const main = html.match(/<main id="main"[^>]*>([\s\S]*?)<\/main>/);
  if (!main) {
    skipped.push([slug, 'no <main>']);
    continue;
  }
  const body = main[1];
  const newBody = linkFirstMention(body);
  if (!newBody) {
    skipped.push([slug, 'no eligible plain-text mention']);
    continue;
  }
  // Sanity check: the rewrite must add exactly the anchor and nothing else.
  const expectedGrowth = newBody.length - body.length;
  const anchorLen = '<a href="warranties.html"></a>'.length;
  if (expectedGrowth !== anchorLen) {
    skipped.push([slug, `rewrite changed length by ${expectedGrowth}, expected ${anchorLen} — refusing`]);
    continue;
  }

  html =
    html.slice(0, main.index) +
    main[0].slice(0, main[0].indexOf(body)) +
    newBody +
    main[0].slice(main[0].indexOf(body) + body.length) +
    html.slice(main.index + main[0].length);
  writeFileSync(file, html);
  linked += 1;
}

console.log(`warranties.html inbound links added: ${linked}`);
if (skipped.length) {
  console.log('skipped:');
  for (const [s, why] of skipped) console.log(`  ${s} — ${why}`);
}
