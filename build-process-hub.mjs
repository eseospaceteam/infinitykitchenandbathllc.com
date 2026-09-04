#!/usr/bin/env node
/**
 * Builds our-process.html — the one page the site genuinely did not have.
 *
 * WHY: process copy exists on 54 pages ("Our Design-Build Process" on
 * design-build.html, "Our Bathroom Remodeling Process, Start to Finish" on
 * bathroom-remodeling.html, per-city variants on the *-remodeling.html hubs),
 * but there was no page a homeowner could land on to answer "how does this
 * actually run?". Both Prescott competitors publish one. This consolidates what
 * the site already says rather than inventing a new process — every stage below
 * is lifted from design-build.html, which is the canonical five-stage version.
 *
 * NOT a duplicate of design-build.html: that page sells design-build as a
 * delivery method against the general-contractor alternative. This one is the
 * procedural walkthrough and routes to the per-service and per-region detail.
 *
 * PERMIT FACTS are the ones verified 2026-08-12 against the authorities' own
 * sites and stored in wv-city-data.mjs. Sun City and Sun City West are
 * UNINCORPORATED — no city building department — so residential permits come
 * from Maricopa County Planning & Development. Standing rule from that file
 * applies here: no fee amounts and no review timelines without a date on them,
 * so this page names who issues a permit and nothing more.
 *
 * Usage: node build-process-hub.mjs [--apply]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const BASE = "https://www.infinitykitchenandbathllc.com";
const DONOR = "design-build.html"; // closest sibling: same chrome, same subject
const SLUG = "our-process.html";
const HERO = "wp-content/uploads/2025/03/Walker-Whole-House.jpg";

const TITLE = "Our Remodeling Process | Infinity Kitchens & Baths";
const DESC =
  "How an Infinity remodel runs, stage by stage: free in-home consult, 3D design, " +
  "itemised contract, permits, build and a written warranty.";
const H1 = "How Your Remodel Actually Runs";

/* Every stage is the design-build.html wording, condensed. Do not add a stage
   here that the service pages do not also describe. */
const STAGES = [
  {
    n: "01",
    h: "Free In-Home Consultation &amp; Home Assessment",
    p: [
      "We meet at your home — not a showroom — for a no-pressure conversation about what you want to change, what is not working, and what your budget expectations are. We walk the space together, take field measurements, and note the structural constraints that will shape what is realistic.",
      "This is a design conversation, not a sales call, and there is never any pressure to sign the same day. It is free and carries no obligation.",
    ],
  },
  {
    n: "02",
    h: "Concept Design &amp; 3D CAD Presentation",
    p: [
      "We take the measurements and your wish list back to the studio and develop scaled 2D floor plans — usually two or three layout alternatives so you can compare the trade-offs — then a photorealistic 3D rendering of the preferred layout with your selected finishes applied.",
      "You see the tile, the vanity placement, the shower layout and the fixtures before anyone touches a wall. This is the stage that prevents expensive mid-project changes.",
    ],
  },
  {
    n: "03",
    h: "Final Selections, Itemised Scope &amp; Contract",
    p: [
      "Once the layout is approved we finalise every material selection — countertop slab, cabinet door profile, tile, hardware, plumbing fixtures and lighting — against a coordinated material board, so you are not hoping things match when they arrive.",
      "Then we produce an itemised scope of work with firm pricing: demo, framing, plumbing rough-in, electrical, tile, cabinetry, countertops and finish work each listed with its cost <em>before</em> you sign a construction contract. Nothing is vague, and nothing is left to be discovered later.",
    ],
  },
  {
    n: "04",
    h: "Permits, Scheduling &amp; Construction",
    p: [
      "We pull the required permits, coordinate material deliveries, and manage every trade on a written schedule. Materials are ordered, verified and staged before the project starts, so your timeline is not waiting on a backorder.",
      "You get regular progress updates and a single point of contact for the whole build. If something is found behind a wall — moisture, dry rot, an old repair — it is raised and approved with you before work continues, never buried in a change order afterwards.",
    ],
  },
  {
    n: "05",
    h: "Final Walkthrough, Punch List &amp; Warranty",
    p: [
      "When construction is complete we walk the finished space with you and document every punch-list item. All of them are resolved before we consider the project closed.",
      'The work is backed by a written workmanship warranty — the details are on our <a href="warranties.html">warranties page</a>.',
    ],
  },
];

const SECTIONS = [
  {
    h: "Who pulls the permit depends on where you live",
    p: [
      'We handle the permit either way, but it is worth knowing which authority is involved, because it is the part of a remodel homeowners are most often surprised by. In our Yavapai County territory, permits come from the City of Prescott or from Yavapai County for unincorporated addresses — see <a href="permit-costs-yavapai-county.html">permits in Yavapai County</a>.',
      "In the West Valley, Avondale, Buckeye, Glendale, Goodyear, Peoria and Surprise are incorporated and issue their own. <strong>Sun City and Sun City West are not.</strong> They are unincorporated communities with no city building department at all, so residential permits are issued by Maricopa County Planning &amp; Development, with the Sun City Fire and Medical District covering fire and life safety. It is the detail no competitor city page gets right, and it changes who you are dealing with.",
      "We do not publish permit fees or review timelines here. Both change, and a stale number on a live page is worse than no number — we give you the current figures for your address at the consult.",
    ],
  },
  {
    h: "What changes by project type",
    p: [
      'The five stages hold for every project, but the middle of the build differs. A bathroom lives or dies on the waterproofing — membranes on every shower pan and wall, a floor sloped to the drain at the required quarter-inch-per-foot, all of it tested before a single tile goes on. The full sequence is on <a href="bathroom-remodeling.html">bathroom remodeling</a>.',
      'A kitchen is a sequencing problem instead: layout sets the cabinets, cabinets set the counters, and the counters cannot be templated until the cabinets are actually hung. See <a href="kitchen-remodeling.html">kitchen remodeling</a>, or <a href="whole-house-remodeling.html">whole-house remodeling</a> when several rooms move at once.',
      'Accessibility work has a stage the others do not — blocking has to go into the walls before they close up, and a grab bar added afterwards is never as strong. That is covered on <a href="accessible-remodeling.html">accessible &amp; aging-in-place remodeling</a>.',
    ],
  },
  {
    h: "One thing we will tell you up front",
    p: [
      'We do not send a sales team out to quote a backsplash on its own. If that is the whole job, we will point you at a tile installer who does that work, and we would rather say so now than waste your afternoon. Backsplash <em>within</em> a kitchen remodel is a different matter and is part of what we do — see <a href="kitchen-backsplash.html">kitchen backsplashes</a>.',
    ],
  },
];

/* ------------------------------------------------------------------- build */
const rendered = (s) =>
  String(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
const plain = (s) => rendered(String(s).replace(/<[^>]+>/g, ""));

/* Measure the RENDERED title, not the raw HTML — &amp; is one character to
   Google and five to String.length. Same trap as title-length audits. */
if (rendered(TITLE).length > 60) throw new Error(`title ${rendered(TITLE).length} > 60`);
if (rendered(DESC).length > 160) throw new Error(`description ${rendered(DESC).length} > 160`);
if (!existsSync(HERO)) throw new Error(`hero image missing on disk: ${HERO}`);
if (!existsSync(DONOR)) throw new Error(`donor missing: ${DONOR}`);

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

/* Reuse the donor's business nodes verbatim so there is one definition of the
   entity; swap only the page-level nodes. */
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
      { "@type": "ListItem", position: 2, name: "About", item: `${BASE}/about.html` },
      { "@type": "ListItem", position: 3, name: "Our Process", item: url },
    ],
  },
  {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: rendered(TITLE),
    headline: rendered(H1),
    description: rendered(DESC),
    isPartOf: { "@id": `${BASE}/#website` },
    publisher: { "@id": `${BASE}/#business` },
    /* Plain text only in schema properties — an unescaped quote or a stray tag
       invalidates the whole block and the page ships with no structured data. */
    mainEntity: {
      "@type": "ItemList",
      name: "Infinity Kitchens and Baths remodeling process",
      itemListElement: STAGES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: plain(s.h),
        description: plain(s.p[0]),
      })),
    },
  },
];
head = head.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">\n${JSON.stringify(
    { "@context": "https://schema.org", "@graph": graph }, null, 2)}\n</script>`
);

const stageHtml = STAGES.map(
  (s, i) => `<section class="section"${i % 2 ? ' style="background:#F9FAFB;"' : ""}>
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Stage ${s.n}</span>
    <h2>${s.h}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    ${s.p.map((x) => `<p>${x}</p>`).join("\n    ")}
  </div>
</section>`
).join("\n");

const sectionHtml = SECTIONS.map(
  (s, i) => `<section class="section"${(i + STAGES.length) % 2 ? ' style="background:#F9FAFB;"' : ""}>
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
    <div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="about.html">About</a><span>/</span><span style="color:rgba(255,255,255,0.75)">Our Process</span></div>
    <span class="eyebrow">Our Process</span>
    <h1>${H1}</h1>
    <p style="color:rgba(255,255,255,0.9);margin-top:0.9rem;font-size:1.05rem;max-width:560px;">Five stages, from the first free in-home visit to the written warranty — and what happens at each one.</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:860px;">
    <p style="font-size:1.05rem;">Most remodeling anxiety is not about the finished room. It is about the middle — how long the house is unusable, who is in it, what happens when something unexpected turns up behind a wall, and whether the price at the end resembles the price at the start. This page answers that before you call anyone, ours or otherwise.</p>
    <p>We are a design-build contractor, which means the people who draw your project and the people who build it work for the same company. There is no handoff between a designer and a general contractor, and no gap for a problem to fall into. <a href="design-build.html">What design-build means</a> covers why that matters.</p>
  </div>
</section>

${stageHtml}

${sectionHtml}

<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:900px;">
    <h2>Before you commit to anyone</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>Whether or not you call us, verify the licence. Arizona contractors are registered with the Arizona Registrar of Contractors, and the register is public and free to search. Ours is <strong>AZ ROC #339999</strong>, and the rest of our licensing and insurance is set out on <a href="licensing-insurance.html">licensing &amp; insurance</a>.</p>
    <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1.25rem;">
      <a href="how-to-choose-contractor.html" class="btn btn-outline-dark btn-sm">How to choose a contractor</a>
      <a href="choosing-a-contractor.html" class="btn btn-outline-dark btn-sm">Contractor checklists</a>
      <a href="faq.html" class="btn btn-outline-dark btn-sm">Common questions</a>
      <a href="financing.html" class="btn btn-outline-dark btn-sm">Financing</a>
      <a href="warranties.html" class="btn btn-outline-dark btn-sm">Warranties</a>
      <a href="gallery.html" class="btn btn-outline-dark btn-sm">See finished work</a>
    </div>
  </div>
</section>

<section class="cta-banner">
  <div class="container text-center">
    <span class="eyebrow">Free In-Home Consult</span>
    <h2>Stage one is free, and it is a conversation</h2>
    <p>We come to you, measure, and give you a written estimate — no obligation.</p>
    <div class="cta-actions">
      <a href="contact.html" class="btn btn-gold btn-lg">Get a Free Estimate</a>
      <a href="tel:9288001998" class="cta-phone-link">or call 928-800-1998</a>
    </div>
  </div>
</section>
`;

const out = head + "</head>" + nav + mainOpen + main + footer;

/* Fail loudly rather than shipping a page with dead structured data. */
for (const m of out.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
  JSON.parse(m[1]);
}

if (APPLY) {
  writeFileSync(SLUG, out);
  console.log(`${existsSync(SLUG) ? "wrote" : "created"} ${SLUG}  (${plain(main).split(/\s+/).filter(Boolean).length} words)`);
  console.log("REMINDER: run a11y-upgrade.mjs — this donor slice has no skip link or main landmark.");
} else {
  console.log(`[dry] ${SLUG}: title ${rendered(TITLE).length}, desc ${rendered(DESC).length}, ` +
    `${plain(main).split(/\s+/).filter(Boolean).length} words, JSON-LD parses. Pass --apply to write.`);
}
