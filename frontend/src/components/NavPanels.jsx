import React, { useState, useEffect, useRef } from "react";

function fmt(n) {
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// ── Shared overlay backdrop ──────────────────────────────────────────────────
function Backdrop({ onClick }) {
  return (
    <div onClick={onClick} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
    }} />
  );
}

// ── Slide panel (right side) ─────────────────────────────────────────────────
function SlidePanel({ title, subtitle, onClose, children, width = 360 }) {
  return (
    <>
      <Backdrop onClick={onClose} />
      <div style={{
        position: "fixed", top: "var(--nav-h)", right: 0, bottom: 0,
        width, zIndex: 300,
        background: "var(--surface)",
        borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.4)",
      }}>
        <div style={{
          padding: "20px 22px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 3 }}>
              {title}
            </div>
            {subtitle && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--surface-raised)", color: "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px" }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, color: "var(--text-muted)", fontWeight: 600,
      letterSpacing: "0.1em", textTransform: "uppercase",
      marginBottom: 10, marginTop: 18,
    }}>{children}</div>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, sub, value, onChange }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 0", borderBottom: "1px solid var(--border)",
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 38, height: 22, borderRadius: 99, cursor: "pointer",
          background: value ? "var(--accent)" : "var(--border-light)",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 3,
          left: value ? 19 : 3,
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }} />
      </div>
    </div>
  );
}

// ── SEARCH PANEL ──────────────────────────────────────────────────────────────
export function SearchPanel({ onClose, analyzeData, cards }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.toLowerCase().trim();

  const merchantResults = q
    ? (analyzeData?.topMissedTransactions || []).filter(
        (t) => t.merchant.toLowerCase().includes(q)
      )
    : [];

  const categoryResults = q
    ? (analyzeData?.byCategory || []).filter(
        (c) => c.category.replace(/_/g, " ").includes(q)
      )
    : [];

  const cardResults = q
    ? (cards || []).filter((c) => c.name.toLowerCase().includes(q))
    : [];

  const hasResults = merchantResults.length || categoryResults.length || cardResults.length;

  return (
    <>
      <Backdrop onClick={onClose} />
      <div style={{
        position: "fixed", top: "var(--nav-h)", left: "50%",
        transform: "translateX(-50%)",
        width: 560, zIndex: 300,
        background: "var(--surface)", borderRadius: "0 0 16px 16px",
        border: "1px solid var(--border)", borderTop: "none",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}>
        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 18px", borderBottom: "1px solid var(--border)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="var(--text-muted)" strokeWidth="1.5"/>
            <path d="m21 21-4.35-4.35" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            placeholder="Search merchants, categories, cards…"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: 15, color: "var(--text-primary)", fontFamily: "var(--font-body)",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{
              background: "none", border: "none", color: "var(--text-muted)", fontSize: 18,
            }}>×</button>
          )}
        </div>

        <div style={{ padding: "10px 0", maxHeight: 420, overflowY: "auto" }}>
          {!query && (
            <div style={{ padding: "24px 18px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Search your spending insights, merchants, and cards
            </div>
          )}

          {query && !hasResults && (
            <div style={{ padding: "24px 18px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No results for "{query}"
            </div>
          )}

          {merchantResults.length > 0 && (
            <>
              <div style={{ padding: "0 18px", fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 6 }}>
                TRANSACTIONS
              </div>
              {merchantResults.map((t, i) => (
                <div key={i} style={{
                  padding: "10px 18px", display: "flex", justifyContent: "space-between",
                  alignItems: "center", cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{t.merchant}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      Used {t.usedCard} · Better: {t.betterCard}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--red)", fontWeight: 700 }}>
                    +{fmt(t.missed)} missed
                  </div>
                </div>
              ))}
            </>
          )}

          {categoryResults.length > 0 && (
            <>
              <div style={{ padding: "10px 18px 6px", fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.1em" }}>
                CATEGORIES
              </div>
              {categoryResults.map((c, i) => (
                <div key={i} style={{
                  padding: "10px 18px", display: "flex", justifyContent: "space-between",
                  alignItems: "center", borderBottom: "1px solid var(--border)",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>
                    {c.category.replace(/_/g, " ")}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{fmt(c.spend)} spend</div>
                    <div style={{ fontSize: 11, color: "var(--red)", fontWeight: 600 }}>{fmt(c.missed)} missed</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {cardResults.length > 0 && (
            <>
              <div style={{ padding: "10px 18px 6px", fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.1em" }}>
                YOUR CARDS
              </div>
              {cardResults.map((c, i) => (
                <div key={i} style={{
                  padding: "10px 18px", display: "flex", justifyContent: "space-between",
                  alignItems: "center", borderBottom: "1px solid var(--border)",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{c.network} · ₹{c.annualFee}/yr</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
                    up to {Math.max(...Object.values(c.cashbackRates))}% back
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── NOTIFICATIONS PANEL ───────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  food_delivery: "Dining & Restaurants", travel: "Travel & Transit",
  online_shopping: "Online Shopping", fuel: "Fuel & Auto",
  groceries: "Groceries", entertainment: "Streaming & Subs", others: "Others",
};

export function NotificationsPanel({ onClose, analyzeData }) {
  const missed = analyzeData?.topMissedTransactions || [];
  const categories = analyzeData?.byCategory || [];

  const notifications = [
    ...missed.slice(0, 3).map((t) => ({
      type: "missed",
      title: `Better card available for ${t.merchant}`,
      body: `Switch to ${t.betterCard} to earn ${fmt(t.missed)} more on this transaction.`,
      time: "This month",
    })),
    ...categories.slice(0, 2).map((c) => ({
      type: "insight",
      title: `Optimise your ${CATEGORY_LABELS[c.category] || c.category} spend`,
      body: `You're leaving ${fmt(c.missed)} on the table in this category.`,
      time: "This month",
    })),
    {
      type: "system",
      title: "Analysis complete",
      body: "Your monthly spending report is ready to review.",
      time: "Just now",
    },
  ];

  const typeStyle = {
    missed:  { color: "var(--red)",    bg: "var(--red-dim)",    icon: "⚠" },
    insight: { color: "var(--accent)", bg: "var(--accent-dim)", icon: "✦" },
    system:  { color: "var(--green)",  bg: "var(--green-dim)",  icon: "✓" },
  };

  return (
    <SlidePanel title="Notifications" subtitle={`${notifications.length} alerts this month`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notifications.map((n, i) => {
          const s = typeStyle[n.type];
          return (
            <div key={i} style={{
              padding: "14px", borderRadius: 12,
              background: "var(--surface-raised)", border: "1px solid var(--border)",
              display: "flex", gap: 12,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: s.bg, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 13, color: s.color,
              }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 6 }}>{n.body}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.04em" }}>{n.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </SlidePanel>
  );
}

// ── SETTINGS PANEL ────────────────────────────────────────────────────────────
export function SettingsPanel({ onClose }) {
  const [settings, setSettings] = useState({
    missedSavingsAlerts: true,
    weeklyDigest: false,
    transactionInsights: true,
    showAnnualFees: true,
    compactView: false,
  });

  function toggle(key) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  return (
    <SlidePanel title="Settings" subtitle="Preferences & configuration" onClose={onClose}>

      <SectionLabel>Notifications</SectionLabel>
      <ToggleRow label="Missed savings alerts" sub="Alert when a better card was available" value={settings.missedSavingsAlerts} onChange={() => toggle("missedSavingsAlerts")} />
      <ToggleRow label="Weekly digest" sub="Summary of your spending every Monday" value={settings.weeklyDigest} onChange={() => toggle("weeklyDigest")} />
      <ToggleRow label="Transaction insights" sub="Real-time tips as you spend" value={settings.transactionInsights} onChange={() => toggle("transactionInsights")} />

      <SectionLabel>Display</SectionLabel>
      <ToggleRow label="Show annual fees" sub="Include card fees in cashback calculations" value={settings.showAnnualFees} onChange={() => toggle("showAnnualFees")} />
      <ToggleRow label="Compact view" sub="Denser layout for the dashboard" value={settings.compactView} onChange={() => toggle("compactView")} />

      <SectionLabel>Data</SectionLabel>
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Currency</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>Display currency for all amounts</div>
        <div style={{
          padding: "8px 12px", borderRadius: 8,
          background: "var(--surface-raised)", border: "1px solid var(--border)",
          fontSize: 13, color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          <span>₹</span> Indian Rupee (INR)
        </div>
      </div>
      <div style={{ padding: "12px 0" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Transaction data</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
          Your data is stored locally and never shared.
        </div>
        <button style={{
          padding: "8px 16px", borderRadius: 8,
          background: "var(--red-dim)", border: "1px solid rgba(244,63,94,0.2)",
          color: "var(--red)", fontSize: 12, fontWeight: 600,
        }}>Clear all data</button>
      </div>
    </SlidePanel>
  );
}

// ── PROFILE PANEL ─────────────────────────────────────────────────────────────
export function ProfilePanel({ onClose, analyzeData, cards }) {
  const efficiencyRate = analyzeData
    ? ((analyzeData.totalActualCashback / analyzeData.totalSpend) * 100).toFixed(1)
    : "—";

  return (
    <SlidePanel title="Profile" subtitle="Your card portfolio & stats" onClose={onClose} width={380}>

      {/* Avatar + name */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px", borderRadius: 14,
        background: "var(--surface-raised)", border: "1px solid var(--border)",
        marginBottom: 4,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #7C6AF7, #4E3FD4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 700, boxShadow: "0 0 20px rgba(124,106,247,0.35)",
        }}>L</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>Lakshay</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Premium Member</div>
        </div>
      </div>

      {/* Stats */}
      {analyzeData && (
        <>
          <SectionLabel>This Month</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 4 }}>
            {[
              { label: "Total Spend", value: fmt(analyzeData.totalSpend), color: "var(--text-primary)" },
              { label: "Cashback", value: fmt(analyzeData.totalActualCashback), color: "var(--green)" },
              { label: "Efficiency", value: efficiencyRate + "%", color: "var(--accent)" },
            ].map((s) => (
              <div key={s.label} style={{
                padding: "12px 10px", borderRadius: 12, textAlign: "center",
                background: "var(--surface-raised)", border: "1px solid var(--border)",
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: s.color, marginBottom: 4 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Card portfolio */}
      <SectionLabel>Card Portfolio ({(cards || []).length} cards)</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(cards || []).map((card, i) => {
          const bestRate = Math.max(...Object.values(card.cashbackRates));
          const hue = (card.name.charCodeAt(0) * 47) % 360;
          return (
            <div key={i} style={{
              padding: "13px 14px", borderRadius: 12,
              background: "var(--surface-raised)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 26, borderRadius: 5, flexShrink: 0,
                background: `linear-gradient(135deg, hsl(${hue},50%,25%), hsl(${hue},50%,15%))`,
                border: `1px solid hsl(${hue},40%,35%)`,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{card.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {card.network} · {card.annualFee === 0 ? "No annual fee" : `₹${card.annualFee}/yr`}
                </div>
              </div>
              <div style={{
                fontSize: 12, fontWeight: 700, color: "var(--green)",
                background: "var(--green-dim)", padding: "3px 8px", borderRadius: 6,
              }}>
                {bestRate}% max
              </div>
            </div>
          );
        })}
      </div>
    </SlidePanel>
  );
}
