#!/usr/bin/env node
/**
 * Adds/refreshes <lastmod> on every <url> in sitemap.xml.
 *
 * The sitemap had no lastmod at all, which throws away the one documented
 * signal Google uses to decide what to recrawl. Dates come from each file's
 * last git commit — real, verifiable, and self-correcting on every future
 * change. Never invent a date here: Google ignores lastmod on sitemaps where
 * it proves unreliable, which would cost the signal permanently.
 *
 * Idempotent — re-run after any content change. Usage: node add-sitemap-lastmod.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.infinitykitchenandbathllc.com';
const SITEMAP = path.join(ROOT, 'sitemap.xml');

/** Last commit date for a file, as YYYY-MM-DD. Null if untracked. */
function gitDate(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

/** Map a sitemap <loc> back to the file on disk. */
function localFile(loc) {
  let slug = loc.replace(SITE, '').replace(/^\//, '');
  if (slug === '' || slug === 'index.html') slug = 'index.html';
  return existsSync(path.join(ROOT, slug)) ? slug : null;
}

let xml = readFileSync(SITEMAP, 'utf8');

const cache = new Map();
let added = 0;
let updated = 0;
let skipped = [];

xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
  const loc = inner.match(/<loc>(.*?)<\/loc>/)?.[1];
  if (!loc) return block;

  const file = localFile(loc);
  if (!file) {
    skipped.push(loc);
    return block;
  }

  if (!cache.has(file)) cache.set(file, gitDate(file));
  const date = cache.get(file);
  if (!date) {
    skipped.push(loc);
    return block;
  }

  const tag = `<lastmod>${date}</lastmod>`;
  if (/<lastmod>.*?<\/lastmod>/.test(inner)) {
    const before = inner;
    const next = inner.replace(/<lastmod>.*?<\/lastmod>/, tag);
    if (next !== before) updated++;
    return `<url>${next}</url>`;
  }

  added++;
  // Sits directly after <loc>, per the sitemaps.org element order.
  return `<url>${inner.replace(/(<loc>.*?<\/loc>)/, `$1\n    ${tag}`)}</url>`;
});

writeFileSync(SITEMAP, xml);

console.log(`lastmod added to ${added} url(s), refreshed on ${updated}`);
if (skipped.length) console.log(`skipped (no local file or untracked):\n  ${skipped.join('\n  ')}`);
