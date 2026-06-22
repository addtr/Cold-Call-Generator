"use client";

import { useState, useCallback } from "react";

type Lead = {
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

const CATEGORY_COLORS: Record<string, string> = {
  Plumbing: "bg-blue-100 text-blue-800",
  Electrical: "bg-yellow-100 text-yellow-800",
  "Barber Shop": "bg-purple-100 text-purple-800",
  "Hair Salon": "bg-pink-100 text-pink-800",
  "Auto Repair": "bg-gray-100 text-gray-800",
  Handyman: "bg-orange-100 text-orange-800",
  Landscaping: "bg-green-100 text-green-800",
  Painting: "bg-red-100 text-red-800",
  Roofing: "bg-stone-100 text-stone-800",
  HVAC: "bg-cyan-100 text-cyan-800",
  Locksmith: "bg-indigo-100 text-indigo-800",
  "Pest Control": "bg-lime-100 text-lime-800",
  "Carpet Cleaning": "bg-teal-100 text-teal-800",
  "Pressure Washing": "bg-sky-100 text-sky-800",
  Flooring: "bg-amber-100 text-amber-800",
  "Tile & Masonry": "bg-slate-100 text-slate-800",
  Fencing: "bg-emerald-100 text-emerald-800",
  "Pool Service": "bg-blue-100 text-blue-800",
  Towing: "bg-zinc-100 text-zinc-800",
  "Cleaning Service": "bg-violet-100 text-violet-800",
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < full ? "text-yellow-400" : i === full && half ? "text-yellow-300" : "text-gray-300"}`}>
          ★
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [progress, setProgress] = useState("");

  const getSeen = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem("seen_place_ids") || "[]");
    } catch {
      return [];
    }
  };

  const saveSeen = (ids: string[]) => {
    const existing = getSeen();
    const merged = Array.from(new Set([...existing, ...ids]));
    localStorage.setItem("seen_place_ids", JSON.stringify(merged));
  };

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress("Searching East Coast businesses...");

    const seenIds = getSeen();

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seenIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      const newLeads: Lead[] = data.leads;
      saveSeen(newLeads.map((l) => l.placeId));
      setLeads(newLeads);
      setTotalGenerated((prev) => prev + newLeads.length);
      setProgress("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("seen_place_ids");
    setTotalGenerated(0);
    setLeads([]);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Cold Call Lead Generator</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              East Coast small businesses with no website — verified phone numbers, ready to call
            </p>
          </div>
          <div className="flex items-center gap-3">
            {totalGenerated > 0 && (
              <span className="text-gray-400 text-sm">{totalGenerated} leads generated</span>
            )}
            <button
              onClick={clearHistory}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline"
            >
              Reset seen history
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? "Generating..." : leads.length === 0 ? "Generate 20 Leads" : "Generate 20 More"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-950 border border-red-800 rounded-lg p-4">
            <p className="text-red-300 font-medium">Error</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
            {error.includes("GOOGLE_PLACES_API_KEY") || error.includes("ANTHROPIC_API_KEY") ? (
              <div className="mt-3 text-red-300 text-sm">
                <p className="font-medium mb-2">Setup Required:</p>
                <ol className="list-decimal list-inside space-y-1 text-red-400">
                  <li>Copy <code className="bg-red-900 px-1 rounded">.env.local.example</code> to <code className="bg-red-900 px-1 rounded">.env.local</code></li>
                  <li>
                    Get a free Google Places API key at{" "}
                    <span className="text-red-300">console.cloud.google.com</span> → enable{" "}
                    <em>Places API</em>
                  </li>
                  <li>
                    Get your Anthropic API key at{" "}
                    <span className="text-red-300">console.anthropic.com</span>
                  </li>
                  <li>Add both keys to <code className="bg-red-900 px-1 rounded">.env.local</code> and restart the server</li>
                </ol>
              </div>
            ) : null}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-300 font-medium">{progress || "Finding businesses..."}</span>
            </div>
            <p className="text-gray-500 text-sm">
              Searching businesses, verifying no websites, checking phone numbers, writing summaries...
              <br />
              This takes 30–60 seconds.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && leads.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📞</div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Ready to find leads</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              Click <strong className="text-gray-300">Generate 20 Leads</strong> to find real East Coast businesses
              with no website and a verified phone number — perfect cold call targets.
            </p>
          </div>
        )}

        {/* Leads grid */}
        {leads.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-300 font-medium">{leads.length} leads — all verified: no website, phone confirmed</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leads.map((lead, i) => (
                <div key={lead.placeId} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500 text-xs font-mono">#{i + 1}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[lead.category] || "bg-gray-700 text-gray-300"}`}>
                          {lead.category}
                        </span>
                        <span className="text-xs text-red-400 font-medium">NO WEBSITE</span>
                      </div>
                      <h3 className="text-white font-semibold text-lg leading-tight">{lead.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">📍</span>
                      <span className="text-gray-400 text-sm truncate">{lead.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">📞</span>
                      <a
                        href={`tel:${lead.phone.replace(/\s/g, "")}`}
                        className="text-emerald-400 font-mono font-medium text-sm hover:text-emerald-300 transition-colors"
                      >
                        {lead.phone}
                      </a>
                    </div>
                    {lead.rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">⭐</span>
                        <StarRating rating={lead.rating} />
                        {lead.reviewCount && (
                          <span className="text-gray-500 text-xs">({lead.reviewCount} reviews)</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3 border-l-2 border-emerald-600">
                    <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Call talking points</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{lead.summary}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={generate}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                {loading ? "Generating..." : "Generate 20 More (No Repeats)"}
              </button>
              <p className="text-gray-600 text-xs mt-2">{getSeen().length} businesses already seen and excluded</p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
