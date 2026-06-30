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
  hours: string[] | null;
  priority: "high" | "normal";
  priorityReasons: string[];
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
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
  };
  currentOpeningHours?: {
    openNow?: boolean;
  };
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
        "places.regularOpeningHours",
        "places.currentOpeningHours",
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
  "angieslist.com", "porch.com", "bark.com", "fixr.com",
  "expertise.com", "manta.com", "superpages.com", "citysearch.com",
  "merchantcircle.com", "local.com", "mapquest.com", "whitepages.com",
  "chamberofcommerce.com", "hotfrog.com", "cylex.us",
];

function isDirectorySite(url: string): boolean {
  return DIRECTORY_DOMAINS.some((d) => url.includes(d));
}

// Phrases in search results that signal the business wants/needs a website
const NEED_WEBSITE_SIGNALS = [
  "no website", "doesn't have a website", "does not have a website",
  "looking for a website", "need a website", "needs a website",
  "want a website", "wants a website", "building a website",
  "can't find online", "cannot find online", "hard to find online",
  "not online", "no online presence", "no web presence",
  "call for info", "call for details", "call us for",
  "no site", "visit us in person", "stop by",
];

type SearchResult = {
  hasWebsite: boolean;
  intentSignals: string[]; // reasons we think they want a website
};

// Check website existence AND collect intent signals from the same search call.
async function checkViaSearch(
  name: string,
  city: string,
  state: string,
  serperKey: string
): Promise<SearchResult> {
  try {
    // Search without quotes so Google matches more flexibly
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": serperKey,
      },
      body: JSON.stringify({ q: `${name} ${city} ${state}`, num: 10 }),
    });
    if (!res.ok) return { hasWebsite: true, intentSignals: [] }; // can't verify = skip it
    const data = await res.json();

    // 1. Knowledge graph lists a non-directory website
    if (data.knowledgeGraph?.website && !isDirectorySite(data.knowledgeGraph.website)) {
      return { hasWebsite: true, intentSignals: [] };
    }

    // 2. Any result has sitelinks = it's definitely their own website
    for (const result of data.organic || []) {
      if (result.sitelinks && result.sitelinks.length > 0 && !isDirectorySite(result.link || "")) {
        return { hasWebsite: true, intentSignals: [] };
      }
    }

    const stopWords = new Set(["the","and","for","llc","inc","co","of","in","at","by","my","mr","mrs","dr"]);
    const nameWords = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !stopWords.has(w));
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const intentSignals: string[] = [];

    const organicResults: { link: string; title: string; snippet: string; sitelinks?: unknown[] }[] = data.organic || [];

    for (let i = 0; i < organicResults.length; i++) {
      const result = organicResults[i];
      const link = (result.link || "").toLowerCase();
      const title = (result.title || "").toLowerCase();
      const snippet = (result.snippet || "").toLowerCase();
      const combined = title + " " + snippet;

      if (!isDirectorySite(link)) {
        // 3. Domain name closely matches the business name slug
        try {
          const domain = new URL(link).hostname
            .replace("www.", "")
            .replace(/\.[^.]+$/, "")
            .replace(/[^a-z0-9]/g, "");
          const minLen = Math.min(domain.length, nameSlug.length);
          if (minLen >= 4 && (domain.includes(nameSlug.slice(0, 5)) || nameSlug.includes(domain.slice(0, 5)))) {
            return { hasWebsite: true, intentSignals: [] };
          }
        } catch {}

        // 4. Enough name words appear in the result content (lowered threshold to 40%)
        if (nameWords.length > 0) {
          const matches = nameWords.filter((w) => combined.includes(w)).length;
          const threshold = nameWords.length === 1 ? 1 : Math.max(1, Math.floor(nameWords.length * 0.4));
          if (matches >= threshold) return { hasWebsite: true, intentSignals: [] };
        }

        // 5. Any non-directory result in top 5 mentions both the business category words and city
        if (i < 5 && combined.includes(city.toLowerCase())) {
          return { hasWebsite: true, intentSignals: [] };
        }
      }

      // Collect intent signals from all results
      for (const signal of NEED_WEBSITE_SIGNALS) {
        if (combined.includes(signal) && !intentSignals.includes(signal)) {
          intentSignals.push(signal);
        }
      }
    }

    return { hasWebsite: false, intentSignals };
  } catch {
    return { hasWebsite: true, intentSignals: [] }; // can't verify = skip it
  }
}

// Score a business — higher = better cold call target
function scoreBusiness(
  rating: number | null,
  reviewCount: number | null,
  intentSignals: string[]
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Established business with real reviews = golden target
  if (reviewCount && reviewCount >= 50) {
    score += 4;
    reasons.push(`${reviewCount} Google reviews but no website`);
  } else if (reviewCount && reviewCount >= 20) {
    score += 2;
    reasons.push(`${reviewCount} Google reviews, no web presence`);
  } else if (reviewCount && reviewCount >= 5) {
    score += 1;
  }

  // High rating = quality business worth pitching
  if (rating && rating >= 4.5) {
    score += 3;
    reasons.push(`${rating}★ rating — customers love them`);
  } else if (rating && rating >= 4.0) {
    score += 2;
    reasons.push(`Strong ${rating}★ rating`);
  } else if (rating && rating >= 3.5) {
    score += 1;
  }

  // Intent signals from search results
  if (intentSignals.length > 0) {
    score += intentSignals.length * 3;
    reasons.push("Online mentions suggest they need web help");
  }

  return { score, reasons };
}

type ScoredCandidate = {
  base: Omit<BusinessLead, "summary">;
  score: number;
};

export async function fetchLeads(
  seenIds: string[],
  apiKey: string,
  serperKey: string | null,
  openNowOnly: boolean,
  generateSummary: (business: Omit<BusinessLead, "summary">) => Promise<string>
): Promise<BusinessLead[]> {
  const seen = new Set(seenIds);

  type Candidate = {
    place: NewPlaceResult;
    type: { query: string; label: string };
    location: { city: string; state: string };
  };
  const candidates: Candidate[] = [];

  const shuffledCities = shuffle(EAST_COAST_CITIES);
  const shuffledTypes = shuffle(BUSINESS_TYPES);

  // Collect a larger pool so we can score and rank them
  for (const location of shuffledCities.slice(0, 15)) {
    for (const type of shuffledTypes.slice(0, 6)) {
      const query = `${type.query} in ${location.city} ${location.state}`;
      const places = await searchAndFetchPlaces(query, apiKey);
      for (const place of places) {
        if (!seen.has(place.id)) {
          candidates.push({ place, type, location });
        }
      }
      if (candidates.length >= 200) break;
    }
    if (candidates.length >= 200) break;
  }

  // Phase 1: filter — verify no website, has phone, is operational
  const scored: ScoredCandidate[] = [];

  for (const candidate of shuffle(candidates)) {
    if (scored.length >= 60) break; // score up to 60 valid candidates then rank
    if (seen.has(candidate.place.id)) continue;

    const p = candidate.place;

    if (p.businessStatus && p.businessStatus !== "OPERATIONAL") continue;
    if (openNowOnly && !p.currentOpeningHours?.openNow) continue;
    if (p.websiteUri) continue;

    const phone = p.nationalPhoneNumber || p.internationalPhoneNumber;
    if (!phone) continue;

    const address = p.formattedAddress || "";
    const loc = parseLocation(address);
    const city = loc.city || candidate.location.city;
    const state = loc.state || candidate.location.state;
    const name = p.displayName?.text || "Unknown";

    // Serper check: verify no website AND collect intent signals
    let intentSignals: string[] = [];
    if (serperKey) {
      const result = await checkViaSearch(name, city, state, serperKey);
      if (result.hasWebsite) continue;
      intentSignals = result.intentSignals;
    }

    const { score, reasons } = scoreBusiness(p.rating ?? null, p.userRatingCount ?? null, intentSignals);

    scored.push({
      score,
      base: {
        placeId: p.id,
        name,
        phone,
        address,
        city,
        state,
        category: candidate.type.label,
        rating: p.rating ?? null,
        reviewCount: p.userRatingCount ?? null,
        hours: p.regularOpeningHours?.weekdayDescriptions ?? null,
        priority: score >= 5 ? "high" : "normal",
        priorityReasons: reasons,
      },
    });

    seen.add(p.id);
  }

  // Phase 2: sort by score descending, take top 20
  scored.sort((a, b) => b.score - a.score);
  const top20 = scored.slice(0, 20);

  // Phase 3: generate summaries
  const leads: BusinessLead[] = [];
  for (const { base } of top20) {
    const summary = await generateSummary(base);
    leads.push({ ...base, summary });
  }

  return leads;
}
