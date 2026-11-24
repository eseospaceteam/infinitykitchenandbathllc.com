/* Topic-matched calls to action on 10 guide pages (23 Nov 2026).

   Pages: the 4 guides with Search Console clicks (25 Oct to 21 Nov 2026) plus the 6 most-linked
   guides from the guide hubs. Per page:
     1. a "next step" card before the first H2 (after the quick answer / intro), naming the
        Infinity Kitchens and Baths service that solves the reader's problem, with a button to that
        service page and a tap-to-call button;
     2. one mid-article prompt (these guides had none) placed before the named H2;
     3. the end banner is rewritten only where it was generic (the financing guide); the other
        nine already carry a topic-matched banner and are left alone.
   Every fact comes from the site's own service pages: custom-countertops.html (factory-direct
   stone, samples at the in-home consultation), groutless-shower-systems.html (authorized Sentrel
   dealer, one to two days), bathroom-remodeling.html and kitchen-remodeling.html (in-house,
   2 to 4 weeks of active construction, City of Avondale permits, targeted upgrades to full
   remodels), kitchen-cabinets.html (factory-direct semi-custom and custom, plywood boxes,
   soft-close hardware, free in-home consultation), financing.html (not a lender, lending
   partners, same price cash or financed) and the guides' own end banners (slab yard, samples,
   free in-home consultations, regrout or rebuild). Styles live in css/styles.css (.ik-next).
   Idempotent: guarded by class="ik-next". Run: node cta-topic-2026-11-23.mjs */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url));
const TEL = `<a href="tel:6028856998" class="btn btn-outline-dark btn-sm">Call 602-885-6998</a>`;
const EST = `<a href="contact.html">Get a free estimate</a>`;
const CONSULT = `<a href="contact.html">Book a free consultation</a>`;

const PAGES = {
  "bathroom-remodel-financing": {
    label: "Planning how to pay?",
    next: "Infinity Kitchens and Baths is not a lender, but we can connect you with lending partners we have worked with. Our prices are the same whether you pay cash or finance.",
    go: ["financing.html", "How remodel financing works"],
    midBefore: "How Much Should You Finance for a Bathroom Remodel?",
    mid: `Want a real number to finance against? ${EST} first.`,
    end: {
      oldH2: "Get a Free Bathroom Estimate in Avondale",
      oldP: "Tell us about your project and we'll give you a clear written estimate — no pressure.",
      h2: "Know Your Number Before You Finance",
      p: "Start with a clear written estimate, with no pressure. Take it to your own bank or credit union too, and compare the offers.",
    },
  },
  "butcher-block-vs-quartz": {
    label: "See both in person",
    next: "Infinity Kitchens and Baths installs quartz, granite and quartzite countertops in Avondale, sourced factory-direct. We bring samples to your free in-home consultation.",
    go: ["custom-countertops.html", "Our countertop services"],
    midBefore: "Which Should You Choose?",
    mid: `Want to see the colors under your own lighting? ${CONSULT} and we bring samples.`,
  },
  "granite-vs-marble": {
    label: "Picking a natural stone?",
    next: "Infinity Kitchens and Baths handles stone fabrication and installation, and we take you to the slab yard to select your exact stone. Consultations in Avondale are free.",
    go: ["custom-countertops.html", "Our countertop services"],
    midBefore: "Sealing Requirements Compared",
    mid: `Choosing between slabs? ${CONSULT} and we will take you to the slab yard.`,
  },
  "groutless-vs-tile-shower": {
    label: "Comparing shower walls?",
    next: "Infinity Kitchens and Baths is an authorized Sentrel dealer, and a groutless panel shower typically goes in within one to two days. We also build custom tile showers.",
    go: ["groutless-shower-systems.html", "Groutless shower systems"],
    midBefore: "Who Should Choose a Groutless Shower?",
    mid: `Want to compare both in your own bathroom? ${CONSULT} and we bring samples of each.`,
  },
  "kitchen-remodel-cost": {
    label: "Get your own number",
    next: "Infinity Kitchens and Baths handles full kitchen remodels in-house, with active construction typically taking 2 to 4 weeks. Estimates in Avondale are free.",
    go: ["kitchen-remodeling.html", "Kitchen remodeling"],
    midBefore: "How to Stretch Your Kitchen Remodel Budget",
    mid: `Want a number for your kitchen, not a national average? ${EST}.`,
  },
  "bathroom-remodel-cost": {
    label: "Price your own bathroom",
    next: "Infinity Kitchens and Baths handles complete bathroom remodels in-house and pulls the City of Avondale permits for our work. Active construction typically takes 2 to 4 weeks.",
    go: ["bathroom-remodeling.html", "Bathroom remodeling"],
    midBefore: "Master Bathroom vs. Guest Bathroom Costs",
    mid: `Want a number for your own bathroom? ${EST} and a free CAD rendering before you commit.`,
  },
  "quartz-vs-granite": {
    label: "See the slabs at home",
    next: "Infinity Kitchens and Baths installs quartz, granite and quartzite, sourced factory-direct from stone suppliers. We bring samples so you see the real colors under your lighting.",
    go: ["custom-countertops.html", "Our countertop services"],
    midBefore: "Which Is More Expensive?",
    mid: `Still torn between the two? ${CONSULT} and compare samples at home.`,
  },
  "shower-grout-guide": {
    label: "Grout that will not come clean?",
    next: "If grout keeps cracking or staining, the cause is often behind the tile. At a free in-home consultation, Infinity Kitchens and Baths will tell you whether it needs a regrout or a rebuild.",
    go: ["showers.html", "Shower remodeling options"],
    midBefore: "Regrouting vs. Replacing the Shower",
    mid: `Not sure if your shower needs a regrout or a rebuild? ${CONSULT}.`,
  },
  "kitchen-remodel-vs-refresh": {
    label: "Refresh or remodel?",
    next: "Infinity Kitchens and Baths does everything from targeted kitchen upgrades to full remodels in Avondale. At a free consultation we walk your kitchen and give you a straight answer.",
    go: ["kitchen-remodeling.html", "Kitchen remodeling"],
    midBefore: "When a Refresh Becomes a Remodel",
    mid: `Not sure which one your kitchen needs? ${CONSULT} and we will walk it with you.`,
  },
  "shaker-vs-flat-panel-cabinets": {
    label: "Choosing a door style?",
    next: "Infinity Kitchens and Baths designs and installs factory-direct semi-custom and custom cabinets, with plywood boxes and soft-close hardware as standard. It starts with a free in-home consultation.",
    go: ["kitchen-cabinets.html", "Kitchen cabinets"],
    midBefore: "Inset vs. Overlay: The Other Decision You'll Make",
    mid: `Want to see door styles in your own kitchen? ${CONSULT}.`,
  },
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
let changed = 0;
for (const [slug, c] of Object.entries(PAGES)) {
  const file = join(ROOT, `${slug}.html`);
  let h = readFileSync(file, "utf8");
  if (h.includes('class="ik-next"')) { console.log(`skip (already done) ${slug}`); continue; }
  const main = h.indexOf("<main");
  const firstH2 = h.indexOf("<h2", main);
  const midRe = new RegExp(`<h2>${esc(c.midBefore.replace(/'/g, "&#39;"))}</h2>|<h2>${esc(c.midBefore)}</h2>|<h2>${esc(c.midBefore.replace(/'/g, "&rsquo;"))}</h2>|<h2>${esc(c.midBefore.replace(/'/g, "’"))}</h2>`, "g");
  const problems = [];
  if (main < 0 || firstH2 < 0) problems.push("first h2");
  const midHits = h.match(midRe) || [];
  if (midHits.length !== 1) problems.push(`mid anchor (${midHits.length})`);
  if (c.end && (h.split(`>${c.end.oldH2}</h2>`).length !== 2 || h.split(`>${c.end.oldP}</p>`).length !== 2)) problems.push("end banner");
  if (problems.length) { console.error(`FAIL ${slug}: ${problems.join(", ")}`); process.exitCode = 1; continue; }

  const card =
    `<div class="ik-next"><span class="ik-next-label">${c.label}</span><p>${c.next}</p>` +
    `<div class="ik-next-btns"><a href="${c.go[0]}" class="btn btn-gold btn-sm">${c.go[1]}</a>${TEL}</div></div>\n      `;
  h = h.slice(0, firstH2) + card + h.slice(firstH2);
  h = h.replace(midRe, (m) => `<p class="ik-mid">${c.mid}</p>\n      ${m}`);
  if (c.end) {
    h = h.replace(`>${c.end.oldH2}</h2>`, `>${c.end.h2}</h2>`);
    h = h.replace(`>${c.end.oldP}</p>`, `>${c.end.p}</p>`);
  }
  writeFileSync(file, h);
  changed++;
  console.log(`ok ${slug}`);
}
console.log(`${changed} pages updated`);
