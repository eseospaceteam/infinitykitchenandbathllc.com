/**
 * Third body section + cohort-specific FAQs, added after the first cohort pass
 * left pages at ~1,000 words with ~39% still shared across the 9 cities.
 *
 * Everything here varies by (service, cohort), so it reduces the shared
 * proportion and adds length at the same time. The only text that should still
 * be identical site-wide is genuine boilerplate: the sources list, the ADA
 * scope disclaimer, and the permit/ROC lines.
 */

export const THIRD_SECTION = {
  "walk-in-showers": {
    "age-restricted": {
      h: () => "Glass, doors, and the trade nobody mentions",
      p: [
        "A doorless walk-in — the kind with a fixed glass panel and an open entry — is easier to get into, easier to clean, and has nothing to pull open with wet hands. It is almost always what we recommend in these homes. The trade is that it needs a longer shower to keep water off the bathroom floor, because there is no door holding the spray in.",
        "In a standard five-foot alcove that usually works with the head aimed away from the opening and a slight extra fall on the pan. In a shorter run it may not, and the honest answer is a low-profile door rather than a wet floor every morning.",
        "If a door is needed, we specify a swing panel over a slider. Sliding doors run on a bottom track that traps grime, needs scrubbing, and becomes one more thing to manage. Frameless swing panels cost a little more and stay usable for far longer.",
      ],
    },
    "newer-tract": {
      h: () => "What you gain over the builder's shower",
      p: [
        "It is worth being concrete about what changes, because the fibreglass unit you have now is not broken and replacing it can feel like an indulgence.",
        "You gain a flat or near-flat entry instead of a four-to-six-inch curb. You gain walls that will actually hold a grab bar, at any point, at any time. You gain a floor with real slope to a real drain rather than a moulded pan with a shallow fall. And you gain a surface that can be cleaned properly — a one-piece surround develops a chalky film in hard water that no product fully removes, whereas sealed tile and glass do not.",
        "You also lose something: the one-piece unit is genuinely watertight in a way a tiled shower only is if it was built correctly. That is the whole argument for who does the work. A tiled walk-in built by somebody who treats waterproofing as a formality is worse than the fibreglass box you started with.",
      ],
    },
    "older-mixed": {
      h: () => "Hard water, and what it does to the choices",
      p: [
        "Water across this region is hard, and it changes which finishes are worth specifying. Clear glass shows every mineral spot within days. Polished chrome shows them almost as fast. Neither is wrong, but both commit somebody to a squeegee.",
        "In an older home where the residents are the ones cleaning it, we tend to specify treated or lightly textured glass, brushed rather than polished metal, and larger-format tile with fewer grout lines. It is a small set of decisions that decides whether the shower still looks good in five years or merely still works.",
        "Grout choice matters here too. Where a home has hard water and an owner who would rather not scrub, we will usually recommend a higher-performance grout and fewer joints, and we will tell you plainly that no grout is maintenance-free regardless of what the box says.",
      ],
    },
  },

  "tub-to-shower": {
    "age-restricted": {
      h: () => "Living in the house while the only bathroom is out",
      p: [
        "In a two-bathroom home this is a non-issue. In a single-bathroom home — and plenty here are — it is the thing that decides whether the project is tolerable.",
        "We sequence single-bathroom conversions tightly for exactly this reason: demolition, rough-in and inspection compressed into the front of the schedule, with the toilet back in service at the end of most days rather than at the end of the job. Where it cannot be, we say so in advance and in writing, so you can arrange to stay with family for the specific nights involved rather than discovering it mid-week.",
        "What we will not do is start a single-bathroom conversion without the materials on site. Waiting on a back-ordered pan with your only bathroom in pieces is the worst version of this project, and it is entirely avoidable by ordering first and starting second.",
      ],
    },
    "newer-tract": {
      h: () => "Matching the conversion to the rest of the house",
      p: [
        "Because this is usually the secondary bathroom in a house whose primary suite was finished to a consistent builder palette, the design question is whether to match it or deliberately not.",
        "Matching keeps the house coherent and is the safer resale choice. Deliberately not matching lets you put the better shower in the room that will actually be used for accessibility, and it is often what people want once they realise the guest bathroom is about to become the good one.",
        "There is no wrong answer, but it is worth deciding on purpose rather than defaulting to whatever the primary has. We will bring samples that do both.",
      ],
    },
    "older-mixed": {
      h: () => "Asbestos, lead, and the tests worth doing first",
      p: [
        "In housing built before the late 1970s, two things are worth checking before demolition rather than during it: asbestos in sheet flooring, mastic or joint compound, and lead in older paint layers.",
        "Neither is common in every house and neither is a reason to abandon a project. Both are a reason not to have a crew put a reciprocating saw through a wall on the assumption it will be fine. Testing is inexpensive relative to the cost of handling a positive result badly, and a contractor who waves the question away is telling you how they handle the things they cannot see.",
        "Where a test comes back positive, the work is done by a licensed abatement contractor before we start. That adds time and cost, and it is not optional.",
      ],
    },
  },

  "ada-bathroom": {
    "age-restricted": {
      h: () => "Fixtures, controls, and the details that decide daily use",
      p: [
        "Once the room's dimensions are settled, usability comes down to what you touch. Lever handles instead of knobs, because arthritic hands cannot grip and twist. A single-lever or thermostatic valve rather than two taps, so water temperature is one motion instead of a negotiation.",
        "Shower controls belong near the entry, not under the head. Reaching through cold water to turn it on is a small indignity that a two-minute design decision removes entirely. A handheld on a slide bar matters more than almost any other fitting: it lets you wash seated, rinse the shower down, and help somebody else if it comes to that.",
        "A fold-down seat is worth specifying even if nobody uses it now, because retrofitting one needs the same blocking a grab bar does. If the blocking is going in anyway, the marginal cost is the seat itself.",
      ],
    },
    "newer-tract": {
      h: () => "Doing it without making it look like a hospital",
      p: [
        "The objection we hear most from younger households is aesthetic, and it is a fair one. Accessibility products spent decades looking institutional, and the memory lingers.",
        "That is no longer the constraint it was. Grab bars now come in the same finishes as the rest of your fittings and several double as towel bars or shower shelves. Comfort-height toilets are simply what most people buy. A curbless shower reads as contemporary rather than clinical — it is the same detail high-end bathrooms have been using for years for reasons that have nothing to do with mobility.",
        "The parts that genuinely have no aesthetic cost are the ones inside the wall. Blocking is invisible. Door width is invisible once the trim is on. Do those regardless, and the visible decisions stay entirely yours.",
      ],
    },
    "older-mixed": {
      h: () => "When the window, the vent or the joists get in the way",
      p: [
        "Older bathrooms have a habit of putting something immovable exactly where the design wants to go. A window in the wet wall. A vent stack in the corner you wanted for a bench. Joists running the wrong direction for the drain you need.",
        "None of these are fatal and all of them are cheaper to find during design than during demolition. This is the main reason we survey behind panels and in the attic or crawlspace where one exists before producing a number for an older home.",
        "Where a window sits in the shower wall, the usual answers are a glass block infill, a properly flashed and waterproofed replacement unit rated for wet locations, or moving the shower. Which is right depends on the room, and any of them is better than tiling up to a wooden sash and hoping.",
      ],
    },
  },

  "aging-in-place": {
    "age-restricted": {
      h: () => "Who else to bring into the conversation",
      p: [
        "The best aging-in-place designs we have built came out of a conversation that included somebody other than us and the homeowner. An occupational therapist assesses how a specific person actually moves through a specific house, which is a different skill from ours and produces recommendations we would not have thought to make.",
        "Adult children are the other party, and involving them early tends to go better than presenting a finished project. The conversation about what a house needs is easier when it is about the house rather than about somebody's decline.",
        "We are happy to walk the home with a family member on speakerphone, or to put a written scope in front of somebody who lives out of state. Nothing about our process requires the person paying to be the person present.",
      ],
    },
    "newer-tract": {
      h: () => "Sequencing it around the remodels you were doing anyway",
      p: [
        "For households two decades out from needing this, the efficient path is not a dedicated project. It is a standing rule: whenever a wall is open, it closes with blocking in it.",
        "In practice that means the bathroom you were going to update this year gets its walls blocked and its door checked for clear width. The kitchen you do in three years gets pull-outs in the base cabinets rather than fixed shelves, and lighting under the wall cabinets while the circuit is accessible. Neither project costs meaningfully more, and neither looks like accessibility work.",
        "The thing this avoids is the expensive version: discovering at seventy-eight that the house needs three rooms reworked at once, under time pressure, after an event rather than before one.",
      ],
    },
    "older-mixed": {
      h: () => "Stairs, entries, and the parts that are not the bathroom",
      p: [
        "In older and mixed housing the hardest problems are frequently outside the rooms people think to remodel. A front entry with three steps and no rail. A garage step-up that is fine until it is not. A hallway that turns too tightly for a walker.",
        "Some of these have cheap answers. A second handrail, on both sides, is a genuinely large safety improvement for a small cost. Better lighting on a stair run is another. A threshold ramp at an entry costs very little and removes a daily obstacle.",
        "Others do not, and that is where the honest conversation about whether this is the right house belongs. We would rather have it at the start of a project than halfway through one.",
      ],
    },
  },
};

/** Two extra FAQs per (service, cohort), on top of the three generic ones. */
export const COHORT_FAQ = {
  "age-restricted": (svc, city) => [
    {
      q: `Do a lot of homes in ${city} have this done?`,
      a: `Yes — it is the most common remodel in these communities, because the original bathrooms were built for a stage of life most residents have moved past. That familiarity works in your favour: we know what is behind the walls in this housing stock before we open them, which makes the estimate more reliable than it would be in a mixed neighbourhood.`,
    },
    {
      q: "Can the work be scheduled around a medical recovery?",
      a: "Often, and it is worth telling us if that is the driver. A conversion done before a hip or knee replacement is far easier than one done during recovery, and the schedule can usually be pulled forward if we know why. If the timing is already tight, say so at the consultation rather than after.",
    },
  ],
  "newer-tract": (svc, city) => [
    {
      q: `Is this worth doing in a ${city} home that is only twenty years old?`,
      a: "It depends on what you want from it. Nothing in a house that age is failing, so this is not a repair. It is worth doing if the curb, the missing blocking or the fixture heights are already a problem for somebody in the household, or if you are remodelling anyway and want the accessible version rather than a like-for-like replacement.",
    },
    {
      q: "Will this look like accessibility work?",
      a: "Not unless you want it to. The parts that matter most — blocking in the walls, doorway clear width, a level entry — are either invisible or read as contemporary design. Grab bars now come in the same finishes as your other fittings. The visible choices stay yours.",
    },
  ],
  "older-mixed": (svc, city) => [
    {
      q: `What might you find behind the walls in an older ${city} home?`,
      a: "Most often: supply lines that have narrowed with age, venting that no longer meets current code, blocking that is absent or in the wrong place, and evidence of an earlier remodel done without a permit. We check what we can before quoting and tell you what we would address while the wall is open, rather than tiling over it.",
    },
    {
      q: "Is testing for asbestos or lead necessary?",
      a: "In housing built before the late 1970s it is worth doing before demolition rather than during. Neither is present in every home, and a positive result is manageable — it means licensed abatement before we start, which adds time and cost. It is not something to find out about by cutting into it.",
    },
  ],
};
