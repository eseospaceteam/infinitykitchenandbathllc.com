export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    firstName, lastName, email, phone, address,
    service, 'consult-type': consultType, message,
  } = req.body;

  const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
  const DOMAIN = 'send.infinitykitchenandbathllc.com';

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
      New Lead — Infinity Kitchen &amp; Bath
    </h2>
    <table style="border-collapse:collapse;width:100%;max-width:580px;font-family:sans-serif;font-size:14px;">
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;width:140px;">Name</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${firstName} ${lastName}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Phone</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;"><a href="tel:${phone}" style="color:#1B4332;">${phone}</a></td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Email</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${email ? `<a href="mailto:${email}" style="color:#1B4332;">${email}</a>` : '—'}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Address</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${address || '—'}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Service</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${serviceLabel}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;">Consultation</td><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">${consultLabel}</td></tr>
      <tr><td style="padding:9px 14px;background:#f4f4f4;font-weight:700;vertical-align:top;">Message</td><td style="padding:9px 14px;">${message || '—'}</td></tr>
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
    from: `Infinity Kitchen & Bath <noreply@send.infinitykitchenandbathllc.com>`,
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
