#!/usr/bin/env node
/**
 * "Reviewed by" line and reviewedBy schema on the Article pages. Idempotent.
 *
 * Steve Hunt is the owner on about.html and our-team.html. AZ ROC record, checked
 * 3 Nov 2026: ROC 339999, Infinity Kitchens and Baths LLC, DBA IKAB, B-3 General
 * Remodeling and Repair Contractor, Active, member and qualifying party Stephen
 * Hunt. The account team confirmed all client content is reviewed and approved.
 *
 * Skips featured-in.html (a press page, its Article nodes are other outlets' stories)
 * and any page that ranks companies. Re-run after a builder regenerates an article.
 *
 * Usage: node add-reviewed-by.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SKIP = new Set(['featured-in.html']);
const BYLINE = /<p([^>]*)>(\s*By <a href="our-team\.html"[\s\S]*?<\/p>)/;
const ARTICLE_AUTHOR = /("@type":\s*"(?:Article|BlogPosting)"[\s\S]*?\n(\s*)"author":\s*\{[\s\S]*?\n\2\},?)/;
const REVIEWER = {
  '@type': 'Person',
  '@id': 'https://www.infinitykitchenandbathllc.com/our-team.html#steve-hunt',
  name: 'Steve Hunt',
  jobTitle: 'Owner & Lead Designer',
  url: 'https://www.infinitykitchenandbathllc.com/our-team.html',
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'license',
    name: 'AZ ROC #339999',
    identifier: '339999',
    recognizedBy: { '@type': 'Organization', name: 'Arizona Registrar of Contractors' },
  },
  worksFor: { '@id': 'https://www.infinitykitchenandbathllc.com/#business' },
};

let changed = 0;
const skipped = [];
for (const f of readdirSync(ROOT).filter((n) => n.endsWith('.html') && !SKIP.has(n))) {
  const file = path.join(ROOT, f);
  let h = readFileSync(file, 'utf8');
  const isArticle = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .some((m) => /"@type"\s*:\s*"(Article|BlogPosting)"/.test(m[1]));
  if (!isArticle || h.includes('post-reviewed')) continue;

  const line = h.match(BYLINE);
  const schema = h.match(ARTICLE_AUTHOR);
  if (!line || !schema) { skipped.push(f); continue; }

  // Same inline style as the byline above it, so it reads on either hero background.
  const style = line[1].match(/style="([^"]*)"/)?.[1] ?? '';
  const after = line[0] + `\n<p class="post-reviewed" style="${style}">Reviewed by <strong>Steve Hunt</strong>, Owner &amp; Lead Designer &middot; AZ ROC #339999</p>`;
  h = h.replace(line[0], () => after);

  const indent = schema[2];
  const hadComma = schema[1].endsWith(',');
  const reviewed = JSON.stringify(REVIEWER, null, 2).split('\n').map((l, i) => (i ? indent + l : l)).join('\n');
  h = h.replace(schema[1], () => `${schema[1].replace(/,$/, '')},\n${indent}"reviewedBy": ${reviewed}${hadComma ? ',' : ''}`);

  writeFileSync(file, h);
  changed++;
}
console.log(`stamped ${changed} pages; skipped: ${skipped.join(', ') || 'none'}`);
