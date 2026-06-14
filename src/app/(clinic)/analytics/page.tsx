"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Conv = { created_at: string; urgency: string; language: string; };
type Appt = { created_at: string; status: string; treatment_type: string; price: number; currency: string; };

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#374151" }}>{value}</div>
      <div style={{ width: "100%", height: 80, background: "#F3F4F6", borderRadius: "4px 4px 0 0", position: "relative", display: "flex", alignItems: "flex-end" }}>
        <div style={{ width: "100%", height: `${pct}%`, background: color, borderRadius: "4px 4px 0 0", minHeight: value > 0 ? 4 : 0, transition: "height 0.3s" }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const days = getLast7Days();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const since = new Date(); since.setDate(since.getDate() - 30);
      const [{ data: c }, { data: a }] = await Promise.all([
        supabase.from("conversations").select("created_at,urgency,language").eq("clinic_id", user.id).gte("created_at", since.toISOString()),
        supabase.from("appointments").select("created_at,status,treatment_type,price,currency").eq("clinic_id", user.id).gte("created_at", since.toISOString()),
      ]);
      setConvs(c || []); setAppts(a || []);
      setLoading(false);
    }
    load();
  }, []);

  const convsByDay = days.map(d => convs.filter(c => c.created_at.startsWith(d)).length);
  const apptsByDay = days.map(d => appts.filter(a => a.created_at.startsWith(d)).length);
  const maxConvs = Math.max(...convsByDay, 1);
  const maxAppts = Math.max(...apptsByDay, 1);

  const urgencyCounts = {
    emergency: convs.filter(c => c.urgency === "emergency").length,
    urgent: convs.filter(c => c.urgency === "urgent").length,
    routine: convs.filter(c => c.urgency === "routine").length,
  };

  const langCounts = {
    ar: convs.filter(c => c.language === "ar").length,
    en: convs.filter(c => c.language === "en").length,
  };

  const treatmentCounts: Record<string, number> = {};
  appts.forEach(a => {
    if (a.treatment_type) treatmentCounts[a.treatment_type] = (treatmentCounts[a.treatment_type] || 0) + 1;
  });
  const topTreatments = Object.entries(treatmentCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const totalRevenue = appts.filter(a => a.status === "completed" && a.price).reduce((sum, a) => sum + (a.price || 0), 0);
  const completionRate = appts.length > 0 ? Math.round((appts.filter(a => a.status === "completed").length / appts.length) * 100) : 0;

  const dayLabels = days.map(d => new Date(d).toLocaleDateString("ar-SA", { weekday: "short" }));

  if (loading) return <div style={{ padding: "2rem", color: "#6B7280", direction: "rtl" }}>جارٍ التحميل...</div>;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", direction: "rtl" }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F0B2D", marginBottom: "0.25rem" }}>التحليلات</h1>
      <p style={{ color: "#6B7280", fontSize: "0.82rem", marginBottom: "1.5rem" }}>آخر 30 يوماً</p>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "إجمالي المحادثات", value: convs.length, color: "#0F0B2D", icon: "💬" },
          { label: "إجمالي المواعيد", value: appts.length, color: "#1B1464", icon: "📅" },
          { label: "الإيرادات (AED)", value: totalRevenue.toLocaleString("ar-SA"), color: "#C9A84C", icon: "💰" },
          { label: "معدل الإكمال", value: `${completionRate}%`, color: "#059669", icon: "✅" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: "#6B7280", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        {/* Conversations chart */}
        <div style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem" }}>المحادثات — آخر 7 أيام</div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            {convsByDay.map((v, i) => <Bar key={i} value={v} max={maxConvs} color="#0F0B2D" />)}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            {dayLabels.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.65rem", color: "#9CA3AF" }}>{d}</div>
            ))}
          </div>
        </div>

        {/* Appointments chart */}
        <div style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem" }}>المواعيد — آخر 7 أيام</div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            {apptsByDay.map((v, i) => <Bar key={i} value={v} max={maxAppts} color="#C9A84C" />)}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            {dayLabels.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.65rem", color: "#9CA3AF" }}>{d}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
        {/* Urgency breakdown */}
        <div style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem" }}>توزيع الإلحاح</div>
          {[
            { label: "حالات طارئة", value: urgencyCounts.emergency, color: "#DC2626", bg: "#FEF2F2" },
            { label: "حالات عاجلة", value: urgencyCounts.urgent, color: "#D97706", bg: "#FFFBEB" },
            { label: "حالات روتينية", value: urgencyCounts.routine, color: "#059669", bg: "#ECFDF5" },
          ].map((u, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.65rem", background: u.bg, borderRadius: 8, marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.82rem", color: u.color, fontWeight: 600 }}>{u.label}</span>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: u.color }}>{u.value}</span>
            </div>
          ))}
        </div>

        {/* Language breakdown */}
        <div style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem" }}>لغة المرضى</div>
          {[
            { label: "عربي", value: langCounts.ar, color: "#0F0B2D", pct: convs.length > 0 ? Math.round(langCounts.ar / convs.length * 100) : 0 },
            { label: "English", value: langCounts.en, color: "#C9A84C", pct: convs.length > 0 ? Math.round(langCounts.en / convs.length * 100) : 0 },
          ].map((l, i) => (
            <div key={i} style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{l.label}</span>
                <span style={{ color: "#6B7280" }}>{l.value} ({l.pct}%)</span>
              </div>
              <div style={{ height: 8, background: "#F3F4F6", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${l.pct}%`, background: l.color, borderRadius: 99, transition: "width 0.3s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Top treatments */}
        <div style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem" }}>أكثر العلاجات طلباً</div>
          {topTreatments.length === 0 ? (
            <div style={{ color: "#9CA3AF", fontSize: "0.8rem", textAlign: "center", padding: "1rem 0" }}>لا توجد بيانات بعد</div>
          ) : topTreatments.map(([treatment, count], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0", borderBottom: i < topTreatments.length - 1 ? "1px solid #F3F4F6" : "none" }}>
              <span style={{ fontSize: "0.8rem", color: "#374151" }}>{treatment}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F0B2D" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
