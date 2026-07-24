#!/usr/bin/env node
/**
 * Generates featured-in.html — the press / "As Featured In" page.
 *
 * Chrome (GA/Ads head block, nav, footer) is lifted from about.html at build
 * time, so re-running this after any sitewide nav or footer change keeps the
 * page in sync. Usage: node build-featured-in.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.infinitykitchenandbathllc.com';
const SOURCE = readFileSync(path.join(ROOT, 'about.html'), 'utf8');

function slice(start, endMarker, opts = {}) {
  const s = SOURCE.indexOf(start);
  if (s === -1) throw new Error(`chrome marker not found: ${start}`);
  const e = SOURCE.indexOf(endMarker, s);
  if (e === -1) throw new Error(`chrome end marker not found: ${endMarker}`);
  return SOURCE.slice(s, e + (opts.keepEnd === false ? 0 : endMarker.length));
}

// --- chrome -----------------------------------------------------------------
// The GA/Ads head block is two <script> tags (loader + config), so run past the
// first closing tag to the second.
const gtagStart = SOURCE.indexOf('<!-- Google tag (gtag.js) -->');
const gtagEnd =
  SOURCE.indexOf('</script>', SOURCE.indexOf('</script>', gtagStart) + 9) + '</script>'.length;
if (gtagStart === -1 || gtagEnd < gtagStart) throw new Error('gtag head block not found');
const GTAG = SOURCE.slice(gtagStart, gtagEnd);

const navStart = SOURCE.indexOf('<nav id="navbar"');
const navCta = SOURCE.indexOf('mobile-nav-cta', navStart);
const navEnd = SOURCE.indexOf('</div>', SOURCE.indexOf('</div>', navCta) + 6) + 6;
const NAV = SOURCE.slice(navStart, navEnd);

const FOOTER = slice('<footer>', '</footer>');

// --- press mentions ---------------------------------------------------------
// Quotes are verbatim from the published articles. `date` omitted where the
// publisher does not expose one.
const PRESS = [
  {
    outlet: 'Resident Magazine',
    date: 'July 22, 2026',
    isoDate: '2026-07-22',
    headline:
      'Beyond Square Footage: How Exceptional Design, Craftsmanship, and Innovation Are Redefining Luxury Homes',
    quote:
      'Infinity Kitchen &amp; Bath specializes in designing kitchens that blend sophisticated aesthetics with everyday usability.',
    url: 'https://resident.com/home-and-living/2026/07/22/beyond-square-footage-how-exceptional-design-craftsmanship-and-innovation-are-redefining-luxury-homes',
  },
  {
    outlet: 'Boston Apartments',
    date: 'July 21, 2026',
    isoDate: '2026-07-21',
    headline: 'Why Successful Rental Property Investors Build a Team — Not Just a Portfolio',
    quote:
      'Infinity Kitchens &amp; Baths, LLC works with homeowners and investors in Prescott, AZ to transform outdated kitchens and bathrooms into functional, modern spaces that attract quality tenants while increasing property value.',
    url: 'https://bostonapartments.com/investments/why-successful-rental-property-investors-build-a-team-not-just-a-portfolio.htm',
  },
  {
    outlet: 'BOSS Magazine',
    date: 'July 20, 2026',
    isoDate: '2026-07-20',
    headline: 'How High-End Design Is Driving Home Values',
    quote:
      'Infinity Kitchen &amp; Bath focuses on creating kitchens that combine elegant design with everyday practicality.',
    url: 'https://thebossmagazine.com/post/high-end-design-home-values/',
  },
  {
    outlet: 'The Pinnacle List',
    date: '',
    isoDate: '',
    headline:
      "The Luxury Homeowner's Guide to Creating a Timeless Estate: The Experts Behind Every Exceptional Home",
    quote:
      'According to Infinity Kitchen &amp; Bath, successful luxury remodeling begins with understanding how homeowners actually use their spaces.',
    url: 'https://www.thepinnaclelist.com/article/the-luxury-homeowners-guide-to-creating-a-timeless-estate-the-experts-behind-every-exceptional-home/',
  },
];

const TITLE = 'Featured In: Infinity Kitchens and Baths in the Press | Prescott, AZ';
const DESC =
  'Infinity Kitchens and Baths, LLC has been featured in Resident Magazine, BOSS Magazine, Boston Apartments and The Pinnacle List for kitchen and bath design. Call 928-800-1998.';
const PAGE_URL = `${SITE}/featured-in.html`;
const LOGO = `${SITE}/wp-content/uploads/2023/11/infinity-logo.png`;

// --- structured data --------------------------------------------------------
const jsonld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'HomeAndConstructionBusiness',
      '@id': `${SITE}/#business`,
      name: 'Infinity Kitchens and Baths',
      url: `${SITE}/`,
      telephone: '+1-928-800-1998',
      image: LOGO,
      logo: LOGO,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '723 N Montezuma St, Suite C',
        addressLocality: 'Prescott',
        addressRegion: 'AZ',
        postalCode: '86301',
        addressCountry: 'US',
      },
      subjectOf: PRESS.map((p) => ({ '@type': 'Article', url: p.url, headline: p.headline })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Featured In', item: PAGE_URL },
      ],
    },
    {
      '@type': 'CollectionPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: 'Featured In',
      description: DESC,
      about: { '@id': `${SITE}/#business` },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: PRESS.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Article',
            headline: p.headline,
            url: p.url,
            ...(p.isoDate ? { datePublished: p.isoDate } : {}),
            publisher: { '@type': 'Organization', name: p.outlet },
            mentions: { '@id': `${SITE}/#business` },
          },
        })),
      },
    },
  ],
};

// --- page-scoped CSS --------------------------------------------------------
const CSS = `
  .press-strip{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:2.5rem 3.5rem;padding:2.5rem 0;}
  .press-strip span{font-family:var(--font-display,Georgia,serif);font-size:1.05rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--green-700,#1D5535);opacity:0.65;white-space:nowrap;}
  .press-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:2rem;}
  .press-card{display:flex;flex-direction:column;background:#fff;border:1px solid var(--green-100,#e4ece7);border-left:3px solid var(--gold,#B08D57);border-radius:6px;padding:2rem 2rem 1.75rem;transition:box-shadow .25s ease,transform .25s ease;}
  .press-card:hover{box-shadow:0 14px 34px rgba(29,85,53,0.10);transform:translateY(-3px);}
  .press-meta{display:flex;flex-wrap:wrap;align-items:baseline;gap:0.5rem 0.75rem;margin-bottom:0.85rem;}
  .press-outlet{font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:var(--gold,#B08D57);}
  .press-date{font-size:0.75rem;color:#7b8b81;}
  .press-card h3{font-size:1.12rem;line-height:1.4;margin:0 0 1rem;}
  .press-card h3 a{color:var(--green-700,#1D5535);text-decoration:none;}
  .press-card h3 a:hover{text-decoration:underline;}
  .press-quote{position:relative;margin:0 0 1.5rem;padding-left:1.1rem;border-left:2px solid var(--green-100,#e4ece7);font-style:italic;color:#4a5a52;line-height:1.7;}
  .press-cta{margin-top:auto;font-size:0.82rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:var(--green-700,#1D5535);text-decoration:none;display:inline-flex;align-items:center;gap:0.4rem;}
  .press-cta:hover{color:var(--gold,#B08D57);}
  .press-cta svg{transition:transform .2s ease;}
  .press-cta:hover svg{transform:translateX(3px);}
  @media(max-width:640px){.press-strip{gap:1.25rem 2rem;padding:1.75rem 0;}.press-strip span{font-size:0.9rem;}.press-card{padding:1.5rem;}}
`;

const arrow =
  '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z"/></svg>';

const cards = PRESS.map(
  (p) => `        <article class="press-card fade-up">
          <div class="press-meta">
            <span class="press-outlet">${p.outlet}</span>${
              p.date ? `\n            <span class="press-date">${p.date}</span>` : ''
            }
          </div>
          <h3><a href="${p.url}" target="_blank" rel="noopener">${p.headline}</a></h3>
          <blockquote class="press-quote">&ldquo;${p.quote}&rdquo;</blockquote>
          <a href="${p.url}" class="press-cta" target="_blank" rel="noopener">Read the full article ${arrow}</a>
        </article>`
).join('\n');

const strip = PRESS.map((p) => `      <span>${p.outlet}</span>`).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  ${GTAG}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${TITLE}</title>
  <meta name="description" content="${DESC}">
  <link rel="stylesheet" href="css/styles.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#1D5535">

  <!-- SEO: canonical, Open Graph & structured data -->
  <link rel="canonical" href="${PAGE_URL}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Infinity Kitchens and Baths">
  <meta property="og:title" content="${TITLE}">
  <meta property="og:description" content="${DESC}">
  <meta property="og:url" content="${PAGE_URL}">
  <meta property="og:image" content="${LOGO}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${TITLE}">
  <meta name="twitter:description" content="${DESC}">
  <meta name="twitter:image" content="${LOGO}">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  <style>${CSS}  </style>
</head>
<body>

${NAV}

<!-- PAGE HERO -->
<section class="page-hero">
  <div class="page-hero-inner">
    <div class="breadcrumb">
      <a href="index.html">Home</a>
      <span>/</span>
      <span style="color:rgba(255,255,255,0.75)">Featured In</span>
    </div>
    <span class="eyebrow">In the Press</span>
    <h1>Featured In</h1>
    <p>National design and real estate publications turn to Infinity Kitchens and Baths for perspective on kitchen and bath remodeling &mdash; here is where our work and our thinking have appeared.</p>
  </div>
</section>

<!-- LOGO STRIP -->
<section class="section-sm">
  <div class="container">
    <div class="press-strip">
${strip}
    </div>
  </div>
</section>

<!-- PRESS MENTIONS -->
<section class="section section-cream">
  <div class="container">
    <div class="section-header text-center fade-up">
      <span class="eyebrow">Recent Coverage</span>
      <h2>What the Press Is Saying</h2>
      <div class="gold-divider center"></div>
      <p>Every quote below is published verbatim by the outlet. Follow any headline to read the full article on the publisher&rsquo;s site.</p>
    </div>
    <div class="press-grid">
${cards}
    </div>
  </div>
</section>

<!-- WHY IT MATTERS -->
<section class="section">
  <div class="container">
    <div class="grid-2" style="gap:4rem;align-items:center;">
      <div class="fade-up">
        <span class="eyebrow">Why It Matters</span>
        <h2>Recognition Backed by 35+ Years of Craft</h2>
        <div class="gold-divider"></div>
        <p>Press coverage is nice. What earns it is the work: more than three decades of hands-on remodeling experience, factory-direct pricing that keeps premium materials within reach, and a background-checked crew Prescott homeowners trust in their homes.</p>
        <p>Infinity Kitchens and Baths, LLC is a licensed Arizona contractor (AZ ROC #339999), bonded and fully insured, family-owned and serving Prescott and the greater Yavapai County area since 2011.</p>
        <ul class="check-list mt-3">
          <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 011.07 1.05l-3.99 4.99a.75.75 0 01-1.08.02L4.324 8.384a.75.75 0 111.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 01.02-.022z"/></svg> Quoted by national design &amp; real estate publications</li>
          <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 011.07 1.05l-3.99 4.99a.75.75 0 01-1.08.02L4.324 8.384a.75.75 0 111.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 01.02-.022z"/></svg> 5-star rated on Google and HomeAdvisor</li>
          <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 011.07 1.05l-3.99 4.99a.75.75 0 01-1.08.02L4.324 8.384a.75.75 0 111.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 01.02-.022z"/></svg> AZ ROC #339999 &mdash; licensed, bonded &amp; insured</li>
          <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 011.07 1.05l-3.99 4.99a.75.75 0 01-1.08.02L4.324 8.384a.75.75 0 111.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 01.02-.022z"/></svg> Free in-home design consultation, no obligation</li>
        </ul>
        <div style="margin-top:2rem;display:flex;flex-wrap:wrap;gap:1rem;">
          <a href="about.html" class="btn btn-outline-dark">About Our Company</a>
          <a href="reviews.html" class="btn btn-outline-dark">Read Client Reviews</a>
        </div>
      </div>
      <div class="fade-in stagger-2" style="border-radius:8px;overflow:hidden;min-height:420px;">
        <img src="${SITE}/wp-content/uploads/2026/06/modern-white-kitchen-remodel-gold-accents.jpg" alt="Modern white kitchen remodel with gold accents by Infinity Kitchens and Baths in Prescott, AZ" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
      </div>
    </div>
  </div>
</section>

<!-- MEDIA INQUIRIES -->
<section class="section section-dark">
  <div class="container">
    <div class="section-header text-center fade-up">
      <span class="eyebrow">Media &amp; Press</span>
      <h2>Media Inquiries</h2>
      <div class="gold-divider center"></div>
      <p style="max-width:680px;margin:0 auto;">Writing about kitchen design, bathroom remodeling, aging-in-place renovation, or the Arizona remodeling market? We&rsquo;re glad to provide expert commentary, project photography, and cost data. Call <a href="tel:9288001998" style="color:var(--gold);">928-800-1998</a> or <a href="contact.html" style="color:var(--gold);">send us a message</a>.</p>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-banner">
  <div class="container text-center">
    <span class="eyebrow">Get Started</span>
    <h2>Ready to Start Your Remodel?</h2>
    <p>Schedule your free in-home consultation and let&rsquo;s talk about transforming your space.</p>
    <div class="cta-actions">
      <a href="contact.html" class="btn btn-gold btn-lg">Schedule Free Consultation</a>
      <a href="tel:9288001998" class="cta-phone-link">or call 928-800-1998</a>
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

writeFileSync(path.join(ROOT, 'featured-in.html'), html);
console.log(`featured-in.html written (${PRESS.length} press mentions, ${html.length} bytes)`);
