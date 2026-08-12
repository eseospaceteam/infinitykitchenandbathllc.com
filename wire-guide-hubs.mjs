#!/usr/bin/env node
/**
 * Wires the 8 guide hubs in both directions:
 *   blog.html    -> a category grid above the post cards
 *   each guide   -> a .hub-uplink bar under the hero, pointing at its category
 *   sitemap.xml  -> the 8 hub URLs
 *
 * Matches the .hub-uplink convention wire-hubs.mjs already established.
 * Idempotent. Dry run unless --apply.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { HUBS } from "./build-guide-hubs.mjs";

const APPLY = process.argv.includes("--apply");
const BASE = "https://www.infinitykitchenandbathllc.com";
const buf = new Map();
const read = (f) => buf.get(f) ?? readFileSync(f, "utf8");
const set = (f, s) => buf.set(f, s);
const log = [];

/* Rebuild the same buckets build-guide-hubs.mjs computed. */
const NOT_GUIDES = new Set(
  readFileSync("build-guide-hubs.mjs", "utf8")
    .match(/const NOT_GUIDES = new Set\(\[([\s\S]*?)\]\)/)[1]
    .match(/"([^"]+)"/g)
    .map((s) => s.slice(1, -1))
);
const isCityOrService = (s) =>
  /^(kitchen|bathroom)-remodeling-[a-z-]+\.html$/.test(s) ||
  /^(walk-in-showers|tub-to-shower|ada-bathroom|aging-in-place)-[a-z-]+\.html$/.test(s) ||
  /-remodeling\.html$/.test(s);

const hubSlugs = new Set(HUBS.map((h) => h.slug));
const guides = readdirSync(".")
  .filter((f) => f.endsWith(".html") && !NOT_GUIDES.has(f) && !isCityOrService(f) && !hubSlugs.has(f))
  .sort();

const owner = new Map();
for (const g of guides) {
  const h = HUBS.find((x) => x.match(g));
  if (h) owner.set(g, h);
}

/* --- 1. uplink on each guide ------------------------------------------- */
let up = 0;
for (const [g, hub] of owner) {
  let h = read(g);
  if (h.includes('class="hub-uplink"')) { continue; }
  const mainOpen = h.indexOf("<main");
  if (mainOpen < 0) { log.push(`MISS  ${g} — no <main>`); continue; }
  const heroEnd = h.indexOf("</section>", mainOpen);
  if (heroEnd < 0) { log.push(`MISS  ${g} — no hero section`); continue; }
  const at = heroEnd + "</section>".length;
  const bar = `\n<div class="hub-uplink"><div class="container"><p>Part of our <a href="${hub.slug}"><strong>${hub.h1}</strong></a> — see all ${
    [...owner.values()].filter((x) => x.slug === hub.slug).length
  } guides in this category.</p></div></div>\n`;
  set(g, h.slice(0, at) + bar + h.slice(at));
  up++;
}
log.push(`uplink on ${up} guide page(s)`);

/* --- 2. blog.html category grid ---------------------------------------- */
{
  const file = "blog.html";
  let h = read(file);
  if (h.includes("wk4:guidehubs")) log.push(`skip  ${file}`);
  else {
    const cards = HUBS.map((x) => {
      const n = [...owner.values()].filter((y) => y.slug === x.slug).length;
      return `<a href="${x.slug}" style="display:block;padding:1.1rem 1.25rem;border:1px solid #E5E7EB;border-radius:8px;text-decoration:none;">
        <strong style="display:block;margin-bottom:0.3rem;">${x.h1}</strong>
        <span style="color:var(--gray-500);font-size:0.92rem;">${n} guides</span></a>`;
    }).join("");
    const block = `
<!-- wk4:guidehubs -->
<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:960px;">
    <div style="text-align:center;margin-bottom:1.75rem;">
      <span class="eyebrow">Browse by Category</span>
      <h2>The Guide Library</h2>
      <p style="color:var(--gray-500);max-width:660px;margin:0.75rem auto 0;">${guides.length} guides, grouped so you can find the one you need rather than scrolling the whole list.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:0.85rem;">${cards}</div>
  </div>
</section>
<!-- /wk4:guidehubs -->
`;
    const mainOpen = h.indexOf("<main");
    const heroEnd = h.indexOf("</section>", mainOpen) + "</section>".length;
    set(file, h.slice(0, heroEnd) + block + h.slice(heroEnd));
    log.push(`wire  ${file} + ${HUBS.length}-category grid`);
  }
}

/* --- 3. sitemap --------------------------------------------------------- */
{
  const file = "sitemap.xml";
  let x = read(file);
  if (x.includes("wk4:guidehub-sitemap")) log.push(`skip  ${file}`);
  else {
    const urls = HUBS.map(
      (h) =>
        `  <url>\n    <loc>${BASE}/${h.slug}</loc>\n    <lastmod>2026-08-12</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    ).join("\n");
    set(file, x.replace("</urlset>", `\n  <!-- wk4:guidehub-sitemap ═══ GUIDE CATEGORY HUBS ═══ -->\n${urls}\n\n</urlset>`));
    log.push(`wire  ${file} +${HUBS.length} URLs`);
  }
}

for (const l of log) console.log("  " + l);
console.log(`\n${buf.size} file(s) ${APPLY ? "written" : "would change"}`);
if (APPLY) for (const [f, s] of buf) writeFileSync(f, s);
else console.log("  (dry run — pass --apply to write)");
