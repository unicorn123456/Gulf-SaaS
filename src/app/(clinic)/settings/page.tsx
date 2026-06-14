"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CITIES = [
  { value: "Riyadh", label: "الرياض", country: "SA" },
  { value: "Jeddah", label: "جدة", country: "SA" },
  { value: "Dammam", label: "الدمام", country: "SA" },
  { value: "Dubai", label: "دبي", country: "AE" },
  { value: "Abu Dhabi", label: "أبوظبي", country: "AE" },
  { value: "Sharjah", label: "الشارقة", country: "AE" },
  { value: "Kuwait City", label: "الكويت", country: "KW" },
  { value: "Doha", label: "الدوحة", country: "QA" },
  { value: "Manama", label: "المنامة", country: "BH" },
  { value: "Muscat", label: "مسقط", country: "OM" },
];

export default function Settings() {
  const [form, setForm] = useState({
    clinic_name: "", slug: "", phone: "", address: "",
    booking_url: "", city: "", country: "", vat_number: "", language: "ar",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [chatUrl, setChatUrl] = useState("");

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: settings }, { data: profile }] = await Promise.all([
      supabase.from("clinic_settings").select("*").eq("user_id", user.id).single(),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);
    if (settings) {
      setForm({
        clinic_name: settings.clinic_name ?? "",
        slug: profile?.slug ?? "",
        phone: settings.phone ?? "",
        address: settings.address ?? "",
        booking_url: settings.booking_url ?? "",
        city: settings.city ?? "",
        country: settings.country ?? "",
        vat_number: settings.vat_number ?? "",
        language: settings.language ?? "ar",
      });
      if (profile?.slug) setChatUrl(`${window.location.origin}/chat/${profile.slug}`);
    }
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const city = CITIES.find(c => c.value === form.city);
    await Promise.all([
      supabase.from("clinic_settings").upsert({
        user_id: user.id,
        clinic_name: form.clinic_name,
        phone: form.phone,
        address: form.address,
        booking_url: form.booking_url,
        city: form.city,
        country: city?.country || form.country,
        vat_number: form.vat_number,
        vat_rate: city?.country === "AE" ? 5 : 15,
        language: form.language,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" }),
      supabase.from("profiles").upsert({
        id: user.id,
        clinic_name: form.clinic_name,
        slug: form.slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      }, { onConflict: "id" }),
    ]);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setChatUrl(`${window.location.origin}/chat/${form.slug}`);
  }

  if (loading) return <div style={{ padding: "2rem", color: "#6B7280", direction: "rtl" }}>جارٍ التحميل...</div>;

  const vatRate = CITIES.find(c => c.value === form.city)?.country === "AE" ? "5%" : "15%";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", direction: "rtl", maxWidth: 640 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F0B2D", marginBottom: "1.5rem" }}>إعدادات العيادة</h1>

      {/* Chat link */}
      {chatUrl && (
        <div style={{ background: "#EDE9FF", border: "1px solid #C4B5FD", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.4rem" }}>رابط شات العيادة</div>
          <div style={{ fontSize: "0.82rem", color: "#1B1464", direction: "ltr", background: "white", padding: "0.5rem 0.75rem", borderRadius: 8, wordBreak: "break-all" }}>{chatUrl}</div>
          <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "0.4rem" }}>شارك هذا الرابط مع مرضاك ليتواصلوا مع هلاجAI</div>
        </div>
      )}

      <div style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 14, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F0B2D", paddingBottom: "0.5rem", borderBottom: "1px solid #EDE9FF" }}>معلومات العيادة</h2>

        {[
          { key: "clinic_name", label: "اسم العيادة *", placeholder: "عيادة الابتسامة", type: "text" },
          { key: "slug", label: "معرف الرابط (بالإنجليزية)", placeholder: "smile-clinic", type: "text", dir: "ltr" },
          { key: "phone", label: "رقم الهاتف", placeholder: "05xxxxxxxx", type: "tel", dir: "ltr" },
          { key: "address", label: "العنوان", placeholder: "الحي، الشارع، المدينة", type: "text" },
          { key: "booking_url", label: "رابط الحجز الخارجي", placeholder: "https://...", type: "url", dir: "ltr" },
          { key: "vat_number", label: "الرقم الضريبي", placeholder: "رقم التسجيل الضريبي", type: "text", dir: "ltr" },
        ].map(f => (
          <div key={f.key}>
            <label style={{ fontSize: "0.82rem", fontWeight: 500, display: "block", marginBottom: 4, color: "#374151" }}>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder}
              value={form[f.key as keyof typeof form]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              dir={f.dir || "rtl"}
              style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none" }} />
          </div>
        ))}

        <div>
          <label style={{ fontSize: "0.82rem", fontWeight: 500, display: "block", marginBottom: 4, color: "#374151" }}>المدينة</label>
          <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
            style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "white" }}>
            <option value="">اختر المدينة</option>
            {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          {form.city && <div style={{ fontSize: "0.72rem", color: "#C9A84C", marginTop: 3 }}>ضريبة القيمة المضافة: {vatRate}</div>}
        </div>

        <div>
          <label style={{ fontSize: "0.82rem", fontWeight: 500, display: "block", marginBottom: 4, color: "#374151" }}>لغة المساعد الذكي</label>
          <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
            style={{ width: "100%", padding: "0.6rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "white" }}>
            <option value="ar">عربي (الافتراضي)</option>
            <option value="en">English</option>
            <option value="both">عربي + English</option>
          </select>
        </div>

        <button onClick={save} disabled={saving}
          style={{ background: saving ? "#9CA3AF" : saved ? "#059669" : "#0F0B2D", color: "white", border: "none", borderRadius: 50, padding: "0.75rem", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", transition: "background 0.2s" }}>
          {saving ? "جارٍ الحفظ..." : saved ? "✓ تم الحفظ" : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}
