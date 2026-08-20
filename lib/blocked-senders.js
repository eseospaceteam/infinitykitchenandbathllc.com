// Blocklist for solicitations that come in through the public lead forms.
//
// Three rules, all deliberately DIFFERENT from the heuristic spam scoring used
// elsewhere: those weigh probabilistic signals (gibberish, pasted URLs, odd
// scripts) and so must stay conservative. These match specific, recognisable
// sales pitches, so a hit is near-certain rather than a guess.
//
//   1. A named bulk sender, a listed address, or a virtual-assistant
//      outsourcing pitch ("VAs4HIRE", "VAS Direct", "we offer Virtual
//      Assistants powered by our AI tool").
//   2. Guest-post / paid-backlink outreach ("dofollow placements", "niche
//      edits", "I offer guest posts on niche-relevant websites").
//   3. Unpaid-placement leverage ("I published the article with your link,
//      your blogger is not paying me, I will remove it and report it to
//      Google").
//
// None of them destroys a submission. A blocked message is RE-ROUTED to the
// review inbox with a "[BLOCKED] " subject instead of reaching the client, and any
// bcc/cc is stripped so the client never sees it. The submitter always gets the
// normal success response, so the sender learns nothing and does not retry
// through another channel.

const REVIEW_INBOX = () =>
  process.env.BLOCKED_REVIEW_INBOX ||
  process.env.SPAM_REVIEW_INBOX ||
  'hello@eseospace.com';

// --- 1. Named senders and virtual-assistant outsourcing pitches ------------
// "VAs4HIRE", "VAS 4 HIRE", "va-4-hire", "VAs4Hire.com", "VAS Direct".
const BRAND = /\bva[s']?\s*[-_.]*\s*4\s*[-_.]*\s*hire\b|\bvas\s*direct\b/i;
const BRAND_DOMAIN = /\bvas?4hire\.[a-z]{2,}|\bvasdirect\.[a-z]{2,}/i;

// Individual senders that have sprayed the estate's forms. This is the cheap
// place to add one address or domain -- extend the list rather than inventing a
// rule for a single sender. BLOCKED_SENDER_ADDRESSES (comma-separated) adds more
// per-site without a code change, e.g. when one client is being singled out.
//
// Matched as substrings of the whole message, not against a parsed From header:
// the submitter's address reaches this module inside the rendered body and the
// Reply-To, and a form that renames its email field must not silently opt out.
const BLOCKED_ADDRESSES = ['madeleine@vasdirect.com'];

function isBlockedAddress(t) {
  const extra = (process.env.BLOCKED_SENDER_ADDRESSES || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const lower = t.toLowerCase();
  return BLOCKED_ADDRESSES.concat(extra).some((a) => lower.includes(a));
}

// A virtual-assistant sales pitch. "virtual assistant" on its own is NOT enough:
// a real customer can mention one, and a VA writing in on behalf of a genuine
// client says it too. It only counts next to an explicit offer.
const VA = /\bvirtual\s+assistants?\b/i;
const VA_SELLING =
  /\b(?:we\s+(?:offer|provide|supply|specialis|specializ)|i\s+(?:offer|provide)|our\s+(?:team|agency|company|system|vas?\b)|hire\s+(?:a|our|your)|take\s+over\s+your|starting\s+(?:at|from)\s*\$|\$\s*\d+\s*(?:\/|per\s*)(?:hr|hour)|interested\s+in\s+learning\s+more)/i;

// Deliberately does NOT match the first name "Vicky" on its own. Vicky is a
// real name and a bare first-name rule would silently eat genuine leads; the
// name only counts alongside an explicit virtual-assistant pitch.
function isNamedSender(t) {
  if (BRAND.test(t) || BRAND_DOMAIN.test(t)) return true;
  if (isBlockedAddress(t)) return true;
  if (/\bvick(?:y|i|ie)\b/i.test(t) && VA.test(t)) return true;
  return VA.test(t) && VA_SELLING.test(t);
}

// --- 2. Guest-post / link selling ------------------------------------------
// Terms that essentially never appear in a genuine customer inquiry -- these
// alone are enough.
const LINK_SELLING =
  /\b(?:do-?follow|niche\s*edits?|link\s*(?:insertion|placement|building|exchange|swap)s?|pbn|private\s+blog\s+network|blogger\s+outreach|guest\s*post(?:ing)?\s+(?:service|site|website|opportunit)\w*|back-?link\s*(?:service|package|opportunit|campaign|profile|building|program)\w*|(?:buy|sell(?:ing)?|purchase|paid|cheap|bulk|permanent|contextual)\s+back-?links?|high[-\s]*(?:da|dr|quality|authority)\s*back-?links?)\b/i;

// "guest post" / "sponsored post" on their own are NOT enough: a real person
// can mention them innocently (and some of our own sites sell them). They only
// count next to an explicit selling signal.
const POST_OFFER = /\b(?:guest[-\s]*posts?|guest[-\s]*blogging|sponsored\s+posts?|back-?links?)\b/i;
const SELLING =
  /\b(?:placements?|backlinks?|domain\s+authority|price\s*list|per\s+post|outreach|niche[-\s]*relevant|seo\s+(?:growth|visibility|authority|services)|various\s+niches|i\s+offer|we\s+offer|interested\s+in\s+(?:a\s+)?collaborat)/i;

function isGuestPostPitch(t) {
  if (LINK_SELLING.test(t)) return true;
  return POST_OFFER.test(t) && SELLING.test(t);
}

// --- 3. Unpaid-placement leverage / link extortion -----------------------
// The message this rule was written for, sprayed across the estate's contact
// forms in August 2026:
//
//   "Hi admin. I published the article with your website link. But after the
//    publishing your blogger is not responding to me and not paying me. Please
//    let me know if you want your link live or not. Otherwise I will remove the
//    link and report it to Google."
//
// It is a link-scheme collection notice dressed up as an inquiry: whoever sold
// the placement is chasing payment, and the threat -- pull the link, report the
// site to Google -- is aimed at a client who has no idea what any of it refers
// to. Left alone it reaches a business owner who reads "report it to Google" as
// a penalty against their site. It must never land in the client inbox.
//
// Two components are required, never one. A claim that a link or article about
// this site was PLACED, plus either a payment grievance or leverage held over
// that link. "Please remove the link" on its own is an ordinary request a real
// customer can make about a real page, so it never blocks by itself.
const PLACEMENT_CLAIM =
  /\b(?:publish(?:ed|ing)?|posted|placed|inserted|added)\b[^.\n]{0,60}\b(?:article|post|blog|content|back-?link|link|url)\b|\byour\s+(?:web\s*site\s+|site\s+)?(?:back-?link|link|url)\b|\b(?:pay|paid|payment)\s+for\s+(?:the|my|this|that)\s+(?:article|post|blog|guest\s*post|link|back-?link|placement|content)\b|\bback-?links?\b|\bguest[-\s]*posts?\b/i;

const PAYMENT_GRIEVANCE =
  /\b(?:not\s+pay(?:ing|ment)|didn'?t\s+pay|did\s+not\s+pay|hasn'?t\s+paid|has\s+not\s+paid|never\s+paid|un-?paid|non[-\s]*payment|no\s+payment|payment\s+(?:pending|due|is\s+due|not\s+received)|still\s+waiting\s+for\s+(?:the\s+|my\s+)?payment|owe[sd]?\s+me|pay\s+me|my\s+(?:payment|invoice)|send\s+(?:me\s+)?(?:the\s+)?payment)\b/i;

const LINK_LEVERAGE =
  /\b(?:remov(?:e|ing)|delet(?:e|ing)|take\s*down|taking\s*down|de-?index|disavow)\b[^.\n]{0,40}\b(?:back-?link|link|article|post|content)\b|\b(?:back-?link|link|article|post)\b[^.\n]{0,40}\b(?:will\s+be\s+)?(?:removed|deleted|taken\s+down)\b|\breport\s+(?:it|this|you|your\s+(?:site|website))?\s*to\s+google\b|\blink\s+live\s+or\s+not\b|\bwant\s+(?:your|the)\s+link\s+live\b/i;

function isUnpaidPlacementLeverage(t) {
  if (!PLACEMENT_CLAIM.test(t)) return false;
  return PAYMENT_GRIEVANCE.test(t) || LINK_LEVERAGE.test(t);
}

// `opts.allowGuestPostPitch` exempts endpoints that exist to RECEIVE these
// pitches -- e.g. a site that sells guest posts and link insertions. Without it
// the blocklist would divert that site's paying customers.
function isBlockedText(t, opts) {
  if (!t) return false;
  if (isNamedSender(t)) return true;
  if (isUnpaidPlacementLeverage(t)) return true;
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

export { applyBlockedSenders, applyBlockedSendersToMessage, isBlockedText, isGuestPostPitch, isUnpaidPlacementLeverage, REVIEW_INBOX as reviewInbox };
