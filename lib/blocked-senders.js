// Blocklist for solicitations that come in through the public lead forms.
//
// Nineteen rules, all deliberately DIFFERENT from the heuristic spam scoring used
// elsewhere: those weigh probabilistic signals (gibberish, pasted URLs, odd
// scripts) and so must stay conservative. These match specific, recognisable
// sales pitches, so a hit is near-certain rather than a guess.
//
//   1. A named bulk sender, a listed address or phone number, or a
//      virtual-assistant outsourcing pitch ("VAs4HIRE", "VAS Direct", "we
//      offer Virtual Assistants powered by our AI tool").
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
//      Google and other major search engines"), including the softer audit
//      tease that never names a service or a price ("a few areas where SEO
//      improvements could help you get more traffic from Google ... I can
//      share a short audit and some ideas to improve rankings").
//   7. A lead-generation or marketing-software pitch ("Hello <domain> Com
//      Owner ... Web Visitors Into Leads is a software widget").
//   8. Advance-fee / bequest fraud ("Dear Beloved, I have been battling cancer
//      ... I wish to entrust you with a humanitarian project valued at $X").
//   9. Net-terms purchase-order fraud ("please quote 4 walk-in coolers, we pay
//      Net 45, ship to our freight forwarder") -- OFF unless the site asks for
//      it, because a real B2B buyer asks about net 30.
//  10. A spec-website pitch ("I went ahead and built <Biz> a new website. It's
//      yours for $999 one-time").
//  11. A spec AI-agent pitch ("I've built and trained an AI employee
//      specifically for <Biz> ... a 20-minute demo").
//  12. A B2B vendor cold pitch -- any trade ("reaching out to see if you guys
//      need any bookkeeping services for your business?").
//  13. A construction estimating / takeoff outsourcing pitch ("Let us be your
//      estimation partner ... provide us with your plans").
//  14. A virtual-assistant / offshore staffing pitch, including one that
//      says so only in the sender's domain ("bianca@toptalentvas.com").
//  15. A withheld website-critique tease -- rule 6 with every sellable noun
//      stripped out ("I was taking a quick look through your website and
//      jotted down a couple of ideas that could improve the site's
//      visibility. Would you like me to send them over?").
//  16. A generated name plus Russian contact details -- a form-spam tool's
//      name ("Michaelsof", "DonaldapofsNE") next to a .ru address or a
//      Russian number. Both halves required: a real Russian-speaking client
//      writes from mail.ru under a real name and is delivered.
//  17. A soft marketing tease or B2B cold pitch that dodges 6/12/15 ("how it
//      sits on Google ... I do SEO", "appears when people ask ChatGPT", "We
//      help ... businesses" + a sales close, contractor financing, "compare
//      your current policy", a broker's "buyers ... in your industry").
//  18. A paid media-feature or award pitch ("the providers who show up are
//      the ones featured in trusted health media ... Being featured gets you:
//      print placement", "~749,000 visits a month").
//  19. Anyone offering or asking for links, in any wording ("links from high
//      authority sites", "DA 50+", "reciprocal links", "add our guide to your
//      resources page", a bare "backlinks") -- off where the site sells SEO.
//  21. An intimate-photo lure or a shortened link from a Russian number ("Hi,
//      this is Irina. I am sending you my intimate photos as I promised.
//      https://tinyurl.com/...") -- phishing/malware bait, not a pitch.
//  25. A form-testing bot's tracking token -- the same digit run wrapped in
//      capital-letter noise in two fields ("NARTYTRYUT1395855NEWETREWT" as
//      the name, "MEJTYJY1395855MAMYJRTH" as the message).
//  23. Sell-side M&A / investment-bank outreach ("I head up deal origination
//      ... whether a sale is on your radar"); opts.allowAcquisitionPitch skips it.
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
const BLOCKED_ADDRESSES = [
  // 23 Nov 2026 leaks (rules 79-80): Presap review-reply pitch, North Fox Digital article bait.
  'presap.com',
  'northfoxdigital.com',
  // 22 Nov 2026 leak batch (rules 67-78): crypto giveaway link, Wikipedia page seller, proxy-spam mailbox + link, replica goods, franchise developer, pay-per-lead intro.
  'tokenxinc.com',
  'proonlinepage.com',
  'mailnorms.com',
  'atpimety.com',
  'decentgears.com',
  'franchisecreator.com',
  'langdaleadvisory.com',
  'viperagency',
  'robozservice.com',
  // "Megan Piran" / Named & Found (Moneli Automation Inc.) AI-answers pitch (rule 66), rebeccarabinpsyd.com 22 Nov 2026.
  'namedandfound.com',
  // "guadalupesh3" porn link spam (rule 65), laurabasscounseling.com 18 Nov 2026: throwaway <first>.<last>.emailinbox.top sender and the linked site.
  'emailinbox.top',
  'biggaysex.com',
  // Robot-training POV video pitch (rule 64), 18 Nov 2026, same phone each time: "Michael Turner" Whitmore Data Partners (dencofuses.com), "Elena Rossi" Medici 55 (andersonautoshow.com), "Sarah Mitchell" Fairhaven Data (colacityroofing.com).
  'whitmoredatapartners.com',
  'medici55.com',
  'getfairhavendata.com',
  // "Tyler Foster" / United Marketing LLC (cpwgo.com) AI-answering and discount-code text-back pitches (rule 62), colacityroofing.com 5 + 17 Nov 2026, roofstellar Nov 2026.
  'cpwgo.com',
  'cpw@bd-126789654.com',
  // "RonaldPaupe" exam-tutoring link (rule 61), laurabasscounseling.com, 17 Nov 2026. Throwaway domain.
  'wormail888.com',
  // "Test User" form probe, no message, +7 999 000-00-00, laurabasscounseling.com, 17 Nov 2026.
  'szidqmhj911@hotmail.com',
  // Ad Grants Lab Google Ads pitch (rule 57), laurabasscounseling.com, 15 Nov 2026. Substring: domain and signature.
  'adgrantslab',
  // Bright Sphere Janitorial cleaning pitch (rule 60), laurabasscounseling.com, 16 Nov 2026.
  'brightspherejanitorial',
  // AutoMaxRevenue booked-jobs / 24-7 receptionist pitch (rule 55), colacityroofing.com, 12-15 Nov 2026. Substring: covers the domain and the signature.
  'automaxrevenue',
  // Engelsberg Partners business funding pitch (rule 48), spiral2grow, 9 Nov 2026.
  '@engelsbergpartners.com',
  // HeyLending line-of-credit pitch (rule 48), heatherstaxserviceandmore.com, 12 Nov 2026.
  '@heylending.com',
  // Melotto Group website refresh pitch (rule 45), 8 Nov 2026.
  '@melottogroup.com',
  // Amazing Lead Gen 30-second call pitch (rule 46), Laura Bass Counseling, 8 Nov 2026.
  'amazingleadgen.com',
  '@ultraleadgeneration.com',
  // Design issues audit tease (rule 47), spiral2grow, 8 Nov 2026. Substring: digits may rotate.
  'mvmarcovillarreal',
  // "Joanna" (joannariggs56@gmail.com) $195 promo-video pitch (rule 44), DENCO Fuses, 7 Nov 2026. Substring: same sender rotates digits.
  'joannariggs',
  // "Jason Horowitz" (Renaissance Data Lab) AI data licensing pitch (rule 43), A&M Law, 6 Nov 2026.
  '@renaissancedatalabs.com',
  '@renaissancedatalab.com',
  // "Sunny Gupta" (Signal Set) homepage-version offer (rule 42), DENCO Fuses, 30 Oct 2026. Domain-wide: he uses sunny+<tag>@ and also wrote as sunny@lifebaselabs.com (rule 34).
  '@signalsetbase.com',
  '@lifebaselabs.com',
  // "Jonathan Pierce" top-of-search pitch (rule 41), drlauralehmann.com, 30 Oct 2026.
  'jonathan.pierce@jmailservice.com',
  // 9 Human Types video pitch (rule 39), 28 Oct 2026.
  'deering.rolando@gmail.com',
  // Sea Stars bookkeeping firm pitch (rule 38), 27 Oct 2026.
  'yourbooks@seastarsacct.com',
  // LocalCustomers.ai AI chat-widget pitch (rule 37), 26 Oct 2026.
  'rebecca@localcustomers.ai',
  // fleet.hamish AI faceless-video tool pitch (rule 36), laurabasscounseling.com, 22 Oct 2026.
  'fleet.hamish@hotmail.com',
  // "Erik Larson" branded job-tracker pitch (rule 35), colacityroofing.com, 22 Oct 2026.
  'localbizhelperai@gmail.com',
  // "Sunny" homepage rebuild pitch (rule 34), linenoakrentals.com, 22 Oct 2026.
  'sunny@lifebaselabs.com',
  // "David Schipper" priced SEO offer (rule 33), elonhealthurgentcare.com, 22 Oct 2026.
  'david@dig1.com',
  // "Bowen Bryant" follow-up content pitch (rule 32), colacityroofing.com, 20 Oct 2026.
  'bbryantdigital@gmail.com',
  // "Albert Alex" guest-post site price list (rule 31), murphyaccounting.com, 20 Oct 2026.
  'albertalex.ceo@gmail.com',
  // "Meredith White" reply YES/STOP VA pitch (rule 30), drjohnshershow.com, 16 Oct 2026.
  'virtualhelpdesk.pro',
  // "AIFlipDomains" lifetime-deal pitch (rule 27), laurabasscounseling.com, 15 Oct 2026.
  'aiflipdomains.com',
  'madeleine@vasdirect.com',
  // GetDandy spec AI-agent pitch (rule 11), hjpropertycare.com, Sep 2026.
  '@getdandynow.com',
  'getdandy.com/',
  // "Julia Miller" @turbojot hit mymontanalawyer, adjustermanllc and
  // infinitedentalwellness in Sep 2026.
  'turbojot.com',
  // Vendor pitches that reached mymontanalawyer.com's client inbox, Sep 2026.
  'bookkeepingleads.com',
  'virtualbookkeeping.services',
  'the108grp.com',
  // "Bianca Foster" VA-staffing outreach, lapbandla.com, 17 Sep 2026.
  'toptalentvas.com',
  // Same VA shop, later domains (lapbandla, roofstellar, heatherstax,
  // criminaldefenselawcenterwestmichigan), Sep-Oct 2026.
  'vettedvas.com',
  'virtualhandsupport.com',
  'virtualeaseservice.com',
  'businesscoachvas.com',
  'vaelitecrew.com',
  // colacityroofing.com, Jul-Aug 2026 (rule 17 notes): the "forward the project
  // location, plans, scope of work" lure and the inspection-photo request --
  // spam only to a residential roofer, so listed by sender, not as a phrase.
  'comforceresource.info',
  'humility535@gmail.com',
  'derrickwilliams323@aol.com',
  // "Heather Mahoney", Your Health Magazine paid-feature pitch (rule 18),
  // shielddentalcare.com, 25 Sep 2026.
  'theyourhealthmedia.com',
];

// Phone numbers that have sprayed the estate's forms. Kept separate from
// BLOCKED_ADDRESSES because a number arrives formatted a dozen ways -- "(307)
// 207-6448", "307-207-6448", "+1 307 207 6448" -- so the comparison is made on
// digits only instead of as a literal substring. BLOCKED_SENDER_PHONES
// (comma-separated) adds more per-site without a deploy.
//
// 3072076448: the same Wyoming number and the same fake "Gould St" address hit
// colacityroofing.com's estimate form on 18 and 21 Sep 2026 behind two
// different names ("Roberts Emma", "Erika Fox"), two throwaway gmails and two
// different pitch templates -- the withheld critique tease of rule 15 and the
// SEO audit tease of rule 6. Listed 21 Sep 2026 so the next template it tries
// is dead on arrival.
//
// 3014779097: the Your Health Magazine sales line (rule 18), 25 Sep 2026.
const BLOCKED_PHONES = [
  // 23 Nov 2026 leaks (rules 79-80): Doron / Presap, Neil Fox / North Fox Digital.
  '8555954040',
  '9783557611',
  // 22 Nov 2026 leak batch (rules 67-78): Julie Barker (Wikipedia seller), GregoryErats (proxy spam), David Lin (replica goods), Aidan Sowa (press placement).
  '18149805065',
  '86627873355',
  '5918564588',
  '4012194207',
  // "Megan Piran" / Named & Found AI-answers pitch (rule 66), rebeccarabinpsyd.com, 22 Nov 2026.
  '2264070386',
  // "guadalupesh3" porn link spam (rule 65), 18 Nov 2026. All 11 digits: not a US number.
  '85433327983',
  // Robot-training POV video pitch (rule 64): the one number used by Whitmore Data Partners, Medici 55 and Fairhaven Data, 18 Nov 2026.
  '2674892720',
  // "Tyler Foster" / cpwgo (rule 62): sender numbers 17 Nov and 5 Nov 2026, and the 5 Nov demo line.
  '6507284041', '4243927064', '4243882928',
  // "RonaldPaupe" (jacklee@wormail888.com), laurabasscounseling.com, 17 Nov 2026. Eleven digits
  // on purpose: the last ten alone are a valid Alberta number.
  '85877435827',
  // +7 999 000-00-00, a Russian placeholder sent twice by a "Test User" probe with no
  // message, laurabasscounseling.com, 17 Nov 2026. 999 is not a US area code.
  '9990000000',
  // Ad Grants Lab ("Ivan Ramirez") text-only number, laurabasscounseling.com, 15 Nov 2026.
  '3472927825',
  // Bright Sphere Janitorial ("Jennifer Newman"), laurabasscounseling.com, 16 Nov 2026.
  '7048101127',
  // "Brent Fowler" / AutoMaxRevenue booked-jobs pitch (rule 55), colacityroofing.com, 12-15 Nov 2026.
  '4786062782',
  // Johnny Bennet business funding pitch (rule 48), 9 Nov 2026.
  '6605308999',
  // Daniela Brown / HeyLending line-of-credit pitch (rule 48), 12 Nov 2026.
  '9294510548',
  // Emily Horowitz / HeyLending line-of-credit pitch (rule 48), ctuprecast.com, 12 Nov 2026.
  '3322650851',
  // Sarah Kaplan / HeyLending line-of-credit pitch (rule 48), eseospace.com, 12 Nov 2026.
  '9293090872',
  // Hannah Melotto website refresh pitch (rule 45), 8 Nov 2026.
  '2158218810',
  // "Jonathan Pierce" top-of-search pitch (rule 41), drlauralehmann.com, 30 Oct 2026.
  '8054002077',
  // Sea Stars bookkeeping firm pitch (rule 38), 27 Oct 2026.
  '5102014888',
  // LocalCustomers.ai AI chat-widget pitch (rule 37), 26 Oct 2026.
  '8443472695',
  // "Erik Larson" branded job-tracker pitch (rule 35), colacityroofing.com, 22 Oct 2026.
  '2084316379',
  // "David Schipper" priced SEO offer (rule 33), elonhealthurgentcare.com, 22 Oct 2026.
  '2104936193',
  
  // "Bowen Bryant" follow-up content pitch (rule 32), colacityroofing.com, 20 Oct 2026.
  '8643159876',
  
  // "Albert Alex" site price list (rule 31), danielsonservices.com, 20 Oct 2026.
  '3706755543',
  '3072076448', '3014779097',
  // VA-staffing shop callback numbers (rule 14), Sep-Oct 2026.
  '3393374666', '1870266254', '3323731110', '2138669729', '7252402254', '2168596131',
];

function isBlockedPhone(t) {
  const extra = (process.env.BLOCKED_SENDER_PHONES || '')
    .split(',')
    .map((s) => s.replace(/\D/g, ''))
    .filter((s) => s.length >= 10);
  const list = BLOCKED_PHONES.concat(extra).filter((p) => p.length >= 10);
  if (!list.length) return false;
  // Squashing the whole message to digits is what makes the formatting
  // irrelevant. It can in principle join two adjacent fields into a match, but
  // a ten-digit run has to line up exactly, so a zip plus a phone will not do
  // it by accident.
  const digits = String(t).replace(/\D/g, '');
  return list.some((p) => digits.includes(p));
}

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
  if (isBlockedAddress(t) || isBlockedPhone(t)) return true;
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
  /\bsearch\s+engine\s+optimi[sz](?:ation|ing|e|ers?)\b|\bseo\s*[-\/]?\s*(?:services?|agency|agencies|compan(?:y|ies)|firms?|experts?|specialists?|consultants?|consultancy|professionals?|freelancers?|teams?|audits?|analysis|reports?|proposals?|packages?|plans?|quotes?|pricing|campaigns?|strateg(?:y|ies)|rankings?|traffic|growth|visibility|authority|backlinks?|outsourcing|reseller|marketing)\b|\b(?:local|technical|on[-\s]*page|off[-\s]*page|white[-\s]*label|affordable|guaranteed)\s+seo\b|\brank(?:ing)?\s+(?:your|the)\s+(?:web\s*)?site\b/i;

// The two phrasings shielddentalcare's list does not carry: SEO named as being
// "for your" site, and a flat "we do SEO".
const SEO_OFFER =
  /\b(?:local\s+)?seo\s+(?:for\s+your|of\s+your)\b|\bwe\s+(?:do|provide|offer|handle)\s+seo\b/i;

// Split in two on 17 Sep 2026. The old single regex diverted "we are looking
// for help with our website content and Google rankings this quarter" -- a
// prospect describing their OWN site, which is a real lead on every site in the
// estate and was being answered by nobody. The tell is WHOSE rankings: a vendor
// talks about YOURS.
//
// Tier one, aimed at the recipient, still stands alone.
const RANKING_PITCH_DIRECTED =
  /\brank(?:ing)?\s+(?:your|the)\s+(?:web\s*site|website|site|business|page)\b|\brank\s+(?:you\s+)?(?:higher|number\s*one|#\s*1|on\s+the\s+first\s+page)\b|\bimprove\s+your\s+(?:google\s+)?(?:search\s+)?(?:ranking|rankings|visibility|online\s+presence)\b|\bincrease\s+your\s+(?:web\s*site\s+|website\s+)?(?:traffic|rankings?|visibility|organic)\b|\byour\s+(?:web\s*site|website|site|business|page|listing)\b[^.\n]{0,40}?\b(?:is\s+|are\s+)?(?:not|isn'?t|aren'?t)\s+rank\w*|\bgoogle\s+(?:my\s+business|business\s+profile)\s+(?:listing\s+)?(?:optimi|set-?up|profile|ranking)/i;

// Tier two is the vocabulary itself. A customer uses every one of these about
// their own site, so each needs a second signal before it counts.
const RANKING_TOPIC =
  /\b(?:first|1st)\s+page\s+of\s+google\b|\bpage\s*(?:one|1)\s+of\s+google\b|\btop\s+of\s+google\b|\btop\s+(?:10|ten|5|five)\s+(?:on|in)\s+google\b|\bnot\s+rank(?:ing|ed)?\s+(?:on|in|well|high)\b|\bisn'?t\s+rank(?:ing|ed)\b|\bgoogle\s+(?:search\s+)?rankings?\b|\bsearch\s+engine\s+rankings?\b|\borganic\s+(?:traffic|rankings?|search)\b|\bkeyword\s+(?:research|rankings?|analysis)\b|\b(?:more|additional|extra|increased)\s+(?:traffic|visitors|clicks|impressions)\s+from\s+(?:google|search\s+engines?|search)\b|\btraffic\s+from\s+(?:google|search\s+engines?)\b|\bseo\s+(?:improvements?|issues?|problems?|errors?|mistakes?|fixes?|tweaks?|gaps?|opportunit(?:y|ies)|work|health|score|performance|results?)\b|\bimprove\s+(?:the\s+)?(?:rankings?|seo|search\s+rankings?|google\s+rankings?|search\s+visibility)\b/i;

// The second signal: the sender selling, not the sender asking. Deliberately
// excludes a bare "our team" and "our company" -- a prospect says "our team
// needs help with our Google rankings", which is the lead this fix exists for.
const SALES_SIGNAL =
  /\bwe\s+(?:can|could|will|would|are\s+able\s+to)\s+(?:help|get|put|place|boost|improve|increase|rank|drive|bring)\b|\bour\s+(?:seo|marketing|digital)\s+(?:agency|team|compan(?:y|ies)|experts?|specialists?|packages?|services?)\b|\bour\s+agency\b|\bfree\s+(?:audit|analysis|report|proposal|consultation|quote|trial|demo|sample)\b|\bno\s+obligation\b|\bwould\s+you\s+(?:be\s+)?(?:interested|like)\s+(?:in|to)\b|\bif\s+(?:you(?:'re|\s+are)\s+interested|interested)\b|\bi\s+(?:can|could)\s+(?:send|share|show|provide)\s+you\b|\bschedule\s+a\s+(?:call|meeting|demo)\b|\bmonthly\s+(?:package|plan|retainer|price|pricing)\b/i;

// The cold-outreach opener. On its own it is what a genuine enquiry says too --
// "I was looking at your website and see you do panel upgrades" -- so it only
// counts next to something being sold about that website.
const AUDIT_OPENER =
  /\bi\s+(?:was\s+|have\s+|had\s+|just\s+|recently\s+)*(?:check(?:ed|ing)|look(?:ed|ing)\s+(?:at|through|over|around)|review(?:ed|ing)|visit(?:ed|ing)|browsed?|browsing|went\s+through|going\s+through|came\s+across|stumbled\s+(?:up)?on|ran\s+(?:an?\s+)?(?:audit|analysis|scan)\s+on|(?:took|taking|had|having)\s+a\s+(?:quick\s+|closer\s+|brief\s+|proper\s+|second\s+)?look\s+(?:at|through|over|around))\s+(?:your|the)\s+(?:web\s*site|website|site|page|homepage)\b/i;
const WEB_SELLING =
  /\b(?:redesign|re-?design|rebuild|revamp)\s+(?:your|the)\s+(?:web\s*site|website|site)\b|\bweb(?:site)?\s+(?:design|development|redesign)\s+(?:services?|compan|agenc|packages?)\w*|\bgoogle\s+(?:ads|adwords)\s+management\b|\bppc\s+management\b|\bsocial\s+media\s+(?:marketing|management)\s+(?:services?|packages?|plans?)\b|\bdigital\s+marketing\s+(?:services?|agenc|compan|packages?|plans?|proposal)\w*/i;

// A second signal of its own, added 21 Sep 2026: the sender offering to hand
// over a WRITE-UP of the recipient's site. SALES_SIGNAL already carries "free
// audit" and "I can send you", and this template says neither -- it says "I can
// share a short audit and some ideas to improve rankings", with no "free" and no
// "you" for those patterns to anchor to. On its own an offered report has an
// innocent reading on a client form (an adjuster's report, an inspection
// report, a survey), so it never stands alone -- it only counts next to the
// search vocabulary in RANKING_TOPIC.
const AUDIT_OFFER =
  /\b(?:(?:i|we)\s+(?:can|could|will|shall)|i(?:'|\u2019)?ll|(?:be\s+)?(?:happy|glad|able)\s+to|let\s+me\s+know\s+if\s+you(?:'|\u2019)?d?\s*(?:would\s+)?(?:like|want))\b[^.\n]{0,35}?\b(?:send|share|email|forward|pass|shoot|put\s+together|pull\s+together|prepare|run|provide)\b[^.\n]{0,45}?\b(?:audit|analysis|report|assessment|breakdown|write[-\s]?up)\b/i;

function isSearchMarketingPitch(t) {
  if (SEO_PITCH.test(t) || SEO_OFFER.test(t) || RANKING_PITCH_DIRECTED.test(t)) return true;
  if (RANKING_TOPIC.test(t) && (SALES_SIGNAL.test(t) || AUDIT_OPENER.test(t) || WEB_SELLING.test(t) || AUDIT_OFFER.test(t))) return true;
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
    const v = (m[1] ?? '').trim();
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
  /\bweb\s+visitors?\s+into\s+leads\b|\btalk\s+with\s+web\s+visitors?\b|\bvisitors?\s+into\s+leads\b|\bsoftware\s+widget\b|\blead\s+(?:generation|gen)\s+(?:service|software|system|tool|widget|agenc|compan|campaign|program|package)\w*|\bwe\s+(?:can\s+)?(?:send|deliver|supply)\s+you\s+(?:more\s+)?(?:exclusive\s+|qualified\s+|verified\s+)?leads\b|\b(?:exclusive|qualified|verified)\s+leads?\s+(?:for|to)\s+your\s+business\b|\bpay\s+per\s+lead\b|\bcold[-\s]?(?:call|email)\s+(?:campaign|list|outreach)\b|\bemail\s+(?:marketing\s+)?lists?\s+(?:for\s+sale|of\s+\d)|\bautomates?\s+(?:web\s*site\s+|contact\s+)?form\s+submissions?\b|\bfinds\s+the\s+(?:contact\s+)?forms\s+and\s+submits\b|\bpay\s+(?:only\s+)?for\s+successful\s+submissions?\b|\b(?:contact|web\s*site)\s+form\s+(?:marketing|blasting|outreach|submission\s+service)\b/i;

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

// --- 10. Spec-website pitch -----------------------------------------------
// Received on colacityroofing.com's estimate form, 13 Sep 2026, name "James --
// KCG MEDIA", service "Not sure -- need an inspection":
//
//   "I built Cola City Roofing a new website Hey Cola City Roofing. I went ahead
//    and built Cola City Roofing a new website. Here it is:
//    https://tinyurl.com/2xkgtgyp. It's yours for $999 one-time, and we..."
//
// Rule 6 only catches web-design selling behind an "I checked your website"
// opener, and this template has none -- it opens with the finished product.
//
// Two components, never one. A claim that the sender already BUILT a website,
// plus the sale of it (a price, "it's yours", "here it is:"). A homeowner can
// say "we just built a new website for our business" and a GC can quote "$999
// one-time"; only the combination is a pitch. "site" alone is deliberately not
// a website noun here -- "job site" and "built a new site office" are roofing
// vocabulary.
const BUILT_SITE_CLAIM =
  /\b(?:i|we)(?:'ve|\s+have)?\s+(?:(?:went|gone)\s+ahead\s+and\s+|already\s+|just\s+|actually\s+|took\s+the\s+liberty\s+(?:of|and)\s+)*(?:built|made|designed|created|redesigned|rebuilt|mocked\s+up|put\s+together|building|designing|creating)\b([^.\n]{0,60}?)\b(?:web\s*site|website|landing\s+page|home\s*page|web\s+page)\b([^.\n]{0,20})/i;
// Whose website. The pitch builds one FOR the recipient ("built Cola City
// Roofing a new website", "built you a homepage"); a customer describing their
// own ("we built a new website for our bakery") is not selling anything.
const OWN_SITE_BEFORE = /\b(?:our|my|us|me|myself|ourselves)\b/i;
const OWN_SITE_AFTER = /^\s*(?:for|of)\s+(?:our|my|me|us)\b/i;
const BUILT_SITE_SALE =
  /\bit'?s\s+(?:all\s+)?yours\b|\byours\s+for\s+(?:just\s+|only\s+)?\$|\$\s?\d[\d,]*(?:\.\d\d)?\s*(?:one[-\s]?time|flat|total|once)\b|\bone[-\s]?time\s+(?:fee|payment|price|cost|charge)\b|\bno\s+(?:monthly|recurring|hidden)\s+(?:fees?|costs?|charges?)\b|\bhere\s+it\s+is\s*[:\-]|\b(?:take\s+a\s+look|check\s+it\s+out|preview\s+(?:it\s+)?here)\s*[:\-]|\bclaim\s+(?:it|your\s+(?:new\s+)?(?:web\s*site|website))\b|\bgo\s+live\s+(?:today|this\s+week|in\s+\d+)/i;

function isSpecWebsitePitch(t) {
  const m = BUILT_SITE_CLAIM.exec(t);
  if (!m || OWN_SITE_BEFORE.test(m[1] ?? '') || OWN_SITE_AFTER.test(m[2] ?? '')) return false;
  return BUILT_SITE_SALE.test(t);
}

// --- 11. Spec AI-agent pitch ----------------------------------------------
// The same move as rule 10 with an AI product in place of the website. GetDandy
// sent it to hjpropertycare.com's contact form twice, on 5 and 14 Sep 2026,
// under two addresses and phone numbers, each time as a "service request":
//
//   "Yesterday I spent a few hours making an AI agent forHJ Property Care and
//    Tree Services. I trained it on all the information I could find about your
//    business... if you don't make at least three times your money back, I'll
//    give you a full refund. Do you have 15 minutes today or tomorrow?"
//
//   "I've built and trained an AI employee specifically for HJ Property Care
//    and Tree Services... It's a 20-minute demo where you can actually interact
//    with the AI employee... Schedule a time on my calendar to meet the agent I
//    trained for you"
//
// Neither mentions SEO, leads-as-a-product or a website, so rules 6, 7 and 10
// all miss it -- and HJ's lead store made both senders marketing contacts.
//
// Two components, never one. A claim that the sender built or trained an AI
// agent/employee/receptionist, plus the demo-booking close ("20-minute demo",
// "grab a time", "money back"). A customer can say "we set up an AI receptionist
// for our office" and can ask to "schedule a time"; only the combination is a
// pitch, and the whose-agent check drops the customer's own. The tokens are
// kept apart ("forHJ") because the template glues the business name on.
const AI_PRODUCT = String.raw`\b(?:ai|a\.i\.|artificial\s+intelligence)[-\s]+(?:powered\s+)?(?:agents?|employees?|receptionists?|assistants?|chat\s*bots?|bots?|voice\s+agents?|phone\s+agents?|team\s+members?|sales\s+reps?|staff|workers?)\b`;
const AI_BUILT_CLAIM = new RegExp(
  String.raw`\b(?:i|we)(?:'ve|’ve|\s+have)?\s+(?:(?:went|gone)\s+ahead\s+and\s+|already\s+|just\s+|actually\s+|spent\s+[^.\n]{0,30}?\s+)*(?:built|made|making|trained|training|created|creating|designed|developed|building|set\s+up|setting\s+up|put\s+together|custom[-\s]?built)\b([^.\n]{0,40}?)` +
    AI_PRODUCT +
    String.raw`([^.\n]{0,20})`,
  'i',
);
const AI_SALE =
  /\b\d{1,2}[-\s]?min(?:ute)?s?\s+(?:demo|walk-?through|call|chat|meeting)\b|\bquick\s+(?:demo|walk-?through)\b|\bdo\s+you\s+have\s+(?:\d{1,2}|a\s+few)\s+minutes\b|\bgrab\s+a\s+time\b|\b(?:schedule|book|pick)\s+a\s+(?:time|call|chat|demo)\b|\bon\s+my\s+calendar\b|\bmoney\s+back\b|\bfull\s+refund\b|\btrained\s+(?:it|her|him|them)\s+on\b[^.\n]{0,80}\byour\b|\bmeet\s+the\s+(?:ai\s+)?(?:agent|employee|assistant|receptionist)\b/i;

function isSpecAiAgentPitch(t) {
  const m = AI_BUILT_CLAIM.exec(t);
  if (!m || OWN_SITE_BEFORE.test(m[1] ?? '') || OWN_SITE_AFTER.test(m[2] ?? '')) return false;
  return AI_SALE.test(t) || BOOKING_LINK.test(t);
}

// --- 12. B2B vendor cold pitch -------------------------------------------
// Rules 5-7 each name ONE trade. This is the shape every other vendor uses.
// Received on mymontanalawyer.com's contact form, September 2026, filed under
// "Cooperative Family Law" (the first option in the dropdown) with a toll-free
// phone number:
//
//   "Hello, I was reaching out to see if you guys need any bookkeeping services
//    for your business? VirtualBookkeeping.Services matches you with bookkeepers
//    who specialize in your business. Check out VirtualBookkeeping.Services to
//    get a free quote from competing bookkeepers."
//
// Nothing in rules 1-11 matched. The tell is DIRECTION: a customer asks whether
// the business can help THEM; a vendor asks whether the business NEEDS
// something, and names the recipient's business as the thing being served.
//
// Two components, never one. Deliberately excluded from the opener: "would be
// interested in", "would like", "are looking for" -- "I'm reaching out to see if
// your firm would be interested in taking my case" is a real lead.
const VENDOR_OPENER =
  /\breach(?:ing)?\s+out\s+to\s+(?:see|ask|find\s+out|check)\s+(?:if|whether)\s+(?:you|your\s+(?:team|firm|business|company|office))(?:\s+guys)?\s+(?:need|needs|could\s+use|would\s+benefit\s+from|are\s+in\s+need\s+of)\b|\bdo(?:es)?\s+(?:you|your\s+(?:team|firm|business|company|office))(?:\s+guys)?\s+(?:need|require|currently\s+use|outsource)\s+(?:any\s+)?(?:help\s+with\s+)?(?:[\w-]+\s+){0,3}?services\b|\bneed\s+(?:any|some)\s+(?:help\s+with\s+)?(?:[\w-]+\s+){0,3}?services\s+for\s+your\b/i;
const VENDOR_TARGET =
  /\b(?:for|to|grow|scale|run)\s+your\s+(?:business|firm|company|practice|law\s+firm|office|agency)\b|\bspeciali[sz]e\s+in\s+(?:your\s+(?:business|industry)|businesses\s+like\s+yours|law\s+firms)\b|\bbusinesses\s+like\s+yours\b|\bfree\s+(?:quotes?|consultation|trial|demo|audit)\s+from\b|\bmatch(?:es)?\s+you\s+with\b/i;

function isVendorPitch(t) {
  return VENDOR_OPENER.test(t) && VENDOR_TARGET.test(t);
}

// --- 13. Construction estimating / takeoff outsourcing pitch ---------------
// Received on krwelectric365.com's contact form, 14 Sep 2026, from a gmail
// "estimtor" address with a Houston number, submitted from Lahore:
//
//   "Let us be your estimation partner. We do cost estimation and quantity
//    takeoff of any type of construction. Please, provide us with your plans in
//    PDF or any other form and mention their scope then we will move forward.
//    I'd be happy to send over a few sample estimates on your request."
//
// Earlier on the same form: "I'm a Senior Estimator specializing in plumbing
// takeoffs and cost estimating... kindly let us know and send over the
// plans/drawings." Rule 12 needs "do you need ... services", which neither asks.
//
// Two components, never one, because a general contractor is a REAL customer on
// a trades site and writes "we need electrical takeoffs and pricing, I'll send
// over the plans". Half one: the SENDER does the estimating ("we do cost
// estimation", "estimator specializing in", "estimation partner"). Half two:
// the vendor's close -- asking for the RECIPIENT'S plans, or offering sample
// estimates. A GC sends its own plans; it never asks for "your plans".
const ESTIMATING_OFFER =
  /\b(?:we|i)\s+(?:also\s+)?(?:do|provide|offer|deliver|handle|prepare|speciali[sz]e\s+in)\b[^.\n]{0,40}?\b(?:cost\s+estimat(?:ion|ing|es?)|estimating|estimation|quantity\s+(?:take-?offs?|survey\w*)|(?:material|construction|electrical|plumbing|mechanical|hvac|roofing|drywall|concrete|framing|lumber|steel)\s+take-?offs?|take-?off\s+services?)\b|\bestimat(?:ion|ing)\s+(?:partner|services?|company|firm|agency|solutions?)\b|\b(?:take-?off|quantity\s+surveying)\s+(?:partner|services?|company|firm|solutions?)\b|\bestimators?\s+speciali[sz]ing\s+in\b/i;
const ESTIMATING_CLOSE =
  /\b(?:send|provide|share|email|upload|forward)\s+(?:(?:us|me)\s+)?(?:with\s+)?(?:over\s+)?your\s+(?:plans|drawings|blueprints|pdfs?|project\s+(?:plans|drawings|documents|files))\b|\bsample\s+(?:estimates?|takeoffs?)\b|\bsend\s+over\s+the\s+plans\s*\/\s*drawings\b|\bany\s+(?:type|kind)\s+of\s+construction\b/i;

function isEstimatingServicePitch(t) {
  return ESTIMATING_OFFER.test(t) && ESTIMATING_CLOSE.test(t);
}

// --- 14. Virtual-assistant / offshore staffing outreach --------------------
// Received on lapbandla.com's "Contact Our Los Angeles Locations" form,
// 17 Sep 2026: "Bianca Foster", bianca@toptalentvas.com, a 650 number,
// preferred contact "Call", location "Glendale", found us via "Google", and a
// message that is only a cold-email subject line -- "Streamlining Your
// Workflow". Nothing in the body says what it wants; the pitch lands on the
// follow-up call, so there is no sales vocabulary for rules 1-13 to catch.
//
// Rule 1 owns this trade already, but it needs the words "virtual assistant"
// IN the message. This one carries them only in the sender's domain, which is
// where the whole class advertises itself: toptalentvas, vasdirect, hireVAs,
// remote-staff shops. So half one of this rule is the agency DOMAIN, and it is
// sufficient on its own -- no patient, client or supplier writes in from one.
//
// Kept deliberately tight. "va"/"vas" must sit flush against a staffing word
// (talent-vas, hire-va, va-staffing), never separated by filler: otherwise
// hirenova.com and every vascular practice in the estate match. Generic
// "staffing" and "recruiting" domains are NOT listed -- anesjobs and the other
// recruiting clients take real leads from those.
// Widened from lapbandla (24 Sep-5 Oct 2026: vettedvas, virtualhandsupport,
// virtualeaseservice, businesscoachvas) and for vaelitecrew.com, which hit
// criminaldefenselawcenterwestmichigan.com on 6 Oct 2026 -- "va" FIRST, then
// a crew/elite-type word. Same flush-against rule: "va" + filler never counts.
const VA_AGENCY_DOMAIN =
  /\b[a-z0-9-]*(?:virtual-?(?:assist\w*|staff\w*|teams?|hands?|ease|help\w*|support|services?|tasks?|office|admin\w*|pros?|solutions?|talent|workforce|associates?|partners?|desk|ops|aides?|mates?|crew|squad|force|hub|works|vas?)|remote-?(?:staff(?:ing|ers?)?|assist\w*|talent|help\w*)|offshore-?staff(?:ing)?|(?:admin|executive|personal|office|business|task)-?assist(?:ants?|ance))[a-z0-9-]*\.(?:com|net|org|co|io|biz|ph|us|agency|services)\b|\b[a-z0-9-]*(?:talent|staff|hire|hiring|team|squad|source|outsourc\w*|offshore|remote|vetted|trusted|elite|prime|skilled|dedicated)-?vas?\.(?:com|net|org|co|io|biz|ph|us|agency|services)\b|\bvas?-?(?:talent|staff(?:ing)?|hire|hiring|team|squad|direct|pros?|experts?|solutions?|force|hub|agency|elite|crew|prime|vetted|trusted|skilled|dedicated|assist\w*|support|desk|ops|works)[a-z0-9-]*\.(?:com|net|org|co|io|biz|ph|us|agency|services)\b/i;

// Half two is the pitch itself, for the same shop writing from a neutral
// address -- and it is TWO components, never one. The offer must have the
// SENDER supplying the people (rule 12's direction test): an employer saying
// "we want to hire a remote assistant" is a real lead on a recruiting site.
// The close is the outsourcing promise, which a customer never makes.
const VA_STAFFING_OFFER =
  /\b(?:we|our\s+(?:team|agency|company|firm|staff))\s+(?:can\s+|also\s+)*(?:provide|offer|supply|source|recruit|place|deploy|specialis\w*\s+in|specializ\w*\s+in|match\s+you\s+with|connect\s+you\s+with)\b[^.\n]{0,60}?\b(?:virtual|remote|offshore|overseas|executive|administrative|admin|back[-\s]?office)\s+(?:assistants?|staff\w*|support|professionals?|talent|teams?|receptionists?)\b|\b(?:virtual|remote|offshore)\s+assistants?\s+(?:agency|staffing|services|company)\b|\b(?:hire|onboard|get)\s+(?:a|an|your|our|dedicated|trained|full[-\s]?time|part[-\s]?time|\s)*(?:virtual|remote|offshore)\s+(?:assistants?|staff)\b[^.\n]{0,40}?(?:\$\s*\d|per\s+hour|\/\s*hr\b)/i;
const VA_STAFFING_CLOSE =
  /\bstreamlin\w+\s+your\s+(?:workflow|work\s*flow|operations?|processes|business|admin\w*)\b|\bfree\s+up\s+your\s+(?:time|day|schedule)\b|\bdelegate\s+(?:your\s+)?(?:admin\w*|day[-\s]?to[-\s]?day|repetitive|time[-\s]?consuming)\b|\bsave\s+(?:up\s+to\s+)?\d{1,2}\s*%[^.\n]{0,30}?(?:labou?r|payroll|staffing|overhead|hiring)\b|\bscale\s+your\s+team\s+without\b|\bwithout\s+the\s+(?:overhead|payroll\s+costs?|hiring\s+headaches?)\b|\bat\s+a\s+fraction\s+of\s+the\s+cost\b/i;

// The 6 Oct 2026 template never spells the trade out: "You get a trained VA
// who runs our custom AI system for your business ... admin, CRM updates,
// follow-ups ... You don't have to learn anything." Case-SENSITIVE on "VA" and
// it needs a qualifier (trained/dedicated/your own...) so a client writing
// about the VA (Veterans Affairs) or Virginia never matches, and it still
// needs a close.
const VA_ABBREV_OFFER =
  /\b(?:[Yy]ou(?:'ll)?\s+get|[Gg]et|[Hh]ire|[Ww]e\s+(?:provide|assign|give\s+you|match\s+you\s+with|pair\s+you\s+with))\s+(?:a|an|your\s+own)\s+(?:(?:dedicated|trained|full[-\s]?time|part[-\s]?time|experienced|vetted|skilled|AI[-\s]?powered|personal)\s+)+VAs?\b/;
const VA_ABBREV_CLOSE =
  /\byou\s+don'?t\s+(?:have|need)\s+to\s+learn\s+anything\b|\bCRM\s+updates?\b|\bthey\s+build\s+it\s+and\s+run\s+it\b|\bfollow[-\s]?ups?\s+or\s+(?:a\s+)?new\s+automations?\b/i;

function isVaStaffingPitch(t) {
  if (VA_AGENCY_DOMAIN.test(t)) return true;
  if (VA_ABBREV_OFFER.test(t) && (VA_ABBREV_CLOSE.test(t) || VA_STAFFING_CLOSE.test(t))) return true;
  return VA_STAFFING_OFFER.test(t) && VA_STAFFING_CLOSE.test(t);
}

// --- 15. Withheld website-critique tease ----------------------------------
// Received on colacityroofing.com's estimate form, 18 Sep 2026, filed against
// "Hurricane-Season Roof Check" with a Wyoming number, a Gould St address and a
// gmail that does not match the submitted name ("Roberts Emma" /
// laylafoster506@gmail.com):
//
//   "Hi, I was taking a quick look through your website and noticed a few areas
//    that caught my attention. I jotted down a couple of ideas that could
//    potentially improve the site's visibility and overall user experience.
//    Would you like me to send them over?"
//
// It is the search-marketing pitch of rule 6 with every sellable noun removed:
// no "SEO", no "rankings", no agency, no price, no link. The whole message is
// an opener plus a question, so rules 6, 7 and 12 all have nothing to match --
// the pitch itself is deliberately held back for the reply, which is the point
// of the template. What gives it away is not what is being sold but the SHAPE:
// the sender has unsolicited opinions about the recipient's own website and is
// asking permission to send them.
//
// Three signals, because each one alone has an innocent reading on a client
// form:
//
//   HELD    the sender is holding notes/ideas that would improve THE SITE --
//           never "our site" or "my site", which is a customer describing
//           their own project.
//   TEASE   the deliverable is withheld and offered ("would you like me to
//           send them over?"). On its own this is how a customer offers photos
//           of their roof.
//   WHOSE   the recipient's site is named as theirs ("your website"), or the
//           cold-outreach opener is present. Without this a client of a web
//           shop writing "I have a few ideas to improve the website, shall I
//           send them over?" would be diverted.
//
// Deliberately NOT here: "free audit", "I can show you", a bare "ideas" and a
// bare "send them over". Rule 6's SALES_SIGNAL already owns the first two, and
// the last two are ordinary customer speech.

// Half one. The improvement target is spelled out and is the recipient's site
// or one of its properties -- visibility, user experience, speed, conversions.
// "the site's visibility", "your website's performance", "improve the site".
const SITE_CRITIQUE_HELD =
  /\b(?:ideas?|suggestions?|recommendations?|observations?|pointers?|tips?|notes?|thoughts?|insights?|findings?|improvements?|tweaks?|fixes?|areas?|things?|items?|points?|opportunit(?:y|ies)|gaps?|issues?)\b[^.\n]{0,70}?\b(?:improve|improving|boost|boosting|enhance|enhancing|increase|increasing|optimi[sz]e|optimi[sz]ing|strengthen|strengthening|clean\s+up|tighten)\b[^.\n]{0,40}?(?:\b(?:your|the)\s+(?:web\s*site|website|site|page|homepage|online\s+presence|user\s+experience|visibility|search\s+visibility|conversions?|conversion\s+rate|traffic|performance|load(?:ing)?\s+speed|page\s+speed|rankings?)\b|\b(?:web\s*site|website|site|page|homepage)'?[\u2019']?s\b)/i;

// The same half, written from the other end: the sender says they wrote the
// notes down. "I jotted down a couple of ideas", "I put together a short list".
const CRITIQUE_PREPARED =
  /\b(?:jotted\s+down|noted\s+down|wrote\s+down|put\s+together|pulled\s+together|drew\s+up|drafted|compiled|prepared|made\s+(?:up\s+)?a\s+(?:short\s+|quick\s+|small\s+)?list\s+of)\b[^.\n]{0,40}?\b(?:ideas?|suggestions?|recommendations?|observations?|notes?|points?|pointers?|tips?|improvements?|feedback|list)\b/i;

// Half two: the deliverable is withheld and offered rather than given. The
// object has to be a pronoun standing in for those notes, or the notes
// themselves -- "send them over", "share these with you", "send you the list".
const CRITIQUE_TEASE =
  /\b(?:would\s+you\s+like\s+me\s+to|want\s+me\s+to|would\s+you\s+want\s+me\s+to|shall\s+i|should\s+i|can\s+i|may\s+i|(?:i(?:'|\u2019)?d\s+be\s+|i\s+am\s+|i(?:'|\u2019)?m\s+|be\s+)?(?:happy|glad|able)\s+to|i\s+(?:can|could)|i(?:'|\u2019)?ll|just\s+reply\s+and\s+i(?:'|\u2019)?(?:ll)?|let\s+me\s+know\s+if\s+you(?:'|\u2019)?(?:d)?\s*(?:would\s+)?(?:like|want))\b[^.\n?!]{0,40}?\b(?:send|share|pass|forward|shoot|email)\b[^.\n?!]{0,30}?\b(?:them|these|those|it|this|over|across|along|your\s+way|with\s+you|to\s+you|the\s+list|(?:a|the)\s+(?:short\s+|quick\s+|brief\s+|free\s+|mini\s+|detailed\s+)?(?:audit|report|analysis|assessment|breakdown)|some\s+(?:ideas?|notes?|suggestions?|pointers?|thoughts?)|the\s+(?:ideas?|notes?|suggestions?|recommendations?))\b/i;

// Half three -- whose site it is. The tease template always names the reader's
// site, because that is the hook; a customer talking about their own project
// says "our website".
const RECIPIENT_SITE =
  /\byour\s+(?:web\s*site|website|site|homepage|landing\s+page|online\s+presence)\b/i;

function isSiteFeedbackTease(t) {
  if (!CRITIQUE_TEASE.test(t)) return false;
  if (!SITE_CRITIQUE_HELD.test(t) && !CRITIQUE_PREPARED.test(t)) return false;
  return RECIPIENT_SITE.test(t) || AUDIT_OPENER.test(t);
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

// --- Generated name + Russian contact details ------------------------------
// Received on icounseling.net's appointment form, 13 Sep 2026, service "Other",
// no message at all:
//
//   Name: Michaelsof    Email: edenantyo@mail.ru    Phone: 89549519488
//
// No link, no keyword, no script the scorers look for -- it scored 0 and reached
// the practice. Every tell is in who it claims to be: a common first name with
// junk letters glued on and no space ("Michaelsof", "Josephfaw", "Alex31Faw"),
// the name generator form-spam tools use, plus a Russian free-mail address or a
// Russian mobile in domestic format (8 9XX...).
//
// Two components, never one. Plenty of real clients write from mail.ru with a
// +7 number, so Russian contact details on their own never block; and a name
// check alone is too weak to divert a lead. Only the combination is conclusive.
const GEN_NAME_BASES = [
  // 10 Nov 2026: Arthurpreva (icounseling, @mail.ru, 8 677...), Ralphhoife
  // (laurabasscounseling, 8 527...). Still needs the Russian-contact half.
  'arthur', 'ralph', 'walter', 'harold', 'albert', 'roger', 'keith', 'jerry',
  'terry', 'victor', 'bruce', 'howard', 'lawrence', 'jeremy', 'aaron', 'nathan',
  'tyler', 'travis', 'philip', 'russell', 'eugene', 'wayne', 'carlos', 'jesse',
  'gerald', 'randy', 'johnny', 'bobby', 'jimmy', 'danny', 'harry', 'curtis',
  'douglas', 'marcus', 'shawn', 'craig', 'martin', 'vincent', 'norman', 'calvin',
  'michael', 'robert', 'james', 'john', 'david', 'william', 'richard', 'joseph',
  'thomas', 'charles', 'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven',
  'paul', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian', 'george', 'edward',
  'ronald', 'timothy', 'jason', 'jeffrey', 'ryan', 'jacob', 'gary', 'eric',
  'stephen', 'larry', 'justin', 'scott', 'brandon', 'frank', 'gregory', 'raymond',
  'patrick', 'dennis', 'henry', 'peter', 'alex', 'jennifer', 'patricia',
  'elizabeth', 'barbara', 'susan', 'jessica', 'sarah', 'karen', 'nancy',
  'margaret', 'sandra', 'ashley', 'kimberly', 'emily', 'michelle', 'amanda',
  'melissa', 'deborah', 'stephanie', 'rebecca', 'sharon', 'cynthia', 'kathleen',
  'angela', 'brenda', 'pamela', 'nicole', 'samantha', 'katherine', 'christine',
];
// Endings that make a first name into a real name: Johnson, Petersen, Franklin,
// Paulina, Georgette, Jonathan, Alexandra, Markham, Scottsdale...
const GEN_NAME_REAL_ENDINGS = new Set([
  // Real surname endings behind the bases added 10 Nov 2026 (Martinelli,
  // Martineau, Aaronovich, Terrybrook...).
  'ski', 'sky', 'czyk', 'elli', 'eau', 'ovich', 'ovitz', 'owitz', 'stein',
  'berg', 'baum', 'feld', 'mann', 'sohn', 'brook', 'wood', 'worth', 'more',
  'son', 'sen', 'sson', 'ston', 'ton', 'man', 'ham', 'lin', 'lyn', 'ley', 'lee',
  'ney', 'ina', 'ine', 'ino', 'ita', 'ito', 'ette', 'etta', 'elle', 'ella',
  'athan', 'andra', 'ander', 'andre', 'anne', 'ann', 'field', 'ford', 'well',
  'tte', 'eta', 'sdale', 'ville', 'burg', 'town', 'stown', 'sburg', 'kson',
  'nie',
]);

function isGeneratedNameToken(raw) {
  const t = String(raw || '').trim();
  if (!t || /\s/.test(t)) return false;
  const lower = t.toLowerCase();
  return GEN_NAME_BASES.some((base) => {
    if (!lower.startsWith(base)) return false;
    // Tail matched case-SENSITIVELY: with an i flag the capitalised branch
    // matches any two lowercase letters and flags Markus, Brianna, Ericka.
    // A trailing all-caps run -- "DonaldapofsNE", elonhealthurgentcare.com,
    // 19 Sep 2026 -- is the same generator signing its work. It is still the
    // lowercase junk before it that decides: "JohnsonRN" ends in a real
    // surname ending and stays a lead, "Donaldapofs" does not.
    const m = t.slice(base.length).match(/^(\d{0,3})([a-z]{3,5}|[A-Z][a-z]{1,4})([A-Z]{1,4})?$/);
    if (!m) return false;
    if (m[1]) return true; // "Alex31Faw"
    const tail = m[2] || '';
    if (/^[A-Z]/.test(tail)) return false; // "JohnMark"
    return !GEN_NAME_REAL_ENDINGS.has(tail);
  });
}

const RU_EMAIL =
  /[a-z0-9._%+-]+@(?:(?:[a-z0-9-]+\.)*(?:ru|su|xn--p1ai)|(?:yandex|ya|rambler|mail|bk|inbox|list)\.(?:ru|com|ua|by|kz))(?![a-z0-9.-])/i;
// 8 9XX XXX XX XX or +7 9XX... A US number never starts 8/7 at 11 digits.
const RU_PHONE = /(?:^|[^\w+])(?:\+?7|8)[\s().-]*9(?:[\s().-]*\d){9}(?![\d])/;
// The same trunk prefix in front of a LANDLINE code, which does not start with
// a 9: "88352122718" is Cheboksary. Eleven digits, at most one separator
// between any two and none of them a newline, so it cannot run from one form
// field into the next. A NANP number is ten digits, or eleven behind a country
// code of 1, so no US number can reach eleven starting with an 8.
const RU_PHONE_DOMESTIC = /(?:^|[^\w+])8[ .()-]{0,2}(?:\d[ .()-]{0,2}){10}(?!\d)/;

// A name FIELD, which may hold more than one token. The 19 Sep 2026 lead put
// the same generated token in both halves of a first/last name form --
// "DonaldapofsNE DonaldapofsNE" -- and the single-token match never fired.
function hasGeneratedNameValue(v) {
  const tokens = String(v || '').trim().split(/\s+/).filter(Boolean);
  if (!tokens.length || tokens.length > 4) return false;
  if (tokens.some(isGeneratedNameToken)) return true;
  // A first name identical to the last name, letter for letter: nobody is
  // called that, and it is what a bot does with a form that demands both.
  // Destructured, not indexed twice: the TS copies are built with
  // noUncheckedIndexedAccess, where tokens[0] is string | undefined.
  if (tokens.length !== 2) return false;
  const [first, last] = tokens;
  return !!first && first === last && first.length >= 4 && /^[A-Za-z][A-Za-z'\u2019-]*$/.test(first);
}

function hasGeneratedName(t) {
  const plain = String(t).replace(/<[^>]+>/g, '\n').replace(/&nbsp;/gi, ' ');
  const lines = plain.split('\n').map((l) => l.trim()).filter(Boolean);
  const LABEL = /^(?:full\s*|first\s*|last\s*|your\s*|contact\s*)?name\s*[:\-]?$/i;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || '';
    const row = line.match(/^(?:full\s*|first\s*|last\s*|your\s*|contact\s*)?name\s*:\s*(.+)$/i);
    if (row && hasGeneratedNameValue(row[1])) return true;
    if (LABEL.test(line) && i + 1 < lines.length && hasGeneratedNameValue(lines[i + 1])) return true;
  }
  // The subject line: "New website inquiry — Michaelsof (Other)".
  const subj = plain.match(/(?:inquiry|enquiry|lead|request|message|submission|contact)\b[^\n]{0,20}?(?:\u2014|\u2013|-|:|from)\s*([^\n(]{1,60}?)\s*(?:\(|\u2014|\u2013|$)/im);
  return !!(subj && hasGeneratedNameValue(subj[1]));
}

function isGeneratedNameRussianContact(t) {
  if (!RU_EMAIL.test(t) && !RU_PHONE.test(t) && !RU_PHONE_DOMESTIC.test(t)) return false;
  return hasGeneratedName(t);
}

// --- 17. Soft marketing tease + B2B cold pitch ------------------------------
// Nineteen solicitations reached Todd at colacityroofing.com between July and
// 24 Sep 2026 with every earlier rule scoring 0 -- each one steers round the
// vocabulary rules 6, 12 and 15 key on:
//
//   "I looked up your website to see how it sits on Google ... I do SEO for
//    local businesses ... No cost for the look"                (Siterank2@gmail)
//   "improve how Cola City Roofing appears when people ask ChatGPT for roofing
//    companies. Would it be okay for us to share them?"
//   "sitting on pages 2 and 3 of Google ... a brief, no-obligation audit"
//   "I help local businesses like yours get into the top 3 Google Maps results"
//   "We help local service businesses improve lead management ... a
//    complimentary 20-minute Discovery Call" / "We help businesses redesign
//    their websites ... Grab a time here"
//   "I went ahead and built a quick redesign that actually does that"
//
// plus B2B pitches that are not marketing at all: a contractor-insurance
// quote, a wholesale "contractor financing" program, an SBA-loan lender, a
// business broker, a "buyer" for the roofer's materials, and the fake-project
// lure that precedes an overpayment scam.
//
// This file runs on CPA, law, insurance, medical and contractor sites, so
// nothing here may be a word a PROSPECT uses about their own business. "SBA
// loans", "business broker", "working capital", "payroll class codes", "work
// comp experience mod", "I can forward the project plans" and "purchase roofing
// materials" are all real leads somewhere in the estate -- each is a DELIVER
// probe. What the pitches share instead is that they are aimed at the
// RECIPIENT's business ("your company is eligible", "compare your current
// policy", "businesses in your industry") or close like a sales email
// ("complimentary Discovery Call", "Grab a time here"). The senders that only
// a residential roofer can call spam (the project-plans lure, the inspection-
// photo request) are listed in BLOCKED_ADDRESSES instead.
//
// TEASE_HARD and AGENCY_MISSION sit behind the sellsSearch gate; eSEOspace's
// own forms receive exactly this vocabulary from paying prospects.
const TEASE_HARD =
  /\bhow\s+(?:it|your\s+(?:web\s*)?site|your\s+business)\s+(?:sits|ranks|stacks\s+up|shows\s+up)\s+on\s+google\b|\bpages?\s+(?:[2-9]|[1-9]\d)(?:\s*(?:,|and|or|&)\s*\d{1,2})*\s+of\s+google\b|\b(?:appears?|shows?\s+up|comes?\s+up|ranks?|gets?\s+recommended)\s+(?:when|if)\s+(?:people|customers|someone|homeowners|users)\s+(?:ask|asks|search|use|type)\s+(?:chat\s*gpt|ai|gemini|perplexity|claude|copilot)\b|\btop\s+(?:3|three)\s+(?:google\s+)?(?:maps?|map\s+pack|local\s+pack)(?:\s+results)?\b|\bi\s+do\s+seo\b|\bgoogle\s+seo\b|\bai\s+search\s+(?:optimi[sz]ation|results|visibility)\b|\bonline\s+visibility\s+audit\b|\bboost\s+your\s+(?:local\s+)?(?:visibility|rankings?|online\s+presence|traffic)\b|\b(?:built|made|put\s+together|mocked\s+up|created|designed)\s+(?:you\s+)?an?\s+(?:quick\s+|new\s+|free\s+|sample\s+)?(?:redesign|mock-?up|homepage\s+mock-?up)\b/i;

// The agency's mission line: "we help <businesses>" aimed at the recipient's
// kind of business or naming what the agency sells ...
const AGENCY_MISSION =
  /\b(?:we|i)(?:'ve|’ve|\s+have)?\s+help(?:ed|s)?\s+(?:several\s+|many\s+|hundreds\s+of\s+|dozens\s+of\s+|other\s+)?(?:local\s+|small\s+|established\s+|home[-\s]+service\s+|service\s+|roofing\s+)*(?:businesses|contractors|companies|roofers|business\s+owners)\b(?:\s+(?:like\s+yours|in\s+your\s+(?:industry|area|field|niche)))|\b(?:we|i)(?:'ve|’ve|\s+have)?\s+help(?:ed|s)?\s+(?:several\s+|many\s+|hundreds\s+of\s+|dozens\s+of\s+|other\s+)?(?:local\s+|small\s+|established\s+|home[-\s]+service\s+|service\s+|roofing\s+)*(?:businesses|contractors|companies|roofers|business\s+owners)\b[^.\n]{0,80}?\b(?:leads?|booked\s+appointments|more\s+(?:calls|customers|jobs)|visibility|rankings?|seo|redesign|lead\s+(?:systems?|management)|follow-?ups?|pipeline|scale\s+up)\b/i;
// ... and, because a prospect introducing its own firm can say the same, only
// alongside the close of a sales email.
const PITCH_CLOSE =
  /\bcomplimentary\b|\bdiscovery\s+call\b|\bgrab\s+a\s+time\b|\bschedule\s+a\s+time\s+here\b|\bno[-\s]+(?:cost\s+or\s+)?obligation\b|\bwant\s+me\s+to\s+(?:walk|show)\s+you\b|\bhappy\s+to\s+share\s+(?:a\s+few|some)\s+(?:quick\s+)?ideas\b|\bi\s+can\s+show\s+you\s+(?:a\s+couple|some|a\s+few)\b|\bshoot\s+(?:those|them|it)\s+over\b/i;

const B2B_PITCH =
  /\b(?:wholesale\s+)?contractor\s+(?:customer\s+)?financing\s+(?:is\s+now\s+available|program)\b|\bsee\s+if\s+your\s+company\s+is\s+eligible\b|\bbuyers\s+(?:who\s+are\s+)?interested\s+in\s+(?:purchasing|acquiring|buying)\s+(?:a\s+)?(?:businesses|business|companies|company)\s+(?:in\s+your\s+industry|like\s+yours)\b|\binterested\s+in\s+selling\s+your\s+(?:business|company)\b|\bcompar(?:e|ing)\s+your\s+current\s+(?:contractor\s+)?(?:insurance\s+)?(?:policy|coverage)\b|\bforward\s+(?:you\s+)?(?:the\s+)?project(?:'s)?\s+damages?\b/i;

// "Dear Roofing Contractor ... We're looking to purchase roofing materials and
// build relationships with local contractors" -- a buyer who addresses a trade,
// not a business. A real materials enquiry names the company it is writing to.
const MATERIALS_BUY =
  /\b(?:looking\s+to\s+(?:purchase|buy)|interested\s+in\s+(?:purchasing|buying))\s+(?:roofing\s+|building\s+|construction\s+)?materials\b|\bif\s+you\s+have\s+(?:any\s+)?(?:extra\s+|surplus\s+|leftover\s+|excess\s+)?materials\s+available\b/i;
const TRADE_SALUTATION =
  /\bdear\s+(?:roofing\s+|general\s+|local\s+)?contractors?\b|\bbuild\s+relationships\s+with\s+local\s+contractors\b/i;

// --- 22. AI-search visibility tease ------------------------------------------
// foxvein.com, 7 Oct 2026, filed as an "Insurance & Coverage Question" from a
// gmail: "I have a few suggestions that could help Fox Vein show up more often
// in AI search tools like ChatGPT. Would it be okay for me to send them over?"
// Rule 17's TEASE_HARD wants "when people ask ChatGPT"; this one says "in AI
// search tools". Two signals: getting the business seen IN an AI tool, plus
// the offer to send suggestions/ideas over. A patient who found the practice
// through ChatGPT names the tool but offers nothing; a patient asking to send
// records offers but never mentions AI visibility. Called from
// isMarketingTease, so it sits behind the sellsSearch gate with rule 17.
const AI_VISIBILITY =
  /\b(?:show(?:s|ing)?\s+up|appear(?:s|ing)?|get(?:s|ting)?\s+(?:found|seen|recommended|cited|mentioned|featured|picked\s+up)|be(?:ing)?\s+(?:found|seen|recommended|cited|mentioned|featured|visible)|visibility|presence|rank(?:s|ing)?|mentioned|cited|recommended)\b[^.?!\n]{0,60}?\b(?:in|on|by|from|across|inside|within|through)\s+(?:(?:tools?|platforms?|assistants?|engines?)\s+like\s+)?(?:chat\s*gpt|gemini|perplexity|claude|copilot|grok|google'?s?\s+ai|ai\s+(?:search|overviews?|mode|tools?|assistants?|answers?|results?|chat(?:bots?)?|engines?|platforms?|models?|recommendations?)|llms?|large\s+language\s+models?|generative\s+(?:ai|search|engines?))\b|\b(?:ai|llm|generative)\s+(?:search\s+)?(?:visibility|presence|optimi[sz]ation)\b|\b(?:geo|aeo)\s+\(?(?:generative|answer)\s+engine\s+optimi[sz]ation\b/i;
const AI_TEASE_OFFER =
  /\b(?:a\s+few|some|several|(?:a\s+)?couple(?:\s+of)?|\d+|three|two|five)\s+(?:quick\s+|simple\s+|easy\s+|specific\s+)?(?:suggestions|ideas|tips|recommendations|insights|observations|findings|fixes|tweaks|changes|improvements|opportunities)\b|\b(?:okay|ok|alright|all\s+right|fine|cool)\s+(?:for\s+me\s+|if\s+i\s+)?(?:to\s+)?(?:send|share|forward|email)\b|\b(?:can|could|may|shall)\s+i\s+(?:send|share|forward|email)\s+(?:them|those|these|it|you|over)\b|\bmind\s+if\s+i\s+(?:send|share|forward)\b|\b(?:send|share|forward)\s+(?:them|those|these|it)\s+(?:over|your\s+way)\b|\binterested\s+in\s+(?:hearing|seeing)\s+(?:them|those|these|more)\b/i;

function isAiVisibilityTease(t) {
  return AI_VISIBILITY.test(t) && (AI_TEASE_OFFER.test(t) || PITCH_CLOSE.test(t));
}

// --- 24. "Found errors behind your traffic drop" tease -------------------------
// mymontanalawyer.com, 8 Oct 2026, filed as a Criminal Defense inquiry from
// hainaseodigitalexpert@gmail.com under the subject "Re: Drop Traffic":
//
//   "I have found some major errors that correspond to a drop in website
//    traffic over the last 1-2 months and wanted to bring them to your
//    attention. I'd be happy to send you errors and the solutions to help you
//    improve the performance and traffic of your website."
//
// Rule 6 has no "SEO" or "rankings" to hold, and rule 15 wants held IDEAS and a
// pronoun to send; this one holds ERRORS and offers "errors and the solutions".
// Three signals, each innocent alone: the sender found errors (a client finds
// errors in a police report), the errors are tied to the reader's website
// traffic or performance (a visitor reports a broken page but offers nothing),
// and the list is withheld and offered. Called from isMarketingTease, so it
// sits behind the sellsSearch gate with rules 17 and 22.
const SITE_ERRORS_FOUND =
  /\b(?:i|we)(?:\s+have|['’]ve)?(?:\s+(?:just|recently|also|already))*\s+(?:found|noticed|identified|discovered|detected|spotted|uncovered|came\s+across|come\s+across)\s+(?:(?:some|a\s+few|several|a\s+couple\s+of|a\s+number\s+of|many|multiple|certain|\d+)\s+)?(?:(?:major|critical|serious|severe|key|significant|important|big|technical|seo|on-?page)\s+){0,2}(?:errors?|issues?|problems?|bugs?|mistakes?|glitches)\b/i;
const SITE_TRAFFIC_HOOK =
  /\b(?:drop|decline|decrease|dip|loss|fall|reduction|slump)\s+(?:in|of)\s+(?:your\s+|the\s+)?(?:(?:web\s*site|website|site|organic|search|google)\s+)*(?:traffic|rankings?|visibility|visitors)\b|\b(?:web\s*site|website|organic)\s+traffic\b|\b(?:traffic|performance|rankings?|visibility)\s+of\s+your\s+(?:web\s*site|website|site)\b|\byour\s+(?:web\s*site|website|site)(?:['’]s)?\s+(?:traffic|performance|rankings?|visibility)\b|\b(?:affecting|hurting|harming|impacting|costing)\s+your\s+(?:(?:web\s*site|website|site|organic|search)\s+)?(?:traffic|rankings?|visibility)\b/i;
const SITE_ERRORS_OFFER =
  /\b(?:(?:i|we)\s+(?:can|could|will)|(?:i|we)['’]ll|(?:happy|glad|able)\s+to|let\s+me\s+know\s+if\s+you(?:['’]d)?\s*(?:would\s+)?(?:like|want)|would\s+you\s+like\s+me\s+to|want\s+me\s+to|shall\s+i|should\s+i|can\s+i|may\s+i)\b[^.\n?!]{0,30}?\b(?:send|share|email|forward|show|provide)\b[^.\n?!]{0,25}?\b(?:errors?|issues?|problems?|bugs?|mistakes?|solutions?|fixes|details|list|screenshots?|report|findings)\b/i;

function isSiteErrorTease(t) {
  return SITE_ERRORS_FOUND.test(t) && SITE_TRAFFIC_HOOK.test(t) && SITE_ERRORS_OFFER.test(t);
}

function isMarketingTease(t) {
  return TEASE_HARD.test(t) || (AGENCY_MISSION.test(t) && PITCH_CLOSE.test(t)) || isAiVisibilityTease(t) || isSiteErrorTease(t);
}
function isB2bColdPitch(t) {
  return B2B_PITCH.test(t) || (MATERIALS_BUY.test(t) && TRADE_SALUTATION.test(t));
}

// --- 18. Paid media-feature / award pitch -----------------------------------
// shielddentalcare.com, 25 Sep 2026, filed as a "New Patient" appointment:
//
//   "When someone searches Google -- or asks ChatGPT or Gemini -- for a
//    specialist like you, the providers who show up are the ones featured in
//    trusted health media. I'd like that to be you. Since 1990, Your Health
//    Magazine has introduced 5,000+ providers to patients ... ~749,000 visits
//    a month ... Being featured gets you: Print placement ..."
//
// An ad sale dressed as editorial. Two halves are required: an offer to FEATURE
// the recipient, plus the vocabulary of selling the space (placements, monthly
// visits, circulation, a media kit, limited spots). A patient who "read about
// Dr. X in Your Health Magazine" has neither, and a reporter asking for an
// interview has no placement to sell, so both are delivered. The same shape
// covers the "you've been selected for a Best of <City> award" plaque sale.
const FEATURE_PITCH =
  /\bbeing\s+featured\s+(?:gets|gives|puts|means)\b|\b(?:providers|businesses|practices|doctors|dentists|companies|brands|firms)\s+(?:who|that)\s+(?:show\s+up|appear|get\s+found|rank)\s+are\s+(?:the\s+ones\s+)?featured\b|\bfeatured\s+in\s+(?:trusted|leading|top|major|reputable|respected|local)\s+(?:[\w-]+\s+){0,2}(?:media|magazines?|publications?|outlets?|press|news)\b|\b(?:feature|profile|spotlight|showcase)\s+(?:you|your\s+(?:practice|business|company|clinic|firm|office|team|brand|work|services?))\s+(?:in|on)\s+(?:our|an?\s+upcoming|the\s+(?:next|upcoming))\b|\b(?:advertorial|sponsored\s+(?:feature|article|editorial|profile|spotlight|interview|story)|paid\s+(?:feature|editorial|placement|spotlight)|editorial\s+(?:feature|placement|package))s?\b|\b(?:you(?:'ve|’ve|\s+have)\s+been|your\s+(?:practice|business|company|clinic|firm)\s+(?:has\s+been|was))\s+(?:selected|chosen|nominated|shortlisted)\s+(?:to\s+be\s+featured|for\s+[^.?!\n]{0,40}?\b(?:feature|award|recognition|inclusion))\b|\bi(?:'d|’d|\s+would)\s+like\s+that\s+to\s+be\s+you\b/i;
const MEDIA_SALE =
  /\b(?:print|digital|magazine|editorial|online|homepage|newsletter|social\s+media|premium)\s+placements?\b|[\d~][\d,.]*\s*(?:k|m|million|thousand)?\+?\s+(?:monthly\s+)?(?:visits|visitors|readers|subscribers|impressions|views)\s+(?:a|per|each|every)\s+month\b|\b(?:monthly|print)\s+(?:readership|circulation|audience)\b|\bcirculation\s+of\b|\bmedia\s+kit\b|\brate\s+card\b|\b(?:introduced|connected)\s+[\d,]+\+?\s+(?:providers|businesses|practices|doctors|dentists|professionals|companies)\b|\b(?:limited|only\s+(?:a\s+)?few|few\s+remaining)\s+(?:spots|spaces|slots|openings|placements)\b|\bissue\s+(?:prints|closes|deadline|goes\s+to\s+print)\b|\blong\s+after\s+the\s+issue\b|\b(?:placement|listing|feature|award|plaque)\s+(?:fee|package)s?\b/i;

function isPaidFeaturePitch(t) {
  return FEATURE_PITCH.test(t) && MEDIA_SALE.test(t);
}

// --- 19. Anyone offering or asking for links --------------------------------
// Standing instruction (25 Sep 2026, widening 19 Aug): anyone reaching out
// about links goes to the review inbox, not only the guest-post sellers rule 2
// names. Rule 2 needs "dofollow", "niche edits" or "guest post" next to a sale;
// these are the pitches that avoid all three: "I can get you links from high
// authority sites", "DA 50+", "reciprocal links", "please add our guide to your
// resources page", the broken-link swap, and a bare "backlinks".
//
// Everything a real customer says about a link is about a link THEY need ("the
// link to your forms is broken", "send me a link to book", "can you add a link
// to your website for online booking"), so the offer patterns need the SENDER
// as the source (I/we ... on our sites) or the sender's OWN page as the thing
// to be linked. The whole rule sits behind the sellsSearch gate: eSEOspace's
// prospects ask about backlinks and link building in exactly these words.
const LINK_HARD =
  /\b(?:reciprocal|mutual|two[-\s]way|three[-\s]way|3[-\s]way)\s+link(?:s|ing)?\b|\blink\s+(?:partnerships?|collaborations?|trades?|trading|packages?|inserts?|opportunit(?:y|ies)|juice|equity)\b|\b(?:exchange|swap|trade)\s+links\b|\b(?:da|dr|domain\s+(?:authority|rating))\s*[:=]?\s*\d{2}\s*\+|\b(?:da|dr)\s*\d{2}\s*(?:-|to)\s*\d{2}\b|\b(?:authority|contextual|editorial|high[-\s]?(?:da|dr|authority|quality)|do[-\s]?follow|no[-\s]?follow|homepage|sidebar|footer|niche[-\s]?relevant|in[-\s]?content|white[-\s]?hat|seo)\s+(?:back-?)?links?\b|\bback-?links?\b|\bbroken\s+links?\b[^?!\n]{0,160}?\b(?:replace|replacement|swap|alternative|update\s+it\s+with|point\s+(?:it\s+)?to)\b[^.?!\n]{0,60}\b(?:our|my)\s+(?:article|guide|resource|page|post|content|site|website|blog|tool)\b/i;
const LINK_OFFER =
  /\b(?:i|we)\b[^.?!\n]{0,40}?\b(?:offer|provide|sell|give|get|place|add|insert|secure|build|share|include|feature|publish|put)(?:s|ed|ing)?\b[^.?!\n]{0,30}?\blinks?\b[^.?!\n]{0,40}?\b(?:on|from|in|into|across)\s+(?:my|our|their|these|those|several|multiple|various|high|top|popular|authority|authoritative|trusted|niche|relevant|partner|premium|real|\d+)\b[^.?!\n]{0,30}?\b(?:sites?|websites?|blogs?|articles?|posts?|publications?|domains?|magazines?|outlets?|networks?|directories|directory)\b/i;
const LINK_REQUEST =
  /\b(?:add|include|insert|place|put|feature|mention)\s+(?:our|my)\s+(?:link|url|website|site|article|guide|resource|infographic|tool|blog)\b[^.?!\n]{0,40}?\b(?:on|to|in|into)\s+your\s+(?:site|website|blog|page|resources?|resource\s+page|links?\s+page|articles?|posts?|footer|sidebar)\b|\blink\s+(?:back\s+)?to\s+(?:our|my)\s+(?:site|website|blog|page|article|guide|resource)\b[^.?!\n]{0,60}?\b(?:from|on|in)\s+your\b/i;

function isLinkOffer(t) {
  return LINK_HARD.test(t) || LINK_OFFER.test(t) || LINK_REQUEST.test(t);
}

// --- 21. Intimate-photo lure / shortened link from a Russian number --------
// Received on mountainsidebh.com's Denver contact form, 1 Oct 2026:
//
//   Name: breashner   Email: yr3ufcgo@yahoo.com   Phone: 89496242452
//   Subject: Inquiry
//   Message: "Hi, this is Irina. I am sending you my intimate photos as I
//             promised. https://tinyurl.com/5er2p948"
//
// Not a sales pitch at all: the link is the payload (phishing or malware), and
// the bait is written so that whoever opens the inbox clicks it. The scorer
// gave it 25 for one link, under the threshold; the name is gibberish but not
// the "Michaelsof" shape rule 16 looks for, and yahoo.com is not a Russian
// mailbox, so nothing fired and it reached the client.
//
// Two components, never one, and on a behavioral-health or law site the first
// one matters: a real client writes "my ex posted my intimate photos online"
// and may paste the link. So the lure needs the SENDER handing over THEIR OWN
// pictures ("I am sending you my ...", "here are my ...", "check out my ..."),
// not merely the words -- and then a link of any kind.
//
// The second branch is the same bot with the wording changed: a link shortener
// next to Russian contact details. Each half alone is delivered -- a
// Russian-speaking client is a real client, and people do paste bit.ly links.
const INTIMATE_MEDIA = String.raw`(?:intimate|nude|naked|explicit|erotic|sexy|naughty|hot|private|topless|xxx)\s+(?:photos?|pics?|pictures?|images?|videos?|vids?|selfies?|snaps?|shots)\b`;
const INTIMATE_LURE = new RegExp(
  String.raw`\b(?:i(?:\s+am|'m|’m|'ve|’ve|\s+have|'ll|’ll|\s+will|\s+wanted\s+to|\s+want\s+to|\s+can|\s+could)?\s+(?:just\s+|also\s+|now\s+)?(?:send(?:ing)?|sent|shar(?:e|ed|ing)|post(?:ed|ing)?|upload(?:ed|ing)?|attach(?:ed|ing)?|leav(?:e|ing)|left|show(?:ing)?)|here\s+(?:are|is)|check\s+out|(?:take\s+a\s+)?look\s+at|wan(?:t\s+to|na)\s+see)\s+(?:you\s+)?(?:some\s+(?:of\s+)?)?my\s+(?:[\w-]+\s+){0,2}?` +
    INTIMATE_MEDIA,
  'i',
);
const ANY_LINK = /https?:\/\/|\bwww\.[a-z0-9-]+\.[a-z]{2,}/i;
const URL_SHORTENER =
  /(?:^|[^a-z0-9.-])(?:tinyurl\.com|bit\.ly|bitly\.com|t\.co|goo\.gl|is\.gd|v\.gd|cutt\.ly|rb\.gy|ow\.ly|buff\.ly|shorturl\.at|tiny\.cc|t\.ly|urlz\.fr|rebrand\.ly|shorte\.st|s\.id|clck\.ru|vk\.cc|goo\.su|u\.to|qps\.ru)\/[\w-]+/i;

function isIntimateLureLink(t) {
  if (INTIMATE_LURE.test(t) && (ANY_LINK.test(t) || URL_SHORTENER.test(t))) return true;
  if (!URL_SHORTENER.test(t)) return false;
  return RU_EMAIL.test(t) || RU_PHONE.test(t) || RU_PHONE_DOMESTIC.test(t);
}

// --- 23. Sell-side M&A / investment-bank outreach -----------------------------
// lapbandla.com, 7 Oct 2026, filed on the Rancho Cucamonga contact form:
//
//   "I'm Ammon Shumway, and I head up deal origination at Logan Growth
//    Advisors. We're a lower middle-market investment bank ... we've been
//    working with companies in the $3M to $25M EBITDA range, and your weight
//    loss surgery practice in Los Angeles stood out ... Whether a sale is on
//    your radar now or later on, it's worth knowing where you stand in the
//    current market. Would the owner or a decision-maker be available for a
//    brief call?" + a calendar.app.google link.
//
// A banker, broker, PE fund or "acquirer" fishing for owners who might sell.
// Two halves: the sender introduces itself as a deal-maker (deal origination,
// investment bank, private equity, an EBITDA band, "we acquire businesses like
// yours"), AND it probes the recipient about selling (a sale "on your radar",
// "where you stand in the market", "what your practice is worth", "the owner
// or a decision-maker"). A patient who works in private equity has no sale
// probe; an owner asking an accountant "what is my business worth before I
// sell" never introduces a deal desk. Sites whose CLIENTS are buyers and
// sellers (business brokers, M&A advisory) pass opts.allowAcquisitionPitch.
const DEALMAKER_SELF =
  /\bdeal\s+(?:origination|sourcing|flow)\b|\b(?:investment\s+bank(?:ing|er)?|m\s*&\s*a\s+(?:advisory|advisors?|firm|team|group)|sell-?side\s+(?:advisory|advisors?|firm)|private\s+equity\s+(?:firm|fund|group|partners?)|family\s+office|search\s+fund|holding\s+company|business\s+brokerage)\b|\b(?:lower|upper)\s+middle[-\s]+market\b|\$\s?\d+(?:\.\d+)?\s*(?:m|mm|million)?\s*(?:to|-|–|—)\s*\$?\s?\d+(?:\.\d+)?\s*(?:m|mm|million)\s+(?:in\s+)?(?:ebitda|revenue|annual\s+revenue|in\s+revenue)\b|\b(?:we|our\s+(?:firm|group|team|fund|clients?|buyers?))\s+(?:actively\s+)?(?:acquires?|invests?\s+in|(?:are|is)\s+(?:actively\s+)?(?:looking|seeking)\s+to\s+(?:acquire|invest\s+in|buy|partner\s+with))\s+(?:[\w-]+\s+){0,4}?(?:businesses|companies|practices|firms|operations|clinics|agencies)\b/i;
const SALE_PROBE =
  /\b(?:a\s+|an\s+)?(?:sale|exit|transaction|acquisition|liquidity\s+event|succession\s+plan)\s+(?:is|are|might\s+be|may\s+be)\s+(?:on\s+your\s+radar|something\s+you)|\bwhere\s+you\s+stand\s+in\s+(?:the|today'?s|today’s)\s+(?:current\s+)?market\b|\bwhat\s+your\s+(?:business|practice|company|firm|clinic|agency)\s+(?:is|could\s+be|might\s+be)\s+worth\b|\b(?:open\s+to|considering|thinking\s+about|explore|exploring)\s+(?:a\s+|an\s+)?(?:conversation\s+about\s+(?:a\s+|an\s+)?)?(?:sale|selling|exit|acquisition|recapitali[sz]ation|partnership\s+or\s+sale)\b|\binterested\s+in\s+selling\b|\bowner\s+or\s+(?:a\s+|another\s+)?decision[-\s]?maker\b|\bstood\s+out\s+as\s+(?:the\s+|a\s+)?(?:type|kind)\s+of\s+(?:operation|business|company|practice|firm)\b|\b(?:acquires?|acquiring|buys?|buying|invests?\s+in)\s+(?:a\s+)?(?:[\w-]+\s+)?(?:businesses|companies|practices|business|company|practice)\s+like\s+yours\b/i;

// Rule 23, widened 10 Nov 2026 (mountainsidebh.com, the same Ammon Shumway of
// Logan Growth Advisors, new script): "a lower middle market investment bank.
// We help founder-owned businesses sell at maximum value through a competitive
// blind auction ... the best pricing and terms for the DBT and CBT therapy
// practices you run in Denver ... If the owner has ever considered selling, I'd
// welcome a brief conversation to explore fit for your Denver practice." None
// of SALE_PROBE's phrases appear. These probes all talk ABOUT the recipient
// ("the owner has", "practices you run") or sell the
// auction itself, so an investment banker writing about their own burnout --
// "I help companies sell, and I have considered selling my house" -- still
// has no probe and is delivered. DEALMAKER_SELF is still required.
const SALE_PROBE_DIRECTED = [
  /\bthe\s+(?:owner|founder)s?\s+(?:has|have|had|is|are)\s+(?:ever\s+)?(?:considered|considering|thought\s+about|thinking\s+about|open\s+to)\s+(?:selling|a\s+sale|an\s+exit)\b/i,
  /\b(?:pricing|price|value|valuation)\s+and\s+terms\s+for\s+(?:the\s+|your\s+)?(?:[\w-]+\s+){0,6}?(?:practices?|business(?:es)?|compan(?:y|ies)|firms?|clinics?)\s+you\s+(?:run|own|operate)\b/i,
  /\bsell\s+at\s+(?:maximum|max|the\s+highest|top)\s+(?:value|price|valuation)\b[^.\n]{0,80}\b(?:auction|buyers)\b/i,
];

function isAcquisitionPitch(t) {
  return DEALMAKER_SELF.test(t) && (SALE_PROBE.test(t) || SALE_PROBE_DIRECTED.some((r) => r.test(t)));
}

// --- 25. Tracking-token form spam ---------------------------------------------
// mountainsidebh.com, 12 Oct 2026, Denver contact form:
//
//   Name: NARTYTRYUT1395855NEWETREWT   Email: illtyd65@notlettersmail.com
//   Phone: 85135125754   Subject: Holiday season - starting therapy in January
//   Message: MEJTYJY1395855MAMYJRTH
//
// A form-testing bot stamps one run ID into every text field, wrapped in
// capital-letter noise. Two DIFFERENT tokens of the shape CAPS + 5+ digits +
// CAPS carrying the SAME digit run is the signature; no person types their own
// name and their message that way. One such token is delivered (an order or
// claim number pasted once), and so is the same token repeated, because the
// rendered email carries each field twice (text and HTML).
function isTrackingTokenSpam(t) {
  const re = /(?:^|[^A-Za-z0-9])([A-Z]{4,})(\d{5,})([A-Z]{4,})(?![A-Za-z0-9])/g;
  const seen = new Map();
  let m;
  while ((m = re.exec(t))) {
    const [, head, run, tail] = m;
    if (!head || !run || !tail) continue;
    let toks = seen.get(run);
    if (!toks) { toks = new Set(); seen.set(run, toks); }
    toks.add(head + run + tail);
    if (toks.size >= 2) return true;
  }
  return false;
}

// --- 27. Lifetime-deal software pitch ---------------------------------------
// laurabasscounseling.com, 15 Oct 2026: "AIFlipDomains", deal@aiflipdomains.com,
// a Hong Kong number and an AppSumo-style launch blurb -- "unlocked permanently
// for a launch-special single investment instead of monthly fees ... Claim
// Lifetime Access To AIFlipDomains: https://iiil.ink/AIFlipDomains". The product
// changes every week (domain flipping, AI video, list builders); the shape does
// not. Two signals: the lifetime/one-time-instead-of-monthly offer AND a link to
// buy it. A client saying "I paid a one-time fee" never carries both.
const LIFETIME_DEAL =
  /\b(?:claim|get|grab|unlock|secure)\s+(?:your\s+)?(?:lifetime|permanent)\s+(?:access|license|licence|deal)\b|\blifetime\s+(?:deal|license|licence|access\s+(?:to|for|deal))\b|\bunlocked\s+(?:permanently|forever|for\s+life)\b|\b(?:one[-\s]?time|single|launch[-\s]?special)\s+(?:investment|payment|fee|price|purchase)\s+instead\s+of\s+(?:monthly|recurring|annual)\b|\blaunch[-\s]?special\s+(?:price|pricing|discount|offer|single)\b|\bno\s+monthly\s+fees\s+ever\b/i;
const LIFETIME_LINK = /https?:\/\/|\bwww\.[a-z0-9-]+\.[a-z]{2,}|\b[a-z0-9-]+\.(?:ink|ly|gl|gd|cc|to|link|click|shop|store|io|app)\/[\w-]+/i;

function isLifetimeDealPitch(t) {
  return LIFETIME_DEAL.test(t) && LIFETIME_LINK.test(t);
}

// --- 30. SMS-style cold outreach (reply YES / reply STOP) -------------------
// drjohnshershow.com, 16 Oct 2026: "Meredith White", meredith@virtualhelpdesk.pro,
// (332) 373-1110 -- "Hi, this is Meredith with Virtual Helpdesk Pro. Quick
// question, are you currently looking for help with admin, follow-up, CRM work
// ... If so, reply YES and I'll send over the details. Reply STOP to opt out."
// A text-message blast pasted into a web form. "Reply STOP to opt out" is
// decisive alone: no customer writes it. The YES close ("if so, reply YES",
// "reply YES and I'll send") could come from a real customer booking a slot, so
// it needs the seller's self-introduction too. Never keyed on admin/CRM words:
// an ADHD patient's "admin tasks pile up ... please reply yes" must deliver.
const OPTOUT_STOP = /\breply\s+["'“]?stop["'”]?\s+(?:to\s+)?(?:opt[\s-]?out|unsubscribe)\b/i;
const OPTOUT_YES_CLOSE =
  /\bif\s+(?:so|interested|yes)\s*,?\s*(?:just\s+|simply\s+)?reply\s+["'“]?yes\b|\breply\s+["'“]?yes["'”]?\s*,?\s+and\s+(?:i|we)(?:\s+will|\s*['’]ll)\s+send\b/i;
const OPTOUT_SELLER_INTRO = /\bthis\s+is\s+[A-Z][a-z]+\s+(?:with|from|at)\s+[A-Z]|\b[Qq]uick\s+question\b/;

function isOptOutTextPitch(t) {
  return OPTOUT_STOP.test(t) || (OPTOUT_YES_CLOSE.test(t) && OPTOUT_SELLER_INTRO.test(t));
}


// --- 31. Guest-post site price list (DA/PA table) ---------------------------
// murphyaccounting.com, 20 Oct 2026: "Albert Alex", albertalex.ceo@gmail.com,
// reason "General question" -- "Want to grow your business website online?
// ... We provide: Complete business websites ..." then a table headed
// "S.S Sites DA/PA Traffic" with rows like
//   "1% https://www.business-live.co.uk/ 76/53 102k".
// A link seller's inventory. Rule 19 needs words like "DA 50+" or "backlinks";
// this has neither, only numbers. The table itself is the signal: three or
// more rows of site + "NN/NN" + traffic ("102k") never come from a customer.
// Three site + "NN/NN" rows WITHOUT traffic could be a customer listing due
// dates ("irs.gov 4/15"), so that shape also needs the DA/PA-style header, and
// it is gated with the other SEO-vocabulary rules (eSEOspace prospects say DA/PA).
const SITE_ROW_SRC = String.raw`(?:\b\d{1,3}(?:\.\d+)?\s*%\s*)?(?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:\/[^\s]*)?\s+(?:DA\s*)?\d{1,3}\s*\/\s*(?:PA\s*)?\d{1,3}\b`;
const SITE_ROW = new RegExp(SITE_ROW_SRC, 'gi');
const SITE_ROW_TRAFFIC = new RegExp(SITE_ROW_SRC + String.raw`\s+\d{1,4}(?:[.,]\d+)?\s*[kKmM]\b`, 'gi');
const SITE_METRICS_HEADER = /\b(?:DA\s*\/\s*(?:PA|DR)|DR\s*\/\s*DA|PA\s*\/\s*DA|spam\s*score|S\.?\s?S\s+sites?)\b/i;

function isSiteListPitch(t, sellsSearch) {
  if ((t.match(SITE_ROW_TRAFFIC) || []).length >= 3) return true;
  return !sellsSearch && SITE_METRICS_HEADER.test(t) && (t.match(SITE_ROW) || []).length >= 3;
}

// --- 32. Follow-up nudge on an unanswered marketing pitch --------------------
// colacityroofing.com, 20 Oct 2026: "Bowen Bryant", bbryantdigital@gmail.com --
// "Hello, Bumping this up in case it got buried. Still think there's an easy
// win in your content that could bring in more of the right leads. Worth a
// quick call this week? Bowen"
// The second touch of a cold sequence. It names no service and no SEO word, so
// the first-touch rules miss it. Two halves are required: a nudge about an
// earlier message ("bumping this up", "in case it got buried", "circling back",
// "following up on my last email") AND a growth hook aimed at the reader ("easy
// win", "bring in more of the right leads", "your content/SEO/rankings"). A
// customer chasing their own estimate has the nudge but no hook, so it is
// delivered. Gated with sellsSearch: an eSEOspace prospect may follow up asking
// for more leads.
const FOLLOWUP_NUDGE =
  /\bbump(?:ing|ed)?\s+(?:this|my\s+(?:(?:last|previous|earlier)\s+)?(?:note|message|e-?mail))\b|\bin\s+case\s+(?:it|this|my\s+(?:(?:last|previous|earlier)\s+)?(?:note|message|e-?mail))\s+(?:got|was|went|has\s+been)\s+(?:buried|lost|missed|overlooked)\b|\bcircling\s+back\b|\bfollowing\s+up\s+on\s+my\s+(?:last|previous|earlier|prior)\s+(?:note|message|e-?mail|outreach)\b|\bfloating\s+this\s+(?:back\s+)?(?:up|to\s+the\s+top)\b/i;
const GROWTH_HOOK =
  /\b(?:easy|quick|simple)\s+wins?\b|\blow[-\s]hanging\s+fruit\b|\b(?:bring|drive|generate)\s+(?:you\s+|in\s+)?(?:more|extra|additional)\s+(?:of\s+the\s+right\s+|qualified\s+|quality\s+)?(?:leads|customers|clients|patients|calls|traffic|bookings)\b|\bmore\s+of\s+the\s+right\s+(?:leads|customers|clients|patients)\b|\byour\s+(?:content|seo|rankings?|google\s+rankings?|online\s+presence|organic\s+traffic)\b/i;

function isFollowupNudgePitch(t, sellsSearch) {
  return !sellsSearch && FOLLOWUP_NUDGE.test(t) && GROWTH_HOOK.test(t);
}

// --- 33. Priced one-person SEO offer -----------------------------------------
// elonhealthurgentcare.com, 22 Oct 2026: "David Schipper (CEO, Technician)",
// david@dig1.com, 210-493-6193 -- "100% Tx Based - a One-Man SEO Army - 27 Years
// Experience / Only $199/mo -- Hosting Included upon client request / Find out
// more: https://adventdigital.net/seo/17-point-plan/ / Read my reviews:
// https://g.page/r/..."
// Rule 6 misses it: it never matches a bare "SEO" (Seo is a Korean surname),
// and none of its phrases ("SEO services", "SEO packages") appear. Here the bare
// token is allowed, but only in what the visitor wrote (stripIdentity removes
// names and addresses) and only next to a price per month, "hosting included"
// or a "read my reviews" link. A patient named Seo quoting a $199/mo plan has
// the price but not the token once the name row is gone. The self-description
// ("SEO army", "one-man SEO") stands alone. Gated with sellsSearch.
const SEO_SELF_BRAND =
  /\bseo\s+(?:army|guy|ninja|wizard|guru|veteran)\b|\bone[-\s]man\s+(?:seo|marketing|digital|web)\b/i;
const PRICED_SERVICE =
  /\$\s?\d{2,5}(?:\.\d{2})?\s*(?:\/\s*|per\s+|a\s+)(?:mo|mos|mth|month)\b|\bonly\s+\$\s?\d{2,5}\b|\bhosting\s+included\b|\bread\s+my\s+reviews\b|\bg\.page\/r\//i;

function isPricedSeoOffer(t, sellsSearch) {
  if (sellsSearch) return false;
  if (SEO_SELF_BRAND.test(t)) return true;
  return PRICED_SERVICE.test(t) && /\bseo\b/i.test(stripIdentity(t));
}

// --- 34. Unrequested site rebuild / redesign pitch ---------------------------
// linenoakrentals.com, 22 Oct 2026: "Sunny", sunny@lifebaselabs.com -- "Hey, I
// see you rent linens, tabletop items, furniture and decor ... I rebuilt your
// homepage as a live, working version -- not a mockup. It's a clean pass
// focused on clarity, trust, and decision flow ... If it's useful, I can send it
// over and you can review it directly. If not, you can feel free to ignore this."
// No rule catches it: no SEO, no link, no price. Three shapes, checked only in
// what the visitor wrote (stripIdentity): (a) "I/we rebuilt|redesigned|made a
// new version of your homepage|website|site"; (b) a live/working/new version,
// demo, preview or mockup of/for "your" site next to an offer to send or show
// it; (c) "not a mockup" next to "your homepage/website". Visitors talk about
// "my site" or "our website"; only a vendor tells the business it rebuilt
// theirs. A patient asking "is there a new version of your website?" has no
// send/review offer and is delivered.
const SITE_NOUN = String.raw`(?:home\s?page|web\s?site|site|landing\s+page|web\s+page|front\s+page)`;
const REBUILT_YOUR_SITE = new RegExp(
  String.raw`\b(?:i|we)(?:'ve|’ve|\s+have|\s+had|'d|’d)?\s+(?:already\s+|just\s+|actually\s+|quickly\s+|went\s+ahead\s+and\s+|took\s+the\s+liberty\s+(?:of|to)\s+|took\s+a\s+(?:stab|shot|pass)\s+at\s+)?` +
  String.raw`(?:re-?built|re-?building|re-?build|re-?designed|re-?designing|re-?design|re-?made|re-?created|re-?did|re-?worked|revamped|refreshed|modernized|mocked\s+up|built\s+out|built|designed|created|coded|made|put\s+together|spun\s+up)\s+` +
  String.raw`(?:(?:a|an|the)\s+[\w,'’ -]{0,60}?(?:version|concept|mock-?up|demo|design|draft|prototype|preview|take|redesign|rebuild)\s+(?:of|for)\s+)?` +
  String.raw`your\s+(?:(?:current|existing|whole|entire|company'?s?|business'?s?|old)\s+)?${SITE_NOUN}\b`, 'i');
const VERSION_OF_YOUR_SITE = new RegExp(
  String.raw`\b(?:live|working|clickable|new|fresh|modern|faster|cleaner|better|redesigned|rebuilt|improved|updated|sample|demo)\b[\w,'’ -]{0,40}?\b(?:version|concept|mock-?up|demo|redesign|prototype|preview|draft)\s+(?:of|for)\s+your\s+(?:\w+\s+)?${SITE_NOUN}\b`, 'i');
const SEND_IT_OVER =
  /\b(?:send|share|show)\s+(?:it|this|that|you\s+the\s+link|the\s+link|you\s+a\s+link|it\s+your\s+way)\b|\breview\s+it\b|\btake\s+a\s+look\b|\bnot\s+a\s+mock-?up\b|\bfeel\s+free\s+to\s+ignore\b|\bno\s+(?:cost|charge|strings|obligation)\b/i;
const NOT_A_MOCKUP = new RegExp(String.raw`\bnot\s+(?:just\s+)?a\s+mock-?up\b[\s\S]{0,300}?\byour\s+${SITE_NOUN}\b|\byour\s+${SITE_NOUN}\b[\s\S]{0,300}?\bnot\s+(?:just\s+)?a\s+mock-?up\b`, 'i');

function isSiteRebuildPitch(t) {
  const s = stripIdentity(t);
  if (REBUILT_YOUR_SITE.test(s) || NOT_A_MOCKUP.test(s)) return true;
  return VERSION_OF_YOUR_SITE.test(s) && SEND_IT_OVER.test(s);
}

// --- 35. Branded job-tracker / customer progress-text pitch -------------------
// colacityroofing.com, 22 Oct 2026: "Erik Larson", localbizhelperai@gmail.com,
// 208-431-6379, fake address 1200 Main St -- "A $20 pizza gets a tracker, but a
// $15,000 roof gets 'just checking in.' I set up roof job trackers: your
// customer gets an auto text with your logo and a progress picture at each
// step ... plus a review ask at the end. Can I make you a free sample with your
// logo?" No link, no SEO, no price for the vendor's own service. Three shapes,
// checked only in what the visitor wrote (stripIdentity): (a) the pizza-tracker
// hook in a vendor's voice (your customers/logo, I set up, let me); (b) "I/we set up|build ... job/project trackers" sold for "your
// customers"; (c) "your logo/branding" + a free sample/demo/mockup offer + a
// tracker/progress-text/review-ask feature. A homeowner asking for progress
// photos of their own job never says "your logo" or "your customers".
const PIZZA_TRACKER = /\bpizza\b[\s\S]{0,80}?\btrack(?:er|ing|ed)?\b|\btrack(?:er|ing|ed)?\b[\s\S]{0,80}?\bpizza\b/i;
const VENDOR_VOICE = /\b(?:i|we)(?:'ve|’ve|\s+have)?\s+(?:set\s+up|setup|build|built|make|made|create|offer|help)\b|\blet\s+me\b|\bfor\s+you\b/i;
const SET_UP_TRACKERS = /\b(?:i|we)(?:'ve|’ve|\s+have)?\s+(?:set\s+up|setup|build|built|make|made|create|created|offer|install|sell)\s+[\w,'’ -]{0,40}?\b(?:job|project|roof|order|customer|status|progress)\s+(?:status\s+|progress\s+)?trackers?\b/i;
const YOUR_CUSTOMERS = /\byour\s+(?:customers?|clients?|homeowners?|patients?|buyers?)\b/i;
const YOUR_LOGO = /\byour\s+(?:logo|branding|brand(?:\s+colors)?)\b/i;
const FREE_SAMPLE = /\bfree\s+(?:sample|demo|mock-?up|preview|trial|example)\b|\bmake\s+(?:you\s+)?(?:a|one)\s+(?:free\s+)?(?:sample|demo|mock-?up)\b|\bset\s+(?:one|it)\s+up\s+for\s+(?:you|free)\b/i;
const TRACKER_FEATURE = /\btrack(?:er|ers|ing)\b|\bprogress\s+(?:pictures?|photos?|updates?|texts?)\b|\bauto(?:matic|mated)?[\s-]+(?:texts?|sms|updates?)\b|\breview\s+(?:ask|request)s?\b|\bstatus\s+updates?\b/i;

function isJobTrackerPitch(t) {
  const s = stripIdentity(t);
  if (PIZZA_TRACKER.test(s) && (YOUR_CUSTOMERS.test(s) || YOUR_LOGO.test(s) || VENDOR_VOICE.test(s))) return true;
  if (SET_UP_TRACKERS.test(s) && YOUR_CUSTOMERS.test(s)) return true;
  return YOUR_LOGO.test(s) && FREE_SAMPLE.test(s) && TRACKER_FEATURE.test(s);
}

// --- 36. "Feels like cheating" AI faceless-video tool pitch ------------------
// laurabasscounseling.com, 22 Oct 2026: "fleet.hamish@hotmail.com", phone
// 673366423 -- "Hi laurabasscounseling.com Administrator! I almost didn't share
// this... because honestly, it feels like cheating. ... publishing 3x more
// videos -- with zero camera time, zero voice recording ... AI voiceovers that
// sound scarily human ... If you can type, you can make pro-level reels."
// Two shapes, checked only in what the visitor wrote (stripIdentity): (a) a
// greeting addressed to the domain name itself ("Hi example.com Administrator")
// plus any sales hook, link or AI-video feature; (b) two or more AI-video
// features (no camera / no filming / AI voiceover / auto subtitles / script to
// video) plus a testimonial hook ("feels like cheating", "if you can type",
// "no skills needed", "3x more videos"). A client who is shy on camera or asks
// about video sessions names none of these features.
const DOMAIN_GREETING = /(?:^|\n)[ \t]*(?:[a-z][a-z ]{1,20}:[ \t]*)?\W*(?:hi|hello|hey|dear|greetings|good\s+\w+)[,!]?\s+(?:the\s+)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|co|us|io|biz|info|health|law|nz|uk|ca|au)\s+(?:site\s+|website\s+)?(?:administrator|admin|webmaster|owner|team|manager|support|editor)s?\b/i;
const AIVIDEO_FEATURE = [
  /\bzero\s+(?:camera|filming|voice\s+recording|editing)\b|\bno\s+camera\b|\bwithout\s+(?:filming|a\s+camera|showing\s+your\s+face|recording\s+your\s+voice)\b|\bfaceless\b/i,
  /\bAI[\s-]+(?:voice-?overs?|voices?|avatars?|presenters?|video\s+(?:generator|maker|tool))\b|\bvoice-?overs?\s+that\s+sound\b/i,
  /\b(?:auto(?:matic(?:ally)?)?[\s-]*generated|animated|auto)\s+(?:animated\s+)?(?:subtitles|captions)\b/i,
  /\b(?:script|blog\s+post|article|text|prompt)\b[^.\n]{0,40}?(?:→|->|into|to)\s+(?:a\s+)?(?:finished\s+)?(?:vertical\s+)?(?:video|youtube\s+short|reel|tiktok)s?\b/i,
  /\b(?:pro(?:-level|fessional)?|viral)\s+(?:reels|shorts|tiktoks|videos)\b|\b\d+x\s+more\s+(?:videos|reels|content)\b/i,
];
const SALES_HOOK = /\bfeels?\s+like\s+cheating\b|\balmost\s+didn['’]?t\s+share\b|\bif\s+you\s+can\s+type\b|\byou\s+don['’]?t\s+need\s+any\s+skills\b|\bno\s+(?:skills|experience)\s+(?:needed|required)\b|\b(?:and\s+)?the\s+best\s+part\?|\bscarily\s+human\b|\blike\s+crazy\b|\bhttps?:\/\//i;

function isAiVideoToolPitch(t) {
  const s = stripIdentity(t);
  const feats = AIVIDEO_FEATURE.filter((re) => re.test(s)).length;
  if (DOMAIN_GREETING.test(s) && (feats > 0 || SALES_HOOK.test(s))) return true;
  return feats >= 2 && SALES_HOOK.test(s);
}

// --- 37. "Clients slip through the cracks" AI chat-widget subscription pitch -
// 26 Oct 2026: "Rebecca Raymond", rebecca@localcustomers.ai, +1 844 347 2695 --
// "you're doing such an amazing job, but I'd love to help make sure no
// potential clients slip through the cracks! A lot of folks prefer chatting
// with AI instead of old-school website forms ... We built a super easy tool
// at localcustomers.ai that answers questions, qualifies leads, and even books
// appointments for you automatically ... intro rate ... $29.99/month with zero
// surprise fees ... Prefer not to hear from us? <unsubscribe link>".
// Checked only in what the visitor wrote (stripIdentity). Two kinds of signal:
// what the tool does (chat with AI, answers questions, qualifies leads, books
// appointments for you, leads slipping through the cracks, old-school forms)
// and how it is SOLD (we built a tool, intro rate, no surprise fees, "pop over
// to", an unsubscribe footer). Needs 2 features + 1 sale signal, or 1 + 2.
// A price alone is not a sale signal: an answering-service customer can write
// "we need an AI receptionist that answers questions, budget $300/month". A
// parent whose child is "slipping through the cracks" names no lead or client.
const AICHAT_FEATURE = [
  /\bchat(?:ting)?\s+with\s+(?:an?\s+)?AI\b|\bAI[\s-]+(?:chat\s*bots?|chat\s+(?:assistants?|agents?|widgets?)|receptionists?|front\s+desk|(?:sales\s+)?agents?)\b/i,
  /\banswers?\s+(?:all\s+)?(?:your\s+)?(?:customer|client|visitor|patient)?s?'?\s*questions\b[^.\n]{0,60}\b(?:qualif|book|schedul|24\/7|automatically|around\s+the\s+clock)/i,
  /\bqualif(?:y|ies|ying)\s+(?:your\s+)?(?:new\s+)?leads\b/i,
  /\b(?:books?|schedules?)\s+(?:appointments|meetings|consultations|calls|jobs)\s+(?:for\s+you|automatically|24\/7|around\s+the\s+clock)/i,
  /\b(?:potential\s+)?(?:clients|customers|leads|patients|calls|inquiries)\s+(?:slip|slipping|fall|falling)\s+through\s+the\s+cracks\b/i,
  /\bold[\s-]school\s+(?:web\s*site\s+)?(?:contact\s+)?forms?\b|\binstead\s+of\s+(?:filling\s+out\s+)?(?:a\s+)?(?:web\s*site\s+|contact\s+)?forms?\b/i,
];
const AICHAT_SALE = [
  /\b(?:we|i)(?:'ve|\s+have)?\s+(?:built|made|created|developed|launched)\s+(?:a|an|this)\s+(?:super\s+|really\s+)?(?:easy|simple|little|smart|new)?[\s-]*(?:to[\s-]use\s+)?(?:AI\s+)?(?:tool|app|platform|widget|chat\s*bot|assistant|software)\b/i,
  /\bintro(?:ductory)?\s+(?:rate|price|pricing|offer|deal)\b|\blaunch\s+(?:pricing|special)\b/i,
  /\b(?:zero|no)\s+(?:surprise|hidden|setup|set-up|contract)\s+(?:fees|costs|charges)\b/i,
  /\bprefer\s+not\s+to\s+hear\s+from\s+us\b|\bunsubscribe\b|\bopt[\s-]out\b/i,
  /\bpop\s+over\s+to\b|\brooting\s+for\s+you\b|\btakes?\s+(?:just\s+)?(?:a\s+few|\d+)\s+(?:days|minutes)\s+to\s+set\s+up\b/i,
];

function isAiChatWidgetPitch(t) {
  const s = stripIdentity(t);
  const feats = AICHAT_FEATURE.filter((re) => re.test(s)).length;
  if (!feats) return false;
  const sale = AICHAT_SALE.filter((re) => re.test(s)).length;
  return (feats >= 2 && sale >= 1) || sale >= 2;
}

// --- 38. Outsourced bookkeeping / accounting firm pitch ---------------------
// 27 Oct 2026, therentallisterlv.com: "Josh Wilson", yourbooks@seastarsacct.com,
// 510-201-4888 -- "Hello, We are a Bookkeeping/Accounting Firm. We help
// businesses across the US with: -Monthly bookkeeping and reconciliations
// -Financial reporting and analysis -Accounts payable/receivable management
// -Payroll processing and 1099 filings -Year-end preparation for CPAs. We can
// reduce your CPA costs and keep your books audit-ready. Can we connect?"
// Rule 12 needs "do you need ... services"; this one never asks.
// Several clients are CPA, tax and payroll firms whose real customers write
// "we need monthly bookkeeping, reconciliations and payroll". So the service
// list alone counts for nothing. Two halves, both required, in what the
// visitor wrote (stripIdentity): the SENDER presents itself as the firm
// ("we are a bookkeeping firm", "we provide outsourced bookkeeping", "we help
// businesses across the US with"), AND it offers to work on the RECIPIENT'S
// books ("reduce your CPA costs", "keep your books audit-ready", "handle your
// bookkeeping"). A customer says "our books"; an accounting firm asking a CPA
// to take its overflow returns never offers to keep "your books".
const BOOKS_SELF =
  /\bwe(?:'re|’re|\s+are)\s+(?:a|an)\s+(?:[\w-]+\s+){0,3}?(?:bookkeeping|accounting|accountancy|payroll|cpa)(?:\s*(?:[\/&,+]|and)\s*(?:bookkeeping|accounting|accountancy|payroll|tax|cpa))?\s+(?:firm|company|agency|team|service|services|provider|practice|outsourcing)\b|\b(?:we|our\s+(?:team|firm))\s+(?:provide|provides|offer|offers|handle|handles|deliver|delivers|speciali[sz]e\s+in)\s+(?:[\w-]+\s+){0,2}?(?:outsourced|virtual|remote|offshore|affordable|full[\s-]cycle|monthly)\s+(?:bookkeeping|accounting|payroll)\b|\bwe\s+help\s+(?:small\s+)?(?:businesses|companies|business\s+owners|firms)\s+(?:across|throughout|all\s+over|nationwide|in\s+the\s+(?:us|usa|u\.s\.))\b[^.\n]{0,40}\bwith\b/i;
const BOOKS_YOURS =
  /\b(?:reduce|lower|cut|save\s+(?:on|you))\s+(?:on\s+)?your\s+(?:cpa|accounting|bookkeeping|accountant|tax\s+prep(?:aration)?|payroll)\s+(?:costs?|fees|bills?|expenses)\b|\bkeep\s+your\s+books\b|\byour\s+books\s+(?:audit|tax)[\s-]ready\b|\b(?:manage|handle|take\s+over|clean\s+up|catch\s+up|do|maintain|reconcile)\s+(?:all\s+)?your\s+(?:books|bookkeeping|accounting|payroll|reconciliations|accounts\s+(?:payable|receivable))\b|\byour\s+(?:bookkeeping|accounting)\s+(?:needs|off\s+your\s+plate)\b/i;

function isBookkeepingFirmPitch(t) {
  const s = stripIdentity(t);
  return BOOKS_SELF.test(s) && BOOKS_YOURS.test(s);
}

// --- 39. "The 9 Human Types" author / video pitch ----------------------------
// 28 Oct 2026, laurabasscounseling.com: "Decker", deering.rolando@gmail.com,
// 904742268 -- "You might be overlooking a gift simply because you've always
// assumed everyone could do it. I'm Jennifer, author of The 9 Human Types. My
// work explores nine natural intelligences ... I've put together a video
// exploring all nine ..." Name, email and phone change every time.
// Therapy clients may well mention a personality book they read, and authors
// write to therapists for real help. So no signal blocks alone: the book or
// its "nine natural intelligences" framing, or the "overlooking a gift"
// opener, must come WITH the promo half (the sender introducing themselves as
// the author, or pushing their video).
const HT_TYPES =
  /\b(?:9|nine)\s+human\s+types\b|\b(?:9|nine)\s+natural\s+(?:intelligences|strengths|gifts)\b|\ball\s+nine\s+(?:types|intelligences)\b/i;
const HT_HOOK =
  /\boverlooking\s+a\s+gift\b|\bassumed\s+everyone\s+(?:else\s+)?could\s+do\s+it\b/i;
const HT_PROMO =
  /\bi(?:'m|’m|\s+am)\s+[A-Z][\w.-]*,?\s+(?:the\s+)?author\s+of\b|\bi(?:'ve|’ve|\s+have)\s+(?:put\s+together|made|recorded|created)\s+a\s+(?:short\s+|free\s+|quick\s+)?video\b|\bwatch\s+(?:it|the\s+(?:full\s+)?video)\s+(?:here|now)\b|\bvideo\s+exploring\b/i;

function isHumanTypesPitch(t) {
  const s = stripIdentity(t);
  const types = HT_TYPES.test(s), hook = HT_HOOK.test(s), promo = HT_PROMO.test(s);
  return (promo && (types || hook)) || (types && hook);
}
// --- 40. AI-answer "scan" follow-up with a paste-ready FAQ -------------------
// 29 Oct 2026, takecarejunk.com form (the text was written for Avalon Music):
// "Juno, Scope", 611 South DuPont Highway, Dover, DE -- "I wanted to come back
// to the string quartet question from your scan. When we asked ... none of
// ChatGPT, Claude or Perplexity named you ... Here's an FAQ you can paste as is
// ... I can add that question to your Scope tracking and rerun the scan so you
// can see whether the tools start naming you."
// Rule 22 misses it: no "show up in AI search", no "can I send suggestions".
// Customers do say "ChatGPT didn't mention you, but a friend did", so that line
// alone never blocks. It must come with a vendor's tools: a scan/tracking of
// the business, or copy written for the business to paste. Checked only in
// what the visitor wrote (stripIdentity). Gated with sellsSearch: a prospect
// writing to an SEO agency about AI answers is a lead there.
const AIS_ENGINE =
  /\b(?:chat\s?gpt|perplexity|gemini|copilot|grok|llms?|ai\s+(?:search|tools?|assistants?|answers?|engines?|overviews?|models?)|the\s+(?:ai\s+)?tools)\b/i;
const AIS_NOT_NAMED =
  /\b(?:none|neither|not\s+one)\s+of\b[\s\S]{0,120}?\b(?:named|mentioned|recommended|cited|listed|suggested|surfaced|included|returned)\s+(?:you|your\s+(?:business|company|practice|firm|brand|site|name))\b|\b(?:didn'?t|did\s+not|don'?t|do\s+not|doesn'?t|does\s+not|never|won'?t)\s+(?:name|mention|recommend|cite|list|surface|include|return)\s+(?:you|your\s+(?:business|company|practice|firm|brand|site|name))\b|\b(?:start(?:s|ed)?|begin|begins)\s+(?:naming|mentioning|recommending|citing|listing)\s+you\b|\bnothing\s+(?:of\s+yours|from\s+your\s+site)\s+to\s+(?:quote|cite)\b/i;
const AIS_SCAN =
  /\bfrom\s+your\s+(?:\w+\s+)?scan\b|\bre-?run\s+(?:the|your)\s+scan\s+so\s+you\b|\byour\s+(?:free\s+)?(?:ai|visibility|geo|aeo|llm)\s+(?:\w+\s+)?scan\b|\b(?:add|added)\s+(?:that|this|the)\s+(?:question|prompt|query)\s+to\s+your\b|\btrack(?:ing)?\s+(?:that|this|the)\s+(?:question|prompt|query)\b/i;
// Case-sensitive on purpose: a product name ("your Scope tracking"), not "your order tracking".
const AIS_TRACK = /\byour\s+[A-Z][\w-]+\s+tracking\b/;
const AIS_PASTE =
  /\b(?:faq|answer|paragraph|copy|snippet|section)\s+you\s+(?:can|could)\s+(?:paste|copy|drop|add)\b|\bpaste\s+(?:it\s+)?as[\s-]is\b|\b(?:faq|answer)\s+(?:i|we)(?:'ve|’ve)?\s+(?:wrote|written|drafted|put\s+together)\s+for\s+you\b/i;

function isAiScanFollowup(t, sellsSearch) {
  if (sellsSearch) return false;
  const s = stripIdentity(t);
  if (!AIS_ENGINE.test(s)) return false;
  const scan = AIS_SCAN.test(s) || AIS_TRACK.test(s), paste = AIS_PASTE.test(s);
  return (AIS_NOT_NAMED.test(s) && (scan || paste)) || (scan && paste);
}
// --- 41. "Top of search results" placement pitch -----------------------------
// 30 Oct 2026, drlauralehmann.com form: "Jonathan Pierce"
// (jonathan.pierce@jmailservice.com, 8054002077): "We specialize in putting
// businesses like yours right at the top of search results. Setup is fast and
// effortless. Is this something you'd like to explore?https://www.google.com"
// No "SEO", no "Google", no "rankings", so rules 6 and 33 miss it. The tell is
// a vendor putting OTHER businesses (or yours) at the top of search, plus a
// sales close. A visitor saying "I found you at the top of Google" has no
// placing verb with a business as its object. Gated with sellsSearch: on an
// SEO agency's form, "can you put businesses like ours at the top" is a lead.
const TOS_PLACE =
  /\b(?:put|putting|puts|get|getting|gets|place|placing|places|land|landing|rank|ranking|ranks|move|moving|push|pushing|bring|bringing)\s+(?:local\s+|small\s+)?(?:businesses|companies|practices|brands|firms|clinics|contractors|you|your\s+(?:business|company|practice|firm|clinic|brand|site|website|web\s*site|listing|office))(?:\s+like\s+yours)?\s+(?:right\s+|straight\s+)?(?:at|to|on|onto|in)\s+(?:the\s+)?(?:very\s+)?top\s+(?:of|spots?\s+(?:of|on|in))\s+(?:the\s+)?(?:search|google|bing|maps|local\s+search|search\s+(?:results|engines?|rankings)|google\s+(?:search|results|maps))\b/i;
const TOS_CLOSE =
  /\bsomething\s+you(?:'d|’d|\s+would)\s+(?:like\s+to\s+explore|be\s+interested\s+in|want\s+to\s+explore)\b|\bset-?up\s+is\s+(?:fast|quick|easy|simple|effortless)\b|\b(?:fast|quick)\s+and\s+(?:effortless|easy|simple)\b|\bwe\s+specialize\s+in\b|\bbusinesses\s+like\s+yours\b|\bopen\s+to\s+(?:a\s+)?(?:quick\s+)?(?:chat|call|conversation)\b|\binterested\s+in\s+learning\s+more\b|\bworth\s+exploring\b/i;

function isTopOfSearchPitch(t, sellsSearch) {
  if (sellsSearch) return false;
  const s = stripIdentity(t);
  return TOS_PLACE.test(s) && TOS_CLOSE.test(s);
}
// --- 42. Offer to build a "working version" of your homepage ------------------
// 30 Oct 2026, DENCO Fuses /contact/: "Sunny Gupta", Signal Set
// (sunny+izzs57xs@signalsetbase.com): "I'd like to try a different approach to
// your homepage, with a stronger focus on getting visitors to take the next
// step. I can build a working single-page version for you to explore. Would you
// be interested in seeing it?" Same sender as rule 34, but it OFFERS to build
// instead of saying it already rebuilt, so rule 34 misses it. Blocked when a
// vendor offers to build a version/demo/mockup (or pitches "a different
// approach to your homepage") AND asks if you want to see or explore it. A
// customer asks for "our site" and does not ask the business to look at a demo.
const HV_SITE = String.raw`(?:home\s?page|web\s?site|site|landing\s+page|web\s+page|front\s+page)`;
const HV_YOUR_SITE = new RegExp(String.raw`\byour\s+(?:(?:current|existing|whole|entire|old)\s+)?${HV_SITE}\b`, 'i');
const HV_OFFER_BUILD = new RegExp(
  String.raw`\b(?:i|we)(?:'d|’d|'ll|’ll|\s+would|\s+can|\s+could|\s+will|\s+am\s+happy\s+to|\s+are\s+happy\s+to)?\s+(?:like\s+to\s+|love\s+to\s+|be\s+happy\s+to\s+|gladly\s+|happily\s+|quickly\s+)?` +
  String.raw`(?:build|create|make|mock\s+up|put\s+together|design|spin\s+up|code|whip\s+up|draft)\s+(?:you\s+|for\s+you\s+)?(?:a|an|one)\s+[\w,'’ -]{0,50}?\b(?:version|demo|mock-?up|prototype|preview|concept|draft|redesign|rebuild|page)\b`, 'i');
const HV_APPROACH = new RegExp(
  String.raw`\b(?:different|new|fresh|better|alternative|alternate|bolder)\s+(?:approach|take|direction|angle|layout|design)\s+(?:to|on|for)\s+your\s+(?:\w+\s+)?${HV_SITE}\b`, 'i');
const HV_SEE_IT =
  /\binterested\s+in\s+(?:seeing|viewing|checking\s+out|having\s+a\s+look\s+at)\s+(?:it|this|that|the\s+\w+|a\s+\w+)\b|\b(?:want|like|care)\s+to\s+(?:see|view|check\s+out)\s+(?:it|this|that)\b|\bfor\s+you\s+to\s+(?:explore|review|see|try|click\s+through|look\s+at|check\s+out)\b|\b(?:shall|should|can|may)\s+i\s+(?:send|share|show)\b|\b(?:send|share|show)\s+(?:it|this|that)\s+(?:over|your\s+way|to\s+you)\b|\bno\s+(?:cost|charge|strings|obligation)\b/i;

function isHomepageVersionOffer(t) {
  const s = stripIdentity(t);
  if (!HV_SEE_IT.test(s)) return false;
  if (HV_APPROACH.test(s)) return true;
  return HV_OFFER_BUILD.test(s) && HV_YOUR_SITE.test(s);
}

// --- 43. Offer to license / buy your company's data for AI ------------------
// 6 Nov 2026, mymontanalawyer.com (A&M Law) /contact/: "Jason Horowitz",
// Renaissance Data Lab (Jason@renaissancedatalabs.com): "We're looking to
// license de-identified business data from A&M Law (email, CRM, Drive,
// Dropbox, Jira, Slack, etc.) for AI research. Indicative estimates for
// companies like yours run from about $150K to over $1M ... You keep owning
// your data". Blocked when a sender offers to license/buy/pay for data FROM the
// business (or "your data") AND says it is for AI. A client who wants to
// license OUR data to an AI company, or needs a data licensing contract
// reviewed, says "our"/"my" data and is delivered.
const DL_VERB = String.raw`(?:licens(?:e|ing)|buy(?:ing)?|purchas(?:e|ing)|pay(?:ing)?\s+(?:you\s+)?for|monetiz(?:e|ing)|monetis(?:e|ing))`;
const DL_ADJ = String.raw`(?:(?:de-?identified|anonymi[sz]ed|historical|internal|business|company|companies'?|operational|proprietary|archived?|workplace|enterprise|real-world|unstructured|corporate|organi[sz]ational)[\s,]+){0,4}`;
const DL_FROM = new RegExp(String.raw`\b${DL_VERB}\s+${DL_ADJ}(?:data|records|datasets?|archives?|communications)\s+from\s+(?!(?:my|our)\b)`, 'i');
const DL_YOUR = new RegExp(String.raw`\b${DL_VERB}\s+(?:some\s+of\s+)?your\s+[\w ,&'’/-]{0,40}?\b(?:data|records|datasets?|archives?|communications|messages)\b`, 'i');
const DL_AI = /\b(?:AI|A\.I\.|artificial\s+intelligence|machine\s+learning|LLMs?|large\s+language\s+models?|foundation\s+models?)\b|\btrain(?:ing)?\s+(?:\w+\s+)?models?\b/i;
const DL_TOOLS = /\b(?:slack|jira|dropbox|google\s+drive|crm|email|e-mail|notion|salesforce|hubspot|confluence|sharepoint|gmail|outlook|asana|microsoft\s+teams|zendesk|clio)\b/gi;
const DL_PITCH = /\bcompanies\s+like\s+yours\b|\byou\s+keep\s+(?:owning|ownership|full\s+ownership)\b|\bpersonal\s+information\s+is\s+removed\b|\$\s?\d{2,3}\s?k\b/i;

function isDataLicensingPitch(t) {
  const s = stripIdentity(t);
  if (!DL_AI.test(s)) return false;
  if (DL_FROM.test(s) || DL_YOUR.test(s)) return true;
  // Tool list (email, CRM, Slack, Jira...) + licensing words + vendor framing.
  const tools = new Set((s.match(DL_TOOLS) || []).map((x) => x.toLowerCase()));
  return tools.size >= 3 && /\blicens(?:e|ing)\b/i.test(s) && DL_PITCH.test(s);
}

// --- 44. Priced promo-video production pitch ---------------------------------
// 7 Nov 2026, dencofuses.com /contact/: "Joanna" (joannariggs56@gmail.com,
// country UK): "I just visited dencofuses.com and wondered if you've ever
// considered an impactful video to advertise your business? ... Our videos cost
// just $195 (USD) for a 30 second video ($239 for 60 seconds) and include a full
// script, voice-over and video. I can show you some previous videos we've done
// ... samples of our previous work." Blocked when a SELLER ("our videos",
// "videos we've done", "we create") offers a video for the business AND gives
// two of: a price, script + voice-over, samples of past work, the "I just
// visited <site>" opener. A client asking US for a video quote says "I need /
// how much" and has no seller wording, so it is delivered.
const PV_VIDEO = /\b(?:explainer|promo(?:tional)?|marketing|animated|advert(?:ising)?|commercial|sales|brand(?:ing)?|business|impactful|engaging|short)\s+videos?\b|\bvideos?\s+(?:to|that\s+(?:will\s+)?)\s*(?:advertise|promote|explain|market|showcase)\b|\b\d{2,3}[\s-]*(?:second|sec|s)\s+(?:video|clip|ad)\b/i;
const PV_SELLER = /\bour\s+(?:videos?|prices?|packages?|team|previous\s+work|work|animators?|studio)\b|\bvideos?\s+(?:we(?:'|’)?ve|we\s+have)\s+(?:done|made|created|produced)\b|\bwe\s+(?:create|make|produce|offer)\s+(?:\w+\s+){0,3}videos?\b|\bI\s+can\s+(?:show|send)\s+you\b/i;
const PV_PRICE = /(?:\$|USD\s?|£|€)\s?\d{2,4}(?:\.\d{2})?\b[^.\n]{0,80}\bvideo|\bvideo[^.\n]{0,80}(?:\$|USD\s?|£|€)\s?\d{2,4}\b|\b(?:cost|costs|prices?\s+start)\s+(?:from\s+)?(?:just|only)\s+(?:\$|USD|£|€)/i;
const PV_SCRIPT = /\bscript(?:ing|writing)?\b[^.\n]{0,60}\bvoice[\s-]?overs?\b|\bvoice[\s-]?overs?\b[^.\n]{0,60}\bscript/i;
const PV_SAMPLES = /\b(?:samples?|examples?)\s+of\s+(?:our|my)\s+(?:previous\s+|past\s+|recent\s+)?work\b|\bprevious\s+videos\b|\bsend\s+(?:you\s+)?some\s+(?:samples?|examples?)?\s*over\b/i;
const PV_VISITED = /\bI\s+(?:just\s+)?(?:visited|came\s+across|was\s+looking\s+at|checked\s+out)\s+(?:your\s+(?:site|website)|[\w.-]+\.(?:com|net|org|co|us|io|biz|nz|uk))\b[^.\n]{0,40}\b(?:wondered|wondering)\b/i;

function isPricedVideoPitch(t) {
  const s = stripIdentity(t);
  if (!PV_VIDEO.test(s) || !PV_SELLER.test(s)) return false;
  return [PV_PRICE, PV_SCRIPT, PV_SAMPLES, PV_VISITED].filter((r) => r.test(s)).length >= 2;
}

// --- 45. Website redesign / refresh sales pitch ------------------------------
// 8 Nov 2026, Hannah Melotto (h.melotto@melottogroup.com, 2158218810): "We help
// businesses redesign and refresh their websites. With 2027 just around the
// corner, now is a great time to give your website a new look and feel. ... I'd
// be happy to share samples of our work and pricing if you're interested. You
// can book a time with me to chat." Blocked on seller wording about THEIR
// service plus "your website needs a new look", or either one with a strong
// sales line. A web agency owner hiring this business, or a customer asking for
// "samples of your work", has no such pair and is delivered.
const RF_SERVICE = /\bwe\s+(?:help|work\s+with|partner\s+with)\s+(?:\w+\s+){0,3}(?:businesses|companies|brands|firms|practices|owners|organi[sz]ations)\s+(?:to\s+|with\s+)?(?:re-?design|refresh|revamp|moderni[sz]e|update|upgrade|re-?build)\w*\b[^.\n]{0,40}\bweb\s?sites?\b|\bwe\s+(?:re-?design|refresh|revamp|moderni[sz]e|re-?build)\s+(?:\w+\s+){0,3}web\s?sites\b/i;
const RF_YOUR = /\b(?:give|giving)\s+your\s+(?:web\s?)?site\s+(?:a|an)\s+(?:\w+\s+){0,2}(?:look|feel|design|makeover|refresh|update)\b|\byour\s+(?:web\s?)?site\b[^.\n]{0,60}\b(?:new|fresh|modern|updated)\s+(?:look|design)\b|\b(?:re-?design|refresh|revamp|moderni[sz]e)\s+your\s+(?:web\s?)?site\b/i;
const RF_STRONG = /\b(?:samples?|examples?)\s+of\s+our\s+(?:\w+\s+)?work\b|\bour\s+portfolio\b|\bpricing\s+if\s+you(?:'|’)?(?:re|\s+are)\s+interested\b|\b(?:just\s+)?around\s+the\s+corner\b[^.\n]{0,40}\b(?:great|perfect|good|ideal)\s+time\b/i;
const RF_SOFT = /calendly\.com\/|\bbook\s+a\s+(?:time|call|meeting)\s+with\s+me\b|\b(?:love|welcome)\s+the\s+opportunity\s+to\s+work\s+with\s+you\b|\b(?:nearly\s+|over\s+|almost\s+)?(?:a\s+decade|\d{1,2}\+?\s+years)\s+of\s+experience\b|\bhoping\s+to\s+connect\b/i;

function isSiteRefreshPitch(t) {
  const s = stripIdentity(t);
  const service = RF_SERVICE.test(s);
  const your = RF_YOUR.test(s);
  const strong = RF_STRONG.test(s);
  const soft = RF_SOFT.test(s);
  if (service && your) return strong || soft;
  return (service || your) && strong && soft;
}

// --- 46. "We call your web leads in 30 seconds" pitch ------------------------
// 8 Nov 2026, laurabasscounseling.com, Senaida McCash (hello@amazingleadgen.com,
// 290478905): "I'm reaching out through your contact form on purpose. Imagine
// I'm a new customer: how soon before you call me? ... The first one to call
// often wins the job ... we call them in about 30 seconds ... Our AI takes the
// call." Same pitch same day, Lora Norman (hello@ultraleadgeneration.com) opens
// "Quick test: this message came through your contact form." The seller's "we call them" is required. A real customer saying "how
// soon before you call me, the first one to call gets the job" is delivered.
const SL_TEST = /\b(?:reaching\s+out|writing|messaging)\s+(?:to\s+you\s+)?(?:through|via|using|on)\s+your\s+(?:contact\s+)?form\s+on\s+purpose\b|\bimagine\s+I(?:'|’)?m\s+a\s+(?:new\s+|real\s+)?(?:customer|client|lead|prospect)\b|\bquick\s+test\b[^\n]{0,60}\bcontact\s+form\b|\bif\s+I\s+were\s+a\s+(?:new\s+|real\s+)?(?:customer|client|lead|prospect)\b[^.\n]{0,40}\bclock\b/i;
const SL_FIRST = /\bfirst\s+(?:one|business|company|person)\s+to\s+(?:call|respond|reply|answer)\b[^.\n]{0,30}\b(?:wins|gets)\s+the\s+(?:job|customer|client|sale|deal|lead)\b|\b(?:fill\s+(?:in|out)\s+a\s+form|submit\s+a\s+form)\b[^.\n]{0,40}\bother\s+(?:businesses|companies)\b/i;
const SL_CALLS = [
  /\bwe\s+(?:call|ring|phone|dial)\s+(?:them|your\s+leads?|every\s+lead|each\s+lead|the\s+lead|visitors?)\b[^.\n]{0,20}\b(?:\d{1,3}|sixty|thirty)\s*(?:seconds?|secs?)\b/i,
  /\bwhen\s+a\s+(?:visitor|lead|prospect)\s+(?:leaves|enters|submits|gives)\s+(?:their|a|your)\s+(?:phone\s+)?(?:number|details)\s+on\s+your\s+(?:web\s?)?site\b|\bwhen\s+a\s+(?:customer|visitor|lead|prospect)\s+asks\s+for\s+a\s+call\s+on\s+your\s+(?:web\s?)?site\b/i,
  /\bwe\s+(?:ring|call)\s+your\s+phone\b[^.\n]{0,30}\bconnect\s+you\b|\bconnect\s+you\s+while\s+they(?:'|’)?re\s+still\s+on\s+your\s+(?:web\s?)?site\b/i,
  /\bbusy\s+or\s+closed\?[^\n]{0,30}\bour\s+AI\b|\bour\s+AI\s+(?:takes|answers|handles)\s+the\s+call\b|\b(?:if\s+)?nobody\s+answers,?\s+our\s+AI\b|\bour\s+AI\s+picks\s+up\b/i,
];

function isSpeedToLeadPitch(t) {
  const s = stripIdentity(t);
  const calls = SL_CALLS.filter((r) => r.test(s)).length;
  if (calls >= 2) return true;
  if (calls === 1) return SL_TEST.test(s) || SL_FIRST.test(s);
  return SL_TEST.test(s) && SL_FIRST.test(s);
}

// --- 47. "Design issues on your website" audit tease -------------------------
// 8 Nov 2026, spiral2grow.com, mvmarcovillarreal49@gmail.com: "I noticed a few
// design-related issues on your website ... Would you like me to send a
// screenshot highlighting these errors? I can also prepare a detailed audit
// report, along with a proposal and pricing to improve your website's design
// and optimize its ranking." Needs the claim AND two sales offers. A visitor
// reporting a broken page and offering one screenshot is delivered.
const DT_FOUND = /\b(?:I|we)\s+(?:have\s+|just\s+|recently\s+)*(?:noticed|found|spotted|identified)\s+(?:a\s+few|a\s+couple\s+of|some|several|\d+)\s+(?:[\w-]+\s+){0,2}(?:issues|errors|problems|flaws|mistakes)\b[^.\n]{0,40}\b(?:your\s+(?:web\s?)?site|[\w-]+\.(?:com|net|org|co|us|io|biz))\b/i;
const DT_OFFERS = [
  /\b(?:send|share)\s+(?:you\s+)?(?:a\s+|the\s+)?screenshots?\b[^.\n]{0,40}\b(?:errors?|issues?|problems?)\b/i,
  /\b(?:I|we)\s+can\s+(?:also\s+)?(?:prepare|send|provide|share)\b[^.\n]{0,30}\baudit\b/i,
  /\bproposal\s+and\s+pricing\b|\bpricing\s+to\s+improve\b/i,
  /\b(?:improve|optimi[sz]e|fix)\s+your\s+(?:web\s?)?site(?:'|’)?s?\s+(?:design|ranking)\b|\boptimi[sz]e\s+its\s+ranking\b/i,
];

function isDesignIssuesTease(t) {
  const s = stripIdentity(t);
  return DT_FOUND.test(s) && DT_OFFERS.filter((r) => r.test(s)).length >= 2;
}

// --- 48. Business funding pitch ("free to check, doesn't affect your credit") --
// 9 Nov 2026, spiral2grow.com, Johnny Bennet (johny@engelsbergpartners.com,
// 6605308999): "We help small and medium sized businesses see what funding they
// can get for things like payroll, equipment, inventory or growth. It's free to
// check, doesn't affect your credit, and there's no obligation. If that sounds
// useful, just reply and I'll send the details. If not, reply stop and we won't
// reach out again."
// 12 Nov 2026, heatherstaxserviceandmore.com, Daniela Brown
// (daniel@heylending.com, 9294510548): "Are you the right person at Heather's
// Tax Service & More who handles financing? We can approve a line of credit
// between $10k and $500k in about 1 to 2 days, with no personal guarantee and
// no hard credit pull just to see what you qualify for."
// 12 Nov 2026, ctuprecast.com, Emily Horowitz (HeyLending, 3322650851): "We can
// set you up with a line of credit anywhere from $10k to $500k, with no
// personal guarantee and approval usually back within 1 to 2 days."
// 12 Nov 2026, eseospace.com, Sarah Kaplan (sarah@heylending.com, 9293090872):
// "We give businesses like eSEOspace a line of credit from $10k to $500k that
// you can draw on whenever you need it ... with no personal guarantee and most
// approvals back within a day or two."
// Needs the seller's funding offer AND two sales lines. A lender or broker who
// is really a prospect ("we approve business loans; can you quote our tax
// return?") has the offer but no sales lines and is delivered; a business owner
// asking about their own loan or line of credit makes no offer at all.
const FP_OFFER = [
  /\bwe\s+help\s+(?:[\w-]+\s+){0,6}?(?:businesses|companies|business\s+owners)\b[^.\n]{0,50}\b(?:funding|financing|capital|loans?|lines?\s+of\s+credit)\b/i,
  /\b(?:see|check|find\s+out)\s+(?:what|how\s+much)\s+(?:[\w-]+\s+){0,2}(?:funding|financing|capital)\s+(?:you|your\s+(?:business|company)|they)\s+(?:can\s+get|could\s+get|may\s+qualify|qualify)\b/i,
  /\bwe\s+(?:can|could|will)\s+(?:quickly\s+|easily\s+|typically\s+|usually\s+)?(?:pre-?)?(?:approve|fund|offer|provide|give)\s+(?:you\s+|your\s+(?:business|company)\s+)?(?:for\s+|with\s+)?(?:an?\s+|up\s+to\s+\$?[\d,.]+\s*[km]?\s+(?:in\s+)?)?(?:unsecured\s+|business\s+|revolving\s+|working[\s-]capital\s+)*(?:lines?\s+of\s+credit|credit\s+lines?|loans?|funding|financing|working\s+capital|capital)\b/i,
  /\bwe\s+(?:can|could|will)\s+(?:quickly\s+|easily\s+|typically\s+|usually\s+)?(?:set\s+(?:you|your\s+(?:business|company))\s+up\s+with|hook\s+(?:you|your\s+(?:business|company))\s+up\s+with|get\s+(?:you|your\s+(?:business|company))\s+(?:(?:pre-?)?approved\s+for|set\s+up\s+with|access\s+to)?)\s+(?:an?\s+|up\s+to\s+\$?[\d,.]+\s*[km]?\s+(?:in\s+)?)?(?:unsecured\s+|business\s+|revolving\s+|working[\s-]capital\s+)*(?:lines?\s+of\s+credit|credit\s+lines?|loans?|funding|financing|working\s+capital|capital)\b/i,
  /\bwe\s+(?:offer|provide|fund|approve|lend|issue|extend|give)\b[^.?\n]{0,40}\b(?:lines?\s+of\s+credit|credit\s+lines?|loans?|funding|financing|capital)\s+(?:of\s+|from\s+|between\s+|up\s+to\s+)\$\s?[\d,.]+\s*[km]?\s*(?:and|to|-|–)\s*\$\s?[\d,.]+\s*[km]?\b/i,
  /\bwe\s+(?:give|offer|provide|fund|get|help)\s+(?:small\s+)?(?:businesses|companies|business\s+owners|owners|firms|agencies)\s+like\s+[^.?\n]{1,60}?\b(?:lines?\s+of\s+credit|credit\s+lines?|loans?|funding|financing|working\s+capital|capital)\b/i,
];
const FP_SALES = [
  /\b(?:does(?:n(?:'|’)?t|\s+not)|won(?:'|’)?t|will\s+not|without)\s+(?:\w+\s+){0,2}(?:affect(?:ing)?|impact(?:ing)?|hurt(?:ing)?|touch(?:ing)?)\s+your\s+credit\b|\bno\s+(?:impact|effect)\s+(?:on|to)\s+your\s+credit\b|\bno\s+hard\s+(?:credit\s+)?(?:pull|inquiry|check)\b|\bsoft\s+(?:credit\s+)?(?:pull|inquiry|check)\b/i,
  /\b(?:free|costs?\s+nothing)\s+to\s+(?:check|see|look|apply|find\s+out)\b/i,
  /\bno\s+obligation\b|\bobligation[\s-]free\b/i,
  /\breply\s+["'“]?stop\b|\bwe\s+won(?:'|’)?t\s+(?:reach\s+out|contact\s+you|message\s+you)\s+again\b/i,
  /\b(?:no|without\s+an?)\s+personal\s+guarantee\b/i,
  /\b(?:see|find\s+out|check)\s+(?:what|how\s+much)\s+you\s+(?:may\s+|might\s+|could\s+|would\s+)?qualify\s+for\b/i,
  /\b(?:approv\w*|fund(?:ed|ing)?)\b[^.\n]{0,60}\b(?:in|within)\s+(?:about\s+|as\s+little\s+as\s+|under\s+|just\s+|only\s+)?(?:\d+\s*(?:to|-|–)\s*)?\d+\s*(?:hours?|(?:business\s+)?days?)\b|\b(?:approv\w*|fund(?:ed|ing)?)\b[^.\n]{0,60}\b(?:in|within)\s+(?:about\s+|just\s+|only\s+)?(?:a\s+(?:day|week)\s+or\s+two|a\s+(?:couple|few)\s+(?:of\s+)?(?:hours|(?:business\s+)?days)|(?:one|two|three)\s+(?:business\s+)?days?|(?:one|two|twenty[\s-]four|forty[\s-]eight)\s+hours?)\b|\bsame[\s-]day\s+(?:approval|funding)\b/i,
  /\bdraw\s+(?:on|from|down)\s+(?:it\s+)?(?:whenever|any\s?time|as\s+(?:needed|you\s+need))\b|\bonly\s+pay\s+(?:interest\s+)?(?:on|for)\s+what\s+you\s+(?:use|draw)\b/i,
  /\bright\s+person\b[^.?\n]{0,80}\b(?:handles?|in\s+charge\s+of|oversees?|manages?|responsible\s+for)\s+(?:the\s+|your\s+)?(?:financing|funding|finances|capital)\b/i,
];

function isBusinessFundingPitch(t) {
  const s = stripIdentity(t);
  return FP_OFFER.some((r) => r.test(s)) && FP_SALES.filter((r) => r.test(s)).length >= 2;
}

// --- 26. Hand-typed HTML link -----------------------------------------------
// laurabasscounseling.com, 14 Oct 2026: "SamuelBew", hfqgzdml@blackfirsta.com,
// a Portuguese phone, and a pasted news paragraph with
//
//   <a href=https://www-blsp.at>m blsp at</a>
//
// typed into the message. Link-drop bots write anchor markup into plain text
// fields hoping some inbox or CMS renders it; a person asking for help never
// types HTML. Two shapes, so it fires both on the raw fields and on the
// rendered email without ever matching the template's own links: the ESCAPED
// tag (&lt;a href=, only present when the visitor typed it -- the template
// escapes their input), and a literal tag with an UNQUOTED http(s) URL (every
// template in this estate quotes its href). BBCode [url=http...] is the same bot.
const TYPED_LINK = /&lt;a\s+href\s*=|<a\s+href\s*=\s*https?:\/\/|\[url\s*=\s*https?:\/\//i;

function isTypedHtmlLink(t) {
  return TYPED_LINK.test(t);
}

// --- 28. Russian text + a link to a Russian site -----------------------------
// laurabasscounseling.com, 15 Oct 2026: "Leonalord", bbepnvyo@ishowfirstmail.com,
// a Polish number, and a message that was nothing but a Russian name and a
// link -- "Евгений Тельманович Рябинин — https://nn.dk.ru". Three Cyrillic
// words, under rule 16's five, and "Leon" is not a generator base (adding it
// would flag Leonard). Two signals: Cyrillic words in the message AND a typed
// URL whose host is a .ru / .su / .рф domain. A Russian-speaking client may
// write in Russian, or paste a link; to a US practice they never send both.
// An email address on mail.ru is not a link (no scheme or www), so it never
// counts here.
const RU_SITE_LINK =
  /(?:https?:\/\/|\bwww\.)(?:[a-z0-9-]+\.)*(?:[a-z0-9-]+\.(?:ru|su|xn--p1ai)|[\u0400-\u04FF0-9-]+\.\u0440\u0444)(?![a-z0-9-])/i;
const RU_WORDS = /[\u0400-\u04FF]{2,}[\s,.!?;:()\u00AB\u00BB"'\u2014\u2013-]+[\u0400-\u04FF]{2,}/;

function isRussianSiteLink(t) {
  return RU_SITE_LINK.test(t) && RU_WORDS.test(t);
}

// --- 49. A link typed into the NAME field ------------------------------------
// laurabasscounseling.com, 9 Nov 2026: the name field read "Here's where you
// can find me - https://ugy2mr2.gentlecouple.org/dkf8d6u?m=1" (a dating lure);
// every other field was ordinary, so no rule fired. Nobody's name contains a
// web address. Only the value of a NAME row ("Name:", "Full name:", "First
// name:", "Last name:", or a "Name" label line followed by its value) is read,
// so a "Company name:", "Practice name:" or "Website:" row with a URL, or a
// link anywhere in the message, never trips this.
const NAME_FIELD_LINK = /https?:\/\/|\bwww\.[a-z0-9-]+\.[a-z]{2,}|\b[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.[a-z]{2,}\/[^\s]*[a-z0-9]/i;

function isNameFieldLink(t) {
  const plain = String(t).replace(/<[^>]+>/g, '\n').replace(/&nbsp;/gi, ' ');
  const lines = plain.split('\n').map((l) => l.trim()).filter(Boolean);
  const LABEL = /^(?:full\s*|first\s*|last\s*|your\s*)?name\s*:?$/i;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || '';
    const row = line.match(/^(?:full\s*|first\s*|last\s*|your\s*)?name\s*:\s*(.+)$/i);
    if (row && NAME_FIELD_LINK.test(row[1] || '')) return true;
    if (LABEL.test(line) && i + 1 < lines.length && NAME_FIELD_LINK.test(lines[i + 1] || '')) return true;
  }
  return false;
}

// --- 50. Online casino / slot promotion -------------------------------------
// laurabasscounseling.com, 10 Nov 2026, both delivered to Laura:
//   "Ralphhoife": a Greek casino ad -- "Γνωρίστε το Trueluck — ένα online
//     καζίνο με φρουτάκια ... 175 δωρεάν περιστροφές ... πρώτες τρεις
//     καταθέσεις ... 21+. Παίξτε υπεύθυνα" + https://gamevisor.org/...
//   "Salem19": "No luck? No problem. Reel Cash Vault pays everyone. Try now and
//     see! Play Now Here => psee.io/8rffsg"
// Therapy, addiction and family sites get REAL inquiries about gambling ("my
// husband can't stop playing slots", "he keeps chasing casino bonuses"), so a
// gambling word alone never blocks. Needed: a link, a casino word, and at
// least two promotion signals, one of which is a call to play (or three
// promotion signals). A worried spouse does not write "Play now" + a link.
const CASINO_WORD = /\b(?:online\s+)?casinos?\b|\bslot\s+machines?\b|\bslots?\b(?=[^.\n]{0,40}\b(?:bonus|spins?|jackpot|play|win)\b)|\bjackpots?\b|\bpokies\b|\broulette\b|\bblackjack\b|\breel\s+cash\b|\breels?\b(?=[^.\n]{0,30}\b(?:spin|jackpot|bonus|win)\b)|καζίνο|καζινο|φρουτάκια|ρουλέτα|μπλάκτζακ|казино|слоты|игровые\s+автоматы|\bkasyno\b|\bcassino\b|\bspielautomaten\b|\btragamonedas\b|\bcasinò\b/i;
const CASINO_CTA = /\b(?:play|spin|bet|claim|join)\s+now\b|\btry\s+(?:it\s+)?now\b|\bplay\s+responsibly\b|\bgamble\s+responsibly\b|παίξτε\s+υπεύθυνα|играйте\s+ответственно|(?:^|[\s(])(?:18|21)\+(?=[\s.).,]|$)/i;
const CASINO_PROMO = [
  /\bfree\s+spins?\b|δωρεάν\s+περιστροφ|фриспин|бесплатн\w*\s+вращени|\bfreispiele\b|\bgiros\s+gratis\b|\brodadas\s+gr[aá]tis\b|\btours\s+gratuits\b|\bgiri\s+gratis\b|\bdarmowe\s+spiny\b/i,
  /\b(?:welcome|sign[-\s]?up|deposit|no[-\s]deposit|match|reload)\s+(?:bonus|package|offer)\b|πακέτο\s+καλωσορίσματος|μπόνους|\bбонус|\bwillkommensbonus\b|\bbono\s+de\s+bienvenida\b/i,
  /\b(?:first|second|third|1st|2nd|3rd)\s+deposits?\b|\bminimum\s+deposit\b|καταθέσ|κατάθεσ|депозит/i,
  /\bwager(?:ing)?\s+requirements?\b|\bwagering\b|στοιχηματισμ|\bвейджер/i,
  /\bpays\s+everyone\b|\bcash\s+vault\b|\bwin\s+(?:real\s+)?(?:money|cash)\b|\bcashback\b|\bvip\s+(?:program|club)\b|πρόγραμμα\s+vip/i,
  CASINO_CTA,
];
const CASINO_LINK = /https?:\/\/|\bwww\.[a-z0-9-]+\.[a-z]{2,}|\b[a-z0-9][a-z0-9-]*\.[a-z]{2,}\/[^\s]*[a-z0-9]/i;

function isCasinoPromo(t) {
  const s = stripIdentity(t);
  if (!CASINO_LINK.test(s) || !CASINO_WORD.test(s)) return false;
  const n = CASINO_PROMO.filter((r) => r.test(s)).length;
  return n >= 3 || (n >= 2 && CASINO_CTA.test(s));
}
// --- 51. Dot-padded Gmail + nonsense name or message ------------------------
// cisorconsulting.com /contact-dental-consultants/, 11 Nov 2026, delivered to
// the client:
//   Name: Puehqna Mznfbfv     Email: vu.hitu.nat.ip.i56@gmail.com
//   Phone: 2748144528         Message: 8509106472  (1 second on the site)
// Same bot family as blueriverrealtyllc ("Ogaxlkz Wdtxx",
// i.l.aki.vo.j.ar.a.85.2@gmail.com) and mckeecompany ("Ldzra Eprade",
// ey.if.u.k.a.h.uve3.5@gmail.com). Gmail ignores dots, so one mailbox mints
// endless addresses. Nothing in the text is a pitch, so no other rule sees it.
//
// Two signals, never one. A Gmail address with 3+ dots before the @ is rare
// for a person but proves nothing alone. It blocks only next to:
//  - a NAME with a word of 5+ letters that is not a name: no vowel (y counts),
//    a run of 6+ consonants, or 3+ lower-to-upper case flips. Schmidt,
//    Lindstrom, Nguyen, McDonald, DeLaCruz and an all-caps credential (PMHNP)
//    all pass; or
//  - a one-line MESSAGE row that is only a number (5+ digits, no letters) or
//    one garbled word. If the next line is more prose, it is a real message
//    that starts with a phone number, and it is delivered.
// Known miss: "Ldzra Eprade" with no message (McKee) has no nonsense word.
const DOTTED_GMAIL = /[A-Za-z0-9][A-Za-z0-9._%+-]*@(?:gmail|googlemail)\.com(?![A-Za-z0-9-])/gi;
const R51_NAME_ROW = /^(?:full\s*|first\s*|last\s*|your\s*|contact\s*)?name\s*:\s*(.+)$/i;
const R51_NAME_LABEL = /^(?:full\s*|first\s*|last\s*|your\s*|contact\s*)?name\s*:?$/i;
const R51_MSG_ROW = /^(?:message|comments?|notes?|details|questions?|how\s+can\s+we\s+help(?:\s+you)?\??)\s*:\s*(.+)$/i;
const R51_LABEL_ROW = /^[A-Za-z][A-Za-z0-9 ?/&'()-]{0,30}:\s*\S/;

function hasDottedGmail(t) {
  const found = String(t).match(DOTTED_GMAIL);
  if (!found) return false;
  return found.some((a) => ((a.split('@')[0] || '').split('+')[0] || '').split('.').length >= 4);
}

function isGarbledWord(w) {
  if (w.length < 5 || !/^[A-Za-z]+$/.test(w) || !/[a-z]/.test(w)) return false;
  if (!/[aeiouy]/i.test(w)) return true;
  if (/[bcdfghjklmnpqrstvwxz]{6}/i.test(w)) return true;
  return (w.match(/[a-z](?=[A-Z])/g) || []).length >= 3;
}

function isNonsenseName(v) {
  const words = String(v || '').trim().split(/[\s\-'’.,]+/).filter(Boolean);
  if (!words.length || words.length > 4) return false;
  return words.some(isGarbledWord);
}

function isNonsenseMessage(v) {
  const s = String(v || '').trim();
  if (!s) return false;
  if (!/[A-Za-z]/.test(s)) return (s.match(/\d/g) || []).length >= 5;
  return !/\s/.test(s) && isGarbledWord(s);
}

function isDottedGmailNonsense(t) {
  if (!hasDottedGmail(t)) return false;
  const plain = String(t).replace(/<[^>]+>/g, '\n').replace(/&nbsp;/gi, ' ');
  const raw = plain.split('\n').map((l) => l.trim());
  const lines = raw.filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || '';
    const row = line.match(R51_NAME_ROW);
    if (row && isNonsenseName(row[1])) return true;
    if (R51_NAME_LABEL.test(line) && i + 1 < lines.length && isNonsenseName(lines[i + 1])) return true;
  }
  for (let i = 0; i < raw.length; i++) {
    const row = (raw[i] || '').match(R51_MSG_ROW);
    if (!row || !isNonsenseMessage(row[1])) continue;
    const next = raw[i + 1] || '';
    if (!next || R51_LABEL_ROW.test(next)) return true;
  }
  const subj = plain.match(/(?:inquiry|enquiry|lead|request|message|submission|contact)\b[^\n]{0,20}?(?:—|–|-|:|from)\s*([^\n(]{1,60}?)\s*(?:\(|—|–|$)/im);
  return !!(subj && isNonsenseName(subj[1]));
}
// --- 52. "Similar placements on relevant sites" mention-selling pitch --------
// mymontanalawyer.com /contact/, 12 Nov 2026, from camila@guestpostwolf.com:
//
//   "While browsing, I found this article that references mymontanalawyer.com:
//    https://www.adorethemparenting.com/... Are you open to getting similar
//    placements on relevant sites? Our work is helping brands land contextual
//    mentions on niche-specific websites. I can share a handful of good-fit
//    options, along with pricing, for you to review."
//
// Rule 2's paid-link trade, written so it never says "guest post", "backlink"
// or "link": the goods are "placements" and "contextual mentions". Two ways in:
//   - the sender's own address is at a link-selling domain ("@guestpostwolf.com",
//     "@backlinkhub.io"), which is near-certain on its own; or
//   - an offer of placements/mentions ON OTHER SITES, plus a separate sales
//     signal: the "article that references <your domain>" hook, "are you open
//     to getting ...", "I can share a handful of options", "along with pricing",
//     "helping brands land ...", "good-fit options".
// A client who asks for something ("can you share pricing?", "we need more job
// placements on relevant sites") never has the seller's half, so is delivered.
// The wording half sits behind the sellsSearch gate: eSEOspace's own prospects
// ask for "contextual mentions on niche sites" in exactly these words.
const LINK_SELLER_DOMAIN =
  /@[a-z0-9.-]*(?:guest-?posts?|back-?links?|link-?build(?:ing|ers?)?|link-?insert(?:ion)?s?|niche-?edits?|blogger-?outreach)[a-z0-9-]*\.[a-z0-9.-]*[a-z]{2,}\b/i;
const MENTION_OFFER =
  /\b(?:similar|more|additional|further|other)\s+(?:placements?|mentions?|features?|citations?)\s+(?:on|in|across|from)\s+(?:[\w-]+\s+){0,3}(?:sites|websites|blogs|publications|outlets|domains)\b|\b(?:contextual|editorial|in[-\s]?content|niche(?:[-\s](?:specific|relevant))?)\s+(?:brand\s+)?(?:mentions?|placements?|citations?)\s+(?:on|in|across|from)\s+(?:[\w-]+\s+){0,3}(?:sites|websites|blogs|publications|outlets|domains)\b|\bplacements?\s+(?:on|in|across)\s+(?:[\w-]+\s+){0,2}(?:relevant|related|niche|niche[-\s](?:specific|relevant)|authority|high[-\s]?authority|quality|trusted|industry|similar)\s+(?:[\w-]+\s+)?(?:sites|websites|blogs|publications|outlets|domains)\b/i;
const MENTION_SALE =
  /\b(?:article|post|blog(?:\s+post)?|page|guide|piece|listicle|roundup)\s+(?:that|which)\s+(?:references|mentions|links\s+(?:back\s+)?to|cites|features|includes|lists)\s+(?:your\s+(?:site|website|firm|business|company|brand|practice|page)|[a-z0-9][a-z0-9-]*\.(?:com|net|org|co|us|io|law|biz|info)\b)|\b(?:are\s+you|would\s+you\s+be)\s+open\s+to\s+(?:getting|landing|securing|earning|more|similar|additional)\b|\b(?:i|we)(?:\s+(?:can|could|will|would)|'d|’d|'ll|’ll)?(?:\s+be\s+happy\s+to|\s+love\s+to)?\s+(?:share|send|provide|put\s+together|pull\s+together|compile)\s+(?:you\s+|over\s+)?(?:a\s+)?(?:handful|few|couple|list|shortlist|short\s+list|selection|range)\b|\b(?:along\s+with|together\s+with|plus|including)\s+(?:the\s+|our\s+)?(?:pricing|prices|rates)\b|\bhelping\s+(?:brands|businesses|companies|websites|sites)\s+(?:land|get|secure|earn|gain|build)\b|\bgood[-\s]?fit\s+(?:options|sites|websites|publications|blogs)\b/i;

function isMentionPlacementPitch(t, sellsSearch) {
  if (LINK_SELLER_DOMAIN.test(t)) return true;
  if (sellsSearch) return false;
  return MENTION_OFFER.test(t) && MENTION_SALE.test(t);
}

// --- 53. "I built a website for your business" tease ------------------------
// 14 Nov 2026, ctuprecast.com quote form: "Dylan Sandoval", company "Inquiry",
// dylan@tokenbanditstudio.com, (305) 720-7894, project type "Not sure yet":
// "not sure who reads these, but you have great reviews on google, so I built a
// website for your business. Is it worth a few minutes of your time to go over
// it, or not really?" No price (rule 10), no "your website" (rule 34) and no
// offer to show a demo (rule 42), so it reached the client.
// Blocked when the sender says they ALREADY built/made/designed a website FOR
// the business ("for your business", "built you a website") AND either closes
// like a pitch (worth a few minutes, go over it, want to see it, or not?) or
// opens with a reviews hook. A website built for a named business ("for CTU
// Precast") needs the hook AND the close. The sender's domain blocks alone. A
// customer describes their own site ("I built a website for my business") and
// is delivered; so is "I made a payment through your website", because only an
// article and adjectives may sit between the verb and "website".
const BS_CLAIM = /\b(?:i|we)(?:'ve|’ve|\s+have)?\s+(?:(?:went|gone)\s+ahead\s+and\s+|already\s+|just\s+|actually\s+|quickly\s+|recently\s+|took\s+the\s+liberty\s+(?:of|and|to)\s+|spent\s+[^.\n]{0,30}?\s+)*(?:built|made|designed|created|put\s+together|mocked\s+up|whipped\s+up|spun\s+up|coded|threw\s+together)\b([^.\n]{0,60}?)\b(?:web\s*site|website|landing\s+page|home\s*page|web\s+page)\b([^.\n?!]{0,40})/gi;
const BS_ADJ = String.raw`(?:(?:new|brand[\s-]new|free|quick|simple|modern|fresh|custom|better|sample|demo|mock|working|live|full|whole|complete|clean|professional|little|small|basic|draft|test|real|actual|nice|proper|beautiful|mobile[\s-]friendly|\d+[\s-]page|one[\s-]page|single[\s-]page)[\s-]+){0,4}`;
const BS_MID_PLAIN = new RegExp(String.raw`^\s*(?:(?:a|an|one)\s+)?${BS_ADJ}$`, 'i');
const BS_MID_YOU = new RegExp(String.raw`^\s*(?:you|y'all|your\s+(?:business|company|firm|team|shop|practice|brand|clinic|office|store|crew))\s+(?:a|an|one)\s+${BS_ADJ}$`, 'i');
const BS_MID_NAMED = new RegExp(String.raw`^\s*(?:[A-Z][\w&'’.-]*\s+){1,5}(?:a|an|one)\s+${BS_ADJ}$`);
const BS_FOR_YOU = /^\s*(?:for|of)\s+(?:you\b|y'all\b|your\s+(?:(?:\w+\s+)?business|company|firm|team|shop|practice|brand|clinic|office|store|crew|restaurant|agency|organi[sz]ation)\b)/i;
const BS_FOR_OTHER = /^\s*for\s+(?!(?:my|our|me|us|myself|ourselves|a|an|the|this|that|his|her|their|free|fun|school|class|work|practice)\b)\S/i;
const BS_HOOK = /\b(?:great|good|amazing|excellent|solid|strong|awesome|glowing|stellar|impressive|nice|fantastic|lots\s+of|so\s+many|tons\s+of|\d+|5[\s-]star|five[\s-]star)\s+(?:google\s+|yelp\s+|online\s+)?reviews?\b|\byour\s+(?:google\s+|yelp\s+|online\s+)?reviews\b|\breviews\s+on\s+(?:google|yelp)\b|\bnot\s+sure\s+who\s+(?:reads|checks|sees)\s+(?:these|this)\b|\b(?:found|saw|came\s+across)\s+(?:you|your\s+(?:business|company|listing|profile))\s+on\s+(?:google|google\s+maps|maps|yelp)\b|\b(?:don'?t|do\s+not|didn'?t)\s+(?:seem\s+to\s+)?have\s+a\s+(?:web\s*site|website)\b/i;
const BS_CLOSE = /\bworth\s+(?:a\s+(?:few|couple)\s+(?:of\s+)?minutes|(?:a\s+)?(?:few\s+)?minutes|your\s+time|a\s+(?:quick\s+)?(?:look|chat|call|peek)|(?:\d+|five|ten|fifteen)[\s-]min(?:ute)?s?)\b|\b(?:a\s+)?(?:few|couple)\s+(?:of\s+)?minutes\s+(?:of\s+)?your\s+time\b|\bgo\s+(?:over|through)\s+it\b|\bwalk\s+you\s+through\s+it\b|\btake\s+a\s+(?:quick\s+)?(?:look|peek)\b|\b(?:want|like|care|love)\s+to\s+(?:see|view|check\s+out|look\s+at)\s+(?:it|this|that)\b|\binterested\s+in\s+(?:seeing|checking|taking|having)\b|\bopen\s+to\s+(?:seeing|checking|taking|having)\b|\bor\s+not(?:\s+really)?\s*\?|\b(?:can|shall|should|may|could)\s+i\s+(?:send|share|show)\b|\b(?:send|share|show)\s+(?:you\s+)?(?:it|the\s+link|a\s+link|it\s+over)\b|\bcheck\s+it\s+out\b|\bfor\s+free\b|\bfree\s+of\s+charge\b|\bno\s+(?:cost|charge|strings|obligation)\b/i;
const BS_SENDERS = /@tokenbanditstudio\.com\b/i;

function isBuiltSiteTease(t) {
  if (BS_SENDERS.test(t)) return true;
  const s = stripIdentity(t);
  const close = BS_CLOSE.test(s);
  const hook = BS_HOOK.test(s);
  if (!close && !hook) return false;
  const re = new RegExp(BS_CLAIM.source, 'gi');
  let m = re.exec(s);
  while (m) {
    const mid = m[1] ?? '';
    const after = m[2] ?? '';
    const forYou = BS_MID_YOU.test(mid) || (BS_MID_PLAIN.test(mid) && BS_FOR_YOU.test(after));
    if (forYou) return true;
    const named = BS_MID_NAMED.test(mid) || (BS_MID_PLAIN.test(mid) && BS_FOR_OTHER.test(after));
    if (close && hook && named) return true;
    m = re.exec(s);
  }
  return false;
}

// --- 54. Generated CamelCase name + Russian email AND Russian phone ---------
// 15 Nov 2026, icounseling.net, two leads two hours apart that reached the
// practice (and "BrianVow" on 10 Nov):
//   "AaronWrics"  kokoreva.veronika.1988.30.8@bk.ru  82165799816
//   "MarcusNub"   zuyev-vadik@bk.ru                  86325181634
// The same bot as rule 16, but the junk after the common first name is
// Capitalised, and rule 16 lets every capitalised tail through on purpose
// ("JohnMark"). So this variant needs MORE evidence than rule 16: a Russian
// address AND an 11-digit Russian number (rule 16 takes either one). The tail
// must be 3-5 letters and not a name or name part itself (JohnMark, SarahLee,
// AnnaMae, MarkSon); "Marcus Nub" with a space is a two-word name and
// delivers. A Russian-speaking client with a real name always delivers.
const CAMEL_TAIL_REAL = new Set([
  'ann', 'anne', 'anna', 'ana', 'lee', 'leigh', 'lynn', 'lyn', 'joe', 'jay',
  'ray', 'rae', 'mae', 'may', 'sue', 'kay', 'kaye', 'kim', 'beth', 'rose',
  'marie', 'jean', 'luc', 'luis', 'louis', 'lou', 'dee', 'ellen', 'grace',
  'jane', 'june', 'eve', 'amy', 'max', 'sam', 'ben', 'tom', 'tim', 'jim',
  'bob', 'rob', 'jon', 'dan', 'abe', 'ian', 'ivan', 'igor', 'oleg', 'olga',
  'anya', 'dima', 'sasha', 'misha', 'yuri', 'ilya', 'vera', 'nina', 'lena',
  'esq', 'jose', 'juan', 'maria', 'luz', 'cruz', 'diaz', 'ruiz', 'perez',
]);

function isCamelTailNameToken(raw) {
  const t = String(raw || '').trim();
  if (!t || /\s/.test(t)) return false;
  const lower = t.toLowerCase();
  return GEN_NAME_BASES.some((base) => {
    if (!lower.startsWith(base)) return false;
    // Typed as a name: "MarcusNub", not "MARCUSNUB" or "marcusNub".
    const head = t.slice(0, base.length);
    if (head !== head.charAt(0).toUpperCase() + head.slice(1).toLowerCase()) return false;
    const m = t.slice(base.length).match(/^([A-Z][a-z]{2,4})$/);
    if (!m) return false;
    const tail = (m[1] || '').toLowerCase();
    return !CAMEL_TAIL_REAL.has(tail) && !GEN_NAME_BASES.includes(tail) && !GEN_NAME_REAL_ENDINGS.has(tail);
  });
}

// One token, or the same token in both halves of a first/last-name form.
function hasCamelTailNameValue(v) {
  const tokens = String(v || '').trim().split(/\s+/).filter(Boolean);
  const [first, second] = tokens;
  if (!first || tokens.length > 2) return false;
  if (second && second !== first) return false;
  return isCamelTailNameToken(first);
}

// Name values from a "Name: X" row, a Name label cell followed by its value
// cell (HTML emails), and the subject ("New website inquiry — MarcusNub").
function camelNameValues(t) {
  const plain = String(t).replace(/<[^>]+>/g, '\n').replace(/&nbsp;/gi, ' ');
  const lines = plain.split('\n').map((l) => l.trim()).filter(Boolean);
  const out = [];
  let afterLabel = false;
  for (const line of lines) {
    const row = line.match(/^(?:full\s*|first\s*|last\s*|your\s*|contact\s*)?name\s*:\s*(.+)$/i);
    if (row && row[1]) out.push(row[1]);
    if (afterLabel) out.push(line);
    afterLabel = /^(?:full\s*|first\s*|last\s*|your\s*|contact\s*)?name\s*[:\-]?$/i.test(line);
  }
  const subj = plain.match(/(?:inquiry|enquiry|lead|request|message|submission|contact)\b[^\n]{0,20}?(?:—|–|-|:|from)\s*([^\n(]{1,60}?)\s*(?:\(|—|–|$)/im);
  if (subj && subj[1]) out.push(subj[1]);
  return out;
}

function isCamelNameRussianContact(t) {
  if (!RU_EMAIL.test(t)) return false;
  if (!RU_PHONE.test(t) && !RU_PHONE_DOMESTIC.test(t)) return false;
  return camelNameValues(t).some(hasCamelTailNameValue);
}

// --- 55. Booked-jobs / 24-7 receptionist pitch and its follow-ups -------------
// colacityroofing.com /contact-us/, 12, 13 and 15 Nov 2026, "Brent Fowler",
// brent@automaxrevenue.com, 4786062782. Three messages, all delivered:
// 1) "My team and I help a handful of roofing companies ... bring in qualified
//    homeowners ... We also set up a 24/7 receptionist ... You only pay when we
//    actually get someone booked onto your calendar ... no results, no charge
//    ... this isn't some mass-blasted message. I recorded a quick 3-minute video
//    for you to introduce myself ... some pulling in $20k-50k+ extra per month
//    from the appointments we set ... a contact form isn't the best channel".
// 2) "it's Brent again. I sent a note through your website the other day about
//    getting you new jobs and a 24/7 receptionist. Did you see it?"
// 3) "just checking in one more time to see if you're interested in the offer.
//    I could set it up for free, then you can test it out, close a few jobs and
//    decide if you want to keep it or not. Can I send a quick 5-minute video
//    explaining how we can do it for you?"
// Signals come in two kinds. SELLER-ONLY wording a customer does not write:
// pay-when-we-book terms, "we also set up a 24/7 receptionist", a free set-up to
// "keep it or not", "mass-blasted" / "contact form isn't the best channel", and
// "$20k-50k extra per month" / "appointments we set". SHARED wording a customer
// can also write: a follow-up ("it's Mary again, I sent a note through your
// website") and a video ("a video showing how we found the leak"). Blocked on
// two signals with at least one SELLER-ONLY, so a customer's follow-up with a
// video of the damage is still delivered.
const BJ_PAY = /\byou\s+only\s+pay\s+(?:when|if|once|after)\s+(?:we|I)\s+(?:actually\s+|really\s+|successfully\s+)?(?:get|book|land|bring|deliver|send|set)\b[^.?!\n]{0,80}?\b(?:booked|calendar|show(?:s|ed)?\s+up|qualified|leads?|homeowners?|jobs?|results?|customers?)\b|\bno\s+results?\s*[,.;:–—-]?\s*no\s+(?:charge|pay(?:ment)?|fees?|cost)\b|\b(?:we|I)\s+(?:don['’]?t|do\s+not|never)\s+charge\s+(?:any\s+)?retainers?\b/i;
const BJ_RECEPT = /\b(?:we|I)(?:['’]ll|\s+will|\s+can|\s+could|\s+would|\s+also)\s+(?:also\s+)?(?:set\s+up|provide|offer|add|include|install|give\s+you)\s+(?:you\s+)?(?:with\s+)?(?:a|an|our)\s+(?:24\s*\/\s*7|24-7|24[\s-]hour|around[\s-]the[\s-]clock|ai|a\.i\.|virtual)\s+(?:receptionist|answering)|\bget(?:ting)?\s+you\s+(?:new|more|booked|qualified|extra)\s+(?:jobs|leads|customers|clients|appointments)\s+and\s+(?:a|an)\s+(?:24\s*\/\s*7|24-7|24[\s-]hour|ai|a\.i\.|virtual)\s+(?:receptionist|answering)/i;
const BJ_TRIAL = /\b(?:I|we)(?:['’]d|\s+would|\s+could|\s+can|['’]ll|\s+will)?\s+(?:happily\s+|gladly\s+|even\s+)?set\s+(?:it|this|everything|the\s+whole\s+thing|you)\s+up\s+(?:for\s+you\s+)?(?:for\s+free|free\s+of\s+charge|at\s+no\s+(?:cost|charge))\b|\byou\s+(?:can|could|get\s+to)\s+(?:test|try)\s+it\s+(?:out\s+)?[^.?!\n]{0,80}?\b(?:keep\s+it\s+or\s+not|decide\s+(?:if|whether)\s+you\s+(?:want\s+to\s+)?keep\s+it)\b|\bclose\s+a\s+(?:few|couple(?:\s+of)?)\s+(?:jobs|deals|sales)\b[^.?!\n]{0,60}?\bkeep\s+it\b/i;
const BJ_APOLOGY = /\b(?:contact|web(?:site)?)\s+form\s+(?:probably\s+)?(?:isn['’]?t|is\s+not|might\s+not\s+be|may\s+not\s+be)\s+the\s+(?:best|ideal|right|usual)\s+channel\s+for\s+(?:this|that|a\s+pitch|an\s+offer)\b|\b(?:isn['’]?t|is\s+not|not)\s+(?:just\s+)?(?:some|a|another)\s+mass[\s-]*(?:blasted|blast|sent|produced|mailed)\b/i;
const BJ_EARN = /\$\s?\d{1,3}(?:,\d{3})?\s?k?\s*(?:[–—-]|to)\s*\$?\s?\d{1,3}(?:,\d{3})?\s?k\+?\s+(?:extra\s+|more\s+|additional\s+)?(?:per|a|\/|each|every)\s*month\b|\b(?:per|a)\s+month\s+from\s+the\s+(?:appointments|jobs|leads|estimates)\s+we\b|\bfill\s+their\s+(?:schedules?|calendars?|pipelines?)\b/i;
const BJ_FOLLOWUP = /\bchecking\s+in\s+(?:one\s+(?:more|last)\s+time|again)\b|\b(?:see|know)\s+if\s+you(?:['’]re|\s+are|\s+were|\s+(?:might|would)\s+be)\s+(?:still\s+)?interested\s+in\s+(?:the|my|our|this)\s+offer\b|\bit['’]?s\s+[A-Z][a-z]+\s+again\b|\b(?:I|we)\s+sent\s+(?:you\s+)?(?:a\s+)?(?:note|message|email|msg)\s+(?:through|via|on)\s+your\s+(?:web\s?site|site|contact\s+form|form)\b/;
const BJ_VIDEO = /\b(?:video|loom)\b[^.?!\n]{0,50}?\b(?:to\s+introduce\s+(?:myself|ourselves|us)|introducing\s+(?:myself|us)|in\s+plain\s+english|(?:explain(?:s|ing)?|show(?:s|ing)?(?:\s+you)?|walk(?:s|ing)?\s+you\s+through)\s+how\s+(?:we\b|our\b|I\s+(?:can|could|would|will)\b|this\s+(?:works|would|could|can|will)\b|it\s+(?:all\s+)?works\b|it\s+would\s+work\b))/i;

function isBookedJobsPitch(t) {
  const s = stripIdentity(t);
  const seller = [BJ_PAY, BJ_RECEPT, BJ_TRIAL, BJ_APOLOGY, BJ_EARN].filter((r) => r.test(s)).length;
  if (!seller) return false;
  const shared = (BJ_FOLLOWUP.test(s) ? 1 : 0) + (BJ_VIDEO.test(s) ? 1 : 0);
  return seller + shared >= 2;
}

// --- 56-60. Laura Bass leaks, 15-16 Nov 2026 --------------------------------
// Five pitches reached laurabasscounseling.com's inbox in two days; no rule 1-55
// caught any of them. One function per pattern, each needing wording a client
// writing TO the practice does not use.
const R56_LINK = /https?:\/\/|\bwww\.[a-z0-9-]+\.[a-z]{2,}|\b[a-z0-9][a-z0-9-]*\.[a-z]{2,}\/[^\s]*[a-z0-9]/i;

// --- 56. Opt-out footer in a pasted mass message -----------------------------
// "Jennifer Newman" / Bright Sphere Janitorial (16 Nov): "... free estimate.
// Respond with stop to optout". "Nell Chavers" / Ad Grants Lab (15 Nov): "If you
// would like to opt-out of communication with us, visit: https://bit.ly/...".
// Rule 30 only knows "reply STOP to opt out". Someone writing to a business
// never offers that business a way to stop hearing from them, so either wording
// blocks alone. "Please stop texting me", "how do I opt out of your newsletter"
// and "unsubscribe me from your emails" still deliver: the patterns need the
// sender to be the one offering the opt-out.
const OPTOUT56_STOP =
  /\b(?:reply|respond|text|write\s+back)\s+(?:back\s+)?(?:with\s+)?(?:the\s+word\s+)?["'“]?stop["'”]?\s+(?:to\s+|and\s+(?:we|i)(?:\s+will|\s*['’]ll)\s+)?(?:opt[\s-]?out|unsubscribe|be\s+removed|remove\s+you)\b/i;
const OPTOUT56_OFFER =
  /\bif\s+you(?:\s*['’]d|\s+would|\s+wish|\s+want)?\s+(?:like\s+|prefer\s+)?(?:to\s+)?(?:opt[\s-]?out|unsubscribe)\s+(?:of|from)\s+(?:(?:any\s+)?(?:further|future)\s+)?(?:communications?|messages|emails|outreach)\b|\bto\s+(?:opt[\s-]?out|unsubscribe)\s+(?:of|from)\s+(?:(?:any\s+)?(?:further|future)\s+)?(?:communications?|messages|emails|outreach)\s+(?:with|from)\s+us\b/i;

function isOptOutFooterPitch(t) {
  const s = stripIdentity(t);
  return OPTOUT56_STOP.test(s) || OPTOUT56_OFFER.test(s);
}

// --- 57. Google Ad Grants / Google Ads management pitch ----------------------
// "Nell Chavers" (15 Nov, signed Ivan Ramirez, ivan@AdGrantsLab.com,
// +1 347-292-7825): "Not sure who on your team handles Google Ads ... I
// specialize in Google Ads and Google Ad Grants ... we are seeing that you guys
// are currently running Google Ads or have tried in the past ... the Google Ad
// Grants account that has a $10K/month free ad spend credit ... we can also help
// you set up successful ad campaigns".
// An agency site (eseospace) gets REAL nonprofit leads: "we have a Google Ad
// Grant, $10k/month free ad spend, who on your team handles Google Ads?". So the
// grant, "free ad spend" and "who handles Google Ads" are shared signals; a block
// needs one SELLER-only signal (the sender offering to run or save on the
// recipient's ads, or claiming to have seen the recipient's ads) plus one more.
const ADG57_SHARED = [
  /\b(?:google\s+)?ad\s+grants?\b/i,
  /\$\s?10\s?k\s*(?:\/\s*|\s+(?:a|per|each|every)\s+)mo(?:nth)?\b|\bfree\s+ad\s+spend\b|\bad\s+spend\s+credit\b/i,
  /\bwho\s+(?:on\s+your\s+team\s+|at\s+your\s+(?:office|practice|company|firm)\s+)?(?:handles|manages|runs|is\s+in\s+charge\s+of|oversees)\s+(?:your\s+)?(?:google\s+ads|ppc|paid\s+(?:ads|search|advertising))\b/i,
  /\bif\s+you(?:\s*['’]re|\s+are)\s+not\s+the\s+right\s+(?:contact|person)\b/i,
];
const ADG57_SELLER = [
  /\bi\s+(?:specialize|specialise)\s+in\s+google\s+ads\b/i,
  /\b(?:we\s+are|we\s*['’]re|i\s+am|i\s*['’]m)\s+seeing\s+that\s+you(?:\s+guys)?\s+(?:are\s+)?(?:currently\s+)?running\s+(?:google\s+)?ads\b|\b(?:currently\s+)?running\s+google\s+ads\s+or\s+have\s+tried\b/i,
  /\bwe\s+(?:could|can|will)\s+(?:also\s+)?help\s+you\s+(?:save|set\s+up|get|run|manage)\b[^.\n]{0,90}\b(?:ad\s+grants?|ad\s+campaigns?|ad\s+spend|google\s+ads)\b/i,
  /\bdon\s*['’]?t\s+have\s+to\s+spend\s+a\s+dime\b|\bsocial\s+proof\s+videos?\b/i,
];

function isAdGrantsPitch(t) {
  const s = stripIdentity(t);
  const seller = ADG57_SELLER.filter((r) => r.test(s)).length;
  if (!seller) return false;
  return seller + ADG57_SHARED.filter((r) => r.test(s)).length >= 2;
}

// --- 58. Sportsbook / betting promo ------------------------------------------
// "RamonaWak" (16 Nov): "How do smart bettors maximize value right from day
// one? They deposit at 1Win AND use promo code 5000 to guarantee themselves a
// welcome free bet or free spin! https://lkqv.cc/d845a8". Rule 50's casino words
// do not include bookmakers. A therapy client may write "my husband lost $20k on
// 1xBet chasing free bets and deposit bonuses" and even paste a link, so a
// bookmaker, a link and promo terms are not enough: it also needs the ad's own
// voice (a promo code with its value, "guarantee yourself a", "smart bettors",
// "claim your free bet").
const BET58_BRAND =
  /\b1\s?win\b|\b1xbet\b|\bmostbet\b|\bmelbet\b|\bbetwinner\b|\b22bet\b|\bparimatch\b|\bpin[-\s]?up\s+(?:casino|bet)\b|\bvavada\b|\bbettors?\b|\bsportsbooks?\b|\bbookmakers?\b|\bbetting\s+(?:site|app|platform)\b/i;
const BET58_PROMO = [
  /\bpromo\s*code\b|\bbonus\s+code\b|\bcoupon\s+code\b/i,
  /\bfree\s+bets?\b/i,
  /\bfree\s+spins?\b/i,
  /\bwelcome\s+(?:free\s+bet|bonus|offer|package)\b/i,
  /\bdeposit\s+(?:at|on|with|into)\b|\bfirst\s+deposit\b|\bdeposit\s+bonus\b/i,
];
const BET58_VOICE = [
  /\b[Uu]se\s+(?:the\s+|my\s+|our\s+)?(?:[Pp]romo|[Bb]onus|[Cc]oupon)\s*[Cc]ode\s*[:"“']?\s*[A-Z0-9]{4,12}\b/,
  /\bguarantee\s+(?:yourself|themselves|you)\s+a\b|\bsmart\s+bettors\b|\bmaximi[sz]e\s+(?:value|your\s+winnings)\b/i,
  /\b(?:claim|grab)\s+(?:your|a)\s+(?:welcome\s+)?(?:free\s+bet|bonus|free\s+spins?)\b/i,
];

function isBettingPromo(t) {
  const s = stripIdentity(t);
  if (!R56_LINK.test(s) || !BET58_BRAND.test(s)) return false;
  if (!BET58_VOICE.some((r) => r.test(s))) return false;
  return BET58_PROMO.filter((r) => r.test(s)).length >= 2;
}

// --- 59. AI "upload her photo" explicit-video lure ---------------------------
// "HenryThync" (15 Nov, Novosibirsk): "you upload a photo of your neighbor,
// classmate, teacher, secretary, or any other girl, and AI generates an erotic
// video with her for you. The level of vulgarity is unlimited. This is what
// you've always dreamed of. Try it for free here: https://short-url.cc/...".
// Rule 29 counts porn keywords and finds none. A VICTIM of exactly this may
// write to a therapist ("someone used AI to make a nude video from my photo,
// here is the site") and paste the link, so explicit + AI + link never block
// alone: two of the advert's own lines are needed ("you upload a photo of
// your...", "try it for free", "always dreamed of", "any other girl").
const DF59_EXPLICIT =
  /\b(?:erotic|nude|naked|porn\w*|sex|xxx|explicit|lewd)\s+(?:videos?|photos?|pics?|pictures?|images?|clips?)\b|\bundress(?:es|ing)?\b|\bnudify\b|\bdeep\s?nudes?\b/i;
const DF59_AI = /\bAI\b|\bA\.I\.|\bneural\b|\bdeep\s?fakes?\b|\bartificial\s+intelligence\b/i;
const DF59_SELL = [
  /\byou\s+upload\s+(?:a|any|her|the)\s+(?:photo|picture|pic|image)\b|\bupload\s+(?:a|any)\s+(?:photo|picture|pic|image)\s+of\s+(?:your|any)\b/i,
  /\btry\s+(?:it\s+)?(?:for\s+)?free\b|\btry\s+(?:it\s+)?now\b/i,
  /\b(?:always|ever)\s+dreamed\s+of\b|\blevel\s+of\s+vulgarity\b|\bany\s+other\s+girl\b/i,
];

function isDeepfakeLure(t) {
  const s = stripIdentity(t);
  if (!DF59_EXPLICIT.test(s) || !DF59_AI.test(s) || !R56_LINK.test(s)) return false;
  return DF59_SELL.filter((r) => r.test(s)).length >= 2;
}

// --- 60. Commercial / janitorial cleaning pitch -----------------------------
// "Jennifer Newman" / Bright Sphere Janitorial (16 Nov, sent from Karachi):
// "We handle office and building cleaning for local companies around
// Charlotte. If you'd like a second cleaning bid or a price check, I'm happy to
// stop by for a free estimate." A cleaning company's own customers ask for
// estimates too, so the block needs the sender describing their cleaning
// business ("we handle/provide office cleaning FOR local companies") AND the
// pitch's close (second bid, price check, happy to stop by, free estimate).
// "We handle office cleaning for our buildings in-house" delivers.
const CLEAN60_SELLER =
  /\bwe\s+(?:handle|provide|offer|do|deliver|specialize\s+in|specialise\s+in|take\s+care\s+of)\s+(?:reliable\s+|professional\s+|affordable\s+|high[-\s]quality\s+)?(?:office|commercial|janitorial|building|facility)\s+(?:and\s+(?:office|commercial|building|facility)\s+)?(?:cleaning|janitorial)(?:\s+services)?\s+for\s+(?:local\s+|small\s+|other\s+|many\s+)?(?:companies|businesses|offices|buildings|practices|clinics|medical\s+offices)\b/i;
const CLEAN60_CLOSE =
  /\ban?\s+(?:second|another|competitive|new)\s+(?:cleaning\s+)?(?:bid|quote|estimate)\b|\bprice\s+check\b|\b(?:happy|glad)\s+to\s+(?:stop|swing|come)\s+by\b|\bfree\s+(?:estimate|quote|walk[-\s]?through|bid)\b/i;

function isCommercialCleaningPitch(t) {
  const s = stripIdentity(t);
  return CLEAN60_SELLER.test(s) && CLEAN60_CLOSE.test(s);
}

// --- 61. Chinese / Japanese / Korean / Thai text with a pasted link ----------
// "RonaldPaupe" (laurabasscounseling.com, 17 Nov 2026, Hong Kong IP,
// jacklee@wormail888.com, 85877435827, posted without a page visit):
// "特考、普考考試教學，歡迎參考：https://soft-ware.xyz/" -- civil-service exam
// tutoring, "welcome to take a look", and a link. Rule 16 skips the
// capitalised tail ("Paupe"), rule 54 needs a Russian email, and rule 28 only
// reads Cyrillic.
// Two signals: at least 8 Chinese, Japanese, Korean or Thai characters in the
// submission (each line counted once, so the HTML copy does not double it), AND
// a link on the same line as that script, or alone at the start of the next
// line (and, link first, the script at the start of the line after it). A
// client who writes in Chinese with no link delivers. An English message that
// quotes a few Chinese words and pastes a link also delivers. So does a Chinese
// name in the name field, because name rows are stripped and a template link on
// a labelled line ("Page: https://...") is never adjacent.
// For English-language sites only: leave it out of any build whose audience
// writes in these scripts.
const EA61_CLASS = String.raw`฀-๿ᄀ-ᇿ぀-ヿ㄰-㆏㐀-䶿一-鿿가-힯豈-﫿`;
const EA61_CHAR = new RegExp(`[${EA61_CLASS}]`, 'g');
const EA61_URL = String.raw`(?:https?:\/\/|\bwww\.)[a-z0-9-]`;
const EA61_NEAR = new RegExp(
  String.raw`[${EA61_CLASS}]{2,}[^\n]{0,60}?(?:[ \t]*\n[ \t]*)?${EA61_URL}|${EA61_URL}[^\s]*(?:[^\n]{0,60}?|[ \t]*\n[ \t]*)[${EA61_CLASS}]{2,}`,
  'i',
);

function isEastAsianTextLink(t) {
  const s = stripIdentity(t).replace(/<[^>]+>/g, '\n').replace(/&nbsp;/gi, ' ');
  if (!EA61_NEAR.test(s)) return false;
  const lines = new Set(s.split('\n').map((l) => l.trim()).filter(Boolean));
  let n = 0;
  for (const l of lines) n += (l.match(EA61_CHAR) || []).length;
  return n >= 8;
}

// --- 29. Adult-content link spam ---------------------------------------------
// laurabasscounseling.com, 15 Oct 2026: "louisaiz2", naomi@pia.margarita.smtpops.top,
// an 11-digit phone, and a message that was a fake news headline, a link to a
// porn site and a line of porn search terms ("porn stars galleries porn very
// young teens porn gratis es indian anal porn free 24 sleep porn").
//
// On a counseling or law site a real client may write about pornography -- a
// partner's porn addiction, a teenager who found porn -- and may paste a link
// to an article. So one explicit term is never enough, with or without a link.
// The spam is a keyword list: at least two DIFFERENT explicit terms AND a link,
// or three different terms with no link at all. Counted as distinct terms
// because the rendered email carries every field twice (text and HTML).
const ADULT_TERMS = [
  /\bporn(?:o|ography|ographic|star|stars|hub)?\b/i,
  /\banal\b/i,
  /\bxxx\b/i,
  /\bhentai\b/i,
  /\bmilfs?\b/i,
  /\bsex\s*cams?\b|\bcam\s*girls?\b|\bwebcam\s+(?:girls?|sex|models?)\b/i,
  /\bescorts?\b(?!\s+(?:me|you|him|her|them|us)\b)/i,
  /\bnudes\b|\bnude\s+(?:girls?|women|teens?|pics?|photos?|videos?)\b/i,
  /\b(?:very\s+)?young\s+teens?\b|\bteen\s+(?:sex|girls?\s+(?:nude|naked|sex))\b/i,
  /\bfree\s+(?:sex|adult)\b|\badult\s+(?:videos?|movies?|cams?|dating|site)\b/i,
  /\bporn\s+(?:stars?\s+)?g[as]ller(?:y|ies)\b|\bsleep\s+porn\b/i,
];

function isAdultContentSpam(t) {
  if (!/porn|xxx|hentai|milf|\bsex|nude|escort/i.test(t)) return false;
  const hits = ADULT_TERMS.filter((re) => re.test(t)).length;
  if (hits >= 3) return true;
  return hits >= 2 && (ANY_LINK.test(t) || URL_SHORTENER.test(t));
}

// --- 62. Cold-email compliance footer pasted into a form ---------------------
// "Tyler Foster" (cpw@bd-126789654.com, cpwgo.com), colacityroofing.com, 5 and
// 17 Nov 2026, two different pitches (AI answering app, discount-code text-back)
// with the same tail:
//   Ref: HJG8B7F1
//   If you'd rather not hear from me, just reply "no thanks."
//   United Marketing LLC, 1001 Bishop St., STE 2685A, Honolulu, HI 96813
// That tail is a bulk sender's CAN-SPAM footer. A person writing TO a business
// does not offer the business a way to stop hearing from them, and does not sign
// with a company postal address plus a campaign reference. Rules 30/56 only know
// the STOP / opt-out wordings.
// Blocks on "rather not hear from me/us" plus any one of: a reply-to-decline
// line, a company postal footer, a campaign "Ref:" token, or a link. Without
// that phrase it needs all three of decline + postal footer + Ref token.
// Delivered: "If you can't take the job, just reply no thanks so I can call
// someone else", and a property manager's LLC signature with a street address.
const R62_RATHER_NOT =
  /\bif\s+you(?:\s*['’]d|\s+would)\s+(?:rather|prefer)\s+not\s+(?:to\s+)?hear\s+from\s+(?:me|us)\b/i;
const R62_DECLINE =
  /\b(?:just\s+|simply\s+)?(?:reply|respond|write\s+back)\s+(?:with\s+)?["'“‘]\s*(?:no\s+thanks|no\s+thank\s+you|not\s+interested|remove(?:\s+me)?|unsubscribe)\b/i;
const R62_POSTAL =
  /\b(?:llc|l\.l\.c\.|inc|ltd|corp|corporation|co)\.?,?\s+\d{1,6}\s+[^\n]{2,60}?\b(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|pkwy|parkway|hwy|highway|suite|ste)\b\.?[^\n]{0,60}?\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/i;
const R62_REF = /(?:^|\n)\s*ref(?:erence)?\s*[:#]\s*[A-Z0-9]{6,12}\s*(?:\n|$)/i;
const R62_LINK = /https?:\/\/|\bwww\.[a-z0-9-]+\.[a-z]{2,}/i;

function isColdEmailFooterPitch(t) {
  const s = stripIdentity(t);
  if (R62_RATHER_NOT.test(s)) {
    return R62_DECLINE.test(s) || R62_POSTAL.test(s) || R62_REF.test(s) || R62_LINK.test(s);
  }
  return R62_DECLINE.test(s) && R62_POSTAL.test(s) && R62_REF.test(s);
}

// --- 63. Fake-review seller --------------------------------------------------
// "Tuba 1" (mdsharifulhossen@gmail.com, WhatsApp +880...), colacityroofing.com,
// 16 Nov 2026: "I am a professional customer review writer ... *Verified Google
// reviews *Lifetime guarantee for Google reviews *Facebook reviews *Yellow Pages
// reviews *Trustpilot ... Note: No upfront payment is required. Payment is made
// after the service has been delivered." These sellers change gmail and WhatsApp
// number every time, so listing the sender does not stop the next one.
// STRONG seller signals (a customer does not write these): "review writer",
// permanent / non-drop reviews, a lifetime guarantee ON reviews, "I/we provide
// | offer | sell | write | post ... Google/Facebook/Yelp/Trustpilot reviews".
// WEAK: "verified Google reviews" (a customer can say "your verified Google
// reviews"). EXTRA: pay-after-delivery terms, a WhatsApp/Telegram contact, a
// list of 3+ review platforms.
// Blocks on 1 strong + 1 more (a second strong, or any extra), or on weak +
// pay-after + WhatsApp/Telegram. Delivered: a customer who counted "160
// verified Google reviews" and saw the firm on Facebook, Yelp and the BBB; a
// customer whose reviews mention a lifetime guarantee on the roof; a client
// asking an agency for help getting more reviews; someone reporting that a
// competitor buys fake reviews from a WhatsApp seller.
const R63_STRONG = [
  /\b(?:customer\s+|professional\s+|google\s+)?review\s+writer\b/i,
  /\b(?:permanent|non[\s-]?drop|drip[\s-]?fed)\s+(?:\w+\s+)?reviews\b/i,
  /\blifetime\s+guarantee\s+(?:on|for)\s+(?:the\s+|all\s+|our\s+|my\s+)?(?:quality\s+of\s+(?:the\s+|my\s+|our\s+)?)?(?:\w+\s+)?reviews\b/i,
  /\b(?:i|we)\s+(?:can\s+)?(?:provide|offer|sell|deliver|write|post)\s+(?:\d+\+?\s+)?(?:\w+\s+){0,2}(?:google|gmb|facebook|yelp|trustpilot|tripadvisor)\s+reviews\b/i,
];
const R63_WEAK = /\bverified\s+(?:google|gmb|facebook|yelp|trustpilot)\s+reviews\b/i;
const R63_PLATFORMS = /\b(?:google|facebook|yelp|trustpilot|yellow\s*pages|bbb|buildzoom|tripadvisor|angi|houzz|nextdoor)\b/gi;
const R63_PAY_AFTER =
  /\bno\s+upfront\s+payment\b|\bpayment\s+(?:is\s+)?(?:made\s+)?after\s+(?:the\s+)?(?:service|delivery|reviews?\s+(?:are|is)\s+(?:live|posted|delivered))/i;
const R63_CHAT = /\bwhats\s*app\b|\bwa\.me\/|\btelegram\b|\bt\.me\//i;

function isReviewSellerPitch(t) {
  const s = stripIdentity(t);
  const strong = R63_STRONG.filter((re) => re.test(s)).length;
  const payAfter = R63_PAY_AFTER.test(s);
  const chat = R63_CHAT.test(s);
  if (!strong) return R63_WEAK.test(s) && payAfter && chat;
  const platforms = new Set((s.match(R63_PLATFORMS) || []).map((p) => p.toLowerCase().replace(/\s+/g, ''))).size;
  return strong >= 2 || platforms >= 3 || payAfter || chat || R63_WEAK.test(s);
}

// --- 64. Pay-the-business offer for worker POV video to train robots/AI -----
// 18 Nov 2026, dencofuses.com /contact/: "Michael Turner", Whitmore Data
// Partners (info@whitmoredatapartners.com, (267) 489-2720): "AI labs building
// robots are paying businesses each month for first-person video of their
// people at work like picking, packing, sorting and order prep. The rate is $10
// per accepted hour, roughly $1,600 per worker per month ... they wear a light
// headset and work as usual. The program covers the equipment ... Open to a
// 15-minute call to see what this could come to for Denco Fuses?" Same script,
// same phone, new name and domain on andersonautoshow.com ("Elena Rossi",
// medici55.com) and colacityroofing.com ("Sarah Mitchell", getfairhavendata.com)
// the same morning.
// Rule 43 misses it: nothing is licensed or bought FROM the business, and
// "video" is not "data/records".
// Needs an AI/robot word AND a wearable/POV capture phrase AND a vendor-to-
// business signal (they pay the BUSINESS, or it is YOUR crew who would wear
// it), plus one more of: pay rate, equipment covered, the other vendor signal.
// Delivered: a robotics startup asking a staffing agency for temps to wear
// headcams at $18/hr ("we pay", no "your crew wear"), an employee asking a
// lawyer or therapist about being made to wear one ("us"/"our"), a university
// study paying participants, a customer wanting POV video of OUR crew filmed.
const R64_AI = /\b(?:AI|A\.I\.|artificial\s+intelligence|robots?|robotics|humanoids?|embodied|machine\s+learning|foundation\s+models?|training\s+data)\b|\btrain(?:ing)?\s+(?:\w+\s+)?(?:models?|robots?)\b/i;
const R64_WORKERS = String.raw`(?:people|crew|crews|team|teams|staff|workers|employees|technicians|techs|workforce|operators|pickers|packers|associates|warehouse\s+(?:team|staff|crew)|floor\s+(?:team|staff))`;
const R64_CAPTURE = new RegExp([
  String.raw`\b(?:first[-\s]?person|POV|point[-\s]of[-\s]view|egocentric|head[-\s]?mounted|head[-\s]?worn|body[-\s]?worn|helmet|chest[-\s]?mounted|wearable)\s+(?:video|footage|cameras?|cams?|recordings?|capture|data)\b`,
  String.raw`\bwear(?:s|ing)?\s+(?:a\s+|an\s+)?(?:light(?:weight)?\s+|small\s+|simple\s+|tiny\s+|comfortable\s+|discreet\s+)?(?:headsets?|head[-\s]?cams?|head[-\s]?mounted\s+cameras?|body[-\s]?cams?|cameras?|smart\s+glasses|camera\s+glasses|GoPros?)\b`,
  String.raw`\b(?:video|footage|recordings?)\s+of\s+(?:your|their)\s+${R64_WORKERS}\b`,
].join('|'), 'i');
const R64_BIZPAID = /\bpay(?:s|ing)?\s+(?:local\s+|small\s+)?(?:businesses|companies|employers|shops|warehouses|operators)\b|\bpays?\s+you\b|\b(?:businesses|companies|shops)\s+like\s+yours\b|\bcould\s+(?:come\s+to|mean|earn|be\s+worth|bring\s+in)\s+for\b|\b(?:extra|new|added|passive|additional)\s+(?:monthly\s+)?(?:revenue|income)\b/i;
const R64_YOURSTAFF = new RegExp([
  String.raw`\bnothing\s+changes\s+for\s+your\s+${R64_WORKERS}\b`,
  String.raw`\byour\s+${R64_WORKERS}\s*[:,–—-]?\s*(?:they\s+|would\s+|will\s+|just\s+|simply\s+|only\s+)?(?:wear|work\s+as\s+usual|keep\s+working|go\s+about)`,
  String.raw`\b(?:record|film|capture)(?:s|ing)?\s+your\s+${R64_WORKERS}\b`,
  String.raw`\b(?:video|footage|recordings?)\s+of\s+your\s+${R64_WORKERS}\b`,
  String.raw`\byour\s+${R64_WORKERS}['’]s?\s+(?:work\s+)?(?:footage|video|recordings?)\b`,
].join('|'), 'i');
const R64_RATE = /\$\s?\d[\d,.]*\s*(?:\/|per|an?|each)\s*(?:accepted\s+|recorded\s+|approved\s+|usable\s+|verified\s+)?(?:hour|hr)\b|\bper\s+(?:accepted|recorded|approved|usable|verified)\s+hour\b|\bper\s+(?:worker|employee|person|head|operator)\s+per\s+(?:month|week)\b/i;
const R64_EQUIP = /\b(?:covers?|provides?|ships?|supplies|supply|sends?|includes?)\s+(?:all\s+)?(?:of\s+)?(?:the\s+)?(?:equipment|hardware|cameras?|headsets?|glasses|gear)\b|\b(?:equipment|hardware|cameras?|headsets?|gear)\s+(?:is|are)\s+(?:provided|free|included|covered)\b/i;

function isRobotVideoPayPitch(t) {
  const s = stripIdentity(t);
  if (!R64_AI.test(s) || !R64_CAPTURE.test(s)) return false;
  const biz = R64_BIZPAID.test(s);
  const yours = R64_YOURSTAFF.test(s);
  if (!biz && !yours) return false;
  return [biz, yours, R64_RATE.test(s), R64_EQUIP.test(s)].filter(Boolean).length >= 2;
}
// --- 65. Porn link spam ------------------------------------------------------
// 18 Nov 2026, laurabasscounseling.com: "guadalupesh3",
// christianjn2@ben.barry.emailinbox.top, 85433327983, Paris IP, no page visit:
//   Sex ohne scham pornos sind teil der alltagskultur welt
//   https://rouse-latina-naked-on-the-bed.biggaysex.com/?elizabeth-estrella
//   hairy mom porn vids porn krissy lynn actress porn katie pierced lapia porn
//   porn time
// Rule 21 wants "here are MY intimate photos" or a shortener + Russian contact.
// Blocks a link whose HOST is adult (biggaysex, naked, porn, xxx, milf...) plus
// 2+ explicit words outside the links (1 when the host is unambiguous: porn,
// xxx, hentai, milf, nsfw...), unless the writer sounds like a client
// asking for help ("my husband", "addiction", "I'm struggling"). Keyword
// stuffing (5+ explicit words) with any link blocks regardless of those words
// when the host is adult, and without them when it is not.
// Explicit words are counted once per unique line, so the HTML copy of the
// same email does not double the count. Bare "sex"/"sexual"/"erotic" do not
// count: therapy, art and health enquiries use them. Hosts like essex,
// middlesex, unisex, sexualhealth, sextherapist are not adult.
// Delivered: a client describing a partner's porn habit with a Psychology Today
// link, an art write-up about eros, a sexual-health or sex-therapy link.
const R65_URL = /\bhttps?:\/\/[^\s"'<>)\]]+|\bwww\.[a-z0-9.-]+\.[a-z]{2,}[^\s"'<>)\]]*/gi;
const R65_ADULT_HOST = /porn|xxx|hentai|milf|nudes?(?![a-z])|naked|nsfw|camgirl|pussy|boobs|tits(?![a-z])|fuck|slut|horny|sexcam|sexy|(?<![se])(?<!uni)sex(?!t|ual|olog|ed(?![a-z])|ism)/i;
const R65_STRONG_HOST = /porn|xxx|hentai|milf|nsfw|pussy|fuck|slut|sexcam/i;
const R65_EXPLICIT = /\b(?:porn\w*|xxx\w*|hentai|milfs?|nudes?|naked|nsfw|pussy|tits|boobs|blowjobs?|cumshots?|fuck\w*|horny|sluts?|camgirls?|escorts?|hardcore|sexy|sex\s+(?:videos?|vids|tube|cams?|chat|movies?|clips?|dating))\b/gi;
const R65_HELP = /\baddict\w*|\brecovery\b|\bcompulsi\w+|\bmy\s+(?:husband|wife|partner|spouse|boyfriend|girlfriend|fianc[eé]e?|son|daughter|child|kids?|teen(?:ager)?|marriage|ex)\b|\bi(?:['’]m|\s+am)\s+(?:struggling|addicted|ashamed|worried|concerned|scared|afraid)\b|\bcan(?:['’]t|not)\s+stop\b|\bdo\s+you\s+(?:treat|work\s+with|help\s+with|see|offer)\b/i;

function isAdultLinkSpam(t) {
  const s = stripIdentity(t);
  const urls = s.match(R65_URL) || [];
  if (!urls.length) return false;
  const hosts = urls.map((u) => u.replace(/^https?:\/\//i, '').split(/[/?#:]/)[0]);
  const adultHost = hosts.some((h) => R65_ADULT_HOST.test(h));
  const strongHost = hosts.some((h) => R65_STRONG_HOST.test(h));
  const lines = new Set(
    s.replace(R65_URL, ' ').replace(/<[^>]*>/g, '\n').split(/\n+/).map((l) => l.replace(/\s+/g, ' ').trim().toLowerCase()).filter(Boolean),
  );
  let explicit = 0;
  for (const l of lines) explicit += (l.match(R65_EXPLICIT) || []).length;
  const help = R65_HELP.test(s);
  if (adultHost && explicit >= 5) return true;
  if (adultHost && explicit >= 2 && !help) return true;
  if (strongHost && explicit >= 1 && !help) return true;
  return explicit >= 5 && !help;
}
// --- 66. "Free check of what AI says about your practice" pitch ---------------
// 22 Nov 2026, rebeccarabinpsyd.com Contact Page Form: "Megan Piran",
// info@namedandfound.com, (226) 407-0386, Named & Found (Moneli Automation
// Inc., Houston), opening "Hello Rebecca Rabin PsyD Therapy team":
//   "More people now ask ChatGPT or Google's AI to help them find a therapist,
//    and those tools tend to name practices whose websites clearly explain who
//    they help ... Many good practices are left out simply because of how their
//    site is written. Named & Found improves what AI can read about your
//    practice ... and shows you the real AI answers every month ... If you'd
//    like a free check of what AI says about your practice today, just reply
//    "check" and I'll send it. ... If this is not relevant, reply 'no' and we
//    will not contact you again."
// Rule 22 wants "show up IN ChatGPT" plus "a few suggestions / okay to send";
// rule 40 wants a follow-up to a scan. This one sells reading the reader's
// business through AI. It needs an AI word and 2 of these 4, one of them READ
// or CHECK (the vendor talking about the READER's business):
//   READ:   what/how AI reads, says, knows, describes ... about YOUR practice/
//           business/clinic/site
//   CHECK:  a free check/scan/audit/report of what AI says; reply "check" and
//           I'll send it
//   NAMES:  AI tools name/recommend practices whose/that ...; "left out because
//           of how their site is written"; "real AI answers every month"
//   OPTOUT: "if this is not relevant, reply"; "reply 'no' and we will not
//           contact you again"
// Gated with sellsSearch like rule 40: on an SEO agency's form, "a free check of
// what AI says about our practice" is what a lead asks for.
// Delivered: a patient who found the practice through ChatGPT, a client asking
// whether AI is safe to use between sessions, a journalist writing about
// people asking ChatGPT for a therapist (with an opt-out line), an owner asking
// for "a free check of what ChatGPT says about my practice".
const R66_AI = /\b(?:ai|a\.i\.|chat\s*gpt|gemini|perplexity|claude|copilot|grok|llms?|large\s+language\s+models?)\b/i;
const R66_WHO = '(?:ai|a\\.i\\.|chat\\s*gpt|gemini|perplexity|claude|copilot|grok|llms?|google[\'’]?s?\\s+ai|(?:the\\s+)?ai\\s+(?:tools?|assistants?|search(?:\\s+tools?)?|engines?|models?|platforms?|chatbots?))';
const R66_BIZ = '(?:practice|business|company|clinic|firm|office|brand|site|website|web\\s*site|services?|listing)';
const R66_READ = new RegExp(
  `\\b(?:what|how)\\s+${R66_WHO}\\s+(?:can\\s+|could\\s+|will\\s+|does\\s+|is\\s+|currently\\s+|actually\\s+)?(?:reads?|reading|says?|saying|knows?|tells?|telling|recommends?|thinks?|understands?|sees?|finds?|describes?|describing|presents?|shows?|answers?|learns?)\\s+(?:about|of|regarding)\\s+your\\s+(?:\\w+\\s+)?${R66_BIZ}\\b`,
  'i');
const R66_CHECK =
  /\bfree\s+(?:ai\s+)?(?:check|scan|audit|report|snapshot|look|review|analysis|assessment)\s+of\s+(?:what|how)\s+(?:ai|a\.i\.|chat\s*gpt|gemini|perplexity|claude|copilot|google['’]?s?\s+ai)\b|\b(?:just\s+)?reply\s+["'“‘]?(?:check|scan|audit|report)["'”’]?\s+(?:and|&)\s+(?:i|we)(?:['’]ll|\s+will)\s+send\b/i;
const R66_NAMES =
  /\b(?:name|names|naming|recommend|recommends|recommending|cite|cites|citing|mention|mentions|suggest|suggests|surface|surfaces|pick|picks|favou?r|favou?rs)\s+(?:the\s+)?(?:practices|businesses|companies|firms|clinics|therapists|providers|practitioners|brands|offices|lawyers|contractors)\s+(?:whose|that|with|who)\b|\bleft\s+out\s+(?:simply\s+|just\s+)?because\s+of\s+how\s+their\s+(?:web\s*site|site)\b|\breal\s+ai\s+answers\b|\bai\s+answers\s+every\s+(?:month|week)\b/i;
const R66_OPTOUT =
  /\bif\s+(?:this|it)\s+(?:is\s+not|isn['’]t|is)\s+(?:not\s+)?relevant,?\s+(?:just\s+)?(?:reply|respond|write|answer)\b|\b(?:reply|respond)\s+(?:with\s+)?["'“‘]?(?:no|stop|remove|unsubscribe)["'”’]?\s+(?:and|&)\s+(?:we|i)\s+(?:will\s+not|won['’]t)\s+(?:contact|email|reach\s+out\s+to|bother|message)\s+you\s+again\b/i;

function isAiAnswerCheckPitch(t, sellsSearch) {
  if (sellsSearch) return false;
  const s = stripIdentity(t);
  if (!R66_AI.test(s)) return false;
  const read = R66_READ.test(s), check = R66_CHECK.test(s);
  if (!read && !check) return false;
  return [read, check, R66_NAMES.test(s), R66_OPTOUT.test(s)].filter(Boolean).length >= 2;
}

// --- 67. Crypto giveaway link scam --------------------------------------------
// 22 Nov 2026, jaycompdevelopment.com /about/shipping-information/: "Shelton
// Fosbrook", shelton.fosbrook@outlook.com, 7753342125: "Elon Musk fired me after
// he discovered that I copied all his unique promotional links. To make things
// right, I'm giving you an exclusive opportunity to benefit from this situation.
// Click this link to claim 0.3 BTC: https://www.tokenxinc.com/ . Hurry up before
// he changes it!" Delivered to the client: no SEO, no pitch vocabulary.
// Needs a coin word AND a claim verb on the coins (claim/withdraw/collect/
// redeem/unlock), plus a coin AMOUNT and a hook (urgency, "exclusive
// opportunity", giveaway, "click this link"). "Elon Musk" with a coin and a
// claim verb stands alone. Delivered: an accounting client who received 0.3 BTC
// and asks how to report it or claim the loss, a crypto ATM install quote.
const R67_COIN = /\b(?:BTC|bitcoins?|ETH|ether(?:eum)?|USDT|tether|crypto(?:currency|currencies)?|dogecoin|DOGE|XRP|litecoin|LTC|BNB)\b/i;
const R67_AMOUNT = /\b\d+(?:[.,]\d+)?\s*(?:BTC|ETH|USDT|bitcoins?|DOGE|XRP|LTC|BNB)\b|\$\s?\d[\d,]*(?:\.\d+)?\s*k?\s+(?:in|of|worth\s+of)\s+(?:BTC|bitcoin|crypto|ETH|USDT)\b/i;
const R67_CLAIM = /\b(?:claim|withdraw|collect|redeem|grab|unlock)\s+(?:your\s+|the\s+|my\s+|free\s+|an?\s+)?(?:[\w.,$]+\s+){0,3}?(?:BTC|ETH|USDT|bitcoins?|crypto|coins?|rewards?|bonus|payout|airdrop|funds)\b/i;
const R67_HOOK = /\bhurry(?:\s+up)?\b|\bbefore\s+(?:he|she|they|it|the\s+\w+)\s+(?:changes?|removes?|ends?|expires?|closes?|notices?)\b|\bexclusive\s+opportunity\b|\bpromo(?:tional)?\s+(?:links?|codes?)\b|\blimited[\s-]time\b|\bact\s+(?:now|fast|quickly)\b|\bto\s+make\s+(?:things|it)\s+right\b|\b(?:giveaway|airdrop)\b|\bfree\s+(?:BTC|bitcoin|crypto|ETH|USDT)\b|\b(?:click|tap|follow|visit|open)\s+(?:this|the|my|our)\s+link\b|\blink\s+(?:below|above)\b/i;

function isCryptoGiveaway(t) {
  const s = stripIdentity(t);
  if (!R67_COIN.test(s) || !R67_CLAIM.test(s)) return false;
  if (/\belon\s+musk\b/i.test(s)) return true;
  return R67_AMOUNT.test(s) && R67_HOOK.test(s);
}

// --- 68. Data-breach extortion ("we have extracted your patient records") ----
// 21 Nov 2026, infinitedentalwellness.com booking form, the whole text typed
// into the NAME field: "During a routine security assessment of your network,
// we identified a critical vulnerability that resulted in unauthorized access to
// your patient management system. We have extracted a sample of the compromised
// records ... Regulatory Penalties ... Legal Action ... Reputational Damage ...
// Below is a sample of the extracted patient records. This is only a fraction of
// the full database currently in our possession. Patient ID: 10245 | Name: John
// A. Smith | DOB: 05/14/1982 | ... | Phone: (310) 555-0198 | Card: Visa ---9010".
// Needs the sender to say WE took the data ("we have extracted/stolen/...", "in
// our possession", "sample of the compromised records") plus two threat phrases
// or a record dump (2+ patient IDs, DOBs, card rows or 555-01xx numbers), or a
// dump plus one threat. Delivered: a patient worried about a breach letter, a
// practice owner telling a lawyer or IT firm "we were breached and they say they
// have stolen our data", a patient threatening legal action over a bill.
const R68_WEHAVE = /\bwe\s+(?:have\s+|had\s+|now\s+|already\s+|successfully\s+|also\s+)*(?:extracted|exfiltrated|stolen|stole|dumped|copied|downloaded|obtained|encrypted|harvested)\b[^.!?\n]{0,80}?\b(?:records?|data(?:base)?|files|information|PHI|PII)\b|\b(?:currently\s+)?in\s+our\s+possession\b|\bsample\s+of\s+the\s+(?:extracted|compromised|stolen|leaked|exfiltrated|breached)\b|\bcompromised\s+(?:patient\s+|client\s+|customer\s+)?records\b/i;
const R68_THREATS = [
  /\bregulatory\s+(?:penalties|fines|action)\b/i,
  /\blegal\s+action\b|\bclass[\s-]action\b|\blawsuits?\b/i,
  /\bpublic(?:ly)?\s+disclos/i,
  /\breputational\s+(?:damage|harm|risk)\b/i,
  /\b(?:will|would)\s+be\s+(?:published|leaked|released|sold|disclosed|posted|exposed)\b/i,
  /\b(?:client|patient|customer)\s+churn\b|\bloss\s+of\s+trust\b/i,
  /\bunless\s+you\b|\bransom\b|\b(?:payment|pay)\s+(?:in|via|with)\s+(?:BTC|bitcoin|crypto|USDT|monero)\b/i,
  /\b(?:HIPAA|GDPR)\s+(?:fines|penalties|violations?)\b|\bfines\s+from\s+(?:health\s+)?(?:authorities|regulators)\b/i,
];
const R68_DUMP = [
  /\b(?:patient|client|customer|member|account)\s*(?:ID|#|no\.?)\s*:?\s*\d{3,}/gi,
  /\bDOB\s*:\s*\d/gi,
  /\bcard\s*:\s*(?:visa|master\s?card|amex|american\s+express|discover)\b/gi,
  /\(?\d{3}\)?[\s.-]*555[\s.-]*01\d\d\b/g,
];

function isBreachExtortion(t) {
  const s = String(t);
  const threats = R68_THREATS.filter((r) => r.test(s)).length;
  const dump = R68_DUMP.some((r) => (s.match(r) || []).length >= 2);
  if (R68_WEHAVE.test(s)) return threats >= 2 || dump;
  return dump && threats >= 2;
}

// --- 69. White-label SaaS reseller "income stream" pitch ----------------------
// 21 Nov 2026, laurabasscounseling.com, "Megan Horrocks", megan.horrocks@
// gmail.com, 890961284: "Searching for a lucrative, ready-to-launch SaaS
// opportunity? Turn high-demand AI automation into your own monthly income
// stream! With our Turnkey SaaS Reseller Program, you unlock a complete AI
// Chatbot, WhatsApp CRM, and Social Media Automation platform ready to monetize
// under your own brand, logo, and domain ... keep all your revenue (zero
// commissions) ... zero coding required ... 70% OFF Forever ... $29.99/mo
// (Normally $99.99)". Rule 27 (lifetime deal) needs a lifetime offer.
// Needs all four: resell/white-label/own-brand, a software product, an income
// promise, and a sale (percent off, $/mo, "normally $", "zero coding"). A real
// agency prospect asking about white-label software has no income promise and
// no discount, so it delivers.
const R69_RESELL = /\bwhite[-\s]?label(?:ed|led)?\b|\bresell(?:er|ers|ing)?\s+(?:program|platform|licen[cs]e|rights|plan|package|business|opportunity)\b|\bturnkey\s+(?:SaaS|platform|software|business|AI)\b|\bunder\s+your\s+own\s+(?:brand|logo|domain|name|company)\b|\brebrand(?:ed)?\s+(?:it\s+)?as\s+your\s+own\b|\bready[-\s]to[-\s]launch\s+SaaS\b/i;
const R69_PRODUCT = /\bSaaS\b|\b(?:AI\s+)?chat\s?bots?\b|\bWhatsApp\s+(?:CRM|automation|API|marketing|bot)\b|\bCRM\b|\bsocial\s+media\s+automation\b|\bautomation\s+(?:platform|software|suite)\b|\bAI\s+(?:automation|agents?|platform|software)\b/i;
const R69_INCOME = /\b(?:monthly|recurring|passive)\s+(?:income|revenue)\b|\bincome\s+stream\b|\bkeep\s+(?:all|100\s?%)\s+(?:of\s+)?(?:your|the)\s+(?:revenue|profits?|earnings)\b|\bzero\s+commissions?\b|\bgoldmine\b|\blucrative\b|\bset\s+your\s+own\s+(?:prices?|pricing|subscription|plans?)\b|\bscale\s+your\s+income\b/i;
const R69_SALE = /\b\d{1,3}\s?%\s*off\b|\blimited[-\s]time\s+(?:discount|offer|deal|price|pricing)\b|\blifetime\s+(?:deal|access|licen[cs]e|plan)\b|\$\s?\d+(?:\.\d{2})?\s*\/\s*(?:mo|month)\b|\bnormally\s+\$|\bregularly\s+\$|\bzero\s+coding\b|\bno\s+coding\s+(?:required|needed|skills)\b|\blive\s+in\s+under\s+\d+\s+minutes\b/i;

function isSaasResellerPitch(t) {
  const s = stripIdentity(t);
  return R69_RESELL.test(s) && R69_PRODUCT.test(s) && R69_INCOME.test(s) && R69_SALE.test(s);
}

// --- 70. Paid Wikipedia page pitch ---------------------------------------------
// 21 Nov 2026, elonhealthurgentcare.com, "Julie Barker", julie@proonlinepage.com,
// 18149805065: "Wikipedia is one of the most trusted and visible platforms
// online. A properly structured, policy-compliant Wikipedia page for yourself or
// your company can strengthen credibility and enhance your brand presence. If
// you'd like to explore whether you qualify and learn more about the process,
// simply reply to this email and I'll share the details. Best regards, Julie
// Barker, Sales Executive".
// Needs "Wikipedia" plus two seller phrases, or one plus a seller sign-off.
// Delivered: a prospect asking an agency to create a Wikipedia page for OUR
// company, someone reporting a defamatory edit, a page deleted for notability.
const R70_PITCH = [
  /\bfor\s+(?:yourself|you\s+or\s+your\s+(?:company|business|brand)|your\s+(?:company|business|brand|practice|firm|organi[sz]ation|clinic))\b/i,
  /\bpolicy[-\s]compliant\b/i,
  /\b(?:whether|if)\s+you\s+qualify\b/i,
  /\bbrand\s+(?:presence|credibility|authority)\b|\bstrengthen\s+(?:your\s+)?credibility\b/i,
  /\bmost\s+trusted\s+and\s+visible\b|\bmost\s+(?:trusted|visible)\s+(?:platforms?|websites?|sites?)\b/i,
  /\bguaranteed\s+(?:approval|publication|placement)\b/i,
];
const R70_SELLER = /\breply\s+to\s+this\s+(?:email|message)\b|\bI['’]?ll\s+(?:share|send)\s+(?:you\s+)?(?:the\s+|more\s+|all\s+the\s+)?details\b|\bsales\s+(?:executive|manager|representative|rep|consultant)\b|\blearn\s+more\s+about\s+the\s+process\b/i;

function isWikipediaPagePitch(t) {
  const s = stripIdentity(t);
  if (!/\bwikipedia\b/i.test(s)) return false;
  const pitch = R70_PITCH.filter((r) => r.test(s)).length;
  return pitch >= 2 || (pitch >= 1 && R70_SELLER.test(s));
}

// --- 71. Generated CamelCase name + Russian number + a link -------------------
// 21 Nov 2026, fessolutions.net quick-quote form, Russian IP: "GregoryErats",
// drilolatgcen1984@mailnorms.com, 86627873355, spun text about "proxy solutions"
// and https://atpimety.com. Rule 54 needs a Russian ADDRESS as well as the
// number; this one used a throwaway non-.ru mailbox. The pasted link takes the
// address's place: the CamelCase junk tail (Erats, Nub, Wrics), an 11-digit
// Russian number AND a link. A real "Gregory Evans" types a space; a Russian-
// speaking client with a real name always delivers.
function isCamelNameRuPhoneLink(t) {
  if (!RU_PHONE.test(t) && !RU_PHONE_DOMESTIC.test(t)) return false;
  if (!/\bhttps?:\/\/[a-z0-9-]+\.[a-z0-9.-]+/i.test(t)) return false;
  return camelNameValues(t).some(hasCamelTailNameValue);
}

// --- 72. Ghost-written press feature "placed" in big outlets ------------------
// 21 Nov 2026, youngermemd.com (and earlier on other clients), "Aidan Sowa",
// talltower100@gmail.com, 401-219-4207: "would a finished piece on YoungerMeMD
// be of use? Forbes, Bloomberg and Entrepreneur are the desks we write and place
// telehealth features into. Before we discuss placing anything, I would write
// yours first, free. Where it gets published is a separate conversation. You
// keep the draft regardless. You can book a time here: calendly.com/viperagency".
// Needs two big outlets AND a place/feature verb aimed at the business, plus a
// free draft, "separate conversation" or a booking link. Delivered: a client
// saying they were featured in Forbes, a journalist from one outlet asking for
// an interview (one outlet, no placing).
const R72_OUTLET = /\bInc\.(?:com\b)?|\bInc\s+magazine\b|\b(?:Forbes|Bloomberg|Entrepreneur(?:\.com)?|Business\s+Insider|Fast\s+Company|TechCrunch|Yahoo\s+Finance|USA\s+Today|HuffPost|Huffington\s+Post|Fortune|Newsweek|MarketWatch|Benzinga|Reuters|CNBC|Wall\s+Street\s+Journal|WSJ|New\s+York\s+Times|Thrive\s+Global)\b/g;
const R72_PLACE = /\b(?:we|I)\s+(?:write\s+and\s+)?(?:place|pitch|land|secure|get)\b[^.?!\n]{0,60}?\b(?:features?|stories|articles?|pieces?|coverage|placements?|you\s+featured)\b|\b(?:desks|outlets|publications)\s+(?:we|I)\s+(?:write\s+(?:and\s+place\s+)?|place\s+|pitch\s+)?(?:\w+\s+)?(?:into|for|in)\b|\bget\s+(?:you|your\s+(?:brand|company|practice|business))\s+(?:featured|published|covered)\s+(?:in|on)\b|\bplacing\s+(?:anything|it|your\s+(?:story|piece|article))\b/i;
const R72_HOOK = /\b(?:write|draft)\s+(?:yours|it|the\s+(?:piece|article|feature|draft))\s+(?:first\s*,?\s+)?(?:for\s+)?free\b|\bfinished\s+(?:piece|article|feature|draft)\b|\b(?:where|when)\s+it\s+gets\s+published\s+is\s+a\s+separate\b|\byou\s+keep\s+the\s+(?:draft|piece|article)\b|\bcalendly\.com\/|\bbook\s+a\s+(?:time|call|slot)\b/i;

function isPressPlacementPitch(t) {
  const s = stripIdentity(t);
  const outlets = new Set((s.match(R72_OUTLET) || []).map((o) => o.toLowerCase().replace(/\s+/g, ' ')));
  return outlets.size >= 2 && R72_PLACE.test(s) && R72_HOOK.test(s);
}

// --- 73. Replica luxury goods ("alternative bags and watches") ----------------
// 21 Nov 2026, murphyaccounting.com, "DAvid", support@decentgears.com,
// 5918564588 (also DENCO and icounseling under "David Lin"): "Have you ever
// ordered an alternative bag or watch online ... Our luxury-alternative bags
// feature genuine leather ... No one will ever guess it is an alternative ...
// without paying for the inflated brand name markup. Explore our catalog ...
// www.decentgears.com. We offer free global shipping".
// Needs a replica word on bags/watches/sneakers AND a seller line (catalog, free
// worldwide shipping, "no one will guess", brand markup). Delivered: a customer
// asking a jeweller to service an alternative watch strap, an accountant's
// client asking about sales tax on handbags.
const R73_REPLICA = /\b(?:replicas?|knock[-\s]?offs?|dupes?|super[-\s]?clones?|1\s?:\s?1|AAA\+?|mirror[-\s]quality|(?:luxury[-\s])?alternatives?|inspired)\s+(?:designer\s+|luxury\s+|branded\s+|premium\s+)?(?:bags?|handbags?|purses?|watch(?:es)?|sneakers|wallets|belts|sunglasses)\b|\bluxury[-\s]alternative\b|\breplica\s+(?:rolex|louis\s+vuitton|gucci|chanel|herm[eè]s|prada|cartier|omega)\b/i;
const R73_SELLER = /\bno\s+one\s+will\s+(?:ever\s+)?(?:guess|know|notice|tell)\b|\b(?:inflated|crazy|ridiculous)\s+(?:brand(?:\s+name)?\s+)?(?:markup|prices?)\b|\bbrand(?:\s+name)?\s+markup\b|\bfree\s+(?:global|worldwide|international)\s+shipping\b|\bexplore\s+our\s+(?:catalog(?:ue)?|collection|store|shop)\b|\bour\s+(?:workshop|factory)\b/i;

function isReplicaGoodsPitch(t) {
  const s = stripIdentity(t);
  return R73_REPLICA.test(s) && R73_SELLER.test(s);
}

// --- 74. Franchise-development pitch ------------------------------------------
// 21 Nov 2026, cryogenx4.com, "John", development@franchisecreator.com: "We've
// been following  and are impressed by the incredible brand you've built. At
// Franchise Creator, we've franchised more than 1,300 brands over the past 15+
// years, and we believe  has many of the qualities we look for in successful
// franchise concepts. Let's have a brief introductory conversation to explore
// whether franchising could be your best growth opportunity. Schedule here:
// https://franchisecreator.com/contact-form-booking" (the brand name left blank
// twice by the mail merge).
// Needs a franchise word plus a seller-only claim (we have franchised N brands,
// "qualities we look for", "your best growth opportunity", "impressed by the
// brand you've built"). Delivered: an owner asking a franchise lawyer or CPA for
// help franchising their business, a franchisee asking about buying in.
const R74_FRANCHISE = /\bfranchis(?:e|es|ed|ing|or)\b/i;
const R74_SELLER = [
  /\bwe['’]?ve\s+franchised\s+(?:more\s+than\s+|over\s+)?[\d,]+\+?\s+(?:brands|businesses|companies|concepts)\b|\bhelped\s+(?:more\s+than\s+|over\s+)?[\d,]+\+?\s+(?:brands|businesses|companies)\s+franchise\b/i,
  /\bqualities\s+we\s+look\s+for\b/i,
  /\bfranchising\s+could\s+be\s+your\s+(?:best|next|biggest)\b|\bexplore\s+whether\s+franchising\b/i,
  /\bimpressed\s+(?:by|with)\s+the\s+(?:incredible|amazing|great|impressive)\s+brand\s+you['’]?ve\s+built\b|\bwe['’]?ve\s+been\s+following\s+(?:your\s+(?:brand|business|company)|\s+and)\b/i,
];

function isFranchiseDevPitch(t) {
  const s = stripIdentity(t);
  return R74_FRANCHISE.test(s) && R74_SELLER.filter((r) => r.test(s)).length >= 2;
}

// --- 75. Pay-per-lead introduction pitch --------------------------------------
// 20 Nov 2026, answering365.com, "Elliott Lee", elliott@langdaleadvisory.com,
// +14157180636, German IP, 5 s on site: "Hi, we introduce Answering365 to
// businesses that are looking for what you do. No retainer, you only pay for the
// leads you receive. Shall I send over how it works? Thanks, Elliott". Rule 55's
// pay clause wants "you only pay WHEN we book"; this says "for the leads".
// Needs two of: "we introduce <you> to businesses/customers looking for what you
// do", "no retainer", "you only pay for the leads/customers/appointments",
// "shall I send over how it works". Delivered: a client asking "do you charge a
// retainer?", a customer saying "I only pay for what I use".
const R75_SIGNALS = [
  /\bwe\s+(?:introduce|connect|match|refer|send)\s+[\w&.'’ -]{1,40}?\s+(?:to|with)\s+(?:businesses|companies|customers|clients|buyers|homeowners|people)\s+(?:that\s+are\s+|who\s+are\s+|already\s+)?(?:looking\s+for|searching\s+for|in\s+need\s+of|needing)\s+(?:what\s+you\s+(?:do|offer|sell)|your\s+(?:services?|products?))\b/i,
  /\bno\s+retainers?\b|\bwithout\s+(?:a\s+)?retainer\b|\bzero\s+retainer\b/i,
  /\byou\s+(?:only|just)\s+pay\s+(?:for\s+)?(?:the\s+|each\s+)?(?:leads?|customers?|clients?|appointments?|introductions?|calls?|jobs?)\s+(?:you\s+(?:receive|get|accept|close|win|take)|we\s+(?:send|deliver|bring|book))\b|\bpay[\s-]per[\s-](?:lead|appointment|introduction)\b/i,
  /\b(?:shall|should|can|may)\s+I\s+send\s+(?:you\s+)?over\s+how\s+(?:it|this)\s+works\b/i,
];

function isPayPerLeadIntro(t) {
  const s = stripIdentity(t);
  return R75_SIGNALS.filter((r) => r.test(s)).length >= 2;
}

// --- 76. "Do you need service for your X? We are here to help" vendor offer ---
// 20 Nov 2026, ctuprecast.com quote form, "Cooperation in Customer Service
// Germany" / Roboz Service Deutschland, juliane.koslow@robozservice.com,
// +493083792531: "Do you need technical service for your robots in Germany?
// robozservice is here to help, with remote and on-site support for cobots,
// mobile robots and humanoids. Send us a message if you are interested." Rule
// 12 wants "do you need ... services" (plural) and a "for your business" target.
// Needs the asked-for service on YOUR equipment AND a vendor close ("is here to
// help", "send us a message if you are interested"). Delivered: a customer
// asking "do you need my serial number for the service?", "let me know if you
// are interested in the job" without a service question.
const R76_ASK = /\bdo(?:es)?\s+(?:you|your\s+(?:team|company|business|firm|plant|facility))\s+(?:need|require|want)\s+(?:any\s+|some\s+|reliable\s+|professional\s+)?(?:[\w-]+\s+){0,2}?(?:service|servicing|support|maintenance|repairs?|calibration|cleaning)\s+(?:for|on)\s+your\s+(?:[\w-]+\s+){0,2}?(?:robots?|cobots?|machines?|machinery|equipment|fleet|vehicles?|computers?|servers?|printers?|forklifts?|website|systems?|HVAC|elevators?|generators?)\b/i;
const R76_CLOSE = /\b(?:is|are)\s+here\s+to\s+help\b|\b(?:send\s+us\s+a\s+(?:message|line|note)|contact\s+us|reach\s+out|get\s+in\s+touch|reply|write\s+(?:to\s+)?us)\s+if\s+(?:you\s+are|you['’]re|you\s+would\s+be)\s+interested\b/i;

function isNeedServiceOffer(t) {
  const s = stripIdentity(t);
  return R76_ASK.test(s) && R76_CLOSE.test(s);
}

// --- 77. "New visitors every day" traffic pitch -------------------------------
// 21 Nov 2026, spiral2grow.com popup form, "Breanna Skemp",
// parkerharrison31023@gmail.com, (417) 063-9241: "Would you like new visitors
// arriving on spiral2grow.com every day for a month? Just reply YES and I'll
// send you a short overview. Plus, you can start with a free test before you
// decide ... If now isn't a good time, send me "unsubscribe" and you won't hear
// from me again." Rule 30 wants a "this is X with Y" intro beside the YES close.
// Needs the traffic OFFER ("would you like / we can ... new visitors arriving
// on ... every day") AND one close (reply YES, free test before you
// decide, send "unsubscribe"). Delivered: a client saying "we get new visitors
// every day but no calls".
const R77_TRAFFIC = /\b(?:would\s+you\s+like|do\s+you\s+want|want|we\s+(?:can|will|could)|I\s+(?:can|will|could)|get(?:ting)?\s+you)\s+(?:\w+\s+){0,3}?(?:new|more|real|targeted|fresh|daily)\s+(?:visitors|traffic)\s+(?:arriving|coming|landing|flowing)\s+(?:on|to|at)\b(?:[^.?!\n]|\.(?=\S)){0,60}?\b(?:every\s+day|daily|each\s+day|per\s+day|for\s+(?:a|one|the\s+next)\s+month)\b|\b(?:send|drive|bring)\s+(?:you\s+)?(?:\d[\d,]*\s+)?(?:new\s+|real\s+|targeted\s+)?visitors\s+(?:to\s+\S+\s+)?(?:every\s+day|daily|each\s+day|per\s+day)\b/i;
const R77_CLOSE = /\breply\s+["'“]?yes\b|\bfree\s+(?:test|trial)\s+(?:run\s+)?before\s+you\s+(?:decide|commit|pay)\b|\bsend\s+me\s+["'“]?unsubscribe\b|\byou\s+won['’]?t\s+hear\s+from\s+me\s+again\b/i;

function isDailyVisitorsPitch(t) {
  const s = stripIdentity(t);
  return R77_TRAFFIC.test(s) && R77_CLOSE.test(s);
}

// --- 78. Special-purpose vehicle supplier blast (CLW Group) -------------------
// 21 Nov 2026, blueriverrealtyllc.com call-back form, "Nannie",
// nannierains573@live.com, 629542897, posted without a page visit:
// "discussFor representatives, municipal authorities, logistics operators,
// emergency companies, construction companies, healthcare providers, and fleet
// proprietors seeking dependable special-purpose vehicles, CLW Group supplies a
// comprehensive platform for sourcing, modification, and long-lasting teamwork."
// Needs "special-purpose vehicles" plus the CLW name or a list of three buyer
// types. Delivered: a client asking to insure or finance one special-purpose
// vehicle.
const R78_SPV = /\bspecial[-\s]purpose\s+(?:vehicles?|trucks?)\b/i;
const R78_BUYERS = [/\bmunicipal(?:ities|\s+authorities)\b/i, /\blogistics\s+(?:operators|companies)\b/i, /\bemergency\s+(?:companies|services|departments)\b/i, /\bconstruction\s+companies\b/i, /\bhealthcare\s+providers\b/i, /\bfleet\s+(?:proprietors|owners|operators|managers)\b/i];

function isSpecialVehicleBlast(t) {
  const s = stripIdentity(t);
  if (!R78_SPV.test(s)) return false;
  return /\bCLW\b|\bChengli\b/i.test(s) || R78_BUYERS.filter((r) => r.test(s)).length >= 3;
}
// --- 79. Review-reply software pitch ("none has a reply yet") ---------------
// 23 Nov 2026, roofstellar.com contact page, "Doron (Presap)", ops@presap.com,
// +1 (855) 595-4040: "Hi Stellar Roofing Company team, this is a business note,
// not a service request. Natanael's and Carol's reviews from 2 weeks ago, plus
// DUC's and David's (praising Mihles), are all 5 stars, and none has a reply
// yet. Homeowners read those replies before they call. I'm Doron, founder of
// Presap. It writes replies like these in your voice and posts them (you can
// approve any of them by email first), plus regular posts on your Google
// profile. I'm taking 10 US trade companies as design partners: Presap Pro for
// 90 days at no cost, no card, no contract.
// https://presap.com/partners?f=wform-roofstellar". Delivered to info@.
// Needs a review word, a reply word, and 3 of 5 signals, one of them UNANSWERED
// or VENDOR:
//   UNANSWERED  none has a reply / reviews are unanswered / customers read the replies
//   VENDOR      it/we write or post the replies, "in your voice", "posts on your Google profile"
//   OFFER       N days free / at no cost, "no cost, no card", design or beta partners, free trial
//   DISCLAIM    "a business note, not a service request"
//   CTA         a link tagged ?f=wform-<site>, "reply YES"
// Off when sellsSearch is set (an SEO or reputation agency's own prospects
// write about unanswered reviews and free trials). Delivered: a customer whose
// review has no reply yet, an owner asking an agency to write replies "in our
// voice" with a free trial, a customer saying "not a service request, just
// thanks", a patient complaining about the replies to reviews.
const R79_REVIEW = /\breviews?\b/i;
const R79_REPLY = /\b(?:repl(?:y|ies|ying|ied)|respon(?:d|ds|se|ses|ding|ded))\b/i;
const R79_UNANSWERED = /\b(?:none|neither|not\s+one|no\s+one|nobody)\s+(?:of\s+(?:them|these|those|your\s+reviews)\s+)?(?:has|have|had|got|gets?)\s+(?:a\s+|any\s+|an\s+owner\s+)?(?:reply|replies|response|responses|answer)\b|\b(?:has|have|had|got)\s+(?:no|zero)\s+(?:owner\s+)?(?:reply|replies|response|responses)\b|\b(?:no|without\s+an?|without\s+any)\s+(?:owner\s+)?(?:reply|replies|response|responses)\s+yet\b|\bunanswered\s+(?:google\s+|yelp\s+|online\s+)?reviews?\b|\breviews?\s+(?:are\s+|still\s+|sit\s+|sitting\s+|left\s+)?(?:unanswered|without\s+(?:a\s+|any\s+)?(?:reply|replies|response))\b|\b(?:homeowners|customers|patients|clients|people|buyers|shoppers|prospects)\s+(?:read|check|look\s+at|notice)\s+(?:those|these|the|your|owner|how\s+you\s+write\s+the)\s+(?:replies|responses)\b/i;
const R79_VENDOR = /\b(?:it|we|i|our\s+(?:tool|app|software|platform|ai|system|team))\s+(?:can\s+|will\s+|would\s+|then\s+)?(?:writes?|drafts?|posts?|generates?|handles?|answers?|respond(?:s)?\s+to|repl(?:y|ies)\s+to)\s+(?:the\s+|all\s+|those\s+|these\s+)?(?:replies|responses|review\s+replies|them|your\s+reviews|every\s+review|each\s+review)\b|\b(?:replies|responses)\s+(?:like\s+(?:these|this|that)\s+)?in\s+your\s+(?:own\s+)?(?:voice|tone|brand\s+voice)\b|\bposts?\s+on\s+your\s+google\s+(?:business\s+)?profile\b|\b(?:you\s+can\s+)?approve\s+(?:any|each|every)\s+(?:of\s+them|reply|response)\b/i;
const R79_OFFER = /\bno\s+(?:cost|charge)\b[^.\n]{0,40}\bno\s+(?:credit\s+)?card\b|\bno\s+(?:credit\s+)?card\b[^.\n]{0,40}\bno\s+contract\b|\b(?:free|no\s+cost|no\s+charge)\s+for\s+(?:\d+|thirty|sixty|ninety)\s+days\b|\b(?:\d+|thirty|sixty|ninety)\s+days\s+(?:free|at\s+no\s+(?:cost|charge)|on\s+us|without\s+charge)\b|\bdesign\s+partners?\b|\b(?:beta|founding|pilot|launch)\s+(?:partners?|customers?|users?)\b|\bfree\s+trial\b/i;
const R79_DISCLAIM = /\bbusiness\s+(?:note|inquiry|message|proposal|email),?\s+not\s+a\s+(?:service\s+)?(?:request|lead|inquiry|job)\b|\bnot\s+a\s+(?:service|customer|job|roofing|repair)\s+(?:request|inquiry)\b/i;
const R79_CTA = /https?:\/\/\S+[?&](?:f|ref|src|source|utm_source)=\S*w?form\b|\breply\s+["“'‘]?(?:yes|interested|partner)\b/i;

function isReviewReplyPitch(t, sellsSearch) {
  if (sellsSearch) return false;
  const s = stripIdentity(t);
  if (!R79_REVIEW.test(s) || !R79_REPLY.test(s)) return false;
  const unanswered = R79_UNANSWERED.test(s);
  const vendor = R79_VENDOR.test(s);
  if (!unanswered && !vendor) return false;
  const n = [unanswered, vendor, R79_OFFER.test(s), R79_DISCLAIM.test(s), R79_CTA.test(s)].filter(Boolean).length;
  return n >= 3;
}

// --- 80. "Article about your business" statement bait ------------------------
// 19-23 Nov 2026, pinnaclesalesandmail.com, yakmanagement.com and
// topratedgutters.com, "Neil Fox", neilfox@northfoxdigital.com, +1 (978)
// 355-7611: "Hi, my name is Neil Fox. I write about interesting small
// businesses, and I am working on an article about Top Rated Gutters. I was
// thinking of focusing on your business and what makes it stand out. Would you
// like to provide a sentence or two as a statement to add to the article? And
// would you also like me to send you a link to the published article once it
// goes live on northfoxdigital.com? ... Neil Fox / North Fox Digital".
// The "feature" is the hook for a paid placement or link pitch later.
// FEATURE_STRONG (the template lines "I write about interesting small
// businesses", "focusing on your business and what makes ...") + STATEMENT ("a sentence or two",
// "a statement to add to the article") + LIVE ("send you a link to the published
// article", "once it goes live on <site>") blocks outright. With no press word
// (reporter, newspaper, magazine, editor ...), FEATURE_STRONG plus either one
// blocks, and the weaker FEATURE ("working on an article about your business",
// "what makes you stand out", which real reporters also write) needs both.
// Ungated. Delivered: a newspaper reporter doing a local-business
// feature who asks for a quote and promises the link, a student writing about
// the company for class, a customer praising what makes the business stand
// out, a client asking us to add their published article to the site.
const R80_FEATURE_STRONG = /\bI\s+(?:write|blog|post)\s+about\s+(?:interesting|unique|inspiring|outstanding|great|amazing|standout|innovative|successful)\s+(?:small\s+|local\s+|family[-\s]owned\s+)?(?:businesses|companies|brands|business\s+owners)\b|\bfocus(?:ing)?\s+on\s+your\s+(?:business|company|practice|firm|shop)\s+and\s+what\s+makes\b/i;
const R80_FEATURE = /\b(?:working\s+on|writing|putting\s+together|preparing)\s+(?:an?\s+)?(?:article|feature|piece|story|blog\s+post|write-?up|spotlight)\s+(?:about|on|featuring)\s+your\s+(?:business|company|practice|firm|shop|team)\b|\bwhat\s+makes\s+(?:it|you|your\s+(?:business|company|practice|firm|shop|team))\s+stand\s+out\b/i;
const R80_STATEMENT = /\b(?:sentence|line|quote|comment)\s+or\s+two\b|\b(?:provide|share|send|give|offer)\s+(?:me\s+|us\s+)?(?:an?\s+)?(?:short\s+|brief\s+|quick\s+)?(?:statement|quote|comment|blurb)\s+(?:to\s+(?:add|include)|for\s+(?:the|my|our)\s+(?:article|piece|feature|post|story))\b|\bstatement\s+to\s+(?:add\s+to|include\s+in)\s+the\s+(?:article|piece|feature|post|story)\b/i;
const R80_LIVE = /\b(?:send|share|email|forward)\s+you\s+(?:a|the)\s+link\s+(?:to\s+)?(?:the\s+)?(?:published\s+|finished\s+|final\s+|live\s+)?(?:article|piece|feature|post|story)\b|\bonce\s+it\s+(?:goes\s+live|is\s+(?:live|published|posted)|['’]s\s+(?:live|published))\s+on\b|\bgoes\s+live\s+on\s+[\w.-]+\.(?:com|net|org|io|co|blog|news)\b/i;
const R80_PRESS = /\b(?:reporter|journalist|correspondent|editor|newsroom|newspaper|magazine|gazette|herald|tribune|journal|radio|television|tv\s+station|news\s+desk)\b/i;

function isBusinessArticleBait(t) {
  const s = stripIdentity(t);
  const strong = R80_FEATURE_STRONG.test(s);
  if (!strong && !R80_FEATURE.test(s)) return false;
  const statement = R80_STATEMENT.test(s);
  const live = R80_LIVE.test(s);
  if (strong && statement && live) return true;
  if (R80_PRESS.test(s)) return false;
  return strong ? statement || live : statement && live;
}

function isBlockedText(t, opts) {
  if (!t) return false;
  if (isHumanTypesPitch(t)) return true;
  if (isBookkeepingFirmPitch(t)) return true;
  if (isAiChatWidgetPitch(t)) return true;
  if (isAiVideoToolPitch(t)) return true;
  if (isJobTrackerPitch(t)) return true;
  if (isSiteRebuildPitch(t)) return true;
  if (isPricedSeoOffer(t, !!(opts && (opts.allowSearchMarketingPitch || opts.allowSeoPitch)))) return true;
  if (isAiScanFollowup(t, !!(opts && (opts.allowSearchMarketingPitch || opts.allowSeoPitch)))) return true;
  if (isAiAnswerCheckPitch(t, !!(opts && (opts.allowSearchMarketingPitch || opts.allowSeoPitch)))) return true;
  if (isReviewReplyPitch(t, !!(opts && (opts.allowSearchMarketingPitch || opts.allowSeoPitch)))) return true;
  if (isBusinessArticleBait(t)) return true;
  if (isTopOfSearchPitch(t, !!(opts && (opts.allowSearchMarketingPitch || opts.allowSeoPitch)))) return true;
  if (isHomepageVersionOffer(t)) return true;
  if (isBuiltSiteTease(t)) return true;
  if (isDataLicensingPitch(t)) return true;
  if (isRobotVideoPayPitch(t)) return true;
  if (isPricedVideoPitch(t)) return true;
  if (isSiteRefreshPitch(t)) return true;
  if (isSpeedToLeadPitch(t)) return true;
  if (isDesignIssuesTease(t)) return true;
  if (isDottedGmailNonsense(t)) return true;
  if (isNameFieldLink(t)) return true;
  if (isCasinoPromo(t)) return true;
  if (isBusinessFundingPitch(t)) return true;
  if (isBookedJobsPitch(t)) return true;
  if (isFollowupNudgePitch(t, !!(opts && (opts.allowSearchMarketingPitch || opts.allowSeoPitch)))) return true;
  if (isSiteListPitch(t, !!(opts && (opts.allowSearchMarketingPitch || opts.allowSeoPitch)))) return true;
  if (isOptOutTextPitch(t)) return true;
  if (isColdEmailFooterPitch(t)) return true;
  if (isReviewSellerPitch(t)) return true;
  if (isOptOutFooterPitch(t)) return true;
  if (isAdGrantsPitch(t)) return true;
  if (isBettingPromo(t)) return true;
  if (isDeepfakeLure(t)) return true;
  if (isCommercialCleaningPitch(t)) return true;
  if (isLifetimeDealPitch(t)) return true;
  if (isTrackingTokenSpam(t)) return true;
  if (isTypedHtmlLink(t)) return true;
  if (isGeneratedNameRussianContact(t)) return true;
  if (isCamelNameRussianContact(t)) return true;
  if (isRussianSiteLink(t)) return true;
  if (isEastAsianTextLink(t)) return true;
  if (isAdultContentSpam(t)) return true;
  if (isIntimateLureLink(t)) return true;
  if (isAdultLinkSpam(t)) return true;
  if (isCryptoGiveaway(t)) return true;
  if (isBreachExtortion(t)) return true;
  if (isSaasResellerPitch(t)) return true;
  if (isWikipediaPagePitch(t)) return true;
  if (isCamelNameRuPhoneLink(t)) return true;
  if (isPressPlacementPitch(t)) return true;
  if (isReplicaGoodsPitch(t)) return true;
  if (isFranchiseDevPitch(t)) return true;
  if (isPayPerLeadIntro(t)) return true;
  if (isNeedServiceOffer(t)) return true;
  if (isDailyVisitorsPitch(t)) return true;
  if (isSpecialVehicleBlast(t)) return true;
  if (isNamedSender(t)) return true;
  if (isUnpaidPlacementLeverage(t)) return true;
  // Checked ABOVE the guest-post exemption: `allowGuestPostPitch` exists for a
  // site that SELLS placements, which has nothing to do with fraud. Letting
  // these fall through would silently disable them on any endpoint that opted
  // out of rule 2.
  if (isAdvanceFeeFraud(t)) return true;
  if (opts && opts.netTermsFraud && isNetTermsFraud(t)) return true;
  if (!(opts && opts.allowFreelancePitch) && isFreelancePitch(t)) return true;
  if (isVendorPitch(t)) return true;
  if (isEstimatingServicePitch(t)) return true;
  if (isVaStaffingPitch(t)) return true;
  if (isB2bColdPitch(t)) return true;
  if (isPaidFeaturePitch(t)) return true;
  if (!(opts && opts.allowAcquisitionPitch) && isAcquisitionPitch(t)) return true;
  const sellsSearch = !!(opts && (opts.allowSearchMarketingPitch || opts.allowSeoPitch));
  if (!sellsSearch && (isSeoSolicitation(t, opts) || isLeadGenPitch(t) || isSpecWebsitePitch(t) || isSpecAiAgentPitch(t) || isSiteFeedbackTease(t) || isMarketingTease(t))) return true;
  if (opts && opts.allowGuestPostPitch) return false;
  if (isMentionPlacementPitch(t, sellsSearch)) return true;
  return isGuestPostPitch(t) || isContentContributionPitch(t) || (!sellsSearch && isLinkOffer(t));
}

// Mutates an outgoing Mailgun body in place; returns true if it was blocked.
// Accepts either URLSearchParams or FormData -- both expose get/set/delete, and
// different handlers in this estate use one or the other.
//
// Wrapped in try/catch on purpose: a bug in the blocklist must never be able to
// stop a real lead from being delivered.
// --- Held, not emailed (2 Oct 2026) ------------------------------------------
// Spam and blocked submissions used to reach the review inbox one email at a
// time. Now a message bound ONLY for the review inbox whose subject is tagged
// [SPAM] / [SPAM?] / [Possible spam] / [Flagged] / [BLOCKED] is handed to Mailgun
// in test mode: accepted and logged under the tag "held-spam", delivered to
// nobody. One fleet-wide report reads that tag back across every Mailgun domain
// each evening, so a real lead caught by mistake can still be forwarded.
// A clean lead is never touched: it is not addressed to the review inbox alone,
// or its subject carries no tag. HOLD_REVIEW_MAIL=0 restores per-message emails.
const HELD_TAG = /^\s*\[(?:spam|blocked|possible spam|flagged)\b[^\]]*\]/i;
function holdForReport(body) {
  try {
    if (process.env.HOLD_REVIEW_MAIL === '0') return false;
    const inbox = [REVIEW_INBOX().toLowerCase(), 'hello@eseospace.com'];
    const to = String(body.get('to') == null ? '' : body.get('to'))
      .split(',').map((a) => a.trim().toLowerCase().replace(/^.*<([^>]+)>$/, '$1')).filter(Boolean);
    if (!to.length || !to.every((a) => inbox.includes(a))) return false;
    if (!HELD_TAG.test(String(body.get('subject') == null ? '' : body.get('subject')))) return false;
    body.set('o:testmode', 'yes');
    body.set('o:tag', 'held-spam');
    body.delete('bcc');
    body.delete('cc');
    return true;
  } catch {
    return false;
  }
}

function applyBlockedSenders(body, opts) {
  try {
    if (!body || typeof body.get !== 'function') return false;
    holdForReport(body);
    const hay = ['subject', 'text', 'html', 'h:Reply-To']
      .map((k) => String(body.get(k) == null ? '' : body.get(k)))
      .join('\n');
    if (!isBlockedText(hay, opts)) return false;
    body.set('to', REVIEW_INBOX());
    body.delete('bcc');
    body.delete('cc');
    const s = String(body.get('subject') == null ? '' : body.get('subject')) || '(no subject)';
    if (!/^\[BLOCKED\]/.test(s)) body.set('subject', '[BLOCKED] ' + s);
    holdForReport(body);
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

export { applyBlockedSenders, isGeneratedNameRussianContact, isCamelNameRussianContact, applyBlockedSendersToMessage, isBlockedText, isGuestPostPitch, isContentContributionPitch, isUnpaidPlacementLeverage, isFreelancePitch, isSearchMarketingPitch, isSeoSolicitation, isLeadGenPitch, isSpecWebsitePitch, isSpecAiAgentPitch, isVendorPitch, isVaStaffingPitch, isSiteFeedbackTease, isEstimatingServicePitch, isMarketingTease, isB2bColdPitch, isPaidFeaturePitch, isLinkOffer, isAdultLinkSpam, isRobotVideoPayPitch, isColdEmailFooterPitch, isReviewSellerPitch, isEastAsianTextLink, isOptOutFooterPitch, isAdGrantsPitch, isBettingPromo, isDeepfakeLure, isCommercialCleaningPitch, isBookedJobsPitch, isBuiltSiteTease, isMentionPlacementPitch, isDottedGmailNonsense, isNameFieldLink, isCasinoPromo, isBusinessFundingPitch, isSiteRefreshPitch, isSpeedToLeadPitch, isDesignIssuesTease, isPricedVideoPitch, isDataLicensingPitch, isHomepageVersionOffer, isTopOfSearchPitch, isAiScanFollowup, isAiAnswerCheckPitch, isHumanTypesPitch, isBookkeepingFirmPitch, isAiChatWidgetPitch, isAiVideoToolPitch, isJobTrackerPitch, isSiteRebuildPitch, isPricedSeoOffer, isFollowupNudgePitch, isSiteListPitch, isOptOutTextPitch, isLifetimeDealPitch, isSiteErrorTease, isTrackingTokenSpam, isAcquisitionPitch, isAiVisibilityTease, isIntimateLureLink, isAdvanceFeeFraud, isNetTermsFraud, REVIEW_INBOX as reviewInbox };
