"use client";
import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabase";

const INTEGRATIONS = [
  {
    id: "bokadirekt",
    name: "Bokadirekt",
    description: "Sweden's largest booking platform for clinics. Paste your clinic URL and VårdAI will send patients there automatically.",
    logo: "🗓️",
    field: "bokadirekt_url",
    placeholder: "https://www.bokadirekt.se/places/your-clinic",
    status: "manual",
  },
  {
    id: "muntra",
    name: "Muntra",
    description: "Dental practice management system. Paste your booking link so patients can book directly.",
    logo: "🦷",
    field: "muntra_url",
    placeholder: "https://muntra.se/book/your-clinic",
    status: "manual",
  },
  {
    id: "alma",
    name: "Alma",
    description: "Clinic management platform. Add your booking URL to connect patient flow.",
    logo: "🏥",
    field: "alma_url",
    placeholder: "https://your-clinic.alma.se/book",
    status: "manual",
  },
  {
    id: "google",
    name: "Google Business",
    description: "Your Google Business profile URL. Patients will be sent here for reviews.",
    logo: "🌐",
    field: "google_url",
    placeholder: "https://g.page/your-clinic",
    status: "manual",
  },
];

export default function Integrations() {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("clinic_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setUrls({
        bokadirekt_url: data.bokadirekt_url ?? "",
        muntra_url: data.muntra_url ?? "",
        alma_url: data.alma_url ?? "",
        google_url: data.google_url ?? "",
      });
    }
    setLoading(false);
  }

  async function saveIntegrations() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("clinic_settings").upsert({
      user_id: user.id,
      ...urls,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Integrations</h1>
      <p className="text-sm text-gray-500 mb-8">Connect your existing booking systems. VårdAI works alongside them — nothing gets replaced.</p>

      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => (
          <div key={integration.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{integration.logo}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{integration.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    URL link
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{integration.description}</p>
              </div>
            </div>
            <input
              value={urls[integration.field] ?? ""}
              onChange={e => setUrls({ ...urls, [integration.field]: e.target.value })}
              placeholder={integration.placeholder}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl p-4" style={{backgroundColor: "#fdf0e8", border: "1px solid #e8d5c4"}}>
        <p className="text-xs leading-relaxed" style={{color: "#c17f5a"}}>
          <strong>Coming soon:</strong> Direct API integrations with Bokadirekt and Muntra are in development. Once available, VårdAI will sync appointments automatically without manual entry.
        </p>
      </div>

      <button
        onClick={saveIntegrations}
        disabled={saving}
        className="w-full mt-4 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors" style={{backgroundColor: "#c17f5a"}}
      >
        {saving ? "Sparar..." : saved ? "✓ Sparad" : "Spara integrationer"}
      </button>
    </div>
  );
}