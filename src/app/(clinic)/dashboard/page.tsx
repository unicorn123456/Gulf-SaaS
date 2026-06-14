"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Conversation = {
  id: string;
  created_at: string;
  patient_message: string;
  ai_response: string;
  urgency: string;
  language: string;
};

type Appointment = {
  id: string;
  patient_name: string;
  appointment_date: string;
  treatment_type: string;
  status: string;
};

// Hijri conversion
function toHijri(date: Date): string {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  const months = ["محرم","صفر","ربيع الأول","ربيع الآخر","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
  return `${day} ${months[month - 1]} ${year} هـ`;
}

const PRAYER_TIMES = [
  { name: "الفجر", time: "05:12", block: "05:00–05:30" },
  { name: "الظهر", time: "12:18", block: "12:00–12:45" },
  { name: "العصر", time: "15:42", block: "15:30–16:00" },
  { name: "المغرب", time: "18:26", block: "18:15–18:45" },
  { name: "العشاء", time: "19:56", block: "19:45–20:15" },
];

const urgencyConfig: Record<string, { label: string; color: string; bg: string }> = {
  emergency: { label: "طارئ", color: "#DC2626", bg: "#FEF2F2" },
  urgent:    { label: "عاجل", color: "#D97706", bg: "#FFFBEB" },
  routine:   { label: "روتيني", color: "#059669", bg: "#ECFDF5" },
  unknown:   { label: "غير محدد", color: "#6B7280", bg: "#F9FAFB" },
};

export default function Dashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinicSlug, setClinicSlug] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState("");
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("all");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const hijriDate = toHijri(today);
  const gregDate = today.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    loadData();
    const channel = supabase.channel("conversations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" },
        payload => setConversations(prev => [payload.new as Conversation, ...prev])
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [{ data: profile }, { data: convs }, { data: appts }] = await Promise.all([
      supabase.from("profiles").select("slug, clinic_name").eq("id", user.id).single(),
      supabase.from("conversations").select("*").eq("clinic_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("appointments").select("*").eq("clinic_id", user.id).gte("appointment_date", `${todayStr}T00:00:00`).order("appointment_date", { ascending: true }).limit(10),
    ]);

    if (profile?.slug) setClinicSlug(profile.slug);
    if (profile?.clinic_name) setClinicName(profile.clinic_name);
    setConversations(convs || []);
    setAppointments(appts || []);
    setLoading(false);
  }

  const chatLink = clinicSlug ? `${typeof window !== "undefined" ? window.location.origin : ""}/chat/${clinicSlug}` : "";

  function copyLink() {
    navigator.clipboard.writeText(chatLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filtered = conversations.filter(c => filter === "all" || c.urgency === filter);
  const stats = {
    total: conversations.length,
    emergency: conversations.filter(c => c.urgency === "emergency").length,
    urgent: conversations.filter(c => c.urgency === "urgent").length,
    todayAppts: appointments.length,
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", direction: "rtl" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F0B2D" }}>
            {clinicName ? `مرحباً، ${clinicName}` : "لوحة التحكم"}
          </h1>
          <div style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: 2 }}>
            {gregDate} — <span style={{ color: "#C9A84C", fontWeight: 600 }}>{hijriDate}</span>
          </div>
        </div>
        {clinicSlug && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "#EDE9FF", padding: "0.5rem 1rem", borderRadius: 50, fontSize: "0.8rem", flexWrap: "wrap" }}>
            <span style={{ color: "#6B7280" }}>رابط الشات:</span>
            <span style={{ color: "#1B1464", fontWeight: 600, direction: "ltr", fontSize: "0.75rem" }}>/chat/{clinicSlug}</span>
            <button onClick={copyLink} style={{ background: "#0F0B2D", color: "white", border: "none", borderRadius: 50, padding: "3px 12px", cursor: "pointer", fontSize: "0.75rem" }}>
              {copied ? "✓ تم" : "نسخ"}
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.25rem" }}>
        {[
          { label: "محادثات اليوم", value: stats.total, color: "#0F0B2D", icon: "💬" },
          { label: "حالات طارئة", value: stats.emergency, color: "#DC2626", icon: "🚨" },
          { label: "حالات عاجلة", value: stats.urgent, color: "#D97706", icon: "⚡" },
          { label: "مواعيد قادمة", value: stats.todayAppts, color: "#059669", icon: "📅" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        {/* Prayer times */}
        <div style={{ background: "#FFFBF0", border: "1px solid #FDE68A", borderRadius: 12, padding: "1rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#92400E", marginBottom: "0.6rem" }}>اوقات الصلاة اليوم</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {PRAYER_TIMES.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <span style={{ color: "#92400E", fontWeight: 600 }}>{p.name}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={{ color: "#92400E" }}>{p.time}</span>
                  <span style={{ fontSize: "0.7rem", background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: 99 }}>اغلاق {p.block}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 12, padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>المواعيد القادمة</div>
            <Link href="/appointments" style={{ fontSize: "0.75rem", color: "#C9A84C", textDecoration: "none" }}>عرض الكل</Link>
          </div>
          {appointments.length === 0 ? (
            <div style={{ color: "#9CA3AF", fontSize: "0.8rem", textAlign: "center", padding: "1rem 0" }}>لا توجد مواعيد قادمة</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {appointments.slice(0, 4).map(a => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0.6rem", background: "#F8F6FF", borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.8rem" }}>{a.patient_name}</div>
                    <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>{a.treatment_type || "موعد"}</div>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#0F0B2D", fontWeight: 600 }}>
                    {new Date(a.appointment_date).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conversations */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <h2 style={{ fontWeight: 700, fontSize: "1rem" }}>محادثات المرضى</h2>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {[["all", "الكل"], ["emergency", "طارئ"], ["urgent", "عاجل"], ["routine", "روتيني"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: "0.3rem 0.75rem", borderRadius: 50, fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", border: "1.5px solid", borderColor: filter === val ? "#0F0B2D" : "#E5E7EB", background: filter === val ? "#0F0B2D" : "white", color: filter === val ? "white" : "#374151" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#6B7280" }}>جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280", background: "white", borderRadius: 12, border: "1px solid #EDE9FF" }}>
          لا توجد محادثات بعد<br />
          <span style={{ fontSize: "0.82rem" }}>شارك رابط الشات مع مرضاك</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map(c => {
            const uc = urgencyConfig[c.urgency] || urgencyConfig.unknown;
            return (
              <div key={c.id} style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 12, padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem", flexWrap: "wrap", gap: "0.4rem" }}>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: uc.bg, color: uc.color }}>{uc.label}</span>
                    <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{c.language === "ar" ? "عربي" : "English"}</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{new Date(c.created_at).toLocaleString("ar-SA")}</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#374151", background: "#F9FAFB", padding: "0.6rem 0.75rem", borderRadius: 8, marginBottom: "0.5rem", direction: "rtl" }}>
                  {c.patient_message}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#374151", background: "#EDE9FF", padding: "0.6rem 0.75rem", borderRadius: 8, direction: "rtl" }}>
                  {c.ai_response}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
