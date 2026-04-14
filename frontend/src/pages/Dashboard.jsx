import React, { useEffect, useState } from "react";

const CATEGORY_LABELS = {
  food_delivery: "Dining & Restaurants",
  travel: "Travel & Transit",
  online_shopping: "Online Shopping",
  fuel: "Fuel & Auto",
  groceries: "Groceries",
  entertainment: "Streaming & Subs",
  others: "Others",
};

const CATEGORY_COLORS = [
  "#7C6AF7", "#06B6D4", "#10B981", "#F59E0B", "#F472B6", "#A78BFA", "#7878A0",
];

function fmt(n) {
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function KPICard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      flex: "1 1 160px",
      padding: "18px 20px",
      background: "var(--surface)",
      borderRadius: 14,
      border: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{
          fontSize: 10, color: "var(--text-secondary)",
          textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600,
        }}>{label}</div>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: color + "1A",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0,
        }}>{icon}</div>
      </div>
      <div style={{
        fontSize: 26, fontWeight: 700, color,
        fontFamily: "var(--font-display)", lineHeight: 1, marginBottom: 6,
      }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{sub}</div>
    </div>
  );
}

function MerchantAvatar({ name }) {
  const hue = (name.charCodeAt(0) * 47 + name.charCodeAt(1) * 13) % 360;
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
      background: `hsl(${hue}, 45%, 28%)`,
      border: `1px solid hsl(${hue}, 45%, 38%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 700, color: `hsl(${hue}, 70%, 80%)`,
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "calc(100vh - var(--nav-h))", gap: 12, color: "var(--text-muted)",
      }}>
        <div style={{
          width: 36, height: 36, border: "2px solid var(--border-light)",
          borderTopColor: "var(--accent)", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 14 }}>Analysing your transactions…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{
          padding: "16px 20px", borderRadius: 12,
          background: "var(--red-dim)", border: "1px solid rgba(244,63,94,0.2)",
          color: "var(--red)", fontSize: 14, marginBottom: 12,
        }}>Failed to load: {error}</div>
        <button onClick={load} style={{
          padding: "9px 20px", borderRadius: 9, background: "var(--accent)",
          border: "none", color: "#fff", fontWeight: 600, fontSize: 13,
        }}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const maxMissed = Math.max(...(data.byCategory || []).map((c) => c.missed), 1);
  const efficiencyRate = ((data.totalActualCashback / data.totalSpend) * 100).toFixed(2);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1280, margin: "0 auto" }}>

      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{
            fontSize: 10, color: "var(--accent)", letterSpacing: "0.14em",
            fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 8,
          }}>INTELLIGENCE BRIEFING</div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800,
            color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1,
          }}>Financial Altitude</h1>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px", borderRadius: 9,
          background: "var(--surface)", border: "1px solid var(--border)",
          fontSize: 12, color: "var(--text-secondary)",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          March 2024
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard
          label="Total Spend" value={fmt(data.totalSpend)} sub="↗ 2.1% vs last month"
          color="var(--text-primary)"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        />
        <KPICard
          label="Cashback Earned" value={fmt(data.totalActualCashback)} sub={`${efficiencyRate}% average rate`}
          color="var(--green)"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        />
        <KPICard
          label="Max Possible" value={fmt(data.totalPossibleCashback)} sub="Optimised portfolio potential"
          color="var(--amber)"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
        <KPICard
          label="Left on Table" value={fmt(data.missedSavings)} sub="⚠ Potential optimisation found"
          color="var(--red)"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.5"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
        />
      </div>

      {/* Body: two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16, marginBottom: 20 }}>

        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Missed savings by category */}
          <div style={{
            background: "var(--surface)", borderRadius: 14,
            border: "1px solid var(--border)", padding: "20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 3 }}>
                  Missed Savings by Category
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Leakage identified in your spending habits
                </div>
              </div>
              <button style={{
                background: "none", border: "none", color: "var(--text-muted)",
                fontSize: 18, lineHeight: 1, padding: "2px 6px",
              }}>⋯</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(data.byCategory || []).slice(0, 5).map((cat, i) => {
                const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                const pct = Math.max((cat.missed / maxMissed) * 100, 4);
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                      <span style={{
                        fontSize: 11, color: "var(--text-secondary)", fontWeight: 500,
                        textTransform: "uppercase", letterSpacing: "0.07em",
                      }}>
                        {CATEGORY_LABELS[cat.category] || cat.category}
                      </span>
                      <span style={{ fontSize: 11, color, fontWeight: 700 }}>
                        {fmt(cat.missed)} MISSED
                      </span>
                    </div>
                    <div style={{
                      height: 5, background: "var(--border-light)",
                      borderRadius: 99, overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", width: pct + "%", borderRadius: 99,
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advisor tip */}
          <div style={{
            background: "var(--surface)", borderRadius: 14,
            border: "1px solid var(--border)", padding: "16px 18px",
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: "var(--accent-dim)", border: "1px solid var(--accent-glow)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#7C6AF7" strokeWidth="1.5"/>
                <circle cx="12" cy="10" r="3" stroke="#7C6AF7" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontSize: 10, color: "var(--accent)", fontWeight: 700,
                letterSpacing: "0.1em", marginBottom: 5,
              }}>ADVISOR TIP</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                Switching to the optimal card for{" "}
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {CATEGORY_LABELS[data.byCategory?.[0]?.category] || "Dining"}
                </span>{" "}
                could save you{" "}
                <span style={{ color: "var(--green)", fontWeight: 600 }}>
                  {fmt((data.byCategory?.[0]?.missed || 0) * 12)}
                </span>{" "}
                annually based on current trends.
              </div>
            </div>
          </div>
        </div>

        {/* Right col: top missed opportunities */}
        <div style={{
          background: "var(--surface)", borderRadius: 14,
          border: "1px solid var(--border)", padding: "20px", overflow: "hidden",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 3 }}>
                Top Missed Opportunities
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Individual transactions with higher reward potential
              </div>
            </div>
            <button style={{
              padding: "5px 11px", borderRadius: 6,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-secondary)", fontSize: 11, fontWeight: 500,
            }}>View All</button>
          </div>

          {/* Header row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1.4fr 1.4fr 0.8fr",
            gap: 8, paddingBottom: 10,
            borderBottom: "1px solid var(--border)",
          }}>
            {["Merchant", "Amount", "Used Card", "Recommendation", "Leakage"].map((h) => (
              <div key={h} style={{
                fontSize: 10, color: "var(--text-muted)",
                fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
              }}>{h}</div>
            ))}
          </div>

          {/* Data rows */}
          {(data.topMissedTransactions || []).map((t, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1.4fr 1.4fr 0.8fr",
              gap: 8, padding: "12px 0",
              borderBottom: "1px solid var(--border)",
              alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MerchantAvatar name={t.merchant} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.merchant}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{fmt(t.amount)}</div>
              <div>
                <span style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 5,
                  background: "var(--surface-raised)", color: "var(--text-secondary)", fontWeight: 500,
                }}>{t.usedCard}</span>
              </div>
              <div>
                <span style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 5,
                  background: "var(--accent-dim)", color: "var(--accent)", fontWeight: 600,
                }}>{t.betterCard}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)" }}>
                +{fmt(t.missed)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{
        borderRadius: 14, padding: "20px 24px",
        background: "linear-gradient(135deg, rgba(124,106,247,0.10) 0%, rgba(6,182,212,0.06) 100%)",
        border: "1px solid rgba(124,106,247,0.2)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "var(--accent-dim)", border: "1px solid var(--accent-glow)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="#7C6AF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 3 }}>
              Ready to optimise your portfolio?
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              We've identified 3 new cards that fit your current spending gaps.
            </div>
          </div>
        </div>
        <button style={{
          padding: "10px 22px", borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, #7C6AF7, #4E3FD4)",
          border: "none", color: "#fff", fontWeight: 700, fontSize: 12,
          letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 16px rgba(124,106,247,0.35)",
        }}>
          OPTIMISE NOW
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
