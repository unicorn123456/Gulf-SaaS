"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

const SPECIALTIES = [
  "طب الأسنان العام",
  "تقويم الأسنان",
  "زراعة الأسنان",
  "طب الأسنان التجميلي",
  "طب الأطفال",
  "الجراحة الفموية",
  "أمراض اللثة",
  "علاج العصب",
  "الطب العام",
  "الجلدية",
  "النساء والتوليد",
  "أخرى",
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clinic_name: "",
    specialty: "",
    city: "",
    country: "",
    phone: "",
    address: "",
    booking_url: "",
    vat_number: "",
    slug: "",
  });

  function handleCityChange(value: string) {
    const city = CITIES.find(c => c.value === value);
    setForm({ ...form, city: value, country: city?.country || "" });
  }

  function generateSlug(name: string) {
    return name.toLowerCase()
      .replace(/[\u0600-\u06FF]/g, c => c)
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
      .substring(0, 30);
  }

  async function save() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const slug = form.slug || generateSlug(form.clinic_name) || user.id.substring(0, 8);

      await Promise.all([
        supabase.from("profiles").upsert({
          id: user.id,
          clinic_name: form.clinic_name,
          slug,
          subscription_status: "trial",
          plan: "starter",
        }, { onConflict: "id" }),
        supabase.from("clinic_settings").upsert({
          user_id: user.id,
          clinic_name: form.clinic_name,
          phone: form.phone,
          address: form.address,
          booking_url: form.booking_url,
          city: form.city,
          country: form.country,
          vat_number: form.vat_number,
          vat_rate: form.country === "AE" ? 5 : 15,
          language: "ar",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" }),
        supabase.from("instructions").upsert({
          user_id: user.id,
          content: `أنت مساعد استقبال ذكي لـ ${form.clinic_name} في ${form.city}. تخصصنا: ${form.specialty}.`,
        }, { onConflict: "user_id" }),
      ]);

      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const vatRate = form.country === "AE" ? "5%" : form.country ? "15%" : "";

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6FF", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "'IBM Plex Sans Arabic', system-ui", direction: "rtl" }}>
      <div style={{ width: "100%", maxWidth: 520, background: "white", borderRadius: 20, padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #EDE9FF" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#0F0B2D" }}>
            هلاج<span style={{ color: "#C9A84C" }}>AI</span>
          </div>
          <div style={{ color: "#6B7280", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            إعداد عيادتك — خطوة {step} من 3
          </div>
          {/* Progress */}
          <div style={{ display: "flex", gap: 4, marginTop: "1rem", justifyContent: "center" }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ height: 4, width: 60, borderRadius: 2, background: s <= step ? "#C9A84C" : "#EDE9FF" }} />
            ))}
          </div>
        </div>

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>معلومات العيادة الأساسية</h2>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: 4 }}>اسم العيادة *</label>
              <input value={form.clinic_name} onChange={e => setForm({ ...form, clinic_name: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="مثال: عيادة الابتسامة للأسنان"
                style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none" }} />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: 4 }}>التخصص *</label>
              <select value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}
                style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "white" }}>
                <option value="">اختر التخصص</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: 4 }}>المدينة *</label>
              <select value={form.city} onChange={e => handleCityChange(e.target.value)}
                style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "white" }}>
                <option value="">اختر المدينة</option>
                {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {vatRate && (
              <div style={{ background: "#FFFBF0", border: "1px solid #FDE68A", borderRadius: 8, padding: "0.65rem 0.85rem", fontSize: "0.82rem", color: "#92400E" }}>
                💡 ضريبة القيمة المضافة في منطقتك: <b>{vatRate}</b> — ستُطبق تلقائياً على الفواتير
              </div>
            )}

            <button onClick={() => setStep(2)} disabled={!form.clinic_name || !form.city}
              style={{ background: "#0F0B2D", color: "white", padding: "0.75rem", borderRadius: 50, fontWeight: 700, border: "none", cursor: "pointer", opacity: (!form.clinic_name || !form.city) ? 0.5 : 1, marginTop: "0.5rem" }}>
              التالي ←
            </button>
          </div>
        )}

        {/* Step 2 — Contact */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>معلومات التواصل</h2>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: 4 }}>رقم الهاتف</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="05xxxxxxxx" dir="ltr"
                style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none", direction: "ltr" }} />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: 4 }}>العنوان</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="الحي، الشارع..."
                style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none" }} />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: 4 }}>رابط الحجز (اختياري)</label>
              <input value={form.booking_url} onChange={e => setForm({ ...form, booking_url: e.target.value })}
                placeholder="https://..." dir="ltr"
                style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none", direction: "ltr" }} />
              <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: 4 }}>رابط نظام حجزك الحالي إن وجد</div>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: 4 }}>الرقم الضريبي (اختياري)</label>
              <input value={form.vat_number} onChange={e => setForm({ ...form, vat_number: e.target.value })}
                placeholder="رقم التسجيل في الضريبة" dir="ltr"
                style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none", direction: "ltr" }} />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: "white", color: "#374151", padding: "0.75rem", borderRadius: 50, fontWeight: 600, border: "1.5px solid #E5E7EB", cursor: "pointer" }}>
                → السابق
              </button>
              <button onClick={() => setStep(3)} style={{ flex: 1, background: "#0F0B2D", color: "white", padding: "0.75rem", borderRadius: 50, fontWeight: 700, border: "none", cursor: "pointer" }}>
                التالي ←
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>مراجعة وتأكيد</h2>

            <div style={{ background: "#F8F6FF", border: "1px solid #EDE9FF", borderRadius: 12, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {[
                { label: "اسم العيادة", value: form.clinic_name },
                { label: "التخصص", value: form.specialty },
                { label: "المدينة", value: CITIES.find(c => c.value === form.city)?.label },
                { label: "الهاتف", value: form.phone || "—" },
                { label: "ضريبة القيمة المضافة", value: form.country === "AE" ? "5%" : "15%" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                  <span style={{ color: "#6B7280" }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: "#0F0B2D" }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, padding: "1rem", fontSize: "0.82rem", color: "#065F46" }}>
              ✅ رابط شات العيادة الخاص بك سيكون:<br />
              <b style={{ direction: "ltr", display: "block", marginTop: 4 }}>
                {typeof window !== "undefined" ? window.location.origin : "https://gulf-saas-ten.vercel.app"}/chat/{form.slug || "your-clinic"}
              </b>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: "white", color: "#374151", padding: "0.75rem", borderRadius: 50, fontWeight: 600, border: "1.5px solid #E5E7EB", cursor: "pointer" }}>
                → السابق
              </button>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: "#C9A84C", color: "white", padding: "0.75rem", borderRadius: 50, fontWeight: 700, border: "none", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "جارٍ الحفظ..." : "ابدأ الآن ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
