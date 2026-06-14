"use client";
import { useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    name: "أساسي",
    nameEn: "Starter",
    price: "99",
    currency: "د.إ",
    desc: "للعيادات الصغيرة والمتوسطة",
    highlight: false,
    features: [
      "مساعد AI لخدمة المرضى ٢٤/٧",
      "دعم عربي وإنجليزي كامل",
      "تنبيه طارئ فوري",
      "لوحة تحكم المواعيد",
      "تذكير بالمواعيد عبر البريد",
      "التقويم الهجري والميلادي",
    ],
  },
  {
    name: "احترافي",
    nameEn: "Pro",
    price: "249",
    currency: "د.إ",
    desc: "للعيادات التي تريد الأتمتة الكاملة",
    highlight: true,
    features: [
      "كل مميزات الأساسي",
      "تذكير بالمواعيد عبر SMS",
      "جدولة تلقائية حسب أوقات الصلاة",
      "تحليلات وتقارير مفصلة",
      "فواتير ضريبة القيمة المضافة",
      "دفع Tap Payments",
      "استيراد من أنظمة المواعيد",
    ],
  },
  {
    name: "عيادة",
    nameEn: "Clinic",
    price: "499",
    currency: "د.إ",
    desc: "للعيادات والمجمعات الطبية الكبيرة",
    highlight: false,
    features: [
      "كل مميزات الاحترافي",
      "دعم متعدد الأطباء",
      "تخصيص كامل للواجهة",
      "تكامل مع أنظمة المستشفيات",
      "مدير حساب مخصص",
      "ضمان وقت تشغيل ٩٩.٩٪",
    ],
  },
];

export default function Landing() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const isAr = lang === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ backgroundColor: "#F8F6FF", minHeight: "100vh", fontFamily: isAr ? "'IBM Plex Sans Arabic', system-ui" : "'Inter', system-ui" }}>

      {/* Nav */}
      <nav style={{ padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #EDE9FF", backgroundColor: "white", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: "22px", fontWeight: 700, color: "#1B1464" }}>
          هلاج<span style={{ color: "#C9A84C" }}>AI</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button onClick={() => setLang(isAr ? "en" : "ar")} style={{ fontSize: "13px", color: "#C9A84C", fontWeight: 600, background: "none", border: "1px solid #C9A84C", borderRadius: "50px", padding: "5px 14px", cursor: "pointer" }}>
            {isAr ? "English" : "عربي"}
          </button>
          <Link href="/login" style={{ fontSize: "14px", color: "#6B7280", textDecoration: "none" }}>
            {isAr ? "تسجيل الدخول" : "Login"}
          </Link>
          <Link href="/login" style={{ fontSize: "14px", color: "white", textDecoration: "none", backgroundColor: "#1B1464", padding: "8px 20px", borderRadius: "50px" }}>
            {isAr ? "ابدأ مجاناً" : "Start Free"}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "80px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-block", backgroundColor: "#EDE9FF", color: "#1B1464", fontSize: "12px", fontWeight: 600, padding: "6px 16px", borderRadius: "50px", marginBottom: "24px", letterSpacing: "0.05em" }}>
          {isAr ? "مبني للعيادات الخليجية" : "Built for Gulf Clinics"}
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.2, color: "#0F0B2D", marginBottom: "24px", fontWeight: 700 }}>
          {isAr ? <>مساعد ذكاء اصطناعي لعيادتك<br /><span style={{ color: "#C9A84C" }}>يعمل ٢٤ ساعة بالعربية</span></> : <>AI Receptionist for Your Clinic<br /><span style={{ color: "#C9A84C" }}>24/7 in Arabic & English</span></>}
        </h1>
        <p style={{ fontSize: "17px", color: "#6B7280", lineHeight: 1.8, marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }}>
          {isAr
            ? "هلاجAI يرد على استفسارات مرضاك، يقلل الغيابات، ويدير المواعيد تلقائياً — مع دعم التقويم الهجري وأوقات الصلاة وضريبة القيمة المضافة."
            : "HalajaI handles patient inquiries, reduces no-shows, and automates appointments — with Hijri calendar, prayer time scheduling, and VAT invoicing built in."}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{ backgroundColor: "#1B1464", color: "white", padding: "14px 32px", borderRadius: "50px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
            {isAr ? "ابدأ تجربة مجانية ←" : "Start Free Trial →"}
          </Link>
          <Link href="/chat/demo" style={{ backgroundColor: "white", color: "#1B1464", padding: "14px 32px", borderRadius: "50px", fontSize: "15px", border: "1px solid #DDD9FF", textDecoration: "none" }}>
            {isAr ? "شاهد العرض التوضيحي" : "See Demo"}
          </Link>
        </div>
      </section>

      {/* Gulf-specific features */}
      <section style={{ backgroundColor: "#EDE9FF", padding: "80px 40px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", color: "#0F0B2D", textAlign: "center", marginBottom: "12px", fontWeight: 700 }}>
            {isAr ? "مصمم خصيصاً للخليج" : "Designed Specifically for the Gulf"}
          </h2>
          <p style={{ textAlign: "center", color: "#6B7280", marginBottom: "48px" }}>
            {isAr ? "ليس مجرد ترجمة — بُني من الصفر للسوق الخليجي" : "Not just a translation — built from scratch for the Gulf market"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { icon: "🕌", title: isAr ? "جدولة أوقات الصلاة" : "Prayer Time Scheduling", desc: isAr ? "يغلق المواعيد تلقائياً خلال أوقات الصلاة حسب مدينتك" : "Automatically blocks appointment slots during prayer times for your city" },
              { icon: "📅", title: isAr ? "تقويم هجري وميلادي" : "Hijri & Gregorian Calendar", desc: isAr ? "يعرض التواريخ بالتقويمين معاً. مرضاك يختارون ما يناسبهم" : "Displays dates in both calendars. Patients choose what suits them" },
              { icon: "💳", title: isAr ? "دفع Tap Payments" : "Tap Payments", desc: isAr ? "بوابة الدفع الأكثر ثقة في الخليج — يدعم مدى، فيزا، ماستر" : "Gulf's most trusted payment gateway — supports Mada, Visa, Mastercard" },
              { icon: "🧾", title: isAr ? "فواتير ضريبة القيمة المضافة" : "VAT Invoicing", desc: isAr ? "فواتير متوافقة مع هيئة الزكاة والضريبة — ٥٪ الإمارات، ١٥٪ السعودية" : "ZATCA-compliant invoices — 5% UAE, 15% KSA automatically applied" },
              { icon: "📱", title: isAr ? "SMS عربي فوري" : "Arabic SMS Notifications", desc: isAr ? "تذكيرات بالمواعيد عبر SMS بالعربية — من خلال Msegat وUnifonic" : "Appointment reminders via SMS in Arabic through Msegat and Unifonic" },
              { icon: "🤖", title: isAr ? "AI يتحدث العربية الخليجية" : "Gulf Arabic AI", desc: isAr ? "النموذج مدرب على اللهجات الخليجية — سعودي، إماراتي، كويتي" : "Model trained on Gulf dialects — Saudi, Emirati, Kuwaiti" },
            ].map((f, i) => (
              <div key={i} style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", border: "1px solid #DDD9FF" }}>
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{f.icon}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F0B2D", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", color: "#0F0B2D", textAlign: "center", marginBottom: "48px", fontWeight: 700 }}>
            {isAr ? "مشاكل تعرفها كل عيادة في الخليج" : "Problems Every Gulf Clinic Knows"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {[
              { icon: "🌙", title: isAr ? "مرضى يتصلون خارج أوقات العمل" : "Patients Call After Hours", desc: isAr ? "الساعة ١١ مساءً يكتب مريض عن ألم في أسنانه. لا أحد يرد. يحجز في عيادة أخرى صباحاً. هلاجAI يرد فوراً في أي وقت." : "At 11 PM a patient messages about tooth pain. No one responds. They book elsewhere by morning. HalajaI replies instantly." },
              { icon: "📋", title: isAr ? "إدارة المواعيد يدوياً" : "Manual Appointment Management", desc: isAr ? "موظف الاستقبال يقضي ٣ ساعات يومياً في تأكيد وتذكير المواعيد. هلاجAI يفعل كل هذا تلقائياً." : "Receptionist spends 3 hours daily confirming and reminding appointments. HalajaI automates all of this." },
              { icon: "❌", title: isAr ? "غياب المرضى بدون إشعار" : "No-Show Patients", desc: isAr ? "متوسط الغياب في عيادات الخليج ٢٢٪. تذكيرات SMS التلقائية تخفضها إلى أقل من ٨٪." : "Gulf clinic no-show rate averages 22%. Automated SMS reminders reduce it to under 8%." },
            ].map((p, i) => (
              <div key={i} style={{ backgroundColor: "#FFF9F0", borderRadius: "16px", padding: "24px", border: "1px solid #F0E4C8" }}>
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{p.icon}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F0B2D", marginBottom: "8px" }}>{p.title}</h3>
                <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ backgroundColor: "#EDE9FF", padding: "80px 40px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", color: "#0F0B2D", textAlign: "center", marginBottom: "8px", fontWeight: 700 }}>
            {isAr ? "أسعار شفافة وبسيطة" : "Transparent & Simple Pricing"}
          </h2>
          <p style={{ textAlign: "center", color: "#6B7280", marginBottom: "48px" }}>
            {isAr ? "الشهر الأول مجاني. بدون عقود ملزمة." : "First month free. No binding contracts."}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {PLANS.map((plan) => (
              <div key={plan.name} style={{ borderRadius: "16px", padding: "28px", border: plan.highlight ? "2px solid #C9A84C" : "1px solid #DDD9FF", backgroundColor: plan.highlight ? "#FFFBF0" : "white", position: "relative" }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -12, right: isAr ? undefined : undefined, left: "50%", transform: "translateX(-50%)", backgroundColor: "#C9A84C", color: "white", fontSize: "11px", fontWeight: 700, padding: "3px 14px", borderRadius: "50px", whiteSpace: "nowrap" }}>
                    {isAr ? "الأكثر شعبية" : "Most Popular"}
                  </div>
                )}
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F0B2D", marginBottom: "4px" }}>{plan.name}</h3>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#C9A84C", marginBottom: "4px" }}>
                  {plan.price} <span style={{ fontSize: "14px", fontWeight: 400, color: "#9CA3AF" }}>{plan.currency}/شهر</span>
                </div>
                <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>{plan.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ fontSize: "13px", color: "#374151", padding: "5px 0", display: "flex", gap: "8px" }}>
                      <span style={{ color: "#C9A84C" }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: "50px", fontSize: "14px", fontWeight: 600, textDecoration: "none", backgroundColor: plan.highlight ? "#C9A84C" : "transparent", color: plan.highlight ? "white" : "#1B1464", border: plan.highlight ? "none" : "1.5px solid #1B1464" }}>
                  {isAr ? "ابدأ مجاناً ←" : "Start Free →"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", color: "#0F0B2D", marginBottom: "16px", fontWeight: 700 }}>
            {isAr ? "جاهز لتحويل عيادتك؟" : "Ready to Transform Your Clinic?"}
          </h2>
          <p style={{ color: "#6B7280", marginBottom: "32px" }}>
            {isAr ? "انضم إلى أوائل عيادات الخليج التي تستخدم هلاجAI" : "Join the first Gulf clinics using HalajaI"}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{ backgroundColor: "#1B1464", color: "white", padding: "14px 32px", borderRadius: "50px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
              {isAr ? "ابدأ مجاناً" : "Start Free"}
            </Link>
            <a href="https://wa.me/46739381545" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "#25D366", color: "white", padding: "14px 32px", borderRadius: "50px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
              💬 {isAr ? "تواصل معنا" : "Contact Us"}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #EDE9FF", padding: "32px 40px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#1B1464" }}>هلاج<span style={{ color: "#C9A84C" }}>AI</span></span>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <a href="mailto:hello@aurive.com" style={{ fontSize: "13px", color: "#6B7280", textDecoration: "none" }}>hello@aurive.com</a>
            <a href="https://wa.me/46739381545" style={{ fontSize: "13px", color: "#6B7280", textDecoration: "none" }}>واتساب</a>
            <span style={{ fontSize: "13px", color: "#9CA3AF" }}>© 2026 Aurive</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
