#!/usr/bin/env node
/**
 * Builds accessibility.html — the WCAG accessibility statement.
 *
 * Chrome (GA/Ads head block, nav, footer) is lifted from cookie-policy.html at
 * build time so it stays in sync with sitewide nav/footer changes, and so the
 * page matches the other legal pages' layout. Re-run after any chrome change.
 *
 * IMPORTANT: run `node a11y-upgrade.mjs` afterwards — that script adds the skip
 * link, the <main> landmark, and the footer link, and it is idempotent.
 *
 * Wording follows the W3C's model statement. It deliberately claims
 * "partially conformant", never full conformance: an overclaim is exactly what
 * gets cited as bad faith, and the known limitations below are real.
 *
 * Usage: node build-accessibility.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = 'https://www.infinitykitchenandbathllc.com';
const LOGO = `${SITE}/wp-content/uploads/2023/11/infinity-logo.png`;
const SRC = readFileSync(path.join(ROOT, 'cookie-policy.html'), 'utf8');

const REVIEWED = 'July 29, 2026';
const PHONE_DISPLAY = '928-800-1998';
const EMAIL = 'info@infinitykitchenandbathllc.com';

// ---------------------------------------------------------------- chrome ----
const gtagStart = SRC.indexOf('<!-- Google tag (gtag.js) -->');
const gtagEnd = SRC.indexOf('</script>', SRC.indexOf('</script>', gtagStart) + 9) + 9;
const GTAG = SRC.slice(gtagStart, gtagEnd);

const navStart = SRC.indexOf('<nav id="navbar"');
const navCta = SRC.indexOf('mobile-nav-cta', navStart);
const NAV = SRC.slice(navStart, SRC.indexOf('</div>', SRC.indexOf('</div>', navCta) + 6) + 6);

const FOOTER = SRC.slice(SRC.indexOf('<footer>'), SRC.indexOf('</footer>') + 9);

// Kept inside the site's own limits (title ≤60 visible chars, description
// ≤155) — same rule optimize-titles.mjs enforces.
const TITLE = 'Accessibility Statement | Infinity Kitchens and Baths';
const DESC =
  'How we make our site usable for everyone: WCAG 2.1 AA conformance status, the measures in place, known limitations, and how to report a barrier.';
const PAGE_URL = `${SITE}/accessibility.html`;

const JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'HomeAndConstructionBusiness',
      '@id': `${SITE}/#business`,
      name: 'Infinity Kitchens and Baths',
      url: `${SITE}/`,
      telephone: '+1-928-800-1998',
      email: EMAIL,
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
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Accessibility Statement', item: PAGE_URL },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: 'Website Accessibility Statement',
      description: DESC,
      about: { '@id': `${SITE}/#business` },
    },
  ],
};

const BODY = `
<!-- HERO -->
<section class="page-hero" style="background:var(--green-900);">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,#1B4332 0%,#2d6a4f 100%);"></div>
  <div class="page-hero-inner" style="position:relative;">
    <div class="breadcrumb"><a href="/">Home</a><span>/</span><span>Accessibility</span></div>
    <span class="eyebrow">Legal</span>
    <h1>Accessibility Statement</h1>
    <p style="color:rgba(255,255,255,0.75);margin-top:0.5rem;">Last reviewed: ${REVIEWED} &mdash; Infinity Kitchens and Baths, LLC</p>
  </div>
</section>

<!-- CONTENT -->
<section class="section">
  <div class="container">
    <div style="max-width:800px;margin:0 auto;line-height:1.8;color:var(--gray-700);">

      <p>Infinity Kitchens and Baths, LLC is committed to making <strong>infinitykitchenandbathllc.com</strong> usable by as many people as possible, regardless of ability or the technology they browse with. A large share of the work we do &mdash; <a href="walk-in-showers.html" style="color:var(--green-800);">walk-in showers</a>, <a href="ada-bathroom-remodeling.html" style="color:var(--green-800);">ADA bathrooms</a>, and <a href="aging-in-place.html" style="color:var(--green-800);">aging-in-place remodels</a> &mdash; exists to help people stay independent in their own homes. It would be inconsistent of us to build accessible bathrooms behind an inaccessible website.</p>

      <h2>Conformance Status</h2>
      <p>We aim to meet the <a href="https://www.w3.org/TR/WCAG21/" rel="noopener" style="color:var(--green-800);">Web Content Accessibility Guidelines (WCAG) 2.1</a> at <strong>Level AA</strong>. This site is currently <strong>partially conformant</strong> with WCAG 2.1 Level AA. &ldquo;Partially conformant&rdquo; means most of the site meets the standard, but we know of some areas that do not yet, and those are listed below.</p>
      <p>We publish this honestly rather than claiming full conformance. Accessibility is not a one-time project: every time we add pages or change the site, we can introduce new barriers, so we treat this as ongoing maintenance.</p>

      <h2>What We Have Done</h2>
      <p>Measures currently in place across the site:</p>
      <ul>
        <li><strong>Keyboard access.</strong> Every interactive control &mdash; navigation, buttons, forms, the estimate panel &mdash; can be reached and operated with a keyboard alone, and the currently focused element is shown with a clearly visible outline.</li>
        <li><strong>Skip to main content.</strong> A skip link is the first item on every page, so keyboard and screen-reader users can jump past the navigation menu.</li>
        <li><strong>Page structure.</strong> Pages use real landmarks and a single, ordered heading hierarchy, so assistive technology can navigate by region and by heading.</li>
        <li><strong>Labelled forms.</strong> Every form field has a programmatic label, and submitting a form announces its result &mdash; success or failure &mdash; rather than only changing a button's appearance.</li>
        <li><strong>Text contrast.</strong> Body text, links, and small print are checked against the 4.5:1 minimum contrast ratio.</li>
        <li><strong>Text alternatives.</strong> Images that carry meaning have descriptive alternative text; purely decorative images are marked so screen readers skip them instead of reading out filenames.</li>
        <li><strong>Reduced motion.</strong> If your device is set to reduce motion, our scroll and hover animations are switched off.</li>
        <li><strong>Resizing and zoom.</strong> The layout reflows down to small screens and up to 200% browser zoom without loss of content or horizontal scrolling.</li>
      </ul>

      <h2>Known Limitations</h2>
      <p>We are aware of the following and are working on them:</p>
      <ul>
        <li><strong>Embedded Google Maps.</strong> Some pages embed a map from Google. We do not control that embed's internal accessibility. Our address is always given as plain text alongside it, and you can call us for directions.</li>
        <li><strong>Older project photography.</strong> Some alternative text on older gallery images is more generic than we would like. We are rewriting these as we revisit each page.</li>
        <li><strong>Third-party content.</strong> Reviews and other content served from outside platforms may not fully meet the standard.</li>
      </ul>

      <h2>Assistive Technology and Browsers</h2>
      <p>The site is built to work with current versions of Chrome, Edge, Firefox, and Safari on both desktop and mobile, and with the screen readers and magnification tools built into those platforms. If you use an older browser or a specific assistive tool and something does not work, please tell us &mdash; that is genuinely useful information.</p>

      <h2>If Something Is Not Accessible to You</h2>
      <p>We want to hear about it, and we would rather over-hear than under-hear. If any part of this site blocks you, or if you need information from it in a different format &mdash; read to you over the phone, sent as large-print or plain text, or gone through in person &mdash; contact us:</p>
      <p style="background:var(--green-25,#F4FAF6);border:1px solid var(--green-100);border-left:4px solid var(--gold);border-radius:6px;padding:1.35rem 1.5rem;">
        <strong>Phone:</strong> <a href="tel:9288001998" style="color:var(--green-800);">${PHONE_DISPLAY}</a><br>
        <strong>Email:</strong> <a href="mailto:${EMAIL}" style="color:var(--green-800);">${EMAIL}</a><br>
        <strong>Mail:</strong> Infinity Kitchens and Baths, LLC, 723 N Montezuma St, Suite C, Prescott, AZ 86301<br>
        <strong>Or use our</strong> <a href="contact.html" style="color:var(--green-800);">contact form</a>.
      </p>
      <p>Please tell us the page address and what went wrong, and include how you would like us to reply. <strong>We aim to respond within two business days.</strong> If we cannot fix something quickly, we will tell you what we are doing about it and give you another way to get the information you need in the meantime.</p>
      <p>Nothing on this site should ever be the only way to reach us or to get a quote. We offer <a href="contact.html" style="color:var(--green-800);">free in-home consultations</a> throughout Prescott and the Quad Cities, and you are always welcome to simply call.</p>

      <h2>How We Test</h2>
      <p>We assess this site by a combination of automated testing and manual review, including navigating pages by keyboard alone, checking heading and landmark structure, and verifying colour contrast ratios against the WCAG formula. Automated tools catch only part of the picture, so manual checks are part of every review.</p>

      <h2>Formal Approval and Review</h2>
      <p>This statement was prepared on ${REVIEWED} and applies to <strong>infinitykitchenandbathllc.com</strong>. It is approved by the ownership of Infinity Kitchens and Baths, LLC (AZ ROC #339999). We review it at least annually and whenever we make substantial changes to the site.</p>

      <p style="margin-top:2.5rem;font-size:0.9rem;color:var(--gray-500);">Related: <a href="privacy-policy.html" style="color:var(--green-800);">Privacy Policy</a> &middot; <a href="terms-of-service.html" style="color:var(--green-800);">Terms of Service</a> &middot; <a href="cookie-policy.html" style="color:var(--green-800);">Cookie Policy</a></p>

    </div>
  </div>
</section>
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  ${GTAG}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${TITLE}</title>
  <meta name="description" content="${DESC}">
  <link rel="stylesheet" href="css/styles.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#1D5535">

  <!-- SEO: canonical, Open Graph & structured data -->
  <link rel="canonical" href="${PAGE_URL}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Infinity Kitchens and Baths">
  <meta property="og:title" content="${TITLE}">
  <meta property="og:description" content="${DESC}">
  <meta property="og:url" content="${PAGE_URL}">
  <meta property="og:image" content="${LOGO}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${TITLE}">
  <meta name="twitter:description" content="${DESC}">
  <meta name="twitter:image" content="${LOGO}">
  <script type="application/ld+json">${JSON.stringify(JSONLD)}</script>
</head>
<body>

${NAV}
${BODY}
${FOOTER}
<script src="js/main.js"></script>
<script src="js/cookie-consent.js"></script>
<script src="js/estimate-tab.js"></script>
</body>
</html>
`;

writeFileSync(path.join(ROOT, 'accessibility.html'), html);
console.log(`accessibility.html written — ${html.length} bytes`);
