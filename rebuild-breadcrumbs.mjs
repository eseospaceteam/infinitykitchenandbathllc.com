#!/usr/bin/env node
/**
 * Makes the visible breadcrumb and the BreadcrumbList JSON-LD agree, and adds
 * the missing Services tier.
 *
 * Why: the two were authored independently and disagreed on 130 of 170 pages —
 * 26 where the JSON-LD skipped the middle tier entirely and used the full page
 * title as crumb 2, and 104 where the tier-2 label differed. Google expects the
 * markup to describe the breadcrumb the user actually sees. On a flat .html site
 * this trail IS the site hierarchy, so it has to be right: it's what search
 * engines read instead of folder depth.
 *
 * The VISIBLE trail is the source of truth — its labels are already short and
 * curated, which is what a breadcrumb wants (the JSON-LD had been stuffing the
 * whole 60-char title in). Corrections applied on the way through:
 *
 *   1. Locations → contact.html   becomes  West Valley → west-valley.html
 *      All 8 West Valley city hubs pointed their parent crumb at the contact
 *      page. west-valley.html already exists and is the actual regional hub.
 *   2. Resources / Planning / Design / Bathroom / Accessibility (unlinked
 *      pseudo-categories) become  Blog → blog.html, a page that exists.
 *      When the category hubs from task 6 land, repoint these at them.
 *   3. Bathrooms → Bathroom Remodeling, Kitchens → Kitchen Remodeling, so the
 *      label matches the page it links to.
 *   4. Services → services.html inserted as tier 2 wherever tier 2 is a service
 *      hub, giving Home > Services > Kitchen Remodeling > Sedona. That is the
 *      4-level parity with boisebath.com, on unchanged URLs.
 *
 * The JSON-LD is then regenerated from the corrected trail with absolute URLs,
 * so the two can no longer drift.
 *
 * Idempotent. Usage: node rebuild-breadcrumbs.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DRY = process.argv.includes('--dry');
const ORIGIN = 'https://www.infinitykitchenandbathllc.com';

/** Service hubs that should sit under a Services tier. */
const SERVICE_HUBS = new Set([
  'kitchen-remodeling.html', 'bathroom-remodeling.html', 'kitchen-cabinets.html',
  'whole-house-remodeling.html', 'design-build.html', 'aging-in-place.html',
  'custom-countertops.html', 'showers.html', 'countertops.html',
  'laundry-room-remodel.html', 'outdoor-kitchen.html', 'tile-flooring.html',
]);

/** Parent-crumb corrections, keyed by the label currently rendered. */
const REMAP = {
  'Locations':     { label: 'West Valley',        href: 'west-valley.html' },
  'Resources':     { label: 'Blog',               href: 'blog.html' },
  'Planning':      { label: 'Blog',               href: 'blog.html' },
  'Design':        { label: 'Blog',               href: 'blog.html' },
  'Bathroom':      { label: 'Blog',               href: 'blog.html' },
  'Accessibility': { label: 'Blog',               href: 'blog.html' },
  'Bathrooms':     { label: 'Bathroom Remodeling', href: 'bathroom-remodeling.html' },
  'Kitchens':      { label: 'Kitchen Remodeling',  href: 'kitchen-remodeling.html' },
  'Company':       { label: 'About Us',            href: 'about.html' },
};

/** accessibility.html legitimately IS the Accessibility page — don't remap its own crumb. */
const REMAP_EXEMPT = new Set(['accessibility.html']);

const decode = (s) => s
  .replace(/&amp;/g, '&').replace(/&#x27;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&nbsp;/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const enc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const VIS_RE = /(<div class="breadcrumb"[^>]*>)([\s\S]*?)(<\/div>)/i;
const LD_RE = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function parseVisible(html) {
  const m = html.match(VIS_RE);
  if (!m) return null;
  const crumbs = [];
  const tok = /<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>|<span([^>]*)>([^<]*)<\/span>/g;
  let t;
  while ((t = tok.exec(m[2])) !== null) {
    if (t[1] !== undefined) {
      crumbs.push({ label: decode(t[2]), href: t[1], attrs: '' });
    } else {
      const label = decode(t[4]);
      if (label && label !== '/') crumbs.push({ label, href: null, attrs: t[3] || '' });
    }
  }
  return crumbs;
}

/** Apply the corrections and insert the Services tier. */
function canonicalise(file, crumbs) {
  let out = crumbs.map((c) => ({ ...c }));

  // 1-3. remap parent crumbs (never the final one, never the page's own crumb)
  out = out.map((c, i) => {
    if (i === 0 || i === out.length - 1) return c;
    if (REMAP_EXEMPT.has(file)) return c;
    const r = REMAP[c.label];
    return r && existsSync(path.join(ROOT, r.href)) ? { ...c, ...r } : c;
  });

  // An unlinked middle crumb is dead weight — link it if the remap gave it a home.
  out = out.map((c, i) => {
    if (i === 0 || i === out.length - 1 || c.href) return c;
    const r = REMAP[c.label];
    return r && existsSync(path.join(ROOT, r.href)) ? { ...c, ...r } : c;
  });

  // 4. insert the Services tier above any service hub sitting at tier 2
  if (out.length >= 2 && out[1].href && SERVICE_HUBS.has(out[1].href) && file !== 'services.html') {
    out.splice(1, 0, { label: 'Services', href: 'services.html', attrs: '' });
  }

  // Collapse any accidental repeats (e.g. Blog > Blog) and self-links mid-trail.
  out = out.filter((c, i) => i === 0 || c.label !== out[i - 1].label);

  return out;
}

function renderVisible(open, crumbs, close) {
  const parts = crumbs.map((c, i) => {
    const last = i === crumbs.length - 1;
    if (last || !c.href) {
      const attrs = c.attrs && c.attrs.trim() ? c.attrs : (last ? ' style="color:rgba(255,255,255,0.75)"' : '');
      return `<span${attrs}>${enc(c.label)}</span>`;
    }
    return `<a href="${c.href}">${enc(c.label)}</a>`;
  });
  return open + parts.join('<span>/</span>') + close;
}

function absolute(file, href) {
  if (href === '/' || href === '') return `${ORIGIN}/`;
  return `${ORIGIN}/${href.replace(/^\.?\//, '')}`;
}

const files = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let changed = 0, ldFixed = 0, tierAdded = 0, remapped = 0;
const problems = [];

for (const file of files) {
  const abs = path.join(ROOT, file);
  const html = readFileSync(abs, 'utf8');
  const vm = html.match(VIS_RE);
  if (!vm) continue;

  const before = parseVisible(html);
  if (!before || before.length < 2) continue;
  const after = canonicalise(file, before);

  if (after.length > before.length) tierAdded++;
  if (JSON.stringify(before.map((c) => [c.label, c.href])) !==
      JSON.stringify(after.map((c) => [c.label, c.href]))) remapped++;

  // final crumb always points at this page in the structured data
  const items = after.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    item: i === after.length - 1 ? absolute(file, file) : absolute(file, c.href ?? file),
  }));

  let out = html.replace(VIS_RE, (_w, o, _b, cl) => renderVisible(o, after, cl));

  // rewrite the BreadcrumbList node inside whichever ld+json block holds it
  let touchedLd = false;
  out = out.replace(LD_RE, (whole, body) => {
    let data;
    try { data = JSON.parse(body); } catch { return whole; }
    const nodes = Array.isArray(data) ? data : (data['@graph'] ?? [data]);
    let hit = false;
    for (const n of nodes) {
      if (n && n['@type'] === 'BreadcrumbList') {
        n.itemListElement = items;
        if (!n['@id']) n['@id'] = `${ORIGIN}/${file}#breadcrumb`;
        hit = true;
      }
    }
    if (!hit) return whole;
    touchedLd = true;
    const rebuilt = JSON.stringify(data);
    return whole.replace(body, rebuilt);
  });
  if (touchedLd) ldFixed++;

  // never ship a block that won't parse
  for (const m of out.matchAll(LD_RE)) {
    try { JSON.parse(m[1]); } catch (e) { problems.push(`${file}: ${e.message}`); }
  }

  if (out !== html && !problems.length) {
    if (!DRY) writeFileSync(abs, out);
    changed++;
  }
}

if (problems.length) {
  console.error('ABORTED — JSON-LD would not parse. Nothing written:');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`${DRY ? '[dry] would change' : 'changed'}: ${changed} pages`);
console.log(`  BreadcrumbList regenerated from the visible trail: ${ldFixed}`);
console.log(`  trails whose crumbs were relabelled or repointed : ${remapped}`);
console.log(`  trails that gained the Services tier             : ${tierAdded}`);
