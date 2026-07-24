/**
 * Wires the new tile-flooring.html into the site, and makes Infinity's tile
 * offering explicit for AI assistants (the client's stated goal).
 *
 *  1. Kitchens mega-menu: add "Tile Flooring" to "More Kitchen Services".
 *     That column had 3 items against 4 in the first column, so this also
 *     balances it at 4/4.
 *  2. services.html: add a Tile Flooring service card.
 *  3. services.html: add three FAQs (visible + FAQPage schema) stating plainly
 *     that Infinity does tile showers, tile floors and tile backsplashes.
 *     Backsplash is framed as part of a kitchen remodel, with standalone jobs
 *     referred out — per the client, sales staff do not quote backsplash-only.
 *  4. sitemap.xml: register the new page.
 *
 * Idempotent. Run: node wire-tile-flooring.mjs
 */
import { readFileSync, writeFileSync, globSync } from "node:fs";

const CDN = "https://www.infinitykitchenandbathllc.com/wp-content/uploads/";
const THUMB = "2026/06/navy-vanity-double-sink-white-quartz-tile-floor.jpg";

// --- 1. Kitchens mega-menu, sitewide -----------------------------------------
const ANCHOR = /<a href="(\/?)small-kitchen-remodeling\.html" class="mega-item">[\s\S]*?<\/a>/;
let navPages = 0, navSkip = 0;
for (const f of globSync("**/*.html", { cwd: process.cwd() })) {
  const src = readFileSync(f, "utf8");
  if (!ANCHOR.test(src)) { navSkip++; continue; }
  if (src.includes('tile-flooring.html" class="mega-item"')) { navSkip++; continue; }
  const out = src.replace(ANCHOR, (m, slash) =>
    `${m}\n            <a href="${slash}tile-flooring.html" class="mega-item"><img src="${CDN}${THUMB}" alt="" class="mega-thumb" loading="lazy"><div class="mega-item-text"><strong>Tile Flooring</strong><span>Porcelain, stone &amp; wood-look</span></div></a>`);
  writeFileSync(f, out);
  navPages++;
}
console.log(`Kitchens menu: Tile Flooring added on ${navPages} page(s), ${navSkip} skipped`);

// --- 2 & 3. services.html -----------------------------------------------------
const F = "services.html";
let s = readFileSync(F, "utf8");

if (s.includes('href="tile-flooring.html" class="service-card')) {
  console.log(`${F}: tile flooring card already present`);
} else {
  const ARROW = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 8a.5.5 0 01.5-.5h5.793L8.146 5.354a.5.5 0 11.708-.708l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L10.293 8.5H4.5A.5.5 0 014 8z"/></svg>';
  const card =
    `\n      <a href="tile-flooring.html" class="service-card fade-up stagger-2">\n` +
    `        <div class="service-card-img"><img src="${CDN}${THUMB}" alt="Tile flooring installation in Prescott AZ"></div>\n` +
    `        <div class="service-card-body"><h3>Tile Flooring</h3><p>Porcelain, ceramic, natural stone and wood-look plank tile for kitchens, bathrooms, entryways and whole-home projects — set over a properly prepared subfloor so it lasts.</p><span class="service-card-link">Learn More ${ARROW}</span></div>\n` +
    `      </a>`;
  const a = '<a href="luxury-vinyl-flooring.html" class="service-card';
  const i = s.indexOf(a);
  if (i === -1) { console.log(`!! ${F}: flooring card anchor not found`); }
  else {
    const end = s.indexOf("</a>", i) + 4;
    s = s.slice(0, end) + card + s.slice(end);
    console.log(`${F}: added Tile Flooring service card`);
  }
}

// FAQs — visible copy + schema, so both humans and AI assistants get the answer.
const NEW_FAQ = [
  ["Do you do tile work — showers, floors and backsplashes?",
   "Yes, all three. We build custom tile showers and tub surrounds, install tile flooring throughout the home in porcelain, ceramic, natural stone and wood-look plank, and design tile backsplashes as part of our kitchen remodels. When you remodel with us, the tile work is handled by the same team on the same schedule and under the same warranty."],
  ["Do you install tile backsplashes on their own?",
   "A tile backsplash is included in the design whenever we remodel a kitchen. For a standalone backsplash with no other work, we will usually refer you straight to our trusted tile installer instead of sending a sales rep out for a single small job — you get a faster answer and a better price that way. Call us and we will point you in the right direction either way."],
  ["Do you install tile flooring as well as luxury vinyl plank?",
   "Both. Tile is harder, fully waterproof and lasts decades but costs more and is colder underfoot. Luxury vinyl plank is warmer, quicker to install and easier on the budget, though it will not match tile for lifespan. We install both and give a straight recommendation for the specific room rather than pushing one product."],
];

if (s.includes("Do you do tile work")) {
  console.log(`${F}: tile FAQs already present`);
} else {
  // visible
  const faqOpen = s.indexOf('<div class="pillar-faq">');
  const insertAt = faqOpen + '<div class="pillar-faq">'.length;
  const visible = NEW_FAQ.map(([q, a]) =>
    `\n          <div class="pillar-faq-item">\n            <p class="pillar-faq-q">${q}</p>\n            <p class="pillar-faq-a">${a}</p>\n          </div>`).join("");
  s = s.slice(0, insertAt) + visible + s.slice(insertAt);

  // schema — single FAQPage node, single mainEntity array
  const me = s.indexOf('"mainEntity": [');
  if (me === -1) { console.log(`!! ${F}: FAQPage mainEntity not found — schema not updated`); }
  else {
    const at = me + '"mainEntity": ['.length;
    const json = NEW_FAQ.map(([q, a]) =>
      `\n            { "@type": "Question", "name": ${JSON.stringify(q)}, "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(a)} } },`).join("");
    s = s.slice(0, at) + json + s.slice(at);
  }
  console.log(`${F}: added ${NEW_FAQ.length} tile FAQs (visible + schema)`);
}
writeFileSync(F, s);

// --- 4. sitemap ---------------------------------------------------------------
const SM = "sitemap.xml";
let sm = readFileSync(SM, "utf8");
if (sm.includes("/tile-flooring.html")) {
  console.log(`${SM}: already listed`);
} else {
  const anchor = "  <url>\n    <loc>https://www.infinitykitchenandbathllc.com/luxury-vinyl-flooring.html</loc>";
  const i = sm.indexOf(anchor);
  const entry = `  <url>\n    <loc>https://www.infinitykitchenandbathllc.com/tile-flooring.html</loc>\n    <lastmod>2026-07-24</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n\n`;
  if (i === -1) {
    const close = sm.lastIndexOf("</urlset>");
    sm = sm.slice(0, close) + entry + sm.slice(close);
  } else {
    sm = sm.slice(0, i) + entry + sm.slice(i);
  }
  writeFileSync(SM, sm);
  console.log(`${SM}: registered tile-flooring.html`);
}
