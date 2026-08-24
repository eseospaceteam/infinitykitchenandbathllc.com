#!/usr/bin/env node
// Builds yavapai-county-remodeling.html — the regional hub for the 43 Yavapai
// County pages, which until now hung flat off Home with no regional parent.
// Modelled on west-valley.html, its West Valley counterpart.
import { readFileSync, writeFileSync } from 'node:fs';

const ORIGIN = 'https://www.infinitykitchenandbathllc.com';
const SLUG = 'yavapai-county-remodeling.html';
const DONOR = 'prescott-remodeling.html'; // same footer variant as the Yavapai city pages

const TITLE = 'Prescott &amp; Yavapai County Remodeling | Infinity K&amp;B';
const DESC = 'Kitchen and bathroom remodeling across Prescott, the Quad Cities and the Verde Valley. Licensed AZ ROC #339999, family-owned, free in-home consult.';
const HERO = `${ORIGIN}/wp-content/uploads/2026/06/modern-white-kitchen-remodel-gold-accents-opt.jpg`;

// Every blurb below is derived from the target page's own title/description,
// never from its slug. See memory: misleading-slug-breaks-hub-blurbs.
const GROUPS = [
  {
    id: 'prescott',
    heading: 'Prescott',
    intro: 'Our showroom is on North Montezuma Street, so Prescott is home turf. The city page is the place to start; the four neighbourhood pages go deeper on the housing stock in each part of town.',
    cities: [
      { name: 'Prescott, AZ', href: 'prescott-remodeling.html',
        blurb: 'The main Prescott page — kitchen and bathroom remodeling from a family-owned contractor that has worked here since 2011.' },
      { name: 'Downtown Prescott', href: 'downtown-prescott-remodeling.html',
        blurb: 'Historic home remodeling for the Victorian and Craftsman houses around the Courthouse Plaza, where period detail has to be respected.' },
      { name: 'South Prescott', href: 'south-prescott-remodeling.html',
        blurb: 'Older homes and dated layouts. This is the page for closed-off kitchens and original bathrooms that need more than a cosmetic refresh.' },
      { name: 'Prescott Lakes', href: 'prescott-lakes-remodeling.html',
        blurb: 'Refreshing early-2000s builder finishes — quartz counters, cabinet refacing and updated master baths.' },
      { name: 'Yavapai Hills', href: 'yavapai-hills-remodeling.html',
        blurb: 'Custom kitchens, large islands and spa master baths for the ranch-style homes on the east side of town.' },
    ],
  },
  {
    id: 'quad-cities',
    heading: 'The Quad Cities',
    intro: 'Prescott Valley, Chino Valley and Dewey-Humboldt are a short drive from the showroom and we work in all three every year. Each has its own building department, which matters when a project needs a permit.',
    cities: [
      { name: 'Prescott Valley, AZ', href: 'prescott-valley-remodeling.html',
        blurb: 'Serving StoneRidge, Glassford Hill and Viewpoint — custom cabinets, quartz counters and backsplash work.' },
      { name: 'Chino Valley, AZ', href: 'chino-valley-remodeling.html',
        blurb: 'Durable remodels built for ranch, manufactured and horse properties — including the hard-water know-how those homes need.' },
      { name: 'Dewey-Humboldt, AZ', href: 'dewey-humboldt-remodeling.html',
        blurb: 'Older homes along the SR-169 corridor, where what is behind the walls usually decides the scope.' },
    ],
  },
  {
    id: 'verde-valley',
    heading: 'The Verde Valley &amp; Sedona',
    intro: 'Over the hill from Prescott, the Verde Valley is a different market again — Old Town cottages, second homes and red-rock properties that often go through design review.',
    cities: [
      { name: 'Cottonwood, AZ', href: 'cottonwood-remodeling.html',
        blurb: 'Serving Old Town and West Cottonwood with kitchen remodels, walk-in showers and full bathroom work.' },
      { name: 'Sedona, AZ', href: 'sedona-remodeling.html',
        blurb: 'Luxury kitchen and bathroom remodeling, with the design-review experience Sedona projects tend to require.' },
      { name: 'Camp Verde, AZ', href: 'camp-verde-remodeling.html',
        blurb: 'Kitchen and bathroom remodeling and LVP flooring for Camp Verde homes.' },
    ],
  },
  {
    id: 'rural',
    heading: 'Rural &amp; Unincorporated Yavapai County',
    intro: 'Plenty of our customers are outside any town boundary. That changes who issues the permit, not whether we will drive out — there is no travel fee inside our service area.',
    cities: [
      { name: 'Williamson Valley', href: 'williamson-valley-remodeling.html',
        blurb: 'Premium kitchen and bathroom remodeling for Williamson Valley’s custom homes.' },
      { name: 'Mayer, AZ', href: 'mayer-remodeling.html',
        blurb: 'Kitchen and bathroom remodeling in Mayer, with no travel fee.' },
      { name: 'Cordes Lakes, AZ', href: 'cordes-lakes-remodeling.html',
        blurb: 'Kitchen and bathroom remodeling and LVP flooring for Cordes Lakes.' },
    ],
  },
];

// Service x city pages that exist for Yavapai cities, grouped by service.
const SERVICE_MATRIX = [
  { service: 'Kitchen Remodeling', hub: 'kitchen-remodeling.html', pages: [
    ['Prescott Valley', 'kitchen-remodeling-prescott-valley.html'],
    ['Chino Valley', 'kitchen-remodeling-chino-valley.html'],
    ['Dewey-Humboldt', 'kitchen-remodeling-dewey-humboldt.html'],
    ['Cottonwood', 'kitchen-remodeling-cottonwood.html'],
    ['Sedona', 'kitchen-remodeling-sedona.html'],
  ]},
  { service: 'Bathroom Remodeling', hub: 'bathroom-remodeling.html', pages: [
    ['Prescott Valley', 'bathroom-remodeling-prescott-valley.html'],
    ['Chino Valley', 'bathroom-remodeling-chino-valley.html'],
    ['Dewey-Humboldt', 'bathroom-remodeling-dewey-humboldt.html'],
    ['Cottonwood', 'bathroom-remodeling-cottonwood.html'],
    ['Sedona', 'bathroom-remodeling-sedona.html'],
  ]},
  { service: 'Accessible &amp; Aging-in-Place', hub: 'aging-in-place.html', pages: [
    ['ADA Bathrooms, Prescott', 'ada-bathroom-prescott.html'],
    ['Aging in Place, Prescott', 'aging-in-place-prescott.html'],
    ['Walk-In Showers, Prescott', 'walk-in-showers-prescott.html'],
    ['Tub-to-Shower, Prescott', 'tub-to-shower-prescott.html'],
    ['Best Aging-in-Place Remodeler, Yavapai County', 'best-aging-in-place-remodeler-yavapai-county.html'],
  ]},
];

// "How to choose" guides — all Prescott-anchored, currently reachable only from
// scattered in-content links.
const CHOOSER = [
  ['Home remodeling contractor', 'best-home-remodeling-contractor-prescott.html'],
  ['Kitchen remodeler', 'best-kitchen-remodeler-prescott.html'],
  ['Bathroom remodeler', 'best-bathroom-remodeler-prescott.html'],
  ['ADA bathroom remodeler', 'best-ada-bathroom-remodeler-prescott.html'],
  ['Walk-in shower installer', 'best-walk-in-shower-installer-prescott.html'],
  ['Cabinet maker', 'best-cabinet-maker-prescott.html'],
  ['Countertop installer', 'best-countertop-installer-prescott.html'],
  ['Flooring contractor', 'best-flooring-contractor-prescott.html'],
  ['Outdoor kitchen builder', 'best-outdoor-kitchen-builder-prescott.html'],
  ['Remodeler in Prescott Valley', 'best-remodeling-contractor-prescott-valley.html'],
  ['Remodeler in Chino Valley', 'best-remodeling-contractor-chino-valley.html'],
  ['Remodeler in Dewey-Humboldt', 'best-remodeling-contractor-dewey-humboldt.html'],
  ['Remodeler in Cottonwood', 'best-remodeling-contractor-cottonwood.html'],
  ['Remodeler in Sedona', 'best-remodeling-contractor-sedona.html'],
];

// FAQ answers are navigational or restate facts already published elsewhere on
// the site (licence number, showroom address, permitting authorities). No cost,
// timeline or permit-requirement figures are introduced here.
const FAQ = [
  { q: 'Which Yavapai County towns do you serve?',
    a: 'Prescott and its neighbourhoods, Prescott Valley, Chino Valley, Dewey-Humboldt, Cottonwood, Sedona, Camp Verde, Williamson Valley, Mayer and Cordes Lakes. We also work across the West Valley in the Phoenix metro — see our <a href="west-valley.html">West Valley page</a> for those cities.' },
  { q: 'Do you charge a travel fee for towns outside Prescott?',
    a: 'No. There is no travel fee anywhere in our service area, and the in-home consultation is free whether you are in central Prescott or out past Williamson Valley.' },
  { q: 'My address is not inside any town limit. Who issues my permit?',
    a: 'Unincorporated Yavapai County addresses — including much of Williamson Valley, Dewey-Humboldt, Mayer and Cordes Lakes — are handled by Yavapai County Development Services rather than a town building department. We identify the correct authority as part of the initial project assessment, so you never have to work it out yourself. Our <a href="permit-costs-yavapai-county.html">Yavapai County permit guide</a> explains who issues what.' },
  { q: 'Are you licensed to work in Yavapai County?',
    a: 'Yes. Infinity Kitchens and Baths is licensed, bonded and insured in Arizona under ROC #339999. You can read more on our <a href="licensing-insurance.html">licensing and insurance page</a>.' },
  { q: 'Do you have a showroom I can visit?',
    a: 'Yes — our Prescott showroom is at 723 N Montezuma St, Suite C. You can pick finishes there, or we can bring samples to your home during the free consultation. <a href="contact.html">Book a visit</a> whenever suits you.' },
  { q: 'Do you handle homes with hard water?',
    a: 'It comes up constantly in Chino Valley and across the county, and it drives real material choices — which is why it appears throughout our <a href="comparison-guides.html">material comparison guides</a>, from shower glass to countertop sealing.' },
];

const esc = s => s.replace(/&(?!(amp|lt|gt|quot|#\d+|[a-z]+);)/g, '&amp;');
const strip = s => s.replace(/<[^>]+>/g, '');

/* ---------- main ---------- */
let main = `<main id="main" tabindex="-1">
<section class="page-hero" style="background-image:url('${HERO}');background-size:cover;background-position:center;">
  <div style="position:absolute;inset:0;background:linear-gradient(to right,#1B4332 0%,#1B4332 42%,rgba(27,67,50,0.55) 65%,transparent 100%);"></div>
  <div class="page-hero-inner" style="position:relative;">
    <div class="breadcrumb"><a href="/">Home</a><span>/</span><span style="color:rgba(255,255,255,0.75)">Prescott &amp; Yavapai County</span></div>
    <span class="eyebrow">Service Area</span>
    <h1>Prescott &amp; Yavapai County Remodeling</h1>
    <p style="color:rgba(255,255,255,0.9);margin-top:0.9rem;font-size:1.05rem;max-width:560px;">Kitchen and bathroom remodeling from Williamson Valley to Camp Verde — one licensed, family-owned crew, no travel fee, and a showroom in downtown Prescott.</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:860px;">
    <p style="font-size:1.05rem;">Infinity Kitchens and Baths has been remodeling kitchens and bathrooms in Yavapai County since 2011. We are based in Prescott, licensed under AZ ROC #339999, and we run our own crews rather than subcontracting the work out — which is why we are able to cover the whole county without adding a travel charge.</p>
    <p>Yavapai County is not one market. A Victorian off the Courthouse Plaza, a manufactured home on acreage in Chino Valley and a second home in Sedona all want different things from a remodel, and they answer to different building departments. The pages below are grouped the way the county actually works.</p>
  </div>
</section>
`;

for (const g of GROUPS) {
  main += `
<section class="section"${g.id === 'quad-cities' || g.id === 'rural' ? ' style="background:#F9FAFB;"' : ''}>
  <div class="container" style="max-width:900px;">
    <h2>${g.heading}</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${g.intro}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;margin-top:1.5rem;">`;
  for (const c of g.cities) {
    main += `<div style="padding:1.1rem 1.25rem;border:1px solid #E5E7EB;border-radius:8px;background:#fff;">
      <h3 style="margin:0 0 0.4rem;font-size:1.05rem;"><a href="${c.href}">${c.name}</a></h3>
      <p style="margin:0;font-size:0.95rem;color:#4B5563;">${c.blurb}</p>
    </div>`;
  }
  main += `</div>
  </div>
</section>`;
}

main += `
<section class="section">
  <div class="container" style="max-width:900px;">
    <h2>Remodeling Services by Town</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>Where we have a dedicated page for a service in a specific town, it is listed here. If your town is not on a given row, the main service page covers it — the work is the same, and so is the crew.</p>`;
for (const s of SERVICE_MATRIX) {
  main += `
    <h3 style="margin-top:1.75rem;"><a href="${s.hub}">${s.service}</a></h3>
    <div style="display:flex;flex-wrap:wrap;gap:0.6rem;margin-top:0.75rem;">`;
  for (const [label, href] of s.pages) {
    main += `<a href="${href}" class="btn btn-outline-dark btn-sm">${label}</a>`;
  }
  main += `</div>`;
}
main += `
    <p style="margin-top:2rem;"><a href="services.html">See all remodeling services</a>.</p>
  </div>
</section>

<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:900px;">
    <h2>Before You Hire Anyone</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>We would rather you hired carefully than quickly — including if that means hiring someone else. Each of these guides covers what to verify for one trade: the licence, the crew, the warranty and the specific things that go wrong locally.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:0.75rem;margin-top:1.25rem;">`;
for (const [label, href] of CHOOSER) {
  main += `<a href="${href}" class="area-pill" style="display:block;padding:0.9rem 1.1rem;border:1px solid #E5E7EB;border-radius:8px;text-align:left;background:#fff;">${label}</a>`;
}
main += `</div>
    <p style="margin-top:1.5rem;">Permits are the other thing worth understanding before you start. Our <a href="permit-costs-yavapai-county.html">Yavapai County permit guide</a> sets out which authority covers your address and which projects need a permit at all.</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:860px;">
    <h2>Planning &amp; Cost Guides</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>Everything we know about planning a remodel here is written up and free to read — no form, no email required. Start with <a href="cost-guides.html">the cost guides</a> if you are working out a number, <a href="planning-guides.html">the process guides</a> if you are working out a sequence, or <a href="best-time-to-remodel-prescott.html">our Northern Arizona timing guide</a> if you are working out when.</p>
    <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1.25rem;">
      <a href="blog.html" class="btn btn-outline-dark btn-sm">The full guide library</a>
      <a href="kitchen-guides.html" class="btn btn-outline-dark btn-sm">Kitchen guides</a>
      <a href="bathroom-guides.html" class="btn btn-outline-dark btn-sm">Bathroom guides</a>
      <a href="shower-guides.html" class="btn btn-outline-dark btn-sm">Shower &amp; tile guides</a>
      <a href="comparison-guides.html" class="btn btn-outline-dark btn-sm">Material comparisons</a>
      <a href="accessibility-guides.html" class="btn btn-outline-dark btn-sm">Accessibility guides</a>
      <a href="prescott-remodeling-faq.html" class="btn btn-outline-dark btn-sm">Prescott remodeling FAQ</a>
    </div>
  </div>
</section>

<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:860px;">
    <h2>Also Serving the West Valley</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>Beyond Yavapai County we work throughout the West Valley in the Phoenix metro — Avondale, Buckeye, Glendale, Goodyear, Peoria, Surprise, Sun City, Sun City West, El Mirage and Litchfield Park — with a particular concentration of accessible bathroom work in the two Sun Cities. <a href="west-valley.html">See the West Valley page</a> for those cities, or <a href="locations.html">view every area we serve</a>.</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:860px;">
    <h2>Frequently Asked Questions</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>`;
for (const f of FAQ) {
  main += `
    <h3 style="margin-top:1.5rem;font-size:1.05rem;">${f.q}</h3>
    <p>${f.a}</p>`;
}
main += `
    <p style="margin-top:1.75rem;">More questions are answered on our <a href="faq.html">general FAQ</a> and our <a href="prescott-remodeling-faq.html">Prescott remodeling FAQ</a>.</p>
  </div>
</section>

<section class="cta-banner">
  <div class="container text-center">
    <span class="eyebrow">Free In-Home Consult</span>
    <h2>Remodeling anywhere in Yavapai County?</h2>
    <p>Tell us what you are thinking about. We will come out, measure, and give you a written price — no travel fee, no obligation.</p>
    <div class="cta-actions">
      <a href="contact.html" class="btn btn-gold btn-lg">Get a Free Estimate</a>
      <a href="tel:9288001998" class="cta-phone-link">or call 928-800-1998</a>
    </div>
  </div>
</section>
</main>`;

/* ---------- schema ---------- */
const allCityPages = GROUPS.flatMap(g => g.cities);
const collection = {
  '@type': 'CollectionPage',
  '@id': `${ORIGIN}/${SLUG}#collection`,
  name: 'Prescott & Yavapai County Remodeling',
  url: `${ORIGIN}/${SLUG}`,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: allCityPages.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: strip(c.name).replace(/&amp;/g, '&'),
      url: `${ORIGIN}/${c.href}`,
    })),
  },
};
const breadcrumb = {
  '@type': 'BreadcrumbList',
  '@id': `${ORIGIN}/${SLUG}#breadcrumb`,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: 'Prescott & Yavapai County', item: `${ORIGIN}/${SLUG}` },
  ],
};
const faqSchema = {
  '@type': 'FAQPage',
  '@id': `${ORIGIN}/${SLUG}#faq`,
  mainEntity: FAQ.map(f => ({
    '@type': 'Question',
    name: strip(f.q).replace(/&amp;/g, '&'),
    acceptedAnswer: {
      '@type': 'Answer',
      // Links are preserved in the answer text, not stripped.
      // See memory: faq-schema-strips-links-portfolio-sweep.
      text: f.a.replace(/href="(?!https?:)([^"]+)"/g, `href="${ORIGIN}/$1"`),
    },
  })),
};
const service = {
  '@type': 'Service',
  '@id': `${ORIGIN}/${SLUG}#service`,
  serviceType: 'Kitchen and bathroom remodeling',
  provider: { '@id': `${ORIGIN}/#business` },
  areaServed: allCityPages.map(c => ({
    '@type': 'City',
    name: strip(c.name).replace(/,\s*AZ$/, '').replace(/&amp;/g, '&'),
  })),
};

/* ---------- assemble from donor shell ---------- */
const donor = readFileSync(DONOR, 'utf8');
const head = donor.slice(0, donor.indexOf('<main'));
const tail = donor.slice(donor.indexOf('</main>') + '</main>'.length);

// Reuse the donor's business node so NAP stays identical sitewide.
const donorLd = [...donor.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
let business = null;
for (const m of donorLd) {
  let parsed;
  try { parsed = JSON.parse(m[1]); } catch { continue; }
  for (const node of (parsed['@graph'] || [parsed])) {
    if (node['@type'] === 'HomeAndConstructionBusiness' && !business) business = node;
  }
}
if (!business) throw new Error('could not lift business node from donor');

const graph = { '@context': 'https://schema.org', '@graph': [business, breadcrumb, service, collection, faqSchema] };

let newHead = head
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${TITLE}</title>`)
  .replace(/<meta name="description" content="[\s\S]*?">/, `<meta name="description" content="${DESC}">`)
  .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${ORIGIN}/${SLUG}">`)
  .replace(/<meta property="og:title" content="[\s\S]*?">/, `<meta property="og:title" content="${TITLE}">`)
  .replace(/<meta property="og:description" content="[\s\S]*?">/, `<meta property="og:description" content="${DESC}">`)
  .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${ORIGIN}/${SLUG}">`)
  .replace(/<meta name="twitter:title" content="[\s\S]*?">/, `<meta name="twitter:title" content="${TITLE}">`)
  .replace(/<meta name="twitter:description" content="[\s\S]*?">/, `<meta name="twitter:description" content="${DESC}">`);

// Drop every ld+json block the donor had, then insert ours once.
newHead = newHead.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
newHead = newHead.replace('</head>', `  <script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n  </script>\n</head>`);

writeFileSync(SLUG, newHead + main + tail);
const words = strip(main.replace(/<script[\s\S]*?<\/script>/g, '')).split(/\s+/).filter(Boolean).length;
console.log(`wrote ${SLUG}  (~${words} words, ${allCityPages.length} cities, ${CHOOSER.length} chooser guides)`);
