#!/usr/bin/env node
/**
 * Dated reviewer stamp on the 8 top Google pages (top-10 program, Nov 2026). Idempotent.
 *
 * LAST_REVIEWED below is the ONE place the review date lives. Change it and re-run:
 * the visible "Last reviewed" date and the JSON-LD lastReviewed / dateModified on the
 * WebPage node of all 8 pages follow it. Nothing else on the site reads it.
 *
 * Reviewer: Steve Hunt, owner (about.html, our-team.html). Arizona ROC record re-checked
 * 20 Nov 2026 on azroc.my.site.com: ROC 339999, Infinity Kitchens and Baths LLC (DBA IKAB),
 * B-3 General Remodeling and Repair Contractor, Active, renewed through 2028-08-31,
 * qualifying party and member Stephen Hunt.
 *
 * Three placements:
 *  - extend: the 4 guides that already show "Reviewed by Steve Hunt, Owner & Lead Designer
 *    · AZ ROC #339999" (add-reviewed-by.mjs) keep those words and gain the date.
 *  - hero:   the 3 service pages get the line in the hero, styled like the guides' line.
 *  - home:   the homepage gets the line centred under the FAQ list.
 * Every page gets a WebPage node (#webpage) with reviewedBy, lastReviewed and dateModified.
 *
 * Usage: node add-top10-review-stamp.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const LAST_REVIEWED = '2026-11-20';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.infinitykitchenandbathllc.com';
const PAGES = {
  'index.html': 'home',
  'groutless-shower-walls.html': 'extend',
  'groutless-vs-tile-shower.html': 'extend',
  'groutless-shower-systems.html': 'hero',
  'bathroom-remodel-financing.html': 'extend',
  'outdoor-kitchen.html': 'hero',
  'bathroom-vanities.html': 'hero',
  'bathroom-flooring-options.html': 'extend',
};
const STEVE_ID = `${SITE}/our-team.html#steve-hunt`;
const REVIEWER = {
  '@type': 'Person',
  '@id': STEVE_ID,
  name: 'Steve Hunt',
  jobTitle: 'Owner & Lead Designer',
  url: `${SITE}/our-team.html`,
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'license',
    name: 'AZ ROC #339999',
    identifier: '339999',
    recognizedBy: { '@type': 'Organization', name: 'Arizona Registrar of Contractors' },
  },
  worksFor: { '@id': `${SITE}/#business` },
};

const long = new Date(`${LAST_REVIEWED}T12:00:00Z`).toLocaleDateString('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
});
const dated = `Last reviewed <time datetime="${LAST_REVIEWED}">${long}</time>`;
const HERO_STYLE = 'font-size:0.9rem;color:rgba(255,255,255,0.85);margin:0.75rem 0 0;';
const heroLine = `<p class="post-reviewed top10-reviewed" style="${HERO_STYLE}">Reviewed by <a href="our-team.html" style="color:#fff;text-decoration:underline;text-underline-offset:2px;"><strong>Steve Hunt</strong></a>, Owner &middot; Arizona ROC #339999 &middot; ${dated}</p>`;
const homeLine = `<p class="post-reviewed top10-reviewed" style="margin:2rem 0 0;font-size:0.9rem;color:var(--gray-600);text-align:center;">Reviewed by <a href="our-team.html"><strong>Steve Hunt</strong></a>, Owner &middot; Arizona ROC #339999 &middot; ${dated}</p>`;

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"');

function fail(file, why) {
  throw new Error(`${file}: ${why}`);
}

function visibleLine(file, mode, h) {
  if (mode === 'extend') {
    const re = /(<p class="post-reviewed"[^>]*>Reviewed by <strong>Steve Hunt<\/strong>, Owner &amp; Lead Designer &middot; AZ ROC #339999)(?: &middot; Last reviewed <time datetime="[^"]*">[^<]*<\/time>)?<\/p>/;
    if (!re.test(h)) fail(file, 'existing reviewed line not found');
    return h.replace(re, (_, head) => `${head} &middot; ${dated}</p>`);
  }
  const existing = /<p class="post-reviewed top10-reviewed"[^>]*>[\s\S]*?<\/p>/;
  if (existing.test(h)) return h.replace(existing, mode === 'hero' ? heroLine : homeLine);
  if (mode === 'hero') {
    const h1 = h.indexOf('<h1');
    const cta = '<div style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:2rem;">';
    const at = h.indexOf(cta, h1);
    if (h1 < 0 || at < 0) fail(file, 'hero CTA row not found');
    const lineStart = h.lastIndexOf('\n', at) + 1;
    const indent = h.slice(lineStart, at);
    return h.slice(0, lineStart) + indent + heroLine + '\n' + h.slice(lineStart);
  }
  // home: inside the FAQ column, after the last question
  const faq = h.indexOf('<h2>Frequently Asked Questions</h2>');
  const close = '\n    </div>\n  </div>\n</section>';
  const at = h.indexOf(close, faq);
  if (faq < 0 || at < 0) fail(file, 'FAQ section end not found');
  return h.slice(0, at) + '\n        ' + homeLine + h.slice(at);
}

function webPageNode(file, mode, h) {
  const url = file === 'index.html' ? `${SITE}/` : `${SITE}/${file}`;
  const base = file === 'index.html' ? `${SITE}/` : url;
  const title = decode((h.match(/<title>([^<]*)<\/title>/) || fail(file, 'no <title>'))[1]);
  const node = {
    '@type': 'WebPage',
    '@id': `${base}#webpage`,
    url,
    name: title,
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': `${SITE}/#business` },
  };
  if (h.includes(`"@id": "${base}#breadcrumb"`)) node.breadcrumb = { '@id': `${base}#breadcrumb` };
  for (const frag of ['#article', '#service']) {
    if (h.includes(`"@id": "${url}${frag}"`)) node.mainEntity = { '@id': `${url}${frag}` };
  }
  node.author = { '@id': mode === 'extend' ? STEVE_ID : `${SITE}/#business` };
  node.dateModified = LAST_REVIEWED;
  node.reviewedBy = REVIEWER;
  node.lastReviewed = LAST_REVIEWED; // keep last: the idempotency regex below relies on it
  return JSON.stringify(node, null, 2).split('\n').map((l) => '    ' + l).join('\n');
}

function schema(file, mode, h) {
  h = h.replace(/    \{\n      "@type": "WebPage",\n      "@id": "[^"]*#webpage",[\s\S]*?\n      "lastReviewed": "[^"]*"\n    \},\n/, '');
  const anchor = '    {\n      "@type": "BreadcrumbList",';
  if (h.split(anchor).length !== 2) fail(file, 'BreadcrumbList anchor not found exactly once');
  return h.replace(anchor, () => `${webPageNode(file, mode, h)},\n${anchor}`);
}

let changed = 0;
for (const [file, mode] of Object.entries(PAGES)) {
  const p = path.join(ROOT, file);
  const before = readFileSync(p, 'utf8');
  let h = visibleLine(file, mode, before);
  h = schema(file, mode, h);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
  if (h !== before) { writeFileSync(p, h); changed++; }
}
console.log(`top-10 review stamp (${LAST_REVIEWED}): ${changed} of ${Object.keys(PAGES).length} pages changed`);
