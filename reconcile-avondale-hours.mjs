#!/usr/bin/env node
/**
 * Removes openingHoursSpecification from the Avondale branch business node.
 *
 * THE DEFECT. All 225 pages render "Avondale (Coming Soon)" in the footer, next
 * to the address and the 602 number. 58 of them simultaneously ship JSON-LD
 * declaring that same location open Monday-Friday 09:00-17:00 and Saturday
 * 10:00-14:00. The visible copy says the branch is not trading yet; the
 * structured data says it is open right now and tells Google when to send people.
 *
 * This is the same class of self-contradicting markup as the aggregateRating
 * that declared reviewCount 16 beside nine visible reviews, which was stripped
 * sitewide on 2026-08-12. add-avondale-location.mjs flagged it as an open item
 * in its own header and printed a reminder on every run; it was never resolved.
 *
 * WHY REMOVE THE HOURS RATHER THAN DROP "Coming Soon". Removing an assertion is
 * safe and reversible; asserting a location is open is a claim about the
 * business that only the owner can make, and getting it wrong sends someone to
 * a door that does not open yet. The site's own visible copy is the tiebreak,
 * and it says Coming Soon on all 225 pages.
 *
 * It also makes the site internally consistent: the six territory-city pages
 * built later by build-territory-cities.mjs (El Mirage, Litchfield Park) already
 * carry the Avondale node WITHOUT hours. The 58 are the outlier, not the rule.
 *
 * WHEN AVONDALE OPENS: restore hours in the AVONDALE_NODE literal in
 * add-avondale-location.mjs, drop "(Coming Soon)" from the footer, and re-run
 * that script. Do not do one without the other.
 *
 * Idempotent. Usage: node reconcile-avondale-hours.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const DRY = process.argv.includes('--dry');
const AV_SUFFIX = '#business-avondale';
const LD = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

const files = readdirSync('.').filter((f) => f.endsWith('.html'));
let changed = 0, already = 0, untouched = 0;
const problems = [];
const touched = [];

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  if (!html.includes(AV_SUFFIX)) { untouched++; continue; }

  let hit = false, had = false;
  const out = html.replace(LD, (whole, body) => {
    let data;
    try { data = JSON.parse(body); } catch { return whole; }
    if (!data || !Array.isArray(data['@graph'])) return whole;

    let dirty = false;
    for (const node of data['@graph']) {
      if (!node || typeof node !== 'object') continue;
      if (!String(node['@id'] ?? '').endsWith(AV_SUFFIX)) continue;
      had = true;
      if ('openingHoursSpecification' in node) {
        delete node.openingHoursSpecification;
        dirty = true;
      }
    }
    if (!dirty) return whole;
    hit = true;
    /* PRESERVE THE ORIGINAL FORMATTING. Most pages here carry the graph
       pretty-printed across ~290 lines; a blind JSON.stringify collapses each
       to one line and turns a two-line semantic fix into a 16,000-line diff
       that no reviewer can read and that buries the actual change. Re-emit in
       whichever style the page already used. */
    const pretty = /\n\s+"/.test(body);
    const replacement = pretty
      ? "\n" + JSON.stringify(data, null, 2) + "\n"
      : JSON.stringify(data);
    /* Replace the exact body slice, not a loose match — a page can carry more
       than one ld+json block and String.replace would take the first. */
    return whole.replace(body, replacement);
  });

  /* Never write a page whose structured data would stop parsing. */
  for (const m of out.matchAll(LD)) {
    try { JSON.parse(m[1]); } catch (e) { problems.push(`${file}: ${e.message}`); }
  }
  if (problems.length) break;

  if (hit) {
    if (!DRY) writeFileSync(file, out);
    changed++; touched.push(file);
  } else if (had) already++;
  else untouched++;
}

if (problems.length) {
  console.error('ABORTED — JSON-LD would not parse. Nothing written:');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}

console.log(`${DRY ? '[dry] would strip hours from' : 'stripped hours from'}: ${changed} page(s)`);
console.log(`already clean (node present, no hours): ${already}`);
console.log(`no Avondale node: ${untouched}`);
if (changed && DRY) console.log('  ' + touched.slice(0, 6).join(', ') + (touched.length > 6 ? ` … +${touched.length - 6}` : ''));
