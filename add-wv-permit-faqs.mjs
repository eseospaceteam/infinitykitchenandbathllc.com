#!/usr/bin/env node
/**
 * Adds two city-specific permit questions to each West Valley page, in the
 * visible .pillar-faq AND in the FAQPage schema, so the 1:1 parity the site
 * maintains everywhere else is preserved.
 *
 * Idempotent — keys off the question text. Dry run unless --apply.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { CITIES, SERVICE } from "./wv-city-data.mjs";

const APPLY = process.argv.includes("--apply");
const log = [];
let written = 0;

/* HTML-escape for visible markup; the schema gets the raw string via JSON.stringify */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#x27;");

function questions(c, sv) {
  const svc = sv.label.toLowerCase();
  const who = c.incorporated
    ? `${c.name} issues its own permits — the work is reviewed and inspected by ${c.authority}, not by Maricopa County.`
    : `${c.name} is unincorporated, so there is no city building department. Residential permits come from Maricopa County Planning & Development (602-506-3301), and the Sun City Fire and Medical District handles fire and life-safety review.`;
  const q1 = {
    q: `Do I need a permit for a ${svc} remodel in ${c.name}?`,
    a: `${who} Whether your specific job needs one depends on scope: ${sv.scopeNote
      .charAt(0)
      .toLowerCase()}${sv.scopeNote.slice(1)} We pull the permit and meet the inspector as part of the job, so this is our paperwork rather than yours.`,
  };
  const q2 = c.community
    ? {
        q: `Does ${c.community.body} have to approve my remodel?`,
        a: `Check before you start rather than after. Community requirements most often bite on anything that changes the exterior; a ${svc} remodel that stays inside the house usually does not trigger review, but your own deed restrictions are the authority and confirming costs you nothing. We are happy to wait while you check.`,
      }
    : {
        q: `How old are most ${c.name} homes, and does that change the job?`,
        a: `${c.era} ${c.eraImplication.split(". ").slice(0, 2).join(". ")}. We confirm what is behind your walls before quoting rather than after demolition.`,
      };
  return [q1, q2];
}

for (const [slug, c] of Object.entries(CITIES)) {
  for (const svKey of ["kitchen", "bathroom"]) {
    const sv = SERVICE[svKey];
    const file = `${sv.slug}-${slug}.html`;
    if (!existsSync(file)) { log.push(`MISS  ${file}`); continue; }
    let h = readFileSync(file, "utf8");
    const qs = questions(c, sv);
    if (h.includes(esc(qs[0].q)) || h.includes(qs[0].q)) { log.push(`skip  ${file} (faqs present)`); continue; }

    /* --- visible: append items inside .pillar-faq ------------------------ */
    const faqOpen = h.indexOf('<div class="pillar-faq"');
    if (faqOpen < 0) { log.push(`MISS  ${file} — no .pillar-faq`); continue; }
    const lastItem = h.lastIndexOf("</div></div>", h.indexOf("</section>", faqOpen));
    if (lastItem < 0) { log.push(`MISS  ${file} — cannot locate faq tail`); continue; }
    const insertAt = lastItem + "</div>".length; // after the last .pillar-faq-item closes
    const visible = qs
      .map(
        (x) =>
          `<div class="pillar-faq-item"><p class="pillar-faq-q">${esc(x.q)}</p><p class="pillar-faq-a">${esc(x.a)}</p></div>`
      )
      .join("");
    h = h.slice(0, insertAt) + visible + h.slice(insertAt);

    /* --- schema: append Questions to the FAQPage node -------------------- */
    const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    let ok = false;
    for (const b of blocks) {
      let data;
      try { data = JSON.parse(b[1]); } catch { continue; }
      const nodes = data["@graph"] ?? [data];
      const faq = nodes.find((n) => n["@type"] === "FAQPage");
      if (!faq || !Array.isArray(faq.mainEntity)) continue;
      for (const x of qs) {
        faq.mainEntity.push({
          "@type": "Question",
          name: x.q,
          acceptedAnswer: { "@type": "Answer", text: x.a },
        });
      }
      const rebuilt = `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
      h = h.slice(0, b.index) + rebuilt + h.slice(b.index + b[0].length);
      ok = true;
      break;
    }
    if (!ok) { log.push(`MISS  ${file} — no FAQPage node`); continue; }

    if (APPLY) writeFileSync(file, h);
    written++;
    log.push(`faq   ${file} +2`);
  }
}

for (const l of log) console.log("  " + l);
console.log(`\n${written} page(s) ${APPLY ? "written" : "would change"}`);
if (!APPLY) console.log("  (dry run — pass --apply to write)");
