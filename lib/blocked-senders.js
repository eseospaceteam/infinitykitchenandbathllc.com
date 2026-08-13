// Named-sender blocklist for a known bulk contact-form solicitor ("VAs4HIRE").
//
// This is deliberately DIFFERENT from the heuristic spam scoring used elsewhere:
// those weigh probabilistic signals (gibberish, pasted URLs, odd scripts) and so
// must stay conservative. This matches one specific sender by brand token, so a
// hit is effectively certain rather than a guess.
//
// It still never destroys a submission. A blocked message is RE-ROUTED to the
// review inbox with a "[BLOCKED] " subject instead of reaching the client, and
// any bcc/cc is stripped so the client never sees it. The submitter always gets
// the normal success response, so the sender learns nothing and does not retry
// through another channel.
//
// Deliberately does NOT match the first name "Vicky" on its own. Vicky is a real
// name and a bare first-name rule would silently eat genuine leads; the name only
// counts when it appears alongside an explicit virtual-assistant pitch.

const REVIEW_INBOX = () =>
  process.env.BLOCKED_REVIEW_INBOX ||
  process.env.SPAM_REVIEW_INBOX ||
  'hello@eseospace.com';

// "VAs4HIRE", "VAS 4 HIRE", "va-4-hire", "VAs4Hire.com"
const BRAND = /\bva[s']?\s*[-_.]*\s*4\s*[-_.]*\s*hire\b/i;
const BRAND_DOMAIN = /\bvas?4hire\.[a-z]{2,}/i;

function isBlockedText(t) {
  if (!t) return false;
  if (BRAND.test(t) || BRAND_DOMAIN.test(t)) return true;
  // Rebrand insurance: the same pitch under a different company name still needs
  // BOTH the sender's name and an explicit VA pitch before it counts.
  return /\bvick(?:y|i|ie)\b/i.test(t) && /\bvirtual\s+assistants?\b/i.test(t);
}

// Mutates an outgoing Mailgun body in place; returns true if it was blocked.
// Accepts either URLSearchParams or FormData -- both expose get/set/delete, and
// different handlers in this estate use one or the other.
//
// Wrapped in try/catch on purpose: a bug in the blocklist must never be able to
// stop a real lead from being delivered.
function applyBlockedSenders(body) {
  try {
    if (!body || typeof body.get !== 'function') return false;
    const hay = ['subject', 'text', 'html', 'h:Reply-To']
      .map((k) => String(body.get(k) == null ? '' : body.get(k)))
      .join('\n');
    if (!isBlockedText(hay)) return false;
    body.set('to', REVIEW_INBOX());
    body.delete('bcc');
    body.delete('cc');
    const s = String(body.get('subject') == null ? '' : body.get('subject')) || '(no subject)';
    if (!/^\[BLOCKED\]/.test(s)) body.set('subject', '[BLOCKED] ' + s);
    return true;
  } catch {
    return false;
  }
}

// Object-shaped variant, for providers whose SDK takes a message object
// (Resend, SendGrid) instead of a Mailgun form body. Same rules, mutates in
// place, and is equally incapable of throwing into the send path.
function applyBlockedSendersToMessage(msg) {
  try {
    if (!msg || typeof msg !== 'object') return false;
    const hay = [msg.subject, msg.text, msg.html, msg.reply_to, msg.replyTo]
      .map((v) => (v == null ? '' : String(v)))
      .join('\n');
    if (!isBlockedText(hay)) return false;
    // Preserve the shape the caller's SDK expects: array in, array out.
    msg.to = Array.isArray(msg.to) ? [REVIEW_INBOX()] : REVIEW_INBOX();
    delete msg.bcc;
    delete msg.cc;
    const s = msg.subject == null ? '' : String(msg.subject);
    if (!/^\[BLOCKED\]/.test(s)) msg.subject = '[BLOCKED] ' + (s || '(no subject)');
    return true;
  } catch {
    return false;
  }
}

export { applyBlockedSenders, applyBlockedSendersToMessage, isBlockedText };
