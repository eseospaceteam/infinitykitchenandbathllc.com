#!/usr/bin/env node
/**
 * Rewrites <title> and <meta name="description"> (plus their og:/twitter:
 * twins) on the priority pages from the Jul 24 2026 SEO report.
 *
 * Why: the site was pulling 274 impressions/day at a 0.42% CTR. Several of
 * these titles ran 90-108 characters, so Google truncated them mid-phrase and
 * the value proposition never reached the searcher. Every title below is under
 * ~60 chars with the primary keyword first; every description is under 155.
 *
 * Titles follow [Primary Keyword] | [Benefit/Differentiator].
 * Descriptions follow [Action verb] [service] [location]. [Proof]. [CTA].
 *
 * Idempotent. Usage: node optimize-titles.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DRY = process.argv.includes('--dry');

const PAGES = {
  // ---- Priority 1 list from the weekly report (ranked by impressions) ----
  'index.html': {
    t: 'Kitchen &amp; Bath Remodeling Prescott AZ | Free In-Home Quote',
    d: 'Remodel your kitchen or bath in Prescott, AZ with a family-owned team building since 2011. 5-star rated, ROC #339999. Free in-home quote: 928-800-1998.',
  },
  'lvp-vs-tile.html': {
    t: 'LVP vs Tile in Bathrooms: Cost, Durability &amp; Verdict',
    d: 'Compare LVP and tile flooring room by room — cost per sq ft, water resistance, and comfort underfoot. Straight answers from Prescott, AZ installers.',
  },
  'custom-countertops.html': {
    t: 'Custom Countertops Prescott AZ | Quartz &amp; Granite Installed',
    d: 'Get quartz, granite, and quartzite countertops in Prescott, AZ at factory-direct prices. Templated and installed by ROC #339999 pros. Free in-home quote.',
  },
  'groutless-vs-tile-shower.html': {
    t: 'Groutless vs Tile Shower: Which One Lasts Longer?',
    d: 'Groutless shower panels vs tile — real cost, weekly cleaning time, and lifespan compared by Prescott, AZ installers. See which fits your bathroom.',
  },
  'kitchen-remodeling.html': {
    t: 'Kitchen Remodeling Prescott AZ | Factory-Direct Pricing',
    d: 'Remodel your Prescott, AZ kitchen with custom cabinets, quartz counters, and islands. Family-owned since 2011, ROC #339999. Free in-home design consult.',
  },
  'outdoor-kitchen.html': {
    t: 'Outdoor Kitchens Prescott AZ | Built for Arizona Weather',
    d: 'Build a custom outdoor kitchen in Prescott, AZ — grill stations, stone counters, weatherproof cabinetry. ROC #339999, 5-star rated. Free in-home visit.',
  },
  'bathroom-remodeling.html': {
    t: 'Bathroom Remodeling Prescott AZ | Walk-In Showers &amp; More',
    d: 'Remodel your Prescott, AZ bathroom — walk-in showers, tub-to-shower conversions, vanities, ADA baths. 5-star rated since 2011. Free in-home quote.',
  },
  'south-prescott-remodeling.html': {
    t: 'South Prescott Remodeling | Older-Home Kitchen &amp; Bath Pros',
    d: "Kitchen and bath remodeling built for South Prescott's older homes and dated layouts. Licensed ROC #339999, 5-star rated. Free in-home quote.",
  },
  'kitchen-remodeling-glendale.html': {
    t: 'Kitchen Remodeling Glendale AZ | Cabinets &amp; Quartz Counters',
    d: 'Remodel your Glendale, AZ kitchen — custom cabinets, quartz countertops, backsplash. Licensed ROC #339999, factory-direct pricing. Call 602-885-6998.',
  },
  'quartz-vs-granite.html': {
    t: 'Quartz vs Granite Countertops: The Honest Comparison',
    d: 'Quartz vs granite for Arizona kitchens — price per sq ft, heat and stain resistance, resale value. Straight answers from working stone installers.',
  },
  'bathroom-remodeling-glendale.html': {
    t: 'Bathroom Remodeling Glendale AZ | Walk-In Shower Experts',
    d: 'Remodel your Glendale, AZ bathroom — walk-in showers, tub-to-shower conversions, vanities. Licensed ROC #339999, 5-star rated. Call 602-885-6998.',
  },
  'groutless-shower-walls.html': {
    t: 'Groutless Shower Walls: Pros, Cons &amp; Cost',
    d: 'Groutless shower walls explained — solid surface vs acrylic panels, real costs, and why they beat tile against Arizona hard water. ROC #339999 installers.',
  },
  'bathroom-remodel-cost.html': {
    t: 'Bathroom Remodel Cost Prescott AZ | 2026 Real Prices',
    d: 'What a bathroom remodel actually costs in Prescott, AZ in 2026 — real ranges by size, what drives the price, and how to budget. Free in-home quote.',
  },
  'tub-to-shower.html': {
    t: 'Tub-to-Shower Conversion Prescott AZ | Done in Days',
    d: 'Convert your tub to a walk-in shower in Prescott, AZ — low-threshold and groutless options with lifetime warranty. ROC #339999. Free in-home quote.',
  },
  'about.html': {
    t: 'About Infinity Kitchens and Baths | Prescott AZ Since 2011',
    d: "Meet the family-owned Prescott, AZ remodeler behind 15 years of kitchens and baths. 35+ years' experience, ROC #339999, 5-star rated. Free in-home visit.",
  },

  // ---- "Optimize existing" list from the content plan ----
  'tub-to-shower-conversion-cost.html': {
    t: 'Tub-to-Shower Conversion Cost 2026 | Real Prices',
    d: 'What a tub-to-shower conversion really costs in Prescott, AZ — price by shower type, install timeline, and what drives the quote. Free in-home estimate.',
  },
  'cabinet-refinishing-refacing.html': {
    t: 'Cabinet Refinishing &amp; Refacing Prescott AZ | Cost &amp; Timeline',
    d: 'Refinish, reface, or replace cabinets in Prescott and Prescott Valley, AZ. Compare cost, timeline, and durability. ROC #339999. Free in-home quote.',
  },
  'porcelain-vs-ceramic-tile.html': {
    t: 'Ceramic vs Porcelain Tile for Showers: Which Is Better?',
    d: 'Ceramic vs porcelain tile for showers — water absorption, durability, cost per sq ft, and what Prescott, AZ installers actually put in wet areas.',
  },
  'butcher-block-vs-quartz.html': {
    t: 'Butcher Block vs Quartz Countertops: Honest Comparison',
    d: 'Butcher block vs quartz countertops — upkeep, cost per sq ft, heat and water resistance. A straight comparison from working Prescott, AZ installers.',
  },
  'kitchen-remodeling-prescott-valley.html': {
    t: 'Kitchen Remodeling Prescott Valley AZ | Cabinets &amp; Quartz',
    d: 'Remodel your Prescott Valley, AZ kitchen — custom cabinets, quartz counters, backsplash. Glassford Hill to StoneRidge. ROC #339999. Call 928-800-1998.',
  },
  'bathroom-remodeling-sun-city-west.html': {
    t: 'Bathroom Remodeling Sun City West AZ | Walk-In Showers',
    d: 'Aging-in-place bathroom remodeling in Sun City West, AZ — curbless walk-in showers, grab bars, ADA baths. ROC #339999, 5-star. Call 602-885-6998.',
  },
};

// Strips entities so length checks reflect what a searcher actually sees.
const visible = (s) => s.replace(/&amp;/g, '&').replace(/&mdash;/g, '—').replace(/&#x27;/g, "'");

let changed = 0;
const warnings = [];

for (const [file, { t, d }] of Object.entries(PAGES)) {
  const p = path.join(ROOT, file);
  const original = readFileSync(p, 'utf8');
  let html = original;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
  html = html.replace(/(<meta name="description" content=")[\s\S]*?(">)/, `$1${d}$2`);
  html = html.replace(/(<meta property="og:title" content=")[\s\S]*?(">)/, `$1${t}$2`);
  html = html.replace(/(<meta name="twitter:title" content=")[\s\S]*?(">)/, `$1${t}$2`);
  html = html.replace(/(<meta property="og:description" content=")[\s\S]*?(">)/, `$1${d}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[\s\S]*?(">)/, `$1${d}$2`);

  const tl = visible(t).length;
  const dl = visible(d).length;
  if (tl > 60) warnings.push(`${file}: title ${tl} chars`);
  if (dl > 155) warnings.push(`${file}: description ${dl} chars`);

  if (html !== original) {
    if (!DRY) writeFileSync(p, html);
    changed++;
  }
  console.log(`${String(tl).padStart(3)}/${String(dl).padStart(3)}  ${file}`);
}

console.log(`\n${DRY ? '[dry run] ' : ''}${changed} page(s) updated`);
if (warnings.length) console.log('OVER LIMIT:\n  ' + warnings.join('\n  '));
else console.log('all titles <=60 and descriptions <=155 visible chars');
