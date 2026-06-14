"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/dashboard",     label: "لوحة التحكم",   icon: "🏠" },
  { href: "/appointments",  label: "المواعيد",       icon: "📅" },
  { href: "/conversations", label: "المحادثات",      icon: "💬" },
  { href: "/billing",       label: "الفواتير",       icon: "🧾" },
  { href: "/analytics",     label: "التحليلات",      icon: "📊" },
  { href: "/integrations",  label: "التكاملات",      icon: "🔌" },
  { href: "/settings",      label: "الإعدادات",      icon: "⚙️" },
];

export default function Sidebar() {
  const path = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside style={{ width: 220, background: "#0F0B2D", minHeight: "100vh", display: "flex", flexDirection: "column", padding: "1.5rem 0", direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', system-ui", flexShrink: 0 }}>
      <div style={{ padding: "0 1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "white" }}>
          هلاج<span style={{ color: "#C9A84C" }}>AI</span>
        </div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>لوحة إدارة العيادة</div>
      </div>

      <nav style={{ flex: 1, padding: "1rem 0" }}>
        {NAV.map(item => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.65rem 1.25rem", textDecoration: "none",
              color: active ? "white" : "rgba(255,255,255,0.55)",
              background: active ? "rgba(201,168,76,0.15)" : "transparent",
              borderRight: active ? "3px solid #C9A84C" : "3px solid transparent",
              fontSize: "0.88rem", fontWeight: active ? 600 : 400,
              transition: "all 0.15s",
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={handleLogout} style={{ width: "100%", padding: "0.6rem", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", fontFamily: "'IBM Plex Sans Arabic', system-ui" }}>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
