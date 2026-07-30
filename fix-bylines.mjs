#!/usr/bin/env node
/**
 * Author attribution on the Article/BlogPosting pages. Idempotent.
 *
 * The Jul 29 audit's "no author bio component on blog posts" was half right.
 * 78 pages already carried a visible byline and 76 carried Person schema, so
 * the byline was never the gap. The real gaps, verified against the repo:
 *
 *   1. shower-grout-guide.html shipped an Article node with NO author, from a
 *      builder that omitted it — invalid by omission, and invisible unless you
 *      diff the Article pages against the ones carrying a Person node.
 *      (featured-in.html looked like a second case but is not an article page
 *      at all — see ownArticleNode() below for why that distinction matters.)
 *   2. The byline named Steve Hunt on 78 pages but linked to nothing. There was
 *      no path from a blog post to the page that establishes who he is, which
 *      is the part Google's quality raters actually look for.
 *   3. No author box. This adds one, built ONLY from facts already published on
 *      our-team.html — founded 2011, still oversees every project, AZ ROC
 *      #339999, Prescott resident 20+ years. Nothing invented.
 *
 * STILL OUTSTANDING and not fixable in code: there is no photograph of Steve
 * anywhere in the repo. The box is built to drop one in — add the image and the
 * .author-box picture rule, and it becomes a full bio component.
 *
 * Usage: node fix-bylines.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);

const AUTHOR = {
  '@type': 'Person',
  name: 'Steve Hunt',
  jobTitle: 'Owner & Lead Designer',
  worksFor: { '@id': 'https://www.infinitykitchenandbathllc.com/#business' },
};

const BYLINE =
  '<p class="post-byline" style="font-size:0.9rem;color:rgba(255,255,255,0.85);margin:0.4rem 0 1rem;">' +
  'By <strong>Steve Hunt</strong>, Owner &amp; Lead Designer at Infinity Kitchens and Baths</p>';

const AUTHOR_BOX = `
<!-- author box -->
<section class="section" style="padding-top:0;">
  <div class="container">
    <div class="author-box">
      <div class="author-box-body">
        <span class="eyebrow" style="font-size:0.7rem;">About the Author</span>
        <h2>Steve Hunt</h2>
        <p class="author-role">Owner &amp; Lead Designer, Infinity Kitchens and Baths &mdash; AZ ROC #339999</p>
        <p>Steve founded Infinity Kitchens and Baths in Prescott in 2011 and still personally oversees every project the company takes on. His background spans kitchen design, bathroom renovation, structural work and project management, and he has called Prescott home for more than two decades &mdash; which is why most of Infinity's work still arrives by referral.</p>
        <p class="author-links"><a href="our-team.html">Meet the team</a> <span>&middot;</span> <a href="licensing-insurance.html">Licensing &amp; insurance</a> <span>&middot;</span> <a href="contact.html">Book a free in-home consult</a></p>
      </div>
    </div>
  </div>
</section>`;

function pageFiles() {
  const files = readdirSync(ROOT)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(ROOT, f));
  for (const d of readdirSync(path.join(ROOT, 'lp'), { withFileTypes: true })) {
    if (d.isDirectory()) files.push(path.join(ROOT, 'lp', d.name, 'index.html'));
  }
  return files;
}

/**
 * Does this page have an Article of its OWN?
 *
 * Must be decided by parsing the JSON-LD and looking only at TOP-LEVEL @graph
 * nodes. A substring test for `"@type":"Article"` is not safe here:
 * featured-in.html carries `subjectOf: [{"@type":"Article", url: <press
 * outlet>}]` — those Articles are the third-party press pieces written ABOUT
 * the company, nested inside the business node. A regex match on them made an
 * earlier version of this script insert Steve Hunt as the author of Resident
 * Magazine's article, i.e. a false authorship claim in structured data.
 */
function ownArticleNode(html) {
  const blocks = [...html.matchAll(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/g)];
  for (const b of blocks) {
    let data;
    try {
      data = JSON.parse(b[1]);
    } catch {
      continue; // unparsable block — not ours to reason about
    }
    const nodes = Array.isArray(data['@graph']) ? data['@graph'] : [data];
    for (const n of nodes) {
      const type = Array.isArray(n['@type']) ? n['@type'] : [n['@type']];
      if (type.includes('Article') || type.includes('BlogPosting')) return n;
    }
  }
  return null;
}

const isArticle = (h) => ownArticleNode(h) !== null;

const stats = { schema: 0, visible: 0, linked: 0, box: 0, skipped: [] };

for (const file of pageFiles()) {
  let html = readFileSync(file, 'utf8');
  const before = html;
  const name = path.basename(file);
  const article = ownArticleNode(html);
  if (!article) continue;

  // ── 1. author into the Article node ──────────────────────────────────────
  // Ask the parsed node, not the raw HTML: once step 3 has run, "Steve Hunt"
  // appears in the visible byline too, so a substring test would report an
  // author that the schema does not actually have.
  if (!article.author) {
    // Insert immediately before "publisher", which every Article node here has.
    const m = html.match(/("@type":\s*"(?:Article|BlogPosting)"[\s\S]{0,1200}?)("publisher":)/);
    if (m) {
      html = html.replace(m[0], `${m[1]}"author": ${JSON.stringify(AUTHOR)}, ${m[2]}`);
      stats.schema += 1;
    } else {
      stats.skipped.push([name, 'could not locate publisher key in Article node']);
    }
  }

  // ── 2. visible byline after the <h1> in the hero ──────────────────────────
  if (!html.includes('class="post-byline"')) {
    const h1 = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
    if (h1) {
      const at = h1.index + h1[0].length;
      html = html.slice(0, at) + '\n    ' + BYLINE + html.slice(at);
      stats.visible += 1;
    } else {
      stats.skipped.push([name, 'no <h1> to anchor the byline to']);
    }
  }

  // ── 3. make the byline name link to the team page ─────────────────────────
  // Guard on the anchor so this cannot double-wrap on a re-run.
  if (html.includes('class="post-byline"') && !html.includes('<a href="our-team.html"><strong>Steve Hunt</strong></a>')) {
    const plain = 'By <strong>Steve Hunt</strong>,';
    if (html.includes(plain)) {
      html = html.replace(
        plain,
        'By <a href="our-team.html" style="color:#fff;text-decoration:underline;text-underline-offset:2px;"><strong>Steve Hunt</strong></a>,'
      );
      stats.linked += 1;
    }
  }

  // ── 4. author box, immediately before the footer ──────────────────────────
  if (!html.includes('class="author-box"')) {
    const footer = html.indexOf('</main>');
    if (footer !== -1) {
      html = html.slice(0, footer) + AUTHOR_BOX + '\n' + html.slice(footer);
      stats.box += 1;
    } else {
      stats.skipped.push([name, 'no </main> to place the author box before']);
    }
  }

  if (html !== before) writeFileSync(file, html);
}

console.log(`schema author added   ${stats.schema}`);
console.log(`visible byline added  ${stats.visible}`);
console.log(`bylines linked        ${stats.linked}`);
console.log(`author boxes added    ${stats.box}`);
if (stats.skipped.length) {
  console.log('\nSKIPPED:');
  for (const [f, why] of stats.skipped) console.log(`  ${f} — ${why}`);
}
