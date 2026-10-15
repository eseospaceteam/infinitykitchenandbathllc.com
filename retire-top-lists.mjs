#!/usr/bin/env node
// October 2026 audit: retire the 8 self-ranking "Top/Best ... Remodelers (2026)" lists.
// Zero Google impressions in two 28-day periods, and three of them named Integrated
// Kitchen & Bath, the business Google confuses with Infinity. Each page 301s (vercel.json)
// to the neutral how-to-choose guide or service page for the same intent.
// Removes: sentences in prose that point at them, <li> entries, blog cards, the
// guides.html ranked grid. Idempotent. --dry prints counts only.
import fs from 'node:fs';
const DRY = process.argv.includes('--dry');
export const TOP_REDIRECTS = {
  'top-ada-bathroom-remodelers-west-valley': 'best-ada-bathroom-remodeler-prescott',
  'top-aging-in-place-remodelers-sun-city': 'aging-in-place-sun-city',
  'top-bathroom-remodelers-prescott': 'best-bathroom-remodeler-prescott',
  'top-bathroom-remodelers-surprise': 'bathroom-remodeling-surprise',
  'top-cabinet-installers-prescott': 'best-cabinet-maker-prescott',
  'top-kitchen-bath-remodelers-prescott-valley': 'best-remodeling-contractor-prescott-valley',
  'top-kitchen-remodelers-peoria-glendale': 'kitchen-remodeling-peoria',
  'top-kitchen-remodelers-prescott': 'best-kitchen-remodeler-prescott',
};
const slugs = Object.keys(TOP_REDIRECTS).join('|');
const HREF = `href="/?(?:${slugs})\\.html"`;
const has = (s) => new RegExp(HREF).test(s);
const files = fs.readdirSync('.').filter((f) => f.endsWith('.html') && !f.startsWith('top-'));
const tally = { li: 0, card: 0, pill: 0, sentence: 0, p: 0 };
for (const f of files) {
  let h = fs.readFileSync(f, 'utf8');
  if (!has(h)) continue;
  const before = h;
  // blog cards: <a href=TOP class="blog-card-link"...> ... </a> (card contains no nested <a>)
  h = h.replace(new RegExp(`\\s*<a ${HREF} class="blog-card-link"[^>]*>[\\s\\S]*?</a>`, 'g'), () => (tally.card++, ''));
  // pills
  h = h.replace(new RegExp(`<a ${HREF} class="area-pill"[^>]*>[\\s\\S]*?</a>`, 'g'), () => (tally.pill++, ''));
  // list items
  h = h.replace(new RegExp(`\\s*<li[^>]*>\\s*<a ${HREF}[^>]*>[\\s\\S]*?</a>\\s*</li>`, 'g'), () => (tally.li++, ''));
  // sentences inside paragraphs
  h = h.replace(/<p\b[^>]*>[\s\S]*?<\/p>/g, (p) => {
    if (!has(p)) return p;
    const m = p.match(/^(<p\b[^>]*>)([\s\S]*)(<\/p>)$/);
    const parts = m[2].split(/(?<=[.!?])\s+(?=[A-Z<])/);
    const kept = parts.filter((s) => !has(s) || (tally.sentence++, false));
    if (!kept.join('').replace(/<[^>]+>/g, '').trim()) { tally.p++; return ''; }
    return m[1] + kept.join(' ') + m[3];
  });
  if (has(h)) console.log('STILL LINKED:', f, h.match(new RegExp(`.{0,120}${HREF}.{0,80}`))[0]);
  if (h !== before && !DRY) fs.writeFileSync(f, h);
}
console.log(tally);
