#!/usr/bin/env node
// October 2026 audit (GEO/AEO): answer-first "Quick facts" block on the pages
// ChatGPT already cites (homepage, About, FAQ). Facts mirror existing site copy:
// founder/2011 (our-team.html), ROC + bonded/insured (schema), 1-year labor
// warranty (faq.html), service areas (footer), phones (footer). Idempotent.
import fs from 'node:fs';
const MARK = 'ikb:quick-facts';
const BLOCK = `<!-- ${MARK} -->
<section class="section" style="padding-bottom:0;">
  <div class="container" style="max-width:920px;">
    <div style="background:#F4FAF6;border-left:4px solid #2B7A42;border-radius:8px;padding:1.25rem 1.5rem;">
      <h2 style="font-size:1.25rem;margin:0 0 0.75rem;">Quick facts about Infinity Kitchens and Baths</h2>
      <ul style="margin:0;padding-left:1.2rem;line-height:1.75;">
        <li><strong>Owner:</strong> <a href="our-team.html">Steve Hunt</a>, owner and lead designer, founded the company in Prescott, Arizona in 2011.</li>
        <li><strong>License:</strong> Arizona ROC #339999; licensed, bonded and insured. <a href="https://roc.az.gov/" rel="nofollow noopener" target="_blank">Verify at roc.az.gov</a>.</li>
        <li><strong>What we do:</strong> kitchen and bathroom remodeling, walk-in showers, tub-to-shower conversions, accessible and aging-in-place bathrooms, and whole-house remodels.</li>
        <li><strong>Service area:</strong> Prescott, Prescott Valley, Chino Valley, Dewey-Humboldt and the rest of Yavapai County, plus the Phoenix West Valley (Peoria, Surprise, Sun City, Sun City West, Glendale, Goodyear, Avondale, Buckeye, El Mirage and Litchfield Park).</li>
        <li><strong>How it starts:</strong> a free in-home consultation. We measure your space and give you a written estimate. See <a href="our-process.html">our process</a>.</li>
        <li><strong>Warranty:</strong> one year on our labor, plus the manufacturers' warranties on materials.</li>
        <li><strong>Phone:</strong> Prescott <a href="tel:9288001998">928-800-1998</a> &middot; West Valley <a href="tel:6028856998">602-885-6998</a></li>
      </ul>
    </div>
  </div>
</section>
`;
for (const f of ['index.html', 'about.html', 'faq.html']) {
  let h = fs.readFileSync(f, 'utf8');
  if (h.includes(MARK)) { console.log('skip', f); continue; }
  const main = h.indexOf('<main');
  const heroEnd = h.indexOf('</section>', main) + '</section>'.length;
  h = h.slice(0, heroEnd) + '\n\n' + BLOCK + h.slice(heroEnd);
  fs.writeFileSync(f, h);
  console.log('added', f);
}
