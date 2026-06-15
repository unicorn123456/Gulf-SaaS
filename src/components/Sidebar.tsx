"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV = {
  ar: [
    { href: "/dashboard",     label: "لوحة التحكم",   icon: "🏠" },
    { href: "/appointments",  label: "المواعيد",       icon: "📅" },
    { href: "/conversations", label: "المحادثات",      icon: "💬" },
    { href: "/billing",       label: "الفواتير",       icon: "🧾" },
    { href: "/analytics",     label: "التحليلات",      icon: "📊" },
    { href: "/integrations",  label: "التكاملات",      icon: "🔌" },
    { href: "/settings",      label: "الإعدادات",      icon: "⚙️" },
  ],
  en: [
    { href: "/dashboard",     label: "Dashboard",      icon: "🏠" },
    { href: "/appointments",  label: "Appointments",   icon: "📅" },
    { href: "/conversations", label: "Conversations",  icon: "💬" },
    { href: "/billing",       label: "Billing",        icon: "🧾" },
    { href: "/analytics",     label: "Analytics",      icon: "📊" },
    { href: "/integrations",  label: "Integrations",   icon: "🔌" },
    { href: "/settings",      label: "Settings",       icon: "⚙️" },
  ],
};

export default function Sidebar({ lang, setLang }: { lang: "ar" | "en"; setLang: (l: "ar" | "en") => void }) {
  const path = usePathname();
  const nav = NAV[lang];
  const isAr = lang === "ar";

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside style={{ width: 220, background: "#0F0B2D", minHeight: "100vh", display: "flex", flexDirection: "column", padding: "1.5rem 0", direction: isAr ? "rtl" : "ltr", fontFamily: "system-ui, sans-serif", flexShrink: 0 }}>
      <div style={{ padding: "0 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "white", marginBottom: "0.75rem" }}>
          {isAr ? <>هلاج<span style={{ color: "#C9A84C" }}>AI</span></> : <>Halaj<span style={{ color: "#C9A84C" }}>AI</span></>}
        </div>
        {/* Language toggle */}
        <button onClick={() => setLang(isAr ? "en" : "ar")} style={{
          display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(201,168,76,0.15)",
          border: "1px solid rgba(201,168,76,0.3)", borderRadius: 50, padding: "4px 12px",
          color: "#C9A84C", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", width: "100%", justifyContent: "center",
        }}>
          🌐 {isAr ? "English" : "عربي"}
        </button>
      </div>

      <nav style={{ flex: 1, padding: "0.75rem 0" }}>
        {nav.map(item => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.65rem 1.25rem", textDecoration: "none",
              color: active ? "white" : "rgba(255,255,255,0.55)",
              background: active ? "rgba(201,168,76,0.15)" : "transparent",
              borderRight: isAr && active ? "3px solid #C9A84C" : "none",
              borderLeft: !isAr && active ? "3px solid #C9A84C" : "none",
              fontSize: "0.88rem", fontWeight: active ? 600 : 400,
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={handleLogout} style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", fontFamily: "system-ui, sans-serif" }}>
          {isAr ? "تسجيل الخروج" : "Log out"}
        </button>
      </div>
    </aside>
  );
}
