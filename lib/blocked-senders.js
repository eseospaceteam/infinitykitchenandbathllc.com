// Blocklist for solicitations that come in through the public lead forms.
//
// Nine rules, all deliberately DIFFERENT from the heuristic spam scoring used
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
//   4. Unsolicited content contribution -- the same guest-post trade as rule 2
//      but written so as never to say "guest post" or "backlink" ("Can I write
//      an article for your website?").
//   5. A freelancer touting for work ("Do you have any use for a freelance
//      writer? ... You can book a time with me", plus a Calendly link).
//   6. A search-marketing cold pitch ("Re: SEO Report ... it's not ranking on
//      Google and other major search engines").
//   7. A lead-generation or marketing-software pitch ("Hello <domain> Com
//      Owner ... Web Visitors Into Leads is a software widget").
//   8. Advance-fee / bequest fraud ("Dear Beloved, I have been battling cancer
//      ... I wish to entrust you with a humanitarian project valued at $X").
//   9. Net-terms purchase-order fraud ("please quote 4 walk-in coolers, we pay
//      Net 45, ship to our freight forwarder") -- OFF unless the site asks for
//      it, because a real B2B buyer asks about net 30.
//
// Rules 8 and 9 were written on JayCompDevelopment and rule 6's SEO half on
// shielddentalcare; rules 5-7 on wilson-management, parisi-law-firm and
// krwelectric365. This file is the merge of all of them and is byte-identical
// across the estate apart from the module format (ESM/CJS) and TS/JS -- if you
// add a rule, add it HERE and re-run the sweep, never in one copy.
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


// --- 4. Unsolicited content contribution ---------------------------------
// Rule 2 keys on the vocabulary of the link trade. The version that gets past
// it never uses that vocabulary at all -- it reads like a polite reader offering
// to help. Received on parisifirm.com's intake form, August 2026:
//
//   "Traveling with a pet can be a rewarding experience... Can I write an
//    article for your website providing essential advice on how to prepare for
//    traveling with your pet? If interested, please let me know.
//    Thank you, Tyler Evans, Dogzasters.com
//    ~If this topic isn't quite the right fit, just let me know."
//
// Not one term in rule 2 appears, no URL is pasted (the sender's domain is a
// bare sign-off line, which the URL heuristic does not see), and no money is
// mentioned. It scored zero and reached the firm's intake inbox looking like a
// case. The payment and the link come later, once the reply arrives.
//
// Two components, never one. An offer to AUTHOR something -- an authoring verb
// next to a content noun -- plus the thing being authored FOR: your website,
// your blog, your readers. Either half alone is ordinary English.
//
// Deliberately excluded from the content nouns: "review", "statement",
// "report", "record", "photo". A happy client offering to write a review, and a
// claimant offering to submit a police report, are both real and common.
const AUTHOR_OFFER =
  /\b(?:can|could|may|would|shall)\s+(?:i|we)\s+(?:write|contribute|submit|pitch|publish|author|prepare|craft)\b[^.\n]{0,50}\b(?:article|post|blog|piece|content|guide|write[-\s]*up|story|feature)\b/i;
const AUTHOR_OFFER_2 =
  /\b(?:write|contribute|submit|pitch|publish|author|craft)\s+(?:you\s+)?(?:an?|one|some|a\s+few|two|three|several)?\s*(?:\w+[-\s]+){0,3}?(?:article|blog\s*post|guest\s*post|piece|content|write[-\s]*up|feature)\b/i;
const CONTENT_TARGET =
  /\b(?:your|the)\s+(?:web\s*site|website|site|blog|page|readers|audience|platform|publication|visitors)\b/i;

// The tell of a topic-pitch template, and the only half of this rule that
// stands alone: a real enquiry about an injury does not offer alternative
// subject matter. Both halves of the pitch that reached us are here -- the
// tilde-prefixed postscript, and the "happy to suggest a few topics" variant.
const TOPIC_FALLBACK =
  /\bif\s+(?:this|that|the)\s+(?:topic|idea|subject|angle|one)\b[^.\n]{0,60}\b(?:isn'?t|is\s+not|does\s*n[o']?t|not)\b[^.\n]{0,40}\b(?:right\s+fit|good\s+fit|fit|work|suit|interest)/i;
const TOPIC_ALTERNATIVES =
  /\b(?:send|share|suggest|pitch|propose)\s+(?:over\s+|you\s+)?(?:a\s+few|some|other|another|alternative|different|more)\s+(?:topic|idea|title|angle|subject|headline)s?\b/i;
const FREE_CONTENT =
  /\b(?:free\s+of\s+charge|at\s+no\s+cost|no\s+cost\s+to\s+you|completely\s+free|absolutely\s+free)\b[^.\n]{0,60}\b(?:article|post|content|piece)\b|\b(?:article|post|content|piece)\b[^.\n]{0,60}\b(?:free\s+of\s+charge|at\s+no\s+cost|no\s+cost\s+to\s+you)\b/i;

function isContentContributionPitch(t) {
  if (TOPIC_FALLBACK.test(t) || TOPIC_ALTERNATIVES.test(t)) return true;
  if (!CONTENT_TARGET.test(t)) return false;
  return AUTHOR_OFFER.test(t) || AUTHOR_OFFER_2.test(t) || FREE_CONTENT.test(t);
}

// --- 5. A freelancer touting for work ------------------------------------
// Submitted through the Wilson Management homepage rental-analysis form in
// September 2026, under the address of a downtown office tower the sender does
// not own:
//
//   "Hey! Do you have any use for a freelance writer? I have nearly a decade of
//    experience and can help with pretty much any type of content, including
//    blog posts, case studies, press releases, thought leadership, articles,
//    and much more. I'm currently looking for new opportunities and would love
//    to see if you have any writing projects I could help with. You can book a
//    time with me to chat if interested. Hoping to connect!
//    https://calendly.com/melottogroup/30min"
//
// Rules 2 and 4 both miss it: nothing is being placed on the client's site and
// no link is being sold, so it reads as a person asking for a job. It is still
// a solicitation arriving on a form that exists to collect customers.
//
// Two components, never one, because the trade words describe real people. A
// prospective TENANT who introduces herself as a freelance writer, and a
// claimant who freelances, are ordinary leads -- so the role alone never
// blocks. It only counts next to an explicit offer of that person's services.
const FREELANCE_ROLE =
  /\bfree-?lanc(?:e|er|ers|ing)\b|\b(?:copy-?writer|content\s+writer|ghost-?writer|blog\s+writer|content\s+creator|content\s+strategist|seo\s+writer)s?\b/i;

// Deliverables listed the way a rate card lists them. Still only half the rule.
const WRITING_WORK =
  /\b(?:blog\s+posts?|press\s+releases?|case\s+stud(?:y|ies)|thought\s+leadership|white\s*papers?|web\s*copy|writing\s+projects?|content\s+(?:writing|marketing)|article\s+writing)\b/i;

// An unmistakable offer of services TO the recipient. Deliberately excludes the
// soft phrases a genuine lead also uses -- "hoping to connect", "years of
// experience" -- which would block the freelance-writer tenant above.
const WORK_TOUT =
  /\bdo\s+you\s+(?:have\s+)?(?:any\s+)?(?:use|need)\s+for\b|\bdo\s+you\s+need\s+(?:a|an|any)\b|\b(?:any|some)\s+(?:\w+\s+){0,2}?(?:projects?|work|gigs?)\s+(?:i|that\s+i)\s+(?:could|can)\s+help\b|\blooking\s+for\s+new\s+(?:opportunit|client|project|gig)\w*|\bopen\s+to\s+new\s+(?:work|clients?|projects?|opportunit\w*)\b|\bavailable\s+for\s+(?:free-?lance|writing|new\s+(?:work|projects?)|hire)\b|\bhire\s+me\b|\bmy\s+(?:portfolio|rate\s*card|rates|samples|writing\s+samples|resume|cv)\b|\b(?:send|share)\s+(?:you\s+)?(?:some\s+|my\s+|a\s+few\s+)?samples\b|\bbook\s+a\s+(?:time|call|slot|chat)\s+with\s+me\b|\b(?:i|we)\s+(?:can|could)\s+help\s+(?:you\s+)?with\b|\b(?:i|we)\s+offer\b/i;

// A scheduling link pasted into a lead form is a tout in itself -- but it is
// still only ever the second half of the rule.
const BOOKING_LINK =
  /\b(?:calendly\.com|cal\.com|koalendar\.com|savvycal\.com|tidycal\.com|youcanbook\.me|meetings\.hubspot\.com)\//i;

function isFreelancePitch(t) {
  if (!FREELANCE_ROLE.test(t) && !WRITING_WORK.test(t)) return false;
  return WORK_TOUT.test(t) || BOOKING_LINK.test(t);
}

// --- 6. Search-marketing cold pitch --------------------------------------
// Received on the Parisi Law Firm case-review form, September 2026, filed as an
// injury with today's date as the date of incident:
//
//   "Re: SEO Report / Hello Good Morning, I was checking your website and see
//    you have a good design and it looks great, but it's not ranking on Google
//    and other major search engines."
//
// Never match a bare "SEO": **Seo is a common Korean surname**, and it is also
// an ordinary substring of an address like seo.kim@gmail.com. The haystack here
// is the whole rendered email, name row included, so the bare token would block
// a real person by their name and nobody would ever find out -- the sender is
// thanked either way. Every branch below is a PHRASE that has no innocent
// reading on a client form, or a phrase plus a second signal.
// The SEO vocabulary itself, from shielddentalcare.com's rule 4 -- a superset
// of a hand-written list, so it is kept verbatim rather than re-derived.
const SEO_PITCH =
  /\bsearch\s+engine\s+optimi[sz](?:ation|ing|e|ers?)\b|\bseo\s*[-\/]?\s*(?:services?|agency|agencies|compan(?:y|ies)|firms?|experts?|specialists?|consultants?|consultancy|professionals?|freelancers?|teams?|audits?|analysis|reports?|proposals?|packages?|plans?|quotes?|pricing|campaigns?|strateg(?:y|ies)|rankings?|traffic|growth|visibility|authority|backlinks?|outsourcing|reseller|marketing)\b|\b(?:local|technical|on[-\s]*page|off[-\s]*page|white[-\s]*label|affordable|guaranteed)\s+seo\b|\brank(?:ing)?\s+(?:your|the)\s+(?:web\s*)?site\b|\bfirst\s+page\s+of\s+google\b|\btop\s+(?:of|on)\s+google\b|\bimprove\s+(?:your\s+)?(?:google\s+)?(?:search\s+)?rankings?\b/i;

// The two phrasings shielddentalcare's list does not carry: SEO named as being
// "for your" site, and a flat "we do SEO".
const SEO_OFFER =
  /\b(?:local\s+)?seo\s+(?:for\s+your|of\s+your)\b|\bwe\s+(?:do|provide|offer|handle)\s+seo\b/i;

const RANKING_PITCH =
  /\b(?:first|1st)\s+page\s+of\s+google\b|\bpage\s*(?:one|1)\s+of\s+google\b|\btop\s+of\s+google\b|\btop\s+(?:10|ten|5|five)\s+(?:on|in)\s+google\b|\bnot\s+rank(?:ing|ed)?\s+(?:on|in|well|high)\b|\bisn'?t\s+rank(?:ing|ed)\b|\brank(?:ing)?\s+(?:your|the)\s+(?:web\s*site|website|site|business|page)\b|\brank\s+(?:you\s+)?(?:higher|number\s*one|#\s*1|on\s+the\s+first\s+page)\b|\bimprove\s+your\s+(?:google\s+)?(?:search\s+)?(?:ranking|rankings|visibility|online\s+presence)\b|\bincrease\s+your\s+(?:web\s*site\s+|website\s+)?(?:traffic|rankings?|visibility|organic)\b|\bgoogle\s+(?:search\s+)?rankings?\b|\borganic\s+(?:traffic|rankings?)\b|\bkeyword\s+(?:research|rankings?|analysis)\b|\bgoogle\s+(?:my\s+business|business\s+profile)\s+(?:listing\s+)?(?:optimi|set-?up|profile|ranking)/i;

// The cold-outreach opener. On its own it is what a genuine enquiry says too --
// "I was looking at your website and see you do panel upgrades" -- so it only
// counts next to something being sold about that website.
const AUDIT_OPENER =
  /\bi\s+(?:was\s+)?(?:just\s+)?(?:check(?:ed|ing)|look(?:ed|ing)\s+at|review(?:ed|ing)|visit(?:ed|ing)|came\s+across|stumbled\s+(?:up)?on|ran\s+(?:an?\s+)?(?:audit|analysis|scan)\s+on)\s+(?:your|the)\s+(?:web\s*site|website|site|page)\b/i;
const WEB_SELLING =
  /\b(?:redesign|re-?design|rebuild|revamp)\s+(?:your|the)\s+(?:web\s*site|website|site)\b|\bweb(?:site)?\s+(?:design|development|redesign)\s+(?:services?|compan|agenc|packages?)\w*|\bgoogle\s+(?:ads|adwords)\s+management\b|\bppc\s+management\b|\bsocial\s+media\s+(?:marketing|management)\s+(?:services?|packages?|plans?)\b|\bdigital\s+marketing\s+(?:services?|agenc|compan|packages?|plans?|proposal)\w*/i;

function isSearchMarketingPitch(t) {
  if (SEO_PITCH.test(t) || SEO_OFFER.test(t) || RANKING_PITCH.test(t)) return true;
  return AUDIT_OPENER.test(t) && WEB_SELLING.test(t);
}


// The bare token, and the carve-out that matters more than the rule. **Seo is a
// common Korean surname**, so a naive /\bseo\b/i over the whole rendered email
// diverts a real person by their name -- silently, because the sender is thanked
// either way. The token therefore runs ONLY against what the visitor actually
// wrote, with their name and every address removed first, and ONLY where the
// site opts in with `strictSeoToken` (shielddentalcare.com, where a patient
// booking a cleaning has no reason to type "SEO"). Everywhere else rule 6 is
// phrases only.
const SEO_TOKEN = /\bseo\b/i;

// Removes the things a Korean surname can legitimately be sitting in: every
// email address, and the value of any name row (which also clears it out of the
// subject line and the HTML copy, since all three carry the same string).
function stripIdentity(t) {
  const src = String(t).replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, ' ');
  // Collect every name value FIRST. Rewriting `src` inside the exec loop would
  // move the text out from under the regex's lastIndex and skip the next row --
  // which is exactly how "First name: Min / Last name: Seo" kept its surname.
  const names = [];
  const re = /^[ \t]*(?:full\s*name|first\s*name|last\s*name|name)[ \t]*:[ \t]*(.+?)[ \t]*$/gim;
  let m;
  while ((m = re.exec(src)) !== null) {
    const v = m[1].trim();
    if (v.length >= 2) names.push(v);
  }
  let out = src;
  for (const v of names) out = out.split(v).join(' ');
  return out;
}

function isSeoSolicitation(t, opts) {
  if (isSearchMarketingPitch(t)) return true;
  if (!(opts && opts.strictSeoToken)) return false;
  return SEO_TOKEN.test(stripIdentity(t));
}

// --- 7. Lead-generation / marketing-software pitch -----------------------
// The "Web Visitors Into Leads" widget template, sprayed at krwelectric365.com
// twice on one morning in September 2026 under two different names, each with a
// throwaway address in the phone box and a second address in an unlabelled
// field:
//
//   "Hello Krwelectric 365 Com Owner, My name is Linda and I'm betting you'd
//    like your website Krwelectric 365 Com to generate more leads. Here's how:
//    Web Visitors Into Leads is a software widget that works on your site,
//    ready to capture any visitor's Name, Email address, and Phone Number..."
//
// The heuristic screener scores this suspicious but not blocked, and a
// suspicious lead used to be delivered to the client with a tagged subject --
// so it reached the electrician anyway. It is a near-certain pitch, which makes
// it the blocklist's job, not the scorer's.
//
// The salutation is addressed to the SITE ("<domain> Com Owner,"), which is the
// one branch that stands alone: no customer greets a business that way. It is
// anchored to a greeting and a comma so that a real person writing "I am the
// website owner" mid-sentence is untouched.
const SITE_OWNER_SALUTATION =
  /\b(?:hello|hi|hey|dear|greetings|attention|attn)\b[^\n,.]{0,60}?\b(?:web\s*site|website|site|com|domain)\s+owner\s*[,:!]/i;

// Product names and offers that have no innocent reading on a client form.
const LEADGEN_PRODUCT =
  /\bweb\s+visitors?\s+into\s+leads\b|\btalk\s+with\s+web\s+visitors?\b|\bvisitors?\s+into\s+leads\b|\bsoftware\s+widget\b|\blead\s+(?:generation|gen)\s+(?:service|software|system|tool|widget|agenc|compan|campaign|program|package)\w*|\bwe\s+(?:can\s+)?(?:send|deliver|supply)\s+you\s+(?:more\s+)?(?:exclusive\s+|qualified\s+|verified\s+)?leads\b|\b(?:exclusive|qualified|verified)\s+leads?\s+(?:for|to)\s+your\s+business\b|\bpay\s+per\s+lead\b|\bcold[-\s]?(?:call|email)\s+(?:campaign|list|outreach)\b|\bemail\s+(?:marketing\s+)?lists?\s+(?:for\s+sale|of\s+\d)/i;

// "Generate more leads" aimed at the recipient's own WEBSITE. The bare phrase is
// deliberately not here: answering365 and pinnaclesalesandmail sell lead volume,
// and their genuine customers write "we want to generate more leads" as the
// thing they are BUYING. Tying it to "your website" keeps the pitch and drops
// the customer -- the widget template says "your website X to generate more
// leads", so it still blocks.
const MORE_LEADS_OFFER =
  /\bturn\s+(?:your\s+)?(?:web\s*site\s+)?visitors?\s+into\s+(?:leads|customers|callers)\b|\bconvert\s+(?:more\s+)?(?:web\s*site\s+)?visitors?\s+into\s+(?:leads|customers)\b|\byour\s+(?:web\s*site|website)\b[^.\n]{0,80}\b(?:generate|bring\s+in|capture)\s+(?:more\s+)?(?:leads|customers|calls)\b|\bin\s+front\s+of\s+(?:people|homeowners|customers|buyers)\s+(?:who\s+are\s+)?already\s+searching\b/i;

function isLeadGenPitch(t) {
  if (SITE_OWNER_SALUTATION.test(t)) return true;
  return LEADGEN_PRODUCT.test(t) || MORE_LEADS_OFFER.test(t);
}

// --- 8. Advance-fee / bequest fraud (419) ---------------------------------
// The message this rule was written for reached the JayComp client inbox on
// 22 Aug 2026, addressed to sales, the owner and two staff:
//
//   "Dear Beloved, My name is Mr. Andrew Walters. I have been battling cancer
//    for the past four years, and my condition has continued to deteriorate.
//    As I face these circumstances, I am seeking a trustworthy individual to
//    help fulfil a final charitable wish that is deeply important to me. I wish
//    to entrust you with the oversight of a humanitarian project valued at ..."
//
// It cleared the heuristic scorer with soft=0 and no hard signal: no markup, no
// shortener, no URL, and the spam vocabulary there covers pharma/casino/crypto/
// SEO but nothing in this family. The submitted phone, 247628273, is nine digits
// -- the junk-phone check only fires above eleven -- and "Andrew Walters" has a
// space, so the mashed-name check missed it too. Nothing was going to catch it.
//
// This is not merely spam. It is the opening move of an advance-fee scam: the
// reply is followed by a request for a "clearance fee" or bank details, and the
// target here is a business owner and his staff. It must never reach them.
//
// Same two-component discipline as the rules above, and for the same reason --
// a c-store design firm can plausibly receive a message that mentions illness,
// an estate, or a donation. Only the combination is conclusive:
//
//   HARD  a salutation or device that has no non-fraudulent use in a B2B lead
//         form ("Dear Beloved", "next of kin", "unclaimed funds", "trunk box").
//   PAIR  dying/bequest framing AND an ask to take custody of money or a
//         "project" -- neither half blocks on its own.
//
// Deliberately NOT included: "cancer", "estate", "donation", "charity" and
// "beneficiary" as standalone terms. A real customer can write any of them --
// "we're donating the old coolers", "this is for my father's estate" -- and on
// this site a false positive is a lost design-build lead.
const FRAUD_HARD =
  /\bdear(?:est)?\s+(?:beloved|friend\s+in\s+christ)\b|\bbeloved\s+(?:one|in\s+(?:christ|the\s+lord))\b|\bin\s+the\s+name\s+of\s+god\s+almighty\b|\bnext\s+of\s+kin\b|\b(?:unclaimed|dormant)\s+(?:funds?|account|deposit|estate)\b|\btrunk\s+box\b|\badvance[-\s]*fee\b|\bbenefici(?:ary|aries)\s+of\s+(?:my|the|this)\s+(?:will|estate|fund|inheritance)\b/i;

// Half one: the sender is dying, recently bereaved, or writing about a will.
const FRAUD_DYING =
  /\b(?:battl(?:ing|ed)|diagnosed\s+with|suffering\s+from|fighting)\s+(?:cancer|a\s+terminal|an?\s+incurable)|\bterminall?y\s+ill\b|\bfew\s+(?:months?|weeks?)\s+to\s+live\b|\bdoctors?\s+have\s+(?:given|told)\s+me\b|\bmy\s+condition\s+(?:has\s+)?(?:continued\s+to\s+)?(?:deteriorat|worsen)/i;

const FRAUD_WILL =
  /\b(?:last\s+)?will\s+and\s+testament\b|\bfinal\s+(?:charitable\s+)?wish\b|\bmy\s+(?:late|deceased)\s+(?:husband|wife|father|mother)\b|\bbefore\s+I\s+(?:die|pass\s+(?:on|away))\b|\bdeath\s*bed\b/i;

// Half two: the ask -- take custody of, or oversee, a large sum or "project".
const FRAUD_ASK =
  /\b(?:entrust|entrusting)\b[^.\n]{0,60}\b(?:you|your|oversight|custody|care)\b|\b(?:humanitarian|charitable|charity)\s+(?:project|cause|purpose|foundation)\b|\btransfer\s+(?:of\s+)?(?:the\s+)?(?:funds?|money|sum)\b|\b(?:sum|amount|funds?|project)\s+(?:valued\s+at|worth|of)\s*(?:USD|US\$|\$|EUR|GBP|£|€)?\s*[\d.,]+\s*(?:million|billion|m\b|bn\b)?|\b(?:trustworthy|honest|god[-\s]*fearing|reliable)\s+(?:individual|person|partner)\b|\bpercentage\s+of\s+the\s+(?:total\s+)?(?:sum|fund|amount)\b/i;

function isAdvanceFeeFraud(t) {
  if (FRAUD_HARD.test(t)) return true;
  const framing = FRAUD_DYING.test(t) || FRAUD_WILL.test(t);
  return framing && FRAUD_ASK.test(t);
}

// --- 9. Net-terms purchase-order fraud -------------------------------------
// The advance-fraud pattern aimed at equipment suppliers: a buyer poses as the
// procurement officer of a school district, church or government body, asks for
// a quote on several high-value units, and requests delivery on "Net 30/45/60"
// terms. The goods ship, the invoice is never paid. JayComp sells exactly the
// kind of high-ticket equipment (walk-in coolers, ice machines) this targets.
//
// CHANGED 2026-08-25 by client decision. Net terms used to require a second
// corroborating signal, on the reasoning that a genuine c-store chain asking
// "do you offer net 30?" is an ordinary B2B lead and a bare rule would divert
// those. In practice every terms request this form has received has been the
// fraud, so a bare net-terms or payment-terms request is now conclusive on its
// own.
//
// This is safe to make aggressive ONLY because a blocklist hit is not a drop:
// it is RE-ROUTED to the review inbox with a "[BLOCKED] " subject. A real chain
// asking about net 30 still lands somewhere a human reads and can forward by
// hand -- it just never reaches the client. Do not promote this rule into the
// heuristic scorer in route.ts, which DOES destroy what it flags.
const NET_TERMS = /\bnet[-\s]*(?:7|10|15|20|30|45|60|90|120)\b|\bnet[-\s]*\d{1,3}\s*days?\b/i;

// Terms asked for without the word "net". Requires an explicit money word in
// front of "terms" so that "terms and conditions" -- which appears in ordinary
// commercial email and in this site's own footer text -- does not fire.
const BARE_TERMS =
  /\b(?:payment|credit|billing|invoice|financing|purchase)\s+terms\b|\bnet\s+terms\b|\bterms\s+of\s+payment\b|\bopen\s+(?:up\s+)?(?:an?\s+)?(?:new\s+)?(?:credit|trade|net|business|wholesale)?\s*account\b|\bcredit\s+application\b|\bcredit\s+line\b|\bline\s+of\s+credit\b|\bpay(?:ment)?\s+(?:on|after|upon)\s+delivery\b/i;

// Procurement-desk vocabulary. Real buyers do use some of these, which is why
// they only count next to a net-terms request.
const PROCUREMENT =
  /\b(?:purchase\s*order|\bP\.?O\.?\b|procurement|purchasing\s+(?:dept|department|manager|officer|agent)|requisition|\bRFQ\b|\bW-?9\b|credit\s+application|payment\s+terms|terms\s+and\s+conditions|tax[-\s]*exempt|sole\s+source|net\s+terms)\b/i;

// Tells that carry the fraud on their own -- a first-contact web form for a
// refrigeration contractor has no innocent reason to name a freight forwarder
// or a third-party pickup agent, because JayComp delivers and installs.
const FREIGHT_PRETEXT =
  /\b(?:freight\s*forward(?:er|ing)|shipping\s+(?:agent|company|forwarder)|our\s+(?:own\s+)?(?:carrier|courier|shipper|trucking)|pick(?:ed|\s*)?[-\s]*up\s+(?:agent|by\s+our)|third[-\s]*party\s+(?:carrier|shipper)|arrange\s+(?:the\s+)?(?:shipping|pickup)\s+(?:with\s+)?our)\b/i;

// Institutional pretexts the scam leans on. Deliberately NOT sufficient alone:
// a school district really does buy walk-in coolers for its cafeterias.
const INSTITUTION =
  /\b(?:school\s+district|unified\s+school|university|college|seminary|church|parish|hospital|city\s+of\s+[a-z]|county\s+of\s+[a-z]|department\s+of\s+[a-z])\b/i;

// OFF unless `opts.netTermsFraud` is set. On JayCompDevelopment, which sells
// walk-in coolers, every terms request this form has ever received was the
// fraud, and the client asked for a bare rule. On a roofer or a law firm the
// same rule would divert an ordinary question about payment terms, so the
// aggression stays where it was earned.
function isNetTermsFraud(t) {
  // Any terms request at all -- see the note on NET_TERMS. Re-routed, not lost.
  if (NET_TERMS.test(t) || BARE_TERMS.test(t)) return true;
  // Freight-forwarder language alongside a purchase order is conclusive by
  // itself: that pairing has no legitimate reading on this site's quote form.
  if (FREIGHT_PRETEXT.test(t) && PROCUREMENT.test(t)) return true;
  // An institutional buyer naming a freight forwarder or their own carrier is
  // the same fraud without the terms request attached. JayComp delivers and
  // installs, so a school district arranging its own pickup of a walk-in cooler
  // has no innocent reading on a first-contact form.
  if (FREIGHT_PRETEXT.test(t) && INSTITUTION.test(t)) return true;
  // Retained for the case where the scam names an institutional pretext and a
  // procurement desk but phrases the terms request in a way the two patterns
  // above miss.
  return PROCUREMENT.test(t) && (FREIGHT_PRETEXT.test(t) || INSTITUTION.test(t));
}

// `opts.allowGuestPostPitch` exempts endpoints that exist to RECEIVE these
// pitches -- e.g. a site that sells guest posts and link insertions. Without it
// the blocklist would divert that site's paying customers. It covers rules 2
// AND 4: a site that sells placements is pitched in both vocabularies.
//
// `opts.allowFreelancePitch` (rule 5) is for a careers or "write for us"
// endpoint, which exists to receive exactly these.
//
// `opts.allowSearchMarketingPitch` (rules 6 and 7) is NOT optional politeness:
// eSEOspace's own forms sell search work and lead generation, so without it
// this module would divert every paying enquiry we receive.
//
// `opts.strictSeoToken` adds the bare-word branch of rule 6 -- see the carve-out
// above it. `opts.netTermsFraud` turns rule 9 ON.

function isBlockedText(t, opts) {
  if (!t) return false;
  if (isNamedSender(t)) return true;
  if (isUnpaidPlacementLeverage(t)) return true;
  // Checked ABOVE the guest-post exemption: `allowGuestPostPitch` exists for a
  // site that SELLS placements, which has nothing to do with fraud. Letting
  // these fall through would silently disable them on any endpoint that opted
  // out of rule 2.
  if (isAdvanceFeeFraud(t)) return true;
  if (opts && opts.netTermsFraud && isNetTermsFraud(t)) return true;
  if (!(opts && opts.allowFreelancePitch) && isFreelancePitch(t)) return true;
  const sellsSearch = !!(opts && (opts.allowSearchMarketingPitch || opts.allowSeoPitch));
  if (!sellsSearch && (isSeoSolicitation(t, opts) || isLeadGenPitch(t))) return true;
  if (opts && opts.allowGuestPostPitch) return false;
  return isGuestPostPitch(t) || isContentContributionPitch(t);
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

export { applyBlockedSenders, applyBlockedSendersToMessage, isBlockedText, isGuestPostPitch, isContentContributionPitch, isUnpaidPlacementLeverage, isFreelancePitch, isSearchMarketingPitch, isSeoSolicitation, isLeadGenPitch, isAdvanceFeeFraud, isNetTermsFraud, REVIEW_INBOX as reviewInbox };
