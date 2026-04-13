import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Advisor from "./pages/Advisor";
import Chat from "./pages/Chat";

const navStyle = {
  display: "flex",
  gap: "0",
  background: "#1a1a24",
  borderBottom: "1px solid #2a2a38",
  padding: "0 24px",
};

const linkStyle = ({ isActive }) => ({
  padding: "16px 20px",
  textDecoration: "none",
  color: isActive ? "#7c6af7" : "#888",
  borderBottom: isActive ? "2px solid #7c6af7" : "2px solid transparent",
  fontWeight: isActive ? 600 : 400,
  fontSize: "14px",
  transition: "color 0.15s",
});

const headerStyle = {
  background: "#1a1a24",
  padding: "16px 24px",
  borderBottom: "1px solid #2a2a38",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

function App() {
  return (
    <BrowserRouter>
      <header style={headerStyle}>
        <span style={{ fontSize: "22px" }}>💳</span>
        <span style={{ fontWeight: 700, fontSize: "18px", color: "#e8e8ed" }}>CardSense</span>
        <span style={{ fontSize: "12px", color: "#555", marginLeft: "4px" }}>
          Smart Credit Card Advisor
        </span>
      </header>
      <nav style={navStyle}>
        <NavLink to="/" style={linkStyle} end>Dashboard</NavLink>
        <NavLink to="/advisor" style={linkStyle}>Advisor</NavLink>
        <NavLink to="/chat" style={linkStyle}>Chat</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
