#!/usr/bin/env node
/**
 * Generates tile-flooring.html — the tile flooring service page.
 *
 * Built because the client flagged (2026-07-24) that Infinity does tile work in
 * showers, floors and backsplashes, but the site had ZERO mentions of tile
 * flooring; the only flooring service was branded "Flooring & LVP", which reads
 * vinyl-only. Showers and backsplashes were already covered.
 *
 * Backsplash positioning is deliberate: the client will not send sales staff on
 * backsplash-only estimates and refers those to his tile installer. So tile
 * backsplash is stated plainly (so AI assistants answer correctly) but framed as
 * part of a kitchen remodel, with standalone jobs openly referred out.
 *
 * Chrome (GA/Ads head block, nav, footer) is lifted from tile-shower-installation.html
 * at build time — re-run after any sitewide nav/footer change.
 * Usage: node build-tile-flooring.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.infinitykitchenandbathllc.com';
const IMG = `${SITE}/wp-content/uploads`;
const SRC = readFileSync(path.join(ROOT, 'tile-shower-installation.html'), 'utf8');

// GA/Ads head block is TWO script tags (loader + config) — run to the second
// closing tag or the AW-17095449186 line is silently dropped.
const gs = SRC.indexOf('<!-- Google tag (gtag.js) -->');
const ge = SRC.indexOf('</script>', SRC.indexOf('</script>', gs) + 9) + 9;
if (gs === -1 || ge < gs) throw new Error('gtag head block not found');
const GTAG = SRC.slice(gs, ge);

const ns = SRC.indexOf('<nav id="navbar"');
const nc = SRC.indexOf('mobile-nav-cta', ns);
const NAV = SRC.slice(ns, SRC.indexOf('</div>', SRC.indexOf('</div>', nc) + 6) + 6);
const FOOTER = SRC.slice(SRC.indexOf('<footer>'), SRC.indexOf('</footer>') + 9);
const SCRIPTS = SRC.slice(SRC.indexOf('</footer>') + 9, SRC.indexOf('</body>'));

const TITLE = 'Tile Flooring Installation in Prescott, AZ — Porcelain, Ceramic & Stone';
const DESC = 'Tile flooring installation in Prescott, Prescott Valley and Chino Valley. Porcelain, ceramic, natural stone and wood-look plank tile for kitchens, bathrooms, entryways and whole-home projects.';
const PAGE_URL = `${SITE}/tile-flooring.html`;

const OPTIONS = [
  ['Porcelain Tile', 'The workhorse of tile flooring. Dense, low-absorption and highly scratch resistant, porcelain handles heavy foot traffic, pets and Arizona dust without complaint. Available in everything from stone looks to concrete looks.'],
  ['Ceramic Tile', 'A cost-effective choice for bathrooms, laundry rooms and lower-traffic spaces. Softer than porcelain and easier to cut, which keeps labor costs down on intricate layouts and smaller rooms.'],
  ['Natural Stone', 'Travertine, marble, slate and granite bring texture and variation no manufactured tile can copy. Each piece is unique. Stone needs periodic sealing, and we will tell you honestly whether it suits how you actually live.'],
  ['Wood-Look Plank Tile', 'The look of hardwood with the durability of porcelain. Ideal for Prescott homes where real wood would struggle near entries, in bathrooms, or under pets. No refinishing, no water worries.'],
  ['Large-Format Tile', 'Bigger tiles mean fewer grout lines, which reads cleaner and is far easier to keep clean. Large-format requires a genuinely flat substrate, so we assess and correct the subfloor before a single tile is set.'],
  ['Heated Tile Floors', 'Electric radiant mats installed under the tile take the chill off bathroom and kitchen floors on cold Prescott mornings. Best added during a remodel, while the floor is already open.'],
];

const INCLUDED = [
  ['Subfloor assessment and prep', 'We check for flex, level and moisture before anything is set. Skipping this is the single most common cause of cracked tile and failed grout lines a year later.'],
  ['Proper underlayment and crack isolation', 'Uncoupling membrane or backer board suited to the substrate, so normal seasonal movement in the house does not telegraph through into your floor.'],
  ['Layout planned before setting', 'We dry-lay and plan the layout so cuts land where they are least visible and patterns stay centered on the room, not on the wall we happened to start from.'],
  ['Grout, sealing and transitions', 'Correct grout for the joint width, sealing where the material calls for it, and clean transitions to adjoining flooring so there are no trip edges or gaps.'],
];

const FAQ = [
  ['Do you install tile flooring, or only tile showers?',
   'Both. We install tile flooring throughout the home — kitchens, bathrooms, entryways, laundry and mudrooms, and whole-home projects — in porcelain, ceramic, natural stone and wood-look plank tile. Tile showers and tub surrounds are a separate service we also provide.'],
  ['Do you do tile backsplashes?',
   'Yes. Tile backsplashes are part of our kitchen remodeling work, and a backsplash is included in the design when we remodel a kitchen. For a standalone backsplash on its own, we will usually refer you directly to our trusted tile installer rather than send a sales rep out for a single small job — it gets you a faster answer and a better price.'],
  ['What is the difference between tile and LVP for my floors?',
   'Tile is harder, fully waterproof and lasts decades, but costs more to install and is colder and less forgiving underfoot. Luxury vinyl plank is warmer, quieter, quicker to install and far kinder to a budget, though it will not match tile for lifespan. We install both and will give you a straight recommendation for the specific room.'],
  ['How long does a tile floor installation take?',
   'A typical room runs three to five business days: demo and subfloor prep, underlayment, setting, then grout and seal. Large-format tile and natural stone take longer because of layout precision and cure times. We give you a realistic schedule at the consultation rather than an optimistic one.'],
  ['Can you tile over my existing floor?',
   'Sometimes, but usually we do not recommend it. Tiling over an existing floor raises the height enough to affect door clearances, appliance fit and transitions, and it hides whatever condition the substrate is actually in. We assess it and tell you honestly which approach makes sense.'],
  ['Which areas do you serve for tile flooring?',
   'Prescott, Prescott Valley, Chino Valley, Dewey-Humboldt, Mayer, Cordes Lakes, Williamson Valley and the surrounding Yavapai County communities, plus the West Valley Phoenix metro including Avondale, Goodyear, Buckeye, Surprise, Peoria and Glendale.'],
];

const card = (h, p, i) =>
  `<div class="fade-up stagger-${i + 1}" style="background:var(--white);border:1px solid var(--green-100);border-radius:16px;padding:2rem;box-shadow:var(--shadow-sm);">
            <h3 class="h-card" style="color:var(--green-800);margin-bottom:0.75rem;">${h}</h3>
            <p style="color:var(--gray-600);font-size:0.95rem;">${p}</p>
          </div>`;

const RELATED = [
  ['tile-shower-installation.html', 'Tile &amp; Custom Showers', 'Custom tile showers, niches and full surrounds.'],
  ['kitchen-backsplash.html', 'Kitchen Backsplash &amp; Tile', 'Tile backsplashes designed with your kitchen remodel.'],
  ['luxury-vinyl-flooring.html', 'Luxury Vinyl Plank Flooring', 'Warmer, budget-friendly waterproof flooring.'],
  ['bathroom-remodeling.html', 'Bathroom Remodeling', 'Full bathroom projects, tile included.'],
];

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${GTAG}
<title>${TITLE} — Infinity Kitchens and Baths | Prescott, AZ</title>
<meta name="description" content="${DESC}">
<link rel="canonical" href="${PAGE_URL}">
<meta property="og:type" content="website">
<meta property="og:url" content="${PAGE_URL}">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESC}">
<meta property="og:image" content="${IMG}/2026/06/navy-vanity-double-sink-white-quartz-tile-floor.jpg">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/css/styles.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "${PAGE_URL}#service",
  "name": "Tile Flooring Installation",
  "serviceType": "Tile Flooring Installation",
  "description": "${DESC}",
  "url": "${PAGE_URL}",
  "provider": { "@id": "${SITE}/#localbusiness" },
  "areaServed": [
    { "@type": "City", "name": "Prescott", "addressRegion": "AZ" },
    { "@type": "City", "name": "Prescott Valley", "addressRegion": "AZ" },
    { "@type": "City", "name": "Chino Valley", "addressRegion": "AZ" },
    { "@type": "City", "name": "Dewey-Humboldt", "addressRegion": "AZ" },
    { "@type": "City", "name": "Avondale", "addressRegion": "AZ" },
    { "@type": "City", "name": "Goodyear", "addressRegion": "AZ" }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Tile Flooring Options",
    "itemListElement": [
${OPTIONS.map(([h]) => `      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "${h}" } }`).join(',\n')}
    ]
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${FAQ.map(([q, a]) => `    { "@type": "Question", "name": ${JSON.stringify(q)}, "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(a.replace(/&mdash;/g, '—'))} } }`).join(',\n')}
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE}/" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "${SITE}/services.html" },
    { "@type": "ListItem", "position": 3, "name": "Tile Flooring", "item": "${PAGE_URL}" }
  ]
}
</script>
</head>
<body>

${NAV}

<section class="page-hero" style="background-image:linear-gradient(to right,#1B4332 0%,#1B4332 42%,rgba(27,67,50,0.55) 65%,transparent 100%),url('${IMG}/2026/06/navy-vanity-double-sink-white-quartz-tile-floor.jpg');background-position:center right;background-size:cover;">
  <div class="page-hero-inner">
    <div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="services.html">Services</a><span>/</span><span style="color:rgba(255,255,255,0.75)">Tile Flooring</span></div>
    <span class="eyebrow">Tile Flooring Prescott, AZ</span>
    <h1>Tile Flooring Installation in Prescott, AZ</h1>
    <p>Porcelain, ceramic, natural stone and wood-look plank tile — set on a properly prepared subfloor so it still looks right in twenty years. Serving Prescott, Prescott Valley, Chino Valley and the surrounding Yavapai County communities.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div style="text-align:center;max-width:760px;margin:0 auto;" class="fade-up">
      <span class="eyebrow">Tile Done Properly</span>
      <h2>A Tile Floor Is Only as Good as What's Underneath It</h2>
      <div class="gold-divider" style="margin:1.25rem auto 1.5rem;"></div>
      <p style="color:var(--gray-600);font-size:1.05rem;">Most failed tile floors do not fail because of the tile. They fail because the subfloor flexed, the substrate was never levelled, or the wrong setting material was used. We have been remodeling Prescott homes since 2011, and our tile work starts below the surface — assessing the subfloor, correcting what needs correcting, and using the right underlayment for the room. The result is a floor that does not crack, lift or open up its grout lines a year after we leave.</p>
    </div>
  </div>
</section>

<section class="section-gray">
  <div class="container">
    <div style="text-align:center;max-width:680px;margin:0 auto 3rem;" class="fade-up">
      <h2>Tile Flooring Options We Install</h2>
      <p>We work with every major tile category and help you match the material to how the room is actually used — not just how it looks in a showroom.</p>
    </div>
    <div class="grid-3">
      ${OPTIONS.map(([h, p], i) => card(h, p, i % 6)).join('\n      ')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div style="text-align:center;max-width:680px;margin:0 auto 3rem;" class="fade-up">
      <h2>What's Included in Every Tile Floor We Install</h2>
    </div>
    <div class="grid-2" style="max-width:940px;margin:0 auto;">
      ${INCLUDED.map(([h, p], i) => card(h, p, i % 6)).join('\n      ')}
    </div>
  </div>
</section>

<section class="section-gray">
  <div class="container">
    <div style="text-align:center;max-width:760px;margin:0 auto;" class="fade-up">
      <span class="eyebrow">Also Tile Work</span>
      <h2>Showers, Floors and Backsplashes</h2>
      <div class="gold-divider" style="margin:1.25rem auto 1.5rem;"></div>
      <p style="color:var(--gray-600);font-size:1.05rem;">Tile runs through most of what we do. We build custom tile showers and tub surrounds, install tile flooring throughout the home, and design tile backsplashes as part of our kitchen remodels. If you are remodeling a kitchen or bathroom with us, the tile work is handled in-house by the same team, on the same schedule, under the same warranty.</p>
      <p style="color:var(--gray-600);font-size:1.05rem;margin-top:1rem;">If all you need is a backsplash on its own, tell us — we will usually point you straight to our trusted tile installer so you get a faster answer and a better price than a full remodeling estimate would give you.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div style="text-align:center;max-width:680px;margin:0 auto 3rem;" class="fade-up">
      <h2>Related Services</h2>
    </div>
    <div class="grid-4">
      ${RELATED.map(([href, name, blurb], i) => `<a href="${href}" class="fade-up stagger-${i + 1}" style="display:block;background:var(--white);border:1px solid var(--green-100);border-radius:16px;padding:1.5rem;box-shadow:var(--shadow-sm);text-decoration:none;">
        <h3 class="h-card" style="color:var(--green-800);margin-bottom:0.5rem;">${name}</h3>
        <p style="color:var(--gray-600);font-size:0.92rem;">${blurb}</p>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section-gray">
  <div class="container">
    <div style="text-align:center;max-width:680px;margin:0 auto 3rem;" class="fade-up">
      <h2>Tile Flooring FAQ</h2>
      <p>Straight answers to what Prescott homeowners ask us most about tile floors.</p>
    </div>
    <div class="pillar-faq" style="max-width:860px;margin:0 auto;">
      ${FAQ.map(([q, a], i) => `<div class="pillar-faq-item fade-up stagger-${(i % 6) + 1}">
        <div class="pillar-faq-q">${q}</div>
        <div class="pillar-faq-a">${a}</div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section section-forest">
  <div class="container" style="text-align:center;">
    <span class="eyebrow" style="color:var(--gold);">Start Your Project</span>
    <h2 style="color:var(--white);margin-top:0.5rem;margin-bottom:1.25rem;">Thinking About New Tile Floors?</h2>
    <p style="color:rgba(255,255,255,0.8);max-width:600px;margin:0 auto 2rem;font-size:1.05rem;">Schedule a free in-home consultation. We'll look at the subfloor, talk through tile options for the room, and give you a clear, detailed estimate — no pressure and no vague numbers.</p>
    <a href="contact.html" class="btn btn-gold">Schedule Free In-Home Consult</a>
  </div>
</section>

${FOOTER}
${SCRIPTS}
</body>
</html>
`;

writeFileSync(path.join(ROOT, 'tile-flooring.html'), HTML);
console.log(`tile-flooring.html written (${(HTML.length / 1024).toFixed(1)} KB)`);
console.log(`  AW tag present: ${HTML.includes('AW-17095449186')}`);
console.log(`  JSON-LD blocks: ${(HTML.match(/application\/ld\+json/g) || []).length}`);
console.log(`  FAQ entries: ${FAQ.length}, tile options: ${OPTIONS.length}`);
