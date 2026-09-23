#!/usr/bin/env node
/**
 * Builds the "best of" listicles from listicles/<slug>.mjs (format: listicles/SPEC.md).
 *
 *   ranked     — Infinity is #1, then real local competitors. A disclosure line sits
 *                directly under the H1 and an ItemList goes in the JSON-LD.
 *   supporting — ranks options/ideas, never companies.
 *
 * Chrome (GA/Ads head block, skip link, nav, footer, scripts) is lifted from about.html
 * at build time; the author box is lifted from best-countertop-installer-prescott.html.
 * Re-run after any chrome change.
 *
 * Fails loudly on: missing hero image, broken internal links, title > 60 / h1 > 70
 * chars, description outside 110-160 chars, FAQ HTML that doesn't survive stripping.
 *
 * Usage: node build-listicles.mjs            (all)
 *        node build-listicles.mjs <slug>...  (some)
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.infinitykitchenandbathllc.com';
const LOGO = `${SITE}/wp-content/uploads/2023/11/infinity-logo.png`;
const DIR = path.join(ROOT, 'listicles');

// ---------------------------------------------------------------- chrome ----
const SRC = readFileSync(path.join(ROOT, 'about.html'), 'utf8');
const gtagStart = SRC.indexOf('<!-- Google tag (gtag.js) -->');
const gtagEnd = SRC.indexOf('</script>', SRC.indexOf('</script>', gtagStart) + 9) + 9;
const GTAG = SRC.slice(gtagStart, gtagEnd);
const MAIN_OPEN = '<main id="main" tabindex="-1">';
const BODY_TOP = SRC.slice(SRC.indexOf('<body>'), SRC.indexOf(MAIN_OPEN) + MAIN_OPEN.length);
const BODY_END = SRC.slice(SRC.indexOf('</main>'));
const TPL = readFileSync(path.join(ROOT, 'best-countertop-installer-prescott.html'), 'utf8');
const AUTHOR = TPL.slice(TPL.indexOf('<!-- author box -->'), TPL.indexOf('</main>'));
for (const [k, v] of Object.entries({ GTAG, BODY_TOP, BODY_END, AUTHOR })) {
  if (v.length < 200) throw new Error(`chrome slice ${k} looks wrong (${v.length} chars)`);
}

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
const AUTHOR_PERSON = {
  '@type': 'Person',
  name: 'Steve Hunt',
  jobTitle: 'Owner & Lead Designer',
  url: `${SITE}/our-team.html`,
  worksFor: { '@id': `${SITE}/#business` },
};

const ENT = { mdash: '—', ndash: '–', amp: '&', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', times: '×', nbsp: ' ', deg: '°', frac12: '½', hellip: '…', quot: '"', rarr: '→', middot: '·', bull: '•' };
const plain = (s) =>
  String(s)
    .replace(/<[^>]+>/g, '')
    .replace(/&(#?\w+);/g, (m, e) => (e[0] === '#' ? String.fromCodePoint(+e.slice(1)) : ENT[e] ?? m))
    .replace(/\s+/g, ' ')
    .trim();
const attr = (s) => plain(s).replace(/"/g, '&quot;');

const PUBLISHED = 'September 22, 2026';
const ISO = '2026-09-22';
const DISCLOSURE =
  'Disclosure: this list is published by Infinity Kitchens and Baths, and we ranked ourselves #1. Every other company is a real, independent local business we looked up in September 2026; none paid to be included, and we have no business relationship with any of them. Verify any contractor&rsquo;s license at <a href="https://roc.az.gov/" rel="nofollow noopener" target="_blank">roc.az.gov</a> before you hire.';

const PAGE_CSS = `
  .lst-disclosure{background:rgba(255,255,255,0.1);border-left:3px solid var(--gold);padding:0.6rem 0.9rem;font-size:0.84rem;line-height:1.55;color:rgba(255,255,255,0.9);max-width:760px;margin:0.9rem 0 0;border-radius:4px;}
  .lst-disclosure a{color:#fff;text-decoration:underline;}
  .lst-toc{background:#fff;border:1px solid var(--green-100);border-radius:8px;padding:1.1rem 1.4rem;margin:0 0 2.25rem;}
  .lst-toc p{margin:0 0 0.5rem;font-weight:700;font-size:0.8rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--green-700);}
  .lst-toc ol{margin:0;padding-left:1.3rem;line-height:1.9;columns:2 260px;column-gap:2rem;}
  .lst-item{border:1px solid var(--green-100);border-radius:10px;padding:1.6rem 1.7rem;margin:0 0 1.6rem;background:#fff;scroll-margin-top:calc(var(--nav-height) + 1rem);}
  .lst-item.is-client{border:2px solid var(--gold);background:#FFFDF6;}
  .lst-item h2{font-size:1.35rem;margin:0 0 0.3rem;display:flex;gap:0.6rem;align-items:baseline;flex-wrap:wrap;}
  .lst-num{display:inline-flex;align-items:center;justify-content:center;min-width:2rem;height:2rem;border-radius:50%;background:var(--green-800,#133624);color:#fff;font-size:0.95rem;flex-shrink:0;}
  .lst-best{display:inline-block;font-size:0.76rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--gold);margin:0 0 0.8rem;}
  .lst-item p{line-height:1.75;}
  .lst-facts{width:100%;border-collapse:collapse;font-size:0.9rem;margin:1rem 0 0.5rem;}
  .lst-facts th,.lst-facts td{text-align:left;padding:0.45rem 0.7rem;border-bottom:1px solid var(--green-100);vertical-align:top;}
  .lst-facts th{width:34%;color:var(--green-700);font-weight:600;background:var(--green-50,#f3f8f5);}
  .lst-pc{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-top:0.9rem;font-size:0.92rem;}
  .lst-pc h3{font-size:0.8rem;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 0.3rem;}
  .lst-pc ul{margin:0;padding-left:1.1rem;line-height:1.65;}
  .lst-site{font-size:0.9rem;margin-top:0.8rem;}
  .table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .data-table{width:100%;border-collapse:collapse;font-size:0.92rem;margin:1.5rem 0;}
  .data-table th,.data-table td{text-align:left;padding:0.65rem 0.8rem;border-bottom:1px solid var(--green-100);vertical-align:top;}
  .data-table th{background:var(--green-50,#f3f8f5);font-size:0.76rem;letter-spacing:0.07em;text-transform:uppercase;color:var(--green-700);}
`;

// ------------------------------------------------------------ validation ----
const htmlFiles = new Set(readdirSync(ROOT).filter((f) => f.endsWith('.html')));
function checkLinks(html, slugsBeingBuilt, where) {
  const bad = [];
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#|\/$)/.test(href)) continue;
    const file = href.replace(/^\//, '').split('#')[0].split('?')[0];
    if (file.startsWith('wp-content/') || file.startsWith('lp/')) continue;
    if (!htmlFiles.has(file) && !slugsBeingBuilt.has(file)) bad.push(href);
  }
  if (bad.length) throw new Error(`${where}: broken internal links: ${[...new Set(bad)].join(', ')}`);
}

// ---------------------------------------------------------------- render ----
const esc = (s) => String(s);
function renderItem(it, i, kind) {
  const client = kind === 'ranked' && i === 0;
  const id = `pick-${i + 1}`;
  const facts = it.facts?.length
    ? `<table class="lst-facts"><tbody>${it.facts.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>`
    : '';
  const pc =
    it.pros?.length || it.cons?.length
      ? `<div class="lst-pc">${it.pros?.length ? `<div><h3>Pros</h3><ul>${it.pros.map((p) => `<li>${p}</li>`).join('')}</ul></div>` : ''}${it.cons?.length ? `<div><h3>Watch-outs</h3><ul>${it.cons.map((p) => `<li>${p}</li>`).join('')}</ul></div>` : ''}</div>`
      : '';
  let site = '';
  if (it.url) {
    site = /^https?:/.test(it.url)
      ? `<p class="lst-site">Website: <a href="${it.url}" rel="nofollow noopener" target="_blank">${plain(it.url).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a></p>`
      : `<p class="lst-site"><a href="${it.url}">${it.linkText || 'See this service'} &rarr;</a></p>`;
  }
  return `<article class="lst-item${client ? ' is-client' : ''}" id="${id}">
  <h2><span class="lst-num">${i + 1}</span> ${it.name}</h2>
  <span class="lst-best">${it.bestFor}</span>
  ${it.body}
  ${facts}${pc}${site}
</article>`;
}

function build(d, slugsBeingBuilt) {
  const file = `${d.slug}.html`;
  const url = `${SITE}/${file}`;
  const where = d.slug;
  // limits
  if (plain(d.title).length > 60) throw new Error(`${where}: title ${plain(d.title).length} chars > 60`);
  if (plain(d.h1).length > 70) throw new Error(`${where}: h1 ${plain(d.h1).length} chars > 70`);
  const dl = plain(d.desc).length;
  if (dl < 110 || dl > 160) throw new Error(`${where}: description ${dl} chars (want 110-160)`);
  if (!['ranked', 'supporting'].includes(d.kind)) throw new Error(`${where}: bad kind`);
  if (!d.items?.length || d.items.length < 5) throw new Error(`${where}: needs >= 5 items`);
  if (!d.faq?.length) throw new Error(`${where}: needs faq`);
  const imgRel = d.heroImg.replace(SITE, '').replace(/^\//, '');
  if (!existsSync(path.join(ROOT, imgRel))) throw new Error(`${where}: hero image missing: ${imgRel}`);
  const heroImg = `${SITE}/${imgRel}`;
  if (d.kind === 'supporting' && d.items.some((it) => /^https?:/.test(it.url || ''))) throw new Error(`${where}: supporting list links a company`);

  const title = d.title;
  const desc = attr(d.desc);
  const toc = `<nav class="lst-toc" aria-label="The list"><p>The list</p><ol>${d.items.map((it, i) => `<li><a href="#pick-${i + 1}">${it.name}</a></li>`).join('')}</ol></nav>`;
  const faqHtml = `<h2 style="margin-top:3rem;">Frequently Asked Questions</h2>
      <div class="pillar-faq" style="margin-top:1rem;">${d.faq.map((f) => `<div class="pillar-faq-item"><p class="pillar-faq-q">${f.q}</p><p class="pillar-faq-a">${f.a}</p></div>`).join('')}</div>`;
  const related = `<h2 style="margin-top:3rem;">Related Reading</h2>
      <ul style="line-height:2;">${d.related.map((r) => `<li><a href="${r.href}">${r.title}</a></li>`).join('')}</ul>`;
  const cta = `<div style="background:var(--green-800,#0D2A1A);color:#fff;border-radius:10px;padding:2rem;text-align:center;margin-top:2.5rem;">
        <h2 style="color:#fff;margin-top:0;">${d.cta.h}</h2>
        <p style="color:rgba(255,255,255,0.85);max-width:560px;margin:0.5rem auto 1.5rem;">${d.cta.p}</p>
        <a href="contact.html" class="btn btn-gold btn-lg">Schedule Free In-Home Consult</a>
        <a href="${d.westValley ? 'tel:6028856998' : 'tel:9288001998'}" class="btn btn-outline-light btn-lg" style="margin-left:0.5rem;">Call ${d.westValley ? '(602) 885-6998' : '(928) 800-1998'}</a>
      </div>`;

  const body = `
<section class="page-hero" style="background-image:url('${heroImg}');background-size:cover;background-position:center;">
  <div style="position:absolute;inset:0;background:linear-gradient(to right,#1B4332 0%,#1B4332 42%,rgba(27,67,50,0.55) 65%,transparent 100%);"></div>
  <div class="page-hero-inner" style="position:relative;">
    <div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="blog.html">Blog</a><span>/</span><span style="color:rgba(255,255,255,0.75)">${d.crumb}</span></div>
    <span class="eyebrow">${d.eyebrow}</span>
    <h1>${d.h1}</h1>
    ${d.kind === 'ranked' ? `<p class="lst-disclosure">${DISCLOSURE}</p>` : ''}
    <p class="post-byline" style="font-size:0.9rem;color:rgba(255,255,255,0.85);margin:0.8rem 0 0.4rem;">By <a href="our-team.html" style="color:#fff;text-decoration:underline;text-underline-offset:2px;"><strong>Steve Hunt</strong></a>, Owner &amp; Lead Designer at Infinity Kitchens and Baths</p>
    <p style="color:rgba(255,255,255,0.85);margin-top:0.25rem;font-size:1rem;">Updated ${PUBLISHED} &bull; ${d.readMin} min read</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div style="max-width:860px;margin:0 auto;">
      <div style="background:#F4FAF6;border-left:4px solid #2B7A42;border-radius:8px;padding:1.25rem 1.5rem;margin:0 0 2rem;">
        <p style="margin:0;font-size:1.05rem;line-height:1.75;color:#1F2937;"><strong>Quick answer:</strong> ${d.quick}</p>
      </div>
${d.intro}
${toc}
${d.items.map((it, i) => renderItem(it, i, d.kind)).join('\n')}
${d.after || ''}
      ${faqHtml}
      ${related}
      ${cta}
    </div>
  </div>
</section>

${AUTHOR}`;

  checkLinks(body, slugsBeingBuilt, where);
  for (const f of d.faq) if (/</.test(plain(f.a)) || /</.test(plain(f.q))) throw new Error(`${where}: FAQ html did not strip`);

  const graph = [
    BUSINESS,
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog.html` },
        { '@type': 'ListItem', position: 3, name: plain(d.crumb), item: url },
      ],
    },
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: plain(d.h1),
      description: plain(d.desc),
      image: heroImg,
      datePublished: ISO,
      dateModified: ISO,
      author: AUTHOR_PERSON,
      publisher: { '@id': `${SITE}/#business` },
      mainEntityOfPage: url,
    },
    {
      '@type': 'ItemList',
      '@id': `${url}#list`,
      name: plain(d.h1),
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: d.items.length,
      itemListElement: d.items.map((it, i) => {
        const el = { '@type': 'ListItem', position: i + 1, name: plain(it.name) };
        if (d.kind === 'ranked') {
          el.url = i === 0 ? `${SITE}/` : it.url;
        } else {
          el.url = `${url}#pick-${i + 1}`;
        }
        return el;
      }),
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: d.faq.map((f) => ({
        '@type': 'Question',
        name: plain(f.q),
        acceptedAnswer: { '@type': 'Answer', text: plain(f.a) },
      })),
    },
  ];

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
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Infinity Kitchens and Baths">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${heroImg}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(title)}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${heroImg}">
  <script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)}
  </script>
  <style>${PAGE_CSS}  </style>
</head>
${BODY_TOP}
${body}
${BODY_END}`;
  // round-trip the JSON-LD we just wrote
  for (const [, j] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(j);
  const words = plain(body).split(' ').length;
  writeFileSync(path.join(ROOT, file), html);
  return { file, words, items: d.items.length, faq: d.faq.length };
}

// ------------------------------------------------------------------- run ----
const all = readdirSync(DIR).filter((f) => f.endsWith('.mjs'));
const want = process.argv.slice(2);
const pick = want.length ? all.filter((f) => want.includes(f.replace(/\.mjs$/, ''))) : all;
if (want.length && pick.length !== want.length) throw new Error(`unknown slug in: ${want.join(' ')}`);
const slugsBeingBuilt = new Set(all.map((f) => f.replace(/\.mjs$/, '.html')));
// ranked-list slugs are allowed as link targets even before their data file lands
for (const s of [
  'top-kitchen-remodelers-prescott', 'top-bathroom-remodelers-prescott', 'top-ada-bathroom-remodelers-west-valley',
  'top-aging-in-place-remodelers-sun-city', 'top-kitchen-bath-remodelers-prescott-valley', 'top-bathroom-remodelers-surprise',
  'top-kitchen-remodelers-peoria-glendale', 'top-cabinet-installers-prescott',
]) slugsBeingBuilt.add(`${s}.html`);

let failed = 0;
for (const f of pick) {
  try {
    const d = (await import(pathToFileURL(path.join(DIR, f)).href + `?t=${Date.now()}`)).default;
    if (d.slug !== f.replace(/\.mjs$/, '')) throw new Error(`${f}: slug field must match file name`);
    const r = build(d, slugsBeingBuilt);
    console.log(`built ${r.file}  ${r.words} words, ${r.items} items, ${r.faq} faq`);
  } catch (e) {
    failed++;
    console.error(`FAIL ${f}: ${e.message}`);
  }
}
if (failed) process.exit(1);
