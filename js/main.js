/* ============================================
   INFINITY KITCHEN & BATH — MAIN JS
   ============================================ */

// ---- Google Ads conversions (native website actions) ----
// These are separate from the GA4 events below. The GA4 events feed Analytics
// and the (lossy, ~1 day delayed) GA4 conversion import; these fire straight at
// Google Ads so a lead is attributed to the click that paid for it. Defined
// here because main.js loads on every page before estimate-tab.js and before
// any form can be submitted.
window.IKB_ADS = {
  form:  'AW-17095449186/MPiXCPLH-94cEOK039c_',   // Contact Form Lead (site tag)
  phone: 'AW-17095449186/TCeDCPXH-94cEOK039c_',   // Phone Click (site tag)
};
window.ikbAdsConv = function (kind, cb) {
  const sendTo = window.IKB_ADS[kind];
  if (typeof gtag === 'undefined' || !sendTo) { if (cb) cb(); return; }
  // event_callback can silently never fire (blocked tag, consent denied), so a
  // timeout guarantees the caller is never left hanging on a navigation.
  let done = false;
  const go = () => { if (done) return; done = true; if (cb) cb(); };
  gtag('event', 'conversion', {
    send_to: sendTo, value: 1.0, currency: 'USD', event_callback: go,
  });
  setTimeout(go, 1200);
};

// ---- Navbar scroll behavior ----
const navbar = document.getElementById('navbar');
function handleNavScroll() {
  if (!navbar) return;
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
    navbar.classList.remove('transparent');
  } else {
    navbar.classList.remove('scrolled');
    navbar.classList.add('transparent');
  }
}
if (navbar) {
  const isHero = document.querySelector('.hero');
  if (isHero) {
    navbar.classList.add('transparent');
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  } else {
    navbar.classList.add('scrolled');
  }
}

// ---- Mobile nav toggle ----
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (mobileNav.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

// ---- Intersection Observer for animations ----
const animEls = document.querySelectorAll('.fade-up, .fade-in');
if (animEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  animEls.forEach(el => observer.observe(el));
}

// ---- Gallery filters ----
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item[data-category]');
if (filterBtns.length && galleryItems.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      galleryItems.forEach(item => {
        if (cat === 'all' || item.dataset.category === cat) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// ---- Lightbox ----
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
if (lightbox) {
  document.querySelectorAll('.gallery-item[data-src]').forEach(item => {
    item.addEventListener('click', () => {
      lightboxImg.src = item.dataset.src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

// ---- Contact form ----
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  // Timestamp when the form loaded — lets the server reject instant bot submits.
  const contactShownAt = Date.now();
  // Live region (role="status"). Relabelling the disabled submit button is not
  // announced by screen readers, so without this a lead could be sent — or
  // fail — with no feedback at all for a non-sighted visitor.
  const contactStatus = document.getElementById('contactStatus');
  const setStatus = (msg, kind) => {
    if (!contactStatus) return;
    contactStatus.textContent = msg;
    contactStatus.className = kind ? `form-status is-${kind}` : 'form-status';
  };
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setStatus('Sending your request…');

    try {
      const payload = Object.fromEntries(new FormData(contactForm));
      payload.elapsed = Date.now() - contactShownAt;
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        // GA4 lead conversion
        if (typeof gtag !== 'undefined') {
          gtag('event', 'generate_lead', { form_location: 'contact_page', form_id: 'contactForm' });
        }
        window.ikbAdsConv('form');
        if (window.dataLayer) {
          window.dataLayer.push({ event: 'generate_lead', form_location: 'contact_page', form_id: 'contactForm' });
        }
        btn.textContent = 'Request Sent!';
        setStatus(
          'Thank you — your request has been sent. We will call you to schedule your free in-home consult.',
          'success'
        );
        contactForm.reset();
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
      } else {
        btn.textContent = 'Something went wrong — please call us';
        setStatus(
          'Sorry, your request could not be sent. Please call us at (928) 800-1998.',
          'error'
        );
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
      }
    } catch {
      btn.textContent = 'Something went wrong — please call us';
      setStatus(
        'Sorry, your request could not be sent. Please call us at (928) 800-1998.',
        'error'
      );
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
    }
  });
}

// ---- Contact click tracking (delegated) ----
// Delegated at the document level so it also covers links injected after load
// (e.g. the estimate-tab.js mobile call bar and slide-in panel), plus email
// and map/directions clicks. Fires GA4 events + GTM dataLayer pushes.
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href') || '';

  let event, params, dl;
  if (href.startsWith('tel:')) {
    const number = href.replace('tel:', '');
    event = 'phone_call_click';
    params = { event_category: 'Contact', event_label: number };
    dl = { event: 'phone_call_click', phone_number: number };
  } else if (href.startsWith('mailto:')) {
    const addr = href.replace('mailto:', '').split('?')[0];
    event = 'email_click';
    params = { event_category: 'Contact', event_label: addr };
    dl = { event: 'email_click', email: addr };
  } else if (/google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|\/maps\//.test(href) || link.hasAttribute('data-track-map')) {
    event = 'directions_click';
    params = { event_category: 'Contact', event_label: href };
    dl = { event: 'directions_click', map_url: href };
  } else {
    return;
  }

  if (typeof gtag !== 'undefined') gtag('event', event, params);
  if (window.dataLayer) window.dataLayer.push(dl);
  // tel: navigation is not prevented here — the dialer opens over the page, so
  // the beacon still goes out. Only phone clicks are an Ads conversion.
  if (event === 'phone_call_click') window.ikbAdsConv('phone');
});

// ---- Smooth anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // preventDefault also cancels the browser's focus move, which would break
      // the skip link entirely: the page would scroll but focus would stay on
      // the link, so the next Tab drops the visitor right back into the nav.
      // Anything given tabindex="-1" as a jump target (e.g. <main id="main">)
      // takes focus explicitly here.
      if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
    }
  });
});

// ---- 15th-anniversary promo (15 years / 15% off) ----
// Click on the top bar → GA4 event, then land on contact.html?promo=15for15
// where we confirm the offer and tag the lead so it's identifiable in email.
const promoBar = document.getElementById('promoBar');
if (promoBar) {
  promoBar.addEventListener('click', () => {
    const params = { promo_id: '15for15', promo_name: '15 Years / 15% Off' };
    if (typeof gtag !== 'undefined') gtag('event', 'select_promotion', params);
    if (window.dataLayer) window.dataLayer.push({ event: 'select_promotion', ...params });
  });
}

if (new URLSearchParams(location.search).get('promo') === '15for15') {
  const form = document.getElementById('contactForm');
  if (form) {
    // Preselect the in-home consult — that's the visit we want to book.
    const consult = form.querySelector('#consult-type');
    if (consult && !consult.value) consult.value = 'in-home';

    // Tag the message so the 15% request travels with the lead email.
    const message = form.querySelector('#message');
    const tag = "I'd like to claim the 15% anniversary discount.";
    if (message && !message.value.includes(tag)) {
      message.value = message.value ? `${message.value}\n\n${tag}` : `${tag}\n\n`;
    }

    const ribbon = document.createElement('div');
    ribbon.className = 'promo-claimed';
    ribbon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">' +
      '<path d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.97-10.03a.75.75 0 00-1.08-1.04L7.477 9.417 5.384 7.323a.75.75 0 00-1.06 1.06l2.646 2.647a.75.75 0 001.079-.02l3.992-4.99z"/></svg>' +
      "<div><strong>15% anniversary discount applied to your request</strong>" +
      "<p>Finish the form below and we'll confirm your free in-home consultation — we come to you, measure, and price the job with the 15% already taken off.</p></div>";
    form.parentNode.insertBefore(ribbon, form);

    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_promotion', { promo_id: '15for15', promo_name: '15 Years / 15% Off' });
    }
  }
}
