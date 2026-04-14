import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Advisor from "./pages/Advisor";
import Chat from "./pages/Chat";

function TopNav() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      height: "var(--nav-h)",
      background: "rgba(9,9,15,0.90)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", gap: "28px",
      padding: "0 28px",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "9px", flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: "linear-gradient(135deg, #7C6AF7 0%, #4E3FD4 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, boxShadow: "0 0 12px rgba(124,106,247,0.35)",
        }}>💳</div>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
          color: "var(--text-primary)", letterSpacing: "-0.01em",
        }}>CardSense</span>
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: 3 }}>
        {[
          { to: "/", label: "Dashboard", end: true },
          { to: "/advisor", label: "Advisor" },
          { to: "/chat", label: "Chat" },
        ].map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            padding: "6px 13px", borderRadius: 8,
            textDecoration: "none", fontSize: 13, fontWeight: isActive ? 600 : 400,
            color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
            background: isActive ? "var(--surface-raised)" : "transparent",
            border: isActive ? "1px solid var(--border-light)" : "1px solid transparent",
            transition: "all 0.15s",
          })}>{label}</NavLink>
        ))}
      </nav>

      {/* Search */}
      <div style={{
        flex: 1, maxWidth: 300,
        display: "flex", alignItems: "center", gap: "8px",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 9, padding: "7px 13px", cursor: "text",
      }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="#3E3E5A" strokeWidth="1.5"/>
          <path d="M11 11L14 14" stroke="#3E3E5A" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Search insights…</span>
      </div>

      {/* Right icons */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {[
          <svg key="bell" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5"/></svg>,
          <svg key="settings" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.5"/></svg>,
        ].map((icon, i) => (
          <button key={i} style={{
            width: 34, height: 34, borderRadius: 8,
            background: "var(--surface)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-secondary)",
          }}>{icon}</button>
        ))}
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, #7C6AF7, #4E3FD4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, boxShadow: "0 0 10px rgba(124,106,247,0.3)",
        }}>L</div>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
