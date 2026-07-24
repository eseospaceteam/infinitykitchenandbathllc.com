/**
 * Two content fixes requested by the client (2026-07-24):
 *
 *  1. Retire the stick-frame construction photo. It was used 78x across 30 pages
 *     (heroes, service cards, blog cards, gallery) and reads as a building site
 *     rather than finished work. Rotates three finished whole-home photos
 *     deterministically so pages don't all end up identical.
 *
 *  2. Add an ADA Bathroom Remodeling service card to services.html. The page
 *     ada-bathroom-remodeling.html already exists but was never surfaced as a
 *     service — "Aging in Place" was standing in for it.
 *
 * Idempotent. Run: node fix-services-content.mjs
 */
import { readFileSync, writeFileSync, globSync } from "node:fs";

const CDN = "https://www.infinitykitchenandbathllc.com/wp-content/uploads/";
const OLD = "2024/12/Whole-house-remodel-by-Infinity-Kitchen-and-Bath.jpg";
const NEW = [
  "2025/03/Walker-Whole-House.jpg",
  "2023/01/whole-home-remodeling-in-prescott-az.jpg",
  "2023/01/prescott-az-whole-house-remodeling.jpg",
];

// --- 1. sweep the framing photo ---
let pages = 0, hits = 0;
for (const f of globSync("**/*.html", { cwd: process.cwd() })) {
  const src = readFileSync(f, "utf8");
  if (!src.includes(OLD)) continue;
  let n = 0;
  // Rotate per occurrence, offset by filename so different pages start differently.
  const seed = [...f].reduce((a, c) => a + c.charCodeAt(0), 0);
  const out = src.split(OLD).reduce((acc, part, i, arr) =>
    i === arr.length - 1 ? acc + part : acc + part + NEW[(seed + n++) % NEW.length], "");
  writeFileSync(f, out);
  pages++; hits += n;
}
console.log(`framing photo replaced ${hits}x across ${pages} page(s)`);

// --- 2. ADA bathroom service card on services.html ---
const F = "services.html";
let s = readFileSync(F, "utf8");
if (s.includes('href="ada-bathroom-remodeling.html" class="service-card')) {
  console.log(`${F}: ADA service card already present`);
} else {
  const ARROW = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 8a.5.5 0 01.5-.5h5.793L8.146 5.354a.5.5 0 11.708-.708l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L10.293 8.5H4.5A.5.5 0 014 8z"/></svg>';
  const card =
    `\n      <a href="ada-bathroom-remodeling.html" class="service-card fade-up stagger-7">\n` +
    `        <div class="service-card-img"><img src="${CDN}2026/06/marble-bathroom-remodel-ada-grab-bars.jpg" alt="ADA bathroom remodeling with grab bars in Prescott AZ"></div>\n` +
    `        <div class="service-card-body"><h3>ADA &amp; Accessible Bathrooms</h3><p>Roll-in and curbless showers, reinforced grab bars, comfort-height fixtures, and wider doorways — built to ADA guidance so the bathroom stays safe and usable for years.</p><span class="service-card-link">Learn More ${ARROW}</span></div>\n` +
    `      </a>`;

  // Insert after the Bathroom Vanities card (last card of the bathroom section).
  const anchor = '<a href="bathroom-vanities.html" class="service-card';
  const i = s.indexOf(anchor);
  if (i === -1) {
    console.log(`!! ${F}: could not find the bathroom-vanities card — add ADA manually`);
  } else {
    const end = s.indexOf("</a>", i) + 4;
    s = s.slice(0, end) + card + s.slice(end);
    writeFileSync(F, s);
    console.log(`${F}: added ADA & Accessible Bathrooms service card`);
  }
}
