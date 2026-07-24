/**
 * Rebalance and clean up the Services mega-menu across all 169 pages.
 *
 * Problems fixed:
 *  1. Lopsided columns — dropping Home Additions + Garage Conversion/ADU left
 *     "Whole Home Projects" with 2 items against "Specialty Services" with 4,
 *     producing a large dead gap in the left column. Now 3 / 3.
 *  2. "Our Process" pointed at design-build.html — the exact same destination as
 *     "Design-Build Services" one column over. Now deep-links to the process
 *     section (#process anchor added to design-build.html by this script).
 *  3. "Our Process" reused the identical thumbnail as "Whole House Remodeling".
 *  4. Three thumbnails were wrong or unusable at 58px:
 *       Flooring & LVP  -> a vendor marketing infographic with banner text
 *       Laundry & Mudroom -> a living room (and a duplicate of the flooring art)
 *       Aging in Place  -> a low-res 316px washed-out shower, no accessibility cue
 *
 * Parses the existing items and re-emits them, so each page keeps its own href
 * form — LPs under /lp/ carry root-absolute links and must stay that way.
 * Idempotent and nav-scoped. Run: node fix-services-menu.mjs
 */
import { readFileSync, writeFileSync, globSync } from "node:fs";

const CDN = "https://www.infinitykitchenandbathllc.com/wp-content/uploads/";

// New thumbnail per item title. Chosen from the existing media library.
const THUMBS = {
  "Whole House Remodeling": "2023/01/whole-home-remodeling-in-prescott-az.jpg",
  "Design-Build Services":  "2026/06/modern-white-kitchen-remodel-gold-accents.jpg",
  "Our Process":            "2026/06/infinity-kitchen-bath-crew-demolition.jpg",
  "Laundry Room &amp; Mudroom": "2023/01/sink-installation-.jpg",
  "Flooring &amp; LVP":     "2024/12/Flooring-installation-by-Infinity-Kitchen-and-Bath.png",
  "Aging in Place":         "2026/06/marble-bathroom-remodel-ada-grab-bars.jpg",
};

const COL1 = ["Whole House Remodeling", "Design-Build Services", "Our Process"];
const COL2 = ["Laundry Room &amp; Mudroom", "Flooring &amp; LVP", "Aging in Place"];

const BLOCK = /<div class="mega-col">\s*<div class="mega-col-heading">Whole Home Projects<\/div>([\s\S]*?)<\/div>\s*<div class="mega-col">\s*<div class="mega-col-heading">Specialty Services<\/div>([\s\S]*?)<\/div>\s*<\/div>/;
const ITEM = /<a href="([^"]+)"[^>]*class="mega-item">[\s\S]*?<strong>([\s\S]*?)<\/strong><span>([\s\S]*?)<\/span>/g;

const item = (it) =>
  `<a href="${it.href}" class="mega-item"><img src="${CDN}${THUMBS[it.title]}" alt="" class="mega-thumb" loading="lazy"><div class="mega-item-text"><strong>${it.title}</strong><span>${it.desc}</span></div></a>`;

let changed = 0, skipped = 0, unmatched = 0;
for (const f of globSync("**/*.html", { cwd: process.cwd() })) {
  const src = readFileSync(f, "utf8");
  const m = src.match(BLOCK);
  if (!m) { skipped++; continue; }

  const items = {};
  for (const raw of [m[1], m[2]]) {
    let x;
    ITEM.lastIndex = 0;
    while ((x = ITEM.exec(raw))) items[x[2].trim()] = { href: x[1], title: x[2].trim(), desc: x[3].trim() };
  }

  const wanted = [...COL1, ...COL2];
  if (wanted.some((t) => !items[t])) {
    console.log(`  !! ${f}: missing ${wanted.filter((t) => !items[t]).join(", ")}`);
    unmatched++; continue;
  }

  // Point "Our Process" at the process section, preserving root-absolute form on LPs.
  const dbHref = items["Design-Build Services"].href.replace(/#.*$/, "");
  items["Our Process"].href = `${dbHref}#process`;

  const pad = "            ";
  const rebuilt =
    `<div class="mega-col">\n${pad}<div class="mega-col-heading">Whole Home Projects</div>\n` +
    COL1.map((t) => pad + item(items[t])).join("\n") +
    `\n          </div>\n          <div class="mega-col">\n${pad}<div class="mega-col-heading">Specialty Services</div>\n` +
    COL2.map((t) => pad + item(items[t])).join("\n") +
    `\n          </div>\n        </div>`;

  const out = src.replace(BLOCK, rebuilt);
  if (out !== src) { writeFileSync(f, out); changed++; }
}
console.log(`services menu rebuilt on ${changed} page(s); ${skipped} without the menu; ${unmatched} unmatched`);

// --- anchor target so "Our Process" lands on the right section ---
const DB = "design-build.html";
let db = readFileSync(DB, "utf8");
if (db.includes('id="process"')) {
  console.log(`${DB}: #process anchor already present`);
} else {
  const marker = '<section class="section-gray">\n  <div class="container">\n    <div style="text-align:center;max-width:680px;margin:0 auto 3rem;" class="fade-up">\n      <span class="eyebrow">How It Works</span>';
  if (db.includes(marker)) {
    db = db.replace(marker, marker.replace('<section class="section-gray">', '<section class="section-gray" id="process">'));
    writeFileSync(DB, db);
    console.log(`${DB}: added id="process" to the How It Works section`);
  } else {
    console.log(`!! ${DB}: process section not found — add id="process" manually`);
  }
}
