"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ClinicProfile = {
  clinic_name: string;
  clinic_type: string;
  slug: string;
  phone: string | null;
  address: string | null;
  booking_url: string | null;
};

export default function ClinicPublicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [clinic, setClinic] = useState<ClinicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, clinic_name, clinic_type, slug")
        .eq("slug", slug)
        .single();

      if (!profile) { setLoading(false); return; }

      const { data: settings } = await supabase
        .from("clinic_settings")
        .select("phone, address, booking_url")
        .eq("user_id", profile.id)
        .single();

      setClinic({
        clinic_name: profile.clinic_name ?? slug,
        clinic_type: profile.clinic_type ?? "",
        slug: profile.slug,
        phone: settings?.phone ?? null,
        address: settings?.address ?? null,
        booking_url: settings?.booking_url ?? null,
      });
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdf8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9c7b6b" }}>Laddar...</p>
    </div>
  );

  if (!clinic) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdf8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9c7b6b" }}>Kliniken hittades inte.</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdf8f3" }}>

      {/* Nav */}
      <nav style={{ padding: "16px 40px", borderBottom: "1px solid #e8d5c4", backgroundColor: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#5c3d2e" }}>VårdAI</span>
        <a href={`/chat/${slug}`} style={{
          backgroundColor: "#c17f5a", color: "white", padding: "8px 20px",
          borderRadius: "50px", fontSize: "13px", textDecoration: "none"
        }}>
          Chatta med receptionisten
        </a>
      </nav>

      {/* Hero */}
      <div style={{ backgroundColor: "#c17f5a", padding: "60px 40px", textAlign: "center" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          backgroundColor: "white", margin: "0 auto 20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "32px"
        }}>
          {clinic.clinic_type === "Tandläkare" ? "🦷" :
           clinic.clinic_type === "Fysioterapi" ? "💪" :
           clinic.clinic_type === "Estetisk klinik" ? "✨" : "🏥"}
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", color: "white", marginBottom: "8px" }}>
          {clinic.clinic_name}
        </h1>
        <p style={{ color: "#f5ede3", fontSize: "16px" }}>{clinic.clinic_type}</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "48px 24px" }}>

        {/* Contact cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {clinic.phone && (
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e8d5c4" }}>
              <p style={{ fontSize: "11px", color: "#9c7b6b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Telefon</p>
              <a href={`tel:${clinic.phone}`} style={{ fontSize: "16px", color: "#3d2b1f", textDecoration: "none", fontWeight: 500 }}>
                {clinic.phone}
              </a>
            </div>
          )}
          {clinic.address && (
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e8d5c4" }}>
              <p style={{ fontSize: "11px", color: "#9c7b6b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Adress</p>
              <p style={{ fontSize: "15px", color: "#3d2b1f", fontWeight: 500 }}>{clinic.address}</p>
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {clinic.booking_url && (
                <a
              href={clinic.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block", textAlign: "center",
                backgroundColor: "#c17f5a", color: "white",
                padding: "16px", borderRadius: "12px",
                fontSize: "15px", fontWeight: 500, textDecoration: "none"
              }}
            >
              Boka tid online →
            </a>
          )}
          <a
            href={`/boka/${slug}`}
            style={{
              display: "block", textAlign: "center",
              backgroundColor: "white", color: "#5c3d2e",
              padding: "16px", borderRadius: "12px",
              fontSize: "15px", fontWeight: 500, textDecoration: "none",
              border: "1px solid #e8d5c4"
            }}
          >
            Skicka bokningsförfrågan
          </a>
          <a
            href={`/chat/${slug}`}
            style={{
              display: "block", textAlign: "center",
              backgroundColor: "#f5ede3", color: "#c17f5a",
              padding: "16px", borderRadius: "12px",
              fontSize: "15px", fontWeight: 500, textDecoration: "none"
            }}
          >
            Chatta med AI-receptionisten
          </a>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#b8a090", marginTop: "32px" }}>
          Drivs av <a href="https://vardai.se" style={{ color: "#c17f5a" }}>VårdAI</a>
        </p>
      </div>
    </div>
  );
}