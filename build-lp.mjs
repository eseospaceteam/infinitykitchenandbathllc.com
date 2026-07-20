// Generates PPC landing pages that match the live site design (full nav + footer,
// site CSS classes, estimate-tab lead capture). noindex so they don't duplicate
// the SEO city pages. Nav + footer are pulled from a live reference page at build
// time (so they stay in sync), with links made root-absolute (pages live in /lp/).
// Output: lp/<slug>/index.html  ->  /lp/<slug>/
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";

const REF = readFileSync("bathroom-remodeling-avondale.html", "utf8");
const IMG = "https://www.infinitykitchenandbathllc.com/wp-content/uploads";

const PHONE = {
  avondale: { raw: "6028856998", display: "(602) 885-6998" },
  prescott: { raw: "9288001998", display: "(928) 800-1998" },
};

const GTAG = REF.slice(REF.indexOf("<!-- Google tag"), REF.indexOf("</script>", REF.indexOf("gtag('config'")) + 9);

// Make relative links/paths root-absolute (leave http, /, #, tel:, mailto:, data: alone).
function rootAbs(html) {
  return html.replace(/(href|src)="(?!https?:|\/|#|tel:|mailto:|data:)([^"]+)"/g, '$1="/$2"');
}

// Extract nav (nav + mobile-nav) and footer from the reference page, root-absolutize.
const NAV_RAW = REF.slice(REF.indexOf('<nav id="navbar"'), REF.indexOf('<section class="page-hero"'));
const NAV_ABS = rootAbs(NAV_RAW);
const FOOTER_ABS = rootAbs(REF.slice(REF.indexOf("<footer>"), REF.indexOf("</footer>") + 9));

function navFor(region) {
  if (region === "avondale") return NAV_ABS;
  // Prescott: swap the announce-bar region + phone (footer keeps both showrooms).
  return NAV_ABS
    .replace(/tel:6028856998/g, "tel:9288001998")
    .replace(/\(602\) 885-6998/g, "(928) 800-1998")
    .replace(/602-885-6998/g, "928-800-1998")
    .replace(/West Valley &bull; Maricopa County/g, "Prescott &bull; Yavapai County");
}

const BATH = {
  hero: `${IMG}/2026/06/luxury-marble-bathroom-tub-frameless-shower.jpg`,
  services: [
    ["Walk-In Showers", "/walk-in-showers.html", `${IMG}/2024/12/Solid-surface-shower-designed-by-Infinity-Kitchen-and-Bath.jpg`, "Barrier-free, low-maintenance walk-in showers built to fit your space."],
    ["Tub-to-Shower Conversion", "/tub-to-shower.html", `${IMG}/2024/12/Solid-surface-shower-designed-by-Infinity-Kitchen-and-Bath.jpg`, "Swap a rarely-used tub for a sleek, easy-access walk-in shower."],
    ["Groutless Shower Systems", "/groutless-shower-systems.html", `${IMG}/2024/12/Luxurious-solid-surface-shower-for-bathroom-reodeling.jpg`, "Solid-surface shower walls with no grout lines to scrub or reseal."],
    ["Tile &amp; Custom Showers", "/tile-shower-installation.html", `${IMG}/2024/11/tiled-bathroom-remodeling-with-glass-shower.jpg`, "Custom tile showers — patterns, niches, and benches set by hand."],
    ["Bathroom Vanities", "/bathroom-vanities.html", `${IMG}/2024/11/marbled-theme-bathroom-remodeling-with-his-and-hers-vanity.jpg`, "Single, double, and floating vanities with stone tops and real storage."],
    ["ADA &amp; Aging-in-Place", "/ada-bathroom-remodeling.html", `${IMG}/2025/03/bathroom-remodeling-2.jpg`, "Curbless showers, grab bars, and comfort-height fixtures for safe aging in place."],
  ],
};
const KITCHEN = {
  hero: `${IMG}/2026/06/modern-white-kitchen-remodel-gold-accents.jpg`,
  services: [
    ["Custom Cabinets", "/kitchen-cabinets.html", `${IMG}/2024/11/elegant-kitchen-remodeling.jpg`, "Custom and semi-custom cabinetry built and finished to fit your kitchen."],
    ["Countertops", "/custom-countertops.html", `${IMG}/2024/12/Quartz-countertop-by-Infinity-Kitchen-and-Bath.png`, "Quartz, granite, and solid-surface tops fabricated and installed to last."],
    ["Backsplash &amp; Tile", "/kitchen-backsplash.html", `${IMG}/2024/11/remodeled-kitchen-with-marble-countertops-and-more.jpg`, "Statement backsplashes and tile in finishes that tie your kitchen together."],
    ["Kitchen Flooring / LVP", "/luxury-vinyl-flooring.html", `${IMG}/2024/12/Flooring-installation-by-Infinity-Kitchen-and-Bath.png`, "Durable, waterproof luxury vinyl and tile flooring for busy kitchens."],
    ["Outdoor Kitchens", "/outdoor-kitchen.html", `${IMG}/2024/11/luxurious-kitchen-remodeling.jpg`, "Built-in grills, counters, and storage for Arizona outdoor living."],
    ["Small Kitchen Remodeling", "/small-kitchen-remodeling.html", `${IMG}/2025/03/Davtyan-kitchen-remodeling.jpg`, "Smart, space-saving layouts that make a compact kitchen work harder."],
  ],
};

function card(s) {
  return `<a href="${s[1]}" class="service-card"><div class="service-card-img"><img src="${s[2]}" alt="${s[0].replace(/&amp;/g, "and")}" loading="lazy"></div><div class="service-card-body"><h3>${s[0]}</h3><p>${s[3]}</p><span class="service-card-link">Learn More</span></div></a>`;
}
function faq(items) {
  return items.map((f) => `<div class="pillar-faq-item"><p class="pillar-faq-q">${f[0]}</p><p class="pillar-faq-a">${f[1]}</p></div>`).join("");
}

function page(cfg) {
  const ph = PHONE[cfg.region];
  const svc = cfg.kind === "bathroom" ? BATH : KITCHEN;
  const title = `${cfg.city} ${cfg.service} | Free Estimate | Infinity Kitchens and Baths`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${GTAG}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${cfg.metaDesc}">
  <meta name="robots" content="noindex, nofollow">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#1D5535">
  <link rel="canonical" href="https://www.infinitykitchenandbathllc.com/lp/${cfg.slug}/">
</head>
<body>
${navFor(cfg.region)}

<section class="page-hero" style="background-image:url('${svc.hero}');background-size:cover;background-position:center;">
  <div style="position:absolute;inset:0;background:linear-gradient(to right,#1B4332 0%,#1B4332 42%,rgba(27,67,50,0.55) 65%,transparent 100%);"></div>
  <div class="page-hero-inner" style="position:relative;">
    <span class="eyebrow">${cfg.service} &mdash; ${cfg.city}, AZ</span>
    <h1>${cfg.city} ${cfg.service}</h1>
    <p style="color:rgba(255,255,255,0.9);margin-top:0.9rem;font-size:1.05rem;max-width:560px;">${cfg.heroSub}</p>
    <div class="hero-actions" style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1.75rem;">
      <a href="/contact.html" class="btn btn-gold btn-lg">Get a Free Estimate</a>
      <a href="tel:${ph.raw}" class="btn btn-outline-light btn-lg">Call ${ph.display}</a>
    </div>
  </div>
</section>

<section class="section" style="padding:2.5rem 0 0;">
  <div class="container">
    <div style="max-width:920px;margin:0 auto;background:#F4FAF6;border-left:4px solid #2B7A42;border-radius:8px;padding:1.25rem 1.5rem;">
      <p style="margin:0;font-size:1.05rem;line-height:1.75;color:#1F2937;"><strong>Quick answer:</strong> ${cfg.quick}</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div style="max-width:820px;margin:0 auto;">
      <span class="eyebrow">${cfg.city}'s ${cfg.service} Specialists</span>
      <h2>${cfg.introH2}</h2>
      <div class="gold-divider"></div>
      ${cfg.intro}
    </div>
    <h2 style="text-align:center;margin-top:3.5rem;">${cfg.service} Services We Offer in ${cfg.city}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-top:2.5rem;">${svc.services.map(card).join("")}</div>
    <div style="text-align:center;margin-top:2.5rem;">
      <a href="/contact.html" class="btn btn-gold btn-lg">Get My Free Estimate</a>
    </div>
  </div>
</section>

<section class="section" style="background:var(--green-25,#F4FAF6);">
  <div class="container"><div style="max-width:820px;margin:0 auto;">
    <h2>Why ${cfg.city} Homeowners Choose Infinity</h2>
    <div class="gold-divider"></div>
    ${cfg.why}
    <p style="margin-top:1.5rem;">Prefer to talk it through? Call <a href="tel:${ph.raw}">${ph.display}</a> for a free, no-pressure consultation.</p>
  </div></div>
</section>

<section class="section" style="background:var(--green-25,#F4FAF6);">
  <div class="container">
    <div style="text-align:center;margin-bottom:2.5rem;"><span class="eyebrow">FAQ</span><h2>${cfg.service} in ${cfg.city} — Common Questions</h2><div class="gold-divider" style="margin:1rem auto 0;"></div></div>
    <div class="pillar-faq" style="max-width:820px;margin:0 auto;">${faq(cfg.faqs)}</div>
  </div>
</section>

<section class="section" style="background:var(--green-800,#0D2A1A);color:#fff;text-align:center;">
  <div class="container">
    <h2 style="color:#fff;">${cfg.ctaHead}</h2>
    <p style="max-width:600px;margin:1rem auto 1.75rem;color:rgba(255,255,255,0.85);">${cfg.ctaSub}</p>
    <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
      <a href="/contact.html" class="btn btn-gold btn-lg">Get a Free Estimate</a>
      <a href="tel:${ph.raw}" class="btn btn-outline-light btn-lg">Call ${ph.display}</a>
    </div>
  </div>
</section>
${FOOTER_ABS}
<script src="/js/main.js"></script>
<script src="/js/cookie-consent.js"></script>
<script src="/js/estimate-tab.js"></script>
</body>
</html>`;
}

const CITIES = {
  avondale: { city: "Avondale", region: "avondale" },
  prescott: { city: "Prescott", region: "prescott" },
};

const PAGES = [];
for (const key of ["avondale", "prescott"]) {
  const c = CITIES[key];
  const ph = PHONE[c.region];
  PAGES.push({
    slug: `bathroom-remodeling-${key}`, kind: "bathroom", service: "Bathroom Remodeling", city: c.city, region: c.region,
    metaDesc: `${c.city}, AZ bathroom remodeling — walk-in showers, tub-to-shower conversions, vanities, and tile. Factory-direct, licensed AZ ROC #339999. Free estimate. Call ${ph.display}.`,
    heroSub: `Walk-in showers, tub-to-shower conversions, custom tile, and full bathroom renovations for ${c.city} homes.`,
    quick: `Infinity Kitchens and Baths remodels bathrooms throughout ${c.city}, AZ — walk-in showers, tub-to-shower conversions, groutless shower systems, vanities, tile, and ADA/aging-in-place updates. Family-owned, factory-direct, and licensed (AZ ROC #339999), with a free in-home estimate.`,
    introH2: `Trusted Bathroom Remodeling in ${c.city}, AZ`,
    intro: `<p>From primary-suite upgrades to guest baths, ${c.city} homes are great candidates for a smarter, easier-to-clean bathroom. We convert dated tub/shower combos into sleek walk-in showers, replace builder-grade vanities with real stone tops, and set custom tile that holds up to daily use.</p><p>As a family-owned, factory-direct remodeler running our own crews, we give ${c.city} homeowners one accountable team and honest, fixed quotes — from the first measurement through the final walkthrough.</p>`,
    why: `<p>You get factory-direct pricing, our own crews, and 35+ years of remodeling experience. We handle waterproofing correctly, manage permits when required, and keep your project on the schedule we set — no surprise charges.</p>`,
    faqs: [
      ["Do you remodel bathrooms in " + c.city + "?", `Yes — ${c.city} is part of our service area. We handle everything from walk-in showers to full primary-bath renovations. Call ${ph.display} for a free consultation.`],
      ["Can you do a tub-to-shower conversion?", "Yes — it's one of our most requested projects. We remove the old tub, waterproof the area properly, and install a low-threshold or curbless walk-in shower, usually in about a week to ten days."],
      ["Are you licensed and insured?", "Yes. We're a licensed Arizona contractor, AZ ROC #339999, and fully bonded and insured."],
      ["Is the estimate free?", `Yes. We offer a free in-home or showroom consultation with an honest, written estimate and no pressure. Call ${ph.display} to book.`],
    ],
    ctaHead: `Ready to Remodel Your ${c.city} Bathroom?`,
    ctaSub: "Book a free in-home consultation. We'll measure, talk through your ideas, and give you a clear written estimate — no pressure.",
  });
  PAGES.push({
    slug: `kitchen-remodeling-${key}`, kind: "kitchen", service: "Kitchen Remodeling", city: c.city, region: c.region,
    metaDesc: `${c.city}, AZ kitchen remodeling — custom cabinets, countertops, islands, and backsplash. Factory-direct, licensed AZ ROC #339999. Free design consult. Call ${ph.display}.`,
    heroSub: `Custom cabinets, countertops, islands, and backsplashes for ${c.city} kitchens, installed by our own crews.`,
    quick: `Infinity Kitchens and Baths remodels kitchens throughout ${c.city}, AZ — custom cabinets, quartz and granite countertops, islands, backsplash and tile, and flooring. Family-owned, factory-direct, and licensed (AZ ROC #339999), with a free design consultation.`,
    introH2: `Trusted Kitchen Remodeling in ${c.city}, AZ`,
    intro: `<p>Whether you want new cabinets and counters or a full gut-and-rebuild, ${c.city} kitchens are where we do our best work. We plan the layout around how you actually cook, then handle cabinets, countertops, backsplash, and flooring with one accountable team.</p><p>As a family-owned, factory-direct remodeler, we give ${c.city} homeowners honest, fixed quotes and real craftsmanship — from design through the final walkthrough.</p>`,
    why: `<p>You get factory-direct pricing on cabinets and counters, our own crews, and 35+ years of remodeling experience. We manage permits when required and keep your project on the schedule we set — no surprise charges.</p>`,
    faqs: [
      ["Do you remodel kitchens in " + c.city + "?", `Yes — ${c.city} is part of our service area. We handle everything from cabinet and counter refreshes to full kitchen remodels. Call ${ph.display} for a free consultation.`],
      ["Do you build custom cabinets?", "Yes. We offer custom and semi-custom cabinetry, countertops, islands, and backsplashes, coordinated by one team from design to install."],
      ["Are you licensed and insured?", "Yes. We're a licensed Arizona contractor, AZ ROC #339999, and fully bonded and insured."],
      ["Is the design consultation free?", `Yes. We plan your layout, materials, and budget at no cost, with an honest written estimate. Call ${ph.display} to book.`],
    ],
    ctaHead: `Ready to Remodel Your ${c.city} Kitchen?`,
    ctaSub: "Book a free design consultation. We'll plan the layout, materials, and budget around how you actually cook — no pressure.",
  });
}

let n = 0;
for (const cfg of PAGES) {
  mkdirSync(`lp/${cfg.slug}`, { recursive: true });
  writeFileSync(`lp/${cfg.slug}/index.html`, page(cfg));
  console.log(`  /lp/${cfg.slug}/  ->  ${PHONE[cfg.region].display}`);
  n++;
}
console.log(`\nGenerated ${n} site-design landing pages.`);
