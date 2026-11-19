import { applyBlockedSenders, reviewInbox } from '../lib/blocked-senders.js';
import { cleanLeadSource, leadSourceRows, leadSourceText } from '../lib/lead-source.js';
import { countLead, leadCountFields } from '../lib/eseo-leads.js';
// Replaced after applyBlockedSenders with the lead-source panel (see below).
const LEAD_SOURCE_MARK = '<!--LEAD-SOURCE-->';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    firstName, lastName, email, phone, address,
    service, 'consult-type': consultType, message,
    source, company, hp_reference: hpReference, elapsed, lead_source: rawLeadSource,
  } = req.body || {};

  // ── Spam gate ─────────────────────────────────────────────
  // Bots bypass client-side validation, so every check must live here.
  // No check discards a send (19 Nov 2026). Until then checks 3-5 returned a
  // fake 200 and emailed nobody, so a real visitor who tripped one (a short
  // phone number, a long unbroken message) saw "Request Sent!" and vanished.
  // Now: a bot-looking send is MARKED (below) and goes to the review inbox
  // only, held for the evening spam report; a real browser that left out a
  // required field gets a visible 400 it can fix. The scoring is unchanged.

  // Bot signals (1) and (2) only MARK a submission; they never discard it.
  // Until 18 Nov 2026 either one returned the fake 200 and emailed nobody, so a
  // real customer whose browser filled the hidden field vanished without a
  // trace. Now a suspect goes to eSEOspace's review inbox only, tagged [SPAM?]
  // so it is held for the evening spam report; Steve never sees it. The visitor
  // sees the normal success message either way.
  const suspect = [];

  // 1) Honeypot: a hidden field real users never see. It is `hp_reference` now
  //    (any value counts). Browser autofill legitimately fills the old name,
  //    "company", which silently dropped real leads in July, so pages cached
  //    from before the rename are only marked when that value carries a
  //    link/URL — the signature of link-spam bots, never of an autofilled
  //    company name.
  const hp = String(company || '');
  if (String(hpReference || '').trim() || /https?:\/\/|www\.|<a\s|\[url|\.(ru|cn|top|xyz|info|link)\b/i.test(hp)) {
    suspect.push('hidden field filled');
  }

  // 2) Time-to-submit: humans take several seconds; bots submit near-instantly.
  //    `elapsed` = ms between the form appearing and submission (sent by the client).
  //    Only enforce when present, so a missing value never marks a real lead.
  const elapsedMs = Number(elapsed);
  if (Number.isFinite(elapsedMs) && elapsedMs < 1200) {
    suspect.push(`sent ${(elapsedMs / 1000).toFixed(1)}s after the form appeared`);
  }

  // 3) Required fields. A real lead has a name AND a callable phone number.
  //    The all-blank and no-name/no-phone gibberish spam fails this. A send from
  //    one of our own pages in a real browser (same-origin fetch, see
  //    fromOwnPage) with no other bot signal is told what to fix; anything else
  //    is marked and goes to review.
  const nameOk = typeof firstName === 'string' && firstName.trim().length >= 2;
  const phoneDigits = String(phone || '').replace(/\D/g, '');
  const phoneOk = phoneDigits.length >= 7 && phoneDigits.length <= 15;
  if (!nameOk || !phoneOk) {
    if (!suspect.length && fromOwnPage(req)) {
      return res.status(400).json({
        error: !nameOk ? 'Please enter your name.' : 'Please enter a phone number we can reach you on.',
      });
    }
    suspect.push(!nameOk && !phoneOk ? 'no name or phone' : !nameOk ? 'no name' : 'no callable phone');
  }

  // 3b) Location is mandatory on every form (client direction, 22 Sep 2026).
  //     Real 400, not fakeOk: a human who skipped it should be told, not dropped.
  if (String(address || '').trim().length < 2) {
    return res.status(400).json({ error: 'Please enter your city.' });
  }

  // 4) Random-token detector — the signature of the bot leads that keep getting
  //    through (e.g. name "gwhWvuVfktsvExuKiWoynzAT", message "EyBivCOePwdFDFaexZwJmqi").
  //    Real names and messages never mash capitals into the middle of a token,
  //    string long runs of consonants, or pack a 15+ char single token with
  //    almost no vowels. Legit interior caps (McKenna, DeShawn, iPhone) hit at
  //    most one transition, so the >=3 threshold leaves them alone.
  const looksRandom = (s) => {
    const str = String(s || '').trim();
    if (str.length < 8) return false;
    const interiorCaps = (str.match(/[a-z][A-Z]/g) || []).length;
    if (interiorCaps >= 3) return true;
    const runs = str.match(/[bcdfghjklmnpqrstvwxz]+/gi) || [];
    const longestConsonantRun = runs.reduce((m, w) => Math.max(m, w.length), 0);
    if (longestConsonantRun >= 6) return true;
    const letters = (str.match(/[a-z]/gi) || []).length;
    const vowels = (str.match(/[aeiou]/gi) || []).length;
    const vowelRatio = letters ? vowels / letters : 0;
    if (!/\s/.test(str) && str.length >= 15 && vowelRatio < 0.35) return true;
    return false;
  };
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  if (looksRandom(fullName) || looksRandom(message)) {
    suspect.push('random-looking name or message');
  }

  // 5) Light gibberish heuristic on longer free-text — keyboard-mash spam has
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
    suspect.push('gibberish message or email');
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
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">City / Address</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${esc(address) || '—'}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Service</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${esc(serviceLabel)}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Consultation</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${esc(consultLabel)}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;vertical-align:top;">Message</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${esc(message) || '—'}</td></tr>
      ${source ? `<tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Came from</td><td style="padding:9px 14px;">${esc(source)}</td></tr>` : ''}
    </table>
    ${LEAD_SOURCE_MARK}
  `;

  const text = [
    'New lead from infinitykitchenandbathllc.com',
    '',
    `Name: ${firstName || ''} ${lastName || ''}`,
    `Phone: ${phone || ''}`,
    `Email: ${email || 'Not provided'}`,
    `City / Address: ${address}`,
    `Service: ${serviceLabel}`,
    `Consultation: ${consultLabel}`,
    `Message: ${message || 'None'}`,
    ...(source ? [`Came from: ${source}`] : []),
  ].join('\n');

  const body = new URLSearchParams({
    from: `Infinity Kitchens and Baths <noreply@send.infinitykitchenandbathllc.com>`,
    to: 'stevehuntkitchens@gmail.com',
    bcc: 'hello@eseospace.com',
    subject: `New Lead: ${firstName || ''} ${lastName || ''} — ${serviceLabel}`,
    html,
    text,
  });

  // A bot-signal submission: review inbox only, tagged so holdForReport
  // (inside applyBlockedSenders) holds it for the evening report. Never Steve.
  if (suspect.length) {
    body.set('to', reviewInbox());
    body.delete('bcc');
    body.delete('cc');
    body.set('subject', `[SPAM?] ${String(body.get('subject') ?? '')} (${suspect.join('; ')})`);
  }
  // Known bulk solicitor: re-route away from the client, never deliver to them.
  const blocked = applyBlockedSenders(body);
  // append, not set: holdForReport has just tagged held mail "held-spam", and
  // the evening report finds it by that tag.
  if (suspect.length) body.append('o:tag', 'suspected-bot');
  // Count it on the eSEOspace leads dashboard only when it still goes to the
  // client, before the send so a failed send still counts. Never throws.
  if (!blocked && !suspect.length) {
    let src = null;
    try { src = cleanLeadSource(rawLeadSource, { headers: { get: (k) => req.headers?.[k] || null } }); } catch {}
    await countLead(leadCountFields(src));
  }
  // Where the visitor came from (js/main.js -> lib/lead-source.js), added only
  // AFTER screening: a referrer or campaign name is our data, not the sender's
  // words, and must never be what re-routes a real lead.
  try {
    const leadSource = cleanLeadSource(rawLeadSource, { headers: { get: (k) => req.headers?.[k] || null } });
    const rows = leadSourceRows(leadSource);
    const panel = rows.filter(([l]) => l).map(([l, v]) => `<tr><td style="padding:7px 14px;background:#f4f4f4;font-weight:700;width:140px;vertical-align:top;">${esc(l)}</td><td style="padding:7px 14px;border-bottom:1px solid #e8e8e8;word-break:break-all;">${esc(v)}</td></tr>`).join('');
    body.set('html', String(body.get('html') || '').split(LEAD_SOURCE_MARK).join(panel ? `<h3 style="margin:22px 0 8px;color:#1B4332;font-family:sans-serif;font-size:15px;">Where this lead came from</h3><table style="border-collapse:collapse;width:100%;max-width:580px;font-family:sans-serif;font-size:13px;">${panel}</table>` : ''));
    body.set('text', `${body.get('text') || ''}\n${leadSourceText(rows)}`);
  } catch (err) {
    console.error('lead source not added:', err?.message);
    body.set('html', String(body.get('html') || '').split(LEAD_SOURCE_MARK).join(''));
  }
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

// True when the POST came from one of this site's own pages in a browser.
// Browsers send Sec-Fetch-Site on every fetch (same-origin from our forms) and
// an Origin/Referer on our host; a script posting straight at the endpoint
// usually sends none of them. Only used to choose between "tell the visitor
// what to fix" and "hold for review"; it never discards anything.
function fromOwnPage(req) {
  const h = req.headers || {};
  const get = (k) => String(h[k] || '');
  if (get('sec-fetch-site') === 'same-origin') return true;
  const host = get('x-forwarded-host') || get('host');
  for (const k of ['origin', 'referer']) {
    try { if (host && new URL(get(k)).host === host) return true; } catch {}
  }
  return false;
}
