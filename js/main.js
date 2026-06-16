/* ============================================
   INFINITY KITCHEN & BATH — MAIN JS
   ============================================ */

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
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
      });
      if (res.ok) {
        btn.textContent = 'Request Sent!';
        contactForm.reset();
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
      } else {
        btn.textContent = 'Something went wrong — please call us';
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
      }
    } catch {
      btn.textContent = 'Something went wrong — please call us';
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
    }
  });
}

// ---- Smooth anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
