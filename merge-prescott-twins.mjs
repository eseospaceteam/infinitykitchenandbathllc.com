#!/usr/bin/env node
// October 2026 audit: the four <service>-prescott.html city pages duplicated their
// parent service pages, which are themselves the Prescott pages (same title intent).
// Port the twin's local sections (survey/technical, permits, housing stock, sources)
// and its FAQs into the parent, then the twin is deleted and 301'd in vercel.json.
// Idempotent via the ikb:prescott-merge marker.
import fs from 'node:fs';
export const TWINS = {
  'ada-bathroom-prescott': 'ada-bathroom-remodeling',
  'aging-in-place-prescott': 'aging-in-place',
  'walk-in-showers-prescott': 'walk-in-showers',
  'tub-to-shower-prescott': 'tub-to-shower',
};
const MARK = '<!-- ikb:prescott-merge -->';
// Twin FAQs that restate a question the parent page already answers.
const SKIP_Q = new Set([
  'Does my Prescott home have to meet ADA requirements?',
  'How long does a walk-in shower installation take in Prescott?',
  'Will it make my home look institutional?',
]);
const plain = (s) => s.replace(/<[^>]+>/g, '').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&rsquo;/g, '’').replace(/&amp;/g, '&').replace(/&sect;/g, '§').replace(/\s+/g, ' ').trim();
for (const [twin, main] of Object.entries(TWINS)) {
  if (!fs.existsSync(`${twin}.html`)) { console.log('twin gone, skip', twin); continue; }
  const t = fs.readFileSync(`${twin}.html`, 'utf8');
  let h = fs.readFileSync(`${main}.html`, 'utf8');
  if (h.includes(MARK)) { console.log('already merged', main); continue; }
  const body = t.slice(t.indexOf('<main'), t.indexOf('</main>'));
  const sections = body.match(/<section\b[\s\S]*?<\/section>/g);
  const keep = sections.filter((s) => {
    const h2 = (s.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || '';
    return h2 && !/^Scheduling|Common Questions|^Talk through/.test(h2) && !s.includes('page-hero');
  });
  const selfLink = new RegExp(`<a href="/?${main}\\.html">([\\s\\S]*?)</a>`, 'g');
  const ported = keep.map((s) => s.replace(selfLink, '$1')).join('\n');
  // FAQs
  const faqs = [...body.matchAll(/<div class="pillar-faq-item"><p class="pillar-faq-q">([\s\S]*?)<\/p><p class="pillar-faq-a">([\s\S]*?)<\/p><\/div>/g)]
    .map(([, q, a]) => [q, a.replace(selfLink, '$1')]);
  const existingQs = [...h.matchAll(/<div class="pillar-faq-q">([\s\S]*?)<\/div>/g)].map((m) => plain(m[1]).toLowerCase());
  const newFaqs = faqs.filter(([q]) => !SKIP_Q.has(plain(q)) && !existingQs.includes(plain(q).toLowerCase()));
  // insert sections before the FAQ section
  const faqIdx = h.search(/<section class="section-gray[^"]*">\s*<div class="container">\s*<div[^>]*>\s*(?:<span[^>]*>[^<]*<\/span>\s*)?<h2>[^<]*FAQ<\/h2>/);
  if (faqIdx < 0) throw new Error('no FAQ section in ' + main);
  h = h.slice(0, faqIdx) + MARK + '\n' + ported + '\n' + h.slice(faqIdx);
  // visible FAQ items: append inside .pillar-faq after the last item
  const pf = h.indexOf('<div class="pillar-faq"', faqIdx);
  let depth = 0, i = pf, end = -1;
  const re = /<div\b|<\/div>/g; re.lastIndex = pf;
  for (let m; (m = re.exec(h));) { depth += m[0] === '</div>' ? -1 : 1; if (depth === 0) { end = m.index; break; } }
  const items = newFaqs.map(([q, a]) => `      <div class="pillar-faq-item fade-up">\n        <div class="pillar-faq-q">${q}</div>\n        <div class="pillar-faq-a">${a}</div>\n      </div>\n`).join('');
  h = h.slice(0, end) + items + h.slice(end);
  // JSON-LD FAQPage
  h = h.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (all, json) => {
    const d = JSON.parse(json);
    const nodes = d['@graph'] || [d];
    const fp = nodes.find((n) => n['@type'] === 'FAQPage');
    if (!fp) return all;
    for (const [q, a] of newFaqs) fp.mainEntity.push({ '@type': 'Question', name: plain(q), acceptedAnswer: { '@type': 'Answer', text: plain(a) } });
    return `<script type="application/ld+json">\n${JSON.stringify(d, null, 2)}\n</script>`;
  });
  // drop the self "Prescott" pill in the Near You strip
  h = h.replace(new RegExp(`<a href="${twin}\\.html" class="btn btn-outline-dark btn-sm">Prescott</a>`), '');
  fs.writeFileSync(`${main}.html`, h);
  console.log(main, '<-', twin, `${keep.length} sections, ${newFaqs.length}/${faqs.length} FAQs`);
}
