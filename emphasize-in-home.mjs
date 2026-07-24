#!/usr/bin/env node
/**
 * Shifts the sitewide CTA language from generic/showroom consultations to the
 * free IN-HOME consultation, which is the visit we actually want booked.
 * Idempotent — safe to re-run.
 *
 * Deliberately left alone:
 *   - "showroom-quality" / "retail showroom markup" copy — that's competitor
 *     framing, not an invitation to visit.
 *   - The footer and contact-page addresses — they're the NAP citations local
 *     SEO depends on. The heading and CTA around them change; the data doesn't.
 *
 * Usage: node emphasize-in-home.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);

// [find, replace] — plain string pairs, applied to every page.
const SITEWIDE = [
  // Nav + mobile-nav primary buttons
  ['class="btn btn-gold btn-sm">Free Consultation<', 'class="btn btn-gold btn-sm">Free In-Home Consult<'],
  ['class="btn btn-gold" style="justify-content:center;">Free Consultation<',
   'class="btn btn-gold" style="justify-content:center;">Free In-Home Consult<'],
  // Footer locations column: keep the NAP, lead with the in-home offer
  ['<h5>Showrooms</h5>',
   '<h5>Locations</h5><p style="font-size:0.78rem;line-height:1.5;margin:0 0 0.9rem;color:var(--green-400);">Free <strong>in-home</strong> consultations &mdash; we come to you, measure, and quote on the spot.</p>'],
  ['class="btn btn-gold btn-sm">Book Consultation<', 'class="btn btn-gold btn-sm">Book Free In-Home Consult<'],
  // Bottom CTA banners
  ['Schedule Free Consultation', 'Schedule Free In-Home Consult'],
  ['Request Free Consultation', 'Request Free In-Home Consult'],
  ['Get Free Consultation', 'Get Free In-Home Consult'],
  // Process-step copy
  ['We meet with you in your home or showroom', 'We meet with you in your home'],
  ['free in-home or showroom consultation', 'free in-home consultation'],
];

// Page-specific fixes.
const PER_PAGE = {
  'contact.html': [
    ['content="Visit Infinity Kitchens and Baths at our Prescott showroom',
     'content="Book a free in-home consultation with Infinity Kitchens and Baths, or visit our Prescott showroom'],
    ['<option value="in-home">In-Home Consultation</option>',
     '<option value="in-home" selected>In-Home Consultation (we come to you)</option>'],
    ['<option value="">Select preference...</option>\n                  <option value="in-home" selected>',
     '<option value="">Select preference...</option>\n                  <option value="in-home" selected>'],
  ],
  'bathroom-vanities.html': [
    ['We carry vanity samples and countertop options in-showroom. Schedule a free consultation',
     'We bring vanity samples and countertop options to your home. Schedule a free in-home consultation'],
  ],
};

function pageFiles() {
  const files = readdirSync(ROOT)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(ROOT, f));
  for (const d of readdirSync(path.join(ROOT, 'lp'), { withFileTypes: true })) {
    if (d.isDirectory()) files.push(path.join(ROOT, 'lp', d.name, 'index.html'));
  }
  return files;
}

function applyAll(html, pairs) {
  let out = html;
  let n = 0;
  for (const [find, replace] of pairs) {
    if (!out.includes(find)) continue;
    const before = out;
    out = out.split(find).join(replace);
    if (out !== before) n += before.split(find).length - 1;
  }
  return { html: out, n };
}

let touched = 0;
let edits = 0;
for (const file of pageFiles()) {
  const original = readFileSync(file, 'utf8');
  let { html, n } = applyAll(original, SITEWIDE);
  const perPage = PER_PAGE[path.basename(file)];
  if (perPage && !file.includes('/lp/')) {
    const r = applyAll(html, perPage);
    html = r.html;
    n += r.n;
  }
  if (html !== original) {
    writeFileSync(file, html);
    touched++;
    edits += n;
  }
}

console.log(`in-home emphasis: ${edits} replacement(s) across ${touched} page(s)`);
