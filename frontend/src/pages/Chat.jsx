import React, { useState, useRef, useEffect } from "react";

function renderMarkdown(text) {
  return text.split("\n").map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return <span key={i}>{parts}{i < arr.length - 1 && <br />}</span>;
  });
}

const QUICK_ACTIONS = [
  "Maximise Starbucks rewards",
  "Switch card for Groceries",
  "Compare Amex vs Chase",
  "Spending summary",
];

const STARTERS = [
  "Which card should I use for groceries?",
  "How much cashback did I miss last month?",
  "Am I using my travel card optimally?",
  "What's my best card for Zomato orders?",
];

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
      setMessages([...newMessages, { role: "assistant", content: `Sorry, something went wrong: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const showEmpty = messages.length === 0;

  return (
    <div style={{ display: "flex", height: "calc(100vh - var(--nav-h))", overflow: "hidden" }}>
      {/* Main chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Chat header */}
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
              color: "var(--text-primary)", marginBottom: 3,
            }}>Financial Assistant</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Real-time spending analysis & card optimisation
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "var(--green)",
              boxShadow: "0 0 6px var(--green)", marginTop: 8,
            }} />
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 24px",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          {showEmpty && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 12, padding: "40px 0",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "var(--accent-dim)", border: "1px solid var(--accent-glow)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>💳</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)" }}>
                Ask CardSense anything
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 300 }}>
                I have access to your cards and recent transactions.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} style={{
                    padding: "7px 14px", borderRadius: 99,
                    background: "var(--surface)", border: "1px solid var(--border-light)",
                    color: "var(--text-secondary)", fontSize: 12, fontWeight: 500,
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              flexDirection: m.role === "user" ? "row-reverse" : "row",
              gap: 10, alignItems: "flex-end",
            }}>
              {m.role === "assistant" && (
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: "var(--accent-dim)", border: "1px solid var(--accent-glow)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                }}>✦</div>
              )}
              <div style={{
                maxWidth: "72%",
                padding: "12px 16px",
                borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                background: m.role === "user"
                  ? "linear-gradient(135deg, rgba(124,106,247,0.2), rgba(124,106,247,0.1))"
                  : "var(--surface)",
                border: m.role === "user"
                  ? "1px solid rgba(124,106,247,0.3)"
                  : "1px solid var(--border)",
                fontSize: 13, lineHeight: 1.65, color: "var(--text-primary)",
              }}>
                {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
              </div>
              {m.role === "user" && (
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #7C6AF7, #4E3FD4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                }}>L</div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "var(--accent-dim)", border: "1px solid var(--accent-glow)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
              }}>✦</div>
              <div style={{
                padding: "12px 16px", borderRadius: "14px 14px 14px 2px",
                background: "var(--surface)", border: "1px solid var(--border)",
                display: "flex", gap: 5, alignItems: "center",
              }}>
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{
                    width: 5, height: 5, borderRadius: "50%", background: "var(--text-muted)",
                    animation: "bounce 1s ease infinite",
                    animationDelay: `${d * 0.18}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
              40% { transform: scale(1); opacity: 1; }
            }
          `}</style>
          <div ref={bottomRef} />
        </div>

        {/* Quick actions */}
        {messages.length > 0 && (
          <div style={{
            padding: "0 24px 12px",
            display: "flex", gap: 8, flexWrap: "wrap",
          }}>
            {QUICK_ACTIONS.map((a) => (
              <button key={a} onClick={() => sendMessage(a)} style={{
                padding: "6px 13px", borderRadius: 99,
                background: "var(--surface)", border: "1px solid var(--border-light)",
                color: "var(--text-secondary)", fontSize: 12, fontWeight: 500,
                transition: "all 0.12s",
              }}>{a}</button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div style={{
          padding: "12px 16px", borderTop: "1px solid var(--border)",
          background: "var(--surface)",
          display: "flex", gap: 8, alignItems: "flex-end",
        }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            background: "var(--bg)", border: "1px solid var(--border-light)",
            borderRadius: 12, padding: "8px 14px", gap: 10,
          }}>
            <textarea
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "var(--text-primary)", fontSize: 13, resize: "none",
                lineHeight: 1.5, maxHeight: 120, fontFamily: "var(--font-body)",
              }}
              placeholder="Ask about your cards or spending…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button style={{
              background: "none", border: "none", color: "var(--text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={loading}
            style={{
              padding: "10px 18px", borderRadius: 10, flexShrink: 0,
              background: input.trim() && !loading
                ? "linear-gradient(135deg, #7C6AF7, #4E3FD4)"
                : "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: input.trim() && !loading ? "#fff" : "var(--text-muted)",
              fontWeight: 700, fontSize: 12, letterSpacing: "0.04em",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: input.trim() && !loading ? "0 4px 12px rgba(124,106,247,0.3)" : "none",
              transition: "all 0.15s",
            }}
          >
            SEND
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Right: Live Context panel */}
      <div style={{
        width: 240, flexShrink: 0,
        borderLeft: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "20px 16px",
        overflowY: "auto",
        height: "calc(100vh - var(--nav-h))",
      }}>
        <div style={{
          fontSize: 10, color: "var(--text-muted)", fontWeight: 600,
          letterSpacing: "0.12em", marginBottom: 16, textTransform: "uppercase",
        }}>Live Context</div>

        {/* Primary card */}
        <div style={{
          background: "var(--surface-raised)", borderRadius: 12,
          border: "1px solid var(--border)", padding: "14px", marginBottom: 10,
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10,
          }}>
            <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.1em" }}>
              PRIMARY CARD
            </div>
            <div style={{
              width: 20, height: 14, borderRadius: 3,
              background: "linear-gradient(135deg, #10B981, #059669)",
            }} />
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Sapphire Reserve</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Earns 3x on Dining</div>
        </div>

        {/* Optimisation alert */}
        <div style={{
          background: "rgba(245,158,11,0.06)", borderRadius: 12,
          border: "1px solid rgba(245,158,11,0.15)", padding: "14px", marginBottom: 10,
        }}>
          <div style={{
            display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#F59E0B" strokeWidth="1.5"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div style={{ fontSize: 10, color: "var(--amber)", fontWeight: 700, letterSpacing: "0.08em" }}>
              OPTIMISATION ALERT
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Inefficient Card Use — Using 1% back card at Merchant. Prime card earns 3x more.
          </div>
        </div>

        {/* Monthly goal */}
        <div style={{
          background: "var(--surface-raised)", borderRadius: 12,
          border: "1px solid var(--border)", padding: "14px",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10,
          }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.1em" }}>
              MONTHLY GOAL
            </div>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>₹450 / ₹500</span>
          </div>
          <div style={{ height: 5, background: "var(--border-light)", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
            <div style={{
              height: "100%", width: "90%", borderRadius: 99,
              background: "linear-gradient(90deg, #7C6AF7, #06B6D4)",
            }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            90% of your cashback target achieved
          </div>
        </div>

        {/* Conversation stats - shown when chatting */}
        {messages.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ height: 1, background: "var(--border)", marginBottom: 14 }} />
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 10 }}>
              THIS SESSION
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                flex: 1, padding: "10px 8px", borderRadius: 10,
                background: "var(--surface-raised)", border: "1px solid var(--border)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--accent)" }}>
                  {messages.filter(m => m.role === "user").length}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>QUESTIONS</div>
              </div>
              <div style={{
                flex: 1, padding: "10px 8px", borderRadius: 10,
                background: "var(--surface-raised)", border: "1px solid var(--border)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--green)" }}>
                  {messages.filter(m => m.role === "assistant").length}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>INSIGHTS</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
