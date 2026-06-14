"use client";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Nav() {
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const links = [
    { href: "/dashboard", label: "Översikt" },
    { href: "/appointments", label: "Bokningar" },
    { href: "/instructions", label: "Instruktioner" },
    { href: "/chat", label: "Chatt" },
    { href: "/settings", label: "Inställningar" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-blue-600 font-bold text-lg">VårdAI</span>
          <div className="flex gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Logga ut
        </button>
      </div>
    </nav>
  );
}