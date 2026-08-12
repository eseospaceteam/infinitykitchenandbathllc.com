#!/usr/bin/env node
/**
 * Week 3: take the 16 West Valley service x city pages from ~550-780 words of
 * body copy to roughly 2,000, with substance that is actually specific to the
 * jurisdiction rather than a token city-name swap.
 *
 * Adds, before the FAQ section:
 *   - Permits and inspections in {City}  (the differentiator; cites the authority)
 *   - The homes we work on in {City}     (build era and what it implies)
 *   - Community rules                    (Sun City / Sun City West only)
 *   - How we schedule {City} projects    (honest logistics, no implied local yard)
 *   - Sources                            (outbound citations; the site had none)
 *
 * Idempotent — fenced by <!-- wk3:depth --> and skipped if already present.
 * Dry run by default; --apply to write.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { CITIES, SERVICE, SOURCES_NOTE } from "./wv-city-data.mjs";

const APPLY = process.argv.includes("--apply");
const PHONE = "602-885-6998";
const log = [];
let written = 0;

const esc = (s) =>
  s.replace(/&(?!(?:amp|lt|gt|quot|#\d+);)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function permitsSection(c, sv) {
  const community = c.community
    ? `
    <h3 style="margin-top:1.75rem;">Community rules on top of the county permit</h3>
    <p>${c.community.note.replace(
      c.community.body,
      `<a href="${c.community.bodyUrl}" rel="nofollow noopener" target="_blank">${c.community.body}</a>`
    )}</p>`
    : "";
  return `
<section class="section">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Permits &amp; Inspections</span>
    <h2>Who issues a ${sv.label.toLowerCase()} remodel permit in ${c.name}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${c.permitNote}</p>
    <p>${sv.trades}</p>
    <p>${sv.scopeNote}</p>
    <p>We pull the permit and meet the inspector ourselves. You should not be the one learning ${
      c.incorporated ? "a municipal" : "the county"
    } submittal process in the middle of your own remodel — and a contractor who suggests skipping the permit on a job that needs one is telling you something useful about how they work.</p>
    ${community}
    <p style="margin-top:1.5rem;"><a href="${c.authorityUrl}" rel="nofollow noopener" target="_blank"><strong>${c.authorityShort}</strong></a> publishes the current requirements.</p>
  </div>
</section>`;
}

function homesSection(c, sv) {
  return `
<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Local Housing Stock</span>
    <h2>The ${c.name} homes we work in</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${c.era}</p>
    <p>${c.eraImplication}</p>
    <p>It is worth asking any ${c.name} contractor what they expect to find behind your walls before they quote. A number produced without that question is a guess with a decimal point on it.</p>
  </div>
</section>`;
}

function logisticsSection(c, sv) {
  return `
<section class="section">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">How We Work Here</span>
    <h2>Scheduling ${sv.label.toLowerCase()} work in ${c.name}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>Being straight about this converts better than dancing around it: our shop and showroom are in Prescott, and we hold a location in Avondale. ${c.localNote} ${
      c.name === "Avondale" ? "" : "You are not around the corner from us, and pretending otherwise would not survive your first phone call."
    }</p>
    <p>What that means in practice is that we do not do drop-ins, and we do not run a job with a rotating cast. We group ${c.name} work so crews are on site in continuous stretches rather than appearing for a morning and vanishing for three days. Materials are ordered, templated and staged before demolition starts, so the disruptive part of your project is as short as we can make it.</p>
    <p>The free consultation comes to you — we measure in your home, in ${c.name}, and quote from those measurements. If you would rather see and handle materials first, the Prescott showroom is open, but nothing about our process requires you to drive to it.</p>
    <p style="margin-top:1.25rem;">Call <a href="tel:6028856998">${PHONE}</a> for ${c.name} projects, or start on the <a href="west-valley.html">West Valley hub</a> to see every service and city we cover out here.</p>
  </div>
</section>`;
}

function sourcesSection(c) {
  const items = [
    `<li style="margin-bottom:0.5rem;"><a href="${c.authorityUrl}" rel="nofollow noopener" target="_blank">${c.authorityShort}</a> — permit requirements and applications for ${c.name}.</li>`,
  ];
  if (!c.incorporated) {
    items.push(
      `<li style="margin-bottom:0.5rem;"><a href="https://www.scfmd.az.gov/permits-applications" rel="nofollow noopener" target="_blank">Sun City Fire and Medical District</a> — fire and life-safety permits within the district.</li>`
    );
  }
  if (c.community) {
    items.push(
      `<li style="margin-bottom:0.5rem;"><a href="${c.community.bodyUrl}" rel="nofollow noopener" target="_blank">${c.community.body}</a> — community governance and member requirements.</li>`
    );
  }
  items.push(
    `<li style="margin-bottom:0.5rem;"><a href="https://roc.az.gov/" rel="nofollow noopener" target="_blank">Arizona Registrar of Contractors</a> — verify any contractor's licence, ours included (AZ ROC #339999).</li>`
  );
  return `
<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Sources</span>
    <h2>Check this yourself</h2>
    <div class="gold-divider" style="margin:1rem 0 1.25rem;"></div>
    <ul style="padding-left:1.25rem;margin:0 0 1rem;">${items.join("")}</ul>
    <p style="color:var(--gray-500);font-size:0.95rem;margin:0;">${SOURCES_NOTE}</p>
  </div>
</section>`;
}

for (const [slug, c] of Object.entries(CITIES)) {
  for (const svKey of ["kitchen", "bathroom"]) {
    const sv = SERVICE[svKey];
    const file = `${sv.slug}-${slug}.html`;
    if (!existsSync(file)) { log.push(`MISS  ${file} — not found`); continue; }
    let h = readFileSync(file, "utf8");
    if (h.includes("wk3:depth")) { log.push(`skip  ${file} (already deepened)`); continue; }

    // insert before the FAQ section so Q&A stays last before the CTA
    let anchor = h.search(/<section[^>]*>\s*(?:<div[^>]*>\s*)*<span class="eyebrow">FAQ<\/span>/i);
    if (anchor < 0) anchor = h.search(/<section[^>]*class="[^"]*faq/i);
    if (anchor < 0) {
      const m = [...h.matchAll(/<h2[^>]*>[^<]*Common Questions[^<]*<\/h2>/gi)];
      if (m.length) anchor = h.lastIndexOf("<section", m[0].index);
    }
    if (anchor < 0) { log.push(`MISS  ${file} — no FAQ anchor`); continue; }

    const block =
      `\n<!-- wk3:depth -->` +
      permitsSection(c, sv) +
      homesSection(c, sv) +
      logisticsSection(c, sv) +
      sourcesSection(c) +
      `\n<!-- /wk3:depth -->\n`;

    h = h.slice(0, anchor) + block + h.slice(anchor);
    if (APPLY) writeFileSync(file, h);
    written++;
    log.push(`deep  ${file}`);
  }
}

for (const l of log) console.log("  " + l);
console.log(`\n${written} page(s) ${APPLY ? "written" : "would change"}`);
if (!APPLY) console.log("  (dry run — pass --apply to write)");
