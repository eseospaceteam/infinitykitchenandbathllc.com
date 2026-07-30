#!/usr/bin/env node
/**
 * Wires the three new hub pages into the site. Idempotent — every step guards
 * on its own marker, so this is safe to re-run after any content change.
 *
 *   1. Cluster pages link UP to their hub via a callout placed directly after
 *      the hero. This is the half that makes it a pillar/cluster rather than
 *      just a new page: the hub already links down to all 46, but without the
 *      return links the hub carries no topical weight.
 *   2. Nav mega-menu gains Showers and Countertops (scoped to the nav region
 *      only, using the same boundary update-chrome.mjs uses).
 *   3. Footer Services column gains Showers + Countertops; the footer's
 *      existing "West Valley (Phoenix Metro)" subheading becomes a link to
 *      west-valley.html — a sitewide inbound link for the city hub.
 *   4. services.html gains a Showers card and a Countertops card.
 *   5. sitemap.xml gains all three (lastmod is then regenerated from git by
 *      add-sitemap-lastmod.mjs — never hand-write it).
 *
 * Usage: node wire-hubs.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);

const CITIES = ['avondale', 'buckeye', 'glendale', 'goodyear', 'peoria', 'surprise', 'sun-city', 'sun-city-west'];

const CLUSTERS = {
  'showers.html': {
    label: 'shower guide',
    callout:
      'Weighing shower types? Our <a href="showers.html">complete Prescott shower guide</a> compares walk-in, tub-to-shower, curbless and groutless side by side, with real installed costs.',
    pages: [
      'walk-in-showers', 'walk-in-shower-cost', 'walk-in-shower-vs-bathtub', 'tub-to-shower',
      'tub-to-shower-conversion-cost', 'groutless-shower-systems', 'groutless-shower-walls',
      'groutless-vs-tile-shower', 'tile-shower-installation', 'tile-shower-ideas',
      'curbless-zero-entry-showers', 'steam-shower-installation', 'frameless-vs-framed-shower-doors',
      'shower-grout-guide', 'best-walk-in-shower-installer-prescott',
    ],
  },
  'countertops.html': {
    label: 'countertop guide',
    callout:
      'Still choosing a material? Our <a href="countertops.html">Prescott countertop guide</a> has installed costs per square foot for all six materials plus every head-to-head comparison.',
    pages: [
      'custom-countertops', 'countertop-costs', 'quartz-vs-granite', 'quartzite-vs-quartz',
      'granite-vs-marble', 'butcher-block-vs-quartz', 'best-countertop-installer-prescott',
    ],
  },
  'west-valley.html': {
    label: 'West Valley hub',
    callout:
      'We serve eight West Valley cities &mdash; see every service and city on our <a href="west-valley.html">West Valley remodeling hub</a>, or call <a href="tel:6028856998">602-885-6998</a>.',
    pages: [
      ...CITIES.map((c) => `${c}-remodeling`),
      ...CITIES.map((c) => `kitchen-remodeling-${c}`),
      ...CITIES.map((c) => `bathroom-remodeling-${c}`),
    ],
  },
};

const stats = { callouts: 0, skipped: [], nav: 0, footerSvc: 0, footerWV: 0 };

// ── 1. cluster → hub callouts ──────────────────────────────────────────────
for (const [hub, cfg] of Object.entries(CLUSTERS)) {
  for (const slug of cfg.pages) {
    const file = path.join(ROOT, `${slug}.html`);
    let html = readFileSync(file, 'utf8');
    if (html.includes('class="hub-uplink"')) continue;

    const heroStart = html.indexOf('<section class="page-hero');
    if (heroStart === -1) {
      stats.skipped.push([slug, 'no page-hero']);
      continue;
    }
    const heroEnd = html.indexOf('</section>', heroStart);
    if (heroEnd === -1) {
      stats.skipped.push([slug, 'unterminated hero']);
      continue;
    }
    const at = heroEnd + '</section>'.length;

    const block = `

<!-- pillar uplink -->
<div class="hub-uplink"><div class="container"><p>${cfg.callout}</p></div></div>`;
    html = html.slice(0, at) + block + html.slice(at);
    writeFileSync(file, html);
    stats.callouts += 1;
  }
}

// ── shared chrome edits over every page ────────────────────────────────────
function pageFiles() {
  const files = readdirSync(ROOT)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(ROOT, f));
  const lpDir = path.join(ROOT, 'lp');
  for (const slug of readdirSync(lpDir, { withFileTypes: true })) {
    if (slug.isDirectory()) files.push(path.join(lpDir, slug.name, 'index.html'));
  }
  return files;
}

/**
 * The nav region runs from <nav id="navbar"> through the end of the mobile nav
 * drawer, which closes with two </div> after .mobile-nav-cta. Scoping edits to
 * this slice keeps body-copy links to the same pages untouched.
 */
function navRegion(html) {
  const start = html.indexOf('<nav id="navbar"');
  if (start === -1) return null;
  const cta = html.indexOf('mobile-nav-cta', start);
  if (cta === -1) return null;
  const end = html.indexOf('</div>', html.indexOf('</div>', cta) + 6) + 6;
  return [start, end];
}

const THUMB = {
  showers:
    'https://www.infinitykitchenandbathllc.com/wp-content/uploads/2026/06/bathroom-remodel-marble-walk-in-shower.jpg',
  countertops:
    'https://www.infinitykitchenandbathllc.com/wp-content/uploads/2026/06/luxury-kitchen-marble-island-countertop.jpg',
};

for (const file of pageFiles()) {
  let html = readFileSync(file, 'utf8');
  const before = html;
  // /lp/ pages are served from a subdirectory and use root-absolute chrome links.
  const rootAbs = html.includes('href="/privacy-policy.html"');
  const href = (f) => (rootAbs ? `/${f}` : f);

  // ── 2. nav mega-menu ────────────────────────────────────────────────────
  const region = navRegion(html);
  if (region) {
    const [s, e] = region;
    let nav = html.slice(s, e);
    const navBefore = nav;

    // Showers hub heads the existing shower column.
    if (!nav.includes('>Shower Remodeling<')) {
      const anchor = `<a href="${href('walk-in-showers.html')}" class="mega-item">`;
      if (nav.includes(anchor)) {
        nav = nav.replace(
          anchor,
          `<a href="${href('showers.html')}" class="mega-item"><img src="${THUMB.showers}" alt="" class="mega-thumb" loading="lazy"><div class="mega-item-text"><strong>Shower Remodeling</strong><span>All shower types compared</span></div></a>\n            ${anchor}`
        );
      }
    }
    // Countertops hub heads the countertop entry.
    if (!nav.includes('>Countertops Guide<')) {
      const anchor = `<a href="${href('custom-countertops.html')}" class="mega-item">`;
      if (nav.includes(anchor)) {
        nav = nav.replace(
          anchor,
          `<a href="${href('countertops.html')}" class="mega-item"><img src="${THUMB.countertops}" alt="" class="mega-thumb" loading="lazy"><div class="mega-item-text"><strong>Countertops Guide</strong><span>Materials &amp; installed cost</span></div></a>\n            ${anchor}`
        );
      }
    }
    if (nav !== navBefore) {
      html = html.slice(0, s) + nav + html.slice(e);
      stats.nav += 1;
    }
  }

  // ── 3a. footer Services column ──────────────────────────────────────────
  // The footer is NOT uniform sitewide: the tub-to-shower entry is labelled
  // three different ways across pages, and the /lp/ pages use root-absolute
  // hrefs. Match whichever variant this page actually has.
  if (!html.includes('>Showers &amp; Tub Conversions<')) {
    const anchor = [
      `<li><a href="${href('tub-to-shower.html')}">Tub-to-Shower</a></li>`,
      `<li><a href="${href('tub-to-shower.html')}">Tub-to-Shower Conversion</a></li>`,
      `<li><a href="${href('tub-to-shower.html')}">Tub-to-Shower Conversions</a></li>`,
    ].find((a) => html.includes(a));
    if (anchor) {
      html = html.replace(
        anchor,
        `<li><a href="${href('showers.html')}">Showers &amp; Tub Conversions</a></li>${anchor}`
      );
      stats.footerSvc += 1;
    }
  }

  // ── 3b. footer link to the West Valley hub ──────────────────────────────
  // Two footer variants exist. Most pages carry a "West Valley (Phoenix
  // Metro)" subheading inside the Service Areas column; the 24 West Valley
  // pages and the 4 /lp/ pages instead have a dedicated <h5>West Valley</h5>
  // column (generated from a Maricopa-County donor). Handle both.
  // Guard on the anchor, not the filename — west-valley.html's own canonical
  // contains "west-valley.html", so a filename check would skip its footer.
  if (!html.includes('>West Valley Hub<') && !html.includes('West Valley (Phoenix Metro)</a>')) {
    const sub = 'West Valley (Phoenix Metro)</strong>';
    const col = '<h5>West Valley</h5><ul>';
    if (html.includes(sub)) {
      html = html.replace(
        sub,
        `<a href="${href('west-valley.html')}" style="color:inherit;">West Valley (Phoenix Metro)</a></strong>`
      );
      stats.footerWV += 1;
    } else if (html.includes(col)) {
      html = html.replace(
        col,
        `${col}<li><a href="${href('west-valley.html')}"><strong>West Valley Hub</strong></a></li>`
      );
      stats.footerWV += 1;
    }
  }

  if (html !== before) writeFileSync(file, html);
}

// ── 4. services.html cards ─────────────────────────────────────────────────
{
  const file = path.join(ROOT, 'services.html');
  let html = readFileSync(file, 'utf8');
  const card = (h, img, title, copy) => `<a href="${h}" class="service-card fade-up stagger-1">
        <div class="service-card-img"><img src="${img}" alt="${title}"></div>
        <div class="service-card-body"><h3>${title}</h3><p>${copy}</p><span class="service-card-link">Learn More <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/></svg></span></div></a>`;

  if (!html.includes('href="showers.html" class="service-card')) {
    const anchor = '<a href="walk-in-showers.html" class="service-card';
    const i = html.indexOf(anchor);
    if (i !== -1) {
      html =
        html.slice(0, i) +
        card(
          'showers.html',
          THUMB.showers,
          'Shower Remodeling',
          'Every shower type in one place — walk-in, tub-to-shower, curbless and groutless, with real installed costs for the Prescott market.'
        ) +
        '\n      ' +
        html.slice(i);
    }
  }
  if (!html.includes('href="countertops.html" class="service-card')) {
    const anchor = '<a href="custom-countertops.html" class="service-card';
    const i = html.indexOf(anchor);
    if (i !== -1) {
      html =
        html.slice(0, i) +
        card(
          'countertops.html',
          THUMB.countertops,
          'Countertops Guide',
          'Quartz, granite, quartzite, marble and butcher block compared — installed cost per square foot and which suits your household.'
        ) +
        '\n      ' +
        html.slice(i);
    }
  }
  writeFileSync(file, html);
}

// ── 5. sitemap ─────────────────────────────────────────────────────────────
{
  const file = path.join(ROOT, 'sitemap.xml');
  let xml = readFileSync(file, 'utf8');
  const SITE = 'https://www.infinitykitchenandbathllc.com';
  const entries = [
    ['showers.html', '0.9'],
    ['countertops.html', '0.9'],
    ['west-valley.html', '0.85'],
  ];
  let added = 0;
  for (const [f, pri] of entries) {
    if (xml.includes(`/${f}<`)) continue;
    // lastmod is a placeholder — add-sitemap-lastmod.mjs rewrites it from git.
    const block = `  <url>\n    <loc>${SITE}/${f}</loc>\n    <lastmod>2026-07-29</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${pri}</priority>\n  </url>\n`;
    xml = xml.replace('</urlset>', block + '</urlset>');
    added += 1;
  }
  writeFileSync(file, xml);
  console.log(`sitemap entries added   ${added}`);
}

console.log(`cluster uplinks added   ${stats.callouts}`);
console.log(`nav menus updated       ${stats.nav}`);
console.log(`footer Services links   ${stats.footerSvc}`);
console.log(`footer West Valley link ${stats.footerWV}`);
if (stats.skipped.length) {
  console.log('\nSKIPPED:');
  for (const [f, why] of stats.skipped) console.log(`  ${f} — ${why}`);
}
