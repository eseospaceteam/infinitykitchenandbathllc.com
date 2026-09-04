#!/usr/bin/env node
/**
 * Wires our-process.html and accessible-remodeling.html into the site.
 *
 * A page nobody links is a page nobody reads. Both hubs were generated with
 * correct breadcrumbs and schema, but the site only routes to what its chrome
 * and its body copy point at — the seven guide hubs sat invisible for weeks on
 * exactly this failure.
 *
 * THREE PASSES, each with its own idempotency guard:
 *   1. footer  — "Our Process" into the Company column, after About Us.
 *   2. parent  — accessible-remodeling.html linked from the four accessibility
 *                service hubs and from services.html, so the cluster has a
 *                visible parent from inside the cluster.
 *   3. body    — our-process.html linked from about.html and design-build.html.
 *
 * GUARD SCOPING, the trap that bit the guides-hub wiring. Once a link is in the
 * footer it is on every page, so `if (html.includes(href))` is true everywhere
 * and a <main> edit silently skips on all 225 pages. Pass 2 and 3 therefore test
 * the <main> slice only; pass 1 tests the Company column only.
 *
 * FOOTER IS NOT UNIFORM. Two Company-column variants exist (208 pages with ten
 * links, 17 with eight). This anchors on the About Us <li>, which both carry,
 * and reports per-variant counts so a silent partial hit is visible.
 *
 * Usage: node wire-new-hubs.mjs [--apply]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const PROCESS_PAGE = "our-process.html";
const ACCESS_PAGE = "accessible-remodeling.html";

for (const f of [PROCESS_PAGE, ACCESS_PAGE]) {
  if (!existsSync(f)) { console.error(`Refusing to wire: ${f} does not exist.`); process.exit(1); }
}

const files = readdirSync(".").filter((f) => f.endsWith(".html"));
const mainOf = (h) => {
  const s = h.indexOf("<main");
  const e = h.indexOf("</main>");
  return s === -1 || e === -1 ? null : h.slice(s, e);
};

/* ------------------------------------------------- pass 1: footer Company */
/* Whitespace-tolerant on purpose: 208 pages inline the column on one line, the
   other 17 pretty-print it across several. An exact-string anchor matched only
   the first group and reported the rest as "no Company column". */
const COMPANY = /(<h5[^>]*>Company<\/h5>\s*<ul>)([\s\S]*?)(<\/ul>)/;
const ABOUT_LI = /(\s*)(<li><a href="about\.html">About Us<\/a><\/li>)/;

let footerAdded = 0, footerHad = 0, footerNoColumn = 0, footerNoAnchor = 0;
const writes = new Map();

for (const file of files) {
  const html = writes.get(file) ?? readFileSync(file, "utf8");
  const m = html.match(COMPANY);
  if (!m) { footerNoColumn++; continue; }
  if (m[2].includes(`href="${PROCESS_PAGE}"`)) { footerHad++; continue; }
  const anchor = m[2].match(ABOUT_LI);
  if (!anchor) { footerNoAnchor++; continue; }
  /* Reuse the anchor's own leading whitespace so the inserted <li> matches the
     surrounding formatting in both variants. */
  const list = m[2].replace(
    ABOUT_LI,
    `$1$2$1<li><a href="${PROCESS_PAGE}">Our Process</a></li>`
  );
  writes.set(file, html.replace(COMPANY, `$1${list}$3`));
  footerAdded++;
}

/* ------------------------------------------------ pass 1b: footer Services
   The accessibility parent needs chrome presence, not just five in-body links.
   It is the parent of 40 pages and the one specialism no Prescott competitor
   covers; reachable from six pages, it is a hub in name only.

   THREE variants here, not two (209 / 17 / 1), and they disagree about which
   services they list — only the 17-page variant omits aging-in-place. Anchoring
   on whole-house-remodeling.html because it is the one entry present in all
   three; the per-variant counts below have to add up to the page total. */
const SERVICES_COL = /(<h5[^>]*>Services<\/h5>\s*<ul>)([\s\S]*?)(<\/ul>)/;
const WHOLE_HOUSE_LI = /(\s*)(<li><a href="whole-house-remodeling\.html">[^<]*<\/a><\/li>)/;

let svcAdded = 0, svcHad = 0, svcNoColumn = 0, svcNoAnchor = 0;

for (const file of files) {
  const html = writes.get(file) ?? readFileSync(file, "utf8");
  const m = html.match(SERVICES_COL);
  if (!m) { svcNoColumn++; continue; }
  if (m[2].includes(`href="${ACCESS_PAGE}"`)) { svcHad++; continue; }
  if (!WHOLE_HOUSE_LI.test(m[2])) { svcNoAnchor++; continue; }
  const list = m[2].replace(
    WHOLE_HOUSE_LI,
    `$1$2$1<li><a href="${ACCESS_PAGE}">Accessible Remodeling</a></li>`
  );
  writes.set(file, html.replace(SERVICES_COL, `$1${list}$3`));
  svcAdded++;
}

/* --------------------------------- pass 2: parent link into the cluster */
const CLUSTER_PARENTS = {
  "walk-in-showers.html":
    `<p style="margin-top:1.25rem;">A walk-in shower is usually one part of a wider plan — see <a href="${ACCESS_PAGE}">accessible &amp; aging-in-place remodeling</a> for how it fits with grab-bar blocking, doorway widths and the rest of the house.</p>`,
  "tub-to-shower.html":
    `<p style="margin-top:1.25rem;">Converting the tub is often the first step rather than the only one — <a href="${ACCESS_PAGE}">accessible &amp; aging-in-place remodeling</a> covers what else is worth doing while the walls are open.</p>`,
  "ada-bathroom-remodeling.html":
    `<p style="margin-top:1.25rem;">For how these clearances fit alongside walk-in showers, tub conversions and whole-home changes, see <a href="${ACCESS_PAGE}">accessible &amp; aging-in-place remodeling</a>.</p>`,
  "aging-in-place.html":
    `<p style="margin-top:1.25rem;">The bathroom is where most aging-in-place projects start — <a href="${ACCESS_PAGE}">accessible &amp; aging-in-place remodeling</a> brings the four services and every city we cover into one place.</p>`,
  "services.html":
    `<p style="margin-top:1.25rem;">Accessibility work is our largest specialism and no other Prescott remodeler covers it in depth — see <a href="${ACCESS_PAGE}">accessible &amp; aging-in-place remodeling</a>.</p>`,
};

/* ------------------------------------- pass 3: process link into the body */
const PROCESS_PARENTS = {
  "about.html":
    `<p style="margin-top:1.25rem;">Wondering how a project actually runs day to day? <a href="${PROCESS_PAGE}">Our process</a> walks through all five stages, from the free in-home consult to the written warranty.</p>`,
  "design-build.html":
    `<p style="margin-top:1.25rem;">For the same five stages written from the homeowner's side — what happens, when, and who pulls the permit — see <a href="${PROCESS_PAGE}">our process</a>.</p>`,
};

/* Insert immediately before the LAST <section> inside <main>, which on every
   template here is the closing CTA. Anchoring on a specific CTA class does not
   generalise — the generated hubs use `cta-banner`, the older service pages use
   `section section-forest` — but "last section in main" holds for both, and it
   keeps the insert out of the hero and out of the footer. */
function injectBeforeCta(html, snippet) {
  const main = mainOf(html);
  if (main === null) return null;
  const cta = main.lastIndexOf("<section");
  if (cta === -1) return null;
  const abs = html.indexOf("<main") + cta;
  return html.slice(0, abs) + snippet + "\n" + html.slice(abs);
}

let bodyAdded = 0, bodyHad = 0;
const bodyProblems = [];

for (const [file, snippet] of [...Object.entries(CLUSTER_PARENTS), ...Object.entries(PROCESS_PARENTS)]) {
  if (!existsSync(file)) { bodyProblems.push(`${file}: does not exist`); continue; }
  const html = writes.get(file) ?? readFileSync(file, "utf8");
  const target = snippet.includes(ACCESS_PAGE) ? ACCESS_PAGE : PROCESS_PAGE;
  const main = mainOf(html);
  if (main === null) { bodyProblems.push(`${file}: no <main>`); continue; }
  /* Scope the guard to <main>. The footer pass above puts our-process.html on
     every page, so a whole-file check would skip every one of these. */
  if (main.includes(`href="${target}"`)) { bodyHad++; continue; }
  const out = injectBeforeCta(html, snippet);
  if (out === null) { bodyProblems.push(`${file}: no cta-banner anchor in <main>`); continue; }
  writes.set(file, out);
  bodyAdded++;
}

/* ------------------------------------------------------------- report/write */
console.log(`footer  added ${footerAdded}   already had ${footerHad}   no Company column ${footerNoColumn}   no About anchor ${footerNoAnchor}`);
console.log(`svccol  added ${svcAdded}   already had ${svcHad}   no Services column ${svcNoColumn}   no anchor ${svcNoAnchor}`);
if (svcAdded + svcHad + svcNoColumn + svcNoAnchor !== files.length) {
  console.error("WARNING: Services-column counts do not sum to the page total — a variant was missed.");
}
console.log(`body    added ${bodyAdded}   already had ${bodyHad}`);
if (bodyProblems.length) {
  console.error("\nBODY PASS PROBLEMS:");
  for (const p of bodyProblems) console.error("  " + p);
}
if (footerNoAnchor) console.error(`\nWARNING: ${footerNoAnchor} page(s) have a Company column but no About Us anchor — check the variant.`);

if (!APPLY) {
  console.log(`\n[dry] ${writes.size} file(s) would change. Pass --apply to write.`);
  process.exit(bodyProblems.length ? 1 : 0);
}

for (const [file, html] of writes) {
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(m[1]); } catch (e) {
      console.error(`ABORTED — ${file} JSON-LD would not parse: ${e.message}`);
      process.exit(1);
    }
  }
}
for (const [file, html] of writes) writeFileSync(file, html);
console.log(`\n${writes.size} file(s) written.`);
