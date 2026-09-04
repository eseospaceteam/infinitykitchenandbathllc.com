#!/usr/bin/env node
/**
 * Builds accessible-remodeling.html — the positioning parent for the site's
 * strongest and least-visible cluster.
 *
 * WHAT WAS ACTUALLY MISSING. The cluster itself is already built and correctly
 * wired: four service hubs x nine cities = 36 pages, locations.html links 36/36,
 * west-valley.html links 32, and each service hub links its own nine children.
 * accessibility-guides.html covers the guide layer. Nothing is orphaned.
 *
 * What did not exist is a page that presents accessibility as ONE niche. The
 * four service hubs sit as siblings on services.html among kitchen and bath
 * services, so the single most differentiated thing this firm does — no Prescott
 * competitor covers it — reads as four unrelated services. This page is the
 * parent above them. It adds no new service x city pages and moves no URL.
 *
 * NOTE the slug. accessibility.html is taken: it is the WCAG accessibility
 * STATEMENT for the website itself. Naming this one accessible-remodeling.html
 * keeps the two apart, which matters because conflating them is exactly the
 * confusion this page has to avoid.
 *
 * ADA FIGURES are the ones verified against ADA.gov and the U.S. Access Board
 * on 2026-08-12 and already cited by section across the 36 matrix pages. Every
 * one of those pages states the standard governs PUBLIC ACCOMMODATIONS, not
 * private homes; this page must say the same, and must never imply a homeowner
 * is bound by it.
 *
 * Usage: node build-accessible-hub.mjs [--apply]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const BASE = "https://www.infinitykitchenandbathllc.com";
const DONOR = "walk-in-showers.html"; // in-cluster, so chrome and schema shape match
const SLUG = "accessible-remodeling.html";
const HERO = "wp-content/uploads/2026/06/marble-bathroom-remodel-ada-grab-bars.jpg";

const TITLE = "Accessible &amp; Aging-in-Place Remodeling | Infinity K&amp;B";
const DESC =
  "Walk-in showers, tub-to-shower conversions, ADA-style bathrooms and " +
  "aging-in-place remodels across Prescott and the Phoenix West Valley, AZ.";
const H1 = "Accessible &amp; Aging-in-Place Remodeling";

const SERVICES = [
  {
    slug: "walk-in-showers.html",
    name: "Walk-In Showers",
    blurb: "Low-threshold and curbless showers that you step into rather than climb over.",
  },
  {
    slug: "tub-to-shower.html",
    name: "Tub-to-Shower Conversions",
    blurb: "Replacing a tub you can no longer step into, usually without moving plumbing.",
  },
  {
    slug: "ada-bathroom-remodeling.html",
    name: "ADA-Style Bathrooms",
    blurb: "Bathrooms built to the clearances and reach ranges the ADA standard sets out.",
  },
  {
    slug: "aging-in-place.html",
    name: "Aging-in-Place Remodeling",
    blurb: "Whole-home changes that let you stay in the house rather than move out of it.",
  },
];

const CITIES = [
  { slug: "prescott", name: "Prescott", region: "Yavapai County" },
  { slug: "sun-city", name: "Sun City", region: "West Valley" },
  { slug: "sun-city-west", name: "Sun City West", region: "West Valley" },
  { slug: "surprise", name: "Surprise", region: "West Valley" },
  { slug: "peoria", name: "Peoria", region: "West Valley" },
  { slug: "glendale", name: "Glendale", region: "West Valley" },
  { slug: "goodyear", name: "Goodyear", region: "West Valley" },
  { slug: "avondale", name: "Avondale", region: "West Valley" },
  { slug: "buckeye", name: "Buckeye", region: "West Valley" },
];

/* file stem per service, for the service x city matrix */
const MATRIX = {
  "walk-in-showers.html": "walk-in-showers",
  "tub-to-shower.html": "tub-to-shower",
  "ada-bathroom-remodeling.html": "ada-bathroom",
  "aging-in-place.html": "aging-in-place",
};

const SECTIONS = [
  {
    h: "What the ADA standard does and does not require of your home",
    p: [
      "This is the single most misrepresented thing in accessible remodeling, so it is worth being blunt about. The ADA Standards for Accessible Design govern <strong>public accommodations</strong> — businesses, government buildings, places open to the public. <strong>They do not apply to a private home.</strong> No homeowner is obliged to meet them, and any contractor implying you must be brought into compliance is selling you something.",
      'What the standard is genuinely useful for is as a set of tested dimensions. It is the most carefully researched answer available to "how much room does a wheelchair actually need", and we design to it because it works, not because anyone is compelled to. The figures we use are a 60-inch turning space (§304.3.1), a 32-inch clear width at a doorway (§404.2.3), and grab bars mounted 33 to 36 inches above the floor (§609.4), all verified against ADA.gov and the U.S. Access Board.',
      "For most households the honest answer is that you want <em>some</em> of it. A curbless entry and blocking in the walls, yes. Widening every doorway in the house, usually not. We will tell you which is which for your home rather than quoting the whole standard at you.",
    ],
  },
  {
    h: "The detail that has to happen before the walls close",
    p: [
      "Blocking is the one thing that cannot be added later. It is the timber fixed between the studs behind the finished wall, and it is what a grab bar anchors into. Fitted during the remodel it costs almost nothing; retrofitted afterwards it means opening a finished wall, and a bar screwed into tile and drywall alone will not hold a fall.",
      "So we install blocking around the shower, beside the toilet and along the tub wall on accessible projects as a matter of course, whether or not a bar is going on it today. If the need arrives in ten years, the wall is already ready. This is the stage in our process where the difference gets made — see <a href=\"our-process.html\">how a remodel runs</a>.",
    ],
  },
  {
    h: "Two of our cities are retirement communities, and they work differently",
    p: [
      "Sun City opened on 1 January 1960 as Del Webb's first large-scale active adult community; Sun City West followed from 1978 and runs to roughly 16,900 homes. Between them they are the reason this is a specialism here rather than a sideline, and their housing stock is a specific era with specific bathrooms — compact, tubs in alcoves, doorways at the narrow end of what was standard.",
      "They are also <strong>unincorporated</strong>. Neither has a city building department, so residential permits come from Maricopa County Planning &amp; Development and the Sun City Fire and Medical District covers fire and life safety. Both carry Recreation Centers membership. It is a different permitting path from Surprise or Peoria next door, and it catches out contractors who assume every address has a city hall.",
    ],
  },
  {
    h: "Paying for it",
    p: [
      'Accessible work is one of the few remodeling categories with funding attached to it. If the homeowner is a veteran, the VA administers home adaptation grants that can apply to exactly this kind of bathroom work — we have set out how that process generally runs on <a href="va-bathroom-remodeling-grant.html">VA bathroom remodeling grants</a>.',
      'Beyond that, the ordinary routes apply: see <a href="financing.html">financing</a>, and <a href="walk-in-shower-cost.html">what a walk-in shower costs</a> or <a href="tub-to-shower-conversion-cost.html">what a tub-to-shower conversion costs</a> for the ranges before anyone has seen your bathroom.',
    ],
  },
];

/* ------------------------------------------------------------------- build */
const rendered = (s) =>
  String(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
const plain = (s) => rendered(String(s).replace(/<[^>]+>/g, ""));

if (rendered(TITLE).length > 60) throw new Error(`title ${rendered(TITLE).length} > 60`);
if (rendered(DESC).length > 160) throw new Error(`description ${rendered(DESC).length} > 160`);
if (!existsSync(HERO)) throw new Error(`hero image missing on disk: ${HERO}`);

/* Never link a page that is not there. The matrix is asserted, so prove it. */
const missing = [];
for (const s of SERVICES) if (!existsSync(s.slug)) missing.push(s.slug);
for (const s of Object.values(MATRIX))
  for (const c of CITIES) if (!existsSync(`${s}-${c.slug}.html`)) missing.push(`${s}-${c.slug}.html`);
for (const extra of ["accessibility-guides.html", "va-bathroom-remodeling-grant.html",
  "walk-in-shower-cost.html", "tub-to-shower-conversion-cost.html", "curbless-zero-entry-showers.html",
  "financing.html", "our-process.html", "locations.html"])
  if (!existsSync(extra)) missing.push(extra);
if (missing.length) {
  console.error(`Refusing to build — ${missing.length} link target(s) do not exist:`);
  for (const m of missing) console.error("   " + m);
  process.exit(1);
}

const title = (file) => {
  const m = readFileSync(file, "utf8").match(/<title>([\s\S]*?)<\/title>/);
  return m ? m[1].replace(/\s*[|—-]\s*Infinity.*$/i, "").trim() : file;
};

const d = readFileSync(DONOR, "utf8");
const headEnd = d.indexOf("</head>");
const mainStart = d.indexOf("<main");
const mainEnd = d.indexOf("</main>");
const donorHead = d.slice(0, headEnd);
const nav = d.slice(headEnd + "</head>".length, mainStart);
const mainOpen = d.slice(mainStart, d.indexOf(">", mainStart) + 1);
const footer = d.slice(mainEnd);

const url = `${BASE}/${SLUG}`;
let head = donorHead
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${TITLE}</title>`)
  .replace(/(<meta name="description" content=")[^"]*(")/, `$1${DESC}$2`)
  .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
  .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${TITLE}$2`)
  .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${DESC}$2`)
  .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
  .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${TITLE}$2`)
  .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${DESC}$2`);

const donorLd = JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const business = (donorLd["@graph"] ?? [donorLd]).filter((n) =>
  String(n["@type"]).includes("HomeAndConstruction")
);
if (!business.length) throw new Error("donor carries no business node");

const graph = [
  ...business,
  {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${BASE}/services.html` },
      { "@type": "ListItem", position: 3, name: plain(H1), item: url },
    ],
  },
  {
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    url,
    name: rendered(TITLE),
    headline: plain(H1),
    description: rendered(DESC),
    isPartOf: { "@id": `${BASE}/#website` },
    publisher: { "@id": `${BASE}/#business` },
    hasPart: SERVICES.map((s) => ({
      "@type": "WebPage",
      url: `${BASE}/${s.slug}`,
      name: plain(s.name),
    })),
  },
];
head = head.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">\n${JSON.stringify(
    { "@context": "https://schema.org", "@graph": graph }, null, 2)}\n</script>`
);

const serviceCards = SERVICES.map(
  (s) => `<a href="${s.slug}" style="display:block;padding:1.25rem;border:1px solid #E5E7EB;border-radius:8px;text-decoration:none;">
        <strong style="display:block;font-size:1.1rem;margin-bottom:0.35rem;">${s.name}</strong>
        <span style="color:#4B5563;font-size:0.95rem;">${s.blurb}</span>
      </a>`
).join("\n      ");

const matrixRows = CITIES.map((c) => {
  const cells = SERVICES.map((s) => {
    const f = `${MATRIX[s.slug]}-${c.slug}.html`;
    return `<td style="padding:0.5rem 0.75rem;border-bottom:1px solid #E5E7EB;"><a href="${f}">${s.name}</a></td>`;
  }).join("");
  return `<tr><th scope="row" style="text-align:left;padding:0.5rem 0.75rem;border-bottom:1px solid #E5E7EB;white-space:nowrap;">${c.name}<br><span style="font-weight:400;color:#6B7280;font-size:0.85rem;">${c.region}</span></th>${cells}</tr>`;
}).join("\n        ");

const sectionHtml = SECTIONS.map(
  (s, i) => `<section class="section"${i % 2 ? ' style="background:#F9FAFB;"' : ""}>
  <div class="container" style="max-width:860px;">
    <h2>${s.h}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    ${s.p.map((x) => `<p>${x}</p>`).join("\n    ")}
  </div>
</section>`
).join("\n");

const main = `
<section class="page-hero" style="background-image:url('${BASE}/${HERO}');background-size:cover;background-position:center;">
  <div style="position:absolute;inset:0;background:linear-gradient(to right,#1B4332 0%,#1B4332 42%,rgba(27,67,50,0.55) 65%,transparent 100%);"></div>
  <div class="page-hero-inner" style="position:relative;">
    <div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="services.html">Services</a><span>/</span><span style="color:rgba(255,255,255,0.75)">Accessible Remodeling</span></div>
    <span class="eyebrow">Accessible Remodeling</span>
    <h1>${H1}</h1>
    <p style="color:rgba(255,255,255,0.9);margin-top:0.9rem;font-size:1.05rem;max-width:560px;">Bathrooms and homes that keep working as the people in them change. Prescott, Yavapai County and the Phoenix West Valley.</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:860px;">
    <p style="font-size:1.05rem;">Most remodeling is about how a room looks. This is about whether someone can still use it — and it is the work we do most, because our territory includes both a retirement county and two of the largest active adult communities in Arizona.</p>
    <p>It covers a range. At one end, a tub swapped for a low-threshold shower so nobody has to lift a leg over a wall to wash. At the other, a whole house reworked around a wheelchair. Most projects sit in between, and most start because something has changed — a fall, a diagnosis, a parent moving in, or simply the realisation that the bathroom is going to become a problem before the house does.</p>
    <p>We are not a walk-in tub company with a scripted pitch. We are a design-build remodeler that does this work properly, which mostly means telling you which changes are worth making and which are being sold to you.</p>
  </div>
</section>

<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:900px;">
    <h2>The four services</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;">
      ${serviceCards}
    </div>
    <p style="margin-top:1.25rem;">Not sure which applies? <a href="curbless-zero-entry-showers.html">Curbless and zero-entry showers</a> is the usual starting point, and <a href="accessibility-guides.html">the accessibility guides</a> go through the decisions in detail.</p>
  </div>
</section>

${sectionHtml}

<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:1000px;">
    <h2>Every service, every city</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>Each page covers the housing stock, permitting authority and typical bathroom layouts for that community — they are not the same page with the name swapped.</p>
    <div style="overflow-x:auto;margin-top:1.25rem;">
      <table style="width:100%;border-collapse:collapse;min-width:640px;">
        <!-- Visually hidden inline: this stylesheet has no .sr-only utility, and
             adding one sitewide for a single caption is not worth the blast radius. -->
        <caption style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">Accessible remodeling services by city</caption>
        <thead><tr><th scope="col" style="text-align:left;padding:0.5rem 0.75rem;border-bottom:2px solid #1B4332;">City</th>${SERVICES.map((s) => `<th scope="col" style="text-align:left;padding:0.5rem 0.75rem;border-bottom:2px solid #1B4332;">${s.name}</th>`).join("")}</tr></thead>
        <tbody>
        ${matrixRows}
        </tbody>
      </table>
    </div>
    <p style="margin-top:1.25rem;">Somewhere else in Yavapai County or the West Valley? See <a href="locations.html">every area we serve</a> — the consult is free wherever you are.</p>
  </div>
</section>

<section class="cta-banner">
  <div class="container text-center">
    <span class="eyebrow">Free In-Home Consult</span>
    <h2>We will come and look at the actual bathroom</h2>
    <p>No obligation, no pressure, and an honest answer about what is worth changing.</p>
    <div class="cta-actions">
      <a href="contact.html" class="btn btn-gold btn-lg">Get a Free Estimate</a>
      <a href="tel:9288001998" class="cta-phone-link">or call 928-800-1998</a>
    </div>
  </div>
</section>
`;

const out = head + "</head>" + nav + mainOpen + main + footer;

for (const m of out.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
  JSON.parse(m[1]);
}

if (APPLY) {
  writeFileSync(SLUG, out);
  console.log(`wrote ${SLUG}  (${plain(main).split(/\s+/).filter(Boolean).length} words, ` +
    `${SERVICES.length + CITIES.length * SERVICES.length} cluster links)`);
  console.log("REMINDER: run a11y-upgrade.mjs — this donor slice has no skip link or main landmark.");
} else {
  console.log(`[dry] ${SLUG}: title ${rendered(TITLE).length}, desc ${rendered(DESC).length}, ` +
    `${plain(main).split(/\s+/).filter(Boolean).length} words, ` +
    `${SERVICES.length + CITIES.length * SERVICES.length} cluster links, JSON-LD parses. Pass --apply.`);
}
