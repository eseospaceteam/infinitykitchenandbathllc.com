/**
 * Adds one internal link to each FAQ answer, in the page and in its FAQPage markup.
 *
 * 993 questions across 203 pages already carried FAQPage markup and not one answer
 * contained a link — every answer was a dead end, for a reader and for an answer
 * engine quoting it.
 *
 * Driven by each page's OWN FAQPage node rather than by a heading pattern. The pages
 * use two shapes — <p class="pillar-faq-q">Q</p><p class="pillar-faq-a">A</p> on 133
 * pages and a bare <h3>Q</h3><p>A</p> run under an FAQ heading on the other 70 — and a
 * generic "heading then paragraph" regex mis-pairs the moment an answer runs to two
 * paragraphs, silently attaching the wrong answer to the right question. Looking each
 * question up by the exact text the markup already states cannot do that.
 *
 * The visible paragraph and the markup get the SAME anchor, chosen from a term that
 * appears in both, so the page and its structured data can never disagree about where
 * an answer leads.
 *
 * Idempotent: an answer that already has a link is skipped, so re-running after a copy
 * change only fills the gaps.
 *
 * Run: node link-faq-answers.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = import.meta.dirname;
const DRY = process.argv.includes('--dry');
// www, not the apex: the apex 308s to www, so absolutising without it would put a
// redirect hop inside every link in the markup. The pages' own canonical says www too.
const LIVE = 'https://www.infinitykitchenandbathllc.com';

/** Every page that exists, so a term can never point at a 404. */
const PAGES = new Set(fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')));

/**
 * Term → page. Longest phrase first, so "kitchen remodel cost" reaches the cost guide
 * rather than losing the match to "kitchen remodel".
 *
 * Nothing for "remodel" or "bathroom" alone: they are in nearly every answer on this
 * site, and a link that could sit anywhere tells a reader nothing.
 */
const TERMS = [
  ['bathroom remodel cost', 'bathroom-remodel-cost.html'],
  ['kitchen remodel cost', 'kitchen-remodel-cost.html'],
  ['cost calculator', 'remodel-cost-calculator.html'],
  ['financing', 'bathroom-remodel-financing.html'],
  ['VA grant', 'va-bathroom-remodeling-grant.html'],
  ['permit', 'permit-costs-yavapai-county.html'],
  ['warranty', 'warranties.html'],
  ['licensed and insured', 'licensing-insurance.html'],
  ['ROC license', 'licensing-insurance.html'],
  ['design-build', 'design-build.html'],
  ['walk-in shower', 'walk-in-showers.html'],
  ['curbless', 'curbless-zero-entry-showers.html'],
  ['steam shower', 'steam-shower-installation.html'],
  ['tub-to-shower', 'tub-to-shower.html'],
  ['tub to shower', 'tub-to-shower.html'],
  ['grout', 'shower-grout-guide.html'],
  ['tile shower', 'tile-shower-installation.html'],
  ['backsplash', 'kitchen-backsplash.html'],
  ['cabinet refacing', 'cabinet-refinishing-refacing.html'],
  ['refacing', 'cabinet-refinishing-refacing.html'],
  ['cabinets', 'kitchen-cabinets.html'],
  ['quartz', 'quartz-vs-granite.html'],
  ['granite', 'quartz-vs-granite.html'],
  ['countertops', 'countertops.html'],
  ['luxury vinyl', 'luxury-vinyl-flooring.html'],
  ['flooring', 'tile-flooring.html'],
  ['aging in place', 'aging-in-place.html'],
  ['ADA', 'ada-bathroom-remodeling.html'],
  ['grab bars', 'aging-in-place-bathroom.html'],
  ['outdoor kitchen', 'outdoor-kitchen.html'],
  ['laundry room', 'laundry-room-remodel.html'],
  ['kitchen island', 'kitchen-island-ideas.html'],
  ['small bathroom', 'small-bathroom.html'],
  ['master bathroom', 'master-bathroom.html'],
  ['vanity', 'bathroom-vanities.html'],
  ['resale value', 'bathroom-remodel-roi.html'],
  ['return on investment', 'kitchen-remodel-roi.html'],
  ['kitchen remodel', 'kitchen-remodeling.html'],
  ['bathroom remodel', 'bathroom-remodeling.html'],
];

/**
 * Answers with nothing specific to point at. Rotated across the pages a reader with
 * that question would want, keyed on the question so the choice is stable across
 * re-runs — one target collecting every generic link tells a reader nothing.
 */
const GENERIC = [
  ['timeline', ['bathroom-remodel-timeline.html', 'kitchen-remodel-timeline.html', 'design-build.html']],
  ['how long', ['bathroom-remodel-timeline.html', 'kitchen-remodel-timeline.html']],
  ['estimate', ['contact.html', 'remodel-cost-calculator.html', 'choosing-a-contractor.html']],
  ['consultation', ['contact.html', 'design-build.html']],
  ['our team', ['our-team.html', 'about.html', 'reviews.html']],
  ['reviews', ['reviews.html', 'about.html']],
  ['Prescott', ['prescott-remodeling-faq.html', 'best-remodeling-contractor-prescott-valley.html', 'about.html']],
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rx = (term) => new RegExp(`(^|[^\\w-])(${esc(term)})(?![\\w-])`, 'i');
const hash = (s) => {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};

/** Inserts one anchor at the first match, in text only — never in a tag or an <a>. */
function insert(fragment, term, href, absolute) {
  const parts = fragment.split(/(<[^>]+>)/);
  let depth = 0;
  for (let i = 0; i < parts.length; i += 1) {
    if (i % 2) {
      if (/^<a\b/i.test(parts[i])) depth += 1;
      else if (/^<\/a>/i.test(parts[i])) depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth) continue;
    const m = rx(term).exec(parts[i]);
    if (!m) continue;
    const to = absolute ? `${LIVE}/${href}` : href;
    parts[i] =
      parts[i].slice(0, m.index) + m[1] + `<a href="${to}">${m[2]}</a>` + parts[i].slice(m.index + m[0].length);
    return parts.join('');
  }
  return null;
}

/** The first term present in BOTH the visible answer and the markup's answer. */
function pick(visible, schema, self, question) {
  for (const [term, href] of TERMS) {
    if (href === self || !PAGES.has(href)) continue;
    if (rx(term).test(visible) && rx(term).test(schema)) return [term, href];
  }
  for (const [term, options] of GENERIC) {
    const usable = options.filter((h) => h !== self && PAGES.has(h));
    if (!usable.length) continue;
    if (rx(term).test(visible) && rx(term).test(schema)) {
      return [term, usable[hash(question) % usable.length]];
    }
  }
  return null;
}

let files = 0;
let total = 0;
let linked = 0;
const targets = new Map();

for (const name of [...PAGES].sort()) {
  const file = path.join(ROOT, name);
  const original = fs.readFileSync(file, 'utf8');
  if (!original.includes('FAQPage')) continue;

  // ---- pass 1: decide, touching nothing ----
  const plans = new Map();
  for (const [, json] of original.matchAll(
    /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    let doc;
    try {
      doc = JSON.parse(json);
    } catch {
      continue; // leave anything unparsable exactly as it is
    }
    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== 'object') return;
      if (node['@type'] === 'FAQPage') {
        for (const q of node.mainEntity ?? []) {
          total += 1;
          const answer = q.acceptedAnswer?.text;
          if (!answer || answer.includes('<a ') || plans.has(q.name)) continue;

          const hit = new RegExp(
            `(?:<h[2-6][^>]*>|<p class="pillar-faq-q">)\\s*${esc(q.name)}\\s*(?:</h[2-6]>|</p>)\\s*` +
              `<p(?: class="pillar-faq-a")?[^>]*>([\\s\\S]*?)</p>`,
            'i',
          ).exec(original);
          if (!hit) continue;

          const chosen = pick(hit[1], answer, name, q.name);
          if (!chosen) continue;

          const para = insert(hit[1], chosen[0], chosen[1], false);
          const marked = insert(answer, chosen[0], chosen[1], true);
          if (!para || !marked) continue;

          plans.set(q.name, { was: hit[1], para, marked, href: chosen[1] });
        }
      }
      Object.values(node).forEach(walk);
    };
    walk(doc);
  }
  if (!plans.size) continue;

  // ---- pass 2: body first, outside <script> only ----
  //
  // An answer's text appears twice in the document — once in the paragraph a visitor
  // reads and once inside acceptedAnswer.text. Splitting on <script> keeps a plain
  // indexOf() from finding the copy inside the JSON and writing the anchor into the
  // structured data instead of the page.
  const segments = original.split(/(<script[\s\S]*?<\/script>)/i);
  for (let i = 0; i < segments.length; i += 2) {
    for (const plan of plans.values()) {
      const at = segments[i].indexOf(plan.was);
      if (at === -1) continue;
      segments[i] = segments[i].slice(0, at) + plan.para + segments[i].slice(at + plan.was.length);
    }
  }

  // ---- pass 3: the markup ----
  const out = segments
    .join('')
    .replace(
      /(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/gi,
      (block, open, json, close) => {
        let doc;
        try {
          doc = JSON.parse(json);
        } catch {
          return block;
        }
        let touched = false;
        const walk = (node) => {
          if (Array.isArray(node)) return node.forEach(walk);
          if (!node || typeof node !== 'object') return;
          if (node['@type'] === 'FAQPage') {
            for (const q of node.mainEntity ?? []) {
              const plan = plans.get(q.name);
              if (!plan) continue;
              q.acceptedAnswer.text = plan.marked;
              touched = true;
            }
          }
          Object.values(node).forEach(walk);
        };
        walk(doc);
        return touched ? open + JSON.stringify(doc) + close : block;
      },
    );

  if (out === original) continue;
  files += 1;
  linked += plans.size;
  for (const p of plans.values()) targets.set(p.href, (targets.get(p.href) ?? 0) + 1);
  if (!DRY) fs.writeFileSync(file, out);
}

console.log(`${DRY ? '[dry] ' : ''}${linked} of ${total} answers linked across ${files} pages`);
console.log(`${targets.size} distinct targets`);
console.log(
  [...targets].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${v}`).join('  '),
);
