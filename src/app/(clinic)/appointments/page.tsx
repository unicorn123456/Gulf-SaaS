"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Appointment = {
  id: string;
  created_at: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  treatment_type: string;
  status: string;
  reminder_sent: boolean;
  language: string;
  notes: string;
  price: number;
  currency: string;
};

// Prayer times per city (static for now, can be made dynamic via API)
const PRAYER_TIMES: Record<string, { name: string; start: string; end: string }[]> = {
  default: [
    { name: "الفجر", start: "05:00", end: "05:30" },
    { name: "الظهر", start: "12:00", end: "12:45" },
    { name: "العصر", start: "15:30", end: "16:00" },
    { name: "المغرب", start: "18:15", end: "18:45" },
    { name: "العشاء", start: "19:45", end: "20:15" },
  ],
};

function isPrayerTime(timeStr: string): { blocked: boolean; name?: string } {
  const [h, m] = timeStr.split(":").map(Number);
  const mins = h * 60 + m;
  for (const p of PRAYER_TIMES.default) {
    const [sh, sm] = p.start.split(":").map(Number);
    const [eh, em] = p.end.split(":").map(Number);
    if (mins >= sh * 60 + sm && mins <= eh * 60 + em) {
      return { blocked: true, name: p.name };
    }
  }
  return { blocked: false };
}

function generateTimeSlots() {
  const slots = [];
  for (let h = 8; h <= 20; h++) {
    for (const m of [0, 30]) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const prayer = isPrayerTime(time);
      slots.push({ time, ...prayer });
    }
  }
  return slots;
}

// Hijri conversion (simplified)
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "قيد الانتظار", color: "#D97706", bg: "#FFFBEB" },
  confirmed: { label: "مؤكد",        color: "#059669", bg: "#ECFDF5" },
  cancelled: { label: "ملغي",        color: "#DC2626", bg: "#FEF2F2" },
  completed: { label: "مكتمل",       color: "#6B7280", bg: "#F9FAFB" },
};

const TREATMENTS = [
  "فحص وتنظيف", "حشو الأسنان", "تبييض الأسنان", "خلع سن",
  "تقويم الأسنان", "زراعة سن", "علاج العصب", "طب الأطفال",
  "فحص عام", "استشارة", "أخرى",
];

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [form, setForm] = useState({
    patient_name: "", patient_email: "", patient_phone: "",
    appointment_date: "", appointment_time: "", treatment_type: "",
    notes: "", price: "", currency: "AED",
  });
  const [saving, setSaving] = useState(false);
  const timeSlots = generateTimeSlots();

  useEffect(() => { fetchAppointments(); }, []);

  async function fetchAppointments() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("appointments").select("*")
        .eq("clinic_id", user.id).order("appointment_date", { ascending: true });
      setAppointments(data || []);
    }
    setLoading(false);
  }

  async function addAppointment() {
    if (!form.patient_name || !form.appointment_date || !form.appointment_time) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const dateTime = `${form.appointment_date}T${form.appointment_time}:00`;
      await supabase.from("appointments").insert({
        clinic_id: user.id,
        patient_name: form.patient_name,
        patient_email: form.patient_email,
        patient_phone: form.patient_phone,
        appointment_date: dateTime,
        treatment_type: form.treatment_type,
        notes: form.notes,
        price: form.price ? Number(form.price) : null,
        currency: form.currency,
        status: "confirmed",
        reminder_sent: false,
        language: "ar",
      });
      setForm({ patient_name: "", patient_email: "", patient_phone: "", appointment_date: "", appointment_time: "", treatment_type: "", notes: "", price: "", currency: "AED" });
      setShowForm(false);
      fetchAppointments();
    }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  }

  const filtered = appointments.filter(a => {
    if (filter !== "all" && a.status !== filter) return false;
    return true;
  });

  const todayAppts = appointments.filter(a => a.appointment_date?.startsWith(selectedDate));
  const todayHijri = toHijri(new Date(selectedDate));

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", direction: "rtl" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F0B2D" }}>المواعيد</h1>
          <div style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: 2 }}>
            {new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            {" — "}{toHijri(new Date())}
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: "#C9A84C", color: "white", border: "none", borderRadius: 50, padding: "0.6rem 1.25rem", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" }}>
          + موعد جديد
        </button>
      </div>

      {/* Prayer times banner */}
      <div style={{ background: "#FFFBF0", border: "1px solid #FDE68A", borderRadius: 10, padding: "0.65rem 1rem", marginBottom: "1.25rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#92400E" }}>اوقات الصلاة:</span>
        {PRAYER_TIMES.default.map((p, i) => (
          <span key={i} style={{ fontSize: "0.75rem", background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: 99 }}>
            {p.name} {p.start}–{p.end}
          </span>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 14, padding: "1.25rem", marginBottom: "1.25rem" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>اضافة موعد جديد</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {[
              { key: "patient_name", label: "اسم المريض *", placeholder: "الاسم الكامل", type: "text" },
              { key: "patient_phone", label: "رقم الجوال", placeholder: "05xxxxxxxx", type: "tel" },
              { key: "patient_email", label: "البريد الإلكتروني", placeholder: "email@example.com", type: "email" },
              { key: "price", label: "السعر", placeholder: "مثال: 150", type: "number" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: "0.78rem", color: "#6B7280", display: "block", marginBottom: 3 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.88rem", outline: "none", direction: f.type === "email" || f.type === "tel" ? "ltr" : "rtl" }} />
              </div>
            ))}

            <div>
              <label style={{ fontSize: "0.78rem", color: "#6B7280", display: "block", marginBottom: 3 }}>التاريخ *</label>
              <input type="date" value={form.appointment_date}
                onChange={e => setForm({ ...form, appointment_date: e.target.value })}
                style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.88rem", outline: "none", direction: "ltr" }} />
              {form.appointment_date && (
                <div style={{ fontSize: "0.7rem", color: "#C9A84C", marginTop: 2 }}>{toHijri(new Date(form.appointment_date))}</div>
              )}
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", color: "#6B7280", display: "block", marginBottom: 3 }}>الوقت *</label>
              <select value={form.appointment_time}
                onChange={e => setForm({ ...form, appointment_time: e.target.value })}
                style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.88rem", outline: "none", background: "white", direction: "rtl" }}>
                <option value="">اختر الوقت</option>
                {timeSlots.map(slot => (
                  <option key={slot.time} value={slot.time} disabled={slot.blocked}
                    style={{ color: slot.blocked ? "#9CA3AF" : "inherit" }}>
                    {slot.time} {slot.blocked ? `— مغلق (${slot.name})` : ""}
                  </option>
                ))}
              </select>
              {form.appointment_time && isPrayerTime(form.appointment_time).blocked && (
                <div style={{ fontSize: "0.7rem", color: "#DC2626", marginTop: 2 }}>هذا الوقت خلال وقت الصلاة</div>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.78rem", color: "#6B7280", display: "block", marginBottom: 3 }}>نوع العلاج</label>
              <select value={form.treatment_type} onChange={e => setForm({ ...form, treatment_type: e.target.value })}
                style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.88rem", outline: "none", background: "white" }}>
                <option value="">اختر نوع العلاج</option>
                {TREATMENTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.78rem", color: "#6B7280", display: "block", marginBottom: 3 }}>ملاحظات</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="أي معلومات إضافية..."
                style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.88rem", outline: "none", resize: "vertical", minHeight: 60, direction: "rtl" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button onClick={() => setShowForm(false)}
              style={{ flex: 1, padding: "0.65rem", borderRadius: 50, border: "1.5px solid #E5E7EB", background: "white", cursor: "pointer", fontWeight: 600, fontSize: "0.88rem" }}>
              إلغاء
            </button>
            <button onClick={addAppointment} disabled={saving || !form.patient_name || !form.appointment_date || !form.appointment_time}
              style={{ flex: 1, padding: "0.65rem", borderRadius: 50, border: "none", background: "#0F0B2D", color: "white", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", opacity: saving ? 0.7 : 1 }}>
              {saving ? "جارٍ الحفظ..." : "حفظ الموعد"}
            </button>
          </div>
        </div>
      )}

      {/* Today view */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 14, padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.9rem" }}>مواعيد اليوم</h3>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              style={{ fontSize: "0.75rem", border: "1px solid #E5E7EB", borderRadius: 6, padding: "2px 6px", outline: "none", direction: "ltr" }} />
          </div>
          <div style={{ fontSize: "0.75rem", color: "#C9A84C", marginBottom: "0.75rem" }}>{todayHijri}</div>
          {todayAppts.length === 0 ? (
            <div style={{ color: "#9CA3AF", fontSize: "0.82rem", textAlign: "center", padding: "1rem 0" }}>لا توجد مواعيد</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {todayAppts.map(a => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.65rem", background: "#F8F6FF", borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{a.patient_name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#6B7280" }}>{a.treatment_type || "—"}</div>
                  </div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F0B2D" }}>
                    {new Date(a.appointment_date).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {[
            { label: "إجمالي المواعيد", value: appointments.length, color: "#0F0B2D" },
            { label: "مؤكدة", value: appointments.filter(a => a.status === "confirmed").length, color: "#059669" },
            { label: "قيد الانتظار", value: appointments.filter(a => a.status === "pending").length, color: "#D97706" },
            { label: "مكتملة", value: appointments.filter(a => a.status === "completed").length, color: "#6B7280" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "0.72rem", color: "#6B7280", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {[["all", "الكل"], ["pending", "قيد الانتظار"], ["confirmed", "مؤكد"], ["completed", "مكتمل"], ["cancelled", "ملغي"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding: "0.35rem 0.85rem", borderRadius: 50, fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", border: "1.5px solid", borderColor: filter === val ? "#0F0B2D" : "#E5E7EB", background: filter === val ? "#0F0B2D" : "white", color: filter === val ? "white" : "#374151" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Appointments list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#6B7280" }}>جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280", background: "white", borderRadius: 14, border: "1px solid #EDE9FF" }}>
          لا توجد مواعيد
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map(a => {
            const sc = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
            const apptDate = new Date(a.appointment_date);
            return (
              <div key={a.id} style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 12, padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{a.patient_name}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#6B7280", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      {a.treatment_type && <span>🦷 {a.treatment_type}</span>}
                      {a.patient_phone && <span>📱 {a.patient_phone}</span>}
                      {a.price && <span>💰 {a.price} {a.currency}</span>}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#9CA3AF", marginTop: "0.25rem" }}>
                      📅 {apptDate.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      {" — "}{toHijri(apptDate)}
                      {" — "}{apptDate.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {a.notes && <div style={{ fontSize: "0.78rem", color: "#6B7280", marginTop: "0.25rem" }}>📝 {a.notes}</div>}
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {a.status === "pending" && (
                      <button onClick={() => updateStatus(a.id, "confirmed")}
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem", borderRadius: 50, border: "none", background: "#059669", color: "white", cursor: "pointer" }}>تأكيد</button>
                    )}
                    {a.status === "confirmed" && (
                      <button onClick={() => updateStatus(a.id, "completed")}
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem", borderRadius: 50, border: "none", background: "#6B7280", color: "white", cursor: "pointer" }}>مكتمل</button>
                    )}
                    <button onClick={() => updateStatus(a.id, "cancelled")}
                      style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem", borderRadius: 50, border: "1px solid #FECACA", background: "white", color: "#DC2626", cursor: "pointer" }}>إلغاء</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
