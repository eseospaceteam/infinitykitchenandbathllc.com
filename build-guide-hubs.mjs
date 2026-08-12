#!/usr/bin/env node
/**
 * Week 4, part two: give the loose informational pages a taxonomy.
 *
 * The site has ~70 guides, comparisons and idea pages sitting at the root with
 * blog.html as their only hub. This builds eight typed category hubs and links
 * them down; the guides keep their URLs. Re-homing is by breadcrumb and linking
 * only — no redirects, no moves.
 *
 * Follows the same no-default-bucket discipline as build-llms-txt.mjs: a guide
 * that matches no rule is reported and the script exits non-zero rather than
 * being silently absorbed.
 *
 * Usage: node build-guide-hubs.mjs [--report] [--apply]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const REPORT = process.argv.includes("--report");
const BASE = "https://www.infinitykitchenandbathllc.com";
const DONOR = "showers.html"; // an existing hub, so chrome + CollectionPage pattern match

/* Pages that are services, cities, legal or company — never guides. */
const NOT_GUIDES = new Set([
  "index.html", "services.html", "contact.html", "about.html", "our-team.html",
  "reviews.html", "gallery.html", "featured-in.html", "faq.html", "financing.html",
  "warranties.html", "licensing-insurance.html", "community.html", "blog.html",
  "privacy-policy.html", "terms-of-service.html", "cookie-policy.html",
  "accessibility.html", "review.html", "remodel-cost-calculator.html",
  "prescott-remodeling-faq.html", "west-valley.html", "showers.html",
  "countertops.html", "sitemap.html",
  "kitchen-remodeling.html", "bathroom-remodeling.html", "walk-in-showers.html",
  "tub-to-shower.html", "ada-bathroom-remodeling.html", "aging-in-place.html",
  "kitchen-cabinets.html", "custom-countertops.html", "kitchen-backsplash.html",
  "backsplash-installation.html", "small-kitchen-remodeling.html",
  "outdoor-kitchen.html", "master-bathroom.html", "small-bathroom.html",
  "groutless-shower-systems.html", "tile-shower-installation.html",
  "bathroom-vanities.html", "steam-shower-installation.html",
  "whole-house-remodeling.html", "design-build.html", "laundry-room-remodel.html",
  "home-additions.html", "garage-conversion-adu.html", "tile-flooring.html",
  "luxury-vinyl-flooring.html", "cabinet-refinishing-refacing.html",
  "bathroom-remodel-financing.html",
]);

const isCityOrService = (s) =>
  /^(kitchen|bathroom)-remodeling-[a-z-]+\.html$/.test(s) ||
  /^(walk-in-showers|tub-to-shower|ada-bathroom|aging-in-place)-[a-z-]+\.html$/.test(s) ||
  /-remodeling\.html$/.test(s);

/* Ordered; first match wins. */
export const HUBS = [
  {
    slug: "choosing-a-contractor.html",
    title: "How to Choose a Remodeling Contractor",
    h1: "Choosing a Remodeling Contractor",
    desc: "How to evaluate kitchen, bathroom, cabinet and accessibility contractors in Prescott, Yavapai County and the West Valley, AZ.",
    intro:
      "These are checklists for judging a contractor, not rankings of one. Each covers what to ask, what to verify, and what a straight answer sounds like — including how to check a licence with the Arizona Registrar of Contractors before anyone starts work.",
    match: (s) => /^best-.*(remodeler|contractor|installer|maker|builder)/.test(s),
  },
  {
    slug: "accessibility-guides.html",
    title: "Accessibility & Aging in Place Guides",
    h1: "Accessibility & Aging-in-Place Guides",
    desc: "Guides to accessible bathrooms, walk-in showers, grab bars and aging-in-place remodeling in Prescott and the West Valley, AZ.",
    intro:
      "Accessibility work is the part of remodeling where getting the details right matters most, and where the marketing is least reliable. These guides cover what actually changes a room's usability — threshold height, blocking in the walls, doorway clear width — and what the ADA standard does and does not require of a private home.",
    match: (s) => /(aging-in-place|ada|grab-bar|curbless|zero-entry|walk-in-shower|tub-to-shower|va-)/.test(s),
  },
  {
    slug: "cost-guides.html",
    title: "Remodeling Cost Guides",
    h1: "Remodeling Cost Guides",
    desc: "What kitchen, bathroom, shower and countertop projects actually cost in Prescott and the West Valley, AZ, and what drives the range.",
    intro:
      "Every figure in these guides is a range, because that is what an honest cost answer looks like before anyone has seen your house. The useful part is not the number — it is what moves you within the range: the age of the plumbing, whether walls move, and the material tier you choose.",
    match: (s) => /(-cost|-costs|costs\.html|-roi|-pricing|financing)\.html$/.test(s),
  },
  {
    slug: "comparison-guides.html",
    title: "Material & Product Comparisons",
    h1: "Material & Product Comparisons",
    desc: "Side-by-side comparisons — quartz vs granite, porcelain vs ceramic, refacing vs replacing — for Prescott and West Valley remodels.",
    intro:
      "These are the decisions that stall a project. Each guide takes one pairing, sets out where each option genuinely wins, and says which we would specify in which situation rather than leaving you with a balanced shrug.",
    match: (s) => /-vs-/.test(s),
  },
  {
    slug: "shower-guides.html",
    title: "Shower & Tile Guides",
    h1: "Shower & Tile Guides",
    desc: "Shower design, tile, grout, waterproofing and glass — practical guides for bathroom remodels in Prescott and the West Valley, AZ.",
    intro:
      "A shower is the most demanding assembly in a house: it has to shed water for decades behind a surface nobody can inspect. These guides cover the parts that decide whether it does — waterproofing, slope, grout and glass.",
    match: (s) => /(shower|grout|tile)/.test(s),
  },
  {
    slug: "kitchen-guides.html",
    title: "Kitchen Design & Planning Guides",
    h1: "Kitchen Design & Planning Guides",
    desc: "Kitchen layout, cabinets, islands, lighting and storage guides for remodels in Prescott and the West Valley, Arizona.",
    intro:
      "Kitchen decisions compound: the layout sets the cabinets, the cabinets set the counters, and the counters set the budget. These guides work through them in roughly the order you will face them.",
    match: (s) => /(kitchen|cabinet|countertop|backsplash|island|pantry)/.test(s),
  },
  {
    slug: "bathroom-guides.html",
    title: "Bathroom Design & Planning Guides",
    h1: "Bathroom Design & Planning Guides",
    desc: "Bathroom layout, vanities, flooring, ventilation and design guides for Prescott and West Valley, AZ remodels.",
    intro:
      "Bathrooms are the smallest rooms with the most systems in them. These guides cover layout, fixtures and the finishes that survive a wet room, with an eye on what still works ten years in.",
    match: (s) => /(bathroom|vanity|vanities|toilet|bathtub|tub)/.test(s),
  },
  {
    slug: "planning-guides.html",
    title: "Remodeling Process & Planning",
    h1: "Remodeling Process & Planning",
    desc: "Timelines, permits, contractor selection and common mistakes — how a remodel actually runs in Prescott and the West Valley, AZ.",
    intro:
      "The questions that come before any material decision: how long it takes, who pulls the permit, what goes wrong, and how to tell a good contractor from a confident one.",
    match: (s) => /(timeline|checklist|mistake|permit|process|planning|trends|ideas|guide|options|how-to-|what-is-|best-time-to)/.test(s),
  },
];

/* Running the inventory and the build are side effects, so they only happen when
   this file is executed directly. wire-guide-hubs.mjs imports HUBS from here. */
const IS_MAIN = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (IS_MAIN) {
/* ------------------------------------------------------------------ inventory */
const HUB_SLUGS = new Set(HUBS.map((h) => h.slug));
const all = readdirSync(".").filter((f) => f.endsWith(".html"));
const guides = all.filter(
  (f) => !NOT_GUIDES.has(f) && !isCityOrService(f) && !HUB_SLUGS.has(f)
);

const buckets = new Map(HUBS.map((h) => [h.slug, []]));
const uncategorised = [];
for (const g of guides.sort()) {
  const hub = HUBS.find((h) => h.match(g));
  if (hub) buckets.get(hub.slug).push(g);
  else uncategorised.push(g);
}

function title(file) {
  const m = readFileSync(file, "utf8").match(/<title>([\s\S]*?)<\/title>/);
  return m ? m[1].replace(/\s*[|—-]\s*Infinity.*$/i, "").trim() : file;
}

if (REPORT || (!APPLY && !REPORT)) {
  for (const h of HUBS) {
    const b = buckets.get(h.slug);
    console.log(`\n${h.slug}  (${b.length})`);
    for (const g of b) console.log("    " + g);
  }
  if (uncategorised.length) {
    console.log(`\nUNCATEGORISED (${uncategorised.length}) — add a rule, do not default:`);
    for (const g of uncategorised) console.log("    " + g);
  }
  console.log(`\n${guides.length} guides across ${HUBS.length} hubs`);
  if (!APPLY) { if (uncategorised.length) process.exit(1); process.exit(0); }
}

if (uncategorised.length) {
  console.error(`\nRefusing to build: ${uncategorised.length} uncategorised guide(s).`);
  process.exit(1);
}

/* --------------------------------------------------------------------- build */
const d = readFileSync(DONOR, "utf8");
const headEnd = d.indexOf("</head>");
const mainStart = d.indexOf("<main");
const mainEnd = d.indexOf("</main>");
const donorHead = d.slice(0, headEnd);
const nav = d.slice(headEnd + "</head>".length, mainStart);
const mainOpen = d.slice(mainStart, d.indexOf(">", mainStart) + 1);
const footer = d.slice(mainEnd);

const esc = (s) =>
  String(s).replace(/&(?!(?:amp|lt|gt|quot|#\d+|#x[0-9a-f]+);)/gi, "&amp;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");

let built = 0;
for (const h of HUBS) {
  const items = buckets.get(h.slug);
  if (!items.length) { console.log(`  skip  ${h.slug} (empty)`); continue; }
  if (h.title.length > 60) throw new Error(`${h.slug}: title ${h.title.length} > 60`);
  if (h.desc.length > 155) throw new Error(`${h.slug}: description ${h.desc.length} > 155`);

  const url = `${BASE}/${h.slug}`;
  let head = donorHead
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(h.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${attr(h.desc)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${attr(h.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${attr(h.desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${attr(h.title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${attr(h.desc)}$2`);

  const donorLd = JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const business = (donorLd["@graph"] ?? [donorLd]).filter((n) =>
    String(n["@type"]).includes("HomeAndConstruction")
  );
  const graph = [
    ...business,
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/blog.html` },
        { "@type": "ListItem", position: 3, name: h.h1, item: url },
      ],
    },
    {
      "@type": ["CollectionPage", "Article"],
      "@id": `${url}#webpage`,
      url,
      name: h.title,
      headline: h.h1,
      description: h.desc,
      isPartOf: { "@id": `${BASE}/#website` },
      publisher: { "@id": `${BASE}/#localbusiness` },
      hasPart: items.map((g) => ({
        "@type": "WebPage",
        url: `${BASE}/${g}`,
        name: title(g),
      })),
    },
  ];
  head = head.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(
      { "@context": "https://schema.org", "@graph": graph }, null, 2)}\n</script>`
  );

  const cards = items
    .map(
      (g) =>
        `<a href="${g}" class="area-pill" style="display:block;padding:0.9rem 1.1rem;border:1px solid #E5E7EB;border-radius:8px;text-align:left;">${esc(title(g))}</a>`
    )
    .join("");

  const others = HUBS.filter((x) => x.slug !== h.slug && buckets.get(x.slug).length)
    .map((x) => `<a href="${x.slug}" class="btn btn-outline-dark btn-sm">${esc(x.h1)}</a>`)
    .join("");

  const main = `
<section class="page-hero" style="background-image:url('${BASE}/wp-content/uploads/2026/06/marble-bathroom-remodel-ada-grab-bars.jpg');background-size:cover;background-position:center;">
  <div style="position:absolute;inset:0;background:linear-gradient(to right,#1B4332 0%,#1B4332 42%,rgba(27,67,50,0.55) 65%,transparent 100%);"></div>
  <div class="page-hero-inner" style="position:relative;">
    <div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="blog.html">Guides</a><span>/</span><span style="color:rgba(255,255,255,0.75)">${esc(h.h1)}</span></div>
    <span class="eyebrow">Guides</span>
    <h1>${esc(h.h1)}</h1>
    <p style="color:rgba(255,255,255,0.9);margin-top:0.9rem;font-size:1.05rem;max-width:560px;">${esc(h.desc)}</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:860px;">
    <p style="font-size:1.05rem;">${esc(h.intro)}</p>
  </div>
</section>

<section class="section" style="background:#F9FAFB;padding-top:0;">
  <div class="container" style="max-width:900px;">
    <h2>All ${items.length} guides in this category</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:0.75rem;">${cards}</div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:900px;text-align:center;">
    <span class="eyebrow">Other Categories</span>
    <h2>Browse the rest of the library</h2>
    <div style="display:flex;flex-wrap:wrap;gap:0.75rem;justify-content:center;margin-top:1.25rem;">${others}</div>
    <p style="margin-top:1.5rem;"><a href="blog.html">See every guide and article</a>.</p>
  </div>
</section>

<section class="cta-banner">
  <div class="container text-center">
    <span class="eyebrow">Free In-Home Consult</span>
    <h2>Ready to stop reading and start planning?</h2>
    <p>We come to you, measure, and give you a written estimate — no obligation.</p>
    <div class="cta-actions">
      <a href="contact.html" class="btn btn-gold btn-lg">Get a Free Estimate</a>
      <a href="tel:9288001998" class="cta-phone-link">or call 928-800-1998</a>
    </div>
  </div>
</section>
`;

  if (APPLY) writeFileSync(h.slug, head + "</head>" + nav + mainOpen + main + footer);
  built++;
  console.log(`  ${existsSync(h.slug) ? "rebuild" : "new    "} ${h.slug}  (${items.length} guides)`);
}
console.log(`\n${built} hub(s) ${APPLY ? "written" : "would be built"}`);
}
