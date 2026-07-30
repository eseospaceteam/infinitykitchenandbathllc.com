#!/usr/bin/env node
/**
 * Builds the three genuinely-missing hub pages from the Jul 29 2026 audit:
 *
 *   showers.html      — pillar for the 15-page shower cluster
 *   countertops.html  — pillar for the 7-page countertop cluster
 *   west-valley.html  — pillar for the 24-page West Valley city cluster
 *
 * (The audit asked for four. The fourth, Aging in Place, is already a
 * 2,702-word hub with its own resource cluster — extending it is a content
 * edit, not a new page.)
 *
 * Chrome (GA/Ads head block, nav, footer) is lifted from about.html at build
 * time so these stay in sync with sitewide nav/footer changes.
 *
 * EVERY cost figure below is copied from the page on this site that already
 * owns that topic, so a hub can never contradict the page it links to:
 *   walk-in shower  $10,000–$35,000   walk-in-showers.html
 *   tub-to-shower   $8,000–$22,000    tub-to-shower.html
 *   curbless        $6,000–$15,000    curbless-zero-entry-showers.html
 *   framed door     $500–$1,200       frameless-vs-framed-shower-doors.html
 *   frameless door  $1,000–$3,000     frameless-vs-framed-shower-doors.html
 *   countertop table (all 6 materials) countertop-costs.html — verbatim
 *
 * IMPORTANT: run `node a11y-upgrade.mjs` afterwards to add the skip link,
 * the <main> landmark and the footer accessibility link. Then `wire-hubs.mjs`.
 *
 * Usage: node build-hubs.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.infinitykitchenandbathllc.com';
const UP = `${SITE}/wp-content/uploads`;
const LOGO = `${UP}/2023/11/infinity-logo.png`;
const SRC = readFileSync(path.join(ROOT, 'about.html'), 'utf8');

// ---------------------------------------------------------------- chrome ----
const gtagStart = SRC.indexOf('<!-- Google tag (gtag.js) -->');
const gtagEnd = SRC.indexOf('</script>', SRC.indexOf('</script>', gtagStart) + 9) + 9;
const GTAG = SRC.slice(gtagStart, gtagEnd);

const navStart = SRC.indexOf('<nav id="navbar"');
const navCta = SRC.indexOf('mobile-nav-cta', navStart);
const NAV = SRC.slice(navStart, SRC.indexOf('</div>', SRC.indexOf('</div>', navCta) + 6) + 6);
const FOOTER = SRC.slice(SRC.indexOf('<footer>'), SRC.indexOf('</footer>') + 9);

// NAP stays identical sitewide — the Prescott number is the schema telephone on
// every page including the West Valley ones. Region-matched numbers appear in
// visible copy only (mirrors js/estimate-tab.js and the existing city pages).
const BUSINESS = {
  '@type': 'HomeAndConstructionBusiness',
  '@id': `${SITE}/#business`,
  name: 'Infinity Kitchens and Baths',
  url: `${SITE}/`,
  telephone: '+1-928-800-1998',
  image: LOGO,
  logo: LOGO,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '723 N Montezuma St, Suite C',
    addressLocality: 'Prescott',
    addressRegion: 'AZ',
    postalCode: '86301',
    addressCountry: 'US',
  },
};

const ARROW =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/></svg>';

/** Strip tags so JSON-LD stays plain text while the HTML keeps its links. */
const plain = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&times;/g, '×')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const HUB_CSS = `
  .hub-answer{background:var(--green-25,#F4FAF6);border:1px solid var(--green-100);border-left:4px solid var(--gold);border-radius:6px;padding:1.5rem 1.65rem;margin:0 0 2.5rem;}
  .hub-answer p{margin:0;line-height:1.75;font-size:1.02rem;color:var(--green-900);}
  .hub-answer p + p{margin-top:0.8rem;}
  /* Left-aligned rather than centred: these sections mix prose with full-width
     card grids, and centring the prose in a narrower column leaves its left
     edge indented against the grids and group headings below it. Keeping the
     max-width preserves a readable measure without breaking that alignment. */
  .hub-intro{max-width:860px;margin:0;}
  .hub-intro p{line-height:1.8;}
  .hub-intro p + p{margin-top:1rem;}
  .data-table{width:100%;border-collapse:collapse;font-size:0.92rem;margin:1.5rem 0;}
  .data-table th,.data-table td{text-align:left;padding:0.7rem 0.85rem;border-bottom:1px solid var(--green-100);vertical-align:top;}
  .data-table th{background:var(--green-50,#f3f8f5);font-size:0.76rem;letter-spacing:0.07em;text-transform:uppercase;color:var(--green-700);}
  .data-table tr:last-child td{border-bottom:none;}
  .table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .cluster{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:1rem;margin:0 0 1rem;}
  .cluster a{display:block;background:#fff;border:1px solid var(--green-100);border-radius:8px;padding:1.3rem 1.4rem;text-decoration:none;transition:var(--transition);}
  .cluster a:hover{border-color:var(--green-300);box-shadow:var(--shadow-lg);transform:translateY(-2px);}
  .cluster h3{font-size:1.02rem;margin:0 0 0.35rem;color:var(--green-900);}
  .cluster p{margin:0;font-size:0.86rem;line-height:1.55;color:var(--gray-600);}
  .cluster .go{display:inline-flex;align-items:center;gap:0.3rem;margin-top:0.7rem;font-size:0.8rem;font-weight:700;color:var(--green-500);}
  .group-head{margin:2.5rem 0 1rem;padding-bottom:0.5rem;border-bottom:1px solid var(--green-100);}
  .group-head h2{font-size:1.3rem;margin:0;}
  .group-head p{margin:0.35rem 0 0;font-size:0.9rem;color:var(--gray-600);}
  .pillar-faq{max-width:860px;margin:0 auto;}
  .pillar-faq h3{font-size:1.08rem;line-height:1.45;margin:0 0 0.6rem;}
  .faq-block{padding:1.6rem 0;border-bottom:1px solid var(--green-100);}
  .faq-block:first-of-type{border-top:1px solid var(--green-100);}
  .faq-block p{margin:0;line-height:1.75;}
  .city-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;}
  .city-card{background:#fff;border:1px solid var(--green-100);border-radius:8px;padding:1.3rem 1.4rem;}
  .city-card h3{font-size:1.05rem;margin:0 0 0.2rem;color:var(--green-900);}
  .city-card .pop{font-size:0.78rem;color:var(--gray-500);margin:0 0 0.75rem;}
  .city-card ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.35rem;}
  .city-card a{font-size:0.88rem;color:var(--green-600);text-decoration:none;font-weight:600;}
  .city-card a:hover{text-decoration:underline;}
`;

function page({ file, title, desc, heroImg, eyebrow, crumb, h1, standfirst, jsonld, body, cta }) {
  const url = `${SITE}/${file}`;
  if (plain(title).length > 60) throw new Error(`title too long (${plain(title).length}): ${file}`);
  if (desc.length > 155) throw new Error(`description too long (${desc.length}): ${file}`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  ${GTAG}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="stylesheet" href="css/styles.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#1D5535">

  <!-- SEO: canonical, Open Graph & structured data -->
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Infinity Kitchens and Baths">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${heroImg}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${heroImg}">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  <style>${HUB_CSS}  </style>
</head>
<body>

${NAV}

<section class="page-hero" style="background-image:linear-gradient(rgba(19,54,36,0.82),rgba(19,54,36,0.88)),url('${heroImg}');background-size:cover;background-position:center;">
  <div class="page-hero-inner" style="position:relative;">
    <div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="services.html">Services</a><span>/</span><span style="color:rgba(255,255,255,0.75)">${crumb}</span></div>
    <span class="eyebrow">${eyebrow}</span>
    <h1>${h1}</h1>
    <p>${standfirst}</p>
  </div>
</section>

${body}

<section style="background:#1B4332;padding:4rem 0;text-align:center;">
  <div class="container">
    <h2 style="color:#fff;margin-bottom:1rem;">${cta.h}</h2>
    <p style="color:rgba(255,255,255,0.78);max-width:640px;margin:0 auto 2rem;">${cta.p}</p>
    <div class="cta-actions">
      <a href="contact.html" class="btn btn-gold btn-lg">Schedule Free In-Home Consult</a>
      <a href="tel:${cta.tel}" class="cta-phone-link">or call ${cta.telDisplay}</a>
    </div>
  </div>
</section>

${FOOTER}
<script src="js/main.js"></script>
<script src="js/cookie-consent.js"></script>
<script src="js/estimate-tab.js"></script>
</body>
</html>
`;
  writeFileSync(path.join(ROOT, file), html);
  return html.length;
}

/** Renders a cluster card grid. */
const cards = (items) =>
  `<div class="cluster">
${items
  .map(
    (i) => `      <a href="${i.href}">
        <h3>${i.title}</h3>
        <p>${i.blurb}</p>
        <span class="go">${i.cue || 'Read the guide'} ${ARROW}</span>
      </a>`
  )
  .join('\n')}
    </div>`;

/** Renders the visible FAQ block AND the matching FAQPage node, 1:1. */
function faq(items) {
  const visible = `<section class="section section-cream">
  <div class="container">
    <div class="section-header text-center fade-up">
      <span class="eyebrow">Common Questions</span>
      <h2>Frequently Asked Questions</h2>
      <div class="gold-divider center"></div>
    </div>
    <div class="pillar-faq">
${items
  .map(
    (f) => `      <div class="faq-block">
        <h3>${f.q}</h3>
        <p>${f.a}</p>
      </div>`
  )
  .join('\n')}
    </div>
  </div>
</section>`;
  const node = {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: plain(f.q),
      acceptedAnswer: { '@type': 'Answer', text: plain(f.a) },
    })),
  };
  return { visible, node };
}

const breadcrumb = (url, name) => ({
  '@type': 'BreadcrumbList',
  '@id': `${url}#breadcrumb`,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE}/services.html` },
    { '@type': 'ListItem', position: 3, name, item: url },
  ],
});

/* ══════════════════════════════════════════════════════════ SHOWERS ══════ */
{
  const url = `${SITE}/showers.html`;
  const f = faq([
    {
      q: 'What does a new shower cost in Prescott?',
      a: 'It depends on which of the four routes you take. A <a href="tub-to-shower.html">tub-to-shower conversion</a> runs <strong>$8,000&ndash;$22,000</strong>. A full <a href="walk-in-showers.html">custom walk-in shower</a> runs <strong>$10,000&ndash;$35,000</strong> depending on size, wall material and whether the drain moves. A <a href="curbless-zero-entry-showers.html">curbless or zero-entry shower</a> runs <strong>$6,000&ndash;$15,000</strong> because the floor has to be re-framed or the slab recessed. Swapping only the door is far cheaper &mdash; see <a href="frameless-vs-framed-shower-doors.html">framed vs frameless doors</a>.',
    },
    {
      q: 'Tile or groutless &mdash; which should I pick?',
      a: 'Tile gives you unlimited design freedom and is the right answer when the look is what matters most. Groutless solid-surface panels give you a shower with no grout lines to scrub, which matters a great deal in Prescott because our water is hard and grout is where hard-water residue shows first. We install both. The full side-by-side is on <a href="groutless-vs-tile-shower.html">groutless vs tile showers</a>.',
    },
    {
      q: 'How long is my bathroom out of service?',
      a: 'A straightforward tub-to-shower conversion is usually a few days to a week. A full custom tile shower takes longer because mortar, waterproofing and grout each need cure time that cannot be rushed without risking failure later. We give you a day-by-day schedule before demolition starts so you know exactly which days the bathroom is unusable.',
    },
    {
      q: 'Can you build a shower that works for aging in place?',
      a: 'Yes, and it is a large share of what we do. A zero-threshold entry, a bench, blocking behind the walls for grab bars, a handheld on a slide bar, and a slip-resistant floor can all be built into a shower that still looks like a normal beautiful bathroom rather than a hospital. See <a href="curbless-zero-entry-showers.html">curbless showers</a>, <a href="ada-bathroom-remodeling.html">ADA bathrooms</a> and our <a href="aging-in-place.html">aging-in-place work</a>.',
    },
    {
      q: 'Do I need to replace the shower or can it be refinished?',
      a: 'If the tile is sound and only the grout has failed, a regrout is often enough &mdash; our <a href="shower-grout-guide.html">shower grout guide</a> has the diagnostic for telling the two apart. If water has gotten behind the wall, the substrate is soft, or you see movement in the tile, that is a rebuild. We will tell you which one you are looking at during the in-home consult rather than after demolition.',
    },
    {
      q: 'Are you licensed to do shower and bathroom work in Yavapai County?',
      a: 'Yes. Infinity Kitchens and Baths is a licensed Arizona contractor, <strong>AZ ROC #339999</strong>, bonded and insured, and you can verify that anytime at roc.az.gov. Shower work involves waterproofing and often plumbing, which is exactly where unlicensed work causes expensive damage a year or two later.',
    },
  ]);

  const body = `<section class="section">
  <div class="container">
    <div class="hub-intro">
      <div class="hub-answer">
        <p><strong>Four routes to a new shower, and the right one depends on your bathroom, not your budget alone.</strong> Convert an unused tub (<strong>$8,000&ndash;$22,000</strong>), build a full custom walk-in (<strong>$10,000&ndash;$35,000</strong>), go curbless for step-free access (<strong>$6,000&ndash;$15,000</strong>), or keep the shower and change only the doors or the walls.</p>
        <p>Below is every shower guide on this site, grouped so you can go straight to the decision you are actually making. All of it is Prescott-specific &mdash; hard water and our mix of 1970s ranch homes and newer builds change the right answer more than most homeowners expect.</p>
      </div>

      <p>We have been remodeling showers in Prescott and across Yavapai County since 2011. In that time the single most common thing we hear is that a homeowner has a tub nobody has taken a bath in for years, sitting in the only full bathroom, taking up the space where a proper shower should be. The second most common is grout that has stopped coming clean no matter what goes on it.</p>
      <p>Both have good answers. Which answer is right for you depends on the size of the room, whether the drain has to move, how long you plan to stay in the house, and how much scrubbing you are willing to sign up for. Start with the group that matches your question.</p>
    </div>

    <div class="group-head">
      <h2>Start Here: Choose Your Shower Type</h2>
      <p>The four routes, with what each one actually costs installed.</p>
    </div>
    ${cards([
      {
        href: 'walk-in-showers.html',
        title: 'Custom Walk-In Showers',
        blurb: 'The full build — new pan, waterproofing, walls and glass, sized to your bathroom. $10,000–$35,000.',
        cue: 'See the service',
      },
      {
        href: 'tub-to-shower.html',
        title: 'Tub-to-Shower Conversion',
        blurb: 'Reclaim the footprint of a tub nobody uses. Usually the fastest route to a shower you like. $8,000–$22,000.',
        cue: 'See the service',
      },
      {
        href: 'curbless-zero-entry-showers.html',
        title: 'Curbless & Zero-Entry',
        blurb: 'No threshold to step over — for accessibility, and increasingly just for the look. $6,000–$15,000.',
      },
      {
        href: 'steam-shower-installation.html',
        title: 'Steam Showers',
        blurb: 'What a steam shower needs from the room, the enclosure and the ventilation before you commit.',
      },
    ])}

    <div class="group-head">
      <h2>Tile or Groutless: The Wall Decision</h2>
      <p>The choice that drives both the look and how much you will scrub.</p>
    </div>
    ${cards([
      {
        href: 'groutless-vs-tile-shower.html',
        title: 'Groutless vs. Tile Showers',
        blurb: 'The honest side-by-side: cost, lifespan, maintenance and resale. Start here if you are undecided.',
      },
      {
        href: 'tile-shower-installation.html',
        title: 'Custom Tile Shower Installation',
        blurb: 'How we waterproof and set a tile shower so it lasts — and why cure time cannot be compressed.',
        cue: 'See the service',
      },
      {
        href: 'groutless-shower-systems.html',
        title: 'Groutless Shower Systems',
        blurb: 'Solid-surface wall systems with no grout lines to clean. Our answer to Prescott hard water.',
        cue: 'See the service',
      },
      {
        href: 'groutless-shower-walls.html',
        title: 'Groutless Wall Materials',
        blurb: 'Acrylic, solid surface, cultured stone and large-format porcelain compared by cost and durability.',
      },
      {
        href: 'tile-shower-ideas.html',
        title: 'Tile Shower Ideas',
        blurb: 'Patterns, layouts and material combinations, with what each one costs to execute.',
      },
      {
        href: 'shower-grout-guide.html',
        title: 'Shower Grout Guide',
        blurb: 'Choosing, cleaning and maintaining grout — plus how to tell a regrout from a rebuild.',
      },
    ])}

    <div class="group-head">
      <h2>Costs & Comparisons</h2>
      <p>Real Prescott numbers before you talk to anyone.</p>
    </div>
    ${cards([
      {
        href: 'walk-in-shower-cost.html',
        title: 'Walk-In Shower Cost',
        blurb: 'What drives the number up or down — size, drain relocation, wall material, glass and valve work.',
      },
      {
        href: 'tub-to-shower-conversion-cost.html',
        title: 'Tub-to-Shower Conversion Cost',
        blurb: 'Line-item cost, timeline, and what changes when the plumbing has to move.',
      },
      {
        href: 'walk-in-shower-vs-bathtub.html',
        title: 'Walk-In Shower vs. Bathtub',
        blurb: 'Pros, cons and the resale question — including when keeping one tub is the smarter call.',
      },
      {
        href: 'frameless-vs-framed-shower-doors.html',
        title: 'Frameless vs. Framed Doors',
        blurb: 'Framed $500–$1,200, frameless $1,000–$3,000. What you actually get for the difference.',
      },
    ])}

    <div class="group-head">
      <h2>Accessibility & Choosing an Installer</h2>
      <p>For step-free bathing and for vetting whoever you hire.</p>
    </div>
    ${cards([
      {
        href: 'ada-bathroom-remodeling.html',
        title: 'ADA & Accessible Bathrooms',
        blurb: 'Clearances, grab-bar blocking, seat heights and controls — built to look like a normal bathroom.',
        cue: 'See the service',
      },
      {
        href: 'aging-in-place.html',
        title: 'Aging in Place',
        blurb: 'The whole-home view: bathing, thresholds, lighting and getting around safely.',
        cue: 'See the service',
      },
      {
        href: 'best-walk-in-shower-installer-prescott.html',
        title: 'How to Choose an Installer',
        blurb: 'The questions to ask, the licence to check, and the answers that should worry you.',
      },
      {
        href: 'bathroom-remodeling.html',
        title: 'Full Bathroom Remodeling',
        blurb: 'If the shower is one part of a bigger project, start at the bathroom pillar instead.',
        cue: 'See the service',
      },
    ])}
  </div>
</section>

<section class="section section-cream">
  <div class="container">
    <div class="hub-intro">
      <div class="section-header text-center fade-up">
        <span class="eyebrow">Local Detail</span>
        <h2>Why Prescott Changes the Shower Answer</h2>
        <div class="gold-divider center"></div>
      </div>
      <p><strong>Hard water is the single biggest factor.</strong> Yavapai County water carries enough dissolved mineral that it leaves residue on every surface it dries on. In a shower, the first place that shows is the grout, because grout is porous and slightly recessed. This is why a Prescott shower that was beautiful for three years can start looking permanently dingy in year four, and why so many of our clients arrive asking about groutless systems specifically.</p>
      <p><strong>The housing stock splits the decision too.</strong> A good deal of Prescott's established housing was built in the 1970s and 1980s with small primary bathrooms and a tub-shower combo in an alcove. Those rooms convert beautifully &mdash; the alcove is already the right footprint for a walk-in shower, and the plumbing is usually where you need it. Newer construction in areas like <a href="prescott-lakes-remodeling.html">Prescott Lakes</a> and <a href="yavapai-hills-remodeling.html">Yavapai Hills</a> tends to have larger bathrooms where a curbless build and a separate soaking tub both fit.</p>
      <p><strong>And a practical note on scheduling:</strong> if the shower you are replacing is in the only full bathroom in the house, say so at the consult. It changes how we sequence the work, and in some cases it changes which wall system we recommend, because cure times differ.</p>
    </div>
  </div>
</section>

${f.visible}`;

  const size = page({
    file: 'showers.html',
    title: 'Shower Remodeling in Prescott, AZ | Every Shower Type',
    desc: 'Walk-in, tub-to-shower, curbless and groutless showers in Prescott, AZ — real installed costs, tile vs groutless, and every shower guide in one place.',
    heroImg: `${UP}/2026/06/bathroom-remodel-marble-walk-in-shower.jpg`,
    eyebrow: 'Shower Remodeling',
    crumb: 'Showers',
    h1: 'Shower Remodeling in Prescott, AZ',
    standfirst:
      'Every shower we build, every material compared, and what each route actually costs — for Prescott homes and Prescott water.',
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        BUSINESS,
        breadcrumb(url, 'Showers'),
        {
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Shower Remodeling & Installation',
          serviceType: 'Shower remodeling',
          provider: { '@id': `${SITE}/#business` },
          areaServed: [
            'Prescott',
            'Prescott Valley',
            'Chino Valley',
            'Dewey-Humboldt',
            'Sedona',
            'Cottonwood',
          ].map((n) => ({ '@type': 'City', name: n })),
          description:
            'Walk-in showers, tub-to-shower conversions, curbless and zero-entry showers, custom tile showers and groutless solid-surface shower systems in Prescott, AZ.',
        },
        {
          '@type': 'CollectionPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Shower Remodeling in Prescott, AZ',
          isPartOf: { '@id': `${SITE}/#website` },
          about: { '@id': `${url}#service` },
        },
        { ...f.node, '@id': `${url}#faq` },
      ],
    },
    body,
    cta: {
      h: 'Not Sure Which Shower Is Right for Your Bathroom?',
      p: 'That is exactly what the free in-home consult is for. We measure the room, look at what the plumbing will allow, and give you a fixed quote on the option that actually fits — with no obligation.',
      tel: '9288001998',
      telDisplay: '928-800-1998',
    },
  });
  console.log(`showers.html          ${size} bytes`);
}

/* ═════════════════════════════════════════════════════ COUNTERTOPS ══════ */
{
  const url = `${SITE}/countertops.html`;
  const f = faq([
    {
      q: 'What is the best countertop material for a Prescott kitchen?',
      a: 'For most households, <strong>quartz</strong>. It is non-porous, so it never needs sealing &mdash; which matters here because hard water leaves mineral residue that shows on any surface needing a sealer to stay protected. Choose <strong>granite</strong> if you want natural stone with real heat resistance and do not mind sealing it annually. Choose <strong>quartzite</strong> if you want the look of marble with far more durability. Full comparisons: <a href="quartz-vs-granite.html">quartz vs granite</a> and <a href="quartzite-vs-quartz.html">quartzite vs quartz</a>.',
    },
    {
      q: 'How much do countertops cost installed?',
      a: 'Installed, per square foot: laminate $8&ndash;$18, butcher block $35&ndash;$65, granite $45&ndash;$100, quartz $55&ndash;$120, marble $75&ndash;$150 and quartzite $85&ndash;$165. For a typical 60-square-foot kitchen with an island that puts quartz around <strong>$3,300&ndash;$7,200</strong> and granite around <strong>$2,700&ndash;$6,000</strong>. The full table with maintenance for each is on <a href="countertop-costs.html">countertop costs</a>.',
    },
    {
      q: 'Should I avoid marble in a kitchen?',
      a: 'Not necessarily, but go in with clear eyes. Marble etches from anything acidic &mdash; lemon, wine, vinegar, some cleaners &mdash; and that etching is a physical change to the stone, not a stain you can scrub out. It needs sealing several times a year. Plenty of people accept that because nothing else looks quite like it. If you love the look but not the upkeep, quartzite is the usual answer. See <a href="granite-vs-marble.html">granite vs marble</a>.',
    },
    {
      q: 'Do you template and fabricate, or subcontract it?',
      a: 'We handle the project end to end and source materials factory-direct rather than through a retail showroom, which is where a lot of the markup on stone sits. That is also why we can quote a fixed price: we know what the slab costs and what the fabrication costs before we give you a number.',
    },
    {
      q: 'Can I replace only the countertops and keep my cabinets?',
      a: 'Usually yes, and it is one of the highest-impact single upgrades in a kitchen. The cabinets need to be structurally sound and level, since stone will not forgive a cabinet run that has sagged. If your cabinets are solid but dated, look at <a href="cabinet-refinishing-refacing.html">refinishing or refacing</a> alongside new tops &mdash; together they read as a full remodel at a fraction of the cost.',
    },
    {
      q: 'What about the backsplash?',
      a: 'A backsplash is normally part of a kitchen remodel and we handle it as part of the job &mdash; see <a href="kitchen-backsplash.html">kitchen backsplashes</a>. If a backsplash on its own is all you need, we will refer you to a tile installer we trust rather than send a sales rep out for it. Everyone gets a better outcome that way.',
    },
  ]);

  const body = `<section class="section">
  <div class="container">
    <div class="hub-intro">
      <div class="hub-answer">
        <p><strong>Quartz suits most Prescott kitchens</strong> because it never needs sealing and our hard water is unkind to anything that does. Granite if you want natural stone and heat resistance; quartzite for the marble look with real durability; butcher block for warmth on an island. Installed, expect roughly <strong>$55&ndash;$120 per square foot for quartz</strong> and <strong>$45&ndash;$100 for granite</strong>.</p>
        <p>Below: the full cost table for all six materials, every material comparison on this site, and how to vet a fabricator.</p>
      </div>

      <p>Countertops are the surface people touch every day and the one they look at from every angle of the room, which is why they carry so much of a kitchen's finished feel. They are also the decision homeowners most often make twice &mdash; picking a material for how it looks in a showroom, then discovering what it asks of them once it is installed and living under real use.</p>
      <p>The comparisons below exist to prevent that. Each one is written around the trade-off that actually matters for the material, not a feature list.</p>

      <div class="group-head">
        <h2>What Countertops Cost in Prescott, Installed</h2>
        <p>Per square foot and for a typical 60&nbsp;sq&nbsp;ft kitchen with an island.</p>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr><th>Material</th><th>Installed / Sq Ft</th><th>Typical 60 Sq Ft Kitchen</th><th>Maintenance</th></tr>
          </thead>
          <tbody>
            <tr><td>Laminate</td><td>$8&ndash;$18</td><td>$480&ndash;$1,080</td><td>None &mdash; but scratches and chips easily</td></tr>
            <tr><td>Butcher Block</td><td>$35&ndash;$65</td><td>$2,100&ndash;$3,900</td><td>Oil every 3&ndash;6 months; avoid standing water</td></tr>
            <tr><td>Granite</td><td>$45&ndash;$100</td><td>$2,700&ndash;$6,000</td><td>Seal annually; heat and scratch resistant</td></tr>
            <tr><td>Quartz (engineered)</td><td>$55&ndash;$120</td><td>$3,300&ndash;$7,200</td><td>None &mdash; non-porous, never seals</td></tr>
            <tr><td>Marble</td><td>$75&ndash;$150</td><td>$4,500&ndash;$9,000</td><td>Seal 2&ndash;4&times;/year; etches from acid</td></tr>
            <tr><td>Quartzite</td><td>$85&ndash;$165</td><td>$5,100&ndash;$9,900</td><td>Seal annually; harder than granite</td></tr>
          </tbody>
        </table>
      </div>
      <p style="font-size:0.88rem;color:var(--gray-600);">Ranges are installed prices for the Prescott market and include template, fabrication and setting. The <a href="countertop-costs.html">full cost guide</a> breaks down what moves a quote within those ranges &mdash; edge profile, cutouts, seams and slab grade.</p>
    </div>

    <div class="group-head">
      <h2>Compare Materials Head to Head</h2>
      <p>The four comparisons homeowners actually ask us to settle.</p>
    </div>
    ${cards([
      {
        href: 'quartz-vs-granite.html',
        title: 'Quartz vs. Granite',
        blurb: 'The most common countertop decision in Prescott, settled on maintenance, heat, seams and resale.',
      },
      {
        href: 'quartzite-vs-quartz.html',
        title: 'Quartzite vs. Quartz',
        blurb: 'Two very different materials with confusingly similar names. Which one you actually want.',
      },
      {
        href: 'granite-vs-marble.html',
        title: 'Granite vs. Marble',
        blurb: 'Why marble etches, what that looks like in year three, and when it is still worth it.',
      },
      {
        href: 'butcher-block-vs-quartz.html',
        title: 'Butcher Block vs. Quartz',
        blurb: 'Warmth and workability against zero maintenance — including using both in one kitchen.',
      },
    ])}

    <div class="group-head">
      <h2>Service, Cost & Choosing a Fabricator</h2>
    </div>
    ${cards([
      {
        href: 'custom-countertops.html',
        title: 'Custom Countertops',
        blurb: 'Our countertop service — template, fabrication and installation, with factory-direct material sourcing.',
        cue: 'See the service',
      },
      {
        href: 'countertop-costs.html',
        title: 'Countertop Cost Guide',
        blurb: 'The full table plus what moves a quote: edges, cutouts, seams and slab grade.',
      },
      {
        href: 'best-countertop-installer-prescott.html',
        title: 'How to Choose an Installer',
        blurb: 'What to ask a fabricator, which answers are red flags, and how to check a licence.',
      },
      {
        href: 'kitchen-remodeling.html',
        title: 'Full Kitchen Remodeling',
        blurb: 'If countertops are one part of a larger kitchen project, start at the kitchen pillar.',
        cue: 'See the service',
      },
    ])}

    <div class="group-head">
      <h2>Pairs Well With</h2>
      <p>The decisions homeowners make in the same breath as countertops.</p>
    </div>
    ${cards([
      {
        href: 'kitchen-cabinets.html',
        title: 'Kitchen Cabinets',
        blurb: 'New cabinetry, and how door style and finish interact with your countertop choice.',
        cue: 'See the service',
      },
      {
        href: 'cabinet-refinishing-refacing.html',
        title: 'Refinishing vs. Refacing',
        blurb: 'Sound cabinets and new tops often read as a full remodel for far less.',
      },
      {
        href: 'kitchen-backsplash.html',
        title: 'Kitchen Backsplash',
        blurb: 'Handled as part of a kitchen remodel — how it meets the counter matters more than the tile.',
        cue: 'See the service',
      },
      {
        href: 'remodel-cost-calculator.html',
        title: 'Remodel Cost Calculator',
        blurb: 'Get a ballpark range for the whole kitchen in about a minute.',
        cue: 'Try the calculator',
      },
    ])}
  </div>
</section>

${f.visible}`;

  const size = page({
    file: 'countertops.html',
    title: 'Countertops in Prescott, AZ | Cost & Materials Guide',
    desc: 'Quartz, granite, quartzite and marble countertops in Prescott, AZ — installed cost per square foot, head-to-head material comparisons and fitting.',
    heroImg: `${UP}/2026/06/luxury-kitchen-marble-island-countertop.jpg`,
    eyebrow: 'Countertops',
    crumb: 'Countertops',
    h1: 'Countertops in Prescott, AZ',
    standfirst:
      'Every material compared, real installed costs for the Prescott market, and factory-direct fabrication without the retail showroom markup.',
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        BUSINESS,
        breadcrumb(url, 'Countertops'),
        {
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Countertop Fabrication & Installation',
          serviceType: 'Countertop installation',
          provider: { '@id': `${SITE}/#business` },
          areaServed: [
            'Prescott',
            'Prescott Valley',
            'Chino Valley',
            'Dewey-Humboldt',
            'Sedona',
            'Cottonwood',
          ].map((n) => ({ '@type': 'City', name: n })),
          description:
            'Quartz, granite, quartzite, marble and butcher block countertop fabrication and installation in Prescott, AZ, with factory-direct material sourcing.',
        },
        {
          '@type': 'CollectionPage',
          '@id': `${url}#webpage`,
          url,
          name: 'Countertops in Prescott, AZ',
          isPartOf: { '@id': `${SITE}/#website` },
          about: { '@id': `${url}#service` },
        },
        { ...f.node, '@id': `${url}#faq` },
      ],
    },
    body,
    cta: {
      h: 'Get a Fixed Quote on Your Countertops',
      p: 'We bring material samples to you, measure the actual runs, and quote a firm installed price — factory-direct, with no retail showroom markup on the slab.',
      tel: '9288001998',
      telDisplay: '928-800-1998',
    },
  });
  console.log(`countertops.html      ${size} bytes`);
}

/* ═════════════════════════════════════════════════════ WEST VALLEY ══════ */
{
  const url = `${SITE}/west-valley.html`;
  const CITIES = [
    { slug: 'avondale', name: 'Avondale', note: 'Coming-soon showroom on N Central Ave', hoods: 'Coldwater Springs, Garden Lakes, Rio Crossing' },
    { slug: 'buckeye', name: 'Buckeye', note: 'One of the fastest-growing cities in Arizona', hoods: 'Verrado, Tartesso, Sundance' },
    { slug: 'glendale', name: 'Glendale', note: 'Established housing stock ripe for updating', hoods: 'Arrowhead Ranch, Sierra Verde, Cholla' },
    { slug: 'goodyear', name: 'Goodyear', note: 'Newer builds plus maturing 2000s subdivisions', hoods: 'Estrella, Palm Valley, PebbleCreek' },
    { slug: 'peoria', name: 'Peoria', note: 'Wide range of ages and lot sizes', hoods: 'Vistancia, Arrowhead Lakes, Fletcher Heights' },
    { slug: 'surprise', name: 'Surprise', note: 'Heavy 1990s–2000s tract construction', hoods: 'Marley Park, Sun City Grand, Asante' },
    { slug: 'sun-city', name: 'Sun City', note: 'Active-adult — most of our aging-in-place work', hoods: 'Original Del Webb villas and patio homes' },
    { slug: 'sun-city-west', name: 'Sun City West', note: 'Active-adult, 1980s–1990s builds', hoods: 'Del Webb villas, duplexes, garden apartments' },
  ];

  const f = faq([
    {
      q: 'Do you actually work in the West Valley, or only Prescott?',
      a: 'Both. Our showroom and office are in Prescott and we have served Yavapai County since 2011, and we run projects throughout the West Valley of the Phoenix metro. Our West Valley line is <strong>602-885-6998</strong> &mdash; call that number rather than the Prescott one and you will reach the right side of the schedule straight away.',
    },
    {
      q: 'Which West Valley cities do you cover?',
      a: 'Avondale, Buckeye, Glendale, Goodyear, Peoria, Surprise, Sun City and Sun City West. If your address is nearby but not on that list, call <strong>602-885-6998</strong> and we will tell you plainly whether we can serve it well &mdash; we would rather say no than stretch a crew too thin.',
    },
    {
      q: 'Is the consultation still free if I am in the Phoenix metro?',
      a: 'Yes. The free in-home consultation works the same way in the West Valley as it does in Prescott: we come to you with design tools and material samples, measure the space, talk through what you want, and leave you with a detailed no-obligation quote. Coming to you is how we do it everywhere &mdash; you should not have to drive to a showroom to get a price.',
    },
    {
      q: 'Do you do a lot of aging-in-place work in Sun City and Sun City West?',
      a: 'Yes &mdash; it is one of the main reasons we work in the West Valley at all. The active-adult communities there are full of original Del Webb bathrooms with step-over tubs in the only full bath. Converting those to a <a href="tub-to-shower.html">walk-in shower</a> or a <a href="curbless-zero-entry-showers.html">curbless entry</a>, with proper blocking for grab bars, is work we do constantly. See our <a href="aging-in-place.html">aging-in-place</a> and <a href="ada-bathroom-remodeling.html">ADA bathroom</a> pages.',
    },
    {
      q: 'Are you licensed to work in Maricopa County?',
      a: 'Yes. Infinity Kitchens and Baths is a licensed Arizona contractor &mdash; <strong>AZ ROC #339999</strong>, bonded and insured &mdash; and an Arizona ROC licence is statewide, not county-by-county. You can verify it anytime at roc.az.gov. Permits are pulled through the relevant city or Maricopa County depending on the jurisdiction and scope.',
    },
    {
      q: 'Does being based in Prescott affect the schedule or the price?',
      a: 'It affects how we schedule, not what you pay. We batch West Valley projects so crews are working full days in the metro rather than commuting back and forth, which is also why our West Valley calendar has defined windows rather than same-week starts. Your quote is a fixed price with no travel surcharge buried in it.',
    },
  ]);

  const cityCards = CITIES.map(
    (c) => `      <div class="city-card">
        <h3>${c.name}, AZ</h3>
        <p class="pop">${c.note}</p>
        <ul>
          <li><a href="kitchen-remodeling-${c.slug}.html">Kitchen Remodeling ${ARROW}</a></li>
          <li><a href="bathroom-remodeling-${c.slug}.html">Bathroom Remodeling ${ARROW}</a></li>
          <li><a href="${c.slug}-remodeling.html">All Remodeling Services ${ARROW}</a></li>
        </ul>
      </div>`
  ).join('\n');

  const body = `<section class="section">
  <div class="container">
    <div class="hub-intro">
      <div class="hub-answer">
        <p><strong>We remodel kitchens and bathrooms across eight West Valley cities:</strong> Avondale, Buckeye, Glendale, Goodyear, Peoria, Surprise, Sun City and Sun City West. Our West Valley line is <strong><a href="tel:6028856998" style="color:var(--green-700);">602-885-6998</a></strong>.</p>
        <p>The free in-home consultation works exactly as it does in Prescott &mdash; we come to you with design tools and samples and leave a detailed, no-obligation quote. Pick your city below to go straight to kitchens, bathrooms or full services.</p>
      </div>

      <p>Infinity Kitchens and Baths has remodeled kitchens and bathrooms since 2011, based in Prescott and working throughout Yavapai County and the West Valley of the Phoenix metro. Two things brought us down into the metro and keep us there.</p>
      <p>The first is the housing stock. A great deal of the West Valley went up between the mid-1990s and the late 2000s, which means an enormous number of homes are now hitting the age where the original builder-grade kitchen and the original bathrooms are simply worn out &mdash; laminate tops, oak cabinets, cultured-marble vanities, and a step-over tub-shower combo in the primary bath.</p>
      <p>The second is the active-adult communities. Sun City and Sun City West in particular are full of original Del Webb bathrooms that were never designed for someone who now has trouble stepping over a tub wall. Converting those safely, without making a bathroom look institutional, is some of the most rewarding work we do.</p>
    </div>

    <div class="group-head">
      <h2>Choose Your City</h2>
      <p>Kitchens, bathrooms and full remodeling services for each West Valley city we serve.</p>
    </div>
    <div class="city-grid">
${cityCards}
    </div>
  </div>
</section>

<section class="section section-cream">
  <div class="container">
    <div class="hub-intro">
      <div class="section-header text-center fade-up">
        <span class="eyebrow">What We Do Here</span>
        <h2>The West Valley Projects We See Most</h2>
        <div class="gold-divider center"></div>
      </div>
      <p><strong>Builder-grade kitchen updates.</strong> Homes from the late-1990s and 2000s boom typically shipped with oak or maple cabinets, laminate or entry-level granite tops, and a cramped island. Replacing tops and either <a href="cabinet-refinishing-refacing.html">refinishing or replacing</a> the cabinets transforms the room without moving a single wall. Start at <a href="kitchen-remodeling.html">kitchen remodeling</a> or price it with the <a href="remodel-cost-calculator.html">cost calculator</a>.</p>
      <p><strong>Tub-to-shower conversions.</strong> Far and away our most requested West Valley bathroom project, and the one with the biggest day-to-day payoff. See <a href="tub-to-shower.html">tub-to-shower conversion</a> and the <a href="tub-to-shower-conversion-cost.html">cost breakdown</a>, or the full <a href="showers.html">shower guide</a> if you are weighing shower types.</p>
      <p><strong>Aging-in-place bathrooms.</strong> Curbless entries, grab-bar blocking, comfort-height fixtures and slip-resistant floors &mdash; built into a bathroom that still looks like a bathroom. See <a href="aging-in-place.html">aging in place</a>, <a href="ada-bathroom-remodeling.html">ADA bathrooms</a> and <a href="curbless-zero-entry-showers.html">curbless showers</a>.</p>
      <p><strong>Hard-water-proof showers.</strong> Metro water is hard, and grout is where that shows first. <a href="groutless-shower-systems.html">Groutless solid-surface systems</a> remove the problem instead of managing it &mdash; compare them on <a href="groutless-vs-tile-shower.html">groutless vs tile</a>.</p>
      <p><strong>Countertop replacement on its own.</strong> Often the single highest-impact change in a builder-grade kitchen. See the <a href="countertops.html">countertops hub</a> for materials and installed costs.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="hub-intro">
      <div class="section-header text-center fade-up">
        <span class="eyebrow">Also Serving</span>
        <h2>Prescott &amp; Yavapai County</h2>
        <div class="gold-divider center"></div>
      </div>
      <p>Our showroom and office are at 723 N Montezuma St, Suite C in Prescott, and Yavapai County is where we started. If your project is up here rather than in the metro, call <a href="tel:9288001998">928-800-1998</a> and start with <a href="prescott-remodeling.html">Prescott</a>, <a href="prescott-valley-remodeling.html">Prescott Valley</a>, <a href="chino-valley-remodeling.html">Chino Valley</a>, <a href="dewey-humboldt-remodeling.html">Dewey-Humboldt</a>, <a href="sedona-remodeling.html">Sedona</a> or <a href="cottonwood-remodeling.html">Cottonwood</a>.</p>
    </div>
  </div>
</section>

${f.visible}`;

  const size = page({
    file: 'west-valley.html',
    title: 'West Valley Kitchen &amp; Bath Remodeling | Phoenix Metro',
    desc: 'Kitchen and bathroom remodeling in Avondale, Buckeye, Glendale, Goodyear, Peoria, Surprise, Sun City and Sun City West. Free in-home consults.',
    heroImg: `${UP}/2025/03/Walker-Whole-House.jpg`,
    eyebrow: 'West Valley — Phoenix Metro',
    crumb: 'West Valley',
    h1: 'West Valley Kitchen &amp; Bathroom Remodeling',
    standfirst:
      'Eight cities across the West Valley, from Buckeye to Sun City West — with free in-home consultations and a licensed Arizona crew. Call 602-885-6998.',
    jsonld: {
      '@context': 'https://schema.org',
      '@graph': [
        BUSINESS,
        breadcrumb(url, 'West Valley'),
        {
          '@type': 'Service',
          '@id': `${url}#service`,
          name: 'Kitchen & Bathroom Remodeling — West Valley, Phoenix Metro',
          serviceType: 'Kitchen and bathroom remodeling',
          provider: { '@id': `${SITE}/#business` },
          areaServed: CITIES.map((c) => ({ '@type': 'City', name: c.name })).concat([
            { '@type': 'AdministrativeArea', name: 'Maricopa County' },
          ]),
          description:
            'Kitchen and bathroom remodeling, tub-to-shower conversions and aging-in-place bathrooms across the West Valley of the Phoenix metro, including Sun City and Sun City West.',
        },
        {
          '@type': 'CollectionPage',
          '@id': `${url}#webpage`,
          url,
          name: 'West Valley Kitchen & Bathroom Remodeling',
          isPartOf: { '@id': `${SITE}/#website` },
          about: { '@id': `${url}#service` },
        },
        { ...f.node, '@id': `${url}#faq` },
      ],
    },
    body,
    cta: {
      h: 'Book a Free In-Home Consult in the West Valley',
      p: 'We come to you anywhere from Buckeye to Sun City West — design tools, material samples, real measurements, and a detailed quote with no obligation.',
      tel: '6028856998',
      telDisplay: '602-885-6998',
    },
  });
  console.log(`west-valley.html      ${size} bytes`);
}
