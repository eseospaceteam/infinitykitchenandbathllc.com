/**
 * Cohort-specific body copy for the accessibility service x city pages.
 *
 * The first build shared one pair of service sections across all 9 cities, which
 * left 63-67% of every page byte-identical to its 8 siblings. Splitting by
 * housing cohort means the service explanation is written against the stock it
 * will actually be installed in.
 *
 *   age-restricted  Sun City (1960-78), Sun City West (1978-97)
 *   newer-tract     Buckeye, Goodyear, Surprise — largely post-1995
 *   older-mixed     Avondale, Glendale, Peoria, Prescott — wide era spread
 */

export const COHORT_OF = {
  "sun-city": "age-restricted",
  "sun-city-west": "age-restricted",
  buckeye: "newer-tract",
  goodyear: "newer-tract",
  surprise: "newer-tract",
  avondale: "older-mixed",
  glendale: "older-mixed",
  peoria: "older-mixed",
  prescott: "older-mixed",
};

export const COHORT_BODIES = {
  "walk-in-showers": {
    "age-restricted": [
      {
        h: (c) => `Why ${c} bathrooms fight a walk-in shower`,
        p: [
          "The bathrooms in these homes were drawn for a buyer in their fifties who had just retired, in a decade when nobody designed for the decades after. The result is a very consistent room: a tub-shower combination as the only bathing option, a vanity at a height chosen before comfort height existed, a door cut narrow because the hallway was tight, and not one stud bay with blocking in it.",
          "That consistency is genuinely useful to us. We have taken enough of these apart to know what is behind the tile before we open it, which means the estimate you get is closer to the invoice you get. It also means the job has a known shape: the tub comes out, the alcove gets reframed with blocking, the pan gets set with real slope, and the entry drops to something you step over rather than climb.",
          "The step is the whole point. A standard tub wall is around fifteen inches. Getting a leg over that while wet, on a surface with nothing to hold, is the single most dangerous thing most residents do each day. Replacing it with a half-inch threshold and a bar you can grab is not a luxury remodel — it is the difference between a bathroom you can use alone and one you cannot.",
        ],
      },
      {
        h: () => "Curbless, and when it is worth the extra work",
        p: [
          "A low-threshold pan solves most of the problem for most people. A fully curbless entry — where the shower floor and the bathroom floor meet dead flush — solves all of it, and is the right answer if a walker or a wheelchair has to roll in rather than step in.",
          "It costs more because the floor has to give way. In a slab-on-grade house, which is nearly all of them here, that means either recessing the pan into the slab or building the rest of the bathroom floor up to meet it. Neither is exotic, both take time, and any contractor who quotes curbless at the same price as low-threshold has not thought about your slab.",
          "Our advice is unsentimental: if nobody in the household uses a wheeled aid today and the house has a second bathroom, low-threshold is usually the better value. If a wheelchair is already in the picture, or a progressive diagnosis makes it likely, do it once and do it curbless.",
        ],
      },
    ],
    "newer-tract": [
      {
        h: (c) => `Most ${c} homes already have a shower — that changes the job`,
        p: [
          "This is not a rescue. Houses built here since the late nineties almost always came with a separate shower in the primary bathroom, usually a one-piece fibreglass or acrylic surround with a curb around four to six inches and a framed glass door on a track.",
          "So the brief is different from an older neighbourhood. Nothing is failing. What you have is a shower that works and is quietly hostile to anyone with a hip, a knee, or a balance problem: a curb to clear, a narrow opening between glass panels, a moulded soap dish where a grab bar should be, and walls that will not hold one because there is nothing behind them but a plastic shell and a stud bay.",
          "Taking that out and building a tiled walk-in in the same opening is a clean, predictable job. The plumbing is where you want it, the framing is square and modern, and the drain is already set for a shower rather than a tub. Most of the cost is the tile and glass you choose, not the surprises.",
        ],
      },
      {
        h: () => "Slab-on-grade, and what it means for a curbless entry",
        p: [
          "The constraint out here is the slab. These homes sit directly on concrete with no crawlspace, so the drain is cast into it. Moving that drain means cutting and patching concrete, which is entirely doable and entirely worth avoiding if the design does not require it.",
          "The practical consequence is that a curbless entry needs planning rather than enthusiasm. If the existing drain is where the new shower wants it, a recessed pan is straightforward. If the layout is changing, the concrete work should be priced honestly up front rather than discovered as a change order in week two.",
          "This is also the reason we push people to decide on curbless before demolition rather than during it. In a slab house it is a framing and concrete decision, not a finish decision, and it cannot be added cheaply once the pan is set.",
        ],
      },
    ],
    "older-mixed": [
      {
        h: (c) => `In ${c}, the survey matters more than the quote`,
        p: [
          "This is the cohort where two houses on the same street can need completely different jobs. A walk-in shower in a home built in the last twenty years is a finish exercise. The same shower in a mid-century house can involve galvanised supply lines that have narrowed to a straw, a drain that was never vented properly, and a bathroom that has already been remodelled once by somebody who did not pull a permit.",
          "So the number that matters is not the price per square foot. It is what somebody found when they actually looked. We open an access panel, run the water, and check the panel before quoting, and we will tell you if the honest answer is that the plumbing should be addressed while the wall is open rather than tiled over.",
          "That conversation is unwelcome and it is cheaper now than later. Tiling a beautiful walk-in shower over a supply line that has ten years left in it is a decision you make once.",
        ],
      },
      {
        h: () => "Working around what a previous remodel left behind",
        p: [
          "Older housing stock has usually been touched before, and the quality of that work is the biggest single unknown. We routinely find shower pans with no slope, waterproofing that is a sheet of plastic stapled to studs, and blocking that somebody added in the wrong place at the wrong height.",
          "None of that is a reason to panic and all of it is a reason to look. Where a previous remodel was done well we keep what works and build on it. Where it was not, we take it back to framing, because a walk-in shower is only as good as the layer nobody can see.",
          "Where the framing allows, we set blocking at grab-bar height across the full wet wall rather than at two points, so a bar can go where it turns out to be needed rather than where we guessed.",
        ],
      },
    ],
  },

  "tub-to-shower": {
    "age-restricted": [
      {
        h: (c) => `The conversion ${c} homes were waiting for`,
        p: [
          "Almost every original bathroom in these communities has the same alcove: a five-foot tub with a shower head over it, tiled or surrounded to about six feet, with the plumbing at one end. It is the single most convertible fixture in American housing, and in a community where the median resident is well past the age of climbing into a bath, it is also the single most useful thing to change.",
          "Because the alcove is a fixed opening with the supply and waste already at one end, the conversion stays small. The drain is reset for a shower pan, the walls come back to framing so blocking can go in, the assembly is waterproofed, and it is tiled. Nothing structural moves and no wall comes out.",
          "That is why this is the conversion we recommend first to almost everyone here. It buys the largest change in daily usability per dollar of any accessibility work available in these houses.",
        ],
      },
      {
        h: () => "The resale question is genuinely different in a 55+ community",
        p: [
          "The standard warning — never remove your only bathtub, it hurts resale — is written for family housing. It transfers badly to an age-restricted community, where the next buyer is by definition also over fifty-five and is very often looking for exactly the shower you just built.",
          "We are not going to tell you it makes no difference. If your home has one bathroom and one tub, removing it narrows your buyer pool slightly, and you should know that before you commit rather than at listing. But in these communities a well-built walk-in shower reads as a completed upgrade rather than a missing fixture, and a dated tub-shower combination reads as a project the buyer has to take on.",
          "Where a home has two bathrooms we will usually suggest converting the one that gets used daily and leaving the second alone. That keeps both options in the house and costs you nothing in flexibility.",
        ],
      },
    ],
    "newer-tract": [
      {
        h: (c) => `In ${c} this is usually the secondary bathroom`,
        p: [
          "Homes built here in the last twenty-five years typically have a separate shower in the primary suite already, and the tub-shower combination lives in the hall or guest bathroom. So the conversion question is different: you are rarely giving up your only bath, and you are rarely fixing something broken.",
          "What you are usually doing is making the second bathroom genuinely usable by a parent who has moved in, a guest who cannot manage a tub wall, or yourself in ten years. That reframes the job from renovation to preparation, and it is a much easier decision when the primary tub stays exactly where it is.",
          "The work itself is straightforward in newer framing. Square studs, modern rough-in, a drain already set correctly, and no surprises behind the surround beyond the occasional bit of builder-grade shortcutting.",
        ],
      },
      {
        h: () => "Builder tubs come out easily — that is not always good news",
        p: [
          "The tubs in these houses are usually lightweight acrylic or fibreglass units, sometimes moulded together with the surround as a single piece. They come out fast, which is genuinely convenient and occasionally hides a problem: a one-piece unit is often installed before the walls are finished, so removing it can take more of the surrounding drywall than you expect.",
          "Budget for that rather than being surprised by it. A conversion in a newer home is usually cleaner than one in an older house, but the demolition footprint can be wider, and the tile has to land somewhere sensible where the old unit's flange used to be.",
          "The upside is that once it is out, everything behind it is generally sound. We are adding blocking and waterproofing to good framing rather than repairing bad framing first.",
        ],
      },
    ],
    "older-mixed": [
      {
        h: (c) => `Cast iron, and what it means for a ${c} conversion`,
        p: [
          "In older housing the tub is often cast iron, and a five-foot cast iron tub weighs enough that removing it whole is frequently impossible through a standard doorway. The usual answer is to break it up in place, which is loud, messy, and requires protecting everything between the bathroom and the door.",
          "That is a real line item and an honest contractor will say so. It is not a reason to avoid the conversion — it is a reason the conversion in a 1960s house costs more than the identical conversion in a 2005 house, and a quote that prices them the same has not looked at your tub.",
          "What you get in exchange is usually a better wall to build on. Older framing is often full-dimension lumber, and once the tub is gone there is real material to fasten blocking to.",
        ],
      },
      {
        h: () => "The plumbing behind an older alcove",
        p: [
          "The other variable is what the supply and waste are made of. Galvanised supply that has been in the wall for decades narrows from the inside, and you often only discover how badly when the new shower runs at half the pressure the old tub did.",
          "Because the wall is already open for the conversion, this is the cheapest moment in the life of the house to address it. We will tell you what we find and what we would do, and we will not quietly tile over a problem to keep a number down.",
          "Venting is the same story. Older bathrooms were sometimes vented in ways that no longer meet code, and a conversion that changes the drain is exactly the point at which an inspector will look at it.",
        ],
      },
    ],
  },

  "ada-bathroom": {
    "age-restricted": [
      {
        h: (c) => `${c} was built before any of these dimensions existed`,
        p: [
          "The original plans here predate the ADA by three decades. Nothing in these bathrooms was drawn against a clearance standard, and it shows in a very specific way: the doors. A 24-inch or 28-inch bathroom door is common in this stock, and a walker will not pass one comfortably regardless of what you do inside the room.",
          "That makes the doorway the first and highest-value change, ahead of anything else on the list. Widening it to meet the 32-inch clear width the standard specifies (§404.2.3), or replacing a swing door with a pocket or barn-style slider that gives back the floor the swing was eating, changes daily usability more than a new vanity ever will.",
          "Inside the room, the 60-inch turning circle (§304.3.1) is the target that these floor plans most often cannot hit without taking space from a bedroom or a hall closet. That is worth knowing early rather than discovering at design. A T-shaped turning space, or simply a door that no longer swings inward, solves the same practical problem in a room that cannot give up the square footage.",
        ],
      },
      {
        h: () => "Designing for the resident who lives here now",
        p: [
          "The advantage of working in an age-restricted community is that we are not designing for a hypothetical future occupant. The person who will use this bathroom is standing in it during the consultation, and the design can be built around their actual reach, their actual grip, and which side they lead with.",
          "That is why we ask questions that feel oddly specific — which hand you would grab with, whether you sit to dress, whether a shower chair is already in the house. Grab bars mounted 33 to 36 inches above the floor (§609.4) is where the standard puts them; where they go horizontally is a question about you, not about code.",
          "We put blocking across the full wet wall regardless, so the bar can move later without opening tile.",
        ],
      },
    ],
    "newer-tract": [
      {
        h: (c) => `${c} homes start closer to the standard than you would think`,
        p: [
          "Houses built here in the last twenty-five years were drawn well after the ADA existed, and while a private home is never held to it, the influence shows. Hallways tend to be wider, primary bathroom doors are frequently already 32 inches or close to it, and floor plans are more open than anything from the 1960s.",
          "So the gap is usually narrower and more specific: the shower has a curb, the walls have no blocking, and the fixtures sit at heights chosen for looks rather than reach. Those three things are fixable without moving a wall, which makes accessible design in newer stock substantially cheaper than in older stock.",
          "It is worth measuring rather than assuming. We check the actual clear width of the door with the door open ninety degrees, which is how the standard measures it, and it is often an inch or two less than the nominal size suggests.",
        ],
      },
      {
        h: () => "What to fix when the bones are already good",
        p: [
          "When the room is dimensionally sound, the work concentrates on the wet area and on reach. Take out the curb, set a low-threshold or curbless pan, block the walls properly, move to a comfort-height toilet, and choose a vanity you can get close to rather than one with a deep cabinet you have to lean over.",
          "Lighting is the underrated one. A single ceiling fixture puts your own shadow exactly where you are trying to see, and adding light at the mirror and in the shower does more for a person with declining vision than another handrail would.",
          "None of this reads as medical when it is designed rather than retrofitted, which matters if you are doing it years before you need it.",
        ],
      },
    ],
    "older-mixed": [
      {
        h: (c) => `${c} bathrooms vary more than any spec can cover`,
        p: [
          "This is the cohort where the standard is most useful as a target and least useful as a promise. A bathroom in a recently built home may already meet most of the dimensions. A bathroom in a house from the 1950s may have a 24-inch door, a room barely five feet wide, and a window exactly where a grab bar wants to go.",
          "So we survey before we design. Clear door width measured with the door open, actual floor dimensions rather than plan dimensions, and where the framing and the plumbing actually are. Then we tell you which of the three key figures — the 60-inch turning space (§304.3.1), the 32-inch clear doorway (§404.2.3), the 33-to-36-inch grab bar height (§609.4) — your room can hit and which it cannot.",
          "A room that hits two of three honestly is worth more than a room marketed as accessible that hits none.",
        ],
      },
      {
        h: () => "When taking space from next door is the right answer",
        p: [
          "In older houses the bathroom is frequently too small to become genuinely accessible on its own footprint, and the only real fix is to borrow space from an adjacent closet, hallway or bedroom.",
          "That is a bigger job with structural and permit implications, and it is not always worth it. But it is the honest option in a room that cannot otherwise take a wheelchair, and we would rather put it on the table than sell you a series of improvements that never quite add up to the outcome you wanted.",
          "Where the house has more than one bathroom, converting the better-proportioned one is usually cheaper and better than forcing the primary.",
        ],
      },
    ],
  },

  "aging-in-place": {
    "age-restricted": [
      {
        h: (c) => `You already made the hard decision by moving to ${c}`,
        p: [
          "The biggest aging-in-place choice most people face is whether the house they are in can be the house they stay in — single storey, no sunken rooms, a manageable lot, neighbours nearby. Residents here made that decision when they bought. What is left is the interior, and that is a much more tractable problem.",
          "So the work is sequencing rather than strategy. The bathroom first, because it holds the most risk in the least space. Then the transitions underfoot elsewhere in the house. Then the kitchen, where the issue is reach rather than danger.",
          "Very few people do all of it at once and very few should. Each stage is worth living with before deciding on the next, and spreading it out spreads the cost.",
        ],
      },
      {
        h: () => "The things that are cheap here and expensive later",
        p: [
          "The cheapest accessibility work is the work done while a wall is already open. If a bathroom is being remodelled for ordinary reasons — the tile is dated, the vanity is tired — the marginal cost of adding blocking behind the new tile is close to nothing, and it means a grab bar can be mounted properly a decade later without touching a single tile.",
          "The same logic covers doorway width during any framing work, a comfort-height toilet when one is being replaced anyway, and the extra lighting circuit while a ceiling is open. None of that requires believing you will need it soon.",
          "What it requires is not closing the wall without thinking. That is the entire discipline, and it is the difference between a house that adapts and a house that has to be renovated again.",
        ],
      },
    ],
    "newer-tract": [
      {
        h: (c) => `Doing this early in ${c} is the right time`,
        p: [
          "The households we work with out here are often twenty years away from needing any of it. They are remodelling a bathroom because it is builder-grade and dated, and the aging-in-place question comes up as a sensible afterthought rather than a pressing need.",
          "That is the ideal moment. Every accessibility decision is cheaper as an addition to work you were already doing than as a project of its own, and none of it has to be visible. Blocking is invisible. A curbless shower reads as contemporary design. A comfort-height toilet is now what most people buy anyway.",
          "Doing it now also means you choose it rather than a situation choosing it for you, which in our experience produces a better-looking room.",
        ],
      },
      {
        h: () => "Single storey is a real advantage — protect it",
        p: [
          "A great deal of newer housing in this area is single storey, which removes the hardest aging-in-place problem before it starts. The things that undermine that advantage are small and easy to fix: a step down into a living room, a threshold strip between tile and carpet that catches a toe, a garage entry with two steps and no rail.",
          "None of these are remodels. They are an afternoon each, and they address more real fall risk than most of what gets marketed as accessibility work.",
          "If you are planning a larger project, it is worth walking the whole house with us once rather than only the room being remodelled. The cheap fixes usually turn up in the hallway, not the bathroom.",
        ],
      },
    ],
    "older-mixed": [
      {
        h: (c) => `In ${c} the first question is whether this house is the one`,
        p: [
          "Older and mixed housing raises a question newer stock does not: is this the house to age in at all? A two-storey home with the only full bathroom upstairs, or a hillside lot with a flight of steps to the door, may not be worth adapting no matter how well the work is done.",
          "We will say so. It is a strange thing for a remodeling contractor to talk somebody out of a project, but a stair lift and a downstairs conversion in the wrong house costs more than moving and delivers less.",
          "Where the house is right — single storey, or a workable ground floor with a bathroom that can be converted — then the sequence is the same as anywhere: bathroom first, then thresholds and lighting, then kitchen reach.",
        ],
      },
      {
        h: () => "Older houses hide both problems and opportunities",
        p: [
          "The variance cuts both ways. A mid-century house may have narrow doors and dated plumbing, and it may also have full-dimension framing, generous hallways and a floor plan that adapts far better than a 1990s house built to a tight plan.",
          "So we survey rather than assume. Which walls are load bearing, where the plumbing actually runs, whether the panel has capacity for the lighting and the exhaust you will want.",
          "The answer occasionally is that the best accessible bathroom in the house is not the one you were planning to remodel, and that a smaller, better-proportioned room converts more cheaply and works better than forcing the primary suite.",
        ],
      },
    ],
  },
};
