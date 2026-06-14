"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Clinic = {
  clinic_name: string;
  deposit_amount: number;
  clinic_slug: string;
};

export default function BookingPage() {
  const params = useParams();
  const clinicSlug = params.clinic as string;

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    personnummer: "",
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    appointment_date: "",
    treatment_type: "",
    language: "sv",
  });
 

  useEffect(() => {
    fetch(`/api/clinic/${clinicSlug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setClinic(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [clinicSlug]);

  async function handleBooking() {
    if (!form.patient_name || !form.patient_email || !form.appointment_date) {
      alert("Fyll i namn, e-post och önskad tid.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicSlug, ...form }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Något gick fel. Försök igen.");
        setSubmitting(false);
      }
    } catch {
      alert("Något gick fel. Försök igen.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-400">Laddar...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Kliniken hittades inte</h1>
          <p className="text-sm text-gray-500">Kontrollera att länken är korrekt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">{clinic?.clinic_name || "Boka tid"}</h1>
          <p className="text-sm text-gray-500 mt-1">Boka din tid online</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Ditt namn *"
              value={form.patient_name}
              onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
            />
            <input
              type="email"
              placeholder="E-postadress *"
              value={form.patient_email}
              onChange={(e) => setForm({ ...form, patient_email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
            />
            <input
              type="tel"
              placeholder="Telefonnummer"
              value={form.patient_phone}
              onChange={(e) => setForm({ ...form, patient_phone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
            />
             <input
              type="text"
              placeholder="Personnummer (YYYYMMDD-XXXX)"
              value={form.personnummer}
              onChange={(e) => setForm({ ...form, personnummer: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
            />
            <input
              type="text"
              placeholder="Vilken behandling? (t.ex. konsultation)"
              value={form.treatment_type}
              onChange={(e) => setForm({ ...form, treatment_type: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Önskad tid *</label>
              <input
                type="datetime-local"
                value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Deposit info */}
          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-900 font-medium">Deposition vid bokning</span>
              <span className="text-lg font-bold text-blue-600">{clinic?.deposit_amount} kr</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Depositionen säkrar din tid och dras av från din slutliga behandlingskostnad.
            </p>
          </div>

          <button
            onClick={handleBooking}
            disabled={submitting}
            className="w-full mt-5 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Skickar..." : `Boka och betala ${clinic?.deposit_amount} kr`}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Säker betalning via Stripe. Du får en bekräftelse via e-post.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">Drivs av VårdAI</p>
      </div>
    </div>
  );
}