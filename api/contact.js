export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    firstName, lastName, email, phone, address,
    service, 'consult-type': consultType, message,
    company, elapsed,
  } = req.body || {};

  // ── Spam gate ─────────────────────────────────────────────
  // Bots bypass client-side validation, so every check must live here.
  // On any spam signal we return a fake 200 so bots think they succeeded
  // and don't adapt/retry — no email is sent.
  const fakeOk = () => res.status(200).json({ success: true });

  // 1) Honeypot: a hidden field real users never see. If it's filled, it's a bot.
  if (typeof company === 'string' && company.trim() !== '') {
    return fakeOk();
  }

  // 2) Time-to-submit: humans take several seconds; bots submit near-instantly.
  //    `elapsed` = ms between the form appearing and submission (sent by the client).
  //    Only enforce when present, so a missing value never blocks a real lead.
  const elapsedMs = Number(elapsed);
  if (Number.isFinite(elapsedMs) && elapsedMs < 3000) {
    return fakeOk();
  }

  // 3) Required fields. A real lead has a name AND a callable phone number.
  //    This alone drops the all-blank and no-name/no-phone gibberish spam.
  const nameOk = typeof firstName === 'string' && firstName.trim().length >= 2;
  const phoneDigits = String(phone || '').replace(/\D/g, '');
  const phoneOk = phoneDigits.length >= 7 && phoneDigits.length <= 15;
  if (!nameOk || !phoneOk) {
    return fakeOk();
  }

  // 4) Light gibberish heuristic on free-text fields — keyboard-mash spam has
  //    very few spaces/vowels relative to length. Kept conservative so it never
  //    trips on a short, real message.
  const looksLikeGibberish = (s) => {
    const str = String(s || '').trim();
    if (str.length < 40) return false;
    const letters = (str.match(/[a-z]/gi) || []).length;
    const vowels = (str.match(/[aeiou]/gi) || []).length;
    const spaces = (str.match(/\s/g) || []).length;
    // real prose: vowels are ~35-45% of letters and words are short
    const vowelRatio = letters ? vowels / letters : 0;
    const avgWordLen = spaces ? str.length / (spaces + 1) : str.length;
    return vowelRatio < 0.2 || avgWordLen > 18;
  };
  if (looksLikeGibberish(message) || looksLikeGibberish(email)) {
    return fakeOk();
  }
  // ──────────────────────────────────────────────────────────

  const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
  const DOMAIN = 'send.infinitykitchenandbathllc.com';

  // Escape any user-supplied value before it goes into the HTML email.
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const serviceLabels = {
    kitchen: 'Kitchen Remodeling',
    bathroom: 'Bathroom Remodeling',
    'whole-house': 'Whole House Remodeling',
    countertops: 'Custom Countertops',
    flooring: 'Luxury Vinyl Plank Flooring',
    'tub-shower': 'Tub-to-Shower Conversion',
    groutless: 'Groutless Shower System',
    'walk-in-shower': 'Walk-In Shower',
    other: 'Other / Not Sure Yet',
  };

  const consultLabels = {
    'in-home': 'In-Home Consultation',
    'showroom-prescott': 'Showroom Visit — Prescott',
    'showroom-avondale': 'Showroom Visit — Avondale',
    either: 'Either Works',
  };

  const serviceLabel = serviceLabels[service] || service || 'Not specified';
  const consultLabel = consultLabels[consultType] || consultType || 'Not specified';

  const html = `
    <h2 style="margin:0 0 16px;color:#1B4332;font-family:sans-serif;">
      New Lead — Infinity Kitchens and Baths
    </h2>
    <table style="border-collapse:collapse;width:100%;max-width:580px;font-family:sans-serif;font-size:14px;">
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;width:140px;">Name</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${esc(firstName)} ${esc(lastName)}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Phone</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;"><a href="tel:${esc(phone)}" style="color:#1B4332;">${esc(phone)}</a></td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Email</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${email ? `<a href="mailto:${esc(email)}" style="color:#1B4332;">${esc(email)}</a>` : '—'}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Address</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${esc(address) || '—'}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Service</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${esc(serviceLabel)}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Consultation</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${esc(consultLabel)}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;vertical-align:top;">Message</td><td style="padding:9px 14px;">${esc(message) || '—'}</td></tr>
    </table>
  `;

  const text = [
    'New lead from infinitykitchenandbathllc.com',
    '',
    `Name: ${firstName} ${lastName}`,
    `Phone: ${phone}`,
    `Email: ${email || 'Not provided'}`,
    `Address: ${address || 'Not provided'}`,
    `Service: ${serviceLabel}`,
    `Consultation: ${consultLabel}`,
    `Message: ${message || 'None'}`,
  ].join('\n');

  const body = new URLSearchParams({
    from: `Infinity Kitchens and Baths <noreply@send.infinitykitchenandbathllc.com>`,
    to: 'stevehuntkitchens@gmail.com',
    cc: 'hello@eseospace.com',
    subject: `New Lead: ${firstName} ${lastName} — ${serviceLabel}`,
    html,
    text,
  });

  const mgRes = await fetch(`https://api.mailgun.net/v3/${DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (mgRes.ok) {
    return res.status(200).json({ success: true });
  }

  const errText = await mgRes.text();
  console.error('Mailgun error:', mgRes.status, errText);
  return res.status(500).json({ error: 'Failed to send email' });
}
