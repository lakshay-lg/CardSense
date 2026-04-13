import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const styles = {
  page: { padding: "32px 24px", maxWidth: "960px", margin: "0 auto" },
  heroRow: { display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" },
  heroCard: (accent) => ({
    flex: "1 1 180px",
    minWidth: "160px",
    background: "#1a1a24",
    border: `1px solid ${accent}33`,
    borderRadius: "12px",
    padding: "24px",
  }),
  heroLabel: { fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" },
  heroValue: (accent) => ({ fontSize: "32px", fontWeight: 700, color: accent, marginTop: "8px" }),
  heroSub: { fontSize: "13px", color: "#555", marginTop: "4px" },
  section: { marginBottom: "32px" },
  sectionTitle: { fontSize: "16px", fontWeight: 600, color: "#c0c0cc", marginBottom: "16px" },
  chartWrap: { background: "#1a1a24", borderRadius: "12px", padding: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: "12px", color: "#555", padding: "8px 12px", borderBottom: "1px solid #2a2a38" },
  td: { padding: "12px", fontSize: "14px", borderBottom: "1px solid #1e1e2a", verticalAlign: "top" },
  badge: (color) => ({
    display: "inline-block",
    background: color + "22",
    color,
    borderRadius: "6px",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: 600,
  }),
  loadingWrap: { display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "#555" },
  errorWrap: { color: "#f87171", background: "#2a1a1a", borderRadius: "8px", padding: "16px", margin: "24px" },
  retryBtn: {
    marginTop: "12px", padding: "8px 20px", background: "#7c6af7",
    border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontSize: "14px",
  },
};

const COLORS = ["#7c6af7", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#a78bfa", "#34d399"];

const CATEGORY_LABELS = {
  food_delivery: "Food Delivery",
  travel: "Travel",
  online_shopping: "Online Shopping",
  fuel: "Fuel",
  groceries: "Groceries",
  entertainment: "Entertainment",
  others: "Others",
};

function fmt(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
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
      <div style={styles.loadingWrap}>
        <span>Analyzing your transactions with AI…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorWrap}>
        <div>Failed to load analysis: {error}</div>
        <button style={styles.retryBtn} onClick={load}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const chartData = (data.byCategory || []).map((c, i) => ({
    name: CATEGORY_LABELS[c.category] || c.category,
    missed: c.missed,
    spend: c.spend,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div style={styles.page}>
      {/* Hero KPIs */}
      <div style={styles.heroRow}>
        <div style={styles.heroCard("#e8e8ed")}>
          <div style={styles.heroLabel}>Total Spend</div>
          <div style={styles.heroValue("#e8e8ed")}>{fmt(data.totalSpend)}</div>
          <div style={styles.heroSub}>This month</div>
        </div>
        <div style={styles.heroCard("#10b981")}>
          <div style={styles.heroLabel}>Cashback Earned</div>
          <div style={styles.heroValue("#10b981")}>{fmt(data.totalActualCashback)}</div>
          <div style={styles.heroSub}>With cards used</div>
        </div>
        <div style={styles.heroCard("#f59e0b")}>
          <div style={styles.heroLabel}>Max Possible</div>
          <div style={styles.heroValue("#f59e0b")}>{fmt(data.totalPossibleCashback)}</div>
          <div style={styles.heroSub}>If optimal cards used</div>
        </div>
        <div style={styles.heroCard("#f43f5e")}>
          <div style={styles.heroLabel}>Left on Table</div>
          <div style={styles.heroValue("#f43f5e")}>{fmt(data.missedSavings)}</div>
          <div style={styles.heroSub}>Missed savings</div>
        </div>
      </div>

      {/* Missed savings by category */}
      {chartData.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Missed Savings by Category</div>
          <div style={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => "₹" + v} />
                <Tooltip
                  contentStyle={{
                    background: "#12121a",
                    border: "1px solid #3a3a50",
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  }}
                  labelStyle={{ color: "#e8e8ed", fontWeight: 600, marginBottom: "4px" }}
                  itemStyle={{ color: "#a0a0b8" }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  formatter={(v) => ["₹" + v, "Missed"]}
                />
                <Bar dataKey="missed" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top missed transactions */}
      {data.topMissedTransactions?.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Top Missed Opportunities</div>
          <div style={{ background: "#1a1a24", borderRadius: "12px", overflow: "hidden" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Merchant</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Card Used</th>
                  <th style={styles.th}>Better Card</th>
                  <th style={styles.th}>Missed</th>
                </tr>
              </thead>
              <tbody>
                {data.topMissedTransactions.map((t, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{t.merchant}</td>
                    <td style={styles.td}>{fmt(t.amount)}</td>
                    <td style={styles.td}>
                      <span style={styles.badge("#888")}>{t.usedCard}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge("#7c6af7")}>{t.betterCard}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: "#f43f5e", fontWeight: 600 }}>{fmt(t.missed)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
