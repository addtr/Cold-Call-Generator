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

const CATEGORY_ICONS: Record<string, string> = {
  Plumbing: "🔧",
  Electrical: "⚡",
  "Barber Shop": "✂️",
  "Hair Salon": "💇",
  "Auto Repair": "🚗",
  Handyman: "🔨",
  Landscaping: "🌿",
  Painting: "🎨",
  Roofing: "🏠",
  HVAC: "❄️",
  Locksmith: "🔑",
  "Pest Control": "🐛",
  "Carpet Cleaning": "🧹",
  "Pressure Washing": "💧",
  Flooring: "🪵",
  "Tile & Masonry": "🧱",
  Fencing: "🪚",
  "Pool Service": "🏊",
  Towing: "🚛",
  "Cleaning Service": "🧽",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Plumbing: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  Electrical: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  "Barber Shop": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  "Hair Salon": { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" },
  "Auto Repair": { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
  Handyman: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  Landscaping: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  Painting: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  Roofing: { bg: "bg-stone-500/10", text: "text-stone-400", border: "border-stone-500/20" },
  HVAC: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  Locksmith: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  "Pest Control": { bg: "bg-lime-500/10", text: "text-lime-400", border: "border-lime-500/20" },
  "Carpet Cleaning": { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/20" },
  "Pressure Washing": { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
  Flooring: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  "Tile & Masonry": { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
  Fencing: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  "Pool Service": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  Towing: { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/20" },
  "Cleaning Service": { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating) ? "text-amber-400" : "text-gray-700"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-amber-400 text-xs font-medium ml-0.5">{rating.toFixed(1)}</span>
    </span>
  );
}

function LeadCard({ lead, index }: { lead: Lead; index: number }) {
  const color = CATEGORY_COLORS[lead.category] || { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/20" };
  const icon = CATEGORY_ICONS[lead.category] || "🏢";

  return (
    <div className="group relative bg-gradient-to-b from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl p-5 hover:border-gray-600/80 hover:from-gray-800/80 hover:to-gray-900/80 transition-all duration-200 hover:shadow-xl hover:shadow-black/20">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`shrink-0 w-10 h-10 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center text-lg`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color.bg} ${color.text} border ${color.border}`}>
                {lead.category}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                No Website
              </span>
            </div>
            <h3 className="text-white font-bold text-base leading-tight">{lead.name}</h3>
          </div>
        </div>
        <span className="shrink-0 text-xs font-mono text-gray-600 mt-1">#{index + 1}</span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2.5">
          <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-gray-400 text-sm truncate">{lead.address}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a
            href={`tel:${lead.phone.replace(/\s/g, "")}`}
            className="text-emerald-400 font-mono font-semibold text-sm hover:text-emerald-300 transition-colors"
          >
            {lead.phone}
          </a>
        </div>

        {lead.rating && (
          <div className="flex items-center gap-2.5">
            <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="flex items-center gap-2">
              <StarRating rating={lead.rating} />
              {lead.reviewCount && (
                <span className="text-gray-500 text-xs">({lead.reviewCount.toLocaleString()} reviews)</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="relative bg-gray-900/80 rounded-xl p-3.5 border border-gray-700/40">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Call Talking Points</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{lead.summary}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalGenerated, setTotalGenerated] = useState(0);

  const getSeen = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem("seen_place_ids") || "[]");
    } catch {
      return [];
    }
  };

  const saveSeen = (ids: string[]) => {
    const merged = Array.from(new Set([...getSeen(), ...ids]));
    localStorage.setItem("seen_place_ids", JSON.stringify(merged));
  };

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seenIds: getSeen() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      saveSeen(data.leads.map((l: Lead) => l.placeId));
      setLeads(data.leads);
      setTotalGenerated((p) => p + data.leads.length);
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

  const seenCount = typeof window !== "undefined" ? getSeen().length : 0;

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/20 via-transparent to-blue-950/20 pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-gray-800/60 bg-gray-900/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-lg">📞</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Cold Call Generator</h1>
              <p className="text-gray-500 text-xs mt-0.5">East Coast · No-website businesses · Verified numbers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {totalGenerated > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-gray-300 text-xs font-medium">{totalGenerated} leads generated</span>
              </div>
            )}
            {seenCount > 0 && (
              <button onClick={clearHistory} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Reset history
              </button>
            )}
            <button
              onClick={generate}
              disabled={loading}
              className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
            >
              {loading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {leads.length === 0 ? "Generate 20 Leads" : "Generate 20 More"}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-6 py-8">

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-950/40 border border-red-800/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300 font-semibold text-sm">Error</p>
            </div>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mb-8 bg-gray-800/40 border border-gray-700/40 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-white font-semibold">Finding leads across the East Coast...</span>
            </div>
            <p className="text-gray-500 text-sm">Searching businesses · Verifying no websites · Confirming phone numbers</p>
            <p className="text-gray-600 text-xs mt-1">This takes about 30–60 seconds</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && leads.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-4xl mb-6">
              📞
            </div>
            <h2 className="text-white text-2xl font-bold mb-3">Ready to find leads</h2>
            <p className="text-gray-500 max-w-md text-sm leading-relaxed mb-8">
              Find real East Coast small businesses with no website and verified phone numbers.
              Perfect targets for pitching web design services.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              {[
                { icon: "🔍", label: "Real businesses", sub: "from Google Maps" },
                { icon: "✅", label: "No website", sub: "verified per lead" },
                { icon: "📱", label: "Phone verified", sub: "ready to call" },
              ].map((f) => (
                <div key={f.label} className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <div className="text-white text-sm font-semibold">{f.label}</div>
                  <div className="text-gray-500 text-xs">{f.sub}</div>
                </div>
              ))}
            </div>
            <button
              onClick={generate}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate 20 Leads
            </button>
          </div>
        )}

        {/* Results */}
        {leads.length > 0 && !loading && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-lg">{leads.length} Leads Ready</h2>
                <p className="text-gray-500 text-xs mt-0.5">All verified · no website · phone confirmed · {seenCount} total seen (no repeats)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {leads.map((lead, i) => (
                <LeadCard key={lead.placeId} lead={lead} index={i} />
              ))}
            </div>

            <div className="text-center pb-4">
              <button
                onClick={generate}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-8 py-3.5 rounded-xl text-base transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate 20 More — No Repeats
              </button>
              <p className="text-gray-600 text-xs mt-2">{seenCount} businesses excluded from future results</p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
