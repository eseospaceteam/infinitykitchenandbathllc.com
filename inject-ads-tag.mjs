/**
 * Add the Google Ads destination (AW-17095449186) to the sitewide gtag block.
 *
 * The account's two primary conversion actions are Google-tag event actions named
 * exactly `generate_lead` and `phone_call_click` (no send_to label). The site already
 * fires both events (js/main.js on tel: clicks, LP + contact forms on submit), but the
 * gtag block only ever configured the GA4 destination — so the events never reached
 * Google Ads. Adding a second config line routes the existing events to both.
 *
 * Idempotent + byte-safe: only appends one line after the GA4 config, skips files
 * that already carry it. Run: node inject-ads-tag.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";

const AW = "AW-17095449186";
const GA_CONFIG = "gtag('config', 'G-EK9HSW7F90')";
const AW_CONFIG = `gtag('config', '${AW}')`;

const files = globSync("**/*.html", {
  cwd: process.cwd(),
  exclude: (p) => p.includes("node_modules"),
});

let changed = 0, already = 0, missing = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  if (src.includes(AW)) { already++; continue; }
  if (!src.includes(GA_CONFIG)) { missing++; continue; }

  // Insert directly after the GA4 config statement, preserving its indentation.
  const idx = src.indexOf(GA_CONFIG);
  const lineStart = src.lastIndexOf("\n", idx) + 1;
  const indent = src.slice(lineStart, idx);
  const after = src.indexOf(";", idx);
  const cut = after === -1 ? idx + GA_CONFIG.length : after + 1;

  const out = src.slice(0, cut) + `\n${indent}${AW_CONFIG};` + src.slice(cut);
  writeFileSync(f, out);
  changed++;
}

console.log(`injected ${AW} into ${changed} page(s)`);
console.log(`  already had it: ${already}`);
console.log(`  no GA4 config (skipped): ${missing}`);
