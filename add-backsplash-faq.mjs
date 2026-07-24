/**
 * Sets expectations on the backsplash pages.
 *
 * The client will not send sales staff out to quote a backsplash on its own —
 * he refers those callers straight to his tile installer. But the site invites
 * exactly that lead ("Get Your Free Backsplash Estimate"). This adds a plainly
 * worded FAQ to both backsplash pages so the visitor learns how it works before
 * they call, without hiding the fact that Infinity does backsplash tile.
 *
 * Idempotent. Run: node add-backsplash-faq.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const Q = "Do you install a backsplash on its own, without a kitchen remodel?";
const A = "A tile backsplash is included in the design whenever we remodel a kitchen, and that is how most of our backsplash work happens. If a backsplash is genuinely all you need, we will usually refer you straight to our trusted tile installer rather than schedule a full remodeling estimate — it gets you a faster answer and a better price on a small job. Send us a couple of photos of the space and we will point you in the right direction either way.";

for (const f of ["kitchen-backsplash.html", "backsplash-installation.html"]) {
  let h = readFileSync(f, "utf8");
  if (h.includes("Do you install a backsplash on its own")) {
    console.log(`${f}: already present`);
    continue;
  }

  // --- visible copy (only where the page renders an FAQ list) ---
  const open = '<div class="pillar-faq"';
  const oi = h.indexOf(open);
  if (oi !== -1) {
    const at = h.indexOf(">", oi) + 1;
    const block =
      `\n        <div class="pillar-faq-item fade-up stagger-1">\n` +
      `          <div class="pillar-faq-q">${Q}</div>\n` +
      `          <div class="pillar-faq-a">${A}</div>\n` +
      `        </div>`;
    h = h.slice(0, at) + block + h.slice(at);
    console.log(`${f}: visible FAQ added`);
  } else {
    console.log(`${f}: no visible FAQ list — schema only`);
  }

  // --- schema ---
  const me = h.indexOf('"mainEntity": [');
  if (me === -1) {
    console.log(`  !! ${f}: FAQPage mainEntity not found — schema NOT updated`);
  } else {
    const at = me + '"mainEntity": ['.length;
    const entry = `\n      { "@type": "Question", "name": ${JSON.stringify(Q)}, "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(A)} } },`;
    h = h.slice(0, at) + entry + h.slice(at);
    console.log(`  ${f}: schema FAQ added`);
  }
  writeFileSync(f, h);
}
