#!/usr/bin/env node
/**
 * JSON-LD repairs from the 24 Nov 2026 schema audit. Idempotent; schema only (no visible HTML).
 *
 * 1. reviewedBy / lastReviewed are WebPage properties in schema.org, not Article ones. On every
 *    Article / BlogPosting that carries them they move to the page's WebPage node (an existing
 *    `<url>#webpage` node, else a new one), and the Article's mainEntityOfPage points at it. A
 *    WebPage that already names the reviewer (the top 10 pages) keeps its own fields. The visible
 *    "Reviewed by" line does not change. add-reviewed-by.mjs calls moveReviewToWebPage() too, so a
 *    re-run on a regenerated article stays correct.
 * 2. Guide hub pages typed ["CollectionPage", "Article"] are collections, not articles (no byline,
 *    no date): typed CollectionPage only.
 * 3. tile-flooring.html: its Service names `provider: {"@id": "#business"}` but the page had no
 *    business node. The sitewide business node (the one 111 pages carry) is added.
 * 4. remodel-cost-calculator.html: its business node had no image; it gets the logo image every
 *    other page's business node carries.
 *
 * Usage: node fix-schema-nov24.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.infinitykitchenandbathllc.com';
const BIZ_ID = `${SITE}/#business`;
const LOGO = `${SITE}/wp-content/uploads/2023/11/infinity-logo.png`;
const LD = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g;
const ARTICLE = new Set(['Article', 'BlogPosting', 'NewsArticle']);
const PAGE = new Set(['WebPage', 'CollectionPage', 'AboutPage', 'ContactPage', 'FAQPage', 'ItemPage', 'MedicalWebPage']);

const types = (n) => (n && n['@type'] ? [].concat(n['@type']) : []);
const isA = (n, set) => types(n).some((t) => set.has(t));
const nodesOf = (d) => (Array.isArray(d) ? d : d && Array.isArray(d['@graph']) ? d['@graph'] : d ? [d] : []);
const bare = (u) => String(u || '').replace(/#.*$/, '');

/** Re-serialize a block in the style it was written in (pretty 2-space or compact). */
function serialize(d, raw) {
  const lead = raw.match(/^\s*/)[0];
  const trail = raw.match(/\s*$/)[0];
  const pretty = /\n\s+"/.test(raw);
  // `</` stays escaped as `<\/`, as the pages write it, so no string can close the script early
  return lead + (pretty ? JSON.stringify(d, null, 2) : JSON.stringify(d)).replace(/<\//g, '<\\/') + trail;
}

function parseBlocks(h) {
  const out = [];
  for (const m of h.matchAll(LD)) {
    let d = null;
    try { d = JSON.parse(m[2]); } catch { /* left alone */ }
    out.push({ raw: m[2], d, changed: false });
  }
  return out;
}

function writeBlocks(h, blocks) {
  let i = -1;
  return h.replace(LD, (all, a, raw, z) => {
    i += 1;
    const b = blocks[i];
    return b && b.changed ? a + serialize(b.d, raw) + z : all;
  });
}

/** Fix 1 on one page's HTML. Returns the new HTML (unchanged if nothing to do). */
export function moveReviewToWebPage(h) {
  const blocks = parseBlocks(h);
  const canonical = h.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const all = blocks.flatMap((b) => nodesOf(b.d));
  for (const b of blocks) {
    if (!b.d) continue;
    for (const art of nodesOf(b.d)) {
      if (!isA(art, ARTICLE) || isA(art, PAGE)) continue;
      if (!('reviewedBy' in art) && !('lastReviewed' in art)) continue;
      const url = canonical || bare(typeof art.mainEntityOfPage === 'string' ? art.mainEntityOfPage : art.url);
      let page = all.find((n) => isA(n, PAGE) && !types(n).includes('FAQPage') && (bare(n['@id']) === url || n.url === url));
      if (!page) {
        page = { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: art.headline || art.name };
        if (Array.isArray(b.d['@graph'])) {
          const i = b.d['@graph'].indexOf(art);
          b.d['@graph'].splice(i + 1, 0, page);
        } else continue; // not a @graph block: none on this site, left alone
        all.push(page);
      }
      if ('reviewedBy' in art) { if (!page.reviewedBy) page.reviewedBy = art.reviewedBy; delete art.reviewedBy; }
      if ('lastReviewed' in art) { if (!page.lastReviewed) page.lastReviewed = art.lastReviewed; delete art.lastReviewed; }
      art.mainEntityOfPage = { '@id': page['@id'] || page.url };
      b.changed = true;
    }
  }
  return blocks.some((b) => b.changed) ? writeBlocks(h, blocks) : h;
}

function fixPage(file, h, bizNode) {
  h = moveReviewToWebPage(h);
  const blocks = parseBlocks(h);
  // 2. hub pages: CollectionPage only
  for (const b of blocks) {
    for (const n of nodesOf(b.d)) {
      const t = types(n);
      if (t.includes('CollectionPage') && t.includes('Article')) {
        n['@type'] = t.length === 2 ? 'CollectionPage' : t.filter((x) => x !== 'Article');
        b.changed = true;
      }
      // 4. business node without an image
      if (n['@id'] === BIZ_ID && t.includes('HomeAndConstructionBusiness') && !n.image) {
        n.image = LOGO;
        b.changed = true;
      }
    }
  }
  h = blocks.some((b) => b.changed) ? writeBlocks(h, blocks) : h;
  // 3. a page that refers to #business without carrying the node
  const nodes = parseBlocks(h).flatMap((b) => nodesOf(b.d));
  const refs = h.includes(`"@id": "${BIZ_ID}"`) || h.includes(`"@id":"${BIZ_ID}"`);
  if (refs && bizNode && !nodes.some((n) => n['@id'] === BIZ_ID && n['@type'])) {
    const first = h.indexOf('<script type="application/ld+json">');
    if (first >= 0) {
      const block = `<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': [bizNode] }, null, 2)}\n</script>\n`;
      h = h.slice(0, first) + block + h.slice(first);
    }
  }
  return h;
}

function pages() {
  const out = readdirSync(ROOT).filter((n) => n.endsWith('.html'));
  const lp = path.join(ROOT, 'lp');
  if (existsSync(lp)) for (const d of readdirSync(lp)) if (existsSync(path.join(lp, d, 'index.html'))) out.push(`lp/${d}/index.html`);
  return out;
}

/** The business node most pages carry (used for a page that lacks it). */
function sitewideBusiness(files) {
  const seen = new Map();
  for (const f of files) {
    for (const b of parseBlocks(readFileSync(path.join(ROOT, f), 'utf8'))) {
      for (const n of nodesOf(b.d)) {
        if (n['@id'] !== BIZ_ID || !n['@type']) continue;
        const k = JSON.stringify(n);
        seen.set(k, (seen.get(k) || 0) + 1);
      }
    }
  }
  const best = [...seen.entries()].sort((a, b) => b[1] - a[1])[0];
  return best ? JSON.parse(best[0]) : null;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dry = process.argv.includes('--dry');
  const files = pages();
  const biz = sitewideBusiness(files);
  let n = 0;
  for (const f of files) {
    const file = path.join(ROOT, f);
    const before = readFileSync(file, 'utf8');
    const after = fixPage(f, before, biz);
    if (after === before) continue;
    for (const m of after.matchAll(LD)) JSON.parse(m[2]); // every block must still parse
    n += 1;
    if (!dry) writeFileSync(file, after);
  }
  console.log(`${dry ? 'would change' : 'changed'} ${n} of ${files.length} pages`);
}
