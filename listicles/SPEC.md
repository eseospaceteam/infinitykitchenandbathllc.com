# Listicle data files — spec

One file per page: `listicles/<slug>.mjs`, `export default { ... }`. `build-listicles.mjs`
renders every file in this folder to `<slug>.html` in the repo root (chrome is lifted from
`about.html`; do not write nav/footer/head HTML here).

```js
export default {
  slug: 'best-kitchen-sink-types',          // file name without .html
  kind: 'supporting',                        // 'ranked' (client is #1) | 'supporting' (no ranking of companies)
  title: 'Best Kitchen Sink Types (2026)',   // <title>, <= 60 chars rendered, HTML entities ok (&amp;)
  desc: '...',                               // meta description, 120-155 chars
  h1: 'Best Kitchen Sink Types (2026)',       // <= 70 chars
  eyebrow: 'Kitchen Design Guide &mdash; Prescott, AZ',
  crumb: 'Best Kitchen Sink Types',           // breadcrumb label, short
  heroImg: '/wp-content/uploads/2024/11/xxx.jpg', // MUST exist in the repo (ls it); prefer one already used as a hero on the most related page
  heroAlt: '...',
  readMin: 9,
  quick: '...',          // AEO "Quick answer" — 2-4 sentences, plain claim first, html allowed (links ok)
  intro: '<p>..</p><p>..</p>',                // 1-3 paragraphs
  items: [               // the numbered list, 7-12 entries
    {
      name: 'Undermount Stainless Steel',
      bestFor: 'Best for busy family kitchens',   // short "best for" tag
      body: '<p>..</p><p>..</p>',                 // 80-200 words; html; internal links allowed
      pros: ['..', '..'], cons: ['..'],           // optional, short strings
      facts: [['Typical cost', '$..'], ['Maintenance', 'Low']], // optional label/value rows
      url: null,          // ranked lists only: company website (external) or internal page for the client
    },
  ],
  after: '<h2>..</h2><p>..</p>',  // optional extra sections after the list (comparison table, local considerations, how to choose)
  faq: [ { q: 'Plain question?', a: 'Answer html (links ok). 40-90 words.' } ],  // 4-6 entries; visible FAQ and FAQPage schema are both generated from this
  related: [ { href: 'kitchen-remodeling.html', title: 'Kitchen Remodeling in Prescott' } ], // 4-6, internal only, must exist
  cta: { h: '..', p: '..' },
};
```

## Content rules (non-negotiable)
- US spelling only (color, gray, favorite, center, fiber, meter...). No British forms.
- Business: **Infinity Kitchens and Baths** (prose). Prescott AZ, founded 2011, AZ ROC #339999 (general contractor), family-owned, bonded + insured incl. workers' comp, free in-home consultations, factory-direct material pricing, 2-year workmanship warranty (see warranties.html). Prescott line 928-800-1998; West Valley line 602-885-6998. Serves Yavapai County (Prescott, Prescott Valley, Chino Valley, Dewey-Humboldt, etc.) and 10 West Valley cities (Avondale, Buckeye, El Mirage, Glendale, Goodyear, Litchfield Park, Peoria, Surprise, Sun City, Sun City West). Avondale showroom is "coming soon" — never call it open.
- Do NOT claim credentials not on the site (no CAPS, NKBA, awards, review counts, "best-rated").
- **Backsplash rule:** the client does not quote standalone backsplash jobs (refers them to his tile installer). Backsplash may only appear as part of a kitchen remodel.
- **No invented numbers.** Any cost/timeline/percentage must be copied from the page on this site that owns that topic (grep the repo, e.g. countertop-costs.html, kitchen-cabinet-cost.html, luxury-vinyl-flooring.html, tile-flooring.html, walk-in-shower-cost.html, bathroom-remodel-cost.html, kitchen-remodel-cost.html). If the site has no figure, give no figure. Well-known public facts (ADA grab bar 250 lb load, 33–36 in. mounting height, 1.5 in. clearance) are fine; name the standard (2010 ADA Standards §609) when you cite it.
- Supporting lists rank **options/ideas**, never companies. No competitor names. Mention Infinity at most in the intro/after sections and the CTA, lightly.
- Link generously but only to pages that exist in the repo root (`ls *.html`). Link home as `/`, never `index.html`. Each supporting page must link to at least 2 relevant service pages and 1 of the ranked lists: top-kitchen-remodelers-prescott.html, top-bathroom-remodelers-prescott.html, top-ada-bathroom-remodelers-west-valley.html, top-aging-in-place-remodelers-sun-city.html, top-kitchen-bath-remodelers-prescott-valley.html, top-bathroom-remodelers-surprise.html, top-kitchen-remodelers-peoria-glendale.html, top-cabinet-installers-prescott.html (these are being built now; links to them are allowed).
- Arizona angle where honest: hard water (Prescott/West Valley), monsoon humidity swings, intense UV, dry air, 5,400 ft elevation in Prescott vs. desert heat in the West Valley, many retirees.
- Tone: practical, specific, first-person plural ("we") from a working remodeler. No filler ("In today's world"), no "delve", no emoji.
- FAQ answers must be plain enough to survive tag stripping (the schema gets the text with tags removed).
- Target total length 1,600–2,400 words per page.
- Existing overlapping pages to link to (not duplicate): kitchen-backsplash-ideas, kitchen-lighting-ideas, bathroom-flooring-options, walk-in-showers, tub-to-shower, kitchen-remodel-roi, small-kitchen-remodeling, two-tone-kitchen-cabinets, shaker-vs-flat-panel-cabinets, quartz-vs-granite, quartzite-vs-quartz, butcher-block-vs-quartz, lvp-vs-tile, porcelain-vs-ceramic-tile, aging-in-place-bathroom, accessible-remodeling, ada-bathroom-remodeling, bathroom-vanity-guide, custom-vs-rta-cabinets.

Validate with `node build-listicles.mjs <slug>` — it fails loudly on missing images, broken internal links, or length limits.
