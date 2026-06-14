"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Billing() {
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [profile, setProfile] = useState<{plan: string; subscription_status: string} | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("plan, subscription_status").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) return <div style={{ padding: "40px", color: "#9c7b6b" }}>Laddar...</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: "24px", color: "#3d2b1f", marginBottom: "8px" }}>
        Fakturering
      </h1>
      <p style={{ color: "#9c7b6b", fontSize: "14px", marginBottom: "32px" }}>
        Hantera din prenumeration och se fakturor.
      </p>

      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e8d5c4", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "12px", color: "#9c7b6b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nuvarande plan</p>
            <p style={{ fontSize: "20px", fontWeight: 600, color: "#3d2b1f", textTransform: "capitalize" }}>
              {profile?.plan || "Free"}
            </p>
          </div>
          <span style={{
            fontSize: "12px", padding: "4px 12px", borderRadius: "50px",
            backgroundColor: profile?.subscription_status === "active" ? "#dcfce7" : profile?.subscription_status === "trial" ? "#fdf0e8" : "#f3f4f6",
            color: profile?.subscription_status === "active" ? "#16a34a" : profile?.subscription_status === "trial" ? "#c17f5a" : "#6b7280",
          }}>
            {profile?.subscription_status === "active" ? "Aktiv" : profile?.subscription_status === "trial" ? "Provperiod" : "Gratis"}
          </span>
        </div>
      </div>

      {profile?.subscription_status === "active" ? (
        <button
          onClick={openPortal}
          disabled={portalLoading}
          style={{
            width: "100%", padding: "14px", borderRadius: "12px", border: "none",
            backgroundColor: "#c17f5a", color: "white", fontSize: "15px",
            fontWeight: 500, cursor: "pointer", opacity: portalLoading ? 0.7 : 1
          }}
        >
          {portalLoading ? "Laddar..." : "Hantera prenumeration och fakturor →"}
        </button>
      ) : (
        <button
          onClick={async () => {
            const res = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan: "growth" }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
          }}
          style={{
            width: "100%", padding: "14px", borderRadius: "12px", border: "none",
            backgroundColor: "#c17f5a", color: "white", fontSize: "15px",
            fontWeight: 500, cursor: "pointer"
          }}
        >
          Uppgradera till Growth — 4 500 kr/mån
        </button>
      )}

      <p style={{ textAlign: "center", fontSize: "12px", color: "#b8a090", marginTop: "16px" }}>
        Fakturor skickas automatiskt via e-post efter varje betalning.
      </p>
    </div>
  );
}