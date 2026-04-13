import React, { useState, useRef, useEffect } from "react";

// Render **bold** and newlines without pulling in a markdown library
function renderMarkdown(text) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return <span key={i}>{parts}{i < text.split("\n").length - 1 && <br />}</span>;
  });
}

const STARTERS = [
  "Which card should I use for groceries?",
  "How much cashback did I miss last month?",
  "Am I using my travel card optimally?",
  "What's my best card for Zomato orders?",
];

const styles = {
  page: { display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" },
  messages: {
    flex: 1, overflowY: "auto", padding: "24px",
    display: "flex", flexDirection: "column", gap: "16px",
  },
  bubble: (role) => ({
    maxWidth: "680px",
    alignSelf: role === "user" ? "flex-end" : "flex-start",
    background: role === "user" ? "#7c6af722" : "#1a1a24",
    border: role === "user" ? "1px solid #7c6af755" : "1px solid #2a2a38",
    borderRadius: role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
    padding: "14px 18px",
    fontSize: "14px",
    lineHeight: "1.65",
    color: "#e0e0ea",
  }),
  roleLabel: (role) => ({
    fontSize: "11px",
    color: role === "user" ? "#7c6af7" : "#555",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  }),
  inputRow: {
    padding: "16px 24px",
    borderTop: "1px solid #2a2a38",
    background: "#0f0f13",
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  input: {
    flex: 1, background: "#1a1a24", border: "1px solid #2a2a38",
    borderRadius: "10px", padding: "12px 16px", color: "#e8e8ed",
    fontSize: "14px", outline: "none", resize: "none", lineHeight: "1.5",
    fontFamily: "inherit",
  },
  sendBtn: {
    background: "#7c6af7", border: "none", borderRadius: "10px",
    padding: "12px 20px", color: "#fff", fontWeight: 600,
    cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap",
  },
  starters: {
    padding: "0 24px 24px",
    display: "flex", gap: "8px", flexWrap: "wrap",
  },
  starterBtn: {
    background: "#1a1a24", border: "1px solid #2a2a38", borderRadius: "8px",
    padding: "8px 14px", color: "#888", fontSize: "13px", cursor: "pointer",
  },
  thinking: {
    alignSelf: "flex-start", color: "#555", fontSize: "13px",
    padding: "10px 4px",
  },
  emptyState: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    color: "#555", gap: "8px",
  },
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Build history in Claude's expected format (exclude the just-added user message
    // since the backend adds its own context-wrapped version)
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setMessages([...newMessages, { role: "assistant", content: json.reply }]);
    } catch (e) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: `Sorry, something went wrong: ${e.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const showEmpty = messages.length === 0;

  return (
    <div style={styles.page}>
      <div style={styles.messages}>
        {showEmpty && (
          <div style={styles.emptyState}>
            <span style={{ fontSize: "32px" }}>💳</span>
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#888" }}>
              Ask CardSense anything
            </span>
            <span style={{ fontSize: "13px" }}>
              I know your cards and all your recent transactions.
            </span>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "680px" }}>
            <div style={styles.roleLabel(m.role)}>
              {m.role === "user" ? "You" : "CardSense"}
            </div>
            <div style={styles.bubble(m.role)}>
              {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={styles.thinking}>CardSense is thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>

      {showEmpty && (
        <div style={styles.starters}>
          {STARTERS.map((s) => (
            <button key={s} style={styles.starterBtn} onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={styles.inputRow}>
        <textarea
          style={styles.input}
          placeholder="Ask about your spending, cards, or upcoming purchases…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button style={styles.sendBtn} onClick={() => sendMessage(input)} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
