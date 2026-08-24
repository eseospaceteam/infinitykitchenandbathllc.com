#!/usr/bin/env node
// 33 pages ended their breadcrumb with a bare category word ("Planning",
// "Design", "Bathroom") instead of the page's own name. That was tolerable
// while the trail was Home / Blog / Planning; now that the real category hub
// sits in the trail it reads as Home / Guides / Cost Guides / Planning.
// Replace the final crumb with a short label derived from the page's own H1 —
// never from its slug.
import { readFileSync, writeFileSync } from 'node:fs';

const ORIGIN = 'https://www.infinitykitchenandbathllc.com';
const DRY = process.argv.includes('--dry');

// Self-descriptive finals that are already correct; leave them alone.
const SKIP = new Set(['blog.html', 'showers.html', 'accessibility.html']);
const GENERIC = new Set(['Planning', 'Design', 'Bathroom', 'Kitchen', 'Accessibility',
  'Materials', 'Cost', 'Costs', 'Showers', 'Guides', 'Blog', 'Comparison', 'Comparisons']);

// Short crumb labels. Each was written against the page's rendered H1.
const LABEL = {
  'bathroom-lighting-ideas.html': 'Bathroom Lighting Ideas',
  'bathroom-remodel-financing.html': 'Financing Options',
  'bathroom-remodel-roi.html': 'Bathroom Remodel ROI',
  'bathroom-remodel-timeline.html': 'Bathroom Remodel Timeline',
  'bathroom-tile-ideas.html': 'Bathroom Tile Ideas',
  'best-ada-bathroom-remodeler-prescott.html': 'Choosing an ADA Remodeler',
  'best-aging-in-place-remodeler-yavapai-county.html': 'Choosing an Aging-in-Place Remodeler',
  'best-bathroom-remodeler-prescott.html': 'Choosing a Bathroom Remodeler',
  'best-cabinet-maker-prescott.html': 'Choosing a Cabinet Maker',
  'best-countertop-installer-prescott.html': 'Choosing a Countertop Installer',
  'best-flooring-contractor-prescott.html': 'Choosing a Flooring Contractor',
  'best-home-remodeling-contractor-prescott.html': 'Choosing a Home Remodeler',
  'best-kitchen-remodeler-prescott.html': 'Choosing a Kitchen Remodeler',
  'best-outdoor-kitchen-builder-prescott.html': 'Choosing an Outdoor Kitchen Builder',
  'best-remodeling-contractor-chino-valley.html': 'Choosing a Remodeler in Chino Valley',
  'best-remodeling-contractor-cottonwood.html': 'Choosing a Remodeler in Cottonwood',
  'best-remodeling-contractor-dewey-humboldt.html': 'Choosing a Remodeler in Dewey-Humboldt',
  'best-remodeling-contractor-prescott-valley.html': 'Choosing a Remodeler in Prescott Valley',
  'best-remodeling-contractor-sedona.html': 'Choosing a Remodeler in Sedona',
  'best-walk-in-shower-installer-prescott.html': 'Choosing a Walk-In Shower Installer',
  'cabinet-refacing-vs-replacing.html': 'Cabinet Refacing vs. Replacing',
  'frameless-vs-framed-shower-doors.html': 'Frameless vs. Framed Shower Doors',
  'kitchen-cabinet-cost.html': 'Kitchen Cabinet Cost',
  'kitchen-island-ideas.html': 'Kitchen Island Ideas',
  'kitchen-lighting-ideas.html': 'Kitchen Lighting Ideas',
  'kitchen-remodel-mistakes.html': 'Kitchen Remodel Mistakes',
  'master-bathroom-ideas.html': 'Master Bathroom Ideas',
  'small-bathroom-ideas.html': 'Small Bathroom Ideas',
  'steam-shower-installation.html': 'Steam Shower Installation',
  'va-bathroom-remodeling-grant.html': 'VA Bathroom Remodel Grants',
};

let n = 0;
for (const [file, label] of Object.entries(LABEL)) {
  if (SKIP.has(file)) continue;
  let html = readFileSync(file, 'utf8');
  const bc = html.match(/<div class="breadcrumb">([\s\S]*?)<\/div>/);
  if (!bc) { console.warn(`  ! no breadcrumb: ${file}`); continue; }

  const finals = [...bc[1].matchAll(/<span style="color:rgba\(255,255,255,0\.75\)">([\s\S]*?)<\/span>/g)];
  if (!finals.length) { console.warn(`  ! no final crumb: ${file}`); continue; }
  const current = finals[finals.length - 1][1].replace(/<[^>]+>/g, '').trim();
  if (!GENERIC.has(current)) { continue; } // already specific — idempotent

  const updatedBc = bc[0].replace(
    `<span style="color:rgba(255,255,255,0.75)">${finals[finals.length - 1][1]}</span>`,
    `<span style="color:rgba(255,255,255,0.75)">${label}</span>`);
  html = html.replace(bc[0], updatedBc);

  // Keep BreadcrumbList in step with the visible trail.
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (whole, body) => {
    let data;
    try { data = JSON.parse(body); } catch { return whole; }
    const nodes = data['@graph'] || (Array.isArray(data) ? data : [data]);
    let touched = false;
    for (const node of nodes) {
      if (node && node['@type'] === 'BreadcrumbList' && Array.isArray(node.itemListElement)) {
        const last = node.itemListElement[node.itemListElement.length - 1];
        if (last && last.item === `${ORIGIN}/${file}`) { last.name = label; touched = true; }
      }
    }
    return touched ? `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n  </script>` : whole;
  });

  if (!DRY) writeFileSync(file, html);
  n++;
}
console.log(`${DRY ? '(dry) ' : ''}relabelled final crumb on ${n} pages`);
