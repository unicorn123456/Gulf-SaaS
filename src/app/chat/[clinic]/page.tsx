"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Message = { role: "user" | "assistant"; content: string };

export default function ClinicChat() {
  const params = useParams();
  const clinicSlug = params.clinic as string;
  const [clinicName, setClinicName] = useState("هلاجAI");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "أهلاً وسهلاً! 👋 أنا مساعد العيادة الذكي. كيف يمكنني مساعدتك اليوم؟\n\nHello! I'm the clinic's AI assistant. How can I help you today?" },
  ]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [urgency, setUrgency] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function loadClinic() {
      const { data } = await supabase
        .from("profiles")
        .select("clinic_name")
        .eq("slug", clinicSlug)
        .single();
      if (data?.clinic_name) setClinicName(data.clinic_name);
    }
    if (clinicSlug && clinicSlug !== "demo") loadClinic();
  }, [clinicSlug]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/receptionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, clinicSlug, sessionId }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply }]);
      setUrgency(data.urgency);
    } catch {
      setMessages([...updated, { role: "assistant", content: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  }

  const urgencyColors: Record<string, string> = {
    emergency: "#DC2626",
    urgent: "#D97706",
    routine: "#059669",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#F8F6FF", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "'IBM Plex Sans Arabic', system-ui" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", height: 620, border: "1px solid #EDE9FF" }}>

        {/* Header */}
        <div style={{ background: "#0F0B2D", color: "white", borderRadius: "20px 20px 0 0", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>{clinicName}</div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              🤖 مساعد ذكاء اصطناعي — متاح ٢٤/٧
            </div>
          </div>
          {urgency && urgency !== "unknown" && (
            <div style={{ background: urgencyColors[urgency] || "#6B7280", color: "white", fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
              {urgency === "emergency" ? "🚨 طارئ" : urgency === "urgent" ? "⚡ عاجل" : "✓ روتيني"}
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-start" : "flex-end", direction: "rtl" }}>
              <div style={{
                maxWidth: "80%", padding: "0.65rem 0.9rem", borderRadius: msg.role === "user" ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
                background: msg.role === "user" ? "#EDE9FF" : "#0F0B2D",
                color: msg.role === "user" ? "#1A1A2E" : "white",
                fontSize: "0.88rem", lineHeight: 1.6, whiteSpace: "pre-wrap",
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-end", direction: "rtl" }}>
              <div style={{ background: "#0F0B2D", color: "rgba(255,255,255,0.6)", padding: "0.65rem 0.9rem", borderRadius: "18px 18px 4px 18px", fontSize: "0.85rem" }}>
                هلاجAI يكتب...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "1rem", borderTop: "1px solid #EDE9FF" }}>
          {urgency === "emergency" && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "0.5rem 0.75rem", marginBottom: "0.75rem", fontSize: "0.78rem", color: "#DC2626", fontWeight: 600 }}>
              🚨 حالة طارئة — يرجى الاتصال بالعيادة فوراً
            </div>
          )}
          <div style={{ display: "flex", gap: "0.5rem", direction: "rtl" }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="اكتب رسالتك هنا..."
              style={{ flex: 1, border: "1.5px solid #EDE9FF", borderRadius: 50, padding: "0.6rem 1rem", fontSize: "0.88rem", outline: "none", direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', system-ui" }}
            />
            <button onClick={sendMessage} disabled={loading} style={{ background: "#C9A84C", color: "white", border: "none", borderRadius: 50, padding: "0.6rem 1.1rem", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem", opacity: loading ? 0.6 : 1 }}>
              إرسال
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.7rem", color: "#9CA3AF" }}>
            مدعوم بـ هلاجAI × Aurive
          </div>
        </div>
      </div>
    </main>
  );
}
