/**
 * Editorial body for the 8 guide category hubs.
 *
 * The first build shipped these at 186-301 body words while typing them
 * CollectionPage + Article. A 200-word intro does not earn an Article type.
 * Each hub now carries three sections of genuine category-level guidance —
 * the things that are true across the whole category and therefore belong on
 * the hub rather than in any single guide.
 *
 * Rule for anything added here: no cost figures. Costs live on the pages that
 * own them, and a hub that quotes a range can contradict the guide it links to.
 */

export const HUB_SECTIONS = {
  "cost-guides.html": [
    {
      h: "How to read a remodeling cost range",
      p: [
        "Every honest cost answer is a range, and the width of that range is information rather than evasion. A contractor who gives you a single number before seeing the room is either guessing or has decided in advance what they will leave out.",
        "What a range does not tell you is where in it you sit. That is decided by three things, roughly in order of impact: whether anything moves, what condition the systems behind the walls are in, and which material tier you choose. Layout changes and plumbing relocations move a project between ranges. Finish selections move it within one.",
        "So the useful way to read these guides is backwards. Start from the low end and ask what would have to be true for your project to land there — usually that nothing moves and the rough-in is sound. Then read the high end the same way. Your quote will explain which of those two stories your house tells.",
      ],
    },
    {
      h: "The three things that move a number most",
      p: [
        "<strong>Whether walls or plumbing move.</strong> Replacing fixtures where they already are is a different category of work from relocating a drain. In slab-on-grade housing, which is most of the Phoenix West Valley, moving a drain means cutting concrete — that is a line item, not a detail.",
        "<strong>What is behind the walls.</strong> A 1960s bathroom and a 2010 bathroom can look equally tired and cost very differently to remodel, because one may need supply lines, venting and a circuit addressed while the wall is open and the other will not. This is the single biggest source of variance between an estimate and an invoice, and it is why we survey before quoting.",
        "<strong>Material tier.</strong> This is the part homeowners think decides the budget, and it is genuinely the smallest of the three. The gap between a mid-range and a premium counter is real but it is rarely what turns a project from one range into another.",
      ],
    },
    {
      h: "Which guide to start with",
      p: [
        "If you are early and want a shape rather than a number, start with the whole-project cost guide for the room you are doing. If you already know the scope and are choosing between materials, the individual material and comparison guides will be more useful.",
        "If your question is really about affordability rather than price, the financing guide covers the options without the sales framing.",
        "And if you want a figure specific to your house rather than to the market, that is what the free in-home consultation produces — measured, written, and with the survey behind it.",
      ],
    },
  ],

  "comparison-guides.html": [
    {
      h: "Why most comparisons refuse to pick a winner",
      p: [
        "Most material comparisons you will find online end in a shrug: both are great, it depends on your needs, talk to a professional. That is technically true and practically useless, and it usually means the writer has no installation experience to draw on.",
        "These guides take a position. Where one option is genuinely better for a specific situation, we say which and why. Where the honest answer really is that it depends, we say what it depends on in terms you can check against your own house rather than leaving you with a balanced paragraph.",
      ],
    },
    {
      h: "The questions that settle most material decisions",
      p: [
        "<strong>Who is going to clean it?</strong> This decides more material choices than aesthetics do. Textured surfaces, small-format tile with many grout joints, clear glass and polished chrome all look excellent and all demand upkeep. In a region with hard water, that upkeep is not optional.",
        "<strong>How long are you staying?</strong> A five-year horizon and a twenty-year horizon justify genuinely different specifications. Trend-forward finishes are a reasonable choice if you will enjoy them and move; they are a worse choice if you will still be living with them in 2045.",
        "<strong>What is the room actually exposed to?</strong> A material that performs beautifully on a bathroom wall may be the wrong answer on a shower floor, and a counter that suits a guest bathroom may not suit a working kitchen. Comparisons that ignore the application produce confident, wrong recommendations.",
      ],
    },
    {
      h: "Where comparisons stop being useful",
      p: [
        "At some point the remaining differences are small enough that the decision is aesthetic, and reading another comparison will not resolve it. That point arrives sooner than most people expect — usually once you have narrowed to two options in the same tier.",
        "When you get there, stop reading and go handle samples in daylight. Photographs misrepresent stone and tile more than any other building material, and the difference between two quartz patterns on a screen bears little relation to the difference in a room.",
      ],
    },
  ],

  "shower-guides.html": [
    {
      h: "The part of a shower nobody can inspect",
      p: [
        "A shower is the most demanding assembly in a house. It has to shed water continuously for decades, and almost everything that determines whether it does is buried behind a surface you cannot see once the job is finished.",
        "That asymmetry is the reason showers are where corner-cutting concentrates. Tile is visible and gets attention. Waterproofing, slope and the pan beneath it are invisible and are where a bad job hides. A shower that leaks rarely does so immediately — it does so quietly, into a wall, for a year or two before anything shows.",
        "So when you read these guides, notice how much of the content is about what goes in before the tile. That is not padding. That is the part that decides whether the shower is still sound in fifteen years.",
      ],
    },
    {
      h: "Slope, waterproofing, and grout are three different things",
      p: [
        "<strong>Slope</strong> is what moves water to the drain. A flat or wrongly-sloped pan ponds, and in a curbless shower it ponds onto your bathroom floor. Linear drains make consistent slope easier on large or curbless showers because the floor only falls in one direction.",
        "<strong>Waterproofing</strong> is the membrane or coating behind the tile. It — not the tile, and not the grout — is what keeps water inside the shower. Tile is a wear surface.",
        "<strong>Grout</strong> is a filler between tiles and is not, and has never been, waterproof. Grout that needs sealing, cleaning or occasional repair is grout behaving normally. Grout blamed for a leak is usually covering for a waterproofing failure underneath.",
      ],
    },
    {
      h: "Hard water changes the specification",
      p: [
        "Water across this region is hard, and it decides which finishes stay looking good. Clear glass and polished chrome show mineral spotting within days. Larger-format tile with fewer joints, treated or lightly textured glass, and brushed rather than polished metal all age better with less work.",
        "None of that is a reason to avoid the finishes you want. It is a reason to choose them knowing who will be maintaining them and how often.",
      ],
    },
  ],

  "accessibility-guides.html": [
    {
      h: "What the ADA standard actually covers",
      p: [
        "The 2010 ADA Standards for Accessible Design govern public accommodations and commercial facilities. A private home is neither, and no inspector will hold your bathroom to them. Any contractor implying your house must comply is selling something.",
        "The figures are still the best guidance available, because they came from testing how people using walkers and wheelchairs actually move. The three that matter most in a house are a 60-inch diameter turning space (§304.3.1), a 32-inch minimum clear doorway width (§404.2.3), and grab bars mounted 33 to 36 inches above the finished floor (§609.4).",
        "In a house those are targets. Plenty of existing bathrooms cannot produce a 60-inch turning circle without taking space from a bedroom, and a T-shaped turning space or a redirected door swing often solves the same practical problem.",
      ],
    },
    {
      h: "The order that matters more than the list",
      p: [
        "Accessibility work is almost never done all at once, and the sequence matters more than the scope. The risk in a house is not evenly distributed.",
        "<strong>The bathroom is first, every time.</strong> It is the wettest room, holds the highest step, and is where most falls happen. A low-threshold or curbless shower with blocking in the walls addresses more real risk than any other single change.",
        "<strong>Then everything underfoot elsewhere:</strong> threshold strips between flooring types, a step into a sunken room, poor lighting on a hallway or stair. These are cheap and disproportionately dangerous to leave.",
        "<strong>Then the kitchen,</strong> where the issue is reach rather than danger — deep base cabinets, unreachable wall cabinets, and a single ceiling fixture leaving the counter in shadow.",
      ],
    },
    {
      h: "Build for it before you need it",
      p: [
        "The cheapest accessibility work is the work done while a wall is already open. Adding blocking behind new tile costs very little and means a grab bar can be mounted into solid material a decade later without touching the tile. Retrofitting into a tiled wall with nothing behind it is possible and never as good.",
        "The same logic covers doorway width during any framing work, a comfort-height toilet when one is being replaced anyway, and an extra lighting circuit while a ceiling is open. None of it requires believing you will need it soon — only that you do not close the wall without thinking about it.",
      ],
    },
  ],

  "kitchen-guides.html": [
    {
      h: "Kitchen decisions compound",
      p: [
        "Kitchen choices are not independent, which is why the order you make them in matters. The layout sets what cabinets are possible. The cabinets set the counter runs. The counter runs set a large part of the budget. Changing the layout late unwinds all three.",
        "So the sequence worth following is: settle how the room works before you choose anything you can see. Where the sink, the range and the refrigerator sit relative to each other decides whether the kitchen is pleasant to cook in. No finish selection rescues a bad triangle.",
      ],
    },
    {
      h: "Where the money actually goes",
      p: [
        "<strong>Cabinets are almost always the largest line.</strong> They dominate the budget in most kitchen projects, which is why the custom-versus-semi-custom-versus-stock decision has more financial weight than any other single choice.",
        "<strong>Moving plumbing or gas is the biggest hidden cost.</strong> An island that gains a sink is a different project from an island that does not. Worth deciding early, because it is expensive to add late.",
        "<strong>Electrical is the most commonly underestimated.</strong> Modern kitchens need more circuits than older houses have, and countertop receptacle requirements, dedicated appliance runs and range ventilation are the parts that most often need permit review.",
      ],
    },
    {
      h: "The upgrades people are most glad they made",
      p: [
        "Consistently, in our experience: pull-out shelving in base cabinets rather than fixed shelves, layered lighting instead of one ceiling fixture, and drawers instead of doors below the counter. None of them photograph well. All of them change daily use.",
        "Equally consistently, the regret is under-specifying storage while over-specifying a feature — a statement backsplash in a kitchen with nowhere to put the mixer.",
      ],
    },
  ],

  "bathroom-guides.html": [
    {
      h: "The smallest room with the most systems in it",
      p: [
        "A bathroom packs supply, drain, vent, electrical and mechanical ventilation into the smallest floor area in the house, usually with a wet zone in the middle of it. That density is why bathroom remodels have less tolerance for improvisation than any other room.",
        "It is also why the order of work is fixed. Demolition, then rough-in and inspection, then waterproofing, then surfaces. A schedule that promises tile before an inspection has passed is describing something other than a permitted job.",
      ],
    },
    {
      h: "Ventilation is the most ignored decision",
      p: [
        "Almost nobody chooses a bathroom for its extractor, and almost every bathroom problem that is not a leak traces back to one. Moisture that is not removed condenses, and condensation is what grows mould behind a vanity and lifts paint off a ceiling.",
        "Two things matter: that the fan is sized for the room rather than for the box it came in, and that it exhausts outside rather than into a roof space. Venting into an attic is common in older housing and simply relocates the problem to somewhere you will not notice it for years.",
      ],
    },
    {
      h: "Choosing finishes that survive a wet room",
      p: [
        "The failure modes in a bathroom are specific: standing water at the vanity, splash at the tub, steam everywhere, and hard-water mineral deposits on everything. Materials that shrug at three of those and fail at the fourth still fail.",
        "Practically that means sealed or engineered surfaces at the vanity rather than porous ones, flooring rated for wet areas rather than merely water-resistant, and a realistic view of how much cleaning the finishes you like will demand. Larger-format tile with fewer grout joints is the single easiest maintenance decision available.",
      ],
    },
  ],

  "planning-guides.html": [
    {
      h: "What actually determines how long a remodel takes",
      p: [
        "Homeowners usually assume the timeline is set by the size of the job. More often it is set by two things that have nothing to do with size: whether the materials are on site before demolition starts, and how many inspection points the scope creates.",
        "A project that begins before the pan, the tile and the vanity have arrived will stall, and it will stall with your bathroom in pieces. We order and stage first and demolish second, which occasionally makes our start date later and reliably makes our finish date sooner.",
      ],
    },
    {
      h: "Permits are not optional, and who pulls them tells you something",
      p: [
        "Any scope that moves plumbing, alters framing or adds circuits is the kind of work that gets reviewed. Which authority reviews it depends on where you live — incorporated cities run their own building departments, while unincorporated communities such as Sun City and Sun City West are permitted through Maricopa County.",
        "The more useful signal is who offers to pull it. A contractor who suggests skipping a permit on work that needs one is telling you how they handle the things you cannot verify. It also creates a real problem at resale, when unpermitted work surfaces during a disclosure.",
      ],
    },
    {
      h: "The mistakes that repeat",
      p: [
        "<strong>Deciding scope during demolition.</strong> Changes made once walls are open cost multiples of the same change made on paper. Settle the layout before anything is torn out.",
        "<strong>Choosing a contractor on price alone.</strong> The cheapest quote is frequently the one that has left something out, and the omission surfaces as a change order after you are committed.",
        "<strong>Not verifying the licence.</strong> The Arizona Registrar of Contractors publishes licence status and complaint history free. It takes two minutes and it is the highest-value check available to a homeowner.",
      ],
    },
  ],

  "choosing-a-contractor.html": [
    {
      h: "These are checklists, not rankings",
      p: [
        "Every guide in this category is written as a way to judge a contractor, not as a league table of them. We are a remodeling company; a list from us ranking our competitors would be worth exactly nothing to you, and we are not going to publish one.",
        "What we can usefully offer is the set of questions that separate a company that will finish your project well from one that will not — including the questions we would rather you asked us.",
      ],
    },
    {
      h: "The checks worth doing before anyone quotes",
      p: [
        "<strong>Verify the licence yourself.</strong> The Arizona Registrar of Contractors publishes licence status, classification and complaint history at no cost. Confirm the number is current and that the classification actually covers your work. Ours is AZ ROC #339999.",
        "<strong>Confirm insurance directly with the insurer,</strong> not from a certificate emailed to you. Certificates are easy to produce and easy to have lapsed since.",
        "<strong>Ask who is actually on site.</strong> There is a real difference between a company running its own crews and one subcontracting every trade to whoever is available that week. Neither is disqualifying; not getting a straight answer is.",
      ],
    },
    {
      h: "What a good answer sounds like",
      p: [
        "Ask what they expect to find behind your walls. A contractor who has looked will describe what is likely given the age of your house and say how they would handle it. One who has not will reassure you.",
        "Ask what is excluded from the quote. Every quote excludes something, and a company that can name its exclusions immediately has thought about them. A quote with no exclusions listed is not a more complete quote — it is a less specific one.",
        "Ask what happens if the schedule slips. The answer you want is a process, not a promise that it will not.",
      ],
    },
  ],
};
