#!/usr/bin/env node
/**
 * Wires the listicles (listicles/*.mjs) into the site so none is orphaned. Idempotent.
 *
 *   1. sitemap.xml  — one <url> per listicle (lastmod: run add-sitemap-lastmod.mjs after commit)
 *   2. blog.html    — one card per listicle, inserted at the top of the grid
 *   3. guides.html  — a "Best-of lists" section (ranked + ideas grids)
 *   4. contextual   — an <li> in the "Related Reading" list of each page in INBOUND
 *
 * Pages without a "Related Reading" list are reported, not guessed at.
 *
 * Usage: node wire-listicles.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.infinitykitchenandbathllc.com';
const DRY = process.argv.includes('--dry');
const DIR = path.join(ROOT, 'listicles');

const data = [];
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.mjs')).sort()) {
  data.push((await import(pathToFileURL(path.join(DIR, f)).href)).default);
}
const bySlug = Object.fromEntries(data.map((d) => [d.slug, d]));
const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const label = (d) => plain(d.h1).replace(/&amp;/g, '&').replace(/&/g, '&amp;');

// target page -> listicle slugs it should link to
const INBOUND = {
  'best-kitchen-remodeler-prescott.html': ['top-kitchen-remodelers-prescott'],
  'best-bathroom-remodeler-prescott.html': ['top-bathroom-remodelers-prescott'],
  'best-cabinet-maker-prescott.html': ['top-cabinet-installers-prescott'],
  'best-remodeling-contractor-prescott-valley.html': ['top-kitchen-bath-remodelers-prescott-valley'],
  'best-ada-bathroom-remodeler-prescott.html': ['top-ada-bathroom-remodelers-west-valley'],
  'best-aging-in-place-remodeler-yavapai-county.html': ['top-aging-in-place-remodelers-sun-city', 'best-accessible-kitchen-features-for-aging-in-place'],
  'best-countertop-installer-prescott.html': ['best-kitchen-countertop-materials'],
  'best-flooring-contractor-prescott.html': ['best-kitchen-flooring-options'],
  'best-walk-in-shower-installer-prescott.html': ['best-shower-niche-and-bench-ideas'],
  'custom-countertops.html': ['best-kitchen-countertop-materials'],
  'kitchen-cabinets.html': ['top-cabinet-installers-prescott', 'best-cabinet-colors', 'best-cabinet-hardware-styles', 'best-kitchen-storage-and-pantry-ideas'],
  'kitchen-remodeling.html': ['top-kitchen-remodelers-prescott', 'best-kitchen-sink-types'],
  'bathroom-remodeling.html': ['top-bathroom-remodelers-prescott', 'best-bathroom-storage-ideas', 'best-bathroom-ventilation-and-moisture-fixes'],
  'aging-in-place.html': ['top-aging-in-place-remodelers-sun-city', 'best-grab-bars-that-dont-look-clinical'],
  'ada-bathroom-remodeling.html': ['top-ada-bathroom-remodelers-west-valley', 'best-grab-bars-that-dont-look-clinical'],
  'luxury-vinyl-flooring.html': ['best-kitchen-flooring-options'],
  'surprise-remodeling.html': ['top-bathroom-remodelers-surprise'],
  'sun-city-remodeling.html': ['top-aging-in-place-remodelers-sun-city'],
  'sun-city-west-remodeling.html': ['top-aging-in-place-remodelers-sun-city'],
  'peoria-remodeling.html': ['top-kitchen-remodelers-peoria-glendale'],
  'glendale-remodeling.html': ['top-kitchen-remodelers-peoria-glendale'],
  'prescott-valley-remodeling.html': ['top-kitchen-bath-remodelers-prescott-valley'],
  'prescott-remodeling.html': ['top-kitchen-remodelers-prescott', 'top-bathroom-remodelers-prescott', 'top-cabinet-installers-prescott'],
};

const changed = new Map();
const read = (f) => changed.get(f) ?? readFileSync(path.join(ROOT, f), 'utf8');
const put = (f, s) => changed.set(f, s);
const report = [];

// 1. sitemap
{
  let s = read('sitemap.xml');
  const add = data.filter((d) => !s.includes(`${SITE}/${d.slug}.html<`));
  if (add.length) {
    const block = add
      .map((d) => `  <url>\n    <loc>${SITE}/${d.slug}.html</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${d.kind === 'ranked' ? '0.8' : '0.7'}</priority>\n  </url>\n`)
      .join('');
    s = s.replace('</urlset>', block + '</urlset>');
    put('sitemap.xml', s);
  }
  report.push(`sitemap: +${add.length}`);
}

// 2. blog cards
{
  let s = read('blog.html');
  const cat = (d) => {
    if (d.kind === 'ranked') return /kitchen|cabinet/i.test(d.slug) ? 'kitchen planning' : 'bathroom planning';
    if (/flooring|countertop|materials|faucet/.test(d.slug)) return 'materials';
    if (/bath|shower|grab/.test(d.slug)) return 'bathroom';
    return 'kitchen';
  };
  const tag = (d) => (d.kind === 'ranked' ? 'Best Of' : 'Ideas');
  const add = data.filter((d) => !s.includes(`href="${d.slug}.html" class="blog-card-link"`));
  const cards = add
    .map((d) => {
      const img = `${SITE}/${d.heroImg.replace(SITE, '').replace(/^\//, '')}`;
      return `      <a href="${d.slug}.html" class="blog-card-link" data-category="${cat(d)}">
        <div class="blog-card">
          <div class="blog-card-img"><img src="${img}" alt="${label(d)}" loading="lazy" width="890" height="400"></div>
          <div class="blog-card-body">
            <span class="blog-tag">${tag(d)}</span>
            <p class="blog-date" style="font-size:0.78rem;color:var(--gray-400);margin:0.3rem 0 0.5rem;">September 22, 2026</p>
            <h3>${label(d)}</h3>
            <p>${plain(d.desc)}</p>
          </div>
        </div>
      </a>
`;
    })
    .join('');
  const anchor = s.indexOf('      <a href="', s.indexOf('.blog-card-link[data-hidden]'));
  if (anchor < 0) throw new Error('blog.html: grid anchor not found');
  if (add.length) put('blog.html', s.slice(0, anchor) + cards + s.slice(anchor));
  report.push(`blog cards: +${add.length}`);
}

// 3. guides hub
{
  let s = read('guides.html');
  const pill = (d) =>
    `<a href="${d.slug}.html" class="area-pill" style="display:block;padding:0.9rem 1.1rem;border:1px solid #E5E7EB;border-radius:8px;text-align:left;">${label(d)}</a>`;
  const grid = (ds) => `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:0.75rem;">${ds.map(pill).join('')}</div>`;
  const section = `<!-- listicles:start -->
<section class="section">
  <div class="container" style="max-width:900px;">
    <h2>Best-of lists</h2>
    <div class="gold-divider" style="margin:1rem 0 1.5rem;"></div>
    <p>Local contractor rankings for the areas we serve. We publish these, so we list ourselves first and say so at the top of each list; every other company on them is a real, independent local business.</p>
    ${grid(data.filter((d) => d.kind === 'ranked'))}
    <h3 style="margin-top:2rem;">Ideas and materials, ranked</h3>
    <p>Lists of options, not companies: materials, layouts and fixtures, ranked on how they hold up in Arizona homes.</p>
    ${grid(data.filter((d) => d.kind === 'supporting'))}
  </div>
</section>
<!-- listicles:end -->
`;
  const re = /<!-- listicles:start -->[\s\S]*?<!-- listicles:end -->\n/;
  if (re.test(s)) s = s.replace(re, section);
  else {
    const at = s.indexOf('<section class="section" style="background:#F9FAFB;">\n  <div class="container" style="max-width:900px;">\n    <h2>Guides that do not fit');
    if (at < 0) throw new Error('guides.html: anchor not found');
    s = s.slice(0, at) + section + '\n' + s.slice(at);
  }
  put('guides.html', s);
  report.push('guides hub: section written');
}

// 4. contextual related-reading links
for (const [file, slugs] of Object.entries(INBOUND)) {
  let s = read(file);
  const h = s.search(/<h2[^>]*>\s*(Related Reading|Helpful [^<]*Guides|Guides &amp; Resources[^<]*)\s*<\/h2>/);
  if (h < 0) { report.push(`NO Related Reading list: ${file} (wants ${slugs.join(', ')})`); continue; }
  const ulOpen = s.indexOf('<ul', h);
  const ulClose = s.indexOf('</ul>', ulOpen);
  if (ulOpen < 0 || ulClose < 0 || ulOpen - h > 900) { report.push(`Related Reading has no <ul>: ${file}`); continue; }
  const missing = slugs.filter((sl) => bySlug[sl] && !s.slice(ulOpen, ulClose).includes(`href="${sl}.html"`));
  const unbuilt = slugs.filter((sl) => !bySlug[sl]);
  if (unbuilt.length) report.push(`skip (no data file yet): ${unbuilt.join(', ')} on ${file}`);
  if (!missing.length) continue;
  const li = missing.map((sl) => `<li><a href="${sl}.html">${label(bySlug[sl])}</a></li>`).join('');
  s = s.slice(0, ulClose) + li + s.slice(ulClose);
  put(file, s);
  report.push(`${file}: +${missing.length}`);
}

for (const [f, s] of changed) if (!DRY) writeFileSync(path.join(ROOT, f), s);
console.log(report.join('\n'));
console.log(`${DRY ? '[dry] would change' : 'changed'} ${changed.size} files`);
