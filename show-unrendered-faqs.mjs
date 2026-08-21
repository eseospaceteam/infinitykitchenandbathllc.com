/**
 * Renders the FAQ answers that were only ever in the markup.
 *
 * Four questions across two pages were published as FAQPage and appear nowhere on the
 * page they describe:
 *
 *   remodel-cost-calculator.html   all 3 — calculator accuracy, price range, financing
 *   backsplash-installation.html   1 of 5 — "Do you install a backsplash on its own…"
 *
 * Google requires the marked-up questions and answers to be visible on the page, so
 * this is a policy problem rather than a missed opportunity. The answers themselves are
 * written and accurate, so they are rendered rather than deleted — the same call as
 * on the eliteprotax posts. Nothing is authored here: the copy comes from the page's
 * own acceptedAnswer text.
 *
 * The block uses the site's existing pillar-faq markup so it matches every other FAQ
 * on the site, and is inserted before </main>.
 *
 * Idempotent: a question already present in the visible copy is skipped.
 *
 * Run: node show-unrendered-faqs.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = import.meta.dirname;
const DRY = process.argv.includes('--dry');

/**
 * Both sides of the comparison go through this.
 *
 * The pages write &rsquo; where the markup writes a literal curly apostrophe, so a
 * comparison that decodes only one side reports "What's the most common remodel
 * mistake in Prescott?" as missing from a page that shows it — 18 false positives
 * against 4 real ones, and acting on them would have printed a second copy of an FAQ
 * the page already had. Every apostrophe and quote variant is folded to one character.
 */
/**
 * Both sides of the comparison go through this.
 *
 * Compared on letters and digits only, with everything else discarded. The pages and
 * the markup disagree constantly on punctuation encoding — &rsquo; against a literal
 * curly apostrophe, &#8217; against both, &times; against a literal multiplication
 * sign — and each hand-listed entity that got added only moved the false positives
 * around: 18, then 9, then 5, for 4 real ones. Acting on any of them would have
 * printed a second copy of an FAQ the page already showed. A question is 40-plus
 * characters, so dropping punctuation cannot make two different ones collide.
 */
const key = (s) =>
  String(s)
    .replace(/<[^>]+>/g, ' ')
    // Numeric entities become their character; NAMED entities are dropped rather than
    // left to decay into letters — stripping punctuation turned &times; into the word
    // "times" and &rsquo; into "rsquo", which made every entity a mismatch of its own.
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(Number(d)))
    .replace(/&[a-z][a-z0-9]*;/gi, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const visibleText = (html) =>
  key(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' '));

const escapeHtml = (s) =>
  String(s).replace(/&(?!(?:[a-z]+|#\d+);)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let pages = 0;
let added = 0;

for (const name of fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort()) {
  const file = path.join(ROOT, name);
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('FAQPage')) continue;

  const seen = visibleText(html);
  const missing = [];

  for (const [, json] of html.matchAll(
    /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    let doc;
    try {
      doc = JSON.parse(json);
    } catch {
      continue;
    }
    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== 'object') return;
      if (node['@type'] === 'FAQPage') {
        for (const q of node.mainEntity ?? []) {
          const question = String(q.name ?? '');
          const answer = String(q.acceptedAnswer?.text ?? '');
          if (!question || !answer) continue;
          if (seen.includes(key(question))) continue;
          if (missing.some((m) => m.question === question)) continue;
          missing.push({ question, answer });
        }
      }
      Object.values(node).forEach(walk);
    };
    walk(doc);
  }

  if (!missing.length) continue;

  /* Where the page already shows an FAQ, the missing items join it rather than starting
     a second one. backsplash-installation.html shows four questions and was missing one:
     appending a fresh block gave it two "Frequently Asked Questions" headings. The
     container's own close is found by counting <div> depth from its start. */
  const containerAt = html.search(/<div class="pillar-faq"[^>]*>/);
  let at = -1;
  let joinExisting = false;
  if (containerAt !== -1) {
    const open = html.slice(containerAt).match(/<div class="pillar-faq"[^>]*>/)[0];
    let depth = 1;
    let i = containerAt + open.length;
    while (depth > 0 && i < html.length) {
      const next = html.slice(i).search(/<\/?div\b/);
      if (next === -1) break;
      i += next;
      depth += html.slice(i).startsWith('</div') ? -1 : 1;
      i += html.slice(i).startsWith('</div') ? 6 : 4;
    }
    if (depth === 0) { at = i - 6; joinExisting = true; }
  }
  /* The other shape: a run of <h3>Question?</h3><p>Answer</p> under an FAQ heading.
     backsplash-installation.html uses it, and looking only for a pillar-faq container
     fell through to the fallback and gave the page a second FAQ heading. */
  let asHeadings = false;
  if (at === -1) {
    let last = null;
    for (const m of html.matchAll(/<h3[^>]*>[^<]*\?\s*<\/h3>\s*<p[^>]*>[\s\S]*?<\/p>/gi)) last = m;
    if (last) { at = last.index + last[0].length; asHeadings = true; }
  }
  if (at === -1) at = html.lastIndexOf('</main>');
  if (at === -1) {
    console.warn(`  SKIP ${name} — nowhere to insert`);
    continue;
  }

  // Answers already carry anchors from link-faq-answers.mjs; they are kept as markup
  // rather than escaped, which is why only the question text is escaped here.
  const items = missing
    .map(
      (m) =>
        `<div class="pillar-faq-item"><p class="pillar-faq-q">${escapeHtml(m.question)}</p>` +
        `<p class="pillar-faq-a">${m.answer}</p></div>`,
    )
    .join('');

  const asHeadingPairs = missing
    .map((m) => `\n      <h3>${escapeHtml(m.question)}</h3>\n      <p>${m.answer}</p>`)
    .join('');

  const block = asHeadings
    ? `\n      <!-- rendered from this page's own FAQPage markup by show-unrendered-faqs.mjs -->${asHeadingPairs}`
    : joinExisting
    ? `<!-- rendered from this page's own FAQPage markup by show-unrendered-faqs.mjs -->${items}`
    : `\n      <!-- Rendered from this page's own FAQPage markup by show-unrendered-faqs.mjs -->\n` +
      `      <h2>Frequently Asked Questions</h2>\n` +
      `      <div class="pillar-faq" style="margin-top:1rem;">${items}</div>\n\n`;

  if (!DRY) fs.writeFileSync(file, html.slice(0, at) + block + html.slice(at));
  pages += 1;
  added += missing.length;
  console.log(`  ${name} — rendered ${missing.length} question(s) that were markup-only`);
  for (const m of missing) console.log(`      ${m.question}`);
}

console.log(`${DRY ? '[dry] ' : ''}${added} question(s) rendered across ${pages} page(s)`);
