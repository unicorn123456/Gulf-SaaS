"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Conversation = {
  id: string;
  created_at: string;
  clinic_id: string;
  patient_message: string;
  ai_response: string;
  urgency: string;
  language: string;
};

const urgencyConfig: Record<string, { color: string; label: string; dot: string }> = {
  emergency: { color: "background:#FEF2F2;color:#DC2626;border:1px solid #FECACA", dot: "#DC2626", label: "🚨 طارئ" },
  urgent:    { color: "background:#FFFBEB;color:#D97706;border:1px solid #FDE68A", dot: "#D97706", label: "⚡ عاجل" },
  routine:   { color: "background:#ECFDF5;color:#059669;border:1px solid #A7F3D0", dot: "#059669", label: "✓ روتيني" },
  unknown:   { color: "background:#F9FAFB;color:#6B7280;border:1px solid #E5E7EB", dot: "#9CA3AF", label: "غير محدد" },
};

// Gulf prayer times (Riyadh as default)
const PRAYER_TIMES = [
  { name: "الفجر", time: "05:12" },
  { name: "الظهر", time: "12:18" },
  { name: "العصر", time: "15:42" },
  { name: "المغرب", time: "18:26" },
  { name: "العشاء", time: "19:56" },
];

export default function Dashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [clinicSlug, setClinicSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchConversations();
    loadSlug();

    const channel = supabase.channel("conversations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" },
        (payload) => setConversations(prev => [payload.new as Conversation, ...prev])
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadSlug() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("profiles").select("slug").eq("id", user.id).single();
      if (data?.slug) setClinicSlug(data.slug);
    }
  }

  async function fetchConversations() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("conversations").select("*")
        .eq("clinic_id", user.id).order("created_at", { ascending: false }).limit(50);
      setConversations(data || []);
    }
    setLoading(false);
  }

  const filtered = conversations.filter(c => filter === "all" || c.urgency === filter);
  const stats = {
    total: conversations.length,
    emergency: conversations.filter(c => c.urgency === "emergency").length,
    urgent: conversations.filter(c => c.urgency === "urgent").length,
    routine: conversations.filter(c => c.urgency === "routine").length,
  };

  const chatLink = clinicSlug ? `${typeof window !== "undefined" ? window.location.origin : ""}/chat/${clinicSlug}` : "";

  function copyLink() {
    navigator.clipboard.writeText(chatLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui", direction: "rtl" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F0B2D" }}>لوحة التحكم</h1>
        {clinicSlug && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "#EDE9FF", padding: "0.5rem 1rem", borderRadius: 50, fontSize: "0.82rem" }}>
            <span style={{ color: "#6B7280" }}>رابط الشات:</span>
            <span style={{ color: "#1B1464", fontWeight: 600, direction: "ltr" }}>/chat/{clinicSlug}</span>
            <button onClick={copyLink} style={{ background: "#1B1464", color: "white", border: "none", borderRadius: 50, padding: "3px 12px", cursor: "pointer", fontSize: "0.78rem" }}>
              {copied ? "✓ تم النسخ" : "نسخ"}
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "إجمالي المحادثات", value: stats.total, color: "#1B1464" },
          { label: "🚨 حالات طارئة", value: stats.emergency, color: "#DC2626" },
          { label: "⚡ حالات عاجلة", value: stats.urgent, color: "#D97706" },
          { label: "✓ حالات روتينية", value: stats.routine, color: "#059669" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 12, padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "#6B7280", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Prayer times bar */}
      <div style={{ background: "#FFFBF0", border: "1px solid #FDE68A", borderRadius: 12, padding: "0.75rem 1.25rem", marginBottom: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#92400E" }}>⏰ أوقات الصلاة اليوم:</span>
        {PRAYER_TIMES.map((p, i) => (
          <span key={i} style={{ fontSize: "0.8rem", color: "#92400E", background: "rgba(255,255,255,0.7)", padding: "2px 10px", borderRadius: 99 }}>
            {p.name} {p.time}
          </span>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {[["all", "الكل"], ["emergency", "🚨 طارئ"], ["urgent", "⚡ عاجل"], ["routine", "✓ روتيني"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding: "0.4rem 1rem", borderRadius: 50, fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", border: "1.5px solid", borderColor: filter === val ? "#1B1464" : "#E5E7EB", background: filter === val ? "#1B1464" : "white", color: filter === val ? "white" : "#374151" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Conversations */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280" }}>جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280", background: "white", borderRadius: 12, border: "1px solid #EDE9FF" }}>
          لا توجد محادثات بعد.<br />
          <span style={{ fontSize: "0.85rem" }}>شارك رابط الشات مع مرضاك لتبدأ المحادثات</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map(c => {
            const uc = urgencyConfig[c.urgency] || urgencyConfig.unknown;
            return (
              <div key={c.id} style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 12, padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 600, ...Object.fromEntries(uc.color.split(";").map(s => s.split(":"))) }}>
                      {uc.label}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                      {c.language === "ar" ? "🇸🇦 عربي" : c.language === "en" ? "🇬🇧 إنجليزي" : c.language}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                    {new Date(c.created_at).toLocaleString("ar-SA")}
                  </span>
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.78rem", color: "#9CA3AF", marginBottom: "4px" }}>رسالة المريض:</div>
                  <div style={{ fontSize: "0.88rem", color: "#374151", background: "#F9FAFB", padding: "0.65rem", borderRadius: 8, lineHeight: 1.6 }}>{c.patient_message}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "#9CA3AF", marginBottom: "4px" }}>رد هلاجAI:</div>
                  <div style={{ fontSize: "0.88rem", color: "#374151", background: "#EDE9FF", padding: "0.65rem", borderRadius: 8, lineHeight: 1.6 }}>{c.ai_response}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
