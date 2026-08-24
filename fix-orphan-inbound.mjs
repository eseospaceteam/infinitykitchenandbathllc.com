#!/usr/bin/env node
// Five pages carried 222 inbound links each but ZERO from inside any page's
// <main> — they were reachable only from the footer. Footer-only reachability
// is fine for a policy page and poor for a page you want ranked, so this adds
// genuinely contextual in-content links from pages where the reference belongs.
//
// Each insertion is anchored to real surrounding copy and guarded on the
// target href, so re-running is a no-op.
import { readFileSync, writeFileSync } from 'node:fs';

const DRY = process.argv.includes('--dry');

const EDITS = [
  // featured-in.html + community.html — press and local involvement belong on
  // the two "who we are" pages.
  {
    file: 'our-team.html',
    guard: 'featured-in.html',
    after: /(<h2[^>]*>The Values That Drive Every Project<\/h2>)/,
    insert: `\n<p>That local accountability shows up outside the job site too — in the <a href="community.html">Prescott organisations we support</a> and in the <a href="featured-in.html">local press coverage our work has picked up</a>.</p>`,
  },
  {
    file: 'about.html',
    guard: 'featured-in.html',
    after: /(<h2[^>]*>Proudly Serving the Prescott Region<\/h2>)/,
    insert: `\n<p>We are part of this region, not just working in it: see <a href="community.html">how we support the Prescott community</a>, <a href="featured-in.html">where our work has been featured</a>, and <a href="locations.html">every area we serve</a>.</p>`,
  },
  // faq.html — the general FAQ deserves an in-content route from the two
  // highest-traffic service hubs.
  {
    file: 'services.html',
    guard: '>the questions we get asked most<',
    after: /(<h2[^>]*>[\s\S]{0,120}?<\/h2>)/,
    insert: `\n<p>Not sure which service you need? Start with <a href="faq.html">the questions we get asked most</a>, or browse <a href="locations.html">the areas we serve</a>.</p>`,
    once: true,
  },
  {
    file: 'reviews.html',
    guard: 'featured-in.html',
    after: /(<h2[^>]*>We&rsquo;d Love Your Review<\/h2>|<h2[^>]*>We'd Love Your Review<\/h2>)/,
    insert: `\n<p>Reviews are not the only place our work shows up — see <a href="featured-in.html">where we have been featured</a> and <a href="faq.html">the answers to the questions most people ask before hiring</a>.</p>`,
  },
  // accessibility.html is a website accessibility statement, NOT the
  // aging-in-place service. Linking it from accessibility-guides.html would
  // conflate the two, so it gets its contextual link from contact instead,
  // where "having trouble using this site" is the natural reason to follow it.
  {
    file: 'contact.html',
    guard: 'accessibility.html">accessibility statement',
    after: /(<h1[^>]*>[\s\S]*?<\/h1>)/,
    insert: `\n<p style="font-size:0.95rem;">Having trouble using this form or this site? Call <a href="tel:9288001998">928-800-1998</a> and we will take your details over the phone — and please read our <a href="accessibility.html">accessibility statement</a>, which explains how to reach us if any part of the site does not work for you.</p>`,
  },
];

let n = 0;
for (const e of EDITS) {
  let html = readFileSync(e.file, 'utf8');
  const main = html.match(/<main[\s\S]*?<\/main>/);
  if (!main) { console.warn(`  ! no <main>: ${e.file}`); continue; }
  if (main[0].includes(e.guard)) { console.log(`  = already linked: ${e.file}`); continue; }
  if (!e.after.test(main[0])) { console.warn(`  ! anchor not found in ${e.file}`); continue; }

  const updated = main[0].replace(e.after, `$1${e.insert}`);
  if (updated === main[0]) { console.warn(`  ! no-op on ${e.file}`); continue; }
  html = html.replace(main[0], updated);
  if (!DRY) writeFileSync(e.file, html);
  console.log(`  + ${e.file}`);
  n++;
}
console.log(`${DRY ? '(dry) ' : ''}${n} pages updated`);
