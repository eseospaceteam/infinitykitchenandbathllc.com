#!/usr/bin/env node
// The two regional hubs need to know about each other, and locations.html
// needs in-content inbound links rather than footer-only reachability —
// the exact defect the audit flagged on five other pages.
import { readFileSync, writeFileSync } from 'node:fs';

const DRY = process.argv.includes('--dry');

const EDITS = [
  {
    file: 'west-valley.html',
    guard: 'yavapai-county-remodeling.html',
    // Extend the existing "Also Serving Prescott & Yavapai County" paragraph.
    find: /(<h2[^>]*>Also Serving Prescott &amp; Yavapai County<\/h2>)/,
    insert: `\n<p>The full regional page is here: <a href="yavapai-county-remodeling.html">Prescott &amp; Yavapai County remodeling</a> — every town we cover up there, grouped by the Quad Cities, the Verde Valley and the unincorporated county. Or see <a href="locations.html">every area we serve</a> across both regions.</p>`,
  },
  {
    file: 'prescott-remodeling.html',
    guard: 'yavapai-county-remodeling.html">',
    find: /(<h1[^>]*>[\s\S]*?<\/h1>)/,
    insert: `\n<p style="color:rgba(255,255,255,0.9);margin-top:0.75rem;font-size:0.95rem;">Prescott is one of <a href="yavapai-county-remodeling.html" style="color:#fff;text-decoration:underline;">14 towns we cover across Yavapai County</a>.</p>`,
  },
  {
    file: 'index.html',
    guard: 'locations.html',
    find: /(<h2[^>]*>[^<]*(?:Serv|Area)[^<]*<\/h2>)/,
    insert: `\n<p>We work in two regions: <a href="yavapai-county-remodeling.html">Prescott and Yavapai County</a>, and <a href="west-valley.html">the West Valley</a> of the Phoenix metro. <a href="locations.html">See every area we serve</a>.</p>`,
  },
];

let n = 0;
for (const e of EDITS) {
  let html = readFileSync(e.file, 'utf8');
  const main = html.match(/<main[\s\S]*?<\/main>/);
  if (!main) { console.warn(`  ! no <main>: ${e.file}`); continue; }
  if (main[0].includes(e.guard)) { console.log(`  = already linked: ${e.file}`); continue; }
  if (!e.find.test(main[0])) { console.warn(`  ! anchor not found: ${e.file}`); continue; }
  const updated = main[0].replace(e.find, `$1${e.insert}`);
  html = html.replace(main[0], updated);
  if (!DRY) writeFileSync(e.file, html);
  console.log(`  + ${e.file}`);
  n++;
}
console.log(`${DRY ? '(dry) ' : ''}${n} pages updated`);
