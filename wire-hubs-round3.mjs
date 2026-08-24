#!/usr/bin/env node
// Round 3 hub wiring.
//
// The site has no directory structure — every URL is a flat .html at the root —
// so internal linking carries the entire hierarchy. This script adds the two
// new hubs to that hierarchy and repairs three places where the hierarchy was
// silently flat:
//   1. 43 Yavapai County pages hung directly off Home with no regional parent
//      (their West Valley counterparts already had one).
//   2. 55 guide pages breadcrumbed Home / Blog / X, skipping the category hub
//      that lists them — which is why those 7 hubs had only 9-19 inbound links.
//   3. 6 guide pages belonged to no category hub at all.
//
// Every edit is idempotent and guarded on a stable string, not on injected
// markup that a later pass could change.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ORIGIN = 'https://www.infinitykitchenandbathllc.com';
const DRY = process.argv.includes('--dry');
const files = readdirSync('.').filter(f => f.endsWith('.html'));
const stats = {};
const bump = k => { stats[k] = (stats[k] || 0) + 1; };

/* ------------------------------------------------------------------ *
 * Maps
 * ------------------------------------------------------------------ */
const YAV_CITIES = {
  'prescott-remodeling.html': 'Prescott, AZ',
  'prescott-valley-remodeling.html': 'Prescott Valley, AZ',
  'chino-valley-remodeling.html': 'Chino Valley, AZ',
  'dewey-humboldt-remodeling.html': 'Dewey-Humboldt, AZ',
  'cottonwood-remodeling.html': 'Cottonwood, AZ',
  'sedona-remodeling.html': 'Sedona, AZ',
  'camp-verde-remodeling.html': 'Camp Verde, AZ',
  'williamson-valley-remodeling.html': 'Williamson Valley, AZ',
  'mayer-remodeling.html': 'Mayer, AZ',
  'cordes-lakes-remodeling.html': 'Cordes Lakes, AZ',
};
// Prescott neighbourhood pages already sit under prescott-remodeling.html.
const PRESCOTT_NEIGHBOURHOODS = [
  'downtown-prescott-remodeling.html',
  'south-prescott-remodeling.html',
  'prescott-lakes-remodeling.html',
  'yavapai-hills-remodeling.html',
];

const GUIDE_HUBS = {
  'cost-guides.html': 'Cost Guides',
  'kitchen-guides.html': 'Kitchen Guides',
  'bathroom-guides.html': 'Bathroom Guides',
  'shower-guides.html': 'Shower &amp; Tile Guides',
  'planning-guides.html': 'Planning Guides',
  'comparison-guides.html': 'Comparisons',
  'accessibility-guides.html': 'Accessibility Guides',
};
// Guide pages that belonged to no category. Assigned by subject, verified
// against each page's own H1 rather than its slug.
const EXTRA_MEMBERS = {
  'aging-in-place-bathroom.html': 'accessibility-guides.html',
  'aging-in-place-guide.html': 'accessibility-guides.html',
  'best-aging-in-place-remodeler-yavapai-county.html': 'accessibility-guides.html',
  'bathroom-remodel-financing.html': 'cost-guides.html',
  'tub-to-shower-conversion-cost.html': 'cost-guides.html',
  'steam-shower-installation.html': 'shower-guides.html',
};

// Derive category membership from what each hub actually lists.
const memberOf = {};
for (const hub of Object.keys(GUIDE_HUBS)) {
  const h = readFileSync(hub, 'utf8');
  const m = h.match(/All \d+ guides in this category[\s\S]{0,400}?(<div style="display:grid[\s\S]*?)<\/div>\s*<\/div>/);
  if (!m) { console.warn(`  ! could not read member list from ${hub}`); continue; }
  for (const href of m[1].matchAll(/href="([^"#:]+\.html)"/g)) memberOf[href[1]] = hub;
}
for (const [page, hub] of Object.entries(EXTRA_MEMBERS)) memberOf[page] = hub;

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
const CRUMB_SEP = '<span>/</span>';
const LAST = 'style="color:rgba(255,255,255,0.75)"';

// Insert a crumb immediately after the Home link in the visible breadcrumb.
function insertCrumbAfterHome(html, href, label) {
  const re = /(<div class="breadcrumb"><a href="\/">Home<\/a>)(<span>\/<\/span>)/;
  if (!re.test(html)) return null;
  if (html.match(/<div class="breadcrumb">[\s\S]*?<\/div>/)[0].includes(`href="${href}"`)) return html;
  return html.replace(re, `$1${CRUMB_SEP}<a href="${href}">${label}</a>$2`);
}

// Replace one crumb's href+label (used to swap Blog -> Guides).
function relabelCrumb(html, fromHref, toHref, toLabel) {
  const bc = html.match(/<div class="breadcrumb">[\s\S]*?<\/div>/);
  if (!bc) return null;
  const updated = bc[0].replace(
    new RegExp(`<a href="${fromHref.replace('.', '\\.')}">[^<]*</a>`),
    `<a href="${toHref}">${toLabel}</a>`);
  return html.replace(bc[0], updated);
}

// Rebuild the BreadcrumbList so schema matches the visible trail exactly.
function syncBreadcrumbSchema(html, file) {
  const bc = html.match(/<div class="breadcrumb">([\s\S]*?)<\/div>/);
  if (!bc) return html;
  const trail = [];
  const tokenRe = /<a href="([^"]+)">([\s\S]*?)<\/a>|<span style="color:rgba\(255,255,255,0\.75\)">([\s\S]*?)<\/span>/g;
  let m;
  while ((m = tokenRe.exec(bc[1])) !== null) {
    const label = (m[2] ?? m[3] ?? '').replace(/<[^>]+>/g, '').trim();
    if (!label) continue;
    let href = m[1];
    if (href === undefined) href = file;              // current page
    else if (href === '/') href = '';                 // home
    trail.push({ label, url: `${ORIGIN}/${href}`.replace(/\/$/, '/') });
  }
  if (trail.length < 2) return html;

  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (whole, body) => {
    let data;
    try { data = JSON.parse(body); } catch { return whole; }
    const nodes = data['@graph'] || (Array.isArray(data) ? data : [data]);
    let touched = false;
    for (const node of nodes) {
      if (node && node['@type'] === 'BreadcrumbList') {
        node.itemListElement = trail.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.label.replace(/&amp;/g, '&').replace(/&mdash;/g, '—'),
          item: t.url,
        }));
        touched = true;
      }
    }
    if (!touched) return whole;
    return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n  </script>`;
  });
}

/* ------------------------------------------------------------------ *
 * 1. Footer — surface both new hubs sitewide
 * ------------------------------------------------------------------ */
const YAV_HEADER_LI = `<li style="margin-top:0.6rem;padding-top:0.6rem;border-top:1px solid rgba(255,255,255,0.12);"><strong style="display:block;font-size:0.7rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--green-400);margin-bottom:0.15rem;"><a href="yavapai-county-remodeling.html" style="color:inherit;">Prescott &amp; Yavapai County</a></strong></li>`;
const ALL_AREAS_LI = `<li style="margin-top:0.6rem;padding-top:0.6rem;border-top:1px solid rgba(255,255,255,0.12);"><a href="locations.html"><strong>All service areas &rarr;</strong></a></li>`;

function wireFooter(html) {
  const foot = html.match(/<footer[\s\S]*?<\/footer>/);
  if (!foot) return html;
  let f = foot[0];
  const before = f;

  if (!f.includes('yavapai-county-remodeling.html')) {
    if (f.includes('<h5>Service Areas</h5>')) {
      // Yavapai list leads this column: put the region header above Prescott.
      f = f.replace('<h5>Service Areas</h5><ul>', `<h5>Service Areas</h5><ul>${YAV_HEADER_LI}`);
    } else if (f.includes('<h5>West Valley</h5>')) {
      // West Valley pages: give them a route back to the other region.
      f = f.replace(/(<h5>West Valley<\/h5>\s*<ul>[\s\S]*?)<\/ul>/,
        `$1${YAV_HEADER_LI}</ul>`);
    }
  }
  if (!f.includes('locations.html')) {
    f = f.replace(/(<h5>(?:Service Areas|West Valley)<\/h5>\s*<ul>[\s\S]*?)<\/ul>/, `$1${ALL_AREAS_LI}</ul>`);
  }
  if (f === before) return html;
  bump('footer');
  return html.replace(foot[0], f);
}

/* ------------------------------------------------------------------ *
 * Run
 * ------------------------------------------------------------------ */
for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const original = html;

  html = wireFooter(html);

  // 2. Yavapai city pages -> regional parent.
  if (YAV_CITIES[file]) {
    const out = insertCrumbAfterHome(html, 'yavapai-county-remodeling.html', 'Prescott &amp; Yavapai County');
    if (out && out !== html) { html = out; bump('yav-crumb'); }
  }
  // Prescott neighbourhoods sit one level deeper.
  if (PRESCOTT_NEIGHBOURHOODS.includes(file)) {
    const out = insertCrumbAfterHome(html, 'yavapai-county-remodeling.html', 'Prescott &amp; Yavapai County');
    if (out && out !== html) { html = out; bump('yav-crumb'); }
  }

  // 3. Guide leaves -> category hub crumb between Blog and the page.
  const hub = memberOf[file];
  if (hub && !Object.keys(GUIDE_HUBS).includes(file)) {
    const bc = html.match(/<div class="breadcrumb">[\s\S]*?<\/div>/);
    if (bc && bc[0].includes('href="blog.html"') && !bc[0].includes(`href="${hub}"`)) {
      // Blog becomes "Guides", then the category slots in beneath it.
      let out = relabelCrumb(html, 'blog.html', 'blog.html', 'Guides');
      const re = /(<div class="breadcrumb">[\s\S]*?<a href="blog\.html">Guides<\/a>)(<span>\/<\/span>)/;
      if (re.test(out)) {
        out = out.replace(re, `$1${CRUMB_SEP}<a href="${hub}">${GUIDE_HUBS[hub]}</a>$2`);
        html = out; bump('guide-crumb');
      }
    }
  }

  if (html !== original) html = syncBreadcrumbSchema(html, file);
  if (html !== original && !DRY) writeFileSync(file, html);
}

console.log(DRY ? '(dry run)' : 'wrote changes');
for (const [k, v] of Object.entries(stats)) console.log(`  ${k}: ${v}`);
