export type BusinessLead = {
  placeId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  category: string;
  rating: number | null;
  reviewCount: number | null;
  summary: string;
};

const EAST_COAST_CITIES = [
  { city: "Portland", state: "ME" },
  { city: "Manchester", state: "NH" },
  { city: "Burlington", state: "VT" },
  { city: "Worcester", state: "MA" },
  { city: "Springfield", state: "MA" },
  { city: "Providence", state: "RI" },
  { city: "Bridgeport", state: "CT" },
  { city: "New Haven", state: "CT" },
  { city: "Albany", state: "NY" },
  { city: "Syracuse", state: "NY" },
  { city: "Buffalo", state: "NY" },
  { city: "Yonkers", state: "NY" },
  { city: "Newark", state: "NJ" },
  { city: "Trenton", state: "NJ" },
  { city: "Camden", state: "NJ" },
  { city: "Philadelphia", state: "PA" },
  { city: "Allentown", state: "PA" },
  { city: "Scranton", state: "PA" },
  { city: "Wilmington", state: "DE" },
  { city: "Baltimore", state: "MD" },
  { city: "Annapolis", state: "MD" },
  { city: "Frederick", state: "MD" },
  { city: "Virginia Beach", state: "VA" },
  { city: "Norfolk", state: "VA" },
  { city: "Richmond", state: "VA" },
  { city: "Roanoke", state: "VA" },
  { city: "Wilmington", state: "NC" },
  { city: "Fayetteville", state: "NC" },
  { city: "Durham", state: "NC" },
  { city: "Greensboro", state: "NC" },
  { city: "Charleston", state: "SC" },
  { city: "Columbia", state: "SC" },
  { city: "Myrtle Beach", state: "SC" },
  { city: "Savannah", state: "GA" },
  { city: "Augusta", state: "GA" },
  { city: "Jacksonville", state: "FL" },
  { city: "Daytona Beach", state: "FL" },
  { city: "Fort Lauderdale", state: "FL" },
  { city: "West Palm Beach", state: "FL" },
];

const BUSINESS_TYPES = [
  { query: "plumber", label: "Plumbing" },
  { query: "electrician", label: "Electrical" },
  { query: "barber shop", label: "Barber Shop" },
  { query: "hair salon", label: "Hair Salon" },
  { query: "auto mechanic", label: "Auto Repair" },
  { query: "handyman", label: "Handyman" },
  { query: "landscaping", label: "Landscaping" },
  { query: "painter contractor", label: "Painting" },
  { query: "roofing contractor", label: "Roofing" },
  { query: "HVAC contractor", label: "HVAC" },
  { query: "locksmith", label: "Locksmith" },
  { query: "pest control", label: "Pest Control" },
  { query: "carpet cleaning", label: "Carpet Cleaning" },
  { query: "pressure washing", label: "Pressure Washing" },
  { query: "flooring contractor", label: "Flooring" },
  { query: "tile contractor", label: "Tile & Masonry" },
  { query: "fence contractor", label: "Fencing" },
  { query: "pool service", label: "Pool Service" },
  { query: "towing service", label: "Towing" },
  { query: "cleaning service", label: "Cleaning Service" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type NewPlaceResult = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
};

async function searchAndFetchPlaces(
  query: string,
  apiKey: string
): Promise<NewPlaceResult[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.websiteUri",
        "places.rating",
        "places.userRatingCount",
        "places.businessStatus",
      ].join(","),
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 20 }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.places || [];
}

function parseLocation(address: string): { city: string; state: string } {
  const parts = address.split(",").map((p) => p.trim());
  const stateZip = parts.length >= 2 ? parts[parts.length - 2] : "";
  const state = stateZip.split(" ")[0] ?? "";
  const city = parts.length >= 3 ? parts[parts.length - 3] ?? "" : "";
  return { city, state };
}

// Directory/social sites that are NOT a real business website
const DIRECTORY_DOMAINS = [
  "yelp.com", "facebook.com", "instagram.com", "google.com",
  "yellowpages.com", "bbb.org", "angi.com", "thumbtack.com",
  "homeadvisor.com", "houzz.com", "nextdoor.com", "linkedin.com",
  "twitter.com", "tiktok.com", "mapquest.com", "tripadvisor.com",
];

function isDirectorySite(url: string): boolean {
  return DIRECTORY_DOMAINS.some((d) => url.includes(d));
}

// Uses Serper.dev to Google the business and check if they have a real website.
// Returns true if a real website is found (i.e., skip this business).
async function hasWebsiteViaSearch(
  name: string,
  city: string,
  state: string,
  serperKey: string
): Promise<boolean> {
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": serperKey,
      },
      body: JSON.stringify({ q: `"${name}" ${city} ${state}`, num: 5 }),
    });
    if (!res.ok) return false;
    const data = await res.json();

    // Check knowledge graph website
    if (data.knowledgeGraph?.website) {
      const site = data.knowledgeGraph.website;
      if (!isDirectorySite(site)) return true;
    }

    // Check organic results for a dedicated business site
    for (const result of data.organic || []) {
      const link: string = result.link || "";
      if (!isDirectorySite(link)) {
        // If the result title or snippet strongly matches the business name, it's their site
        const title: string = (result.title || "").toLowerCase();
        const nameLower = name.toLowerCase().split(" ")[0];
        if (nameLower.length > 3 && title.includes(nameLower)) {
          return true;
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

export async function fetchLeads(
  seenIds: string[],
  apiKey: string,
  serperKey: string | null,
  generateSummary: (business: Omit<BusinessLead, "summary">) => Promise<string>
): Promise<BusinessLead[]> {
  const leads: BusinessLead[] = [];
  const seen = new Set(seenIds);

  type Candidate = {
    place: NewPlaceResult;
    type: { query: string; label: string };
    location: { city: string; state: string };
  };
  const candidates: Candidate[] = [];

  const shuffledCities = shuffle(EAST_COAST_CITIES);
  const shuffledTypes = shuffle(BUSINESS_TYPES);

  for (const location of shuffledCities.slice(0, 12)) {
    for (const type of shuffledTypes.slice(0, 5)) {
      const query = `${type.query} in ${location.city} ${location.state}`;
      const places = await searchAndFetchPlaces(query, apiKey);
      for (const place of places) {
        if (!seen.has(place.id)) {
          candidates.push({ place, type, location });
        }
      }
      if (candidates.length >= 150) break;
    }
    if (candidates.length >= 150) break;
  }

  const shuffledCandidates = shuffle(candidates);

  for (const candidate of shuffledCandidates) {
    if (leads.length >= 20) break;
    if (seen.has(candidate.place.id)) continue;

    const p = candidate.place;

    // Must be operational
    if (p.businessStatus && p.businessStatus !== "OPERATIONAL") continue;

    // Must NOT have a website (Places API check)
    if (p.websiteUri) continue;

    // Must have a phone number
    const phone = p.nationalPhoneNumber || p.internationalPhoneNumber;
    if (!phone) continue;

    const address = p.formattedAddress || "";
    const loc = parseLocation(address);
    const city = loc.city || candidate.location.city;
    const state = loc.state || candidate.location.state;

    // Secondary check: Google the business to catch websites Places missed
    if (serperKey) {
      const foundWebsite = await hasWebsiteViaSearch(
        p.displayName?.text || "",
        city,
        state,
        serperKey
      );
      if (foundWebsite) continue;
    }

    const base: Omit<BusinessLead, "summary"> = {
      placeId: p.id,
      name: p.displayName?.text || "Unknown",
      phone,
      address,
      city,
      state,
      category: candidate.type.label,
      rating: p.rating ?? null,
      reviewCount: p.userRatingCount ?? null,
    };

    const summary = await generateSummary(base);
    leads.push({ ...base, summary });
    seen.add(p.id);
  }

  return leads;
}
