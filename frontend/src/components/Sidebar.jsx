import React from "react";

const NAV_ITEMS = [
  {
    id: "profile", label: "Profile",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    id: "filters", label: "Filters",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    id: "financial-health", label: "Financial Health",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    id: "privacy", label: "Privacy",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
];

export default function Sidebar({ active = "filters" }) {
  return (
    <aside style={{
      width: 200, flexShrink: 0,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      height: "calc(100vh - var(--nav-h))",
      position: "sticky",
      top: "var(--nav-h)",
      overflow: "hidden",
    }}>
      {/* Branding */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{
          fontSize: 10, color: "var(--accent)", letterSpacing: "0.12em",
          fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 3,
        }}>CARDSENSE ADVISOR</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
          PREMIUM INTELLIGENCE
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: "12px 10px", flex: 1 }}>
        <div style={{
          fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em",
          fontWeight: 600, padding: "0 8px 8px", textTransform: "uppercase",
        }}>Navigation</div>

        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 10px", borderRadius: 8, marginBottom: 2,
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              background: isActive ? "var(--surface-raised)" : "transparent",
              border: isActive ? "1px solid var(--border-light)" : "1px solid transparent",
              fontSize: 13, fontWeight: isActive ? 500 : 400,
              cursor: "pointer", transition: "all 0.12s",
            }}>
              {item.icon}
              {item.label}
            </div>
          );
        })}
      </div>

      {/* Portfolio Status */}
      <div style={{
        padding: "14px 16px",
        borderTop: "1px solid var(--border)",
        background: "linear-gradient(180deg, transparent, rgba(124,106,247,0.04))",
      }}>
        <div style={{
          fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em",
          fontWeight: 600, marginBottom: 6, textTransform: "uppercase",
        }}>Portfolio Status</div>
        <div style={{
          fontSize: 24, fontWeight: 800, color: "var(--green)",
          fontFamily: "var(--font-display)", lineHeight: 1, marginBottom: 2,
        }}>+12.5%</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 12 }}>
          EFFICIENCY SCORE
        </div>
        <button style={{
          width: "100%", padding: "9px 0", borderRadius: 8,
          background: "linear-gradient(135deg, #7C6AF7, #4E3FD4)",
          border: "none", color: "#fff", fontWeight: 700, fontSize: 11,
          letterSpacing: "0.06em", boxShadow: "0 4px 12px rgba(124,106,247,0.3)",
        }}>OPTIMIZE PORTFOLIO</button>
      </div>
    </aside>
  );
}
