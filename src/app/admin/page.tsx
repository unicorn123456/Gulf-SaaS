"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ADMIN_EMAIL = "ikbalismail10135@gmail.com";

type Clinic = {
  id: string;
  email: string;
  clinic_name: string;
  clinic_type: string;
  org_number: string;
  verified: boolean;
  plan: string;
  subscription_status: string;
  slug: string;
  created_at: string;
  trial_started_at: string | null;
};

export default function AdminPanel() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      loadClinics();
    } else {
      setLoading(false);
    }
  }

  async function loadClinics() {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/clinics", {
      headers: { "Authorization": `Bearer ${session?.access_token}` }
    });
    const data = await res.json();
    setClinics(Array.isArray(data) ? data : []);
    setLoading(false);
  }

async function updateClinic(id: string, updates: Record<string, unknown>) {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch("/api/admin/clinics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ id, updates }),
    });
    loadClinics();
  }

 async function toggleVerified(id: string, current: boolean) {
    await updateClinic(id, { verified: !current });
  }

  async function startTrial(id: string) {
    await updateClinic(id, {
      trial_started_at: new Date().toISOString(),
      trial_used: true,
      subscription_status: "trial",
      plan: "growth",
    });
  }

  async function revokeAccess(id: string) {
    await updateClinic(id, {
      subscription_status: "free",
      plan: "free",
    });
  }

  const filtered = clinics.filter(c =>
    c.clinic_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.org_number?.includes(search)
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdf8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9c7b6b" }}>Laddar...</p>
    </div>
  );

  if (!isAdmin) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdf8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#c17f5a", fontSize: "14px" }}>Åtkomst nekad.</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdf8f3", padding: "40px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "#3d2b1f", marginBottom: "4px" }}>
            VårdAI Admin
          </h1>
          <p style={{ color: "#9c7b6b", fontSize: "14px" }}>{clinics.length} registrerade kliniker</p>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Sök klinik, e-post eller org-nummer..."
          style={{
            width: "100%", padding: "10px 16px", borderRadius: "10px",
            border: "1px solid #e8d5c4", backgroundColor: "white",
            fontSize: "14px", color: "#3d2b1f", marginBottom: "24px",
            outline: "none"
          }}
        />

        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e8d5c4", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#fdf0e8", borderBottom: "1px solid #e8d5c4" }}>
                {["Klinik", "E-post", "Org-nummer", "Typ", "Plan", "Verifierad", "Åtgärder"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#9c7b6b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((clinic, i) => (
                <tr key={clinic.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f5ede3" : "none" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#3d2b1f" }}>{clinic.clinic_name || "—"}</div>
                    <div style={{ fontSize: "12px", color: "#b8a090" }}>{clinic.slug || "ingen slug"}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#7a5c4a" }}>{clinic.email}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <a
                      href={`https://www.allabolag.se/${clinic.org_number?.replace("-", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "13px", color: "#c17f5a", textDecoration: "none" }}
                    >
                      {clinic.org_number || "—"}
                    </a>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#7a5c4a" }}>{clinic.clinic_type || "—"}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      fontSize: "12px", padding: "3px 10px", borderRadius: "50px",
                      backgroundColor: clinic.subscription_status === "active" ? "#dcfce7" : clinic.subscription_status === "trial" ? "#fdf0e8" : "#f3f4f6",
                      color: clinic.subscription_status === "active" ? "#16a34a" : clinic.subscription_status === "trial" ? "#c17f5a" : "#6b7280",
                    }}>
                      {clinic.plan || "free"} — {clinic.subscription_status || "free"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => toggleVerified(clinic.id, clinic.verified)}
                      style={{
                        fontSize: "12px", padding: "4px 12px", borderRadius: "50px", cursor: "pointer",
                        border: "none",
                        backgroundColor: clinic.verified ? "#dcfce7" : "#fee2e2",
                        color: clinic.verified ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {clinic.verified ? "✓ Verifierad" : "✗ Ej verifierad"}
                    </button>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {!clinic.trial_started_at && (
                        <button
                          onClick={() => startTrial(clinic.id)}
                          style={{
                            fontSize: "11px", padding: "4px 10px", borderRadius: "6px",
                            backgroundColor: "#c17f5a", color: "white", border: "none", cursor: "pointer"
                          }}
                        >
                          Starta trial
                        </button>
                      )}
                      <button
                        onClick={() => revokeAccess(clinic.id)}
                        style={{
                          fontSize: "11px", padding: "4px 10px", borderRadius: "6px",
                          backgroundColor: "#fee2e2", color: "#dc2626", border: "none", cursor: "pointer"
                        }}
                      >
                        Återkalla
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
