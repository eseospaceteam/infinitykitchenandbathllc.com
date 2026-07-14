(function () {
  const CSS = `
    .ikb-tab {
      position: fixed;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      writing-mode: vertical-rl;
      background: #1B4332;
      color: #fff;
      border: none;
      padding: 18px 11px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
      z-index: 1200;
      border-radius: 0 7px 7px 0;
      box-shadow: 3px 0 12px rgba(0,0,0,0.22);
      transition: background 0.2s;
      font-family: Arial, Helvetica, sans-serif;
    }
    .ikb-tab:hover { background: #2B7A42; }

    /* ── Mobile sticky bottom bar ── */
    .ikb-mobile-bar {
      display: none;
    }
    @media (max-width: 767px) {
      .ikb-tab { display: none; }
      .ikb-mobile-bar {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 58px;
        z-index: 1200;
        box-shadow: 0 -2px 16px rgba(0,0,0,0.18);
      }
      .ikb-mobile-call,
      .ikb-mobile-estimate {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        font-size: 0.92rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-decoration: none;
        color: #fff;
        border: none;
        cursor: pointer;
        font-family: Arial, Helvetica, sans-serif;
        transition: filter 0.15s;
      }
      .ikb-mobile-call { background: #1B4332; }
      .ikb-mobile-call:hover { filter: brightness(1.15); }
      .ikb-mobile-estimate { background: #2B7A42; }
      .ikb-mobile-estimate:hover { filter: brightness(1.15); }
      body { padding-bottom: 58px; }
    }

    .ikb-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.52);
      z-index: 1201;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }
    .ikb-overlay.ikb-open {
      opacity: 1;
      pointer-events: all;
    }

    .ikb-panel {
      position: fixed;
      left: 0;
      top: 0;
      height: 100%;
      width: 360px;
      max-width: 100vw;
      transform: translateX(-100%);
      background: #1B4332;
      color: #fff;
      z-index: 1202;
      overflow-y: auto;
      transition: transform 0.32s cubic-bezier(0.4,0,0.2,1);
      padding: 2rem 1.75rem 2.5rem;
      box-shadow: 4px 0 32px rgba(0,0,0,0.35);
      font-family: Arial, Helvetica, sans-serif;
    }
    .ikb-panel.ikb-open { transform: translateX(0); }

    .ikb-panel-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255,255,255,0.12);
      border: none;
      color: #fff;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      font-size: 1.2rem;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .ikb-panel-close:hover { background: rgba(255,255,255,0.25); }

    .ikb-panel h3 {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      margin: 0.5rem 0 0.3rem;
      color: #fff;
      line-height: 1.2;
    }
    .ikb-panel .ikb-sub {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.7);
      margin-bottom: 1rem;
    }
    .ikb-stars {
      font-size: 0.85rem;
      margin: 0 0 1.4rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .ikb-stars-icons { color: #F5B841; letter-spacing: 1px; font-size: 0.95rem; }
    .ikb-stars-txt { color: rgba(255,255,255,0.72); }
    .ikb-stars-txt strong { color: #fff; }

    .ikb-field {
      width: 100%;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 6px;
      padding: 0.75rem 1rem;
      color: #fff;
      font-size: 0.9rem;
      font-family: inherit;
      margin-bottom: 0.75rem;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
      box-sizing: border-box;
    }
    .ikb-field::placeholder { color: rgba(255,255,255,0.45); }
    .ikb-field:focus {
      border-color: rgba(255,255,255,0.55);
      background: rgba(255,255,255,0.15);
    }
    textarea.ikb-field { resize: vertical; min-height: 80px; }

    .ikb-btn {
      width: 100%;
      background: #2B7A42;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 0.9rem 1rem;
      font-size: 0.88rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s, transform 0.15s;
      font-family: inherit;
      margin-top: 0.25rem;
    }
    .ikb-btn:hover:not(:disabled) { background: #389E57; transform: translateY(-1px); }
    .ikb-btn:disabled { opacity: 0.65; cursor: not-allowed; }

    .ikb-disclaimer {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.5);
      margin-top: 0.85rem;
      line-height: 1.5;
    }

    .ikb-call {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.15);
      font-size: 0.88rem;
      color: rgba(255,255,255,0.75);
    }
    .ikb-call a { color: #fff; font-weight: 700; text-decoration: none; }
    .ikb-call a:hover { text-decoration: underline; }

    .ikb-trust {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255,255,255,0.15);
    }
    .ikb-trust-label {
      font-size: 0.68rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
      margin-bottom: 0.75rem;
    }
    .ikb-trust-item {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 0.83rem;
      color: rgba(255,255,255,0.82);
      margin-bottom: 0.6rem;
      line-height: 1.4;
    }
    .ikb-trust-item svg { flex-shrink: 0; margin-top: 1px; }

    .ikb-success {
      text-align: center;
      padding: 2rem 0;
    }
    .ikb-success-icon {
      width: 56px;
      height: 56px;
      background: rgba(255,255,255,0.12);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }
    .ikb-success h4 {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      color: #fff;
    }
    .ikb-success p {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.7);
      margin: 0;
    }

    @media (max-width: 480px) {
      .ikb-panel { width: 100vw; }
    }
  `;

  const SHIELD = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="rgba(255,255,255,0.6)" viewBox="0 0 16 16"><path d="M8 1a.5.5 0 0 1 .374.168l6 6.5A.5.5 0 0 1 14.5 8H14v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8h-.5a.5.5 0 0 1-.374-.832l6-6.5A.5.5 0 0 1 8 1zm0 1.847L3.181 8H4v4h8V8h.819L8 2.847z"/><path d="M8 3.5a.5.5 0 0 1 .5.5v3.5H8V4a.5.5 0 0 1 .5-.5z"/></svg>`;
  const CHECKSHIELD = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="rgba(255,255,255,0.6)" viewBox="0 0 16 16"><path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/><path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/></svg>`;
  const CLOCK = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="rgba(255,255,255,0.6)" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>`;
  const PHONE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/></svg>`;
  const SEND_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/></svg>`;

  // Detect West Valley pages to use correct phone number
  const isWestValley = /avondale|buckeye|glendale|goodyear|peoria|sun-city|surprise/.test(window.location.pathname);
  const PHONE_NUM = isWestValley ? '6028856998' : '9288001998';
  const PHONE_DISPLAY = isWestValley ? '(602) 885-6998' : '(928) 800-1998';

  const PHONE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16"><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/></svg>`;

  const HTML = `
    <button class="ikb-tab" id="ikbTab" aria-label="Request a free estimate">Free&nbsp;Estimate</button>
    <div class="ikb-mobile-bar">
      <a href="tel:${PHONE_NUM}" class="ikb-mobile-call" data-track-call="true">${PHONE_SVG} Call Now</a>
      <button class="ikb-mobile-estimate" id="ikbMobileEstimate">Free Estimate &rarr;</button>
    </div>
    <div class="ikb-overlay" id="ikbOverlay"></div>
    <div class="ikb-panel" id="ikbPanel" role="dialog" aria-modal="true" aria-label="Request a Free Estimate">
      <button class="ikb-panel-close" id="ikbClose" aria-label="Close">&times;</button>
      <p style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.55);margin:0 0 0.4rem;">Infinity Kitchen &amp; Bath</p>
      <h3>Get Your Free Estimate</h3>
      <p class="ikb-sub">We'll call or text you back within one business day.</p>
      <div class="ikb-stars"><span class="ikb-stars-icons">&#9733;&#9733;&#9733;&#9733;&#9733;</span> <span class="ikb-stars-txt"><strong>5.0</strong> &middot; 16 Google reviews</span></div>
      <form id="ikbForm" novalidate>
        <input class="ikb-field" type="text"  name="name"    placeholder="Your Name"           required autocomplete="name">
        <input class="ikb-field" type="tel"   name="phone"   placeholder="Phone Number"        required autocomplete="tel">
        <input class="ikb-field" type="email" name="email"   placeholder="Email (optional)"             autocomplete="email">
        <textarea class="ikb-field"           name="project" placeholder="What's the project? (optional)"></textarea>
        <input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;" value="">

        <button class="ikb-btn" type="submit" id="ikbSubmit">${SEND_ICON} Request Free Estimate</button>
        <p class="ikb-disclaimer">By submitting you agree to be contacted by phone, text, or email. Msg &amp; data rates may apply.</p>
      </form>
      <div id="ikbSuccess" class="ikb-success" style="display:none;">
        <div class="ikb-success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#fff" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
        </div>
        <h4>Request Sent!</h4>
        <p>We'll be in touch within one business day to schedule your free consultation.</p>
      </div>
      <div class="ikb-call">
        ${PHONE_ICON}
        <span>Rather call? <a href="tel:${PHONE_NUM}">${PHONE_DISPLAY}</a></span>
      </div>
      <div class="ikb-trust">
        <p class="ikb-trust-label">Why Infinity Kitchen &amp; Bath</p>
        <div class="ikb-trust-item">${CHECKSHIELD} <span><strong>AZ ROC #339999</strong> — Arizona Licensed Contractor</span></div>
        <div class="ikb-trust-item">${CHECKSHIELD} <span>Licensed, Bonded &amp; Insured</span></div>
        <div class="ikb-trust-item">${CHECKSHIELD} <span>Free in-home or showroom consultation</span></div>
        <div class="ikb-trust-item">${CLOCK} <span>Mon–Fri 7am–6pm · Sat by appointment</span></div>
      </div>
    </div>
  `;

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // Inject HTML
  document.body.insertAdjacentHTML('beforeend', HTML);

  const tab     = document.getElementById('ikbTab');
  const panel   = document.getElementById('ikbPanel');
  const overlay = document.getElementById('ikbOverlay');
  const closeBtn = document.getElementById('ikbClose');
  const form    = document.getElementById('ikbForm');
  const success = document.getElementById('ikbSuccess');
  const submitBtn = document.getElementById('ikbSubmit');

  // Timestamp when the form first became reachable — used to reject
  // near-instant bot submissions server-side.
  const formShownAt = Date.now();

  function open() {
    panel.classList.add('ikb-open');
    overlay.classList.add('ikb-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    panel.classList.remove('ikb-open');
    overlay.classList.remove('ikb-open');
    document.body.style.overflow = '';
  }

  tab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  const mobileEstBtn = document.getElementById('ikbMobileEstimate');
  if (mobileEstBtn) mobileEstBtn.addEventListener('click', open);

  // Expose the panel + route in-content primary CTAs to the low-friction estimate form.
  // Progressive enhancement: if JS is off, the anchor still navigates to contact.html.
  window.ikbOpenEstimate = open;
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest(
      '[data-estimate], a.btn-gold[href="contact.html"], a.btn-gold[href="/contact.html"]'
    );
    if (!trigger) return;
    e.preventDefault();
    if (typeof gtag !== 'undefined') {
      gtag('event', 'open_estimate', { source: 'inline_cta' });
    }
    open();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const nameParts = (data.name || '').trim().split(/\s+/);
    const payload = {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      phone: data.phone || '',
      email: data.email || '',
      message: data.project || '',
      service: 'Estimate Request (Quick Form)',
      address: '',
      'consult-type': '',
      company: data.company || '',
      elapsed: Date.now() - formShownAt,
    };

    const original = submitBtn.innerHTML;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        // GA4 lead conversion
        if (typeof gtag !== 'undefined') {
          gtag('event', 'generate_lead', { form_location: 'estimate_tab', form_id: 'ikbForm' });
        }
        if (window.dataLayer) {
          window.dataLayer.push({ event: 'generate_lead', form_location: 'estimate_tab', form_id: 'ikbForm' });
        }
        form.style.display = 'none';
        success.style.display = 'block';
        setTimeout(() => {
          form.reset();
          form.style.display = 'block';
          success.style.display = 'none';
          submitBtn.innerHTML = original;
          submitBtn.disabled = false;
          close();
        }, 4000);
      } else {
        submitBtn.textContent = 'Error — please call us';
        setTimeout(() => { submitBtn.innerHTML = original; submitBtn.disabled = false; }, 3500);
      }
    } catch {
      submitBtn.textContent = 'Error — please call us';
      setTimeout(() => { submitBtn.innerHTML = original; submitBtn.disabled = false; }, 3500);
    }
  });
})();
