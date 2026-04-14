import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Advisor from "./pages/Advisor";
import Chat from "./pages/Chat";
import { SearchPanel, NotificationsPanel, SettingsPanel, ProfilePanel } from "./components/NavPanels";

function TopNav({ openPanel, setOpenPanel, analyzeData, cards }) {
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

      {/* Search bar — click to open search panel */}
      <div
        onClick={() => setOpenPanel(openPanel === "search" ? null : "search")}
        style={{
          flex: 1, maxWidth: 300,
          display: "flex", alignItems: "center", gap: "8px",
          background: openPanel === "search" ? "var(--surface-raised)" : "var(--surface)",
          border: `1px solid ${openPanel === "search" ? "var(--accent-glow)" : "var(--border)"}`,
          borderRadius: 9, padding: "7px 13px", cursor: "pointer",
          transition: "all 0.15s",
        }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="#3E3E5A" strokeWidth="1.5"/>
          <path d="m21 21-4.35-4.35" stroke="#3E3E5A" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Search insights…</span>
        <span style={{
          marginLeft: "auto", fontSize: 10, color: "var(--text-muted)",
          background: "var(--surface-raised)", padding: "1px 5px", borderRadius: 4,
          border: "1px solid var(--border)",
        }}>⌘K</span>
      </div>

      {/* Right icons */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {[
          {
            id: "notifications",
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            ),
          },
          {
            id: "settings",
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            ),
          },
        ].map(({ id, icon }) => (
          <button
            key={id}
            onClick={() => setOpenPanel(openPanel === id ? null : id)}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: openPanel === id ? "var(--accent-dim)" : "var(--surface)",
              border: openPanel === id ? "1px solid var(--accent-glow)" : "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: openPanel === id ? "var(--accent)" : "var(--text-secondary)",
              transition: "all 0.15s",
              position: "relative",
            }}
          >
            {icon}
            {id === "notifications" && (
              <div style={{
                position: "absolute", top: 6, right: 6,
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--red)", border: "1.5px solid var(--bg)",
              }} />
            )}
          </button>
        ))}

        {/* Profile avatar */}
        <div
          onClick={() => setOpenPanel(openPanel === "profile" ? null : "profile")}
          style={{
            width: 34, height: 34, borderRadius: "50%", cursor: "pointer",
            background: "linear-gradient(135deg, #7C6AF7, #4E3FD4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700,
            boxShadow: openPanel === "profile"
              ? "0 0 0 2px var(--accent)"
              : "0 0 10px rgba(124,106,247,0.3)",
            transition: "box-shadow 0.15s",
          }}>L</div>
      </div>
    </header>
  );
}

function App() {
  const [openPanel, setOpenPanel] = useState(null);
  const [analyzeData, setAnalyzeData] = useState(null);
  const [cards, setCards] = useState([]);

  // Fetch shared data once — used by search, notifications, profile
  useEffect(() => {
    fetch("/api/analyze", { method: "POST" })
      .then((r) => r.json())
      .then(setAnalyzeData)
      .catch(() => {});
    fetch("/api/cards")
      .then((r) => r.json())
      .then(setCards)
      .catch(() => {});
  }, []);

  // Close panel on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpenPanel(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ⌘K shortcut for search
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpenPanel((p) => p === "search" ? null : "search");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <BrowserRouter>
      <TopNav openPanel={openPanel} setOpenPanel={setOpenPanel} analyzeData={analyzeData} cards={cards} />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>

      {openPanel === "search" && (
        <SearchPanel onClose={() => setOpenPanel(null)} analyzeData={analyzeData} cards={cards} />
      )}
      {openPanel === "notifications" && (
        <NotificationsPanel onClose={() => setOpenPanel(null)} analyzeData={analyzeData} />
      )}
      {openPanel === "settings" && (
        <SettingsPanel onClose={() => setOpenPanel(null)} />
      )}
      {openPanel === "profile" && (
        <ProfilePanel onClose={() => setOpenPanel(null)} analyzeData={analyzeData} cards={cards} />
      )}
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
