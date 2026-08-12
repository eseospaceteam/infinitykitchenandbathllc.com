/**
 * Verified per-city facts for the 8 West Valley pages.
 *
 * SOURCING RULE: every claim here was checked against the authority's own site
 * (searched 12 Aug 2026) or against the community's own history page. Nothing in
 * this file is copied from the planning document. Do NOT add fee amounts, review
 * timelines or percentages unless you have pulled them from the primary source
 * and dated them — those change, and a stale number on a live page is worse than
 * no number. Qualitative statements about housing stock are deliberately
 * qualitative for the same reason.
 */

export const CITIES = {
  avondale: {
    name: "Avondale",
    incorporated: true,
    authority: "the City of Avondale's Building Services Division",
    authorityShort: "City of Avondale Building Services",
    authorityUrl:
      "https://avondaleaz.gov/government/departments/development-services/building-division/",
    permitNote:
      "Avondale runs Building Services as a division of its own Development Services department, so plan review, permit issuance and inspections all sit with the city. Nothing routes through Maricopa County.",
    era: "Avondale's housing runs the full span — older neighbourhoods near Historic Avondale and Western Avenue alongside large tracts put up during the 1990s and 2000s growth along the I-10 corridor.",
    eraImplication:
      "That mix matters more than it sounds. A 1970s or 1980s house here usually needs the whole system reworked — supply lines, venting and circuits — while a 2000s tract home is typically sound behind the walls and the work is genuinely cosmetic. We price those two situations very differently, and we tell you which one you have before you sign anything.",
    localNote:
      "We hold an Avondale location at 316 N Central Ave, which is what makes this our closest West Valley market.",
  },
  buckeye: {
    name: "Buckeye",
    incorporated: true,
    authority: "the City of Buckeye's Development Services department",
    authorityShort: "City of Buckeye Development Services",
    authorityUrl: "https://www.buckeyeaz.gov/business/development-services/permit-center",
    permitNote:
      "Buckeye handles zoning, building and permitting through Development Services, with a Permit Center that takes residential applications directly. Because Buckeye covers an unusually large land area, confirm early which of its planning areas your address falls in — it affects who reviews the file.",
    era: "Buckeye is one of the newest housing markets in the West Valley. The large master-planned communities — Verrado, Tartesso, Sundance and the newer Festival and Watson Road developments — went up largely from the 2000s onward.",
    eraImplication:
      "Newer stock changes what a remodel actually is. In a house fifteen or twenty years old you are rarely fixing failures; you are replacing builder-grade finishes that have dated — laminate counters, oak or thermofoil cabinet fronts, a builder mirror and a fibreglass tub surround. The structure and the rough-in are usually fine, which keeps the work predictable and the surprises few.",
    localNote:
      "Buckeye is the furthest of the eight cities from our Avondale location, so we schedule it in blocks rather than dropping in.",
  },
  glendale: {
    name: "Glendale",
    incorporated: true,
    authority: "Glendale's Building Safety, Codes & Services group",
    authorityShort: "Glendale Building Safety, Codes & Services",
    authorityUrl:
      "https://www.glendaleaz.gov/Work/Building-Safety-Codes-Services/Building-Permits",
    permitNote:
      "Glendale issues a specific residential addition and remodel permit covering remodels, room additions, patio enclosures, carport-to-garage conversions and detached structures. Construction documents go to the Development Services Center and are reviewed electronically.",
    era: "Glendale has the deepest housing history of the eight. Neighbourhoods near downtown and Catlin Court date to the early twentieth century, mid-century tracts fill the central city, and the Arrowhead area north of the 101 is largely 1990s and 2000s.",
    eraImplication:
      "The practical consequence is that Glendale is the city where we most often open a wall and find something we have to solve — cast-iron drain lines, undersized panels, a bathroom that was reworked once already without a permit. We plan for that in older Glendale homes rather than discovering it on day three.",
    localNote:
      "Glendale sits on the eastern edge of the area we cover from Avondale.",
  },
  goodyear: {
    name: "Goodyear",
    incorporated: true,
    authority: "the City of Goodyear's Development Services department",
    authorityShort: "City of Goodyear Development Services",
    authorityUrl:
      "https://www.goodyearaz.gov/government/departments/engineering-development-services/development-services",
    permitNote:
      "Goodyear splits the work across Planning & Zoning, Building Safety, Permitting, Civil Plan Review and Code Compliance inside one Development Services department, and publishes homeowner-specific permit guidance separately from its contractor material.",
    era: "Goodyear's growth is concentrated in the communities that built out from the late 1990s onward — Palm Valley, Estrella, PebbleCreek and the corridors either side of Estrella Parkway — with a smaller older core near the original townsite.",
    eraImplication:
      "PebbleCreek and Estrella in particular bring a specific brief: homes that are twenty to thirty years old, well built, and finished to the taste of the era they were sold in. Nothing is broken. What owners want is the arched-niche, travertine-and-oak palette taken out and something current put in, usually without moving a single wall.",
    localNote:
      "Goodyear is immediately west of our Avondale location and one of the easiest of the eight for us to serve.",
  },
  peoria: {
    name: "Peoria",
    incorporated: true,
    authority: "the City of Peoria's Development Services department",
    authorityShort: "City of Peoria Development Services",
    authorityUrl:
      "https://www.peoriaaz.gov/business/development-services/plan-review-and-permits",
    permitNote:
      "Peoria runs a Development Services Center that handles permits, plan review, inspections and code lookups in one place, with an online portal for applications, plan submittal, inspection scheduling and payment. The department can be reached on (623) 773-7225.",
    era: "Peoria stretches a long way north, and its housing gets newer as it goes. The older southern neighbourhoods near Old Town date to the mid-century; the Arrowhead area is largely 1990s; Vistancia and the far north are 2000s and later.",
    eraImplication:
      "So a Peoria address tells us less than it does elsewhere — the same city name covers a 1960s ranch and a house built after 2010. We confirm the build era before quoting, because it is the single biggest driver of what a bathroom or kitchen actually costs here.",
    localNote:
      "Peoria is a north-eastern run for us and gets grouped with Glendale and Surprise work.",
  },
  surprise: {
    name: "Surprise",
    incorporated: true,
    authority: "the City of Surprise",
    authorityShort: "City of Surprise permits",
    authorityUrl: "https://surpriseaz.gov/permits-applications",
    permitNote:
      "Surprise requires a permit for improvement projects from homeowners and contractors alike, applied for through the city's permits and applications process.",
    era: "Surprise grew fast from the late 1990s onward. Marley Park, the Original Town Site and the Sun City Grand area sit alongside a large stock of tract housing built through the 2000s.",
    eraImplication:
      "Sun City Grand deserves separate mention: it is an age-restricted Del Webb community inside Surprise, so those homes carry the same accessibility brief as our Sun City work — grab-bar blocking, curbless entries, comfort-height fixtures — while sitting under city rather than county permitting.",
    localNote:
      "Surprise is a northern run, usually scheduled alongside Sun City and Sun City West.",
  },
  "sun-city": {
    name: "Sun City",
    incorporated: false,
    authority: "Maricopa County Planning & Development",
    authorityShort: "Maricopa County Planning & Development",
    authorityUrl: "https://www.maricopa.gov/6003/Maricopa-Countys-Permit-Center",
    permitNote:
      "This is the detail most contractors get wrong. Sun City is not a city — it is an unincorporated community, so there is no municipal building department. Residential permits are issued by Maricopa County Planning & Development through the county Permit Center, reachable on 602-506-3301. Separately, the Sun City Fire and Medical District issues permits and inspects for fire and life safety within the district.",
    community: {
      body: "Recreation Centers of Sun City (RCSC)",
      bodyUrl: "https://suncityaz.org/",
      note: "Sun City opened on 1 January 1960 as Del Webb's first large-scale active adult community, and property here carries membership in Recreation Centers of Sun City. Check RCSC's current requirements and your own deed restrictions before work begins — anything affecting the exterior is the usual trigger, and an interior kitchen or bathroom remodel normally is not, but confirming costs nothing and assuming can cost weeks.",
    },
    era: "Sun City's homes were built between 1960 and the late 1970s, which makes the oldest of them well over sixty years old.",
    eraImplication:
      "That single fact drives everything we do here. Original bathrooms in Sun City were built to 1960s expectations: a tub-shower combination as the only bathing option, a 30-inch vanity at a height that suited a thirty-year-old, doorways cut narrow, and no blocking in the walls for anything to be mounted to later. Kitchens carry the same signature — shallow wall cabinets, deep unlit base cabinets you have to kneel to reach into, and a single ceiling fixture. None of that is a defect. It is simply a house designed for a different stage of life than the one its owner is now in, which is why so much of our Sun City work is accessibility work wearing a remodel's clothes.",
    localNote:
      "Sun City is a northern run for us, scheduled alongside Sun City West and Surprise.",
    accessibility: true,
  },
  "sun-city-west": {
    name: "Sun City West",
    incorporated: false,
    authority: "Maricopa County Planning & Development",
    authorityShort: "Maricopa County Planning & Development",
    authorityUrl: "https://www.maricopa.gov/6003/Maricopa-Countys-Permit-Center",
    permitNote:
      "Like its older neighbour, Sun City West is unincorporated — there is no city hall to pull a permit from. Residential permits come from Maricopa County Planning & Development via the county Permit Center on 602-506-3301, and the Sun City Fire and Medical District covers fire and life-safety review in the district.",
    community: {
      body: "Recreation Centers of Sun City West",
      bodyUrl: "https://suncitywest.com/",
      note: "Sun City West was built by the Del Webb Corporation from 1978 onward, roughly two and a half miles west of the original Sun City, and runs to about 16,900 homes. Property carries membership in Recreation Centers of Sun City West. As in Sun City, confirm the current rules and your deed restrictions before work starts rather than after.",
    },
    era: "Sun City West was developed from 1978 through the 1990s, so its homes are newer than Sun City's — typically thirty to forty-five years old rather than sixty-plus.",
    eraImplication:
      "That extra two decades changes the job. Sun City West bathrooms usually have a separate shower already, wider hallways, and rough-in that meets more modern expectations. What they do not have is anything designed for ageing in place: the showers have curbs, the walls have no blocking for grab bars, and the fixtures sit at heights chosen in the 1980s. The work here is less often a gut and more often a targeted conversion — take out the curb, add the blocking, raise the fixtures, keep the footprint.",
    localNote:
      "Sun City West sits at the northern end of our West Valley route, grouped with Sun City and Surprise.",
    accessibility: true,
  },
};

export const SERVICE = {
  kitchen: {
    label: "Kitchen",
    slug: "kitchen-remodeling",
    trades:
      "Kitchen work usually pulls in electrical and, where there is a gas range, gas — plus plumbing if the sink or dishwasher moves. Circuits for countertop receptacles, dedicated appliance runs and range ventilation are the parts that most often need review.",
    scopeNote:
      "Cabinet and countertop replacement inside the existing footprint is the lightest version of the job. The moment a wall opens up, an island gains a sink, or the panel needs work, the scope and the review both grow.",
  },
  bathroom: {
    label: "Bathroom",
    slug: "bathroom-remodeling",
    trades:
      "Bathroom work is plumbing-led — supply, drain, vent — with electrical for lighting, exhaust and GFCI protection. Shower pans, waterproofing and drain relocation are the parts that carry the most consequence if they are done casually.",
    scopeNote:
      "A like-for-like fixture swap is the lightest version. Converting a tub to a walk-in shower, moving a drain, or taking out a curb is a different job: it changes waterproofing, floor build-up and often the framing.",
  },
};

export const SOURCES_NOTE =
  "Permit authorities were confirmed against each jurisdiction's own site in August 2026. Requirements change — treat these as the right place to start, not as a substitute for asking. We pull permits for our own work.";
