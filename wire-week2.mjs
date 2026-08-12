#!/usr/bin/env node
/**
 * Week 2 of the hierarchy plan: complete the hub-and-spoke grid.
 *
 *  1. Service hubs link all 13 city children, not 5 — adds the 8 West Valley cities.
 *  2. The 5 city hubs that link one service child now link both.
 *  3. services.html carries a visible service x city matrix.
 *  4. Hubs are dual-typed CollectionPage + Article.
 *
 * Idempotent: every insertion is fenced by an HTML marker and skipped if present.
 * Dry run by default; pass --apply to write.
 */
import { readFileSync, writeFileSync } from "node:fs";

const APPLY = process.argv.includes("--apply");

const WEST_VALLEY = [
  ["avondale", "Avondale"], ["buckeye", "Buckeye"], ["glendale", "Glendale"],
  ["goodyear", "Goodyear"], ["peoria", "Peoria"], ["surprise", "Surprise"],
  ["sun-city", "Sun City"], ["sun-city-west", "Sun City West"],
];
const YAVAPAI = [
  ["prescott-valley", "Prescott Valley"], ["chino-valley", "Chino Valley"],
  ["dewey-humboldt", "Dewey-Humboldt"], ["cottonwood", "Cottonwood"],
  ["sedona", "Sedona"],
];

const changed = new Map();
const read = (f) => changed.get(f) ?? readFileSync(f, "utf8");
const write = (f, s) => changed.set(f, s);
const log = [];

/* ---------- 1. service hub -> West Valley children ---------------------- */

function wvSection(service, label, pillClass) {
  const pills = WEST_VALLEY.map(
    ([slug, name]) =>
      `<a href="${service}-remodeling-${slug}.html" class="${pillClass}">${name}</a>`
  ).join("");
  return `
<!-- wk2:wv-cities -->
<section class="section" style="padding-top:0;">
  <div class="container">
    <div style="text-align:center;margin-bottom:1.75rem;">
      <span class="eyebrow">Phoenix West Valley</span>
      <h2>${label} in the West Valley</h2>
      <p style="color:var(--gray-500);max-width:680px;margin:0.75rem auto 0;">We also design and build throughout the Phoenix West Valley, working from our Prescott shop with an Avondale location. Start at the <a href="west-valley.html"><strong>West Valley hub</strong></a>, or go straight to your city.</p>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center;max-width:760px;margin:0 auto;">${pills}</div>
  </div>
</section>
<!-- /wk2:wv-cities -->
`;
}

for (const [file, service, label, pill] of [
  ["kitchen-remodeling.html", "kitchen", "Kitchen Remodeling", "area-pill"],
  ["bathroom-remodeling.html", "bathroom", "Bathroom Remodeling", "btn btn-outline-dark btn-sm"],
]) {
  let h = read(file);
  if (h.includes("wk2:wv-cities")) { log.push(`skip  ${file} (wv cities present)`); continue; }
  // anchor: end of the section that holds the Yavapai city links
  const anchor = h.indexOf(`${service}-remodeling-sedona.html`);
  if (anchor < 0) { log.push(`MISS  ${file} — no sedona anchor`); continue; }
  const end = h.indexOf("</section>", anchor) + "</section>".length;
  h = h.slice(0, end) + wvSection(service, label, pill) + h.slice(end);
  write(file, h);
  log.push(`wire  ${file} +8 West Valley city links`);
}

/* ---------- 2. city hub -> both service children ------------------------ */

for (const [slug, name] of YAVAPAI) {
  const file = `${slug}-remodeling.html`;
  let h = read(file);
  if (h.includes("wk2:both-services")) { log.push(`skip  ${file} (both services present)`); continue; }
  const bath = `bathroom-remodeling-${slug}.html`;
  const kitchen = `kitchen-remodeling-${slug}.html`;
  const i = h.indexOf(`href="${bath}"`);
  if (i < 0) { log.push(`MISS  ${file} — no bathroom callout`); continue; }
  const pStart = h.lastIndexOf("<p", i);
  const pEnd = h.indexOf("</p>", i) + "</p>".length;
  if (pStart < 0 || pEnd < pStart) { log.push(`MISS  ${file} — callout <p> not found`); continue; }
  const replacement =
    `<p style="margin:0;font-size:1.02rem;color:#1F2937;"><!-- wk2:both-services -->Planning one room in particular? We have dedicated pages for ` +
    `<a href="${kitchen}"><strong>Kitchen Remodeling in ${name}</strong></a> and ` +
    `<a href="${bath}"><strong>Bathroom Remodeling in ${name}</strong></a>.</p>`;
  h = h.slice(0, pStart) + replacement + h.slice(pEnd);
  write(file, h);
  log.push(`wire  ${file} now links both service children`);
}

/* ---------- 3. service x city matrix on services.html ------------------- */
{
  const file = "services.html";
  let h = read(file);
  if (h.includes("wk2:matrix")) {
    log.push(`skip  ${file} (matrix present)`);
  } else {
    const row = ([slug, name], region) =>
      `<tr><th scope="row" style="text-align:left;font-weight:600;padding:0.55rem 0.9rem;border-bottom:1px solid #E5E7EB;white-space:nowrap;"><a href="${slug}-remodeling.html">${name}</a></th>` +
      `<td style="padding:0.55rem 0.9rem;border-bottom:1px solid #E5E7EB;"><a href="kitchen-remodeling-${slug}.html">Kitchen</a></td>` +
      `<td style="padding:0.55rem 0.9rem;border-bottom:1px solid #E5E7EB;"><a href="bathroom-remodeling-${slug}.html">Bathroom</a></td>` +
      `<td style="padding:0.55rem 0.9rem;border-bottom:1px solid #E5E7EB;color:var(--gray-500);">${region}</td></tr>`;
    const rows =
      YAVAPAI.map((c) => row(c, "Yavapai County")).join("") +
      WEST_VALLEY.map((c) => row(c, "Phoenix West Valley")).join("");
    const matrix = `
<!-- wk2:matrix -->
<section class="section">
  <div class="container">
    <div style="text-align:center;margin-bottom:1.5rem;">
      <span class="eyebrow">Service Area Matrix</span>
      <h2>Every Service, Every City</h2>
      <p style="color:var(--gray-500);max-width:680px;margin:0.75rem auto 0;">Each city has its own kitchen and bathroom page with local permit information, typical home stock, and how we schedule work in that area.</p>
    </div>
    <div style="overflow-x:auto;max-width:860px;margin:0 auto;">
      <table style="border-collapse:collapse;width:100%;font-size:0.98rem;">
        <thead><tr>
          <th scope="col" style="text-align:left;padding:0.55rem 0.9rem;border-bottom:2px solid #111827;">City</th>
          <th scope="col" style="text-align:left;padding:0.55rem 0.9rem;border-bottom:2px solid #111827;">Kitchen</th>
          <th scope="col" style="text-align:left;padding:0.55rem 0.9rem;border-bottom:2px solid #111827;">Bathroom</th>
          <th scope="col" style="text-align:left;padding:0.55rem 0.9rem;border-bottom:2px solid #111827;">Region</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>
</section>
<!-- /wk2:matrix -->
`;
    const cta = h.lastIndexOf('<section class="cta-banner">');
    if (cta < 0) { log.push(`MISS  ${file} — no cta-banner anchor`); }
    else { write(file, h.slice(0, cta) + matrix + h.slice(cta)); log.push(`wire  ${file} + 13-city service matrix`); }
  }
}

/* ---------- 4. dual-type the hubs --------------------------------------- */

/* Matches the node build-hubs.mjs already emits on showers.html: a sibling
   CollectionPage in the @graph pointing at the page's own Service node. */
const HUBS = [
  ["kitchen-remodeling.html", "Kitchen Remodeling in Prescott, AZ"],
  ["bathroom-remodeling.html", "Bathroom Remodeling in Prescott, AZ"],
  ["walk-in-showers.html", "Walk-In Showers in Prescott, AZ"],
  ["aging-in-place.html", "Aging in Place Remodeling in Prescott, AZ"],
  ["prescott-remodeling.html", "Remodeling in Prescott, AZ"],
  ["tub-to-shower.html", "Tub-to-Shower Conversions in Prescott, AZ"],
];
const BASE = "https://www.infinitykitchenandbathllc.com";

for (const [file, name] of HUBS) {
  let h;
  try { h = read(file); } catch { log.push(`MISS  ${file} — not found`); continue; }
  if (h.includes('"CollectionPage"')) { log.push(`skip  ${file} (already CollectionPage)`); continue; }

  // Find the ld+json block that carries the Service node, and append beside it.
  const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let done = false;
  for (const b of blocks) {
    let data;
    try { data = JSON.parse(b[1]); } catch { continue; }
    const graph = data["@graph"];
    if (!Array.isArray(graph)) continue;
    const svc = graph.find((n) => n["@type"] === "Service");
    if (!svc) continue;
    const svcId = svc["@id"] ?? `${BASE}/${file}#service`;
    if (!svc["@id"]) svc["@id"] = svcId;
    graph.push({
      "@type": "CollectionPage",
      "@id": `${BASE}/${file}#webpage`,
      url: `${BASE}/${file}`,
      name,
      isPartOf: { "@id": `${BASE}/#website` },
      about: { "@id": svcId },
    });
    const rebuilt = `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
    h = h.slice(0, b.index) + rebuilt + h.slice(b.index + b[0].length);
    done = true;
    break;
  }
  if (!done) { log.push(`MISS  ${file} — no @graph with a Service node`); continue; }
  write(file, h);
  log.push(`type  ${file} -> + CollectionPage node`);
}

/* ---------- report / write ---------------------------------------------- */

for (const line of log) console.log("  " + line);
console.log(`\n${changed.size} file(s) ${APPLY ? "written" : "would change"}`);
if (APPLY) for (const [f, s] of changed) writeFileSync(f, s);
else console.log("  (dry run — pass --apply to write)");
