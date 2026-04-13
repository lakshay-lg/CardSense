require("dotenv").config();
const express = require("express");
const path = require("path");
const { recommend, analyze, chat } = require("./services/claude");

const cards = require("./data/cards.json");
const transactions = require("./data/transactions.json");

const app = express();
app.use(express.json());

// In production, serve the built React app from backend process
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(staticPath));
}

// ── /api/recommend ──────────────────────────────────────────────────────────
// Hero feature: "I'm about to spend ₹2000 on Zomato — which card?"
app.post("/api/recommend", async (req, res) => {
  const { merchant, amount, category } = req.body;

  if (!merchant || !amount) {
    return res.status(400).json({ error: "merchant and amount are required" });
  }

  try {
    const result = await recommend({ merchant, amount, category, cards });
    res.json(result);
  } catch (err) {
    if (err.message === "Claude API timeout") {
      return res.status(504).json({ error: "AI response timed out. Try again." });
    }
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "AI response malformed" });
    }
    if (err.status === 529 || err.message?.includes("Overloaded")) {
      return res.status(503).json({ error: "Claude API is overloaded. Please try again in a moment." });
    }
    console.error("[/api/recommend]", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── /api/analyze ─────────────────────────────────────────────────────────────
// Dashboard: full transaction history analysis + missed savings breakdown
app.post("/api/analyze", async (req, res) => {
  try {
    const result = await analyze({ transactions, cards });
    res.json(result);
  } catch (err) {
    if (err.message === "Claude API timeout") {
      return res.status(504).json({ error: "AI response timed out. Try again." });
    }
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "AI response malformed" });
    }
    if (err.status === 529 || err.message?.includes("Overloaded")) {
      return res.status(503).json({ error: "Claude API is overloaded. Please try again in a moment." });
    }
    console.error("[/api/analyze]", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── /api/chat ────────────────────────────────────────────────────────────────
// Conversational advisor; client sends {message, history} where history is
// an array of {role, content} pairs for multi-turn context.
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const reply = await chat({
      userMessage: message,
      transactions,
      cards,
      history: history || [],
    });
    res.json({ reply });
  } catch (err) {
    if (err.message === "Claude API timeout") {
      return res.status(504).json({ error: "AI response timed out. Try again." });
    }
    if (err.status === 529 || err.message?.includes("Overloaded")) {
      return res.status(503).json({ error: "Claude API is overloaded. Please try again in a moment." });
    }
    console.error("[/api/chat]", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Catch-all: send React app for client-side routing (production only)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CardSense backend running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
