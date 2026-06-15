"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const PLANS = [
  { id: "starter", name: "أساسي / Starter", price: 99, currency: "د.إ", features: ["مساعد AI 24/7", "Arabic & English", "Dashboard", "Hijri Calendar"], highlight: false },
  { id: "pro", name: "احترافي / Pro", price: 249, currency: "د.إ", features: ["كل مميزات الأساسي", "SMS تلقائي", "Prayer scheduling", "VAT Invoices", "Analytics"], highlight: true },
  { id: "clinic", name: "عيادة / Clinic", price: 499, currency: "د.إ", features: ["كل مميزات Pro", "Multi-doctor", "Custom branding", "Dedicated manager"], highlight: false },
];

type Appointment = { id: string; patient_name: string; treatment_type: string; price: number; currency: string; appointment_date: string; status: string; };

export default function Billing() {
  const [tab, setTab] = useState<"plans" | "invoices">("invoices");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("appointments").select("*").eq("clinic_id", user.id).not("price", "is", null).order("created_at", { ascending: false });
      setAppointments(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function generateInvoice(apptId: string) {
    setGenerating(apptId);
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: apptId }),
      });
      const data = await res.json();
      if (data.html) setPreviewHtml(data.html);
    } catch (e) { console.error(e); }
    setGenerating(null);
  }

  function printInvoice() {
    if (!previewHtml) return;
    const win = window.open("", "_blank");
    if (win) { win.document.write(previewHtml); win.document.close(); win.print(); }
  }

  async function handleSubscribe(planId: string) {
    const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: planId }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Tap Payments not configured yet — contact hello@aurive.com");
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", direction: "rtl" }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F0B2D", marginBottom: "1.25rem" }}>الفواتير والاشتراك</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {[["invoices", "الفواتير"], ["plans", "خطط الاشتراك"]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val as "plans" | "invoices")}
            style={{ padding: "0.5rem 1.25rem", borderRadius: 50, fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", border: "1.5px solid", borderColor: tab === val ? "#0F0B2D" : "#E5E7EB", background: tab === val ? "#0F0B2D" : "white", color: tab === val ? "white" : "#374151" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Invoices tab */}
      {tab === "invoices" && (
        <div>
          {previewHtml && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
              <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 700, maxHeight: "85vh", overflow: "auto", position: "relative" }}>
                <div style={{ padding: "1rem", borderBottom: "1px solid #EDE9FF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700 }}>معاينة الفاتورة</span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={printInvoice} style={{ background: "#0F0B2D", color: "white", border: "none", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                      🖨️ طباعة / تحميل PDF
                    </button>
                    <button onClick={() => setPreviewHtml(null)} style={{ background: "#EF4444", color: "white", border: "none", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>✕</button>
                  </div>
                </div>
                <iframe srcDoc={previewHtml} style={{ width: "100%", height: "70vh", border: "none" }} />
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#6B7280" }}>جارٍ التحميل...</div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280", background: "white", border: "1px solid #EDE9FF", borderRadius: 14 }}>
              لا توجد فواتير بعد<br />
              <span style={{ fontSize: "0.82rem" }}>أضف سعراً للمواعيد لتوليد الفواتير</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {appointments.map(a => (
                <div key={a.id} style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{a.patient_name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>{a.treatment_type || "علاج طبي"} — {new Date(a.appointment_date).toLocaleDateString("ar-SA")}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "#C9A84C" }}>{a.price?.toLocaleString("ar-SA")} {a.currency}</span>
                    <button onClick={() => generateInvoice(a.id)} disabled={generating === a.id}
                      style={{ background: "#0F0B2D", color: "white", border: "none", borderRadius: 8, padding: "0.45rem 0.9rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, opacity: generating === a.id ? 0.6 : 1 }}>
                      {generating === a.id ? "..." : "🧾 فاتورة"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plans tab */}
      {tab === "plans" && (
        <div>
          <p style={{ color: "#6B7280", fontSize: "0.88rem", marginBottom: "1.5rem" }}>الشهر الأول مجاني. بدون عقود. الدفع عبر Tap Payments (مدى، فيزا، ماستر).</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
            {PLANS.map(plan => (
              <div key={plan.id} style={{ background: "white", border: plan.highlight ? "2px solid #C9A84C" : "1px solid #EDE9FF", borderRadius: 16, padding: "1.5rem", position: "relative" }}>
                {plan.highlight && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#C9A84C", color: "white", fontSize: "0.72rem", fontWeight: 700, padding: "3px 14px", borderRadius: 99, whiteSpace: "nowrap" }}>الأكثر شعبية</div>}
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.25rem" }}>{plan.name}</h3>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#C9A84C", marginBottom: "1rem" }}>{plan.price} <span style={{ fontSize: "0.82rem", color: "#9CA3AF", fontWeight: 400 }}>{plan.currency}/شهر</span></div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {plan.features.map(f => <li key={f} style={{ fontSize: "0.82rem", color: "#374151", display: "flex", gap: "0.4rem" }}><span style={{ color: "#C9A84C" }}>✓</span>{f}</li>)}
                </ul>
                <button onClick={() => handleSubscribe(plan.id)} style={{ width: "100%", padding: "0.7rem", borderRadius: 50, fontWeight: 700, border: "none", cursor: "pointer", background: plan.highlight ? "#C9A84C" : "#0F0B2D", color: "white", fontSize: "0.88rem" }}>
                  اشترك الآن
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
