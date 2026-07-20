// Generates chrome-free, noindex PPC landing pages for the Google Ads campaigns.
// One template, one config per page. Reuses the site's green brand + gtag setup,
// fires generate_lead (form) + phone_call_click (tel:) exactly like the rest of
// the site. Output: lp/<slug>/index.html  ->  /lp/<slug>/
import { mkdirSync, writeFileSync } from "node:fs";

const BRAND = "Infinity Kitchens and Baths";
const ROC = "AZ ROC #339999";
const HOURS = "Mon–Fri 7am–6pm · Sat by appointment";
const REVIEWS = { rating: "5.0", count: 16 };

// Region-matched phone numbers (match the verified GBPs + the site's own logic).
const PHONE = {
  avondale: { raw: "6028856998", display: "(602) 885-6998" },
  prescott: { raw: "9288001998", display: "(928) 800-1998" },
};

const GTAG = `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-EK9HSW7F90"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'granted'});
    gtag('consent', 'default', {'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','region':['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH']});
    try{var _ikbc=localStorage.getItem('ikb_consent');if(_ikbc==='granted'||_ikbc==='denied'){gtag('consent','update',{'analytics_storage':_ikbc});}}catch(e){}
    gtag('js', new Date());
    gtag('config', 'G-EK9HSW7F90');
  </script>`;

const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--g900:#071A10;--g700:#133624;--g600:#1D5535;--g500:#2B7A42;--g400:#389E57;
    --cream:#F4FAF6;--gold:#F5B841;--ink:#12251A;--gray:#5B6B61;--line:#e2ebe5;--white:#fff}
  html{scroll-behavior:smooth;overflow-x:hidden}
  body{font-family:Arial,Helvetica,sans-serif;color:var(--ink);background:var(--white);line-height:1.6;font-size:17px;overflow-x:hidden;max-width:100vw}
  .eyebrow{overflow-wrap:anywhere}
  img{max-width:100%;display:block}
  a{color:inherit}
  .wrap{max-width:1120px;margin:0 auto;padding:0 20px}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;background:var(--g500);color:#fff;
    font-weight:700;letter-spacing:.03em;text-decoration:none;border:none;border-radius:8px;padding:15px 26px;
    font-size:1.05rem;cursor:pointer;transition:background .2s,transform .15s;font-family:inherit}
  .btn:hover{background:var(--g400);transform:translateY(-1px)}
  .btn-lg{padding:18px 30px;font-size:1.15rem;width:100%}
  /* HERO */
  .hero{background:linear-gradient(160deg,var(--g700),var(--g900));color:#fff;padding:34px 0 54px}
  .hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:44px;align-items:start}
  .eyebrow{font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:14px}
  h1{font-size:clamp(2rem,4.6vw,3.05rem);line-height:1.1;font-weight:800;letter-spacing:-.01em;text-wrap:balance}
  h1 span{color:var(--g300,#5BBD76)}
  .hero p.lead{font-size:1.16rem;color:rgba(255,255,255,.88);margin:18px 0 22px;max-width:36ch}
  .hero-bullets{list-style:none;display:flex;flex-direction:column;gap:11px;margin-bottom:26px}
  .hero-bullets li{display:flex;gap:11px;align-items:flex-start;font-size:1.05rem;color:rgba(255,255,255,.92)}
  .hero-bullets svg{flex:none;margin-top:3px}
  .hero-call{display:inline-flex;align-items:center;gap:9px;color:#fff;text-decoration:none;font-weight:700;font-size:1.25rem}
  .hero-call small{display:block;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.6);font-weight:600}
  /* FORM CARD */
  .card{background:#fff;border-radius:16px;padding:26px 24px 22px;box-shadow:0 24px 60px rgba(0,0,0,.28);color:var(--ink)}
  .card h2{font-size:1.35rem;font-weight:800;line-height:1.15}
  .card .sub{font-size:.92rem;color:var(--gray);margin:5px 0 14px}
  .stars{display:flex;align-items:center;gap:8px;margin-bottom:16px;font-size:.9rem;color:var(--gray)}
  .stars b{color:var(--ink)} .stars .i{color:var(--gold);letter-spacing:1px}
  .field{width:100%;border:1.5px solid var(--line);border-radius:8px;padding:13px 14px;font-size:1rem;
    font-family:inherit;margin-bottom:11px;background:var(--cream);transition:border-color .2s}
  .field:focus{outline:none;border-color:var(--g500);background:#fff}
  textarea.field{resize:vertical;min-height:74px}
  .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
  .disc{font-size:.74rem;color:var(--gray);margin-top:10px;line-height:1.45}
  .ok{text-align:center;padding:26px 8px}
  .ok-badge{width:56px;height:56px;border-radius:50%;background:var(--g500);display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
  .ok h3{font-size:1.2rem;margin-bottom:6px} .ok p{color:var(--gray);font-size:.95rem}
  /* TRUST BAR */
  .trust{background:var(--cream);border-bottom:1px solid var(--line)}
  .trust .wrap{display:flex;flex-wrap:wrap;gap:14px 34px;justify-content:center;padding:16px 20px}
  .trust span{display:flex;align-items:center;gap:8px;font-size:.94rem;font-weight:600;color:var(--g600)}
  /* SECTIONS */
  section.pad{padding:56px 0}
  .kicker{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--g500);font-weight:700;margin-bottom:10px}
  h2.title{font-size:clamp(1.5rem,3vw,2.1rem);font-weight:800;line-height:1.15;letter-spacing:-.01em;text-wrap:balance;margin-bottom:8px}
  .muted{color:var(--gray);max-width:60ch;margin-bottom:26px}
  .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .svc{border:1px solid var(--line);border-radius:12px;padding:22px;background:#fff}
  .svc h3{font-size:1.12rem;margin-bottom:6px;color:var(--g600)}
  .svc p{font-size:.96rem;color:var(--gray)}
  .why{display:grid;grid-template-columns:repeat(2,1fr);gap:16px 30px}
  .why-item{display:flex;gap:13px;align-items:flex-start}
  .why-item .ic{flex:none;width:38px;height:38px;border-radius:9px;background:var(--g500);display:flex;align-items:center;justify-content:center}
  .why-item h3{font-size:1.05rem;margin-bottom:3px}
  .why-item p{font-size:.95rem;color:var(--gray)}
  .local{display:grid;grid-template-columns:1fr 1fr;gap:34px;align-items:center}
  .local iframe{width:100%;height:320px;border:0;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.12)}
  .faq details{border:1px solid var(--line);border-radius:10px;padding:2px 18px;margin-bottom:10px;background:#fff}
  .faq summary{font-weight:700;padding:15px 0;cursor:pointer;list-style:none;font-size:1.05rem}
  .faq summary::-webkit-details-marker{display:none}
  .faq summary::after{content:"+";float:right;color:var(--g500);font-weight:700}
  .faq details[open] summary::after{content:"\\2013"}
  .faq p{padding:0 0 16px;color:var(--gray)}
  .cta{background:linear-gradient(160deg,var(--g600),var(--g900));color:#fff;text-align:center;padding:56px 0}
  .cta h2{font-size:clamp(1.6rem,3.4vw,2.3rem);font-weight:800;margin-bottom:12px;text-wrap:balance}
  .cta p{color:rgba(255,255,255,.85);max-width:50ch;margin:0 auto 24px}
  .cta .row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
  .cta .btn-ghost{background:transparent;border:1.5px solid rgba(255,255,255,.5)}
  footer{background:var(--g900);color:rgba(255,255,255,.7);font-size:.9rem;padding:26px 0}
  footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px}
  footer b{color:#fff}
  @media(max-width:860px){.hero-grid{grid-template-columns:1fr;gap:28px}.grid3{grid-template-columns:1fr}
    .why{grid-template-columns:1fr}.local{grid-template-columns:1fr}.hero p.lead{max-width:none}}
`;

const CHECK = `<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5 6.5 11.5 3 8" stroke="#5BBD76" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHECKW = `<svg width="19" height="19" viewBox="0 0 16 16" fill="#fff"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>`;
const PHONE_SVG = `<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z"/></svg>`;

function svc(title, body) { return `<div class="svc"><h3>${title}</h3><p>${body}</p></div>`; }
function why(title, body) { return `<div class="why-item"><span class="ic">${CHECKW}</span><div><h3>${title}</h3><p>${body}</p></div></div>`; }
function faqItem(q, a) { return `<details><summary>${q}</summary><p>${a}</p></details>`; }

function page(cfg) {
  const ph = PHONE[cfg.region];
  const title = `${cfg.city} ${cfg.service} | ${BRAND} | ${ph.display}`;
  const gmap = `https://www.google.com/maps?q=${encodeURIComponent(BRAND + " " + cfg.city + " AZ")}&output=embed`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${cfg.metaDesc}">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#1D5535">
  <link rel="canonical" href="https://www.infinitykitchenandbathllc.com/lp/${cfg.slug}/">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
${GTAG}
  <style>${CSS}</style>
</head>
<body>
  <header class="hero">
    <div class="wrap hero-grid">
      <div>
        <p class="eyebrow">${cfg.eyebrow}</p>
        <h1>${cfg.h1a} <span>${cfg.h1b}</span></h1>
        <p class="lead">${cfg.lead}</p>
        <ul class="hero-bullets">
          ${cfg.bullets.map((b) => `<li>${CHECK}<span>${b}</span></li>`).join("\n          ")}
        </ul>
        <a class="hero-call" href="tel:${ph.raw}">${PHONE_SVG}<span><small>Call for a free estimate</small>${ph.display}</span></a>
      </div>
      <div class="card">
        <h2>Get Your Free Estimate</h2>
        <p class="sub">We'll call or text you back within one business day.</p>
        <div class="stars"><span class="i">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <span><b>${REVIEWS.rating}</b> &middot; ${REVIEWS.count} Google reviews</span></div>
        <form id="lpForm" novalidate>
          <input class="field" type="text"  name="name"  placeholder="Your Name" required autocomplete="name">
          <input class="field" type="tel"   name="phone" placeholder="Phone Number" required autocomplete="tel">
          <input class="field" type="email" name="email" placeholder="Email (optional)" autocomplete="email">
          <textarea class="field" name="project" placeholder="Tell us about your ${cfg.serviceLower} project (optional)"></textarea>
          <input class="hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button class="btn btn-lg" type="submit" id="lpSubmit">Request My Free Estimate</button>
          <p class="disc">By submitting you agree to be contacted by phone, text, or email. Msg &amp; data rates may apply.</p>
        </form>
        <div id="lpOk" class="ok" style="display:none">
          <div class="ok-badge">${CHECKW}</div>
          <h3>Request Sent!</h3>
          <p>We'll be in touch within one business day to schedule your free consultation.</p>
        </div>
      </div>
    </div>
  </header>

  <div class="trust"><div class="wrap">
    <span>${CHECK} ${ROC}</span>
    <span>${CHECK} Licensed, Bonded &amp; Insured</span>
    <span>${CHECK} Factory-Direct Pricing</span>
    <span>${CHECK} Free In-Home Estimate</span>
  </div></div>

  <section class="pad"><div class="wrap">
    <p class="kicker">What We Do in ${cfg.city}</p>
    <h2 class="title">${cfg.servicesTitle}</h2>
    <p class="muted">${cfg.servicesIntro}</p>
    <div class="grid3">${cfg.services.map((s) => svc(s[0], s[1])).join("")}</div>
  </div></section>

  <section class="pad" style="background:var(--cream)"><div class="wrap">
    <p class="kicker">Why ${cfg.city} Homeowners Choose Us</p>
    <h2 class="title">A remodel you can trust, start to finish</h2>
    <div class="why" style="margin-top:22px">${cfg.why.map((w) => why(w[0], w[1])).join("")}</div>
  </div></section>

  <section class="pad"><div class="wrap local">
    <div>
      <p class="kicker">Serving ${cfg.city} &amp; Nearby</p>
      <h2 class="title">Your local ${cfg.serviceLower} team</h2>
      <p class="muted">We're a licensed Arizona contractor (${ROC}) serving ${cfg.area}. Read our reviews and see our work on our Google Business Profile, then book a free in-home or showroom consultation.</p>
      <p style="margin-bottom:18px"><span class="i" style="color:var(--gold)">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <b>${REVIEWS.rating}</b> &middot; ${REVIEWS.count} Google reviews</p>
      <a class="btn" href="tel:${ph.raw}">${PHONE_SVG} Call ${ph.display}</a>
    </div>
    <iframe loading="lazy" title="${BRAND} ${cfg.city}, AZ" src="${gmap}" data-track-map></iframe>
  </div></section>

  <section class="pad faq" style="background:var(--cream)"><div class="wrap" style="max-width:820px">
    <p class="kicker">Questions</p>
    <h2 class="title" style="margin-bottom:22px">${cfg.city} ${cfg.serviceLower} FAQs</h2>
    ${cfg.faqs.map((f) => faqItem(f[0], f[1])).join("\n    ")}
  </div></section>

  <section class="cta"><div class="wrap">
    <h2>${cfg.ctaHead}</h2>
    <p>${cfg.ctaSub}</p>
    <div class="row">
      <a class="btn" href="#lpForm" onclick="document.getElementById('lpForm').scrollIntoView({behavior:'smooth'});document.querySelector('#lpForm [name=name]').focus();return false;">Get My Free Estimate</a>
      <a class="btn btn-ghost" href="tel:${ph.raw}">${PHONE_SVG} ${ph.display}</a>
    </div>
  </div></section>

  <footer><div class="wrap">
    <span><b>${BRAND}</b> &middot; ${ROC}</span>
    <span>${cfg.city}, AZ &middot; <a href="tel:${ph.raw}"><b>${ph.display}</b></a> &middot; ${HOURS}</span>
  </div></footer>

  <script>
  (function(){
    // Phone/email/map click conversions (mirrors the main site's tracking).
    document.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href]'); if(!a) return;
      var h=a.getAttribute('href')||'';
      if(h.indexOf('tel:')===0){var n=h.slice(4);
        if(typeof gtag!=='undefined')gtag('event','phone_call_click',{event_category:'Contact',event_label:n});
        if(window.dataLayer)dataLayer.push({event:'phone_call_click',phone_number:n});
      }else if(a.hasAttribute('data-track-map')){
        if(typeof gtag!=='undefined')gtag('event','directions_click',{event_category:'Contact',event_label:h});
      }
    });
    // Lead form -> /api/contact -> generate_lead
    var f=document.getElementById('lpForm'),ok=document.getElementById('lpOk'),
        btn=document.getElementById('lpSubmit'),shown=Date.now();
    f.addEventListener('submit',async function(e){
      e.preventDefault();
      var d=Object.fromEntries(new FormData(f)),p=(d.name||'').trim().split(/\\s+/);
      var payload={firstName:p[0]||'',lastName:p.slice(1).join(' ')||'',phone:d.phone||'',
        email:d.email||'',message:d.project||'',service:${JSON.stringify(cfg.service + " — " + cfg.city + " (Ads LP)")},
        address:'','consult-type':'',company:d.company||'',elapsed:Date.now()-shown};
      var orig=btn.innerHTML; btn.textContent='Sending\\u2026'; btn.disabled=true;
      try{
        var res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        if(res.ok){
          if(typeof gtag!=='undefined')gtag('event','generate_lead',{form_location:'ads_lp',form_id:'lpForm'});
          if(window.dataLayer)dataLayer.push({event:'generate_lead',form_location:'ads_lp',form_id:'lpForm'});
          f.style.display='none'; ok.style.display='block';
        }else{btn.textContent='Error \\u2014 please call us';setTimeout(function(){btn.innerHTML=orig;btn.disabled=false;},3500);}
      }catch(x){btn.textContent='Error \\u2014 please call us';setTimeout(function(){btn.innerHTML=orig;btn.disabled=false;},3500);}
    });
  })();
  </script>
</body>
</html>`;
}

// ---- per-page content ----
const BATH_SERVICES = [
  ["Walk-In &amp; Curbless Showers", "Low- and no-threshold showers with frameless glass, built for safety and style."],
  ["Tub-to-Shower Conversions", "Swap a hard-to-use tub for a spacious, easy-access shower, often in days."],
  ["Vanities &amp; Countertops", "Custom vanities with quartz or granite tops sized to your space."],
  ["Tile &amp; Flooring", "Durable, water-smart tile and flooring in finishes that fit your home."],
  ["Aging-in-Place &amp; ADA", "Grab bars, comfort-height fixtures, and barrier-free layouts done right."],
  ["Full Bathroom Remodels", "Complete guest, hall, and primary bath remodels managed end to end."],
];
const BATH_WHY = [
  ["Factory-Direct Pricing", "We buy direct and pass the savings on, so you get quality without the middleman markup."],
  ["Licensed Arizona Contractor", "Fully licensed, bonded, and insured under AZ ROC #339999. No surprises, no shortcuts."],
  ["5.0 Across 16 Reviews", "Homeowners rate us a perfect 5.0 on Google for craftsmanship and communication."],
  ["Free In-Home Consultation", "We measure, listen, and give you a clear, honest estimate at no cost."],
];
const KITCHEN_SERVICES = [
  ["Custom &amp; Semi-Custom Cabinets", "Cabinetry built and finished to fit your kitchen and your budget."],
  ["Countertops", "Quartz, granite, and solid-surface tops fabricated and installed to last."],
  ["Kitchen Islands", "Add prep space, storage, and seating with an island designed around how you cook."],
  ["Backsplash &amp; Tile", "Statement backsplashes and tile in the finishes that tie your kitchen together."],
  ["Lighting &amp; Fixtures", "Layered lighting, sinks, and fixtures for a kitchen that works and shines."],
  ["Full Kitchen Remodels", "From refresh to full gut-and-rebuild, managed by one accountable team."],
];
const KITCHEN_WHY = [
  ["Factory-Direct Pricing", "We buy direct and pass the savings on, so you get quality cabinets without the middleman markup."],
  ["Licensed Arizona Contractor", "Fully licensed, bonded, and insured under AZ ROC #339999. No surprises, no shortcuts."],
  ["5.0 Across 16 Reviews", "Homeowners rate us a perfect 5.0 on Google for craftsmanship and communication."],
  ["Free Design Consultation", "We plan the layout, materials, and budget with you at no cost."],
];
function bathFaqs(city, ph) {
  return [
    ["How long does a bathroom remodel take?", `Most ${city} bathroom remodels take one to three weeks depending on scope. A tub-to-shower conversion can be much faster. We'll give you a clear timeline at your free estimate.`],
    ["Do you do walk-in showers and tub-to-shower conversions?", "Yes. Accessible walk-in and curbless showers and tub-to-shower conversions are among our most requested projects, including aging-in-place and ADA-friendly designs."],
    ["Are you licensed and insured?", `Yes. We're a licensed Arizona contractor, ${ROC}, and fully bonded and insured.`],
    ["Is the estimate really free?", `Yes. We offer a free in-home or showroom consultation with an honest, itemized estimate and no pressure. Call ${ph.display} to book.`],
    ["Do you serve my area?", `We proudly serve ${city} and the surrounding communities. If you're nearby, give us a call and we'll confirm.`],
  ];
}
function kitchenFaqs(city, ph) {
  return [
    ["How long does a kitchen remodel take?", `Most ${city} kitchen remodels run three to six weeks depending on scope and materials. We'll walk you through a realistic timeline at your free consultation.`],
    ["Do you build custom cabinets?", "Yes. We offer custom and semi-custom cabinetry, countertops, islands, and backsplashes, coordinated by one team from design to install."],
    ["Are you licensed and insured?", `Yes. We're a licensed Arizona contractor, ${ROC}, and fully bonded and insured.`],
    ["Is the design consultation free?", `Yes. We plan your layout, materials, and budget at no cost, with an honest estimate. Call ${ph.display} to book.`],
    ["Do you serve my area?", `We proudly serve ${city} and the surrounding communities. Give us a call and we'll confirm we cover your neighborhood.`],
  ];
}

const CITIES = {
  avondale: { city: "Avondale", region: "avondale", area: "Avondale and the West Valley" },
  prescott: { city: "Prescott", region: "prescott", area: "Prescott and the Quad Cities" },
};

const PAGES = [];
for (const key of ["avondale", "prescott"]) {
  const c = CITIES[key];
  const ph = PHONE[c.region];
  // Bathroom
  PAGES.push({
    slug: `bathroom-remodeling-${key}`, service: "Bathroom Remodeling", serviceLower: "bathroom remodeling",
    city: c.city, region: c.region, area: c.area,
    metaDesc: `${c.city}, AZ bathroom remodeling — walk-in showers, tub-to-shower conversions, vanities, and tile. Factory-direct, licensed (${ROC}). Free estimate. Call ${ph.display}.`,
    eyebrow: `${c.city} & West Valley Bathroom Remodeling`.replace("West Valley", key === "prescott" ? "Yavapai County" : "West Valley"),
    h1a: `${c.city} Bathroom Remodeling,`, h1b: "Done Right",
    lead: `Walk-in showers, tub-to-shower conversions, vanities, and tile, installed by a licensed Arizona team at factory-direct prices.`,
    bullets: ["Free in-home estimate, no pressure", "Walk-in showers & tub-to-shower conversions", "Aging-in-place & ADA-friendly designs", `Licensed Arizona contractor (${ROC})`],
    servicesTitle: "Bathroom remodeling, done by one accountable team",
    servicesIntro: `From a single walk-in shower to a full primary bath, we handle every ${c.city} bathroom project start to finish.`,
    services: BATH_SERVICES, why: BATH_WHY, faqs: bathFaqs(c.city, ph),
    ctaHead: `Ready to remodel your ${c.city} bathroom?`,
    ctaSub: "Book your free in-home estimate today. We'll listen to your goals, measure, and give you an honest price.",
  });
  // Kitchen
  PAGES.push({
    slug: `kitchen-remodeling-${key}`, service: "Kitchen Remodeling", serviceLower: "kitchen remodeling",
    city: c.city, region: c.region, area: c.area,
    metaDesc: `${c.city}, AZ kitchen remodeling — custom cabinets, countertops, islands, and backsplash. Factory-direct, licensed (${ROC}). Free design consult. Call ${ph.display}.`,
    eyebrow: `${c.city} Kitchen Remodeling`,
    h1a: `${c.city} Kitchen Remodeling`, h1b: "That Fits Your Life",
    lead: `Custom cabinets, countertops, islands, and backsplashes, designed and installed by a licensed Arizona team at factory-direct prices.`,
    bullets: ["Free design consultation, no pressure", "Custom & semi-custom cabinetry", "Quartz & granite countertops", `Licensed Arizona contractor (${ROC})`],
    servicesTitle: "Kitchen remodeling, coordinated by one team",
    servicesIntro: `From new cabinets and counters to a full gut-and-rebuild, we manage every ${c.city} kitchen project end to end.`,
    services: KITCHEN_SERVICES, why: KITCHEN_WHY, faqs: kitchenFaqs(c.city, ph),
    ctaHead: `Ready to remodel your ${c.city} kitchen?`,
    ctaSub: "Book your free design consultation today. We'll plan the layout, materials, and budget around how you actually cook.",
  });
}

let n = 0;
for (const cfg of PAGES) {
  mkdirSync(`lp/${cfg.slug}`, { recursive: true });
  writeFileSync(`lp/${cfg.slug}/index.html`, page(cfg));
  console.log(`  /lp/${cfg.slug}/  ->  ${PHONE[cfg.region].display}`);
  n++;
}
console.log(`\nGenerated ${n} landing pages.`);
