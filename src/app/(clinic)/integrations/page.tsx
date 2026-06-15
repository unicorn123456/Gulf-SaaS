"use client";
import { useState } from "react";

const INTEGRATIONS = [
  {
    id: "salla",
    name: "Salla — سلة",
    name_ar: "سلة للتجارة الإلكترونية",
    desc_ar: "ربط متجرك على سلة بواتساب — إشعارات الطلبات والسلال المتروكة تلقائياً",
    desc_en: "Connect your Salla store to WhatsApp — automatic order and abandoned cart notifications",
    icon: "🛒",
    color: "#FF6B35",
    status: "available",
    steps_ar: ["حمّل مشروع Aurive × Salla من لوحة التحكم", "أضف رقم واتساب الخاص بك في ملف .env", "شغّل المشروع على VPS أو ngrok", "أضف Webhook URL في لوحة تحكم سلة", "اختبر بطلب تجريبي"],
    steps_en: ["Download Aurive × Salla project from dashboard", "Add your WhatsApp number to .env file", "Run on VPS or ngrok", "Add Webhook URL in Salla Partner Dashboard", "Test with a sample order"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Bot",
    name_ar: "بوت واتساب الذكي",
    desc_ar: "بوت واتساب يرد على العملاء بالعربية والإنجليزية تلقائياً ويؤهل العملاء المحتملين",
    desc_en: "WhatsApp bot that responds in Arabic and English automatically and qualifies leads",
    icon: "💬",
    color: "#25D366",
    status: "available",
    steps_ar: ["حمّل مشروع Aurive WhatsApp Bot", "أضف GROQ_API_KEY في ملف .env", "شغّل المشروع: npm start", "امسح رمز QR بواتساب", "ابدأ الاستقبال التلقائي"],
    steps_en: ["Download Aurive WhatsApp Bot project", "Add GROQ_API_KEY to .env file", "Run the project: npm start", "Scan QR code with WhatsApp", "Start receiving automated responses"],
  },
  {
    id: "n8n",
    name: "n8n Automation",
    name_ar: "أتمتة n8n",
    desc_ar: "ربط نظام هلاجAI بأدوات الأتمتة — إرسال تنبيهات البريد الإلكتروني وتسجيل العملاء تلقائياً",
    desc_en: "Connect HalajaI to automation tools — send email alerts and log leads automatically",
    icon: "⚡",
    color: "#FF6933",
    status: "connected",
    steps_ar: ["تم ربط n8n بنجاح", "Workflow 1: التقاط العملاء → إشعار Gmail", "Workflow 2: عميل جديد → Google Sheets CRM", "الإنتاج: نشط"],
    steps_en: ["n8n connected successfully", "Workflow 1: Lead capture → Gmail notification", "Workflow 2: New lead → Google Sheets CRM", "Production: Active"],
  },
  {
    id: "tap",
    name: "Tap Payments",
    name_ar: "Tap Payments",
    desc_ar: "بوابة الدفع الأكثر ثقة في الخليج — يدعم مدى، فيزا، ماستركارد بالريال والدرهم",
    desc_en: "Gulf's most trusted payment gateway — supports Mada, Visa, Mastercard in SAR and AED",
    icon: "💳",
    color: "#2563EB",
    status: "pending",
    steps_ar: ["سجّل في tap.company", "احصل على TAP_SECRET_KEY من لوحة التحكم", "أضف المفتاح في Vercel Environment Variables", "اختبر بدفعة تجريبية"],
    steps_en: ["Register at tap.company", "Get TAP_SECRET_KEY from dashboard", "Add key to Vercel Environment Variables", "Test with a trial payment"],
  },
  {
    id: "msegat",
    name: "Msegat / Unifonic SMS",
    name_ar: "SMS تلقائي",
    desc_ar: "إرسال تذكيرات المواعيد عبر SMS بالعربية تلقائياً لمرضاك في السعودية والإمارات",
    desc_en: "Send automatic Arabic appointment reminders via SMS to your patients in KSA and UAE",
    icon: "📱",
    color: "#7C3AED",
    status: "pending",
    steps_ar: ["سجّل في msegat.com أو unifonic.com", "احصل على API Key واسم المرسل", "أضف المفاتيح في Vercel Environment Variables", "اختبر بإرسال تذكير"],
    steps_en: ["Register at msegat.com or unifonic.com", "Get API Key and Sender ID", "Add keys to Vercel Environment Variables", "Test by sending a reminder"],
  },
  {
    id: "calendly",
    name: "Calendly",
    name_ar: "Calendly للحجز",
    desc_ar: "ربط نظام الحجز بـ Calendly — يرسل المساعد الذكي رابط الحجز للمرضى تلقائياً",
    desc_en: "Connect booking to Calendly — the AI assistant sends booking links to patients automatically",
    icon: "📅",
    color: "#006BFF",
    status: "available",
    steps_ar: ["أنشئ حساب Calendly مجاني", "أنشئ Event Type للمواعيد", "انسخ رابط الحجز", "أضفه في إعدادات العيادة → رابط الحجز الخارجي"],
    steps_en: ["Create free Calendly account", "Create Event Type for appointments", "Copy booking link", "Add it in clinic settings → External booking URL"],
  },
];

const STATUS = {
  connected: { label_ar: "متصل", label_en: "Connected", color: "#059669", bg: "#ECFDF5" },
  available: { label_ar: "متاح", label_en: "Available", color: "#2563EB", bg: "#EFF6FF" },
  pending:   { label_ar: "يحتاج إعداد", label_en: "Setup required", color: "#D97706", bg: "#FFFBEB" },
};

export default function Integrations() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [lang] = useState<"ar" | "en">("ar");
  const isAr = lang === "ar";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", direction: isAr ? "rtl" : "ltr" }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F0B2D", marginBottom: "0.25rem" }}>
        {isAr ? "التكاملات" : "Integrations"}
      </h1>
      <p style={{ color: "#6B7280", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        {isAr ? "اربط هلاجAI بالأدوات التي تستخدمها" : "Connect HalajaI to the tools you use"}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {INTEGRATIONS.map(int => {
          const st = STATUS[int.status as keyof typeof STATUS];
          const isOpen = expanded === int.id;
          const steps = isAr ? int.steps_ar : int.steps_en;
          return (
            <div key={int.id} style={{ background: "white", border: "1px solid #EDE9FF", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "1.25rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
                onClick={() => setExpanded(isOpen ? null : int.id)}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${int.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                    {int.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{int.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#6B7280", marginTop: 2, lineHeight: 1.5 }}>{isAr ? int.desc_ar : int.desc_en}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: st.bg, color: st.color }}>
                    {isAr ? st.label_ar : st.label_en}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ borderTop: "1px solid #EDE9FF", padding: "1rem 1.25rem", background: "#F8F6FF" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", marginBottom: "0.6rem", color: "#0F0B2D" }}>
                    {isAr ? "خطوات الإعداد:" : "Setup steps:"}
                  </div>
                  <ol style={{ paddingRight: isAr ? "1.25rem" : 0, paddingLeft: isAr ? 0 : "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {steps.map((step, i) => (
                      <li key={i} style={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.6 }}>{step}</li>
                    ))}
                  </ol>
                  {int.status === "connected" && (
                    <div style={{ marginTop: "0.75rem", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: "#065F46" }}>
                      ✅ {isAr ? "هذا التكامل نشط ويعمل" : "This integration is active and working"}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
