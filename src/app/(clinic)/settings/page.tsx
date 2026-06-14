"use client";
import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabase";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState({
    clinic_name: "",
    booking_url: "",
    phone: "",
    address: "",
    language: "sv",
    slug: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
  
    setUserEmail(user.email ?? "");

    const [{ data: settings }, { data: profile }] = await Promise.all([
      supabase.from("clinic_settings").select("*").eq("user_id", user.id).single(),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

    if (settings) {
      setForm({
        clinic_name: settings.clinic_name ?? "",
        booking_url: settings.booking_url ?? "",
        phone: settings.phone ?? "",
        address: settings.address ?? "",
        language: settings.language ?? "sv",
        slug: profile?.slug ?? "",
      });
    }
    setLoading(false);
  }

  async function saveSettings() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

  const { slug, ...settingsForm } = form;

    await Promise.all([
      supabase.from("clinic_settings").upsert({
        user_id: user.id,
        ...settingsForm,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" }),
      supabase.from("profiles").upsert({
        id: user.id,
        slug: slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        clinic_name: settingsForm.clinic_name,
      }, { onConflict: "id" }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return (
    <div className="p-6 text-sm text-gray-400">Loading...</div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
     <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">Inloggad som</p>
          <p className="text-sm font-medium text-gray-900">{userEmail}</p>
        </div>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Klinikens inställningar</h1>
      <p className="text-sm text-gray-500 mb-8">Denna information används av AI-receptionisten och påminnelser.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Klinikens namn</label>
          <input
            value={form.clinic_name}
            onChange={e => setForm({ ...form, clinic_name: e.target.value })}
            placeholder="e.g. SmileCare Tandläkare"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bokningslänk</label>
          <input
            value={form.booking_url}
            onChange={e => setForm({ ...form, booking_url: e.target.value })}
            placeholder="e.g. https://www.bokadirekt.se/your-clinic"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
          />
          <p className="text-xs text-gray-400 mt-1">Din Bokadirekt, Muntra eller annan bokningssida. AI:n skickar patienter hit.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Klinikens telefon</label>
          <input
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. 08-123 456 78"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Adress</label>
          <input
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="e.g. Sveavägen 12, Stockholm"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Standardspråk</label>
          <select
            value={form.language}
            onChange={e => setForm({ ...form, language: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
          >
            <option value="sv">Svenska</option>
            <option value="en">Engelska</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Din klinik-URL</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">vardai.se/chat/</span>
            <input
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              placeholder="din-klinik"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Dela denna länk med dina patienter. Endast bokstäver, siffror och bindestreck.</p>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors" style={{backgroundColor: "#c17f5a"}}
        >
          {saving ? "Sparar..." : saved ? "✓ Sparad" : "Spara inställningar"}
        </button>
      </div>
    </div>
  );
}