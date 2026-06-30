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
  hours: string[] | null;
  priority: "high" | "normal";
  priorityReasons: string[];
  summary: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  Plumbing: "🔧", Electrical: "⚡", "Barber Shop": "✂️", "Hair Salon": "💇",
  "Auto Repair": "🚗", Handyman: "🔨", Landscaping: "🌿", Painting: "🎨",
  Roofing: "🏠", HVAC: "❄️", Locksmith: "🔑", "Pest Control": "🐛",
  "Carpet Cleaning": "🧹", "Pressure Washing": "💧", Flooring: "🪵",
  "Tile & Masonry": "🧱", Fencing: "🪚", "Pool Service": "🏊",
  Towing: "🚛", "Cleaning Service": "🧽",
};

const CATEGORY_ACCENT: Record<string, string> = {
  Plumbing: "#3b82f6", Electrical: "#f59e0b", "Barber Shop": "#a855f7",
  "Hair Salon": "#ec4899", "Auto Repair": "#6b7280", Handyman: "#f97316",
  Landscaping: "#22c55e", Painting: "#ef4444", Roofing: "#78716c",
  HVAC: "#06b6d4", Locksmith: "#6366f1", "Pest Control": "#84cc16",
  "Carpet Cleaning": "#14b8a6", "Pressure Washing": "#0ea5e9",
  Flooring: "#d97706", "Tile & Masonry": "#64748b", Fencing: "#10b981",
  "Pool Service": "#3b82f6", Towing: "#71717a", "Cleaning Service": "#8b5cf6",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < Math.round(rating) ? "#f59e0b" : "#2a2a3d", fontSize: 13 }}>★</span>
      ))}
      <span style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600, marginLeft: 2 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

function LeadCard({ lead, index }: { lead: Lead; index: number }) {
  const accent = CATEGORY_ACCENT[lead.category] || "#10d97e";
  const icon = CATEGORY_ICONS[lead.category] || "🏢";
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--bg-card-hover)" : "var(--bg-card)",
        border: `1px solid ${hovered ? "var(--border-hover)" : "var(--border)"}`,
        borderRadius: 16,
        padding: "20px",
        transition: "all 0.15s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent line at top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${accent}18`, border: `1px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: `${accent}18`, color: accent, border: `1px solid ${accent}30`,
              letterSpacing: "0.02em",
            }}>
              {lead.category}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: "#3d0f0f", color: "#f87171", border: "1px solid #7f1d1d",
            }}>
              No Website
            </span>
            {lead.priority === "high" && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)",
              }}>
                🔥 Hot Lead
              </span>
            )}
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {lead.name}
          </h3>
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "monospace", flexShrink: 0 }}>#{index + 1}</span>
      </div>

      {/* Info rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--text-muted)", fontSize: 13, flexShrink: 0 }}>📍</span>
          <span style={{ color: "var(--text-secondary)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.address}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--text-muted)", fontSize: 13, flexShrink: 0 }}>📞</span>
          <a href={`tel:${lead.phone.replace(/\s/g, "")}`} style={{
            color: "var(--green)", fontFamily: "monospace", fontWeight: 700, fontSize: 14,
            textDecoration: "none", letterSpacing: "0.03em",
          }}>
            {lead.phone}
          </a>
        </div>
        {lead.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--text-muted)", fontSize: 13, flexShrink: 0 }}>⭐</span>
            <StarRating rating={lead.rating} />
            {lead.reviewCount && (
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({lead.reviewCount.toLocaleString()} reviews)</span>
            )}
          </div>
        )}
      </div>

      {/* Priority reasons */}
      {lead.priorityReasons.length > 0 && (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12,
        }}>
          {lead.priorityReasons.map((r, i) => (
            <span key={i} style={{
              fontSize: 11, padding: "3px 8px", borderRadius: 6,
              background: "rgba(251,191,36,0.08)", color: "#fbbf24",
              border: "1px solid rgba(251,191,36,0.2)",
            }}>⚡ {r}</span>
          ))}
        </div>
      )}

      {/* Talking points */}
      <div style={{
        background: "#0a0a14", border: "1px solid var(--border)",
        borderRadius: 12, padding: "12px 14px",
        borderLeft: `3px solid ${accent}`,
        marginBottom: lead.hours ? 12 : 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Call Talking Points
          </span>
        </div>
        <p style={{ margin: 0, color: "#c0c0d8", fontSize: 13, lineHeight: 1.6 }}>{lead.summary}</p>
      </div>

      {/* Hours */}
      {lead.hours && lead.hours.length > 0 && (
        <div style={{
          background: "#0a0a14", border: "1px solid var(--border)",
          borderRadius: 12, padding: "12px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 13 }}>🕐</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Business Hours
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 16px" }}>
            {lead.hours.map((line, i) => {
              const [day, ...rest] = line.split(": ");
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{day}</span>
                  <span style={{ color: "#c0c0d8", fontSize: 12, textAlign: "right" }}>{rest.join(": ")}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.7s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [openNowOnly, setOpenNowOnly] = useState(false);

  const getSeen = (): string[] => {
    try { return JSON.parse(localStorage.getItem("seen_place_ids") || "[]"); } catch { return []; }
  };
  const saveSeen = (ids: string[]) => {
    localStorage.setItem("seen_place_ids", JSON.stringify(Array.from(new Set([...getSeen(), ...ids]))));
  };

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seenIds: getSeen(), openNowOnly }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      saveSeen(data.leads.map((l: Lead) => l.placeId));
      setLeads(data.leads);
      setTotalGenerated(p => p + data.leads.length);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [openNowOnly]);

  const clearHistory = () => { localStorage.removeItem("seen_place_ids"); setTotalGenerated(0); setLeads([]); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)" }}>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(13,13,20,0.9)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #10d97e, #0891b2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              boxShadow: "0 0 20px rgba(16,217,126,0.3)",
            }}>📞</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Cold Call Generator</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>East Coast · No-website businesses · Verified numbers</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {totalGenerated > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "6px 12px",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
                <span style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 600 }}>{totalGenerated} leads generated</span>
              </div>
            )}
            {totalGenerated > 0 && (
              <button onClick={clearHistory} style={{
                background: "none", border: "none", color: "var(--text-muted)",
                fontSize: 12, cursor: "pointer", padding: "4px 8px",
              }}>
                Reset history
              </button>
            )}
            {/* Open Now toggle */}
            <button
              onClick={() => setOpenNowOnly(v => !v)}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: openNowOnly ? "rgba(16,217,126,0.12)" : "var(--bg-card)",
                border: `1px solid ${openNowOnly ? "rgba(16,217,126,0.4)" : "var(--border)"}`,
                borderRadius: 10, padding: "9px 14px",
                color: openNowOnly ? "var(--green)" : "var(--text-secondary)",
                fontWeight: 600, fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}
            >
              {/* Toggle pill */}
              <div style={{
                width: 32, height: 18, borderRadius: 9, position: "relative",
                background: openNowOnly ? "var(--green)" : "var(--border)",
                transition: "background 0.2s", flexShrink: 0,
              }}>
                <div style={{
                  position: "absolute", top: 3, left: openNowOnly ? 17 : 3,
                  width: 12, height: 12, borderRadius: "50%", background: "white",
                  transition: "left 0.2s",
                }} />
              </div>
              Open Now Only
            </button>

            <button
              onClick={generate}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: loading ? "#0a3d26" : "linear-gradient(135deg, #10d97e, #0891b2)",
                border: "none", borderRadius: 10, padding: "10px 20px",
                color: "white", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1, transition: "all 0.15s",
                boxShadow: loading ? "none" : "0 0 20px rgba(16,217,126,0.25)",
              }}
            >
              {loading ? <Spinner /> : "⚡"}
              {loading ? "Searching..." : leads.length === 0 ? "Generate 20 Leads" : "Generate 20 More"}
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Error */}
        {error && (
          <div style={{
            background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: 12, padding: 16, marginBottom: 24,
          }}>
            <div style={{ color: "#f87171", fontWeight: 700, marginBottom: 4 }}>⚠ Error</div>
            <div style={{ color: "#fca5a5", fontSize: 13 }}>{error}</div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16,
            padding: 40, textAlign: "center", marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
              <Spinner />
              <span style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 16 }}>Searching East Coast businesses...</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 4px" }}>Verifying no websites · Confirming phone numbers</p>
            <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>Takes about 30–60 seconds</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && leads.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20, margin: "0 auto 24px",
              background: "linear-gradient(135deg, rgba(16,217,126,0.15), rgba(8,145,178,0.15))",
              border: "1px solid rgba(16,217,126,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
            }}>📞</div>
            <h2 style={{ color: "var(--text-primary)", fontSize: 26, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Ready to find leads
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 420, margin: "0 auto 36px", lineHeight: 1.6 }}>
              Real East Coast small businesses with no website and verified phone numbers — perfect targets for pitching web design.
            </p>

            {/* Feature pills */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
              {[
                { icon: "🔍", text: "Real Google Maps data" },
                { icon: "✅", text: "No website verified" },
                { icon: "📱", text: "Phone number confirmed" },
                { icon: "🔄", text: "Zero repeats ever" },
              ].map(f => (
                <div key={f.text} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 50, padding: "8px 16px",
                  color: "var(--text-secondary)", fontSize: 13, fontWeight: 500,
                }}>
                  <span>{f.icon}</span> {f.text}
                </div>
              ))}
            </div>

            <button
              onClick={generate}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "linear-gradient(135deg, #10d97e, #0891b2)",
                border: "none", borderRadius: 12, padding: "14px 32px",
                color: "white", fontWeight: 800, fontSize: 16, cursor: "pointer",
                boxShadow: "0 0 30px rgba(16,217,126,0.3)", letterSpacing: "-0.01em",
              }}
            >
              ⚡ Generate 20 Leads
            </button>
          </div>
        )}

        {/* Results */}
        {leads.length > 0 && !loading && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, color: "var(--text-primary)", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {leads.length} Leads Ready
                </h2>
                <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: 12 }}>
                  All verified · no website · phone confirmed
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 16, marginBottom: 32 }}>
              {leads.map((lead, i) => <LeadCard key={lead.placeId} lead={lead} index={i} />)}
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={generate}
                disabled={loading}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "linear-gradient(135deg, #10d97e, #0891b2)",
                  border: "none", borderRadius: 12, padding: "14px 32px",
                  color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer",
                  boxShadow: "0 0 30px rgba(16,217,126,0.25)", opacity: loading ? 0.6 : 1,
                }}
              >
                ⚡ Generate 20 More — No Repeats
              </button>
              <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>
                {getSeen().length} businesses already excluded
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
