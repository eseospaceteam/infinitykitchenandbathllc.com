#!/usr/bin/env node
/**
 * Builds the pages for the two cities on the client's Aug-2026 territory sheet
 * that the site did not cover: Litchfield Park and El Mirage.
 *
 * Three pages per city, matching the shape the other eight already have:
 *   <slug>-remodeling.html            city landing page
 *   kitchen-remodeling-<slug>.html    service x city
 *   bathroom-remodeling-<slug>.html   service x city
 *
 * Chrome (the two-tag GA/Ads head block, nav, footer, scripts) is lifted at
 * build time from the Avondale equivalent, so anything sitewide — the promo
 * bar, the consent block, the a11y skip link and <main> landmark — comes along
 * automatically and stays in sync. The donor pages are READ ONLY; this script
 * writes nothing but the six new files.
 *
 * The depth sections are fenced with <!-- wk3:depth --> on purpose: these pages
 * ship at full depth, and that fence is what makes deepen-west-valley.mjs skip
 * them instead of stacking a second copy on top.
 *
 *   node build-territory-cities.mjs          dry run, reports what it would write
 *   node build-territory-cities.mjs --apply  write the files
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { CITIES, SERVICE, SOURCES_NOTE } from "./wv-city-data.mjs";

const APPLY = process.argv.includes("--apply");
const SITE = "https://www.infinitykitchenandbathllc.com";
const IMG = `${SITE}/wp-content/uploads/2026/06`;
const PHONE = "602-885-6998";
const PHONE_TEL = "6028856998";
const ROC = "AZ ROC #339999";

const TARGETS = ["litchfield-park", "el-mirage"];

// Hero photography, varied per page so the six do not read as one template.
const HERO = {
  "litchfield-park": {
    city: "luxury-white-kitchen-wood-ceiling-marble-island-opt.jpg",
    kitchen: "dark-walnut-kitchen-black-granite-gold-sink-opt.jpg",
    bathroom: "luxury-master-bathroom-wood-vanity-freestanding-tub-opt.jpg",
  },
  "el-mirage": {
    city: "gray-kitchen-remodel-quartz-island-black-hardware-opt.jpg",
    kitchen: "light-blue-kitchen-cabinet-gold-hardware-install-opt.jpg",
    bathroom: "double-vanity-gray-cabinet-quartz-countertop-opt.jpg",
  },
};

/**
 * PAGE ROLES — this is the part that keeps the three pages per city from being
 * the same page three times.
 *
 * The city page is the canonical local page: it carries the full permit
 * treatment, the full housing-stock treatment, scheduling and sources.
 * The two service pages carry service scope plus a SHORT city-specific brief
 * that links back rather than restating it. A first pass that gave all three
 * the full depth block measured 78% shared sentences within a city, which is
 * exactly the doorway-page shape we are trying not to build.
 */

// Per-city framing for the opening section. Kept out of wv-city-data.mjs
// because that file is reserved for checkable facts about the jurisdiction;
// this is positioning copy.
const PITCH = {
  "litchfield-park": {
    lead:
      "Litchfield Park is a small city with a long memory, and it shows in the houses. Some of what we are asked to work on here was built when this was still a Goodyear Tire company town; some of it went up decades later on the land around it. The two need completely different approaches, and the quickest way to get a bad quote in this city is to hire someone who does not ask which one you have.",
    second:
      "We are a design-build contractor, which means the person who designs your kitchen and the people who build it answer to the same company. There is no handoff between a designer and a builder for a problem to fall through. For Litchfield Park work that matters more than usual, because the older homes here reward planning and punish improvisation.",
    third:
      "Every consultation is free and happens in your home. We measure, we look at what is actually behind the finishes where we can, we bring samples, and we quote from what we found rather than from a template.",
  },
  "el-mirage": {
    lead:
      "Most of El Mirage was built inside a single decade, and that turns out to be the most useful thing we know about a job here. The city's kitchens and bathrooms are ageing on roughly the same clock, which means we have seen your house before — not a house like yours, the same builder's plan with the same finishes reaching the end of the same twenty years.",
    second:
      "That predictability is worth money to you. When the rough-in behind the wall is modern and sound, a remodel stops being a repair job with a finish attached and becomes finish work, which is far easier to price accurately and far less likely to move once it starts.",
    third:
      "We are a design-build contractor, so design and construction sit under one roof and one warranty. The consultation is free and we come to you in El Mirage — we measure in your home and quote from those measurements, not from a phone call.",
  },
};

// Service-page copy. Deliberately does not reuse a sentence from PITCH above —
// a visitor who lands on the kitchen page and then the city page should not be
// reading the same three paragraphs twice.
const SERVICE_PITCH = {
  "litchfield-park": {
    kitchen: {
      lead:
        "Kitchens are where the age gap in Litchfield Park's housing shows up hardest. The older homes near the village core were laid out when a kitchen was a working room with a door on it, not the space the rest of the house opens onto — so the brief here is often as much about the wall between the kitchen and everything else as it is about cabinets.",
      local:
        "In the newer subdivisions the job is usually the opposite: the layout already works and what has dated is the finish level. Either way, the permit comes from the city's own Building Safety Department, and moving a wall or adding circuits is what turns a counter-and-cabinet job into a reviewed one.",
    },
    bathroom: {
      lead:
        "Bathrooms in the older Litchfield Park homes tend to be small, tiled to the ceiling in something from another era, and plumbed exactly once. That is not a problem so much as a fact to plan around — we would rather know what is behind the tile before we quote than find out in week one.",
      local:
        "One point specific to this city works in your favour: the Design Review Board's remit is the exterior of the building, so an interior bathroom remodel normally sits outside it entirely. What can still apply is your HOA's CC&Rs, which the city is explicit are not its to enforce.",
    },
  },
  "el-mirage": {
    kitchen: {
      lead:
        "El Mirage kitchens are unusually consistent, and that is genuinely good news. When a whole neighbourhood went in over three or four years, the kitchens went in with it — the same cabinet boxes, the same laminate, the same layout repeated down the street. We have almost certainly worked in your floor plan already.",
      local:
        "Because the boxes and the rough-in are typically sound, most El Mirage kitchens do not need gutting. Doors, drawer fronts, counters, a sink and lighting will change the room completely at a fraction of what a full replacement costs, and we will tell you when that is the better buy rather than selling you the bigger job.",
    },
    bathroom: {
      lead:
        "The single most requested job we see in this part of the West Valley is taking out a builder-grade tub-and-surround and putting in a proper shower. In El Mirage that request comes with an advantage: the plumbing behind it is modern, so the conversion is a known quantity rather than an excavation.",
      local:
        "Second bathrooms matter more here than they do in the retirement communities up the road — this is a young city, and a hall bath that three people share does not get to be out of service for a month. We schedule around that, and we say up front how many days the room is genuinely unusable.",
    },
  },
};

// FAQs are emitted twice — as visible markup and as FAQPage schema — from this
// one source, so the two cannot drift apart. The city set and the service sets
// share no question, by design.
function cityFaqs(c) {
  const lp = c.name === "Litchfield Park";
  return [
    {
      q: `Who issues the permit for a remodel in ${c.name}?`,
      a: lp
        ? "The City of Litchfield Park's own Building Safety Department reviews the plans, issues the permit and inspects the work, from City Hall at 214 W Wigwam Blvd. The city publishes a five to ten business day review for residential remodels and additions, and simple permits needing no review may be issued over the counter. One caution specific to this city: the Litchfield Park postal address covers more ground than the 3.3-square-mile city itself, so a home addressed to Litchfield Park may sit outside the city limits and be permitted by a different jurisdiction. We confirm that before we quote."
        : "The City of El Mirage issues it through Development Services at 10000 N El Mirage Road. A permit is required whenever a building is remodelled, renovated or enlarged, and for the electrical and plumbing that goes with it. Since the start of 2024 the city has run applications, inspection scheduling and payment through its online portal, ELM ONLINE. We pull the permit and meet the inspector ourselves.",
    },
    {
      q: `What kind of remodel do ${c.name} homes usually need?`,
      a: lp
        ? "It depends which Litchfield Park you live in. Homes near the original village core are old enough that we plan for what is behind the walls as much as what is in front of them. Houses in the later subdivisions around the city are generally sound structurally, and the work is about replacing finishes chosen for a different decade. We tell you which situation you are in before you sign anything."
        : "Overwhelmingly it is finish replacement rather than repair. Most of El Mirage's housing is roughly sixteen to twenty-five years old, so the wear arrives together and it is cosmetic: laminate counters, thermofoil or oak cabinet doors, a fibreglass tub surround, a builder mirror and the original fixtures. The structure and the rough-in are usually fine, which is why El Mirage projects tend to hold their quoted price.",
    },
    {
      q: `Do you charge for the consultation in ${c.name}?`,
      a: `No. The in-home consultation is free and carries no obligation. We come to you in ${c.name}, measure the space, bring material samples and leave you with a written quote. If you would rather handle materials first, our Prescott showroom is open, but nothing in our process requires you to drive to it.`,
    },
  ];
}

function serviceFaqs(c, svKey) {
  const kitchen = svKey === "kitchen";
  return [
    {
      q: `How long does a ${kitchen ? "kitchen" : "bathroom"} remodel take in ${c.name}?`,
      a: kitchen
        ? "Two to four weeks on site for most kitchens, and cabinet lead times rather than labour are usually what set the start date. We order, template and stage materials before demolition begins, so the disruptive stretch is as short as we can make it. You get a written schedule before any work starts."
        : "Two to four weeks from demolition to punch list for most bathrooms. Converting a tub to a walk-in shower, moving a drain or taking out a curb runs longer than a like-for-like fixture swap, because it changes the waterproofing, the floor build-up and sometimes the framing. We tell you which one your project is at the quote, not halfway through.",
    },
    {
      q: `Does a ${kitchen ? "kitchen" : "bathroom"} remodel in ${c.name} need a permit?`,
      a: kitchen
        ? `Usually yes, once anything beyond a straight cabinet-and-counter swap is involved — new circuits for countertop receptacles, a dedicated appliance run, range ventilation, or moving a sink or dishwasher. ${c.authorityShort} publishes the current requirements, and we handle the application and the inspections as part of the job.`
        : `Almost always. Bathroom work is plumbing-led, and supply, drain and vent changes are exactly what the permit exists to cover — as is the electrical for lighting, exhaust and GFCI protection. ${c.authorityShort} publishes the current requirements, and we pull the permit and meet the inspector ourselves.`,
    },
    {
      q: kitchen
        ? `Can you work with the existing cabinets in a ${c.name} kitchen?`
        : `Can you convert a tub to a walk-in shower in a ${c.name} home?`,
      a: kitchen
        ? "Often, and we will say so when it is the better buy. Where the boxes are sound, new doors and drawer fronts, counters, a sink and lighting will change the room completely for a fraction of a full replacement. Where they are not — water damage, particleboard that has swollen, a layout that does not work — we will tell you that instead."
        : `Yes, and it is the most requested single change we make out here. It is a bigger job than it looks: taking out a tub changes the waterproofing, the floor build-up and sometimes the framing, and it is the point at which we add blocking for grab bars whether or not you want them fitted now. Doing that at the same time costs very little; adding it later means opening the wall again.`,
    },
  ];
}

const esc = (s) =>
  String(s)
    .replace(/&(?!(?:amp|lt|gt|quot|#\d+);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
// JSON-LD text properties must be plain text — no markup, no smart punctuation
// that has to be escaped. Strip entities back to characters for schema use.
const plain = (s) =>
  String(s)
    .replace(/&mdash;/g, "—")
    .replace(/&rsquo;/g, "’")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, "");

/* ── chrome ───────────────────────────────────────────────────────────────── */

function chrome(donor) {
  const src = readFileSync(donor, "utf8");
  const mainAt = src.indexOf('<main id="main"');
  const mainEnd = src.indexOf("</main>");
  if (mainAt < 0 || mainEnd < 0) throw new Error(`${donor}: no <main> landmark to split on`);
  const head = src.slice(0, mainAt);
  const foot = src.slice(mainEnd);
  const ld = head.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
  if (ld.length !== 1) throw new Error(`${donor}: expected 1 ld+json block in head, found ${ld.length}`);
  return { head, foot, ldBlock: ld[0] };
}

function retitle(head, { title, desc, url, image, ldBlock, schema }) {
  let h = head;
  const swaps = [
    [/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`],
    [/<meta name="description" content="[^"]*">/, `<meta name="description" content="${desc}">`],
    [/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`],
    [/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`],
    [/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${desc}">`],
    [/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`],
    [/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${image}">`],
    [/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${title}">`],
    [/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${desc}">`],
    [/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${image}">`],
  ];
  for (const [re, to] of swaps) {
    if (!re.test(h)) throw new Error(`head is missing ${re} — donor markup changed`);
    h = h.replace(re, to);
  }
  return h.replace(ldBlock, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
}

/* ── schema ───────────────────────────────────────────────────────────────── */

function schemaFor(c, slug, { file, title, desc, url, crumbLeaf, faqList }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HomeAndConstructionBusiness",
        "@id": `${SITE}/#business-avondale`,
        name: "Infinity Kitchens and Baths — Avondale",
        url: `${SITE}/west-valley.html`,
        telephone: "+1-602-885-6998",
        priceRange: "$",
        image: `${SITE}/wp-content/uploads/2023/11/infinity-logo.png`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "316 N Central Ave",
          addressLocality: "Avondale",
          addressRegion: "AZ",
          postalCode: "85323",
          addressCountry: "US",
        },
        areaServed: Object.values(CITIES).map((x) => ({ "@type": "City", name: x.name })),
        parentOrganization: { "@id": `${SITE}/#business` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "West Valley", item: `${SITE}/west-valley.html` },
          { "@type": "ListItem", position: 3, name: crumbLeaf, item: url },
        ],
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: plain(title),
        serviceType: plain(title),
        description: plain(desc),
        url,
        provider: { "@id": `${SITE}/#business-avondale` },
        areaServed: [{ "@type": "City", name: c.name }],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faqList.map((f) => ({
          "@type": "Question",
          name: plain(f.q),
          acceptedAnswer: { "@type": "Answer", text: plain(f.a) },
        })),
      },
    ],
  };
}

/* ── body sections ────────────────────────────────────────────────────────── */

const hero = (c, { image, crumbLeaf, eyebrow, h1 }) => `
<section class="page-hero" style="background-image:url('${image}');background-size:cover;background-position:center;">
  <div style="position:absolute;inset:0;background:linear-gradient(to right,#1B4332 0%,#1B4332 42%,rgba(27,67,50,0.55) 65%,transparent 100%);"></div>
  <div class="page-hero-inner" style="position:relative;">
    <div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="west-valley.html">West Valley</a><span>/</span><span style="color:rgba(255,255,255,0.75)">${crumbLeaf}</span></div>
    <span class="eyebrow">${eyebrow}</span>
    <h1>${h1}</h1>
    <p style="color:rgba(255,255,255,0.85);max-width:520px;margin-top:1rem;">Licensed &bull; Bonded &bull; Insured &bull; ${ROC}<br>Call <a href="tel:${PHONE_TEL}" style="color:var(--gold);font-weight:700;">${PHONE}</a> for a free consultation</p>
  </div>
</section>

<div class="hub-uplink"><div class="container"><p>${c.name} is part of the West Valley area we serve &mdash; see every service and city on our <a href="west-valley.html">West Valley remodeling hub</a>, or call <a href="tel:${PHONE_TEL}">${PHONE}</a>.</p></div></div>`;

const intro = (c, slug, heading) => {
  const p = PITCH[slug];
  return `
<section class="section">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Local Remodeling</span>
    <h2>${heading}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${p.lead}</p>
    <p>${p.second}</p>
    <p>${p.third}</p>
  </div>
</section>`;
};

const servicesGrid = (c) => `
<section class="section" style="background:var(--green-25);">
  <div class="container">
    <div style="text-align:center;max-width:720px;margin:0 auto 2.5rem;">
      <span class="eyebrow">What We Do</span>
      <h2>Full-service remodeling for ${c.name} homeowners</h2>
      <div class="gold-divider" style="margin:1rem auto 0;"></div>
    </div>
    <div class="grid-3">
      <div class="card"><h3><a href="kitchen-remodeling.html">Kitchen Remodeling</a></h3><p>Cabinets, countertops, lighting and layout &mdash; from a finish-level refresh to taking a wall out.</p></div>
      <div class="card"><h3><a href="bathroom-remodeling.html">Bathroom Remodeling</a></h3><p>Primary and guest bathrooms, vanities, tile and fixtures, done to a written schedule.</p></div>
      <div class="card"><h3><a href="tub-to-shower.html">Tub-to-Shower Conversion</a></h3><p>The most requested single change we make, and the one that most often needs a permit.</p></div>
      <div class="card"><h3><a href="walk-in-showers.html">Walk-In &amp; Curbless Showers</a></h3><p>Including zero-entry work where getting over a curb has stopped being easy.</p></div>
      <div class="card"><h3><a href="countertops.html">Custom Countertops</a></h3><p>Quartz, granite and solid surface, templated in your home and fitted by our own crew.</p></div>
      <div class="card"><h3><a href="luxury-vinyl-flooring.html">Flooring &amp; LVP</a></h3><p>Usually done alongside a kitchen or bathroom, which saves a second round of disruption.</p></div>
    </div>
  </div>
</section>`;

function permitsSection(c, svLabel) {
  const community = c.community
    ? `
    <h3 style="margin-top:1.75rem;">The rules that sit alongside the permit</h3>
    <p>${c.community.note.replace(
      c.community.body,
      `<a href="${c.community.bodyUrl}" rel="nofollow noopener" target="_blank">${c.community.body}</a>`
    )}</p>`
    : "";
  return `
<section class="section">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Permits &amp; Inspections</span>
    <h2>Who issues a ${svLabel} permit in ${c.name}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${c.permitNote}</p>
    <p>We pull the permit and meet the inspector ourselves. You should not be the one learning a municipal submittal process in the middle of your own remodel &mdash; and a contractor who suggests skipping the permit on a job that needs one is telling you something useful about how they work.</p>
    ${community}
    <p style="margin-top:1.5rem;"><a href="${c.authorityUrl}" rel="nofollow noopener" target="_blank"><strong>${c.authorityShort}</strong></a> publishes the current requirements.</p>
  </div>
</section>`;
}

const homesSection = (c) => `
<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Local Housing Stock</span>
    <h2>The ${c.name} homes we work in</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${c.era}</p>
    <p>${c.eraImplication}</p>
    <p>It is worth asking any ${c.name} contractor what they expect to find behind your walls before they quote. A number produced without that question is a guess with a decimal point on it.</p>
  </div>
</section>`;

const logisticsSection = (c, svLabel) => `
<section class="section">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">How We Work Here</span>
    <h2>Scheduling ${svLabel} work in ${c.name}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>Being straight about this converts better than dancing around it: our shop and showroom are in Prescott, and we hold a location in Avondale. ${c.localNote} You are not around the corner from us, and pretending otherwise would not survive your first phone call.</p>
    <p>What that means in practice is that we do not do drop-ins, and we do not run a job with a rotating cast. We group ${c.name} work so crews are on site in continuous stretches rather than appearing for a morning and vanishing for three days. Materials are ordered, templated and staged before demolition starts, so the disruptive part of your project is as short as we can make it.</p>
    <p>The free consultation comes to you &mdash; we measure in your home, in ${c.name}, and quote from those measurements.</p>
    <p style="margin-top:1.25rem;">Call <a href="tel:${PHONE_TEL}">${PHONE}</a> for ${c.name} projects, or start on the <a href="west-valley.html">West Valley hub</a> to see every service and city we cover out here.</p>
  </div>
</section>`;

const sourcesSection = (c) => `
<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Sources</span>
    <h2>Check this yourself</h2>
    <div class="gold-divider" style="margin:1rem 0 1.25rem;"></div>
    <ul style="padding-left:1.25rem;margin:0 0 1rem;">
      <li style="margin-bottom:0.5rem;"><a href="${c.authorityUrl}" rel="nofollow noopener" target="_blank">${c.authorityShort}</a> &mdash; permit requirements and applications for ${c.name}.</li>
      ${c.community ? `<li style="margin-bottom:0.5rem;"><a href="${c.community.bodyUrl}" rel="nofollow noopener" target="_blank">${c.name} building permit questions and answers</a> &mdash; review times, exemptions, and the design review and CC&amp;R split.</li>` : ""}
      <li style="margin-bottom:0.5rem;"><a href="https://roc.az.gov/" rel="nofollow noopener" target="_blank">Arizona Registrar of Contractors</a> &mdash; verify any contractor's licence, ours included (${ROC}).</li>
    </ul>
    <p style="color:var(--gray-500);font-size:0.95rem;margin:0;">${SOURCES_NOTE}</p>
  </div>
</section>`;

/**
 * Service-page depth. City-agnostic on purpose: this is what actually differs
 * between a kitchen job and a bathroom job, and repeating it across cities is
 * the defensible axis of duplication. The indefensible one — three pages about
 * the same city saying the same thing — is handled by the page-role split.
 */
const STAGES = {
  kitchen: [
    ["Design and measure", "We measure in your home, agree the layout, and settle cabinet and counter selections before anything is ordered. Nothing goes to the supplier until you have signed off on a drawing you understand."],
    ["Order and template", "Cabinets are ordered first because they set the schedule. Countertops are templated off the installed boxes rather than off the drawing, which is the only way to get a seam and an overhang that look intentional."],
    ["Demolition and rough-in", "Old cabinets and counters come out, and any electrical or plumbing changes are done and inspected while the walls are open. This is the noisy week."],
    ["Cabinet installation", "Boxes are set, levelled and scribed to the walls. Very few walls in any house are straight; the scribing is what stops that showing."],
    ["Counters, splash and finish", "Counters are fitted, plumbing and appliances reconnected, splash tiled, lighting and hardware fitted, and we walk the room with you against a punch list."],
  ],
  bathroom: [
    ["Design and measure", "We measure, confirm what is behind the finishes where we can, and agree fixtures, tile and layout before ordering. If a tub is becoming a shower, this is where the drain position and the floor build-up get decided."],
    ["Demolition", "Tile, tub or surround, vanity and flooring come out. Bathrooms are the room where what is behind the wall most often changes the plan, so we open up early rather than late."],
    ["Rough-in and inspection", "Supply, drain and vent work, plus electrical for lighting, exhaust and GFCI protection. This is the stage the inspector sees, and it is the stage that a job done without a permit skips."],
    ["Waterproofing and tile", "Pan, waterproofing membrane and tile. Done properly this is invisible for thirty years; done casually it is a claim in three."],
    ["Fixtures and finish", "Vanity, fixtures, glass, mirror and trim, then a punch-list walk with you before we call it done."],
  ],
};

const PRICING = {
  kitchen:
    "The number moves on three things, in this order: cabinets, whether the layout changes, and counters. Cabinets are usually the single largest line, and the gap between a refaced box and a full custom run is wider than most people expect — which is why we quote both when both are viable. A layout change is the step that pulls in electrical, plumbing and a plan review, so it is the decision that most affects the schedule as well as the price. Counters vary by material and by how much of it you need, and an island adds more than its square footage suggests because of the edge work.",
  bathroom:
    "Bathrooms price on what you are changing rather than on square footage. A like-for-like swap — vanity, toilet, fixtures, tile in the same places — is the lightest version and the most predictable. The moment the drain moves, the curb comes out, or a tub becomes a shower, you are into waterproofing, floor build-up and sometimes framing, and the number moves accordingly. Tile choice matters more than people expect: a large-format tile on an out-of-plumb wall costs more in labour than a small one, because the wall has to be made flat first.",
};

const stagesSection = (c, svKey, label) => `
<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">The Process</span>
    <h2>How a ${label.toLowerCase()} remodel actually runs</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <ol style="padding-left:1.25rem;margin:0;">
      ${STAGES[svKey]
        .map(
          ([t, d]) =>
            `<li style="margin-bottom:1rem;"><strong>${t}.</strong> ${d}</li>`
        )
        .join("\n      ")}
    </ol>
  </div>
</section>`;

const pricingSection = (c, svKey, label) => `
<section class="section">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">What Drives the Price</span>
    <h2>What moves the number on a ${label.toLowerCase()} remodel</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${PRICING[svKey]}</p>
    <p>We quote from measurements taken in your home, not from a phone call, and the quote itemises those decisions so you can see what each one is costing you. If something we find during demolition changes the scope, you hear about it that day with a number attached &mdash; not at the end.</p>
  </div>
</section>`;

const faqSection = (c, list, heading) => `
<section class="section">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">FAQ</span>
    <h2>${heading}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    ${list
      .map(
        (f) => `<div style="margin-bottom:1.75rem;">
      <h3 style="margin-bottom:0.5rem;">${f.q}</h3>
      <p style="margin:0;">${f.a}</p>
    </div>`
      )
      .join("\n    ")}
  </div>
</section>`;

const ctaSection = (c, what) => `
<section class="section section-forest">
  <div class="container" style="text-align:center;max-width:720px;">
    <h2 style="color:#fff;">Ready to start your ${c.name} ${what}?</h2>
    <p style="color:rgba(255,255,255,0.85);margin:1rem auto 2rem;">Free in-home consultation, no obligation. We measure, bring samples, and leave you with a written quote.</p>
    <a href="contact.html" class="btn btn-gold">Book a Free In-Home Consult</a>
    <p style="color:rgba(255,255,255,0.75);margin-top:1.25rem;font-size:0.95rem;">Or call <a href="tel:${PHONE_TEL}" style="color:var(--gold);font-weight:700;">${PHONE}</a></p>
  </div>
</section>`;

const relatedSection = (c, slug, svKey) => {
  const links = [
    svKey !== "kitchen" ? `<li style="margin-bottom:0.5rem;"><a href="kitchen-remodeling-${slug}.html">Kitchen remodeling in ${c.name}</a></li>` : "",
    svKey !== "bathroom" ? `<li style="margin-bottom:0.5rem;"><a href="bathroom-remodeling-${slug}.html">Bathroom remodeling in ${c.name}</a></li>` : "",
    svKey !== null ? `<li style="margin-bottom:0.5rem;"><a href="${slug}-remodeling.html">All remodeling services in ${c.name}</a></li>` : "",
    `<li style="margin-bottom:0.5rem;"><a href="west-valley.html">The West Valley remodeling hub</a></li>`,
    `<li style="margin-bottom:0.5rem;"><a href="aging-in-place.html">Aging in place and accessible bathrooms</a></li>`,
  ].filter(Boolean);
  return `
<section class="section section-gray">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Keep Reading</span>
    <h2>Related pages</h2>
    <div class="gold-divider" style="margin:1rem 0 1.25rem;"></div>
    <ul style="padding-left:1.25rem;margin:0;">${links.join("")}</ul>
  </div>
</section>`;
};

/* ── page assembly ────────────────────────────────────────────────────────── */

function buildPage({ donor, file, c, slug, svKey }) {
  const sv = svKey ? SERVICE[svKey] : null;
  const svLabel = sv ? `${sv.label.toLowerCase()} remodel` : "remodel";
  const url = `${SITE}/${file}`;
  const image = `${IMG}/${HERO[slug][svKey || "city"]}`;

  const title = sv
    ? `${sv.label} Remodeling in ${c.name}, AZ`
    : `Kitchen &amp; Bathroom Remodeling in ${c.name}, AZ`;
  const desc = sv
    ? `${sv.label} remodeling in ${c.name}, AZ by Infinity Kitchens and Baths. Licensed ${ROC}, bonded and insured. Free in-home consultation. Call ${PHONE}.`
    : `Kitchen and bathroom remodeling in ${c.name}, AZ by Infinity Kitchens and Baths. Licensed ${ROC}, bonded and insured. Free in-home consultation. Call ${PHONE}.`;
  const crumbLeaf = sv ? `${c.name} ${sv.label}` : c.name;
  const h1 = sv ? `${sv.label} Remodeling in ${c.name}, AZ` : `Kitchen &amp; Bathroom Remodeling in ${c.name}, AZ`;
  const eyebrow = sv
    ? `West Valley ${sv.label} Remodeling &mdash; ${c.name}, AZ`
    : `West Valley Remodeling &mdash; ${c.name}, AZ`;

  const faqList = sv ? serviceFaqs(c, svKey) : cityFaqs(c);
  const { head, foot, ldBlock } = chrome(donor);
  const schema = schemaFor(c, slug, { file, title, desc, url, crumbLeaf, faqList });

  let body;
  if (sv) {
    const sp = SERVICE_PITCH[slug][svKey];
    body = [
      hero(c, { image, crumbLeaf, eyebrow, h1 }),
      `
<section class="section">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">${sv.label} Remodeling</span>
    <h2>${sv.label} remodeling in ${c.name}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${sp.lead}</p>
    <p>${sp.local}</p>
  </div>
</section>`,
      `
<section class="section" style="background:var(--green-25);">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Scope</span>
    <h2>What a ${sv.label.toLowerCase()} project involves</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${sv.trades}</p>
    <p>${sv.scopeNote}</p>
    <p>We pull the permit and meet the inspector ourselves. A contractor who suggests skipping one on a job that needs it is telling you something useful about how they work.</p>
  </div>
</section>`,
      stagesSection(c, svKey, sv.label),
      pricingSection(c, svKey, sv.label),
      // The full jurisdiction, housing-stock and scheduling treatment lives on
      // the city page. This points there rather than repeating it.
      `
<section class="section">
  <div class="container" style="max-width:860px;">
    <span class="eyebrow">Local Detail</span>
    <h2>Permits, housing stock and scheduling in ${c.name}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${c.name} projects are permitted by <a href="${c.authorityUrl}" rel="nofollow noopener" target="_blank">${c.authorityShort}</a>, and what we expect to find behind your walls depends on when your part of ${c.name} was built. Both are covered properly &mdash; along with how we schedule work out here from Prescott and Avondale &mdash; on our <a href="${slug}-remodeling.html">${c.name} remodeling page</a>.</p>
    <p style="margin-top:1.25rem;">Call <a href="tel:${PHONE_TEL}">${PHONE}</a> for ${c.name} ${sv.label.toLowerCase()} projects, or book the free in-home consultation and we will come and measure.</p>
  </div>
</section>`,
      faqSection(c, faqList, `${sv.label} remodeling in ${c.name} &mdash; common questions`),
      ctaSection(c, `${sv.label.toLowerCase()} remodel`),
      relatedSection(c, slug, svKey),
    ].join("\n");
  } else {
    body = [
      hero(c, { image, crumbLeaf, eyebrow, h1 }),
      intro(c, slug, `${c.name}'s design-build remodeling team`),
      servicesGrid(c),
      "\n<!-- wk3:depth -->",
      permitsSection(c, svLabel),
      homesSection(c),
      logisticsSection(c, svLabel),
      sourcesSection(c),
      "<!-- /wk3:depth -->\n",
      faqSection(c, faqList, `Remodeling in ${c.name} &mdash; common questions`),
      ctaSection(c, "remodel"),
      relatedSection(c, slug, svKey),
    ].join("\n");
  }

  return retitle(head, { title, desc, url, image, ldBlock, schema }) +
    '<main id="main" tabindex="-1">\n' +
    body +
    "\n" +
    foot;
}

/* ── run ──────────────────────────────────────────────────────────────────── */

const jobs = [];
for (const slug of TARGETS) {
  const c = CITIES[slug];
  if (!c) throw new Error(`${slug} is not in wv-city-data.mjs`);
  jobs.push({ donor: "avondale-remodeling.html", file: `${slug}-remodeling.html`, c, slug, svKey: null });
  jobs.push({ donor: "kitchen-remodeling-avondale.html", file: `kitchen-remodeling-${slug}.html`, c, slug, svKey: "kitchen" });
  jobs.push({ donor: "bathroom-remodeling-avondale.html", file: `bathroom-remodeling-${slug}.html`, c, slug, svKey: "bathroom" });
}

let written = 0;
for (const job of jobs) {
  if (!existsSync(job.donor)) throw new Error(`donor missing: ${job.donor}`);
  // Never clobber an existing page — this script only ever adds.
  if (existsSync(job.file)) {
    console.log(`  skip   ${job.file} (already exists)`);
    continue;
  }
  const html = buildPage(job);
  const words = html
    .slice(html.indexOf("<main"), html.indexOf("</main>"))
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  if (APPLY) writeFileSync(job.file, html);
  written++;
  console.log(`  build  ${job.file}  (${words} words)`);
}

console.log(`\n${written} page(s) ${APPLY ? "written" : "would be written"}`);
if (!APPLY) console.log("  (dry run — pass --apply to write)");
