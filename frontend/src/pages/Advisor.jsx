import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const POPULAR_TAGS = ["Grocery", "Travel", "Dining", "Gas", "Online Shopping"];

const TAG_MERCHANTS = {
  Grocery: { merchant: "BigBasket", amount: 2500 },
  Travel: { merchant: "MakeMyTrip", amount: 8500 },
  Dining: { merchant: "Zomato", amount: 850 },
  Gas: { merchant: "HP Petrol", amount: 3000 },
  "Online Shopping": { merchant: "Amazon", amount: 4999 },
};

function fmt(n) {
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function CardVisual({ name }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const gradients = [
    "linear-gradient(135deg, #2D2563 0%, #1A1040 100%)",
    "linear-gradient(135deg, #1A3A2A 0%, #0D1F17 100%)",
    "linear-gradient(135deg, #2A1A0D 0%, #1A0D05 100%)",
    "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
  ];
  const grad = gradients[name.charCodeAt(0) % gradients.length];

  return (
    <div style={{
      width: 160, height: 100, borderRadius: 12,
      background: grad,
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "14px 16px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      position: "relative", overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* Decorative circle */}
      <div style={{
        position: "absolute", right: -20, top: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(255,255,255,0.04)",
      }} />
      <div style={{
        fontSize: 9, color: "rgba(255,255,255,0.4)",
        fontFamily: "var(--font-display)", letterSpacing: "0.12em", fontWeight: 600,
      }}>PREMIUM RESERVE</div>
      <div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", marginBottom: 3 }}>
          ★★★★ 4421
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)",
          fontFamily: "var(--font-display)",
        }}>{initials}</div>
      </div>
    </div>
  );
}

function EarningsBar({ label, value, color = "var(--accent)", isActive }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{
          fontSize: 13, fontWeight: 700, color,
          fontFamily: "var(--font-display)",
        }}>{value}</span>
      </div>
      <div style={{ height: 4, background: "var(--border-light)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: isActive
            ? `linear-gradient(90deg, ${color}, ${color}88)`
            : `linear-gradient(90deg, ${color}66, ${color}22)`,
          width: isActive ? "80%" : "25%",
        }} />
      </div>
      {isActive && (
        <div style={{
          marginTop: 5, fontSize: 10, color: "var(--green)", fontWeight: 600, letterSpacing: "0.06em",
        }}>● ACTIVE PERK</div>
      )}
    </div>
  );
}

export default function Advisor() {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!merchant.trim() || !amount) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant: merchant.trim(), amount: Number(amount) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function fillTag(tag) {
    const ex = TAG_MERCHANTS[tag];
    if (ex) { setMerchant(ex.merchant); setAmount(String(ex.amount)); }
    setResult(null); setError(null);
  }

  const cashbackMultiplier = result ? Math.round(result.cashbackRate) : null;
  const baseMultiplier = 1;
  const bonusMultiplier = cashbackMultiplier ? cashbackMultiplier - baseMultiplier : null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - var(--nav-h))", overflow: "hidden" }}>
      <Sidebar active="filters" />

      <main style={{ flex: 1, overflowY: "auto", padding: "36px 40px" }}>
        {/* Heading */}
        <div style={{ maxWidth: 720, marginBottom: 28 }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 800,
            lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 12,
          }}>
            Find the{" "}
            <span style={{
              background: "linear-gradient(135deg, #7C6AF7, #06B6D4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Perfect Card</span>
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Optimising every swipe. Tell us where you're spending, and we'll calculate the
            maximum rewards across your portfolio.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} style={{
          display: "flex", alignItems: "center", gap: 0,
          background: "var(--surface)", border: "1px solid var(--border-light)",
          borderRadius: 12, padding: "6px 6px 6px 16px",
          maxWidth: 620, marginBottom: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" stroke="#3E3E5A" strokeWidth="1.5"/>
            <path d="m21 21-4.35-4.35" stroke="#3E3E5A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              padding: "10px 14px", color: "var(--text-primary)", fontSize: 14,
              placeholder: "var(--text-muted)",
            }}
            placeholder="Merchant name (e.g. Whole Foods, Delta Airlines, Amazon)"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
          <div style={{ width: 1, height: 28, background: "var(--border)", flexShrink: 0 }} />
          <input
            type="number"
            style={{
              width: 100, background: "none", border: "none", outline: "none",
              padding: "10px 14px", color: "var(--text-primary)", fontSize: 14, textAlign: "right",
            }}
            placeholder="₹ Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 22px", borderRadius: 8,
              background: loading ? "var(--surface-raised)" : "linear-gradient(135deg, #7C6AF7, #4E3FD4)",
              border: "none", color: loading ? "var(--text-muted)" : "#fff",
              fontWeight: 700, fontSize: 13, flexShrink: 0,
              letterSpacing: "0.02em",
            }}
          >
            {loading ? "…" : "Analyse"}
          </button>
        </form>

        {/* Popular tags */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 600 }}>
            POPULAR:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button key={tag} onClick={() => fillTag(tag)} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 99,
              background: "var(--surface)", border: "1px solid var(--border-light)",
              color: "var(--text-secondary)", fontSize: 12, fontWeight: 500,
              transition: "all 0.12s",
            }}>
              <span style={{ fontSize: 10 }}>+</span> {tag}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: 10, marginBottom: 20,
            background: "var(--red-dim)", border: "1px solid rgba(244,63,94,0.2)",
            color: "var(--red)", fontSize: 13,
          }}>{error}</div>
        )}

        {/* Result */}
        {result && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>

            {/* Left: main recommendation */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Top recommendation card */}
              <div style={{
                background: "var(--surface)", borderRadius: 14,
                border: "1px solid var(--border)", padding: "20px",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: "linear-gradient(90deg, #7C6AF7, #06B6D4)",
                }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div style={{
                    fontSize: 10, color: "var(--text-muted)", fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>TOP RECOMMENDATION</div>
                  <div style={{
                    padding: "3px 10px", borderRadius: 99,
                    background: "var(--green-dim)", border: "1px solid rgba(16,185,129,0.25)",
                    fontSize: 10, fontWeight: 700, color: "var(--green)", letterSpacing: "0.06em",
                  }}>BEST VALUE</div>
                </div>

                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <CardVisual name={result.bestCard} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
                      color: "var(--text-primary)", marginBottom: 8,
                    }}>{result.bestCard}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
                      You will earn{" "}
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                        {result.cashbackRate}x Points
                      </span>{" "}
                      on this transaction, resulting in a net benefit of{" "}
                      <span style={{ color: "var(--green)", fontWeight: 600 }}>
                        {fmt(result.cashbackAmount)}
                      </span>.
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
                      {result.reasoning}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{
                        padding: "9px 18px", borderRadius: 8,
                        background: "linear-gradient(135deg, #7C6AF7, #4E3FD4)",
                        border: "none", color: "#fff", fontWeight: 600, fontSize: 12,
                        boxShadow: "0 4px 12px rgba(124,106,247,0.3)",
                      }}>Use this Card</button>
                      <button style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: "var(--surface-raised)", border: "1px solid var(--border)",
                        color: "var(--text-secondary)", fontSize: 16, display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>⋯</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Runner up */}
              {result.alternatives?.[0] && (
                <div style={{
                  background: "var(--surface)", borderRadius: 14,
                  border: "1px solid var(--border)", padding: "16px 20px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{
                      fontSize: 10, color: "var(--text-muted)", fontWeight: 600,
                      letterSpacing: "0.1em", marginBottom: 5,
                    }}>RUNNER UP</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{result.alternatives[0].card}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                      {fmt(result.alternatives[0].cashbackAmount)} rewards
                    </div>
                  </div>
                  <button style={{
                    padding: "7px 14px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "transparent",
                    color: "var(--text-secondary)", fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}>VIEW DETAILS</button>
                </div>
              )}
            </div>

            {/* Right panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Earnings breakdown */}
              <div style={{
                background: "var(--surface)", borderRadius: 14,
                border: "1px solid var(--border)", padding: "18px",
              }}>
                <div style={{
                  fontSize: 10, color: "var(--text-muted)", fontWeight: 600,
                  letterSpacing: "0.1em", marginBottom: 16, textTransform: "uppercase",
                }}>Earnings Breakdown</div>
                <EarningsBar label="Base Points" value={`${baseMultiplier}x`} color="var(--text-secondary)" />
                {bonusMultiplier > 0 && (
                  <EarningsBar label="Merchant Bonus" value={`+${bonusMultiplier}x`} color="var(--accent)" />
                )}
                <EarningsBar label="Cashback Value" value={fmt(result.cashbackAmount)} color="var(--green)" isActive />
              </div>

              {/* Advisor insight */}
              <div style={{
                background: "var(--surface)", borderRadius: 14,
                border: "1px solid rgba(124,106,247,0.2)",
                padding: "18px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#7C6AF7" strokeWidth="1.5"/>
                      <path d="M12 8v4M12 16h.01" stroke="#7C6AF7" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.06em" }}>
                    ADVISOR INSIGHT
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  Based on your transaction at{" "}
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{merchant}</span>,{" "}
                  using{" "}
                  <span style={{ color: "var(--accent)" }}>{result.bestCard}</span>{" "}
                  maximises your rewards and captures the highest available rate for this category.
                </div>
                <div style={{
                  display: "flex", gap: 8, marginTop: 14,
                  paddingTop: 12, borderTop: "1px solid var(--border)",
                }}>
                  <div style={{
                    flex: 1, padding: "8px", borderRadius: 8, background: "var(--surface-raised)",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3, letterSpacing: "0.06em" }}>
                      RATE
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-display)" }}>
                      {result.cashbackRate}%
                    </div>
                  </div>
                  <div style={{
                    flex: 1, padding: "8px", borderRadius: 8, background: "var(--surface-raised)",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3, letterSpacing: "0.06em" }}>
                      SAVINGS
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-display)" }}>
                      {fmt(result.cashbackAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={{
            maxWidth: 500, padding: "32px", borderRadius: 14,
            background: "var(--surface)", border: "1px dashed var(--border-light)",
            textAlign: "center", color: "var(--text-muted)",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 6 }}>
              Enter a merchant and amount above
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
              We'll analyse your card portfolio and find the highest cashback option for this specific transaction.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
