#!/usr/bin/env node
/**
 * Wires prescott-remodeling-faq.html and shower-grout-guide.html into the site
 * so neither ships as an orphan: blog listing cards, contextual in-body links
 * from the pages that already own the topic, and sitemap entries.
 *
 * Idempotent. Usage: node link-new-pages.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.infinitykitchenandbathllc.com';
const read = (f) => readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, s) => writeFileSync(path.join(ROOT, f), s);

const log = [];

// ------------------------------------------------- 1. blog listing cards ----
{
  const f = 'blog.html';
  let s = read(f);
  if (s.includes('shower-grout-guide.html')) {
    log.push('blog.html: cards already present');
  } else {
    const cards = `      <a href="prescott-remodeling-faq.html" class="blog-card-link" data-category="planning">
        <div class="blog-card">
          <div class="blog-card-img"><img src="${SITE}/wp-content/uploads/2026/06/modern-white-kitchen-remodel-gold-accents.jpg" alt="Kitchen and bathroom remodeling FAQ for Prescott, AZ" loading="lazy"></div>
          <div class="blog-card-body">
            <span class="blog-tag">Planning &amp; Costs</span>
            <p class="blog-date" style="font-size:0.78rem;color:var(--gray-400);margin:0.3rem 0 0.5rem;">July 24, 2026</p>
            <h3>Kitchen &amp; Bathroom Remodeling FAQ: 34 Answers for Prescott Homeowners</h3>
            <p>Real 2026 costs, timelines, material comparisons, permits, and licensing &mdash; every question we get asked, answered in one place.</p>
          </div>
        </div>
      </a>
      <a href="shower-grout-guide.html" class="blog-card-link" data-category="bathroom">
        <div class="blog-card">
          <div class="blog-card-img"><img src="${SITE}/wp-content/uploads/2024/11/tiled-bathroom-remodeling-with-glass-shower.jpg" alt="Shower grout guide for Prescott, AZ homeowners" loading="lazy"></div>
          <div class="blog-card-body">
            <span class="blog-tag">Bathroom</span>
            <p class="blog-date" style="font-size:0.78rem;color:var(--gray-400);margin:0.3rem 0 0.5rem;">July 24, 2026</p>
            <h3>Shower Grout: How to Choose, Clean &amp; Maintain It</h3>
            <p>Epoxy, urethane, sanded or unsanded &mdash; which grout belongs in a shower, how to clean it without wrecking it, and when staining means something worse.</p>
          </div>
        </div>
      </a>
`;
    s = s.replace('<div class="grid-3" id="blogGrid">\n', `<div class="grid-3" id="blogGrid">\n${cards}`);
    write(f, s);
    log.push('blog.html: added 2 cards at top of grid');
  }
}

// ------------------------------------------- 2. contextual in-body links ----
// [file, anchor text to find, replacement that adds the link]
const CONTEXTUAL = [
  [
    'groutless-shower-systems.html',
    'shower-grout-guide.html',
    '<p style="margin-top:1.5rem;">Still weighing traditional tile? Our <a href="shower-grout-guide.html">shower grout guide</a> covers which grout survives Prescott hard water and how much upkeep it really takes.</p>',
  ],
  [
    'groutless-vs-tile-shower.html',
    'shower-grout-guide.html',
    '<p style="margin-top:1.5rem;">If you land on tile, read our <a href="shower-grout-guide.html">shower grout guide</a> next &mdash; the grout you choose decides most of the maintenance difference.</p>',
  ],
  [
    'groutless-shower-walls.html',
    'shower-grout-guide.html',
    '<p style="margin-top:1.5rem;">Comparing against a traditional grouted wall? See our <a href="shower-grout-guide.html">shower grout guide</a> for grout types, sealing, and cleaning.</p>',
  ],
  [
    'tile-shower-installation.html',
    'shower-grout-guide.html',
    '<p style="margin-top:1.5rem;">Choosing grout for your tile shower? Our <a href="shower-grout-guide.html">shower grout guide</a> breaks down epoxy vs. urethane vs. cement and what each needs from you.</p>',
  ],
  [
    'faq.html',
    'prescott-remodeling-faq.html',
    '<p style="margin-top:1.5rem;">Looking for more detail? Our <a href="prescott-remodeling-faq.html">full Prescott remodeling FAQ</a> answers 34 questions on cost, materials, timelines, permits, and licensing.</p>',
  ],
  [
    'bathroom-remodel-cost.html',
    'prescott-remodeling-faq.html',
    '<p style="margin-top:1.5rem;">More questions on budgeting a remodel? See our <a href="prescott-remodeling-faq.html">Prescott remodeling FAQ</a>.</p>',
  ],
  [
    'kitchen-remodel-cost.html',
    'prescott-remodeling-faq.html',
    '<p style="margin-top:1.5rem;">More questions on budgeting a remodel? See our <a href="prescott-remodeling-faq.html">Prescott remodeling FAQ</a>.</p>',
  ],
  [
    'bathroom-remodeling.html',
    'prescott-remodeling-faq.html',
    '<p style="margin-top:1.5rem;">Have questions before you start? Our <a href="prescott-remodeling-faq.html">Prescott remodeling FAQ</a> covers cost, timelines, permits, and materials.</p>',
  ],
  [
    'kitchen-remodeling.html',
    'prescott-remodeling-faq.html',
    '<p style="margin-top:1.5rem;">Have questions before you start? Our <a href="prescott-remodeling-faq.html">Prescott remodeling FAQ</a> covers cost, timelines, permits, and materials.</p>',
  ],
];

for (const [file, marker, block] of CONTEXTUAL) {
  let s = read(file);
  if (s.includes(marker)) {
    log.push(`${file}: link already present`);
    continue;
  }
  // Insert as its own band just above the page's closing CTA (or the footer if
  // a page has none) — the one structural landmark every template shares.
  const anchors = [
    '<!-- CTA -->',
    '<section style="background:#1B4332;',
    '<section class="cta-banner">',
    '<section class="bottom-cta">',
    '<footer>',
  ];
  const at = anchors.map((a) => s.indexOf(a)).filter((i) => i !== -1).sort((a, b) => a - b)[0];
  if (at === undefined) {
    log.push(`${file}: SKIPPED — no CTA or footer anchor found`);
    continue;
  }
  const band = `<section class="section-sm">
  <div class="container">
    <div style="max-width:860px;margin:0 auto;">
      ${block}
    </div>
  </div>
</section>

`;
  s = s.slice(0, at) + band + s.slice(at);
  write(file, s);
  log.push(`${file}: added contextual link`);
}

// -------------------------------------------------------- 3. sitemap.xml ----
{
  const f = 'sitemap.xml';
  let s = read(f);
  const entries = [
    ['prescott-remodeling-faq.html', 'monthly', '0.8'],
    ['shower-grout-guide.html', 'monthly', '0.6'],
  ].filter(([slug]) => !s.includes(slug));

  if (!entries.length) {
    log.push('sitemap.xml: entries already present');
  } else {
    const block = entries
      .map(
        ([slug, freq, pri]) => `  <url>
    <loc>${SITE}/${slug}</loc>
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>`
      )
      .join('\n\n');
    s = s.replace('</urlset>', `${block}\n\n</urlset>`);
    write(f, s);
    log.push(`sitemap.xml: added ${entries.length} url(s)`);
  }
}

console.log(log.join('\n'));
