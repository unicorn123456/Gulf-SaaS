"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  async function handleSubmit() {
    setLoading(true); setError("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/dashboard";
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        window.location.href = "/onboarding";
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6FF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Sans Arabic', system-ui" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "2.5rem", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #EDE9FF" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#1B1464" }}>هلاج<span style={{ color: "#C9A84C" }}>AI</span></div>
          <div style={{ color: "#6B7280", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            {mode === "login" ? "مرحباً بعودتك" : "إنشاء حساب جديد"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: 4 }}>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="clinic@example.com" dir="ltr"
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none", direction: "ltr" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: 4 }}>كلمة المرور</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" dir="ltr"
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none", direction: "ltr" }} />
          </div>

          {error && <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "0.65rem", borderRadius: 8, fontSize: "0.85rem" }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{ background: "#1B1464", color: "white", padding: "0.75rem", borderRadius: 50, fontSize: "0.95rem", fontWeight: 600, border: "none", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "جارٍ التحميل..." : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "#6B7280" }}>
          {mode === "login" ? (
            <>ليس لديك حساب؟ <button onClick={() => setMode("signup")} style={{ color: "#C9A84C", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>إنشاء حساب</button></>
          ) : (
            <>لديك حساب بالفعل؟ <button onClick={() => setMode("login")} style={{ color: "#C9A84C", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>تسجيل الدخول</button></>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/" style={{ fontSize: "0.8rem", color: "#9CA3AF", textDecoration: "none" }}>← العودة للرئيسية</Link>
        </div>
      </div>
    </div>
  );
}
