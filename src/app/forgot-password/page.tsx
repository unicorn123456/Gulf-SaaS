"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email) return;
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6FF", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "system-ui, sans-serif", direction: "rtl" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "2.5rem", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #EDE9FF" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0F0B2D" }}>هلاج<span style={{ color: "#C9A84C" }}>AI</span></div>
          <div style={{ color: "#6B7280", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            {sent ? "تم الإرسال" : "استعادة كلمة المرور"}
          </div>
        </div>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📧</div>
            <p style={{ color: "#374151", marginBottom: "1.5rem", lineHeight: 1.7 }}>
              تم إرسال رابط استعادة كلمة المرور إلى <strong>{email}</strong>.<br />
              تحقق من بريدك الإلكتروني.
            </p>
            <Link href="/login" style={{ display: "block", background: "#0F0B2D", color: "white", padding: "0.75rem", borderRadius: 50, textDecoration: "none", fontWeight: 700, textAlign: "center" }}>
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ color: "#6B7280", fontSize: "0.88rem", lineHeight: 1.6 }}>
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة كلمة المرور.
            </p>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: 4 }}>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="clinic@example.com" dir="ltr"
                style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none", direction: "ltr" }} />
            </div>
            {error && <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "0.65rem", borderRadius: 8, fontSize: "0.85rem" }}>{error}</div>}
            <button onClick={handleSubmit} disabled={loading || !email}
              style={{ background: "#0F0B2D", color: "white", padding: "0.75rem", borderRadius: 50, fontSize: "0.95rem", fontWeight: 700, border: "none", cursor: "pointer", opacity: (loading || !email) ? 0.6 : 1 }}>
              {loading ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
            </button>
            <div style={{ textAlign: "center" }}>
              <Link href="/login" style={{ fontSize: "0.85rem", color: "#C9A84C", textDecoration: "none" }}>← العودة لتسجيل الدخول</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
