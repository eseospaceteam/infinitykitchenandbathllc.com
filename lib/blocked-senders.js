// Blocklist for solicitations that come in through the public lead forms.
//
// Two rules, both deliberately DIFFERENT from the heuristic spam scoring used
// elsewhere: those weigh probabilistic signals (gibberish, pasted URLs, odd
// scripts) and so must stay conservative. These match specific, recognisable
// sales pitches, so a hit is near-certain rather than a guess.
//
//   1. A named bulk sender ("VAs4HIRE").
//   2. Guest-post / paid-backlink outreach ("dofollow placements", "niche
//      edits", "I offer guest posts on niche-relevant websites").
//
// Neither destroys a submission. A blocked message is RE-ROUTED to the review
// inbox with a "[BLOCKED] " subject instead of reaching the client, and any
// bcc/cc is stripped so the client never sees it. The submitter always gets the
// normal success response, so the sender learns nothing and does not retry
// through another channel.

const REVIEW_INBOX = () =>
  process.env.BLOCKED_REVIEW_INBOX ||
  process.env.SPAM_REVIEW_INBOX ||
  'hello@eseospace.com';

// --- 1. Named sender -------------------------------------------------------
// "VAs4HIRE", "VAS 4 HIRE", "va-4-hire", "VAs4Hire.com"
const BRAND = /\bva[s']?\s*[-_.]*\s*4\s*[-_.]*\s*hire\b/i;
const BRAND_DOMAIN = /\bvas?4hire\.[a-z]{2,}/i;

// Deliberately does NOT match the first name "Vicky" on its own. Vicky is a
// real name and a bare first-name rule would silently eat genuine leads; the
// name only counts alongside an explicit virtual-assistant pitch.
function isNamedSender(t) {
  if (BRAND.test(t) || BRAND_DOMAIN.test(t)) return true;
  return /\bvick(?:y|i|ie)\b/i.test(t) && /\bvirtual\s+assistants?\b/i.test(t);
}

// --- 2. Guest-post / link selling ------------------------------------------
// Terms that essentially never appear in a genuine customer inquiry -- these
// alone are enough.
const LINK_SELLING =
  /\b(?:do-?follow|niche\s*edits?|link\s*insertions?|link\s*placements?|link\s*building|pbn|private\s+blog\s+network|guest\s*post(?:ing)?\s+(?:service|site|website)s?)\b/i;

// "guest post" / "sponsored post" on their own are NOT enough: a real person
// can mention them innocently (and some of our own sites sell them). They only
// count next to an explicit selling signal.
const POST_OFFER = /\b(?:guest[-\s]*posts?|guest[-\s]*blogging|sponsored\s+posts?)\b/i;
const SELLING =
  /\b(?:placements?|backlinks?|domain\s+authority|price\s*list|per\s+post|outreach|niche[-\s]*relevant|seo\s+(?:growth|visibility|authority|services)|various\s+niches|i\s+offer|we\s+offer|interested\s+in\s+(?:a\s+)?collaborat)/i;

function isGuestPostPitch(t) {
  if (LINK_SELLING.test(t)) return true;
  return POST_OFFER.test(t) && SELLING.test(t);
}

// `opts.allowGuestPostPitch` exempts endpoints that exist to RECEIVE these
// pitches -- e.g. a site that sells guest posts and link insertions. Without it
// the blocklist would divert that site's paying customers.
function isBlockedText(t, opts) {
  if (!t) return false;
  if (isNamedSender(t)) return true;
  if (opts && opts.allowGuestPostPitch) return false;
  return isGuestPostPitch(t);
}

// Mutates an outgoing Mailgun body in place; returns true if it was blocked.
// Accepts either URLSearchParams or FormData -- both expose get/set/delete, and
// different handlers in this estate use one or the other.
//
// Wrapped in try/catch on purpose: a bug in the blocklist must never be able to
// stop a real lead from being delivered.
function applyBlockedSenders(body, opts) {
  try {
    if (!body || typeof body.get !== 'function') return false;
    const hay = ['subject', 'text', 'html', 'h:Reply-To']
      .map((k) => String(body.get(k) == null ? '' : body.get(k)))
      .join('\n');
    if (!isBlockedText(hay, opts)) return false;
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
function applyBlockedSendersToMessage(msg, opts) {
  try {
    if (!msg || typeof msg !== 'object') return false;
    const hay = [msg.subject, msg.text, msg.html, msg.reply_to, msg.replyTo]
      .map((v) => (v == null ? '' : String(v)))
      .join('\n');
    if (!isBlockedText(hay, opts)) return false;
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

export { applyBlockedSenders, applyBlockedSendersToMessage, isBlockedText, isGuestPostPitch, REVIEW_INBOX as reviewInbox };
