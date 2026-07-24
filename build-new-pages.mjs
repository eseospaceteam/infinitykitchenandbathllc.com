#!/usr/bin/env node
/**
 * Builds the two genuinely-missing pages from the Jul 24 2026 content plan:
 *
 *   prescott-remodeling-faq.html  — 34-question AI-citation FAQ hub
 *   shower-grout-guide.html       — traditional grout choose/clean/maintain guide
 *
 * Chrome (GA/Ads head block, nav, footer) is lifted from about.html at build
 * time so both stay in sync with sitewide nav/footer changes.
 *
 * Every cost, timeline, and ROI figure below is copied from the page on this
 * site that already owns that topic, so the FAQ hub can never contradict the
 * page it links to. Sources are noted per answer.
 *
 * Usage: node build-new-pages.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.infinitykitchenandbathllc.com';
const LOGO = `${SITE}/wp-content/uploads/2023/11/infinity-logo.png`;
const SRC = readFileSync(path.join(ROOT, 'about.html'), 'utf8');

// ---------------------------------------------------------------- chrome ----
const gtagStart = SRC.indexOf('<!-- Google tag (gtag.js) -->');
const gtagEnd = SRC.indexOf('</script>', SRC.indexOf('</script>', gtagStart) + 9) + 9;
const GTAG = SRC.slice(gtagStart, gtagEnd);

const navStart = SRC.indexOf('<nav id="navbar"');
const navCta = SRC.indexOf('mobile-nav-cta', navStart);
const NAV = SRC.slice(navStart, SRC.indexOf('</div>', SRC.indexOf('</div>', navCta) + 6) + 6);

const FOOTER = SRC.slice(SRC.indexOf('<footer>'), SRC.indexOf('</footer>') + 9);

const BUSINESS = {
  '@type': 'HomeAndConstructionBusiness',
  '@id': `${SITE}/#business`,
  name: 'Infinity Kitchens and Baths',
  url: `${SITE}/`,
  telephone: '+1-928-800-1998',
  image: LOGO,
  logo: LOGO,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '723 N Montezuma St, Suite C',
    addressLocality: 'Prescott',
    addressRegion: 'AZ',
    postalCode: '86301',
    addressCountry: 'US',
  },
};

// Strip tags so JSON-LD answers stay plain text while the HTML keeps its links.
const plain = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;/g, '’')
    .replace(/&times;/g, '×')
    .replace(/\s+/g, ' ')
    .trim();

function page({ file, title, desc, hero, heroImg, eyebrow, h1, intro, crumb, body, jsonld, cta, related }) {
  const url = `${SITE}/${file}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  ${GTAG}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="stylesheet" href="css/styles.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#1D5535">

  <!-- SEO: canonical, Open Graph & structured data -->
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Infinity Kitchens and Baths">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${heroImg}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${heroImg}">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  <style>${PAGE_CSS}  </style>
</head>
<body>

${NAV}

<section class="page-hero" style="background-image:linear-gradient(rgba(19,54,36,0.82),rgba(19,54,36,0.88)),url('${heroImg}');background-size:cover;background-position:center;">
  <div class="page-hero-inner" style="position:relative;">
    <div class="breadcrumb"><a href="index.html">Home</a><span>/</span><a href="blog.html">Blog</a><span>/</span><span style="color:rgba(255,255,255,0.75)">${crumb}</span></div>
    <span class="eyebrow">${eyebrow}</span>
    <h1>${h1}</h1>
    <p>${intro}</p>
  </div>
</section>

${body}

<section style="background:#1B4332;padding:4rem 0;text-align:center;">
  <div class="container">
    <h2 style="color:#fff;margin-bottom:1rem;">${cta.h}</h2>
    <p style="color:rgba(255,255,255,0.78);max-width:640px;margin:0 auto 2rem;">${cta.p}</p>
    <div class="cta-actions">
      <a href="contact.html" class="btn btn-gold btn-lg">Schedule Free In-Home Consult</a>
      <a href="tel:9288001998" class="cta-phone-link">or call 928-800-1998</a>
    </div>
  </div>
</section>

<section class="section section-cream">
  <div class="container">
    <div class="section-header text-center fade-up">
      <span class="eyebrow">Keep Reading</span>
      <h2>Related Guides</h2>
      <div class="gold-divider center"></div>
    </div>
    <div class="grid-3">
${related
  .map(
    (r) => `      <a href="${r.href}" style="display:block;background:#fff;border:1px solid var(--green-100);border-radius:8px;padding:1.75rem;text-decoration:none;">
        <span class="eyebrow" style="font-size:0.7rem;">${r.kicker}</span>
        <h3 style="font-size:1.05rem;margin-top:0.4rem;color:var(--green-900);">${r.title}</h3>
      </a>`
  )
  .join('\n')}
    </div>
  </div>
</section>

${FOOTER}
<script src="js/main.js"></script>
<script src="js/cookie-consent.js"></script>
<script src="js/estimate-tab.js"></script>
</body>
</html>
`;
  writeFileSync(path.join(ROOT, file), html);
  return html.length;
}

const PAGE_CSS = `
  .qa-toc{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.75rem;margin:0 0 1rem;}
  .qa-toc a{display:block;background:#fff;border:1px solid var(--green-100);border-left:3px solid var(--gold);border-radius:6px;padding:0.9rem 1.1rem;text-decoration:none;color:var(--green-700);font-weight:600;font-size:0.92rem;}
  .qa-toc a:hover{background:var(--green-50,#f3f8f5);}
  .qa-toc span{display:block;font-size:0.75rem;font-weight:500;color:#7b8b81;margin-top:0.15rem;}
  .qa{max-width:900px;margin:0 auto;}
  .qa-item{padding:1.9rem 0;border-bottom:1px solid var(--green-100);scroll-margin-top:calc(var(--nav-height) + 1rem);}
  .qa-item:first-of-type{border-top:1px solid var(--green-100);}
  .qa-item h2{font-size:1.18rem;line-height:1.4;margin:0 0 0.85rem;}
  .qa-answer{font-weight:600;color:var(--green-800,#133624);border-left:3px solid var(--gold);padding-left:0.95rem;margin:0 0 0.9rem;line-height:1.7;}
  .qa-item p{line-height:1.75;}
  .qa-item p + p{margin-top:0.75rem;}
  .data-table{width:100%;border-collapse:collapse;font-size:0.92rem;margin:1.5rem 0;}
  .data-table th,.data-table td{text-align:left;padding:0.7rem 0.85rem;border-bottom:1px solid var(--green-100);vertical-align:top;}
  .data-table th{background:var(--green-50,#f3f8f5);font-size:0.76rem;letter-spacing:0.07em;text-transform:uppercase;color:var(--green-700);}
  .data-table tr:last-child td{border-bottom:none;}
  .table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .takeaway{background:var(--green-50,#f3f8f5);border:1px solid var(--green-100);border-left:4px solid var(--gold);border-radius:6px;padding:1.35rem 1.5rem;margin:0 0 2rem;}
  .takeaway strong{display:block;font-size:0.74rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold);margin-bottom:0.4rem;}
  .takeaway p{margin:0;line-height:1.75;font-weight:500;color:var(--green-800,#133624);}
  .cat-head{max-width:900px;margin:0 auto 1.5rem;}
  .cat-head h2{font-size:1.6rem;margin:0 0 0.35rem;}
`;

// =========================================================== FAQ HUB PAGE ===
// Answer #1 sentence is the extractable claim; everything after is support.
const FAQ = [
  {
    cat: 'Cost',
    catNote: 'The questions AI assistants get asked most — answered with real Prescott-market numbers.',
    items: [
      {
        q: 'How much does a kitchen remodel cost in Prescott, AZ?',
        a: 'A kitchen remodel in Prescott, AZ typically costs $8,000&ndash;$100,000+ depending on scope. Most of the kitchens we complete land between $30,000 and $65,000.',
        d: 'A minor refresh &mdash; new countertops, backsplash, hardware, and paint &mdash; runs $8,000&ndash;$18,000. A mid-range full remodel with new semi-custom cabinets, quartz or granite countertops, backsplash, flooring, and updated appliances is where most homeowners land. High-end kitchens with full custom cabinetry and layout changes run $55,000&ndash;$100,000+. <a href="kitchen-remodel-cost.html">See the full kitchen cost breakdown</a>.',
      },
      {
        q: 'How much does a bathroom remodel cost in Prescott, AZ?',
        a: 'A bathroom remodel in Prescott, AZ typically costs $5,000&ndash;$80,000+ depending on scope. Most bathrooms we complete fall between $18,000 and $45,000.',
        d: 'A cosmetic update &mdash; paint, fixtures, mirror, and a vanity swap &mdash; runs $5,000&ndash;$12,000. A full guest-bath remodel with a new tile shower or refreshed tub surround, vanity, toilet, and flooring typically runs $15,000&ndash;$25,000. A full master-bath renovation runs $40,000&ndash;$80,000+. <a href="bathroom-remodel-cost.html">See the full bathroom cost breakdown</a>.',
      },
      {
        q: 'What is the average cost of a tub-to-shower conversion?',
        a: 'A tub-to-shower conversion in Prescott, AZ typically costs $8,000&ndash;$22,000. Simpler conversions start around $8,000&ndash;$16,000; fully custom builds can run to $50,000.',
        d: 'That range covers demolition, waterproofing, tile or solid-surface walls, glass, and fixtures. A curbless, zero-threshold conversion adds roughly $1,500&ndash;$3,000 because the subfloor has to be restructured to slope toward a linear drain. <a href="tub-to-shower-conversion-cost.html">See the full conversion cost guide</a>.',
      },
      {
        q: 'How much does a walk-in shower cost?',
        a: 'A walk-in shower in Prescott, AZ typically costs $10,000&ndash;$35,000 installed. Most of our clients land at $18,000&ndash;$28,000 for a thorough single-shower installation.',
        d: 'Glass drives more of that number than people expect: a framed door runs $400&ndash;$900 installed, semi-frameless $900&ndash;$1,800, and frameless $1,500&ndash;$4,500+. A curbless design adds roughly $1,500&ndash;$3,000 over a standard curbed shower. <a href="walk-in-shower-cost.html">See the full walk-in shower cost guide</a>.',
      },
      {
        q: 'How much do kitchen cabinets cost?',
        a: 'Installed kitchen cabinets in the Prescott area run about $100&ndash;$280 per linear foot for stock, $150&ndash;$650 for semi-custom, and $500&ndash;$1,200+ for full custom.',
        d: 'A typical mid-size kitchen of 25&ndash;30 linear feet most often lands between $8,000 and $22,000 once installation is included. That is the range for plywood boxes, soft-close hardware, and a painted or stained finish &mdash; the specification most Prescott homeowners actually want. <a href="kitchen-cabinet-cost.html">See the full cabinet cost guide</a>.',
      },
      {
        q: 'How much do countertops cost in Prescott?',
        a: 'Countertops in Prescott, AZ typically cost $6,000&ndash;$10,000 installed for a full kitchen in quartz, granite, or quartzite.',
        d: 'Per square foot installed: granite $45&ndash;$75, quartz $55&ndash;$85, quartzite $80&ndash;$130. A typical Prescott kitchen has 40&ndash;55 square feet of countertop. Bathroom tops run $400&ndash;$1,800 depending on material and size. Expect $150&ndash;$300 for a sink cutout and $100&ndash;$200 per seam. <a href="countertop-costs.html">See the full countertop cost guide</a>.',
      },
      {
        q: 'How much does a groutless shower cost?',
        a: 'A groutless solid-surface shower installation in Prescott typically lands in the $5,000&ndash;$9,000 range for the shower enclosure itself &mdash; comparable to a mid-range tile shower.',
        d: 'The value is not the upfront price, it is the decade after: no grout lines to scrub, seal, or replace, which matters more in Prescott than most places because of hard water. <a href="groutless-shower-systems.html">See groutless shower systems</a>.',
      },
      {
        q: 'Is a kitchen remodel worth it? What is the ROI?',
        a: 'Countertop replacement returns 70&ndash;85% of its cost at resale and cabinet painting or refacing returns 60&ndash;80% &mdash; the two highest-return kitchen upgrades.',
        d: 'Cosmetic and surface-level upgrades consistently outperform full gut renovations on a percentage basis. Refacing costs 40&ndash;60% less than replacement while delivering a comparable visual upgrade. <a href="kitchen-remodel-roi.html">See the full kitchen ROI analysis</a>.',
      },
      {
        q: 'Is a bathroom remodel worth it? What is the ROI?',
        a: 'A bathroom remodel in Prescott, AZ typically recovers 60&ndash;70% of its cost at resale &mdash; one of the highest returns of any home improvement, according to the National Association of Realtors.',
        d: 'Mid-range remodels return the most. Over-customized luxury builds return a smaller percentage of a much larger number. <a href="bathroom-remodel-roi.html">See the full bathroom ROI analysis</a>.',
      },
      {
        q: 'How much do remodeling permits cost in Prescott and Yavapai County?',
        a: 'Building permits for home remodeling in Prescott and Yavapai County typically run $300&ndash;$2,500 depending on the scope and valuation of the project.',
        d: 'Permits cost so little relative to the project that price is rarely a real reason to skip one &mdash; and unpermitted work surfaces at resale, during insurance claims, and in inspections. <a href="permit-costs-yavapai-county.html">See the permit cost guide</a>.',
      },
    ],
  },
  {
    cat: 'Materials',
    catNote: 'Head-to-head comparisons, answered by the people who install both.',
    items: [
      {
        q: 'Quartz vs. granite: which is better?',
        a: 'Quartz is better for low maintenance and consistency; granite is better for heat resistance and one-of-a-kind natural pattern. Neither is universally better.',
        d: 'In the Prescott market granite runs $45&ndash;$75 per square foot installed and quartz $55&ndash;$85. Quartz never needs sealing. Granite needs sealing but takes a hot pan without damage. <a href="quartz-vs-granite.html">Read the full comparison</a>.',
      },
      {
        q: 'Ceramic vs. porcelain tile for showers: which is better?',
        a: 'Porcelain is the better choice for showers. It absorbs less than 0.5% water by weight, which makes it more durable in constantly wet areas than standard ceramic.',
        d: 'Ceramic costs less and is perfectly adequate for dry-area walls and low-traffic floors. In a shower &mdash; especially a shower floor &mdash; porcelain&rsquo;s density and lower absorption is worth the modest upcharge. <a href="porcelain-vs-ceramic-tile.html">Read the full comparison</a>.',
      },
      {
        q: 'Butcher block vs. quartz countertops: which should I choose?',
        a: 'Choose quartz if you want a surface you never have to think about; choose butcher block if you want warmth and are willing to oil it a few times a year.',
        d: 'Butcher block costs less up front but needs regular oiling, is vulnerable to standing water around sinks, and will show knife marks. Quartz is non-porous, needs no sealing, and handles a wet kitchen without complaint. <a href="butcher-block-vs-quartz.html">Read the full comparison</a>.',
      },
      {
        q: 'LVP vs. tile flooring: which is better for a bathroom?',
        a: 'Tile is the more durable and more water-tolerant bathroom floor; LVP is warmer underfoot, softer to stand on, faster to install, and costs less.',
        d: 'Quality luxury vinyl plank is fully waterproof and performs well in bathrooms. Tile still wins on lifespan and on resale perception in higher-end homes. <a href="lvp-vs-tile.html">Read the full comparison</a>.',
      },
      {
        q: 'Groutless vs. tile showers: which is better?',
        a: 'Groutless shower panels are better for low maintenance and hard water; tile is better for full design flexibility and custom detail.',
        d: 'Prescott&rsquo;s hard water is rough on cement grout &mdash; it stains, and it needs sealing. A groutless solid-surface system removes that maintenance entirely. Tile remains the choice when you want niches, benches, and a specific look. <a href="groutless-vs-tile-shower.html">Read the full comparison</a>.',
      },
      {
        q: 'Frameless vs. framed shower doors: what is the difference?',
        a: 'Frameless shower doors use thick 3/8&Prime;&ndash;1/2&Prime; tempered glass with minimal hardware for a clean, easy-to-clean look, typically $1,000&ndash;$3,000+ installed. Framed doors use thinner glass in a metal perimeter and cost less.',
        d: 'The practical difference is cleaning: framed doors have a metal channel at the bottom that traps water and soap scum. Frameless has almost nothing to trap. <a href="frameless-vs-framed-shower-doors.html">Read the full comparison</a>.',
      },
      {
        q: 'Shaker vs. flat-panel cabinets: which should I pick?',
        a: 'Shaker is the safer long-term choice &mdash; a recessed-panel door that has stayed in style for a century. Flat-panel (slab) doors read more modern and are easier to wipe down.',
        d: 'Shaker&rsquo;s recessed profile collects a little dust in the corner of the rail; slab doors have no profile at all. Both are available in every construction tier we sell. <a href="shaker-vs-flat-panel-cabinets.html">Read the full comparison</a>.',
      },
      {
        q: 'What is the best grout for a shower?',
        a: 'For shower floors and any joint that stays wet, epoxy or single-component urethane grout is the best choice because neither needs sealing and both resist staining. Standard cement grout is fine on shower walls if you seal it.',
        d: 'Joint width decides sanded vs. unsanded: use unsanded under 1/8&Prime;, sanded at 1/8&Prime; and wider. <a href="shower-grout-guide.html">Read the full shower grout guide</a>.',
      },
    ],
  },
  {
    cat: 'Process',
    catNote: 'What actually happens, and how long it takes.',
    items: [
      {
        q: 'How long does a kitchen remodel take?',
        a: 'A mid-scope kitchen remodel takes 8&ndash;14 weeks from demolition to final punch list.',
        d: 'Cabinets set the schedule, not construction. Semi-custom cabinets run 4&ndash;8 weeks from order to delivery and full custom can be 8&ndash;16 weeks. Appliances have the second-longest lead time, with some models at 6&ndash;12 weeks. <a href="kitchen-remodel-timeline.html">See the week-by-week timeline</a>.',
      },
      {
        q: 'How long does a bathroom remodel take?',
        a: 'Most bathroom remodels in Prescott, AZ take about 2&ndash;4 weeks of active construction.',
        d: 'Tile work and the waterproofing cure time underneath it drive most of that. Custom vanities and special-order glass can extend the calendar even when the crew&rsquo;s work is short. <a href="bathroom-remodel-timeline.html">See the day-by-day timeline</a>.',
      },
      {
        q: 'What is design-build remodeling?',
        a: 'Design-build means one company handles both the design and the construction under a single contract, instead of you hiring a designer and then bidding the drawings out to contractors.',
        d: 'It is a project delivery method, not a separate license category. The practical benefit is accountability: when the design and the build are the same company, nobody can blame the other one. <a href="what-is-design-build.html">Read more about design-build</a>.',
      },
      {
        q: 'Do I need a permit to remodel in Prescott?',
        a: 'Yes for most structural, electrical, and plumbing work &mdash; including moving walls, relocating plumbing, and adding circuits. Cosmetic work like paint, cabinet refacing, and countertop replacement generally does not require one.',
        d: 'We pull permits as part of the project. Permits in Prescott and Yavapai County run $300&ndash;$2,500 depending on project valuation. <a href="permit-costs-yavapai-county.html">See permit requirements and costs</a>.',
      },
      {
        q: 'What is the best time of year to remodel in Arizona?',
        a: 'There is no season you have to avoid for interior kitchen and bathroom work in Prescott &mdash; it happens comfortably year-round. The best time to start the conversation is one to three months before you want work to begin.',
        d: 'That lead time is about cabinet and material ordering, not weather. Booking early is what gets you the start date you want. <a href="best-time-to-remodel-prescott.html">Read more on timing your remodel</a>.',
      },
      {
        q: 'Cabinet refacing vs. replacing: which is better?',
        a: 'Reface when the boxes are structurally sound and you only want a new look &mdash; it runs roughly half the cost of new cabinets and takes two to four days. Replace when you need to change the layout or storage.',
        d: 'Refacing changes how your kitchen looks; replacement changes how it looks and how it works. If pull-outs, a different island, or a new appliance layout are on your list, refacing will not get you there. <a href="cabinet-refacing-vs-replacing.html">Read the full comparison</a>.',
      },
      {
        q: 'Can I stay in my home during a remodel?',
        a: 'Yes for nearly every project we do. Kitchen and bathroom remodels are contained to one area, and we set up dust protection and keep the rest of the house usable.',
        d: 'If you have only one bathroom and it is the one being remodeled, plan for a stretch without it &mdash; we will tell you exactly which days at scheduling.',
      },
      {
        q: 'How far in advance should I book a remodel?',
        a: 'Start the conversation one to three months before you want work to begin.',
        d: 'That window covers the in-home consultation, design, material selection, and cabinet lead time. Booking further out generally means more choice in your start date. <a href="contact.html">Book a free in-home consult</a>.',
      },
    ],
  },
  {
    cat: 'Local & Licensing',
    catNote: 'Who we are, where we work, and how to verify any Arizona contractor.',
    items: [
      {
        q: 'Who is the best kitchen remodeler in Prescott, AZ?',
        a: 'To pick the best kitchen remodeler in Prescott, verify an active Arizona ROC license at roc.az.gov, confirm liability insurance and workers&rsquo; compensation, and favor companies that use their own in-house crews rather than rotating subcontractors.',
        d: 'Infinity Kitchens and Baths is a family-owned, licensed kitchen remodeling contractor in Prescott (AZ ROC #339999), remodeling kitchens across the Quad Cities since 2011. <a href="best-kitchen-remodeler-prescott.html">See the full vetting checklist</a>.',
      },
      {
        q: 'Who is the best bathroom remodeler in Prescott, AZ?',
        a: 'Same test: an active AZ ROC license verified at roc.az.gov, current insurance and workers&rsquo; comp, in-house crews, and a written fixed quote before work starts.',
        d: 'Ask specifically what waterproofing system goes behind the tile. A contractor who cannot name it is a contractor to skip &mdash; failed waterproofing is a $10,000&ndash;$25,000 mistake. <a href="best-bathroom-remodeler-prescott.html">See the full vetting checklist</a>.',
      },
      {
        q: 'Is Infinity Kitchens and Baths licensed and insured?',
        a: 'Yes. We are a licensed Arizona contractor (AZ ROC #339999), bonded, and fully insured, with liability and workers&rsquo; compensation coverage on every job.',
        d: 'You can verify our license anytime through the Arizona Registrar of Contractors at roc.az.gov. Every member of our crew also passes a background check and drug testing. <a href="licensing-insurance.html">See our licensing and insurance details</a>.',
      },
      {
        q: 'What is Arizona&rsquo;s ROC license requirement for remodelers?',
        a: 'Arizona requires anyone performing contracting work over $1,000, or work that requires a building permit, to hold a license from the Arizona Registrar of Contractors (ROC).',
        d: 'A licensed contractor has met bonding and experience requirements and gives you recourse through the ROC if something goes wrong. An unlicensed one gives you none. Verify any contractor free at roc.az.gov.',
      },
      {
        q: 'What areas does Infinity Kitchens and Baths serve?',
        a: 'We serve Prescott, Prescott Valley, Chino Valley, Dewey-Humboldt, Sedona, Cottonwood, Camp Verde, Mayer, Cordes Lakes, Williamson Valley, and the greater Yavapai County area, plus the West Valley &mdash; Avondale, Buckeye, Glendale, Goodyear, Peoria, Surprise, Sun City, and Sun City West.',
        d: 'Prescott-area projects: 928-800-1998. West Valley projects: 602-885-6998. <a href="prescott-remodeling.html">See all service areas</a>.',
      },
      {
        q: 'Are there VA grants for bathroom remodeling in Arizona?',
        a: 'Yes. Several VA programs help Prescott-area veterans pay for accessible bathroom modifications. HISA (Home Improvements and Structural Alterations) is the one most commonly used for bathroom accessibility work; SAH and SHA grants fund larger adaptations.',
        d: 'These programs can cover curbless showers, grab bars, and widened doorways for service-connected disabilities. <a href="va-bathroom-remodeling-grant.html">See how the VA programs work</a>.',
      },
      {
        q: 'Do you offer free in-home consultations?',
        a: 'Yes. Every project starts with a free in-home consultation &mdash; we come to you with computer-aided design tools and material samples, measure the space, and leave you with a detailed, no-obligation quote.',
        d: 'We come to your home rather than asking you to come to us, because the measurements, the light, and the existing plumbing are all things we need to see in place. <a href="contact.html">Book your free in-home consult</a>.',
      },
      {
        q: 'What does factory-direct pricing mean?',
        a: 'We buy materials directly from manufacturers and their dealer networks rather than through a retail design showroom, which typically carries a 25&ndash;40% markup.',
        d: 'That keeps our pricing roughly 15&ndash;25% below typical retail while giving you showroom-quality cabinetry, stone, and tile. <a href="about.html">More about how we work</a>.',
      },
    ],
  },
];

const faqCount = FAQ.reduce((n, c) => n + c.items.length, 0);

const faqBody = `<section class="section">
  <div class="container">
    <div class="qa">
      <div class="takeaway">
        <strong>Short version</strong>
        <p>In Prescott, AZ a kitchen remodel typically runs $8,000&ndash;$100,000+ (most land at $30,000&ndash;$65,000) and a bathroom remodel $5,000&ndash;$80,000+ (most land at $18,000&ndash;$45,000). Kitchens take 8&ndash;14 weeks, bathrooms 2&ndash;4 weeks. Always verify an Arizona ROC license at roc.az.gov before signing anything.</p>
      </div>
      <p>Below are the ${faqCount} questions Prescott homeowners ask us most, grouped by topic. Every answer leads with the direct answer, then the detail behind it. All pricing reflects the 2026 Prescott and Yavapai County market and matches the detailed cost guides linked from each answer.</p>
      <div class="qa-toc" style="margin-top:2rem;">
${FAQ.map(
  (c) =>
    `        <a href="#${c.cat.toLowerCase().replace(/[^a-z]+/g, '-')}">${c.cat} Questions<span>${c.items.length} answers</span></a>`
).join('\n')}
      </div>
    </div>
  </div>
</section>

${FAQ.map(
  (c) => `<section class="section${c.cat === 'Materials' || c.cat === 'Local & Licensing' ? ' section-cream' : ''}" id="${c.cat
    .toLowerCase()
    .replace(/[^a-z]+/g, '-')}">
  <div class="container">
    <div class="cat-head">
      <span class="eyebrow">${c.cat}</span>
      <h2>${c.cat} Questions</h2>
      <div class="gold-divider"></div>
      <p>${c.catNote}</p>
    </div>
    <div class="qa">
${c.items
  .map(
    (i) => `      <div class="qa-item" id="q-${plain(i.q)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)}">
        <h2>${i.q}</h2>
        <p class="qa-answer">${i.a}</p>
        <p>${i.d}</p>
      </div>`
  )
  .join('\n')}
    </div>
  </div>
</section>`
).join('\n\n')}`;

const faqUrl = `${SITE}/prescott-remodeling-faq.html`;
page({
  file: 'prescott-remodeling-faq.html',
  title: 'Kitchen &amp; Bathroom Remodeling FAQ | Prescott, AZ',
  desc: `Answers to ${faqCount} common kitchen and bathroom remodeling questions for Prescott, AZ — real 2026 costs, timelines, materials, and permits. Free in-home quote.`,
  heroImg: `${SITE}/wp-content/uploads/2026/06/modern-white-kitchen-remodel-gold-accents.jpg`,
  eyebrow: 'Remodeling Answers &mdash; Prescott, AZ',
  h1: 'Kitchen &amp; Bathroom Remodeling FAQ',
  crumb: 'Remodeling FAQ',
  intro: `${faqCount} straight answers on remodeling cost, materials, timelines, permits, and licensing in Prescott and Yavapai County &mdash; from a licensed contractor who has been building here since 2011.`,
  body: faqBody,
  cta: {
    h: 'Still Have a Question?',
    p: 'Book a free in-home consultation. We come to you with design tools and material samples, measure the space, and leave you with a firm, no-obligation quote.',
  },
  related: [
    { href: 'bathroom-remodel-cost.html', kicker: 'Cost Guide', title: 'Bathroom Remodel Cost in Prescott, AZ' },
    { href: 'kitchen-remodel-cost.html', kicker: 'Cost Guide', title: 'Kitchen Remodel Cost in Prescott, AZ' },
    { href: 'shower-grout-guide.html', kicker: 'Material Guide', title: 'Shower Grout: Choose, Clean & Maintain' },
  ],
  jsonld: {
    '@context': 'https://schema.org',
    '@graph': [
      BUSINESS,
      {
        '@type': 'BreadcrumbList',
        '@id': `${faqUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Remodeling FAQ', item: faqUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${faqUrl}#faq`,
        url: faqUrl,
        name: 'Kitchen & Bathroom Remodeling FAQ — Prescott, AZ',
        about: { '@id': `${SITE}/#business` },
        mainEntity: FAQ.flatMap((c) =>
          c.items.map((i) => ({
            '@type': 'Question',
            name: plain(i.q),
            acceptedAnswer: { '@type': 'Answer', text: `${plain(i.a)} ${plain(i.d)}` },
          }))
        ),
      },
    ],
  },
});

// ======================================================== SHOWER GROUT PAGE ===
const GROUT_FAQ = [
  {
    q: 'What is the best grout for a shower floor?',
    a: 'Epoxy or single-component urethane grout. Shower floors stay wet longest, and neither of those needs sealing or stains the way cement grout does.',
  },
  {
    q: 'Do you have to seal shower grout?',
    a: 'Cement grout, yes &mdash; reseal roughly once a year. Epoxy and urethane grouts are non-porous and never need sealing.',
  },
  {
    q: 'Sanded or unsanded grout for a shower?',
    a: 'Unsanded for joints under 1/8 inch, sanded for 1/8 inch and wider. Sanded grout in a too-narrow joint will not pack properly; unsanded grout in a wide joint shrinks and cracks.',
  },
  {
    q: 'How often should shower grout be replaced?',
    a: 'Well-installed cement grout lasts 8&ndash;15 years in a Prescott shower. Epoxy and urethane commonly outlast that. If grout is failing in under five years, the problem is usually installation or waterproofing, not the grout.',
  },
  {
    q: 'Can I use bleach on shower grout?',
    a: 'Occasionally, diluted, on white cement grout &mdash; but not as a routine. Bleach erodes the cement binder over time and will fade colored grout. A pH-neutral cleaner and a soft brush is the better weekly habit.',
  },
  {
    q: 'Is vinegar safe on shower grout?',
    a: 'No, not on cement grout or natural stone. Vinegar is acidic and dissolves the cement binder and etches stone. It is safe on epoxy grout and porcelain tile, but the safest default is a pH-neutral cleaner.',
  },
  {
    q: 'Why does my shower grout keep turning orange or white?',
    a: 'That is almost always Prescott hard water. White chalky film is mineral scale (calcium and magnesium); orange staining is usually iron in the water supply. Both are water chemistry, not dirt.',
  },
  {
    q: 'Should I regrout or replace my shower?',
    a: 'Regrout if the tile is sound and only the surface joints are stained or crumbling. Replace if grout is failing in multiple places, tiles sound hollow, or you see any soft spot &mdash; those point to a waterproofing failure behind the tile.',
  },
];

const groutBody = `<section class="section">
  <div class="container">
    <div class="qa">
      <div class="takeaway">
        <strong>Quick answer</strong>
        <p>For shower floors and any constantly wet joint, epoxy or single-component urethane grout is the best choice &mdash; neither needs sealing and both resist staining. Standard cement grout is fine on shower walls if you seal it annually. Joint width decides the rest: unsanded grout under 1/8&Prime;, sanded at 1/8&Prime; and wider. In Prescott, hard water is what actually ruins most grout, not wear.</p>
      </div>

      <h2>The Four Types of Shower Grout</h2>
      <p>There are really only four grouts you will be offered for a shower, and the differences that matter are sealing, stain resistance, and price.</p>
      <div class="table-scroll">
      <table class="data-table">
        <thead><tr><th>Grout type</th><th>Joint width</th><th>Needs sealing?</th><th>Stain resistance</th><th>Relative cost</th><th>Best for</th></tr></thead>
        <tbody>
          <tr><td><strong>Unsanded cement</strong></td><td>Under 1/8&Prime;</td><td>Yes, annually</td><td>Fair</td><td>$</td><td>Narrow wall joints, polished tile that sand would scratch</td></tr>
          <tr><td><strong>Sanded cement</strong></td><td>1/8&Prime; and wider</td><td>Yes, annually</td><td>Fair</td><td>$</td><td>Standard wall and floor joints on a budget</td></tr>
          <tr><td><strong>Single-component urethane</strong></td><td>Any</td><td>No</td><td>Very good</td><td>$$</td><td>Most showers &mdash; the practical upgrade</td></tr>
          <tr><td><strong>Epoxy</strong></td><td>Any</td><td>No</td><td>Excellent</td><td>$$$</td><td>Shower floors, steam showers, hard-water areas</td></tr>
        </tbody>
      </table>
      </div>
      <p>Cement grout is porous. That is the whole story &mdash; it absorbs water, minerals, soap, and body oil, which is why it discolors and why it needs a sealer. Epoxy and urethane are non-porous, so there is nothing for hard water to soak into.</p>

      <h2>What We Actually Recommend in Prescott</h2>
      <p>Prescott and the Quad Cities run hard water. Scale builds on everything, and cement grout is the most absorbent surface in the shower. That single fact changes the recommendation from what you would hear in a softer-water market.</p>
      <ul class="ud-list">
        <li><strong>Shower floor:</strong> epoxy or urethane, always. It stays wettest and gets the most foot traffic.</li>
        <li><strong>Shower walls:</strong> urethane if the budget allows; sealed cement grout is acceptable if you will actually reseal it each year.</li>
        <li><strong>Steam showers:</strong> epoxy only. <a href="steam-shower-installation.html">See steam shower construction</a>.</li>
        <li><strong>Natural stone tile:</strong> unsanded or epoxy &mdash; sanded grout can scratch polished marble and travertine during installation.</li>
      </ul>
      <p>If the maintenance is the part you want to avoid entirely, the honest answer is to skip grout in the wet zone. <a href="groutless-shower-systems.html">Groutless solid-surface shower systems</a> have no joints to seal, scrub, or replace, and a groutless installation typically runs $5,000&ndash;$9,000 for the enclosure &mdash; comparable to a mid-range tile shower. <a href="groutless-vs-tile-shower.html">Compare groutless vs. tile</a>.</p>

      <h2>Choosing a Grout Color</h2>
      <p>Color is not just aesthetic &mdash; it decides how the shower looks in year five.</p>
      <ul class="ud-list">
        <li><strong>Matching the tile</strong> makes the surface read as one continuous plane and hides the grid.</li>
        <li><strong>Contrasting</strong> emphasizes the tile pattern &mdash; the right call for subway tile and geometric layouts.</li>
        <li><strong>Mid-tone grays and greiges hide hard-water staining best.</strong> Bright white shows every mineral deposit; very dark grout shows white scale just as clearly.</li>
      </ul>

      <h2>How to Clean Shower Grout (Without Wrecking It)</h2>
      <p>Most grout damage we see is self-inflicted by aggressive cleaning. The routine that works is boring and gentle.</p>
      <ul class="ud-list">
        <li><strong>Weekly:</strong> a pH-neutral tile cleaner and a soft nylon brush. Rinse fully.</li>
        <li><strong>After every shower:</strong> squeegee the walls. This one habit does more against hard-water staining than any cleaner.</li>
        <li><strong>Ventilate:</strong> run the exhaust fan during the shower and for 20 minutes after. Mildew is a moisture problem before it is a cleaning problem.</li>
        <li><strong>Deep clean (2&ndash;4&times; a year):</strong> an alkaline grout cleaner, dwell time per the label, soft brush, thorough rinse.</li>
        <li><strong>Reseal cement grout annually.</strong> Test it: drip water on a joint. If it darkens and soaks in, it needs sealing.</li>
      </ul>
      <h3>What to avoid</h3>
      <ul class="ud-list">
        <li><strong>Vinegar and acidic cleaners</strong> on cement grout or stone &mdash; they dissolve the binder and etch stone.</li>
        <li><strong>Bleach as a routine.</strong> It erodes cement grout over time and fades color.</li>
        <li><strong>Wire brushes, scouring pads, and power scrubbers</strong> &mdash; they physically remove grout and scratch tile glaze.</li>
        <li><strong>Steam cleaners on cement grout,</strong> which can force water past a compromised joint.</li>
      </ul>

      <h2>Regrouting vs. Replacing the Shower</h2>
      <p>Regrouting &mdash; grinding out the top layer of joints and refilling &mdash; is a legitimate fix when the tile is sound and the problem is cosmetic. It is a poor fix when grout failure is a symptom.</p>
      <div class="table-scroll">
      <table class="data-table">
        <thead><tr><th>What you see</th><th>What it usually means</th><th>The fix</th></tr></thead>
        <tbody>
          <tr><td>Surface staining and discoloration</td><td>Hard water and unsealed cement grout</td><td>Deep clean, then seal &mdash; or regrout in urethane</td></tr>
          <tr><td>Crumbling or missing grout in spots</td><td>Grout was mixed too wet, or joints were underfilled</td><td>Regrout</td></tr>
          <tr><td>Cracking along corners and changes of plane</td><td>Grout used where flexible caulk belongs</td><td>Remove and replace with matching caulk</td></tr>
          <tr><td>Grout failing in many places at once</td><td>Movement behind the tile, or a failed substrate</td><td>Investigate &mdash; likely tear-out</td></tr>
          <tr><td>Hollow-sounding tiles or a soft floor spot</td><td>Water has gotten behind the waterproofing</td><td>Tear out and rebuild</td></tr>
          <tr><td>Musty smell, staining on an adjacent wall or ceiling below</td><td>Active leak</td><td>Stop using the shower and get it looked at</td></tr>
        </tbody>
      </table>
      </div>
      <p>Grout is not what keeps water out of your wall &mdash; the waterproofing membrane behind the tile is. Grout is a filler that keeps the tile edges stable and the assembly clean. Anyone who tells you grout is the waterproofing does not build showers correctly. A proper membrane system adds $800&ndash;$1,500 to a project; a mold remediation caused by skipping it costs $10,000&ndash;$25,000. <a href="tile-shower-installation.html">See how we build tile showers</a>.</p>

      <h2>How Grout Is Installed Correctly</h2>
      <p>If you are hiring this out, here is what should happen &mdash; and what to ask about.</p>
      <ul class="ud-list">
        <li><strong>Cure first.</strong> Thinset under the tile needs to cure before grouting, typically 24&ndash;48 hours.</li>
        <li><strong>Full joints.</strong> Grout is packed in at an angle with a float so joints are filled solid, not skimmed.</li>
        <li><strong>Timely cleanup.</strong> Haze comes off in a specific window; left too long it needs acidic removers that damage fresh grout.</li>
        <li><strong>Caulk, not grout, at every change of plane.</strong> Wall-to-wall corners, wall-to-floor, and around the drain all move. Grout there will crack &mdash; matching flexible sealant will not.</li>
        <li><strong>Then cure and seal.</strong> Cement grout cures 48&ndash;72 hours before sealing. Epoxy and urethane skip this step.</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <div class="qa">
${GROUT_FAQ.map(
  (f) => `        <div class="qa-item">
          <h2>${f.q}</h2>
          <p class="qa-answer">${f.a}</p>
        </div>`
).join('\n')}
      </div>
    </div>
  </div>
</section>`;

const groutUrl = `${SITE}/shower-grout-guide.html`;
page({
  file: 'shower-grout-guide.html',
  title: 'Best Grout for Shower Tile: Choose, Clean &amp; Maintain',
  desc: 'Which grout to use in a shower, how to clean it without damaging it, and when to regrout vs. rebuild — from licensed Prescott, AZ shower installers.',
  heroImg: `${SITE}/wp-content/uploads/2024/11/tiled-bathroom-remodeling-with-glass-shower.jpg`,
  eyebrow: 'Bathroom Material Guide &mdash; Prescott, AZ',
  h1: 'Shower Grout: How to Choose, Clean &amp; Maintain It',
  crumb: 'Shower Grout Guide',
  intro: 'Which grout belongs in a shower, how to keep it from staining in Prescott hard water, and how to tell cosmetic grout problems from the kind that mean water is already behind your tile.',
  body: groutBody,
  cta: {
    h: 'Grout Failing? Let&rsquo;s Look at It.',
    p: 'If your grout keeps cracking or staining, the cause is often behind the tile. Book a free in-home consultation and we will tell you straight whether it needs a regrout or a rebuild.',
  },
  related: [
    { href: 'groutless-shower-systems.html', kicker: 'Service', title: 'Groutless Shower Systems in Prescott' },
    { href: 'tile-shower-installation.html', kicker: 'Service', title: 'Custom Tile Shower Installation' },
    { href: 'prescott-remodeling-faq.html', kicker: 'FAQ Hub', title: 'Kitchen & Bathroom Remodeling FAQ' },
  ],
  jsonld: {
    '@context': 'https://schema.org',
    '@graph': [
      BUSINESS,
      {
        '@type': 'BreadcrumbList',
        '@id': `${groutUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog.html` },
          { '@type': 'ListItem', position: 3, name: 'Shower Grout Guide', item: groutUrl },
        ],
      },
      {
        '@type': 'Article',
        '@id': `${groutUrl}#article`,
        headline: 'Shower Grout: How to Choose, Clean & Maintain It',
        description:
          'Which grout to use in a shower, how to clean it without damaging it, and when to regrout vs. rebuild.',
        image: `${SITE}/wp-content/uploads/2024/11/tiled-bathroom-remodeling-with-glass-shower.jpg`,
        author: { '@id': `${SITE}/#business` },
        publisher: { '@id': `${SITE}/#business` },
        mainEntityOfPage: groutUrl,
      },
      {
        '@type': 'FAQPage',
        '@id': `${groutUrl}#faq`,
        mainEntity: GROUT_FAQ.map((f) => ({
          '@type': 'Question',
          name: plain(f.q),
          acceptedAnswer: { '@type': 'Answer', text: plain(f.a) },
        })),
      },
    ],
  },
});

console.log(`built prescott-remodeling-faq.html (${faqCount} questions)`);
console.log(`built shower-grout-guide.html (${GROUT_FAQ.length} FAQ entries)`);
