"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase handles the token from URL hash automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset() {
    if (!password || password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    setLoading(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else { setDone(true); setTimeout(() => router.push("/dashboard"), 2000); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6FF", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "system-ui, sans-serif", direction: "rtl" }}>
      <div style={{ background: "white", borderRadius: 20, padding: "2.5rem", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #EDE9FF" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#0F0B2D" }}>هلاج<span style={{ color: "#C9A84C" }}>AI</span></div>
          <div style={{ color: "#6B7280", fontSize: "0.9rem", marginTop: "0.5rem" }}>تعيين كلمة مرور جديدة</div>
        </div>

        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <p style={{ color: "#059669", fontWeight: 600 }}>تم تغيير كلمة المرور بنجاح</p>
            <p style={{ color: "#6B7280", fontSize: "0.85rem", marginTop: "0.5rem" }}>جارٍ تحويلك للوحة التحكم...</p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: "center", color: "#6B7280" }}>
            <p>جارٍ التحقق من الرابط...</p>
            <p style={{ fontSize: "0.82rem", marginTop: "0.5rem" }}>إذا لم يحدث شيء، يرجى طلب رابط جديد من</p>
            <a href="/forgot-password" style={{ color: "#C9A84C", fontSize: "0.85rem" }}>صفحة استعادة كلمة المرور</a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { key: "password", label: "كلمة المرور الجديدة", val: password, set: setPassword },
              { key: "confirm", label: "تأكيد كلمة المرور", val: confirm, set: setConfirm },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: 4 }}>{f.label}</label>
                <input type="password" value={f.val} onChange={e => f.set(e.target.value)}
                  placeholder="••••••••" dir="ltr"
                  style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: "0.9rem", outline: "none", direction: "ltr" }} />
              </div>
            ))}
            {error && <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "0.65rem", borderRadius: 8, fontSize: "0.85rem" }}>{error}</div>}
            <button onClick={handleReset} disabled={loading || !password || !confirm}
              style={{ background: "#0F0B2D", color: "white", padding: "0.75rem", borderRadius: 50, fontSize: "0.95rem", fontWeight: 700, border: "none", cursor: "pointer", opacity: (loading || !password || !confirm) ? 0.6 : 1 }}>
              {loading ? "جارٍ الحفظ..." : "تعيين كلمة المرور"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
