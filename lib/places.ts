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
  yearsInBusiness?: string;
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

async function searchPlaces(query: string, apiKey: string): Promise<string[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("type", "establishment");

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const data = await res.json();
  if (data.status !== "OK") return [];
  return (data.results || []).map((r: { place_id: string }) => r.place_id);
}

type PlaceDetails = {
  name?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  formatted_address?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
};

async function getPlaceDetails(placeId: string, apiKey: string): Promise<PlaceDetails | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,formatted_phone_number,international_phone_number,formatted_address,website,rating,user_ratings_total,business_status");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== "OK") return null;
  return data.result;
}

function parseLocation(address: string): { city: string; state: string } {
  const parts = address.split(",").map((p) => p.trim());
  const state = parts.length >= 2 ? parts[parts.length - 2]?.split(" ")[0] ?? "" : "";
  const city = parts.length >= 3 ? parts[parts.length - 3] ?? "" : "";
  return { city, state };
}

export async function fetchLeads(
  seenIds: string[],
  apiKey: string,
  generateSummary: (business: Omit<BusinessLead, "summary">) => Promise<string>
): Promise<BusinessLead[]> {
  const leads: BusinessLead[] = [];
  const seen = new Set(seenIds);
  const candidates: { placeId: string; type: { query: string; label: string }; location: { city: string; state: string } }[] = [];

  const shuffledCities = shuffle(EAST_COAST_CITIES);
  const shuffledTypes = shuffle(BUSINESS_TYPES);

  // Build a pool of candidate place IDs across shuffled city+type combos
  for (const location of shuffledCities.slice(0, 12)) {
    for (const type of shuffledTypes.slice(0, 5)) {
      const query = `${type.query} in ${location.city} ${location.state}`;
      const ids = await searchPlaces(query, apiKey);
      for (const id of ids) {
        if (!seen.has(id)) {
          candidates.push({ placeId: id, type, location });
        }
      }
      if (candidates.length >= 120) break;
    }
    if (candidates.length >= 120) break;
  }

  const shuffledCandidates = shuffle(candidates);

  for (const candidate of shuffledCandidates) {
    if (leads.length >= 20) break;
    if (seen.has(candidate.placeId)) continue;

    const details = await getPlaceDetails(candidate.placeId, apiKey);
    if (!details) continue;
    if (details.business_status && details.business_status !== "OPERATIONAL") continue;

    // Must NOT have a website
    if (details.website) continue;

    // Must have a phone number
    const phone = details.formatted_phone_number || details.international_phone_number;
    if (!phone) continue;

    const address = details.formatted_address || "";
    const loc = parseLocation(address);

    const base: Omit<BusinessLead, "summary"> = {
      placeId: candidate.placeId,
      name: details.name || "Unknown",
      phone,
      address,
      city: loc.city || candidate.location.city,
      state: loc.state || candidate.location.state,
      category: candidate.type.label,
      rating: details.rating ?? null,
      reviewCount: details.user_ratings_total ?? null,
    };

    const summary = await generateSummary(base);

    leads.push({ ...base, summary });
    seen.add(candidate.placeId);
  }

  return leads;
}
