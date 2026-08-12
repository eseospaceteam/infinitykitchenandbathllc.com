#!/usr/bin/env node
/**
 * Week 4: the accessibility service x city matrix.
 *
 * 4 services x 8 West Valley cities = 32 pages, plus the same 4 services for
 * Prescott = 36. The service pages all exist; the city crossings did not.
 *
 * Chrome (head, nav, footer) is lifted at build time from a live page so the
 * region-matched phone, the Maricopa footer variant, the GA + AW tracking block
 * and the consent code all come along automatically. Donor differs by region:
 * West Valley pages copy a West Valley page, Prescott pages copy a Prescott one.
 *
 * Re-run after any chrome change. Then run a11y-upgrade.mjs — this emits <main>
 * from the donor so the landmark survives, but keep that habit.
 *
 * Dry run by default; --apply to write.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { CITIES } from "./wv-city-data.mjs";
import { ACCESS_SERVICES, PRESCOTT } from "./access-service-data.mjs";
import { COHORT_OF, COHORT_BODIES } from "./access-cohort-bodies.mjs";
import { THIRD_SECTION, COHORT_FAQ } from "./access-cohort-extra.mjs";

const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force"); // rewrite pages that already exist
const BASE = "https://www.infinitykitchenandbathllc.com";
const WV_DONOR = "kitchen-remodeling-sun-city.html";
const PR_DONOR = "kitchen-remodeling.html";

const esc = (s) =>
  String(s).replace(/&(?!(?:amp|lt|gt|quot|#\d+|#x[0-9a-f]+);)/gi, "&amp;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");

/* ------------------------------------------------------------------ chrome */
function slices(donorFile) {
  const d = readFileSync(donorFile, "utf8");
  const headEnd = d.indexOf("</head>");
  const mainStart = d.indexOf("<main");
  const mainEnd = d.indexOf("</main>");
  if (headEnd < 0 || mainStart < 0 || mainEnd < 0) throw new Error(`cannot slice ${donorFile}`);
  return {
    head: d.slice(0, headEnd),
    nav: d.slice(headEnd + "</head>".length, mainStart),
    mainOpen: d.slice(mainStart, d.indexOf(">", mainStart) + 1),
    footer: d.slice(mainEnd),
  };
}

function buildHead(head, { title, desc, slug, image }) {
  let h = head;
  const url = `${BASE}/${slug}`;
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  h = h.replace(/(<meta name="description" content=")[^"]*(")/, `$1${attr(desc)}$2`);
  h = h.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  h = h.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${attr(title)}$2`);
  h = h.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${attr(desc)}$2`);
  h = h.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  h = h.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`);
  h = h.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${attr(title)}$2`);
  h = h.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${attr(desc)}$2`);
  h = h.replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);
  return h;
}

/** Replace the donor's ld+json with our own graph, keeping its business node. */
function buildSchema(head, { title, desc, slug, svc, city, faq }) {
  const m = head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error("donor has no ld+json");
  const donor = JSON.parse(m[1]);
  const nodes = donor["@graph"] ?? [donor];
  const business = nodes.filter((n) => String(n["@type"]).includes("HomeAndConstruction"));
  const url = `${BASE}/${slug}`;
  const graph = [
    ...business,
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: "Services", item: `${BASE}/services.html` },
        { "@type": "ListItem", position: 3, name: svc.parentLabel, item: `${BASE}/${svc.parent}` },
        { "@type": "ListItem", position: 4, name: city.name, item: url },
      ],
    },
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: `${svc.label} in ${city.name}, AZ`,
      serviceType: svc.label,
      description: desc,
      url,
      provider: { "@id": `${BASE}/#localbusiness` },
      areaServed: { "@type": "City", name: `${city.name}, AZ` },
    },
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      isPartOf: { "@id": `${BASE}/#website` },
      about: { "@id": `${url}#service` },
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
  return head.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${json}\n</script>`
  );
}

/* -------------------------------------------------------------- page body */
function buildMain(city, svc, faq, phone, telHref, isWV, body) {
  const secs = body
    .map(
      (s, i) => `
<section class="section"${i % 2 ? ' style="background:#F9FAFB;"' : ""}>
  <div class="container" style="max-width:860px;">
    <h2>${esc(typeof s.h === "function" ? s.h(city.name) : s.h)}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    ${s.p.map((p) => `<p>${esc(p)}</p>`).join("\n    ")}
  </div>
</section>`
    )
    .join("");

  const community = city.community
    ? `<p>${esc(city.community.note)} See <a href="${city.community.bodyUrl}" rel="nofollow noopener" target="_blank">${esc(city.community.body)}</a>.</p>`
    : "";

  const faqItems = faq
    .map(
      (f) =>
        `<div class="pillar-faq-item"><p class="pillar-faq-q">${esc(f.q)}</p><p class="pillar-faq-a">${esc(f.a)}</p></div>`
    )
    .join("");

  const sources = [
    `<li style="margin-bottom:0.5rem;"><a href="${city.authorityUrl}" rel="nofollow noopener" target="_blank">${esc(city.authorityShort)}</a> — permit requirements for ${esc(city.name)}.</li>`,
    `<li style="margin-bottom:0.5rem;"><a href="https://www.ada.gov/law-and-regs/design-standards/2010-stds/" rel="nofollow noopener" target="_blank">2010 ADA Standards for Accessible Design</a> — the dimensions referenced above (§304.3.1, §404.2.3, §609.4).</li>`,
    `<li style="margin-bottom:0.5rem;"><a href="https://www.access-board.gov/ada/" rel="nofollow noopener" target="_blank">U.S. Access Board</a> — plain-language guidance on those standards.</li>`,
    `<li style="margin-bottom:0.5rem;"><a href="https://roc.az.gov/" rel="nofollow noopener" target="_blank">Arizona Registrar of Contractors</a> — verify any contractor's licence, ours included (AZ ROC #339999).</li>`,
  ].join("");

  return `
<section class="page-hero" style="background-image:url('${svc.hero}');background-size:cover;background-position:center;">
  <div style="position:absolute;inset:0;background:linear-gradient(to right,#1B4332 0%,#1B4332 42%,rgba(27,67,50,0.55) 65%,transparent 100%);"></div>
  <div class="page-hero-inner" style="position:relative;">
    <div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="services.html">Services</a><span>/</span><a href="${svc.parent}">${esc(svc.parentLabel)}</a><span>/</span><span style="color:rgba(255,255,255,0.75)">${esc(city.name)}</span></div>
    <span class="eyebrow">${esc(svc.label)} &mdash; ${esc(city.name)}, AZ</span>
    <h1>${esc(svc.label)} in ${esc(city.name)}, AZ</h1>
    <p style="color:rgba(255,255,255,0.9);margin-top:0.9rem;font-size:1.05rem;max-width:560px;">${esc(svc.lede(city.name))}</p>
    <div class="hero-actions" style="margin-top:1.5rem;display:flex;flex-wrap:wrap;gap:0.75rem;">
      <a href="contact.html" class="btn btn-gold btn-lg">Get a Free Estimate</a>
      <a href="tel:${telHref}" class="btn btn-outline-light btn-lg">Call ${esc(phone)}</a>
    </div>
  </div>
</section>

<section class="section" style="padding-bottom:0;">
  <div class="container" style="max-width:860px;">
    <div style="background:#F4FAF6;border-left:4px solid #2B7A42;border-radius:8px;padding:1rem 1.5rem;">
      <p style="margin:0;"><strong>Quick answer:</strong> ${esc(svc.quick(city.name))}</p>
    </div>
    <p style="margin-top:1.25rem;">Part of our <a href="${svc.parent}">${esc(svc.parentLabel.toLowerCase())}</a> work${isWV ? ` — see every service and city on the <a href="west-valley.html">West Valley hub</a>` : ` across Prescott and the Quad Cities — see <a href="prescott-remodeling.html">Prescott remodeling</a>`}.</p>
  </div>
</section>
${secs}

<section class="section">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Permits &amp; Inspections</span>
    <h2>Permits for this work in ${esc(city.name)}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${esc(city.permitNote)}</p>
    <p>Accessibility work touches plumbing and often framing, so it is squarely the kind of job that gets reviewed. Moving a drain, recessing a floor for a curbless entry, or widening a doorway all change things an inspector cares about. We pull the permit and meet the inspector ourselves.</p>
    ${community}
    <p style="margin-top:1.25rem;"><a href="${city.authorityUrl}" rel="nofollow noopener" target="_blank"><strong>${esc(city.authorityShort)}</strong></a> publishes the current requirements.</p>
  </div>
</section>

<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Local Housing Stock</span>
    <h2>The ${esc(city.name)} homes this work happens in</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${esc(city.era)}</p>
    <p>${esc(city.eraImplication)}</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">How We Work Here</span>
    <h2>Scheduling ${esc(svc.short)} work in ${esc(city.name)}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${esc(city.localNote)} The free consultation comes to you — we measure in your home and quote from those measurements, not from a phone call.</p>
    <p>We group work by area so crews are on site in continuous stretches rather than appearing for a morning and disappearing. Materials are ordered and staged before demolition, which keeps the disruptive part of an accessible-bathroom project as short as it can be — and that matters more than usual when the person living with the work is the person who needs the bathroom.</p>
    <p style="margin-top:1.25rem;">Call <a href="tel:${telHref}">${esc(phone)}</a>, or read our <a href="aging-in-place-guide.html">aging-in-place guide</a> first if you are still deciding what the house needs.</p>
  </div>
</section>

<section class="section" style="background:var(--green-25,#F4FAF6);">
  <div class="container">
    <div style="text-align:center;margin-bottom:2.5rem;"><span class="eyebrow">FAQ</span><h2>${esc(svc.label)} in ${esc(city.name)} — Common Questions</h2><div class="gold-divider" style="margin:1rem auto 0;"></div></div>
    <div class="pillar-faq" style="max-width:820px;margin:0 auto;">${faqItems}</div>
  </div>
</section>

<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Sources</span>
    <h2>Check this yourself</h2>
    <div class="gold-divider" style="margin:1rem 0 1.25rem;"></div>
    <ul style="padding-left:1.25rem;margin:0 0 1rem;">${sources}</ul>
    <p style="color:var(--gray-500);font-size:0.95rem;margin:0;">Permit authorities and ADA section numbers were confirmed against the sources above in August 2026. The ADA standard governs public accommodations, not private homes.</p>
  </div>
</section>

<section class="cta-banner">
  <div class="container text-center">
    <span class="eyebrow">Free In-Home Consult</span>
    <h2>Talk through your ${esc(city.name)} bathroom</h2>
    <p>We come to you, measure, and give you a written estimate — no obligation.</p>
    <div class="cta-actions">
      <a href="contact.html" class="btn btn-gold btn-lg">Get a Free Estimate</a>
      <a href="tel:${telHref}" class="cta-phone-link">or call ${esc(phone)}</a>
    </div>
  </div>
</section>
`;
}

/* -------------------------------------------------------------------- run */
const wvSlices = slices(WV_DONOR);
const prSlices = slices(PR_DONOR);
const log = [];
let count = 0;

const targets = [
  ...Object.entries(CITIES).map(([slug, c]) => [slug, c, wvSlices, "602-885-6998", "6028856998", true]),
  ["prescott", PRESCOTT, prSlices, PRESCOTT.phone, PRESCOTT.telHref, false],
];

for (const [citySlug, city, sl, phone, telHref, isWV] of targets) {
  for (const [svcSlug, svc] of Object.entries(ACCESS_SERVICES)) {
    const slug = `${svcSlug}-${citySlug}.html`;
    if (existsSync(slug) && !FORCE) { log.push(`skip  ${slug} (exists)`); continue; }

    const cohort = COHORT_OF[citySlug];
    if (!cohort) throw new Error(`${citySlug}: no cohort assigned`);
    const base = COHORT_BODIES[svcSlug]?.[cohort];
    if (!base) throw new Error(`${svcSlug}/${cohort}: no cohort body copy`);
    const third = THIRD_SECTION[svcSlug]?.[cohort];
    if (!third) throw new Error(`${svcSlug}/${cohort}: no third section`);
    const body = [...base, third];

    const title = `${svc.label} in ${city.name}, AZ`;
    const desc = `${svc.label} in ${city.name}, AZ. Design, permits and installation by a licensed, family-owned crew. Free in-home consult. AZ ROC #339999.`;
    // build-hubs.mjs hard-fails on these; keep that guard rather than warning.
    if (title.length > 60) throw new Error(`${slug}: title ${title.length} chars > 60 — ${title}`);
    if (desc.length > 155) throw new Error(`${slug}: description ${desc.length} chars > 155`);

    const faq = [...svc.faq(city.name), ...COHORT_FAQ[cohort](svc, city.name)];
    let head = buildHead(sl.head, { title, desc, slug, image: svc.hero });
    head = buildSchema(head, { title, desc, slug, svc, city, faq });
    const html =
      head + "</head>" + sl.nav + sl.mainOpen +
      buildMain(city, svc, faq, phone, telHref, isWV, body) +
      sl.footer;

    if (APPLY) writeFileSync(slug, html);
    count++;
    log.push(`new   ${slug}`);
  }
}

for (const l of log) console.log("  " + l);
console.log(`\n${count} page(s) ${APPLY ? "written" : "would be created"}`);
if (!APPLY) console.log("  (dry run — pass --apply to write)");
