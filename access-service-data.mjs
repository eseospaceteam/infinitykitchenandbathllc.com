/**
 * The four accessibility services crossed with each city in week 4.
 *
 * ADA figures below are from the 2010 ADA Standards for Accessible Design and
 * were verified against ADA.gov / the U.S. Access Board on 12 Aug 2026:
 *   §404.2.3  doorways, 32" minimum clear width
 *   §609.4    grab bars, 33"-36" above the finished floor
 *   §304.3.1  turning space, 60" diameter circle
 * The standard governs public accommodations, not private homes — every page
 * says so rather than implying a homeowner is legally bound by it.
 */

export const ACCESS_SERVICES = {
  "walk-in-showers": {
    label: "Walk-In Showers",
    short: "walk-in shower",
    parent: "walk-in-showers.html",
    parentLabel: "Walk-In Showers",
    hero: "https://www.infinitykitchenandbathllc.com/wp-content/uploads/2026/06/bathroom-remodel-marble-walk-in-shower-opt.jpg",
    lede: (city) =>
      `Low-threshold and curbless walk-in showers for ${city} homes — built with grab-bar blocking, proper slope, and a bench where it earns its space.`,
    quick: (city) =>
      `Infinity Kitchens and Baths builds walk-in showers throughout ${city}, AZ. Most replace an original tub-shower combination inside the same footprint. We set blocking in the walls for grab bars whether or not you want them mounted today, slope the pan correctly, and finish with a handheld on a slide bar plus a fixed head.`,
    body: [
      {
        h: (city) => `What a walk-in shower actually changes in a ${city} home`,
        p: [
          "A walk-in shower is not simply a shower without a door. The thing that makes it usable is the entry: how high you have to lift a foot to get in, and whether there is anything to hold while you do it. A 6-inch curb and a 1/2-inch curb are the same shower on a spec sheet and completely different rooms in practice.",
          "So the first decision is threshold height. A low-threshold pan keeps the floor build-up modest and works in most homes. A truly curbless entry means the shower floor and the bathroom floor meet flush, which requires either recessing the framing or raising the rest of the floor — more work, more cost, and the right answer if a wheelchair or walker has to roll in.",
          "The second decision is what the walls can carry. Standard drywall will not hold a grab bar under load. We install solid blocking behind the tile during framing, at the heights the ADA standard uses for public facilities, so a bar can be mounted properly on the day it is needed rather than surface-screwed into tile in a hurry.",
        ],
      },
      {
        h: () => "Slope, drains and the part that fails when it is rushed",
        p: [
          "Water leaves a shower because the floor is built to send it somewhere. A pan that is flat, or sloped toward the wrong corner, will pond — and a pan that ponds in a curbless shower puts water on your bathroom floor rather than in the drain.",
          "This is the single most consequential part of the job and the one that is invisible once tile is down. Linear drains along one wall make consistent slope easier to achieve on a large or curbless shower, because the floor only has to fall in one direction rather than four. Centre drains are perfectly good in a conventional pan. Either way the waterproofing behind the tile — not the tile — is what keeps water in the room.",
        ],
      },
    ],
    faq: (city) => [
      {
        q: `How long does a walk-in shower installation take in ${city}?`,
        a: `Most single-bathroom conversions run one to two weeks of on-site work once materials are staged, with the demolition and rough-in at the front and tile and glass at the end. If the drain has to move or the floor has to be recessed for a curbless entry, plan for longer. We give you a written schedule before anything is torn out.`,
      },
      {
        q: "Do I have to give up my bathtub?",
        a: "Not necessarily, and it is worth thinking about rather than defaulting. If it is the only tub in the house, removing it can matter to some buyers later. If there is another tub elsewhere, or nobody in the household bathes in one, the space is almost always better spent on a larger shower. We will tell you which situation you are in and let you decide.",
      },
      {
        q: "Can grab bars be added later?",
        a: "Only properly if the wall was built for them. We install blocking behind the tile as standard on these projects, at the heights the 2010 ADA Standards specify for grab bars (33-36 inches above the finished floor, §609.4), so a bar can be mounted into solid material years later. Retrofitting into a tiled wall with no blocking is possible but never as good.",
      },
    ],
  },

  "tub-to-shower": {
    label: "Tub-to-Shower Conversion",
    short: "tub-to-shower conversion",
    parent: "tub-to-shower.html",
    parentLabel: "Tub-to-Shower Conversion",
    hero: "https://www.infinitykitchenandbathllc.com/wp-content/uploads/2025/03/bathroom-remodeling-2.jpg",
    lede: (city) =>
      `Converting an original tub-shower combination into a proper walk-in shower for ${city} homeowners — same footprint, far easier to use.`,
    quick: (city) =>
      `Infinity Kitchens and Baths converts tubs to walk-in showers throughout ${city}, AZ. The usual job replaces a builder tub-shower combination inside the existing alcove, which keeps plumbing moves small. We reframe the alcove, set a new pan, waterproof, add blocking for grab bars, and tile.`,
    body: [
      {
        h: (city) => `Why the alcove makes this the cleanest job in a ${city} bathroom`,
        p: [
          "The standard tub alcove is a fixed opening with plumbing already at one end. Taking the tub out and putting a shower in the same opening means the supply and the drain stay broadly where they are, and nothing structural moves. That is why this conversion is usually the most cost-effective accessibility improvement available in an older bathroom — it buys a large change in usability for a comparatively small change in the building.",
          "The work is still real. The drain has to be reset for a shower pan rather than a tub waste, the alcove walls get stripped back and reframed where blocking is needed, and the whole assembly is waterproofed before tile. A conversion that skips the waterproofing step looks identical on day one and fails quietly behind the tile.",
        ],
      },
      {
        h: () => "The honest resale question",
        p: [
          "You will hear that removing your only bathtub hurts resale. It is not a myth, but it is usually overstated and it depends entirely on who buys the house next. A family with small children genuinely wants a tub. A buyer looking at an age-restricted or single-storey home very often does not, and a well-built walk-in shower reads as an upgrade rather than a loss.",
          "Our position is simple: if this is the only bathing fixture in the house, we will say so plainly before you commit, and if there is a second bathroom we will usually suggest keeping a tub in one of them. We would rather have that conversation now than have you discover the trade-off at listing.",
        ],
      },
    ],
    faq: (city) => [
      {
        q: `What does a tub-to-shower conversion involve in a ${city} home?`,
        a: "Removing the tub and its surround, resetting the drain for a shower pan, reframing the alcove and adding blocking for grab bars, waterproofing the whole assembly, then tiling and fitting the door or panel. Because it stays inside the existing alcove, plumbing moves are usually minimal.",
      },
      {
        q: "Will the shower be bigger than the tub it replaces?",
        a: "In footprint, no — a standard alcove is a standard alcove. In usable space, yes, noticeably, because you are no longer stepping over a 15-inch wall and the whole area becomes floor you can stand on. If you want genuinely more room, that means taking in adjacent space and is a different scope.",
      },
      {
        q: "Can you keep the tub in one bathroom and convert another?",
        a: "That is usually what we recommend in a two-bathroom house. Convert the one that is used daily, leave a tub in the secondary bathroom, and the house keeps both options. We will walk both rooms during the free in-home consultation and tell you which we would convert.",
      },
    ],
  },

  "ada-bathroom": {
    label: "ADA Bathroom Remodeling",
    short: "ADA bathroom remodel",
    parent: "ada-bathroom-remodeling.html",
    parentLabel: "ADA Bathroom Remodeling",
    hero: "https://www.infinitykitchenandbathllc.com/wp-content/uploads/2026/06/marble-bathroom-remodel-ada-grab-bars.jpg",
    lede: (city) =>
      `Accessible bathrooms for ${city} homes, designed to the ADA dimensions that actually matter in a house — clearances, blocking, and reach.`,
    quick: (city) =>
      `Infinity Kitchens and Baths builds accessible bathrooms throughout ${city}, AZ. A private home is not legally required to meet the ADA standard, which governs public accommodations — but its dimensions are the best-tested guidance available, so we design to them where the room allows and tell you plainly where it does not.`,
    body: [
      {
        h: () => "What the ADA standard actually says, and where it applies",
        p: [
          "The 2010 ADA Standards for Accessible Design govern public accommodations and commercial facilities. Your house is neither. No inspector will hold a private bathroom to them, and any contractor implying your home must comply is selling something.",
          "That said, the figures in the standard come from testing how people using walkers and wheelchairs actually move, which makes them the most useful design targets available. The three that drive a residential bathroom are a 60-inch diameter turning space (§304.3.1), a 32-inch minimum clear doorway width (§404.2.3), and grab bars mounted 33 to 36 inches above the finished floor (§609.4).",
          "In a house those are targets, not gospel. Plenty of existing bathrooms cannot produce a 60-inch turning circle without taking space from a bedroom, and a T-shaped turning space or a carefully placed door swing often solves the same problem. What we will not do is quietly design a room that misses every one of them and call it accessible.",
        ],
      },
      {
        h: (city) => `Designing to those numbers in a real ${city} bathroom`,
        p: [
          "The doorway is usually the first constraint and the most overlooked. A 24-inch or 28-inch door is common in older houses and will not pass a walker comfortably. Widening it, or swapping a swing door for a pocket or barn-style slider, often does more for day-to-day usability than anything inside the room.",
          "After that it is clear floor space in front of each fixture, a comfort-height toilet, a lavatory you can get close to, and lighting that removes shadow rather than adding fittings. Blocking goes in the walls at bar height throughout, whether or not bars are mounted now.",
        ],
      },
    ],
    faq: (city) => [
      {
        q: `Does my ${city} home have to meet ADA requirements?`,
        a: "No. The 2010 ADA Standards apply to public accommodations and commercial facilities, not to private residences. We design to the standard's dimensions because they are well-tested guidance, not because your house is bound by them.",
      },
      {
        q: "What are the key ADA bathroom dimensions?",
        a: "The three that matter most in a home are a 60-inch diameter turning space (§304.3.1), a 32-inch minimum clear width at doorways (§404.2.3), and grab bars set 33 to 36 inches above the finished floor (§609.4). We will tell you which of these your room can hit and which it cannot.",
      },
      {
        q: "What if my bathroom is too small to meet them?",
        a: "Most existing bathrooms are, and that is a normal starting point rather than a failure. We prioritise: doorway clear width first, then a curbless or low-threshold entry, then blocking and reach. A room that hits three of those is dramatically more usable than one that hits none while waiting for a full rebuild.",
      },
    ],
  },

  "aging-in-place": {
    label: "Aging in Place Remodeling",
    short: "aging-in-place remodel",
    parent: "aging-in-place.html",
    parentLabel: "Aging in Place",
    hero: "https://www.infinitykitchenandbathllc.com/wp-content/uploads/2024/11/luxury-bathroom-remodeling.jpg",
    lede: (city) =>
      `Whole-home changes that let ${city} homeowners stay put — bathrooms first, then thresholds, lighting, and the kitchen.`,
    quick: (city) =>
      `Infinity Kitchens and Baths does aging-in-place remodeling throughout ${city}, AZ. The work is sequenced rather than done all at once: the bathroom carries the most risk and gets addressed first, then thresholds and lighting, then kitchen reach and storage.`,
    body: [
      {
        h: () => "Sequence matters more than scope",
        p: [
          "Almost nobody does an aging-in-place remodel in one go, and almost nobody should. The useful question is not what the house eventually needs but what to do first, because the risk is not evenly distributed.",
          "The bathroom is first, every time. It is the wettest room, the one with the highest step, and the one most falls happen in. A low-threshold or curbless shower with blocking in the walls addresses more real risk than any other single change.",
          "Second is everything underfoot outside the bathroom: threshold strips between flooring types, a step down into a sunken living room, poor lighting on a hallway. These are cheap to fix and disproportionately dangerous to leave.",
          "Third is the kitchen, where the issue is usually reach rather than safety — deep base cabinets you have to kneel to use, wall cabinets you cannot get to, and a single ceiling fixture that leaves the counter in shadow. Pull-out shelving, lever hardware and layered lighting solve most of it without moving a cabinet box.",
        ],
      },
      {
        h: () => "Building for a need you do not have yet",
        p: [
          "The cheapest accessibility work is the work done while a wall is already open. If you are remodelling a bathroom now for ordinary reasons, adding blocking behind the tile costs very little and means a grab bar can be mounted correctly in ten years without touching the tile.",
          "The same logic applies to doorway widths during any framing work, to choosing a comfort-height toilet when you were replacing one anyway, and to running the extra circuit for better lighting while the ceiling is open. None of these require you to believe you will need them soon. They only require not closing the wall without thinking about it.",
        ],
      },
    ],
    faq: (city) => [
      {
        q: `Where should a ${city} homeowner start with aging in place?`,
        a: "The bathroom, essentially always. It carries the most fall risk and the highest step in the house. A low-threshold or curbless shower with proper blocking in the walls addresses more real risk than any other single change you can make.",
      },
      {
        q: "Do I have to do the whole house at once?",
        a: "No, and we would generally advise against it. This work sequences well — bathroom first, then thresholds and lighting, then kitchen reach and storage. Doing it in stages spreads the cost and lets you live with each change before deciding on the next.",
      },
      {
        q: "Will it make my home look institutional?",
        a: "Not if it is designed rather than bolted on. Blocking is invisible. A curbless shower reads as contemporary, not medical. Grab bars are now made in the same finishes as your other fittings. The visible difference between a well-built accessible bathroom and a well-built ordinary one is small.",
      },
    ],
  },
};

export const PRESCOTT = {
  name: "Prescott",
  incorporated: true,
  authority: "the City of Prescott's Community Development Department",
  authorityShort: "City of Prescott Building Permits",
  authorityUrl: "https://prescott-az.gov/permit-center/permit-categories/building-permits/",
  permitNote:
    "Prescott's Building Safety Division inside Community Development handles plan review, permits and inspections, working from the 2024 International Residential Code and the city's own amendments. The department is at 201 N Montezuma Street and can be reached on 928-777-1371. Prescott also runs a Fast Track programme offering same-day issuance for qualifying projects submitted complete and in person.",
  era: "Prescott's housing runs from Victorian-era homes on and around the courthouse square through mid-century ranches to recent construction in Prescott Lakes and Yavapai Hills.",
  eraImplication:
    "That range is wider than anywhere else we work. A downtown home may have knob-and-tube remnants, plaster walls and no insulation; a Yavapai Hills house built in the last twenty years needs none of that addressed. We survey before quoting rather than assuming.",
  localNote: "Prescott is home — our shop and showroom are here.",
  phone: "928-800-1998",
  telHref: "9288001998",
};
