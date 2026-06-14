"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Conversation = {
  id: string;
  created_at: string;
  patient_message: string;
  ai_response: string;
  urgency: string;
  language: string;
  session_id: string;
  message_count: number;
};

const urgencyConfig = {
  emergency: { color: "#fee2e2", text: "#dc2626", label: "Akut" },
  urgent: { color: "#ffedd5", text: "#c2410c", label: "Brådskande" },
  routine: { color: "#dcfce7", text: "#16a34a", label: "Rutin" },
  unknown: { color: "#f3f4f6", text: "#6b7280", label: "Okänd" },
};

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadConversations();
  }, [filter]);

  async function loadConversations() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("conversations")
      .select("*")
      .eq("clinic_id", user.id)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("urgency", filter);
    }

    const { data } = await query;
    setConversations(data ?? []);
    setLoading(false);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString("sv-SE", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  const counts = {
    all: conversations.length,
    emergency: conversations.filter(c => c.urgency === "emergency").length,
    urgent: conversations.filter(c => c.urgency === "urgent").length,
    routine: conversations.filter(c => c.urgency === "routine").length,
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* Left panel — conversation list */}
      <div style={{ width: "380px", borderRight: "1px solid #e8d5c4", display: "flex", flexDirection: "column", backgroundColor: "white" }}>
        
        <div style={{ padding: "20px", borderBottom: "1px solid #e8d5c4" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#3d2b1f", marginBottom: "12px" }}>
            Patientkonversationer
          </h1>
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { key: "all", label: `Alla (${counts.all})` },
              { key: "emergency", label: `Akut (${counts.emergency})` },
              { key: "urgent", label: `Bråd. (${counts.urgent})` },
              { key: "routine", label: `Rutin (${counts.routine})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  fontSize: "11px", padding: "4px 8px", borderRadius: "6px", cursor: "pointer",
                  border: "none",
                  backgroundColor: filter === f.key ? "#c17f5a" : "#f5ede3",
                  color: filter === f.key ? "white" : "#7a5c4a",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "20px", color: "#9c7b6b", fontSize: "14px" }}>Laddar...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "20px", color: "#9c7b6b", fontSize: "14px" }}>Inga konversationer ännu</div>
          ) : (
            conversations.map(c => {
              const urg = urgencyConfig[c.urgency as keyof typeof urgencyConfig] ?? urgencyConfig.unknown;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  style={{
                    padding: "16px 20px", cursor: "pointer",
                    borderBottom: "1px solid #f5ede3",
                    backgroundColor: selected?.id === c.id ? "#fdf0e8" : "white",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{
                      fontSize: "11px", padding: "2px 8px", borderRadius: "50px",
                      backgroundColor: urg.color, color: urg.text
                    }}>
                      {urg.label}
                    </span>
                    <span style={{ fontSize: "11px", color: "#b8a090" }}>{formatTime(c.created_at)}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#3d2b1f", marginBottom: "4px", fontWeight: 500 }}>
                    {c.patient_message.length > 60 ? c.patient_message.slice(0, 60) + "..." : c.patient_message}
                  </p>
                  <p style={{ fontSize: "12px", color: "#9c7b6b" }}>
                    {c.message_count ? `${c.message_count} meddelanden` : "1 meddelande"} · {c.language === "sv" ? "🇸🇪" : c.language === "ar" ? "🇸🇦" : "🇬🇧"}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel — conversation detail */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#fdf8f3" }}>
        {!selected ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#b8a090", fontSize: "14px" }}>Välj en konversation för att se detaljer</p>
          </div>
        ) : (
          <>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e8d5c4", backgroundColor: "white" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#9c7b6b", marginBottom: "4px" }}>{formatTime(selected.created_at)}</p>
                  <span style={{
                    fontSize: "12px", padding: "3px 10px", borderRadius: "50px",
                    backgroundColor: urgencyConfig[selected.urgency as keyof typeof urgencyConfig]?.color ?? "#f3f4f6",
                    color: urgencyConfig[selected.urgency as keyof typeof urgencyConfig]?.text ?? "#6b7280",
                  }}>
                    {urgencyConfig[selected.urgency as keyof typeof urgencyConfig]?.label ?? "Okänd"}
                  </span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ fontSize: "13px", color: "#9c7b6b", background: "none", border: "none", cursor: "pointer" }}
                >
                  Stäng
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Patient message */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ maxWidth: "75%" }}>
                    <p style={{ fontSize: "11px", color: "#9c7b6b", marginBottom: "4px", textAlign: "right" }}>Patient</p>
                    <div style={{
                      backgroundColor: "#c17f5a", color: "white",
                      padding: "12px 16px", borderRadius: "16px 16px 4px 16px",
                      fontSize: "14px", lineHeight: 1.6
                    }}>
                      {selected.patient_message}
                    </div>
                  </div>
                </div>

                {/* AI response */}
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ maxWidth: "75%" }}>
                    <p style={{ fontSize: "11px", color: "#9c7b6b", marginBottom: "4px" }}>VårdAI</p>
                    <div style={{
                      backgroundColor: "white", color: "#3d2b1f",
                      padding: "12px 16px", borderRadius: "16px 16px 16px 4px",
                      fontSize: "14px", lineHeight: 1.6,
                      border: "1px solid #e8d5c4"
                    }}>
                      {selected.ai_response}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}