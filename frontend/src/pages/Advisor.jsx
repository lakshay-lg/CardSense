import React, { useState } from "react";

const EXAMPLE_QUERIES = [
  { merchant: "Swiggy", amount: 850 },
  { merchant: "Amazon", amount: 3499 },
  { merchant: "MakeMyTrip", amount: 8500 },
  { merchant: "Flipkart", amount: 4200 },
  { merchant: "BookMyShow", amount: 900 },
];

const styles = {
  page: { padding: "40px 24px", maxWidth: "680px", margin: "0 auto" },
  heading: { fontSize: "24px", fontWeight: 700, marginBottom: "8px" },
  sub: { color: "#666", marginBottom: "32px", fontSize: "14px" },
  form: {
    background: "#1a1a24", border: "1px solid #2a2a38", borderRadius: "14px",
    padding: "28px", marginBottom: "24px",
  },
  row: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" },
  inputWrap: { display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "140px" },
  label: { fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: {
    background: "#0f0f13", border: "1px solid #2a2a38", borderRadius: "8px",
    padding: "10px 14px", color: "#e8e8ed", fontSize: "15px", outline: "none",
    width: "100%",
  },
  btn: {
    width: "100%", padding: "12px", background: "#7c6af7", border: "none",
    borderRadius: "10px", color: "#fff", fontSize: "15px", fontWeight: 600,
    cursor: "pointer", transition: "opacity 0.15s",
  },
  examples: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" },
  exampleBtn: {
    background: "#1a1a24", border: "1px solid #2a2a38", borderRadius: "8px",
    padding: "6px 14px", color: "#888", fontSize: "13px", cursor: "pointer",
    transition: "border-color 0.15s",
  },
  result: {
    background: "#1a1a24", border: "1px solid #2a2a38", borderRadius: "14px", padding: "28px",
  },
  bestCard: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    marginBottom: "20px", flexWrap: "wrap", gap: "12px",
  },
  cardName: { fontSize: "22px", fontWeight: 700, color: "#e8e8ed" },
  cashbackBadge: {
    background: "#10b98122", color: "#10b981", borderRadius: "10px",
    padding: "8px 18px", fontSize: "20px", fontWeight: 700,
  },
  reasoning: { color: "#aaa", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" },
  altTitle: { fontSize: "12px", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" },
  altRow: {
    display: "flex", justifyContent: "space-between", padding: "10px 14px",
    background: "#0f0f13", borderRadius: "8px", marginBottom: "6px",
    fontSize: "14px",
  },
  error: { color: "#f87171", background: "#2a1a1a", borderRadius: "8px", padding: "16px" },
  loading: { textAlign: "center", padding: "32px", color: "#555" },
};

function fmt(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

export default function Advisor() {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
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

  function fillExample(ex) {
    setMerchant(ex.merchant);
    setAmount(String(ex.amount));
    setResult(null);
    setError(null);
  }

  return (
    <div style={styles.page}>
      <div style={styles.heading}>Card Advisor</div>
      <div style={styles.sub}>Tell me what you're about to spend — I'll pick the optimal card.</div>

      <div style={styles.examples}>
        {EXAMPLE_QUERIES.map((ex) => (
          <button key={ex.merchant} style={styles.exampleBtn} onClick={() => fillExample(ex)}>
            {ex.merchant} · {fmt(ex.amount)}
          </button>
        ))}
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.row}>
          <div style={styles.inputWrap}>
            <label style={styles.label}>Merchant / App</label>
            <input
              style={styles.input}
              placeholder="e.g. Zomato, Amazon, IndiGo"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              required
            />
          </div>
          <div style={{ ...styles.inputWrap, flex: "0 0 160px" }}>
            <label style={styles.label}>Amount (₹)</label>
            <input
              style={styles.input}
              type="number"
              placeholder="2000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              required
            />
          </div>
        </div>
        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? "Analyzing…" : "Find Best Card →"}
        </button>
      </form>

      {loading && <div style={styles.loading}>Asking CardSense AI…</div>}

      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div style={styles.result}>
          <div style={styles.bestCard}>
            <div>
              <div style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", marginBottom: "4px" }}>
                Best card
              </div>
              <div style={styles.cardName}>{result.bestCard}</div>
            </div>
            <div style={styles.cashbackBadge}>+{fmt(result.cashbackAmount)}</div>
          </div>

          <div style={styles.reasoning}>{result.reasoning}</div>

          {result.alternatives?.length > 0 && (
            <>
              <div style={styles.altTitle}>Alternatives</div>
              {result.alternatives.map((alt, i) => (
                <div key={i} style={styles.altRow}>
                  <span style={{ color: "#888" }}>{alt.card}</span>
                  <span style={{ color: "#666" }}>+{fmt(alt.cashbackAmount)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
