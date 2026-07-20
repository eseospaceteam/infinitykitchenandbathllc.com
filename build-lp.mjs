// Generates rich PPC landing pages in the live-site design: full nav + footer,
// a lead FORM in the hero (up top), services, gallery of work, real reviews,
// GBP map embed, FAQ. noindex. Nav/footer pulled from a live page at build time
// and root-absolutized (pages live in /lp/). Region phone swapped for Prescott.
// Output: lp/<slug>/index.html  ->  /lp/<slug>/
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";

const REF = readFileSync("bathroom-remodeling-avondale.html", "utf8");
const IMG = "https://www.infinitykitchenandbathllc.com/wp-content/uploads";
const PHONE = {
  avondale: { raw: "6028856998", display: "(602) 885-6998" },
  prescott: { raw: "9288001998", display: "(928) 800-1998" },
};
const GTAG = REF.slice(REF.indexOf("<!-- Google tag"), REF.indexOf("</script>", REF.indexOf("gtag('config'")) + 9);

const rootAbs = (h) => h.replace(/(href|src)="(?!https?:|\/|#|tel:|mailto:|data:)([^"]+)"/g, '$1="/$2"');
const NAV_ABS = rootAbs(REF.slice(REF.indexOf('<nav id="navbar"'), REF.indexOf('<section class="page-hero"')));
const FOOTER_ABS = rootAbs(REF.slice(REF.indexOf("<footer>"), REF.indexOf("</footer>") + 9));
const navFor = (region) => region === "avondale" ? NAV_ABS : NAV_ABS
  .replace(/tel:6028856998/g, "tel:9288001998").replace(/\(602\) 885-6998/g, "(928) 800-1998")
  .replace(/602-885-6998/g, "928-800-1998").replace(/West Valley &bull; Maricopa County/g, "Prescott &bull; Yavapai County");

// Real Google reviews (verbatim, from reviews.html).
const REVIEWS = [
  ["Karin N.", "They really listen to your needs, fix concerns immediately, always showed up when they said they would, and left the job site clean."],
  ["Virginia G.", "Loved how my bathrooms turned out. All the employees were wonderful. They treated me like family and were very respectful of my home. Highly recommend!"],
  ["Deborah M.", "They were here on time, started when they said they would, and finished when they said they would. The work was professional and the price was exactly as quoted."],
  ["Todd C.", "Always kept me informed and worked super fast and with great standards! The countertops and shower look incredible. Will definitely use Infinity again."],
];

const BATH = {
  hero: `${IMG}/2026/06/luxury-marble-bathroom-tub-frameless-shower.jpg`,
  gallery: [
    [`${IMG}/2024/12/Solid-surface-shower-designed-by-Infinity-Kitchen-and-Bath.jpg`, "Solid-surface walk-in shower"],
    [`${IMG}/2024/11/tiled-bathroom-remodeling-with-glass-shower.jpg`, "Custom tile shower with glass"],
    [`${IMG}/2024/11/marbled-theme-bathroom-remodeling-with-his-and-hers-vanity.jpg`, "Marble bath with double vanity"],
    [`${IMG}/2024/12/Luxurious-solid-surface-shower-for-bathroom-reodeling.jpg`, "Luxury solid-surface shower"],
    [`${IMG}/2024/11/Double-glass-shower-with-Sentrel-wall-system-in-bathroom-remodeling.jpg`, "Double glass shower, Sentrel walls"],
    [`${IMG}/2024/11/luxury-bathroom-remodeling.jpg`, "Full luxury bathroom remodel"],
  ],
  services: [
    ["Walk-In Showers", "/walk-in-showers.html", `${IMG}/2024/12/Solid-surface-shower-designed-by-Infinity-Kitchen-and-Bath.jpg`, "Barrier-free, low-maintenance walk-in showers built to fit your space."],
    ["Tub-to-Shower Conversion", "/tub-to-shower.html", `${IMG}/2024/12/Solid-surface-shower-designed-by-Infinity-Kitchen-and-Bath.jpg`, "Swap a rarely-used tub for a sleek, easy-access walk-in shower."],
    ["Groutless Shower Systems", "/groutless-shower-systems.html", `${IMG}/2024/12/Luxurious-solid-surface-shower-for-bathroom-reodeling.jpg`, "Solid-surface shower walls with no grout lines to scrub or reseal."],
    ["Tile &amp; Custom Showers", "/tile-shower-installation.html", `${IMG}/2024/11/tiled-bathroom-remodeling-with-glass-shower.jpg`, "Custom tile showers — patterns, niches, and benches set by hand."],
    ["Bathroom Vanities", "/bathroom-vanities.html", `${IMG}/2024/11/marbled-theme-bathroom-remodeling-with-his-and-hers-vanity.jpg`, "Single, double, and floating vanities with stone tops and real storage."],
    ["ADA &amp; Aging-in-Place", "/ada-bathroom-remodeling.html", `${IMG}/2025/03/bathroom-remodeling-2.jpg`, "Curbless showers, grab bars, and comfort-height fixtures for safe aging in place."],
  ],
};
const KITCHEN = {
  hero: `${IMG}/2026/06/modern-white-kitchen-remodel-gold-accents.jpg`,
  gallery: [
    [`${IMG}/2024/11/elegant-kitchen-remodeling.jpg`, "Elegant full kitchen remodel"],
    [`${IMG}/2024/11/remodeled-kitchen-with-marble-countertops-and-more.jpg`, "Marble countertops & island"],
    [`${IMG}/2024/12/Quartz-countertop-by-Infinity-Kitchen-and-Bath.png`, "Quartz countertop install"],
    [`${IMG}/2024/11/luxurious-kitchen-remodeling.jpg`, "Luxury kitchen renovation"],
    [`${IMG}/2025/03/Gillis-kitchen-remodeling.jpg`, "Gillis kitchen remodel"],
    [`${IMG}/2025/03/Davtyan-kitchen-remodeling.jpg`, "Davtyan kitchen remodel"],
  ],
  services: [
    ["Custom Cabinets", "/kitchen-cabinets.html", `${IMG}/2024/11/elegant-kitchen-remodeling.jpg`, "Custom and semi-custom cabinetry built and finished to fit your kitchen."],
    ["Countertops", "/custom-countertops.html", `${IMG}/2024/12/Quartz-countertop-by-Infinity-Kitchen-and-Bath.png`, "Quartz, granite, and solid-surface tops fabricated and installed to last."],
    ["Backsplash &amp; Tile", "/kitchen-backsplash.html", `${IMG}/2024/11/remodeled-kitchen-with-marble-countertops-and-more.jpg`, "Statement backsplashes and tile in finishes that tie your kitchen together."],
    ["Kitchen Flooring / LVP", "/luxury-vinyl-flooring.html", `${IMG}/2024/12/Flooring-installation-by-Infinity-Kitchen-and-Bath.png`, "Durable, waterproof luxury vinyl and tile flooring for busy kitchens."],
    ["Outdoor Kitchens", "/outdoor-kitchen.html", `${IMG}/2024/11/luxurious-kitchen-remodeling.jpg`, "Built-in grills, counters, and storage for Arizona outdoor living."],
    ["Small Kitchen Remodeling", "/small-kitchen-remodeling.html", `${IMG}/2025/03/Davtyan-kitchen-remodeling.jpg`, "Smart, space-saving layouts that make a compact kitchen work harder."],
  ],
};

const LP_CSS = `
  .lp-hero{position:relative;color:#fff;padding:0;overflow:hidden}
  .lp-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center}
  .lp-hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,#0D2A1A 0%,rgba(13,42,26,.92) 40%,rgba(27,67,50,.72) 100%)}
  .lp-hero-inner{position:relative;max-width:1180px;margin:0 auto;padding:calc(var(--nav-height,80px) + 3rem) 1.5rem 3.25rem;display:grid;grid-template-columns:1.1fr .9fr;gap:2.75rem;align-items:start}
  .lp-hero h1{font-size:clamp(1.9rem,3.6vw,2.9rem);font-weight:800;line-height:1.1;letter-spacing:-.01em;color:#fff}
  .lp-hero .eyebrow{color:#C9A227;font-weight:700}
  .lp-hero p.lead{color:rgba(255,255,255,.9);font-size:1.1rem;margin:1rem 0 1.25rem;max-width:44ch}
  .lp-hero ul{list-style:none;display:flex;flex-direction:column;gap:.55rem;margin:0 0 1.4rem}
  .lp-hero ul li{display:flex;gap:.6rem;align-items:flex-start;font-size:1rem;color:rgba(255,255,255,.94)}
  .lp-hero ul li svg{flex:none;margin-top:3px}
  .lp-hero-call{display:inline-flex;align-items:center;gap:.6rem;color:#fff;text-decoration:none;font-weight:800;font-size:1.3rem}
  .lp-hero-call small{display:block;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.62);font-weight:700}
  .lp-form{background:#fff;border-radius:16px;padding:1.6rem 1.5rem 1.35rem;box-shadow:0 30px 70px rgba(0,0,0,.35);color:#1a2320}
  .lp-form h2{font-size:1.4rem;font-weight:800;color:#133624;line-height:1.15}
  .lp-form .fsub{font-size:.9rem;color:#5b6b61;margin:.25rem 0 .5rem}
  .lp-form .fstars{display:flex;align-items:center;gap:.5rem;font-size:.85rem;color:#5b6b61;margin-bottom:1rem}
  .lp-form .fstars .s{color:#F5B841;letter-spacing:1px}
  .lp-form .fstars b{color:#1a2320}
  .lp-form input,.lp-form textarea{width:100%;border:1.5px solid #dfe7e2;border-radius:8px;padding:.8rem .9rem;font:inherit;font-size:1rem;background:#F4FAF6;margin-bottom:.7rem}
  .lp-form input:focus,.lp-form textarea:focus{outline:none;border-color:#2B7A42;background:#fff}
  .lp-form textarea{min-height:66px;resize:vertical}
  .lp-form .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
  .lp-form button{width:100%;background:#2B7A42;color:#fff;border:none;border-radius:8px;padding:.95rem;font:inherit;font-weight:800;letter-spacing:.03em;font-size:1.05rem;cursor:pointer;transition:background .2s,transform .12s}
  .lp-form button:hover:not(:disabled){background:#389E57;transform:translateY(-1px)}
  .lp-form button:disabled{opacity:.65;cursor:not-allowed}
  .lp-form .disc{font-size:.72rem;color:#8a979b;margin-top:.6rem;line-height:1.4}
  .lp-form .okmsg{text-align:center;padding:1.5rem .5rem}
  .lp-form .okmsg .b{width:52px;height:52px;border-radius:50%;background:#2B7A42;display:flex;align-items:center;justify-content:center;margin:0 auto .7rem}
  .lp-form .okmsg h3{color:#133624;margin-bottom:.3rem}
  .lp-form .okmsg p{color:#5b6b61;font-size:.92rem}
  .lp-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
  .lp-gallery figure{margin:0;border-radius:12px;overflow:hidden;position:relative;box-shadow:0 6px 20px rgba(0,0,0,.1);aspect-ratio:4/3}
  .lp-gallery img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s}
  .lp-gallery figure:hover img{transform:scale(1.05)}
  .lp-gallery figcaption{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,rgba(13,42,26,.82));color:#fff;font-size:.82rem;padding:1.4rem .8rem .6rem;font-weight:600}
  .lp-reviews{display:grid;grid-template-columns:repeat(2,1fr);gap:1.25rem;max-width:960px;margin:0 auto}
  .lp-review{background:#fff;border:1px solid #e2ebe5;border-radius:12px;padding:1.4rem 1.5rem;box-shadow:0 4px 14px rgba(0,0,0,.05)}
  .lp-review .s{color:#F5B841;letter-spacing:2px;font-size:1rem}
  .lp-review p{margin:.6rem 0 .8rem;color:#33413a;font-size:.98rem;line-height:1.6}
  .lp-review .who{font-weight:800;color:#133624;font-size:.9rem}
  .lp-review .who span{display:block;font-weight:400;color:#8a979b;font-size:.78rem;margin-top:1px}
  .lp-map{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:center}
  .lp-map iframe{width:100%;height:320px;border:0;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.12)}
  @media(max-width:900px){.lp-hero-inner{grid-template-columns:1fr;gap:1.75rem;padding:2rem 1.25rem 2.5rem}
    .lp-gallery{grid-template-columns:repeat(2,1fr)}.lp-reviews{grid-template-columns:1fr}.lp-map{grid-template-columns:1fr}}
`;

const CHECK = `<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5 6.5 11.5 3 8" stroke="#5BBD76" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHECKW = `<svg width="20" height="20" viewBox="0 0 16 16" fill="#fff"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>`;
const PHONE_SVG = `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z"/></svg>`;

const card = (s) => `<a href="${s[1]}" class="service-card"><div class="service-card-img"><img src="${s[2]}" alt="${s[0].replace(/&amp;/g,"and")}" loading="lazy"></div><div class="service-card-body"><h3>${s[0]}</h3><p>${s[3]}</p><span class="service-card-link">Learn More</span></div></a>`;
const galfig = (g) => `<figure><img src="${g[0]}" alt="${g[1]}" loading="lazy"><figcaption>${g[1]}</figcaption></figure>`;
const review = (r) => `<div class="lp-review"><div class="s">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>&ldquo;${r[1]}&rdquo;</p><div class="who">${r[0]}<span>Verified Google Review</span></div></div>`;
const faq = (items) => items.map((f) => `<div class="pillar-faq-item"><p class="pillar-faq-q">${f[0]}</p><p class="pillar-faq-a">${f[1]}</p></div>`).join("");

function page(cfg) {
  const ph = PHONE[cfg.region];
  const svc = cfg.kind === "bathroom" ? BATH : KITCHEN;
  const gmap = `https://www.google.com/maps?q=${encodeURIComponent("Infinity Kitchens and Baths " + cfg.city + " AZ")}&output=embed`;
  const title = `${cfg.city} ${cfg.service} | Free Estimate | Infinity Kitchens and Baths`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${GTAG}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${cfg.metaDesc}">
  <meta name="robots" content="noindex, nofollow">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#1D5535">
  <link rel="canonical" href="https://www.infinitykitchenandbathllc.com/lp/${cfg.slug}/">
  <style>${LP_CSS}</style>
</head>
<body>
${navFor(cfg.region)}

<section class="lp-hero">
  <div class="lp-hero-bg" style="background-image:url('${svc.hero}')"></div>
  <div class="lp-hero-inner">
    <div>
      <span class="eyebrow">${cfg.service} &mdash; ${cfg.city}, AZ</span>
      <h1>${cfg.h1}</h1>
      <p class="lead">${cfg.heroSub}</p>
      <ul>
        ${cfg.bullets.map((b) => `<li>${CHECK}<span>${b}</span></li>`).join("\n        ")}
      </ul>
      <a class="lp-hero-call" href="tel:${ph.raw}">${PHONE_SVG}<span><small>Call for a free estimate</small>${ph.display}</span></a>
    </div>
    <div class="lp-form">
      <h2>Get Your Free Estimate</h2>
      <p class="fsub">We'll call or text you back within one business day.</p>
      <div class="fstars"><span class="s">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <span><b>5.0</b> &middot; 16 Google reviews</span></div>
      <form id="lpForm" novalidate>
        <input type="text" name="name" placeholder="Your Name" required autocomplete="name">
        <input type="tel" name="phone" placeholder="Phone Number" required autocomplete="tel">
        <input type="email" name="email" placeholder="Email (optional)" autocomplete="email">
        <textarea name="project" placeholder="Tell us about your ${cfg.serviceLower} project (optional)"></textarea>
        <input class="hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="submit" id="lpSubmit">Request My Free Estimate</button>
        <p class="disc">By submitting you agree to be contacted by phone, text, or email. Msg &amp; data rates may apply.</p>
      </form>
      <div id="lpOk" class="okmsg" style="display:none"><div class="b">${CHECKW}</div><h3>Request Sent!</h3><p>We'll be in touch within one business day to schedule your free consultation.</p></div>
    </div>
  </div>
</section>

<section class="section" style="padding:2.5rem 0 0;">
  <div class="container"><div style="max-width:920px;margin:0 auto;background:#F4FAF6;border-left:4px solid #2B7A42;border-radius:8px;padding:1.25rem 1.5rem;">
    <p style="margin:0;font-size:1.05rem;line-height:1.75;color:#1F2937;"><strong>Quick answer:</strong> ${cfg.quick}</p>
  </div></div>
</section>

<section class="section">
  <div class="container">
    <div style="max-width:820px;margin:0 auto;">
      <span class="eyebrow">${cfg.city}'s ${cfg.service} Specialists</span>
      <h2>${cfg.introH2}</h2><div class="gold-divider"></div>${cfg.intro}
    </div>
    <h2 style="text-align:center;margin-top:3.5rem;">${cfg.service} Services We Offer in ${cfg.city}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-top:2.5rem;">${svc.services.map(card).join("")}</div>
  </div>
</section>

<section class="section" style="background:var(--green-25,#F4FAF6);">
  <div class="container">
    <div style="text-align:center;margin-bottom:2.5rem;"><span class="eyebrow">Our Work</span><h2>Recent ${cfg.serviceLower} projects</h2><div class="gold-divider" style="margin:1rem auto 0;"></div></div>
    <div class="lp-gallery">${svc.gallery.map(galfig).join("")}</div>
    <div style="text-align:center;margin-top:2.5rem;"><a href="/gallery.html" class="btn btn-outline-dark">View Full Gallery</a></div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div style="text-align:center;margin-bottom:2.5rem;"><span class="eyebrow">Reviews</span><h2>What ${cfg.city}-area homeowners say</h2>
      <p style="color:var(--gray-500,#5b6b61);margin-top:.5rem;"><span style="color:#F5B841;letter-spacing:2px;">&#9733;&#9733;&#9733;&#9733;&#9733;</span> &nbsp;<strong>5.0</strong> from 16 Google reviews</p>
      <div class="gold-divider" style="margin:1rem auto 0;"></div></div>
    <div class="lp-reviews">${REVIEWS.map(review).join("")}</div>
  </div>
</section>

<section class="section" style="background:var(--green-25,#F4FAF6);">
  <div class="container lp-map">
    <div>
      <span class="eyebrow">Serving ${cfg.city} &amp; Nearby</span>
      <h2>Your local ${cfg.serviceLower} team</h2><div class="gold-divider"></div>
      <p style="margin-top:1rem;">We're a licensed Arizona contractor (AZ ROC #339999) serving ${cfg.area}. Family-owned, factory-direct, and 5-star rated. Book a free in-home or showroom consultation.</p>
      <p style="margin-top:1.25rem;"><a href="tel:${ph.raw}" class="btn btn-gold">${PHONE_SVG} Call ${ph.display}</a></p>
    </div>
    <iframe loading="lazy" title="Infinity Kitchens and Baths ${cfg.city}, AZ" src="${gmap}" data-track-map></iframe>
  </div>
</section>

<section class="section" style="background:var(--green-25,#F4FAF6);">
  <div class="container">
    <div style="text-align:center;margin-bottom:2.5rem;"><span class="eyebrow">FAQ</span><h2>${cfg.service} in ${cfg.city} — Common Questions</h2><div class="gold-divider" style="margin:1rem auto 0;"></div></div>
    <div class="pillar-faq" style="max-width:820px;margin:0 auto;">${faq(cfg.faqs)}</div>
  </div>
</section>

<section class="section" style="background:var(--green-800,#0D2A1A);color:#fff;text-align:center;">
  <div class="container">
    <h2 style="color:#fff;">${cfg.ctaHead}</h2>
    <p style="max-width:600px;margin:1rem auto 1.75rem;color:rgba(255,255,255,0.85);">${cfg.ctaSub}</p>
    <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
      <a href="#lpForm" class="btn btn-gold btn-lg" onclick="document.getElementById('lpForm').scrollIntoView({behavior:'smooth'});var n=document.querySelector('#lpForm [name=name]');if(n)n.focus();return false;">Get a Free Estimate</a>
      <a href="tel:${ph.raw}" class="btn btn-outline-light btn-lg">Call ${ph.display}</a>
    </div>
  </div>
</section>
${FOOTER_ABS}
<script>
(function(){
  var f=document.getElementById('lpForm'),ok=document.getElementById('lpOk'),btn=document.getElementById('lpSubmit'),shown=Date.now();
  if(!f)return;
  f.addEventListener('submit',async function(e){
    e.preventDefault();
    var d=Object.fromEntries(new FormData(f)),p=(d.name||'').trim().split(/\\s+/);
    var payload={firstName:p[0]||'',lastName:p.slice(1).join(' ')||'',phone:d.phone||'',email:d.email||'',
      message:d.project||'',service:${JSON.stringify(cfg.service + " — " + cfg.city + " (Ads LP)")},address:'','consult-type':'',company:d.company||'',elapsed:Date.now()-shown};
    var orig=btn.innerHTML;btn.textContent='Sending\\u2026';btn.disabled=true;
    try{
      var res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(res.ok){
        if(typeof gtag!=='undefined')gtag('event','generate_lead',{form_location:'ads_lp_hero',form_id:'lpForm'});
        if(window.dataLayer)dataLayer.push({event:'generate_lead',form_location:'ads_lp_hero',form_id:'lpForm'});
        f.style.display='none';ok.style.display='block';
      }else{btn.textContent='Error \\u2014 please call us';setTimeout(function(){btn.innerHTML=orig;btn.disabled=false;},3500);}
    }catch(x){btn.textContent='Error \\u2014 please call us';setTimeout(function(){btn.innerHTML=orig;btn.disabled=false;},3500);}
  });
})();
</script>
<script src="/js/main.js"></script>
<script src="/js/cookie-consent.js"></script>
<script src="/js/estimate-tab.js"></script>
</body>
</html>`;
}

const CITIES = { avondale: { city: "Avondale", region: "avondale", area: "Avondale and the West Valley" },
                 prescott: { city: "Prescott", region: "prescott", area: "Prescott and the Quad Cities" } };
const PAGES = [];
for (const key of ["avondale", "prescott"]) {
  const c = CITIES[key]; const ph = PHONE[c.region];
  PAGES.push({ slug: `bathroom-remodeling-${key}`, kind: "bathroom", service: "Bathroom Remodeling", serviceLower: "bathroom remodeling", city: c.city, region: c.region, area: c.area,
    metaDesc: `${c.city}, AZ bathroom remodeling — walk-in showers, tub-to-shower conversions, vanities, and tile. Factory-direct, licensed AZ ROC #339999. Free estimate. Call ${ph.display}.`,
    h1: `${c.city} Bathroom Remodeling, Done Right`,
    heroSub: `Walk-in showers, tub-to-shower conversions, custom tile, and full bathroom renovations for ${c.city} homes.`,
    bullets: ["Free in-home estimate, no pressure", "Walk-in showers & tub-to-shower conversions", "Aging-in-place & ADA-friendly designs", "5.0 star Google rating · AZ ROC #339999"],
    quick: `Infinity Kitchens and Baths remodels bathrooms throughout ${c.city}, AZ — walk-in showers, tub-to-shower conversions, groutless shower systems, vanities, tile, and ADA/aging-in-place updates. Family-owned, factory-direct, and licensed (AZ ROC #339999), with a free in-home estimate.`,
    introH2: `Trusted Bathroom Remodeling in ${c.city}, AZ`,
    intro: `<p>From primary-suite upgrades to guest baths, ${c.city} homes are great candidates for a smarter, easier-to-clean bathroom. We convert dated tub/shower combos into sleek walk-in showers, replace builder-grade vanities with real stone tops, and set custom tile that holds up to daily use.</p><p>As a family-owned, factory-direct remodeler running our own crews, we give ${c.city} homeowners one accountable team and honest, fixed quotes — from the first measurement through the final walkthrough.</p>`,
    faqs: [
      [`Do you remodel bathrooms in ${c.city}?`, `Yes — ${c.city} is part of our service area. We handle everything from walk-in showers to full primary-bath renovations. Call ${ph.display} for a free consultation.`],
      ["Can you do a tub-to-shower conversion?", "Yes — it's one of our most requested projects. We remove the old tub, waterproof the area properly, and install a low-threshold or curbless walk-in shower, usually in about a week to ten days."],
      ["Are you licensed and insured?", "Yes. We're a licensed Arizona contractor, AZ ROC #339999, and fully bonded and insured."],
      ["Is the estimate free?", `Yes. We offer a free in-home or showroom consultation with an honest, written estimate and no pressure. Call ${ph.display} to book.`],
    ],
    ctaHead: `Ready to Remodel Your ${c.city} Bathroom?`,
    ctaSub: "Book a free in-home consultation. We'll measure, talk through your ideas, and give you a clear written estimate — no pressure." });
  PAGES.push({ slug: `kitchen-remodeling-${key}`, kind: "kitchen", service: "Kitchen Remodeling", serviceLower: "kitchen remodeling", city: c.city, region: c.region, area: c.area,
    metaDesc: `${c.city}, AZ kitchen remodeling — custom cabinets, countertops, islands, and backsplash. Factory-direct, licensed AZ ROC #339999. Free design consult. Call ${ph.display}.`,
    h1: `${c.city} Kitchen Remodeling That Fits Your Life`,
    heroSub: `Custom cabinets, countertops, islands, and backsplashes for ${c.city} kitchens, installed by our own crews.`,
    bullets: ["Free design consultation, no pressure", "Custom & semi-custom cabinetry", "Quartz & granite countertops", "5.0 star Google rating · AZ ROC #339999"],
    quick: `Infinity Kitchens and Baths remodels kitchens throughout ${c.city}, AZ — custom cabinets, quartz and granite countertops, islands, backsplash and tile, and flooring. Family-owned, factory-direct, and licensed (AZ ROC #339999), with a free design consultation.`,
    introH2: `Trusted Kitchen Remodeling in ${c.city}, AZ`,
    intro: `<p>Whether you want new cabinets and counters or a full gut-and-rebuild, ${c.city} kitchens are where we do our best work. We plan the layout around how you actually cook, then handle cabinets, countertops, backsplash, and flooring with one accountable team.</p><p>As a family-owned, factory-direct remodeler, we give ${c.city} homeowners honest, fixed quotes and real craftsmanship — from design through the final walkthrough.</p>`,
    faqs: [
      [`Do you remodel kitchens in ${c.city}?`, `Yes — ${c.city} is part of our service area. We handle everything from cabinet and counter refreshes to full kitchen remodels. Call ${ph.display} for a free consultation.`],
      ["Do you build custom cabinets?", "Yes. We offer custom and semi-custom cabinetry, countertops, islands, and backsplashes, coordinated by one team from design to install."],
      ["Are you licensed and insured?", "Yes. We're a licensed Arizona contractor, AZ ROC #339999, and fully bonded and insured."],
      ["Is the design consultation free?", `Yes. We plan your layout, materials, and budget at no cost, with an honest written estimate. Call ${ph.display} to book.`],
    ],
    ctaHead: `Ready to Remodel Your ${c.city} Kitchen?`,
    ctaSub: "Book a free design consultation. We'll plan the layout, materials, and budget around how you actually cook — no pressure." });
}

let n = 0;
for (const cfg of PAGES) {
  mkdirSync(`lp/${cfg.slug}`, { recursive: true });
  writeFileSync(`lp/${cfg.slug}/index.html`, page(cfg));
  console.log(`  /lp/${cfg.slug}/  ->  ${PHONE[cfg.region].display}`);
  n++;
}
console.log(`\nGenerated ${n} rich landing pages (hero form + gallery + reviews + map).`);
