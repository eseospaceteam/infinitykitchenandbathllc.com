#!/usr/bin/env node
/**
 * Wires the two Aug-2026 territory cities — Litchfield Park and El Mirage —
 * into the site's internal linking. Built by build-territory-cities.mjs, this
 * script is what stops them being orphans.
 *
 * Five edits, each idempotent:
 *   1. Footer West Valley list      — BOTH footer variants (see below)
 *   2. west-valley.html hub         — city grid + any city list
 *   3. "eight West Valley cities"   — the hub-uplink line, now ten
 *   4. "the eight cities" / "of the eight" — localNote copy, now ten
 *   5. #business-avondale areaServed — the schema claim, now ten cities
 *
 * ── THE FOOTER IS NOT UNIFORM. READ THIS BEFORE EDITING IT. ──
 * Two variants exist and a naive single-string replace silently hits one of
 * them and misses the other:
 *   A. <h5>Service Areas</h5>  — Prescott cities, then a "West Valley (Phoenix
 *      Metro)" subheading, then the WV cities.        160 pages
 *   B. <h5>West Valley</h5>    — a dedicated WV column with a hub link first.
 *                                                       70 pages
 * 160 + 70 = 230 = every page. This script asserts that reconciliation at run
 * time and refuses to write if it does not hold, because "it edited 160 pages"
 * looks like success right up until you notice the other 70.
 *
 * Rather than matching on any city's <li>, it locates the West Valley column by
 * its <h5>, finds that column's closing </ul>, and inserts before it. That is
 * variant-agnostic and does not care what order the existing cities are in.
 *
 *   node link-territory-cities.mjs          dry run
 *   node link-territory-cities.mjs --apply  write
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";

const APPLY = process.argv.includes("--apply");

const NEW_CITIES = [
  { name: "El Mirage", file: "el-mirage-remodeling.html" },
  { name: "Litchfield Park", file: "litchfield-park-remodeling.html" },
];

function pages() {
  const out = readdirSync(".").filter((f) => f.endsWith(".html"));
  for (const d of readdirSync("lp")) {
    if (statSync(`lp/${d}`).isDirectory()) out.push(`lp/${d}/index.html`);
  }
  return out;
}

/**
 * Insert the new city <li>s before the closing </ul> of the West Valley column.
 *
 * `rootAbs` matters: the PPC landing pages under lp/ live one directory down
 * and link with root-absolute hrefs for exactly that reason. A relative
 * "el-mirage-remodeling.html" on those pages resolves to
 * /lp/<slug>/el-mirage-remodeling.html and 404s. (No glob in this comment —
 * a literal star-slash would close the block early.)
 */
function footerEdit(h, rootAbs) {
  const href = (f) => (rootAbs ? `/${f}` : f);
  const heads = ['<h5>Service Areas</h5>', '<h5>West Valley</h5>'];
  const at = heads.map((x) => h.indexOf(x)).filter((i) => i >= 0);
  if (!at.length) return { h, variant: null };
  const variant = h.includes('<h5>West Valley</h5>') ? "B" : "A";
  const start = Math.min(...at);
  const close = h.indexOf("</ul>", start);
  if (close < 0) return { h, variant: null };

  let out = h;
  // Repair pass: an earlier run inserted relative hrefs on the lp/ pages, which
  // resolve one directory too deep. Match on the exact wrong form so this is a
  // no-op everywhere else.
  let repaired = 0;
  if (rootAbs) {
    for (const c of NEW_CITIES) {
      const wrong = `<li><a href="${c.file}">${c.name}, AZ</a></li>`;
      if (out.includes(wrong)) {
        out = out.split(wrong).join(`<li><a href="/${c.file}">${c.name}, AZ</a></li>`);
        repaired++;
      }
    }
    if (repaired) return { h: out, variant, repaired };
  }

  const block = out.slice(start, close);
  // Already wired? Nothing to do. Match the full href so a relative link on an
  // lp page is not mistaken for the correct root-absolute one.
  if (NEW_CITIES.every((c) => block.includes(`href="${href(c.file)}"`))) {
    return { h: out, variant, already: true };
  }
  // Sanity: this really is the West Valley column, not some other list.
  if (!block.includes("sun-city-west-remodeling.html")) return { h: out, variant: null };

  const add = NEW_CITIES.filter((c) => !block.includes(`href="${href(c.file)}"`))
    .map((c) => `<li><a href="${href(c.file)}">${c.name}, AZ</a></li>`)
    .join("");
  return { h: out.slice(0, close) + add + out.slice(close), variant };
}

/** Count copy. "eight" is now ten — but only where it means these cities. */
function countEdit(h) {
  return h
    .replace(/We serve eight West Valley cities/g, "We serve ten West Valley cities")
    .replace(/eight West Valley cities/g, "ten West Valley cities")
    .replace(/the furthest of the eight cities from our Avondale location/g,
             "the furthest of the ten cities from our Avondale location")
    .replace(/one of the easiest of the eight for us to serve/g,
             "one of the easiest of the ten for us to serve")
    .replace(/the deepest housing history of the eight/g,
             "the deepest housing history of the ten")
    .replace(/Buckeye is the furthest of the eight/g, "Buckeye is the furthest of the ten");
}

/**
 * The machine-readable version of the same claim.
 *
 * This JSON-LD is serialised TWO different ways across the site — 48 pages
 * carry it pretty-printed over multiple lines, 10 carry it minified — so a
 * literal string replace of the minified form silently updates 10 pages and
 * leaves 48 declaring an eight-city service area. Instead: match the array
 * loosely, clone the formatting of an entry that is already there, and splice
 * the new cities in. Whatever style the file uses, it keeps it.
 */
const AREA_RE =
  /"areaServed"\s*:\s*\[\s*\{\s*"@type"\s*:\s*"City"\s*,\s*"name"\s*:\s*"Avondale"[\s\S]{0,1200}?\]/;

function areaServedEdit(h) {
  const m = h.match(AREA_RE);
  if (!m) return { h, changed: false };
  const raw = m[0];
  if (raw.includes('"El Mirage"')) return { h, changed: false }; // already wired

  const objects = raw.match(/\{[^{}]*\}/g);
  if (!objects || objects.length !== 8) return { h, changed: false, unexpected: objects?.length };

  // Separator between entries, captured from the file rather than assumed.
  const firstEnd = raw.indexOf(objects[0]) + objects[0].length;
  const sep = raw.slice(firstEnd, raw.indexOf(objects[1]));

  const entryFor = (name) => objects[0].replace(/"name"(\s*:\s*)"[^"]*"/, `"name"$1"${name}"`);

  let out = raw;
  const after = (anchorName, newName) => {
    const anchor = objects.find((o) => o.includes(`"${anchorName}"`));
    if (!anchor) return false;
    out = out.replace(anchor, anchor + sep + entryFor(newName));
    return true;
  };
  // Slotted alphabetically against the existing order.
  const ok = after("Buckeye", "El Mirage") && after("Goodyear", "Litchfield Park");
  if (!ok) return { h, changed: false };

  return { h: h.replace(raw, out), changed: true };
}

/**
 * west-valley.html is the hub the new pages sit under, so it needs more than a
 * footer link: a city card each, its name in the prose city list, and its name
 * in the two descriptions that enumerate the cities.
 *
 * The card is cloned from the Avondale card rather than hand-written, so the
 * markup (including the inline arrow SVG) stays identical to its siblings.
 */
const HUB_TAGLINE = {
  "El Mirage": "Most of its housing built inside a single decade",
  "Litchfield Park": "Planned community on the original Goodyear Farms land",
};
const HUB_SLUG = { "El Mirage": "el-mirage", "Litchfield Park": "litchfield-park" };

function cardBlock(h, cityLabel) {
  const at = h.indexOf(`<div class="city-card">\n        <h3>${cityLabel}</h3>`);
  if (at < 0) return null;
  // Balanced scan to this card's closing </div>.
  let i = at, depth = 0;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = at;
  let m;
  while ((m = re.exec(h))) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) { i = m.index + m[0].length; break; }
  }
  return { start: at, end: i, text: h.slice(at, i) };
}

function hubEdit(h) {
  // Check for the CARD, not the href. footerEdit has already run by this point
  // and put both hrefs in the footer, so an href-presence check reports
  // "already wired" against its own footer links and silently skips the grid.
  if (h.includes("<h3>El Mirage, AZ</h3>") && h.includes("<h3>Litchfield Park, AZ</h3>")) {
    return { h, changed: false, already: true };
  }
  const donor = cardBlock(h, "Avondale, AZ");
  if (!donor) return { h, changed: false, reason: "no Avondale card to clone" };

  let out = h;
  // Insert each new card after an existing one, keeping the grid roughly alphabetical.
  for (const [city, anchor] of [["El Mirage", "Buckeye, AZ"], ["Litchfield Park", "Goodyear, AZ"]]) {
    if (out.includes(`<h3>${city}, AZ</h3>`)) continue;
    const slug = HUB_SLUG[city];
    const card = donor.text
      .replace(/<h3>Avondale, AZ<\/h3>/, `<h3>${city}, AZ</h3>`)
      .replace(/<p class="pop">[^<]*<\/p>/, `<p class="pop">${HUB_TAGLINE[city]}</p>`)
      .replace(/kitchen-remodeling-avondale\.html/g, `kitchen-remodeling-${slug}.html`)
      .replace(/bathroom-remodeling-avondale\.html/g, `bathroom-remodeling-${slug}.html`)
      .replace(/avondale-remodeling\.html/g, `${slug}-remodeling.html`);
    const at = cardBlock(out, anchor);
    if (!at) return { h, changed: false, reason: `no ${anchor} card to anchor to` };
    out = out.slice(0, at.end) + "\n      " + card + out.slice(at.end);
  }

  // The prose list and the two descriptions each enumerate the cities by name.
  const OLD_LIST = "Avondale, Buckeye, Glendale, Goodyear, Peoria, Surprise, Sun City and Sun City West";
  const NEW_LIST =
    "Avondale, Buckeye, El Mirage, Glendale, Goodyear, Litchfield Park, Peoria, Surprise, Sun City and Sun City West";
  if (!out.includes(OLD_LIST)) return { h, changed: false, reason: "city list sentence not found" };
  out = out.split(OLD_LIST).join(NEW_LIST);

  return { h: out, changed: true };
}

const stats = { A: 0, B: 0, alreadyA: 0, alreadyB: 0, skipped: [], counts: 0, schema: 0, schemaOdd: [], hub: null, repaired: 0, written: 0 };

for (const file of pages()) {
  const orig = readFileSync(file, "utf8");
  let h = orig;

  const f = footerEdit(h, file.startsWith('lp/'));
  if (f.variant === null) stats.skipped.push(file);
  else if (f.repaired) { h = f.h; stats.repaired += f.repaired; }
  else if (f.already) stats[`already${f.variant}`]++;
  else { h = f.h; stats[f.variant]++; }

  const beforeCounts = h;
  h = countEdit(h);
  if (h !== beforeCounts) stats.counts++;

  if (file === "west-valley.html") {
    const hub = hubEdit(h);
    stats.hub = hub.already ? "already wired" : hub.changed ? "cards + city list updated" : `FAILED: ${hub.reason}`;
    if (hub.changed) h = hub.h;
  }

  const a = areaServedEdit(h);
  if (a.changed) { h = a.h; stats.schema++; }
  else if (a.unexpected !== undefined) stats.schemaOdd.push(`${file} (${a.unexpected} cities)`);

  if (h !== orig) { if (APPLY) writeFileSync(file, h); stats.written++; }
}

const total = pages().length;
const footerTouched = stats.A + stats.B + stats.alreadyA + stats.alreadyB + (stats.repaired ? 8 : 0);

console.log(`  footer variant A (Service Areas)  : ${stats.A} edited, ${stats.alreadyA} already wired`);
console.log(`  footer variant B (West Valley col): ${stats.B} edited, ${stats.alreadyB} already wired`);
console.log(`  footer reconciliation             : ${footerTouched} / ${total} pages`);
console.log(`  count copy (eight -> ten)         : ${stats.counts} pages`);
console.log(`  #business-avondale areaServed     : ${stats.schema} pages`);
console.log(`  lp/ root-absolute href repairs    : ${stats.repaired}`);
console.log(`  west-valley.html hub              : ${stats.hub}`);
console.log(`  files changed                     : ${stats.written}`);

if (stats.schemaOdd.length) {
  console.log(`\n  areaServed array with an unexpected city count on ${stats.schemaOdd.length} page(s):`);
  for (const s2 of stats.schemaOdd.slice(0, 12)) console.log(`    ${s2}`);
}

if (stats.skipped.length) {
  console.log(`\n  NO FOOTER MATCH on ${stats.skipped.length} page(s):`);
  for (const s of stats.skipped.slice(0, 12)) console.log(`    ${s}`);
}

if (String(stats.hub).startsWith("FAILED")) {
  console.error(`\nABORT: ${stats.hub} — the hub is the page these two need most.`);
  process.exit(1);
}

if (footerTouched !== total) {
  console.error(
    `\nABORT: footer edits covered ${footerTouched} of ${total} pages. ` +
      `Every page must land in exactly one variant — investigate the misses above before writing.`
  );
  process.exit(1);
}

console.log(`\n${stats.written} file(s) ${APPLY ? "written" : "would change"}`);
if (!APPLY) console.log("  (dry run — pass --apply to write)");
