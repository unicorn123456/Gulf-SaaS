"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const CLINIC_TYPES = [
  "Tandläkare",
  "Fysioterapi",
  "Estetisk klinik",
  "Psykolog/Terapeut",
  "Allmänläkare",
  "Annat",
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clinic_name: "",
    clinic_type: "",
    org_number: "",
    phone: "",
    address: "",
    booking_url: "",
    slug: "",
  });

  async function saveAndContinue() {
    if (step === 4) {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const slug = form.slug ||
        form.clinic_name.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

      await Promise.all([
        supabase.from("profiles").upsert({
          id: user.id,
          clinic_name: form.clinic_name,
          clinic_type: form.clinic_type,
          org_number: form.org_number,
          slug,
          trial_started_at: new Date().toISOString(),
          subscription_status: "trial",
          plan: "growth",
        }, { onConflict: "id" }),
        supabase.from("clinic_settings").upsert({
          user_id: user.id,
          clinic_name: form.clinic_name,
          phone: form.phone,
          address: form.address,
          booking_url: form.booking_url,
          language: "sv",
        }, { onConflict: "user_id" }),
      ]);

      setSaving(false);
     

    // Notify admin of new signup
      fetch("/api/notify-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_name: form.clinic_name,
          org_number: form.org_number,
          clinic_type: form.clinic_type,
          email: user?.email,
        }),
      }).catch(console.error);

      // Send welcome email
      fetch("/api/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          clinic_name: form.clinic_name,
          slug,
        }),
      }).catch(console.error);

      router.push("/dashboard");
  
    } else {
      setStep(step + 1);
    }
  }
  

  const canContinue = () => {
    if (step === 1) return form.clinic_name && form.clinic_type;
    if (step === 2) return form.org_number;
    if (step === 3) return form.phone;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="font-bold text-2xl" style={{fontFamily: "Georgia, serif", color: "#5c3d2e"}}>VårdAI</span>
          <p className="text-sm text-gray-500 mt-1">Konfigurera din klinik</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i <= step ? "bg-[#c17f5a]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">

          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Om din klinik</h2>
              <p className="text-sm text-gray-500 mb-5">Grundläggande information om din verksamhet.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Klinikens namn *</label>
                  <input
                    value={form.clinic_name}
                    onChange={e => setForm({ ...form, clinic_name: e.target.value })}
                    placeholder="t.ex. SmileCare Tandläkare"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Typ av klinik *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CLINIC_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setForm({ ...form, clinic_type: type })}
                        className={`py-2 px-3 rounded-lg text-sm border transition-colors text-left ${
                          form.clinic_type === type
                          ? "border-[#c17f5a] text-[#c17f5a]"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Verifiering</h2>
              <p className="text-sm text-gray-500 mb-5">Vi verifierar att din klinik är registrerad i Sverige.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Organisationsnummer *</label>
                <input
                  value={form.org_number}
                  onChange={e => setForm({ ...form, org_number: e.target.value })}
                  placeholder="XXXXXX-XXXX"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
                />
                <p className="text-xs text-gray-400 mt-1">Ditt organisationsnummer hittar du på Bolagsverket.</p>
              </div>
              <div className="mt-4 rounded-xl p-4" style={{backgroundColor: "#fdf0e8", border: "1px solid #e8d5c4"}}>
                <p className="text-xs" style={{color: "#c17f5a"}}>Vi granskar din registrering manuellt inom 24 timmar. Du kan börja använda VårdAI direkt medan vi verifierar.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Kontaktuppgifter</h2>
              <p className="text-sm text-gray-500 mb-5">Patienter ser dessa uppgifter i AI-chatten.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefonnummer *</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="08-123 456 78"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adress</label>
                  <input
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Sveavägen 12, Stockholm"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Bokningssystem</h2>
              <p className="text-sm text-gray-500 mb-5">Koppla ditt befintliga bokningssystem.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bokningslänk</label>
                  <input
                    value={form.booking_url}
                    onChange={e => setForm({ ...form, booking_url: e.target.value })}
                    placeholder="https://www.bokadirekt.se/din-klinik"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
                  />
                  <p className="text-xs text-gray-400 mt-1">Din Bokadirekt, Muntra eller annan bokningssida.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Din klinik-URL på VårdAI</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 whitespace-nowrap">vardai.se/chat/</span>
                    <input
                      value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                      placeholder="din-klinik"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Lämna tomt för att generera automatiskt från kliniknamnet.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Tillbaka
              </button>
            )}
            <button
              onClick={saveAndContinue}
              disabled={!canContinue() || saving}
              className="flex-1 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors" style={{backgroundColor: "#c17f5a"}}
            >
              {saving ? "Sparar..." : step === 4 ? "Kom igång →" : "Fortsätt →"}
            </button>
          </div>

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600"
            >
              Hoppa över för nu
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">Steg {step} av 4</p>
      </div>
    </div>
  );
}