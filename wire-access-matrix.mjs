#!/usr/bin/env node
/**
 * Wires the 36 accessibility service x city pages into the site both ways, so
 * none of them ships as an orphan:
 *
 *   parent service page  -> its 9 city pages
 *   west-valley.html     -> the 32 West Valley pages, grouped by service
 *   {city}-remodeling    -> that city's 4 accessibility pages
 *   prescott-remodeling  -> the 4 Prescott pages
 *   sitemap.xml          -> all 36 URLs
 *
 * Idempotent (marker-fenced). Dry run unless --apply.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { CITIES } from "./wv-city-data.mjs";
import { ACCESS_SERVICES } from "./access-service-data.mjs";

const APPLY = process.argv.includes("--apply");
const BASE = "https://www.infinitykitchenandbathllc.com";
const WV = Object.entries(CITIES);
const ALL = [...WV, ["prescott", { name: "Prescott" }]];
const SVC = Object.entries(ACCESS_SERVICES);

const buf = new Map();
const read = (f) => buf.get(f) ?? readFileSync(f, "utf8");
const set = (f, s) => buf.set(f, s);
const log = [];

/* --- 1. parent service page -> its city children ----------------------- */
for (const [svcSlug, svc] of SVC) {
  const file = svc.parent;
  let h = read(file);
  if (h.includes("wk4:cities")) { log.push(`skip  ${file}`); continue; }
  const pills = ALL.map(
    ([cs, c]) => `<a href="${svcSlug}-${cs}.html" class="btn btn-outline-dark btn-sm">${c.name}</a>`
  ).join("");
  const block = `
<!-- wk4:cities -->
<section class="section" style="background:#F9FAFB;">
  <div class="container">
    <div style="text-align:center;margin-bottom:1.5rem;">
      <span class="eyebrow">By City</span>
      <h2>${svc.label} Near You</h2>
      <p style="color:var(--gray-500);max-width:660px;margin:0.75rem auto 0;">Each city page covers the local permit authority, the housing stock we typically work in, and how we schedule that area.</p>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center;max-width:780px;margin:0 auto;">${pills}</div>
  </div>
</section>
<!-- /wk4:cities -->
`;
  const end = h.lastIndexOf("</main>");
  const cta = h.lastIndexOf("<section", end);
  const at = cta > 0 ? cta : end;
  set(file, h.slice(0, at) + block + h.slice(at));
  log.push(`wire  ${file} -> ${ALL.length} city pages`);
}

/* --- 2. west-valley hub -> the 32 WV pages ----------------------------- */
{
  const file = "west-valley.html";
  let h = read(file);
  if (h.includes("wk4:access")) log.push(`skip  ${file}`);
  else {
    const groups = SVC.map(([svcSlug, svc]) => {
      const links = WV.map(
        ([cs, c]) => `<a href="${svcSlug}-${cs}.html" class="btn btn-outline-dark btn-sm">${c.name}</a>`
      ).join("");
      return `<div style="margin-bottom:1.75rem;">
        <h3 style="margin-bottom:0.75rem;"><a href="${svc.parent}">${svc.label}</a></h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.6rem;">${links}</div>
      </div>`;
    }).join("");
    const block = `
<!-- wk4:access -->
<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:900px;">
    <div style="text-align:center;margin-bottom:1.75rem;">
      <span class="eyebrow">Accessibility &amp; Aging in Place</span>
      <h2>Accessible Bathrooms Across the West Valley</h2>
      <p style="color:var(--gray-500);max-width:680px;margin:0.75rem auto 0;">Sun City and Sun City West are age-restricted communities, and accessibility is the work those homes most often need. Every West Valley city has a page for each of these four services.</p>
    </div>
    ${groups}
  </div>
</section>
<!-- /wk4:access -->
`;
    const end = h.lastIndexOf("</main>");
    const cta = h.lastIndexOf("<section", end);
    set(file, h.slice(0, cta) + block + h.slice(cta));
    log.push(`wire  ${file} -> 32 accessibility pages`);
  }
}

/* --- 3. city hub -> that city's 4 pages -------------------------------- */
for (const [cs, c] of ALL) {
  const file = `${cs}-remodeling.html`;
  if (!existsSync(file)) { log.push(`MISS  ${file} — no city hub`); continue; }
  let h = read(file);
  if (h.includes("wk4:cityaccess")) { log.push(`skip  ${file}`); continue; }
  const links = SVC.map(
    ([svcSlug, svc]) => `<a href="${svcSlug}-${cs}.html" class="btn btn-outline-dark btn-sm">${svc.label}</a>`
  ).join("");
  const block = `
<!-- wk4:cityaccess -->
<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:860px;text-align:center;">
    <span class="eyebrow">Accessibility</span>
    <h2>Aging in Place in ${c.name}</h2>
    <p style="color:var(--gray-500);max-width:620px;margin:0.75rem auto 1.5rem;">Walk-in showers, tub conversions and accessible bathrooms, with the ${c.name} permit detail on each page.</p>
    <div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center;">${links}</div>
  </div>
</section>
<!-- /wk4:cityaccess -->
`;
  const end = h.lastIndexOf("</main>");
  const cta = h.lastIndexOf("<section", end);
  set(file, h.slice(0, cta) + block + h.slice(cta));
  log.push(`wire  ${file} -> 4 accessibility pages`);
}

/* --- 4. sitemap -------------------------------------------------------- */
{
  const file = "sitemap.xml";
  let x = read(file);
  if (x.includes("wk4:access-sitemap")) log.push(`skip  ${file}`);
  else {
    const today = "2026-08-12";
    const urls = [];
    for (const [svcSlug] of SVC)
      for (const [cs] of ALL)
        urls.push(
          `  <url>\n    <loc>${BASE}/${svcSlug}-${cs}.html</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
        );
    const block = `\n  <!-- wk4:access-sitemap ═══ ACCESSIBILITY x CITY ═══ -->\n${urls.join("\n")}\n`;
    set(file, x.replace("</urlset>", `${block}\n</urlset>`));
    log.push(`wire  ${file} +${urls.length} URLs`);
  }
}

for (const l of log) console.log("  " + l);
console.log(`\n${buf.size} file(s) ${APPLY ? "written" : "would change"}`);
if (APPLY) for (const [f, s] of buf) writeFileSync(f, s);
else console.log("  (dry run — pass --apply to write)");
