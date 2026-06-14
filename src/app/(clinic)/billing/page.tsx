"use client";
import { useState } from "react";

const PLANS = [
  {
    id: "starter",
    name: "أساسي",
    price: 99,
    currency: "د.إ",
    features: ["مساعد AI ٢٤/٧", "دعم عربي وإنجليزي", "تنبيه طارئ", "لوحة التحكم", "التقويم الهجري"],
    highlight: false,
  },
  {
    id: "pro",
    name: "احترافي",
    price: 249,
    currency: "د.إ",
    features: ["كل مميزات الأساسي", "SMS تلقائي", "جدولة أوقات الصلاة", "فواتير VAT", "تحليلات مفصلة", "Tap Payments"],
    highlight: true,
  },
  {
    id: "clinic",
    name: "عيادة",
    price: 499,
    currency: "د.إ",
    features: ["كل مميزات الاحترافي", "متعدد الأطباء", "تخصيص كامل", "مدير حساب مخصص", "ضمان ٩٩.٩٪"],
    highlight: false,
  },
];

export default function Billing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubscribe(planId: string) {
    setLoading(planId);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, email: "" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Tap Payments غير مفعّل بعد. تواصل مع الدعم على hello@aurive.com");
      }
    } catch {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ fontFamily: "'IBM Plex Sans Arabic', system-ui", direction: "rtl" }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem", color: "#0F0B2D" }}>الاشتراك والفواتير</h1>
      <p style={{ color: "#6B7280", marginBottom: "2rem", fontSize: "0.9rem" }}>الشهر الأول مجاني. بدون عقود ملزمة. الدفع عبر Tap Payments.</p>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#DC2626" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{ background: "white", border: plan.highlight ? "2px solid #C9A84C" : "1px solid #EDE9FF", borderRadius: 16, padding: "1.5rem", position: "relative" }}>
            {plan.highlight && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#C9A84C", color: "white", fontSize: "0.72rem", fontWeight: 700, padding: "3px 14px", borderRadius: 99, whiteSpace: "nowrap" }}>
                الأكثر شعبية
              </div>
            )}
            <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.25rem" }}>{plan.name}</h3>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#C9A84C", marginBottom: "1rem" }}>
              {plan.price} <span style={{ fontSize: "0.85rem", color: "#9CA3AF", fontWeight: 400 }}>{plan.currency}/شهر</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {plan.features.map(f => (
                <li key={f} style={{ fontSize: "0.82rem", color: "#374151", display: "flex", gap: "0.4rem" }}>
                  <span style={{ color: "#C9A84C" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleSubscribe(plan.id)} disabled={loading === plan.id}
              style={{ width: "100%", padding: "0.7rem", borderRadius: 50, fontWeight: 700, border: "none", cursor: "pointer", background: plan.highlight ? "#C9A84C" : "#0F0B2D", color: "white", opacity: loading === plan.id ? 0.7 : 1, fontFamily: "'IBM Plex Sans Arabic', system-ui", fontSize: "0.88rem" }}>
              {loading === plan.id ? "جارٍ التحميل..." : "اشترك الآن"}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", background: "#F8F6FF", border: "1px solid #EDE9FF", borderRadius: 12, padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ fontSize: "2rem" }}>💳</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>الدفع الآمن عبر Tap Payments</div>
          <div style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "2px" }}>يدعم مدى، فيزا، ماستركارد — مشفر بالكامل</div>
        </div>
      </div>
    </div>
  );
}
