#!/usr/bin/env node
/**
 * Brings every <title> under ~60 characters so Google stops truncating them,
 * and keeps og:title / twitter:title in lockstep.
 *
 * Why: 135 of 172 titles ran past the truncation point, almost entirely
 * because a brand suffix was appended sitewide — ' — Infinity Kitchens and
 * Baths | Prescott, AZ' is 45 characters on its own, so a 60-char budget was
 * spent on branding before the keyword got a look in.
 *
 * Three passes, in order:
 *   1. SKIP anything already <= LIMIT. Keeps the run idempotent and leaves the
 *      21 pages optimize-titles.mjs already tuned completely alone.
 *   2. OVERRIDES — hand-written titles for pages whose core phrase was itself
 *      too long, so no mechanical rule could save them.
 *   3. Mechanical — strip the known long suffix, then re-append the short brand
 *      only if it still fits. Where it doesn't, the brand drops: on a local
 *      service page 'Prescott, AZ' earns the characters and the brand doesn't,
 *      and Google frequently appends the site name itself anyway.
 *
 * Usage: node shorten-titles.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DRY = process.argv.includes('--dry');
const LIMIT = 60;
const BRAND = ' | Infinity Kitchens & Baths';

const LONG_SUFFIXES = [
  ' — Infinity Kitchens and Baths | Prescott, AZ',
  ' | Infinity Kitchens and Baths, Prescott AZ',
  ' — Infinity Kitchens and Baths',
  ' | Infinity Kitchens and Baths',
  ' | Infinity Kitchens & Baths',
];

// Pages whose core phrase exceeded the limit on its own. Kept in the page's own
// voice; 'How to Pick' is used over 'How to Choose' purely to buy 4 characters,
// and the how-to framing is retained rather than collapsing to 'Best X in Y',
// which would promise a ranking these buyer's guides don't contain.
const OVERRIDES = {
  'contact.html': 'Contact Us | Free In-Home Consult in Prescott, AZ',
  'va-bathroom-remodeling-grant.html': 'VA Bathroom Remodel Grants in Prescott, AZ: HISA, SAH, SHA',
  'tile-flooring.html': 'Tile Flooring in Prescott, AZ | Porcelain, Ceramic & Stone',
  'cabinet-refacing-vs-replacing.html': 'Cabinet Refacing vs. Replacing: Which Is Right for You?',
  'bathroom-remodel-timeline.html': 'How Long Does a Bathroom Remodel Take? Prescott Timeline',
  'best-aging-in-place-remodeler-yavapai-county.html': 'How to Pick an Aging-in-Place Remodeler in Yavapai County',
  'featured-in.html': 'In the Press | Infinity Kitchens & Baths',
  'small-bathroom-ideas.html': 'Small Bathroom Ideas: Make a Compact Bath Feel Bigger',
  'best-remodeling-contractor-prescott-valley.html': 'How to Pick the Best Remodeler in Prescott Valley, AZ',
  'kitchen-remodel-vs-refresh.html': 'Kitchen Remodel vs. Refresh: Which One Do You Need?',
  'aging-in-place-guide.html': 'Aging in Place Remodeling: A Guide for AZ Homeowners',
  'alcove-vs-freestanding-tub.html': 'Alcove vs. Freestanding Tub: Which Suits Your Bath?',
  'bathroom-design-trends-2026.html': 'Bathroom Design Trends 2026: What Prescott Is Choosing',
  'best-remodeling-contractor-dewey-humboldt.html': 'How to Pick the Best Remodeler in Dewey-Humboldt, AZ',
  'outdoor-kitchen-roi.html': 'Is an Outdoor Kitchen Worth It in Prescott, AZ?',
  'best-home-remodeling-contractor-prescott.html': 'How to Pick the Best Home Remodeler in Prescott, AZ',
  'shaker-vs-flat-panel-cabinets.html': 'Shaker vs. Flat vs. Raised Panel Cabinet Doors',
  'best-remodeling-contractor-chino-valley.html': 'How to Pick the Best Remodeler in Chino Valley, AZ',
  'downtown-prescott-remodeling.html': 'Historic Home Remodeling in Downtown Prescott, AZ',
  'quartzite-vs-quartz.html': 'Quartzite vs. Quartz Countertops: A Prescott Guide',
  'remodel-vs-renovation.html': "Remodel vs. Renovation: What's the Difference?",
  'bathroom-flooring-options.html': "Bathroom Flooring Options for Arizona's Climate",
  'bathroom-remodel-mistakes.html': 'Bathroom Remodel Mistakes to Avoid in Prescott, AZ',
  'best-walk-in-shower-installer-prescott.html': 'How to Pick the Best Walk-In Shower Installer in Prescott',
  'best-outdoor-kitchen-builder-prescott.html': 'How to Pick the Best Outdoor Kitchen Builder in Prescott',
  'best-remodeling-contractor-cottonwood.html': 'How to Pick the Best Remodeler in Cottonwood, AZ',
  'garage-conversion-vs-home-addition.html': 'Garage Conversion vs. Home Addition: Cost & Permits',
  'prescott-lakes-remodeling.html': 'Kitchen & Bath Remodeling in Prescott Lakes, AZ',
  'best-ada-bathroom-remodeler-prescott.html': 'How to Pick the Best ADA Bathroom Remodeler in Prescott',
  'home-remodeling-checklist.html': 'Home Remodeling Checklist: What to Do Before Day One',
  'kitchen-lighting-ideas.html': 'Kitchen Lighting Ideas: A Layered Design Guide',
  'yavapai-hills-remodeling.html': 'Kitchen & Bath Remodeling in Yavapai Hills, AZ',
};

const decode = (s) => s
  .replace(/&amp;/g, '&').replace(/&#x27;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&nbsp;/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

// Only & needs escaping: titles here carry no double quotes, and a literal
// apostrophe is valid in both element text and a double-quoted attribute.
const encode = (s) => s.replace(/&/g, '&amp;');

function shorten(file, current) {
  if (OVERRIDES[file]) return OVERRIDES[file];
  let core = current;
  for (const s of LONG_SUFFIXES) {
    if (core.endsWith(s)) { core = core.slice(0, -s.length); break; }
  }
  core = core.replace(/[\s—|·-]+$/, '').trim();
  return core.length + BRAND.length <= LIMIT ? core + BRAND : core;
}

const files = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let changed = 0, skipped = 0;
const stillLong = [];

/**
 * Replaces a meta tag's content value, backreferencing the opening quote so a
 * literal apostrophe inside the value can't terminate the match early. A naive
 * [^"']* stops at the first apostrophe and mangles the tail.
 */
function setMeta(html, attr, name, value) {
  const re = new RegExp(
    `(<meta[^>]+${attr}=["']${name}["'][^>]*content=)(["'])[\\s\\S]*?\\2`,
    'i',
  );
  return html.replace(re, `$1$2${value}$2`);
}

for (const file of files) {
  const abs = path.join(ROOT, file);
  const html = readFileSync(abs, 'utf8');
  const tm = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!tm) continue;

  const current = decode(tm[1]);
  const needsShortening = current.length > LIMIT || OVERRIDES[file];
  const next = needsShortening ? shorten(file, current) : current;
  if (next.length > LIMIT) stillLong.push([file, next.length, next]);

  // Always resync title / og:title / twitter:title to the SAME value, even when
  // the title itself is unchanged — that makes the pass self-healing, so any
  // existing drift between the three is corrected rather than preserved.
  const enc = encode(next);
  let out = html.replace(/(<title[^>]*>)[\s\S]*?(<\/title>)/i, `$1${enc}$2`);
  out = setMeta(out, 'property', 'og:title', enc);
  out = setMeta(out, 'name', 'twitter:title', enc);

  if (out !== html) {
    if (!DRY) writeFileSync(abs, out);
    changed++;
    if (next !== current) {
      console.log(`${String(current.length).padStart(3)} → ${String(next.length).padStart(2)}  ${file}`);
      console.log(`        ${next}`);
    } else {
      console.log(`  resync og/twitter  ${file}`);
    }
  } else {
    skipped++;
  }
}

console.log('');
console.log(`${DRY ? '[dry] would change' : 'changed'}: ${changed}    already fine (skipped): ${skipped}`);
if (stillLong.length) {
  console.error(`\nSTILL OVER ${LIMIT} — needs a hand-written OVERRIDE:`);
  for (const [f, n, t] of stillLong) console.error(`  ${n}  ${f}\n      ${t}`);
  process.exit(1);
}
console.log(`Every title is now <= ${LIMIT} chars. og:title and twitter:title updated to match.`);
