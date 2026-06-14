"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

const DEMO_CLINICS = [
  { name: "SmileCare Tandläkare", slug: "smilecare", type: "Tandläkare" },
];

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hej! Välkommen till VårdAI-demon. Jag är en AI-receptionist för SmileCare Tandläkare. Hur kan jag hjälpa dig idag? / Hello! I'm an AI receptionist for SmileCare. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: "user", content: input };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/receptionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, clinicSlug: "smilecare", sessionId }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Något gick fel. Försök igen." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdf8f3" }}>

      {/* Nav */}
      <nav style={{ padding: "16px 40px", borderBottom: "1px solid #e8d5c4", backgroundColor: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#5c3d2e" }}>VårdAI</span>
        <a href="/login" style={{
          backgroundColor: "#c17f5a", color: "white", padding: "8px 20px",
          borderRadius: "50px", fontSize: "13px", textDecoration: "none"
        }}>
          Skapa konto gratis
        </a>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-block", backgroundColor: "#f5ede3", color: "#c17f5a",
            fontSize: "12px", fontWeight: 500, padding: "6px 16px", borderRadius: "50px",
            marginBottom: "16px", letterSpacing: "0.05em"
          }}>
            LIVE DEMO
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", color: "#3d2b1f", marginBottom: "12px" }}>
            Testa AI-receptionisten
          </h1>
          <p style={{ color: "#9c7b6b", fontSize: "16px", maxWidth: "500px", margin: "0 auto" }}>
            Chatta med VårdAI precis som dina patienter skulle göra. Prova på svenska, engelska eller arabiska.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "start" }}>

          {/* Chat */}
          <div style={{ backgroundColor: "white", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden", border: "1px solid #e8d5c4" }}>
            <div style={{ backgroundColor: "#c17f5a", padding: "20px 24px" }}>
              <h2 style={{ color: "white", fontSize: "16px", fontWeight: 600, margin: 0 }}>SmileCare Tandläkare</h2>
              <p style={{ color: "#f5ede3", fontSize: "13px", margin: "4px 0 0" }}>AI-driven klinikassistent</p>
            </div>

            <div style={{ height: "360px", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "80%", padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    fontSize: "14px", lineHeight: 1.5,
                    backgroundColor: msg.role === "user" ? "#c17f5a" : "#f5ede3",
                    color: msg.role === "user" ? "white" : "#3d2b1f",
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ backgroundColor: "#f5ede3", color: "#9c7b6b", padding: "10px 14px", borderRadius: "16px 16px 16px 4px", fontSize: "14px" }}>
                    VårdAI skriver...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: "12px 16px", borderTop: "1px solid #e8d5c4", display: "flex", gap: "8px" }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Skriv ett meddelande..."
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: "10px",
                  border: "1px solid #e8d5c4", fontSize: "14px",
                  backgroundColor: "white", color: "#3d2b1f", outline: "none"
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                style={{
                  padding: "10px 16px", borderRadius: "10px", border: "none",
                  backgroundColor: "#c17f5a", color: "white", fontSize: "14px",
                  cursor: "pointer", opacity: loading ? 0.5 : 1
                }}
              >
                Skicka
              </button>
            </div>
          </div>

          {/* Right side — prompts and CTA */}
          <div>
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e8d5c4", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#3d2b1f", marginBottom: "16px" }}>
                Prova dessa meddelanden
              </h3>
              {[
                "Jag har ont i tanden och vill boka tid",
                "I have a dental emergency, my face is swelling",
                "أريد حجز موعد لتنظيف الأسنان",
                "Vad kostar en tandstensrengöring?",
                "Jag vill avboka min tid imorgon",
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "10px 14px", marginBottom: "8px", borderRadius: "10px",
                    border: "1px solid #e8d5c4", backgroundColor: "#fdf8f3",
                    fontSize: "13px", color: "#5c3d2e", cursor: "pointer"
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div style={{ backgroundColor: "#c17f5a", borderRadius: "16px", padding: "24px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "white", marginBottom: "8px" }}>
                Imponerad?
              </h3>
              <p style={{ color: "#f5ede3", fontSize: "14px", marginBottom: "20px", lineHeight: 1.6 }}>
                Sätt upp din klinik på 10 minuter. Första månaden gratis.
              </p>
              <a href="/login" style={{
                display: "block", backgroundColor: "white", color: "#c17f5a",
                padding: "12px", borderRadius: "10px", fontSize: "14px",
                fontWeight: 600, textDecoration: "none"
              }}>
                Kom igång gratis →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}