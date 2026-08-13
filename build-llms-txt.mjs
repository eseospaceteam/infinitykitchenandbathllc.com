#!/usr/bin/env node
/**
 * Generates /llms.txt (structured index) and /llms-full.txt (full body text)
 * from the pages listed in sitemap.xml.
 *
 * Why: answer engines that respect llms.txt get a clean, categorised map of the
 * site instead of having to infer structure from 170 flat .html siblings at the
 * root. This is the same AEO layer boisebath.com ships, and it is the cheapest
 * way to hand a crawler the hierarchy our URLs don't express.
 *
 * Categories come from the site's slug convention, NOT from a default bucket —
 * anything that doesn't match a rule is listed at the end under UNCATEGORISED
 * and the script exits non-zero, so a new page can never be silently absorbed.
 *
 * Body text for llms-full.txt is taken from <main id="main"> only, so nav,
 * footer, promo bar and the estimate panel don't repeat on every page.
 *
 * Idempotent. Usage: node build-llms-txt.mjs [--dry]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DRY = process.argv.includes('--dry');
const ORIGIN = 'https://www.infinitykitchenandbathllc.com';

const BRAND = 'Infinity Kitchens and Baths';
const SUMMARY =
  'Family-owned kitchen and bathroom remodeling contractor based in Prescott, ' +
  'Arizona, serving Yavapai County and the West Valley of Phoenix. Building ' +
  'since 2011. Arizona ROC #339999. Free in-home consultations.';

// ---------------------------------------------------------------------------
// Category rules, evaluated in order. First match wins.
// ---------------------------------------------------------------------------
const CITIES = [
  'prescott-valley', 'chino-valley', 'dewey-humboldt', 'cordes-lakes',
  'williamson-valley', 'camp-verde', 'cottonwood', 'sedona', 'mayer',
  'sun-city-west', 'sun-city', 'avondale', 'buckeye', 'goodyear',
  'glendale', 'peoria', 'surprise', 'prescott',
  // Aug-2026 territory additions
  'litchfield-park', 'el-mirage',
];
const NEIGHBORHOODS = ['downtown-prescott', 'south-prescott', 'prescott-lakes', 'yavapai-hills'];

const RULES = [
  ['Start here', (s) => ['', 'index.html', 'services.html', 'contact.html'].includes(s)],
  ['Company & trust', (s) => [
    'about.html', 'our-team.html', 'reviews.html', 'gallery.html', 'featured-in.html',
    'faq.html', 'prescott-remodeling-faq.html', 'financing.html', 'warranties.html',
    'licensing-insurance.html', 'community.html', 'remodel-cost-calculator.html',
  ].includes(s)],
  ['Legal & accessibility', (s) => [
    'privacy-policy.html', 'terms-of-service.html', 'cookie-policy.html', 'accessibility.html',
  ].includes(s)],
  ['Neighborhood pages (Prescott)', (s) => NEIGHBORHOODS.some((n) => s === `${n}-remodeling.html`)],
  ['Service areas — regional hub', (s) => s === 'west-valley.html'],
  ['Guide categories', (s) => [
    'choosing-a-contractor.html', 'accessibility-guides.html', 'cost-guides.html',
    'comparison-guides.html', 'shower-guides.html', 'kitchen-guides.html',
    'bathroom-guides.html', 'planning-guides.html',
  ].includes(s)],
  // Matched against the real city list so aging-in-place-guide.html etc. fall through.
  ['Accessibility service in a specific city', (s) =>
    ['walk-in-showers', 'tub-to-shower', 'ada-bathroom', 'aging-in-place']
      .some((sv) => CITIES.some((c) => s === `${sv}-${c}.html`))],
  ['Service in a specific city', (s) => /^(kitchen|bathroom)-remodeling-[a-z-]+\.html$/.test(s)],
  ['Service areas — city hubs', (s) => CITIES.some((c) => s === `${c}-remodeling.html`)],
  ['Choosing a contractor', (s) => /^best-/.test(s)],
  ['Costs & budgeting', (s) => /(-cost|-costs|costs\.html|-roi)\.html$/.test(s)],
  ['Comparisons', (s) => /-vs-/.test(s)],
  ['Kitchen services', (s) => [
    'kitchen-remodeling.html', 'kitchen-cabinets.html', 'cabinet-refinishing-refacing.html',
    'custom-countertops.html', 'countertops.html', 'kitchen-backsplash.html',
    'backsplash-installation.html', 'small-kitchen-remodeling.html', 'outdoor-kitchen.html',
  ].includes(s)],
  ['Bathroom & shower services', (s) => [
    'bathroom-remodeling.html', 'master-bathroom.html', 'small-bathroom.html',
    'walk-in-showers.html', 'tub-to-shower.html', 'groutless-shower-systems.html',
    'tile-shower-installation.html', 'bathroom-vanities.html', 'showers.html',
    'steam-shower-installation.html', 'ada-bathroom-remodeling.html',
  ].includes(s)],
  ['Whole-home & specialty services', (s) => [
    'whole-house-remodeling.html', 'design-build.html', 'aging-in-place.html',
    'laundry-room-remodel.html', 'home-additions.html', 'garage-conversion-adu.html',
    'tile-flooring.html', 'luxury-vinyl-flooring.html',
  ].includes(s)],
  ['Costs & budgeting', (s) => s === 'bathroom-remodel-financing.html'],
  ['Guides & ideas', (s) => s === 'blog.html' || /(-ideas|-guide|-options|-trends-\d{4}|-timeline|-checklist|-mistakes|-planning|-grant)\.html$/.test(s)],
  ['Guides & ideas', (s) => /^(how-to-|what-is-|shower-grout|permit-)/.test(s)],
  // Topic guides whose slugs carry no signalling suffix.
  ['Guides & ideas', (s) => [
    'curbless-zero-entry-showers.html', 'two-tone-kitchen-cabinets.html',
    'aging-in-place-bathroom.html', 'groutless-shower-walls.html',
  ].includes(s)],
];

// ---------------------------------------------------------------------------
function slugsFromSitemap() {
  const xml = readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  return locs.map((u) => u.replace(ORIGIN, '').replace(/^\//, ''));
}

function meta(slug) {
  const file = slug === '' ? 'index.html' : slug;
  const abs = path.join(ROOT, file);
  if (!existsSync(abs)) return null;
  const html = readFileSync(abs, 'utf8');
  const decode = (s) => s
    .replace(/&amp;/g, '&').replace(/&#x27;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/\s+/g, ' ').trim();

  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1]);
  const desc = decode((html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) || [, ''])[1]);

  const mainM = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  let body = mainM ? mainM[1] : html;
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|h1|h2|h3|h4|h5|li|div|section|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  body = decode(body).replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n');
  return { title, desc, body };
}

const slugs = slugsFromSitemap();
const buckets = new Map();
const uncategorised = [];

for (const slug of slugs) {
  const m = meta(slug);
  if (!m) { uncategorised.push(`${slug}  (FILE MISSING)`); continue; }
  const rule = RULES.find(([, test]) => test(slug));
  if (!rule) { uncategorised.push(slug); continue; }
  const key = rule[0];
  if (!buckets.has(key)) buckets.set(key, []);
  buckets.set(key, [...buckets.get(key), { slug, ...m }]);
}

// Preserve rule order, de-duplicated (two rules share "Guides & ideas").
const ORDER = [...new Set(RULES.map((r) => r[0]))];

// --------------------------- llms.txt --------------------------------------
let idx = `# ${BRAND}\n\n> ${SUMMARY}\n\n`;
idx += `Prescott showroom: 928-800-1998 · West Valley: 602-885-6998\n`;
idx += `Free in-home consultation: ${ORIGIN}/contact.html\n\n`;
idx += `This site uses flat URLs; the hierarchy below is the real information\n`;
idx += `architecture, and matches the BreadcrumbList markup on every page.\n\n`;

for (const key of ORDER) {
  const rows = buckets.get(key);
  if (!rows?.length) continue;
  idx += `## ${key}\n\n`;
  for (const { slug, title, desc } of rows.sort((a, b) => a.slug.localeCompare(b.slug))) {
    const url = `${ORIGIN}/${slug}`;
    idx += `- [${title}](${url})${desc ? `: ${desc}` : ''}\n`;
  }
  idx += '\n';
}

// ------------------------- llms-full.txt -----------------------------------
let full = `# ${BRAND} — full site content\n\n> ${SUMMARY}\n\n`;
full += `Generated from ${slugs.length} pages. Source: ${ORIGIN}/sitemap.xml\n\n`;
for (const key of ORDER) {
  const rows = buckets.get(key);
  if (!rows?.length) continue;
  for (const { slug, title, desc, body } of rows.sort((a, b) => a.slug.localeCompare(b.slug))) {
    full += `\n${'='.repeat(78)}\n# ${title}\nURL: ${ORIGIN}/${slug}\nSection: ${key}\n`;
    if (desc) full += `Summary: ${desc}\n`;
    full += `${'='.repeat(78)}\n\n${body}\n`;
  }
}

const kb = (s) => `${(Buffer.byteLength(s, 'utf8') / 1024).toFixed(1)} KB`;
console.log(`pages indexed : ${slugs.length - uncategorised.length} of ${slugs.length}`);
for (const key of ORDER) {
  const n = buckets.get(key)?.length;
  if (n) console.log(`  ${String(n).padStart(3)}  ${key}`);
}
console.log(`\nllms.txt      : ${kb(idx)}`);
console.log(`llms-full.txt : ${kb(full)}`);

if (uncategorised.length) {
  console.error(`\nUNCATEGORISED (${uncategorised.length}) — add a rule, do not let these default:`);
  for (const s of uncategorised) console.error('  ' + s);
}

if (!DRY) {
  writeFileSync(path.join(ROOT, 'llms.txt'), idx);
  writeFileSync(path.join(ROOT, 'llms-full.txt'), full);
  console.log('\nWrote llms.txt + llms-full.txt');
} else {
  console.log('\n[dry] nothing written');
}

if (uncategorised.length) process.exit(1);
