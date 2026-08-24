#!/usr/bin/env node
// Builds locations.html — the top-level service-area index sitting above the
// two regional hubs (yavapai-county-remodeling.html and west-valley.html).
// Gives all 105 location pages a single crawlable parent; the site has no
// directory structure, so this link layer is the only structure there is.
import { readFileSync, writeFileSync } from 'node:fs';

const ORIGIN = 'https://www.infinitykitchenandbathllc.com';
const SLUG = 'locations.html';
const DONOR = 'west-valley.html';

const TITLE = 'Service Areas | Prescott, Yavapai County &amp; the West Valley';
const DESC = 'Every city Infinity Kitchens and Baths serves — Prescott and Yavapai County, plus the West Valley in the Phoenix metro. Licensed AZ ROC #339999.';
const HERO = `${ORIGIN}/wp-content/uploads/2026/06/modern-white-kitchen-remodel-gold-accents-opt.jpg`;

const REGIONS = [
  {
    name: 'Prescott &amp; Yavapai County',
    href: 'yavapai-county-remodeling.html',
    lede: 'Home base. Our showroom is on North Montezuma Street in Prescott, and we cover the whole county from it — the Quad Cities, the Verde Valley and the unincorporated areas in between.',
    groups: [
      { label: 'Prescott', items: [
        ['Prescott', 'prescott-remodeling.html'],
        ['Downtown Prescott', 'downtown-prescott-remodeling.html'],
        ['South Prescott', 'south-prescott-remodeling.html'],
        ['Prescott Lakes', 'prescott-lakes-remodeling.html'],
        ['Yavapai Hills', 'yavapai-hills-remodeling.html'],
      ]},
      { label: 'Quad Cities', items: [
        ['Prescott Valley', 'prescott-valley-remodeling.html'],
        ['Chino Valley', 'chino-valley-remodeling.html'],
        ['Dewey-Humboldt', 'dewey-humboldt-remodeling.html'],
      ]},
      { label: 'Verde Valley &amp; Sedona', items: [
        ['Cottonwood', 'cottonwood-remodeling.html'],
        ['Sedona', 'sedona-remodeling.html'],
        ['Camp Verde', 'camp-verde-remodeling.html'],
      ]},
      { label: 'Rural &amp; unincorporated', items: [
        ['Williamson Valley', 'williamson-valley-remodeling.html'],
        ['Mayer', 'mayer-remodeling.html'],
        ['Cordes Lakes', 'cordes-lakes-remodeling.html'],
      ]},
    ],
  },
  {
    name: 'The West Valley',
    href: 'west-valley.html',
    lede: 'We work throughout the West Valley in the Phoenix metro. Sun City and Sun City West in particular keep us busy with accessible bathroom work — walk-in showers, tub-to-shower conversions and full ADA remodels.',
    groups: [
      { label: 'West Valley cities', items: [
        ['Avondale', 'avondale-remodeling.html'],
        ['Buckeye', 'buckeye-remodeling.html'],
        ['El Mirage', 'el-mirage-remodeling.html'],
        ['Glendale', 'glendale-remodeling.html'],
        ['Goodyear', 'goodyear-remodeling.html'],
        ['Litchfield Park', 'litchfield-park-remodeling.html'],
        ['Peoria', 'peoria-remodeling.html'],
        ['Surprise', 'surprise-remodeling.html'],
        ['Sun City', 'sun-city-remodeling.html'],
        ['Sun City West', 'sun-city-west-remodeling.html'],
      ]},
    ],
  },
];

// Service x city coverage, so the matrix pages get a parent too.
const MATRIX = [
  { service: 'Kitchen Remodeling', hub: 'kitchen-remodeling.html', cities: [
    ['Avondale','kitchen-remodeling-avondale.html'],['Buckeye','kitchen-remodeling-buckeye.html'],
    ['Chino Valley','kitchen-remodeling-chino-valley.html'],['Cottonwood','kitchen-remodeling-cottonwood.html'],
    ['Dewey-Humboldt','kitchen-remodeling-dewey-humboldt.html'],['El Mirage','kitchen-remodeling-el-mirage.html'],
    ['Glendale','kitchen-remodeling-glendale.html'],['Goodyear','kitchen-remodeling-goodyear.html'],
    ['Litchfield Park','kitchen-remodeling-litchfield-park.html'],['Peoria','kitchen-remodeling-peoria.html'],
    ['Prescott Valley','kitchen-remodeling-prescott-valley.html'],['Sedona','kitchen-remodeling-sedona.html'],
    ['Sun City','kitchen-remodeling-sun-city.html'],['Sun City West','kitchen-remodeling-sun-city-west.html'],
    ['Surprise','kitchen-remodeling-surprise.html'],
  ]},
  { service: 'Bathroom Remodeling', hub: 'bathroom-remodeling.html', cities: [
    ['Avondale','bathroom-remodeling-avondale.html'],['Buckeye','bathroom-remodeling-buckeye.html'],
    ['Chino Valley','bathroom-remodeling-chino-valley.html'],['Cottonwood','bathroom-remodeling-cottonwood.html'],
    ['Dewey-Humboldt','bathroom-remodeling-dewey-humboldt.html'],['El Mirage','bathroom-remodeling-el-mirage.html'],
    ['Glendale','bathroom-remodeling-glendale.html'],['Goodyear','bathroom-remodeling-goodyear.html'],
    ['Litchfield Park','bathroom-remodeling-litchfield-park.html'],['Peoria','bathroom-remodeling-peoria.html'],
    ['Prescott Valley','bathroom-remodeling-prescott-valley.html'],['Sedona','bathroom-remodeling-sedona.html'],
    ['Sun City','bathroom-remodeling-sun-city.html'],['Sun City West','bathroom-remodeling-sun-city-west.html'],
    ['Surprise','bathroom-remodeling-surprise.html'],
  ]},
  { service: 'Walk-In Showers', hub: 'walk-in-showers.html', cities: [
    ['Avondale','walk-in-showers-avondale.html'],['Buckeye','walk-in-showers-buckeye.html'],
    ['Glendale','walk-in-showers-glendale.html'],['Goodyear','walk-in-showers-goodyear.html'],
    ['Peoria','walk-in-showers-peoria.html'],['Prescott','walk-in-showers-prescott.html'],
    ['Sun City','walk-in-showers-sun-city.html'],['Sun City West','walk-in-showers-sun-city-west.html'],
    ['Surprise','walk-in-showers-surprise.html'],
  ]},
  { service: 'Tub-to-Shower Conversions', hub: 'tub-to-shower.html', cities: [
    ['Avondale','tub-to-shower-avondale.html'],['Buckeye','tub-to-shower-buckeye.html'],
    ['Glendale','tub-to-shower-glendale.html'],['Goodyear','tub-to-shower-goodyear.html'],
    ['Peoria','tub-to-shower-peoria.html'],['Prescott','tub-to-shower-prescott.html'],
    ['Sun City','tub-to-shower-sun-city.html'],['Sun City West','tub-to-shower-sun-city-west.html'],
    ['Surprise','tub-to-shower-surprise.html'],
  ]},
  { service: 'ADA Bathroom Remodeling', hub: 'ada-bathroom-remodeling.html', cities: [
    ['Avondale','ada-bathroom-avondale.html'],['Buckeye','ada-bathroom-buckeye.html'],
    ['Glendale','ada-bathroom-glendale.html'],['Goodyear','ada-bathroom-goodyear.html'],
    ['Peoria','ada-bathroom-peoria.html'],['Prescott','ada-bathroom-prescott.html'],
    ['Sun City','ada-bathroom-sun-city.html'],['Sun City West','ada-bathroom-sun-city-west.html'],
    ['Surprise','ada-bathroom-surprise.html'],
  ]},
  { service: 'Aging in Place', hub: 'aging-in-place.html', cities: [
    ['Avondale','aging-in-place-avondale.html'],['Buckeye','aging-in-place-buckeye.html'],
    ['Glendale','aging-in-place-glendale.html'],['Goodyear','aging-in-place-goodyear.html'],
    ['Peoria','aging-in-place-peoria.html'],['Prescott','aging-in-place-prescott.html'],
    ['Sun City','aging-in-place-sun-city.html'],['Sun City West','aging-in-place-sun-city-west.html'],
    ['Surprise','aging-in-place-surprise.html'],
  ]},
];

const strip = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');

let main = `<main id="main" tabindex="-1">
<section class="page-hero" style="background-image:url('${HERO}');background-size:cover;background-position:center;">
  <div style="position:absolute;inset:0;background:linear-gradient(to right,#1B4332 0%,#1B4332 42%,rgba(27,67,50,0.55) 65%,transparent 100%);"></div>
  <div class="page-hero-inner" style="position:relative;">
    <div class="breadcrumb"><a href="/">Home</a><span>/</span><span style="color:rgba(255,255,255,0.75)">Service Areas</span></div>
    <span class="eyebrow">Where We Work</span>
    <h1>Areas We Serve</h1>
    <p style="color:rgba(255,255,255,0.9);margin-top:0.9rem;font-size:1.05rem;max-width:560px;">Two regions, one crew: Prescott and Yavapai County, and the West Valley in the Phoenix metro. No travel fee in either.</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:860px;">
    <p style="font-size:1.05rem;">Infinity Kitchens and Baths is a family-owned remodeling contractor based in Prescott, Arizona, licensed under AZ ROC #339999. We serve two regions — Yavapai County, where our showroom is, and the West Valley on the west side of the Phoenix metro. Everything below is a real page with real detail about that specific place, not a list of names.</p>
    <p><strong>Two regions, two phone numbers.</strong> For Prescott and Yavapai County, call <a href="tel:9288001998">928-800-1998</a>. For the West Valley, call <a href="tel:6028856998">602-885-6998</a> — dialling the right one puts you straight onto the correct side of the schedule instead of being transferred.</p>
    <p>If you do not see your town listed, call and ask. The service-area boundary is about drive time, not city limits, and we would rather tell you plainly whether we can serve you well than stretch a crew too thin to do it properly.</p>
  </div>
</section>
`;

for (const r of REGIONS) {
  main += `
<section class="section"${r.href === 'west-valley.html' ? ' style="background:#F9FAFB;"' : ''}>
  <div class="container" style="max-width:900px;">
    <h2><a href="${r.href}">${r.name}</a></h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>${r.lede}</p>`;
  for (const g of r.groups) {
    main += `
    <h3 style="margin-top:1.5rem;font-size:1rem;color:#4B5563;">${g.label}</h3>
    <div style="display:flex;flex-wrap:wrap;gap:0.6rem;margin-top:0.6rem;">`;
    for (const [label, href] of g.items) {
      main += `<a href="${href}" class="btn btn-outline-dark btn-sm">${label}</a>`;
    }
    main += `</div>`;
  }
  main += `
    <p style="margin-top:1.5rem;"><a href="${r.href}">Full ${strip(r.name)} page &rarr;</a></p>
  </div>
</section>`;
}

main += `
<section class="section">
  <div class="container" style="max-width:900px;">
    <h2>Find a Service in Your City</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>Where we have written a dedicated page for one service in one city, it is listed below. If your city is missing from a row, the main service page still covers it — follow the service heading instead.</p>`;
for (const m of MATRIX) {
  main += `
    <h3 style="margin-top:1.75rem;"><a href="${m.hub}">${m.service}</a></h3>
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.6rem;">`;
  for (const [label, href] of m.cities) {
    main += `<a href="${href}" class="area-pill" style="padding:0.45rem 0.8rem;border:1px solid #E5E7EB;border-radius:6px;font-size:0.9rem;">${label}</a>`;
  }
  main += `</div>`;
}
main += `
    <p style="margin-top:2rem;"><a href="services.html">Browse every remodeling service we offer</a>.</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:860px;">
    <h2>How Two Regions Works in Practice</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p><strong>The same crew, licensed for both.</strong> An Arizona ROC licence is statewide rather than county-by-county, so the same licensed company — AZ ROC #339999, bonded and insured — covers Yavapai County and Maricopa County alike. You can verify the licence yourself at roc.az.gov, and we would encourage you to verify anyone you are considering, us included. Our <a href="licensing-insurance.html">licensing and insurance page</a> explains what to look for.</p>
    <p><strong>Being Prescott-based affects the calendar, not the price.</strong> We batch West Valley projects so crews work full days in the metro instead of commuting back and forth. That keeps the cost the same wherever you are and means there is no travel fee in either region — but it does mean West Valley scheduling runs in blocks, so it is worth calling early if your timing is fixed.</p>
    <p><strong>The consultation is identical in both.</strong> We come to you with design tools and material samples, measure the space, talk through what you actually want, and leave you with a detailed no-obligation quote. You should not have to drive to a showroom to get a price — though if you would like to see finishes in person, our Prescott showroom at 723 N Montezuma St, Suite C is open to you.</p>
  </div>
</section>

<section class="section" style="background:#F9FAFB;">
  <div class="container" style="max-width:860px;">
    <h2>What Differs Between the Two</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p><strong>Yavapai County is a housing-stock problem.</strong> The county holds Victorian and Craftsman homes around the Prescott Courthouse Plaza, early-2000s builder houses in Prescott Lakes, ranch and manufactured homes on acreage in Chino Valley, and older places along the SR-169 corridor in Dewey-Humboldt. What is behind the walls usually decides the scope, and hard water shapes material choices across the whole county — which is why it comes up throughout our <a href="comparison-guides.html">material comparison guides</a>.</p>
    <p><strong>The West Valley is an accessibility problem.</strong> It is one of the main reasons we work in the metro at all. The active-adult communities in Sun City and Sun City West are full of original Del Webb bathrooms where the only full bath has a step-over tub. Converting those to a <a href="walk-in-showers.html">walk-in shower</a> or a <a href="curbless-zero-entry-showers.html">curbless entry</a>, with proper blocking for grab bars, is work we do constantly — see our <a href="aging-in-place.html">aging-in-place</a> and <a href="ada-bathroom-remodeling.html">ADA bathroom</a> pages.</p>
    <p><strong>Permits differ by address, not by region.</strong> Your permitting authority is whichever body has jurisdiction over your specific property, and that is not always the town your mail comes from — a great many Prescott-area addresses turn out to be unincorporated county. We identify the right authority as part of the initial assessment, and our <a href="permit-costs-yavapai-county.html">Yavapai County permit guide</a> explains how the jurisdictions divide up.</p>
    <p>If you are still choosing a contractor, our <a href="choosing-a-contractor.html">guide to choosing one</a> covers what to verify before you sign anything. The rest of what we know is in <a href="blog.html">the guide library</a> — cost guides, planning guides, material comparisons and accessibility guides, all free to read, no form required.</p>
  </div>
</section>

<section class="cta-banner">
  <div class="container text-center">
    <span class="eyebrow">Free In-Home Consult</span>
    <h2>Wherever you are, the consult is free</h2>
    <p>We come to you, measure, and leave you with a written price. No travel fee anywhere in our service area.</p>
    <div class="cta-actions">
      <a href="contact.html" class="btn btn-gold btn-lg">Get a Free Estimate</a>
      <a href="tel:9288001998" class="cta-phone-link">Prescott &amp; Yavapai: 928-800-1998</a>
      <a href="tel:6028856998" class="cta-phone-link">West Valley: 602-885-6998</a>
    </div>
  </div>
</section>
</main>`;

/* ---------- schema ---------- */
const allCities = REGIONS.flatMap(r => r.groups.flatMap(g => g.items));
const breadcrumb = {
  '@type': 'BreadcrumbList',
  '@id': `${ORIGIN}/${SLUG}#breadcrumb`,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: 'Service Areas', item: `${ORIGIN}/${SLUG}` },
  ],
};
const collection = {
  '@type': 'CollectionPage',
  '@id': `${ORIGIN}/${SLUG}#collection`,
  name: 'Areas We Serve',
  url: `${ORIGIN}/${SLUG}`,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: allCities.map(([label, href], i) => ({
      '@type': 'ListItem', position: i + 1, name: label, url: `${ORIGIN}/${href}`,
    })),
  },
};
const service = {
  '@type': 'Service',
  '@id': `${ORIGIN}/${SLUG}#service`,
  serviceType: 'Kitchen and bathroom remodeling',
  provider: { '@id': `${ORIGIN}/#business` },
  areaServed: allCities.map(([label]) => ({ '@type': 'City', name: label })),
};

const donor = readFileSync(DONOR, 'utf8');
const head = donor.slice(0, donor.indexOf('<main'));
const tail = donor.slice(donor.indexOf('</main>') + '</main>'.length);

let business = null;
for (const m of donor.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  let parsed; try { parsed = JSON.parse(m[1]); } catch { continue; }
  for (const node of (parsed['@graph'] || [parsed])) {
    if (node['@type'] === 'HomeAndConstructionBusiness' && !business) business = node;
  }
}
if (!business) throw new Error('could not lift business node from donor');

const graph = { '@context': 'https://schema.org', '@graph': [business, breadcrumb, service, collection] };

let newHead = head
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${TITLE}</title>`)
  .replace(/<meta name="description" content="[\s\S]*?">/, `<meta name="description" content="${DESC}">`)
  .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${ORIGIN}/${SLUG}">`)
  .replace(/<meta property="og:title" content="[\s\S]*?">/, `<meta property="og:title" content="${TITLE}">`)
  .replace(/<meta property="og:description" content="[\s\S]*?">/, `<meta property="og:description" content="${DESC}">`)
  .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${ORIGIN}/${SLUG}">`)
  .replace(/<meta name="twitter:title" content="[\s\S]*?">/, `<meta name="twitter:title" content="${TITLE}">`)
  .replace(/<meta name="twitter:description" content="[\s\S]*?">/, `<meta name="twitter:description" content="${DESC}">`);
newHead = newHead.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
newHead = newHead.replace('</head>', `  <script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n  </script>\n</head>`);

writeFileSync(SLUG, newHead + main + tail);
const words = strip(main).split(/\s+/).filter(Boolean).length;
console.log(`wrote ${SLUG}  (~${words} words, ${allCities.length} cities, ${MATRIX.reduce((n,m)=>n+m.cities.length,0)} service-city links)`);
