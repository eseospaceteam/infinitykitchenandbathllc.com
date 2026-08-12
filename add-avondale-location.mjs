#!/usr/bin/env node
/**
 * Adds the Avondale location to structured data as a second business node.
 *
 * Why: 316 N Central Ave, Avondale AZ 85323 and 602-885-6998 appear in the
 * visible footer and contact copy of all 172 pages, but the only PostalAddress
 * in JSON-LD sitewide was Prescott. The entire West Valley NAP was invisible to
 * machines — no address, no phone, no area served — while the site markets eight
 * Phoenix-metro cities.
 *
 * SCOPE — deliberately not sitewide. The branch node goes on the 26 pages that
 * are actually about the West Valley (the regional hub, the 8 city hubs, the 16
 * service x city pages) plus contact.html, which lists both addresses. Putting
 * two LocalBusiness nodes on all 172 pages muddies which entity a page is about;
 * Prescott stays the sitewide primary.
 *
 * OPEN ITEMS, both deliberate:
 *   1. No `geo`. No Avondale coordinates exist anywhere in the repo and a
 *      precise-but-wrong lat/long is worse than none. Take the real values from
 *      the Avondale Google Business Profile and add them here.
 *   2. openingHoursSpecification is included per direction, mirroring Prescott
 *      (Mon-Fri 09:00-17:00, Sat 10:00-14:00). This ASSERTS THE LOCATION IS OPEN
 *      and currently contradicts the "Coming Soon" label rendered in the footer
 *      of all 172 pages. Those two must be reconciled: either the location is
 *      trading, in which case drop "Coming Soon" from the visible copy, or it is
 *      not, in which case remove the hours. Shipping both is the same class of
 *      self-contradicting markup as the reviewCount 16-vs-9 already fixed.
 *
 * Idempotent. Usage: node add-avondale-location.mjs [--dry] [--remove]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DRY = process.argv.includes('--dry');
const REMOVE = process.argv.includes('--remove');
const ORIGIN = 'https://www.infinitykitchenandbathllc.com';
const AV_ID = `${ORIGIN}/#business-avondale`;

const WV_CITIES = ['Avondale', 'Buckeye', 'Glendale', 'Goodyear', 'Peoria', 'Surprise', 'Sun City', 'Sun City West'];

const TARGETS = [
  'contact.html',
  'west-valley.html',
  ...['avondale', 'buckeye', 'glendale', 'goodyear', 'peoria', 'surprise', 'sun-city', 'sun-city-west']
    .map((c) => `${c}-remodeling.html`),
  ...['avondale', 'buckeye', 'glendale', 'goodyear', 'peoria', 'surprise', 'sun-city', 'sun-city-west']
    .flatMap((c) => [`kitchen-remodeling-${c}.html`, `bathroom-remodeling-${c}.html`]),
];

const AVONDALE_NODE = {
  '@type': 'HomeAndConstructionBusiness',
  '@id': AV_ID,
  name: 'Infinity Kitchens and Baths — Avondale',
  description:
    'Kitchen and bathroom remodeling for the West Valley of Phoenix, from the ' +
    'Avondale location of Infinity Kitchens and Baths. Licensed (AZ ROC #339999), bonded and insured.',
  url: `${ORIGIN}/west-valley.html`,
  telephone: '+1-602-885-6998',
  priceRange: '$',
  image: `${ORIGIN}/wp-content/uploads/2023/11/infinity-logo.png`,
  logo: `${ORIGIN}/wp-content/uploads/2023/11/infinity-logo.png`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '316 N Central Ave',
    addressLocality: 'Avondale',
    addressRegion: 'AZ',
    postalCode: '85323',
    addressCountry: 'US',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '14:00' },
  ],
  areaServed: WV_CITIES.map((name) => ({ '@type': 'City', name })),
  parentOrganization: { '@id': `${ORIGIN}/#business` },
};

const LD = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

let changed = 0, skipped = 0;
const missing = [], problems = [];

for (const file of TARGETS) {
  const abs = path.join(ROOT, file);
  if (!existsSync(abs)) { missing.push(file); continue; }
  const html = readFileSync(abs, 'utf8');
  let done = false;

  const out = html.replace(LD, (whole, body) => {
    if (done) return whole;
    let data;
    try { data = JSON.parse(body); } catch { return whole; }
    if (!data || !Array.isArray(data['@graph'])) return whole;
    const graph = data['@graph'];

    const at = graph.findIndex((n) => n && n['@id'] === AV_ID);
    if (REMOVE) {
      if (at === -1) return whole;
      graph.splice(at, 1);
    } else {
      if (at !== -1) {
        graph[at] = AVONDALE_NODE;           // refresh in place, keeps it idempotent
      } else {
        const main = graph.findIndex((n) => n && n['@id'] === `${ORIGIN}/#business`);
        graph.splice(main === -1 ? 0 : main + 1, 0, AVONDALE_NODE);
      }
    }
    done = true;
    return whole.replace(body, JSON.stringify(data));
  });

  for (const m of out.matchAll(LD)) {
    try { JSON.parse(m[1]); } catch (e) { problems.push(`${file}: ${e.message}`); }
  }
  if (problems.length) break;

  if (out !== html) { if (!DRY) writeFileSync(abs, out); changed++; }
  else skipped++;
}

if (problems.length) {
  console.error('ABORTED — JSON-LD would not parse. Nothing written:');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
if (missing.length) {
  console.error(`\nTARGET FILES MISSING (${missing.length}): ${missing.join(', ')}`);
}
console.log(`${DRY ? '[dry] would change' : REMOVE ? 'removed from' : 'changed'}: ${changed} pages   unchanged: ${skipped}`);
console.log(`target scope: ${TARGETS.length} West Valley pages + contact.html`);
if (!REMOVE) {
  console.log('\nreminders:');
  console.log('  · no `geo` — add real coordinates from the Avondale GBP');
  console.log('  · openingHoursSpecification asserts the location is OPEN, which');
  console.log('    contradicts the "Coming Soon" copy in the footer of 172 pages.');
  console.log('    Reconcile one way or the other before this ships to production.');
}
if (missing.length) process.exit(1);
