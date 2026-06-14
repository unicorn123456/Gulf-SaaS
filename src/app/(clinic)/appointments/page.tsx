"use client";
import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabase";

type Appointment = {
  id: string;
  created_at: string;
  clinic_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  treatment_type: string;
  status: string;
  reminder_sent: boolean;
  language: string;
};

const statusConfig = {
  confirmed: { color: "bg-[#fdf0e8] text-[#c17f5a] border-[#e8d5c4]", label: "Bekräftad" },
  reminded: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Påmind" },
  cancelled: { color: "bg-red-100 text-red-700 border-red-200", label: "Avbokad" },
  completed: { color: "bg-green-100 text-green-700 border-green-200", label: "Genomförd" },
  no_show: { color: "bg-gray-100 text-gray-600 border-gray-200", label: "Utebliven" },
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [reviewSending, setReviewSending] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [instrSending, setInstrSending] = useState<string | null>(null);
  const [form, setForm] = useState({
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    appointment_date: "",
    treatment_type: "",
    language: "sv",
  });

  useEffect(() => {
    fetchAppointments();
    fetchInstructions();
  }, []);

  async function fetchInstructions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("instructions")
      .select("*")
      .eq("clinic_id", user.id);
    setInstructions(data ?? []);
  }

  async function sendInstruction(appointment: Appointment, instructionId: string) {
    if (!instructionId) return;
    const instruction = instructions.find((i) => i.id === instructionId);
    if (!instruction) return;
    setInstrSending(appointment.id);
    try {
      await fetch("/api/send-instruction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment, instruction }),
      });
    } finally {
      setInstrSending(null);
    }
  }
  async function fetchAppointments() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("clinic_id", user.id)
      .order("appointment_date", { ascending: true });
    setAppointments(data ?? []);
    setLoading(false);
  }

  async function addAppointment() {
    if (!form.patient_name || !form.patient_email || !form.appointment_date) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("appointments").insert({
      ...form,
      clinic_id: user.id,
    });
    setForm({
      patient_name: "",
      patient_email: "",
      patient_phone: "",
      appointment_date: "",
      treatment_type: "",
      language: "sv",
    });
    setShowForm(false);
    fetchAppointments();
  }

  async function sendReminder(appointment: Appointment) {
    setSending(appointment.id);
    try {
      const res = await fetch("/api/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment }),
      });
      const data = await res.json();
      if (data.success || data.reminder) {
        await supabase
          .from("appointments")
          .update({ reminder_sent: true, status: "reminded" })
          .eq("id", appointment.id);
        fetchAppointments();
      }
    } finally {
      setSending(null);
    }
  }

  async function sendReviewRequest(appointment: Appointment) {
    setReviewSending(appointment.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let googleReviewUrl = "";
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("google_review_url")
          .eq("id", user.id)
          .single();
        googleReviewUrl = profile?.google_review_url || "";
      }

      if (!googleReviewUrl) {
        alert("Du har inte lagt till din Google-recensionslänk ännu. Gå till Inställningar för att lägga till den.");
        setReviewSending(null);
        return;
      }

      const res = await fetch("/api/review-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment, googleReviewUrl }),
      });
      const data = await res.json();

      if (data.success) {
        await supabase
          .from("appointments")
          .update({ status: "completed" })
          .eq("id", appointment.id);
        fetchAppointments();
      }
    } finally {
      setReviewSending(null);
    }
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    fetchAppointments();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("sv-SE", {
      weekday: "short", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  const upcoming = appointments.filter(a =>
    new Date(a.appointment_date) > new Date() && a.status !== "cancelled"
  );
  const noShows = appointments.filter(a => a.status === "no_show").length;
  const reminded = appointments.filter(a => a.reminder_sent).length;

  return (
  
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6 border-b border-gray-200 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Bokningar</h1>
          <p className="text-sm text-gray-500">System för att minska uteblivna besök</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-white px-4 py-2 rounded-lg" style={{backgroundColor: "#c17f5a"}}
        >
          + Ny bokning
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold" style={{color: "#c17f5a"}}>{upcoming.length}</div>
            <div className="text-sm text-gray-500 mt-1">Kommande</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{reminded}</div>
            <div className="text-sm text-gray-500 mt-1">Skickade påminnelser</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{noShows}</div>
            <div className="text-sm text-gray-500 mt-1">Uteblivna</div>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Ny bokning</h2>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Patientens namn *"
                value={form.patient_name}
                onChange={e => setForm({ ...form, patient_name: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
                />
              <input
                placeholder="E-post *"
                type="email"
                value={form.patient_email}
                onChange={e => setForm({ ...form, patient_email: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
                />
              <input
                placeholder="Telefon"
                value={form.patient_phone}
                onChange={e => setForm({ ...form, patient_phone: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
                />
              <input
                placeholder="Behandlingstyp"
                value={form.treatment_type}
                onChange={e => setForm({ ...form, treatment_type: e.target.value })}
               className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
               />
              <input
                type="datetime-local"
                value={form.appointment_date}
                onChange={e => setForm({ ...form, appointment_date: e.target.value })}
               className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
               />
              <select
                value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
                >
                <option value="sv">Svenska</option>
                <option value="en">Engelska</option>
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={addAppointment}
                className="bg-[#c17f5a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#a86b4a]"
              >
                Spara
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}

        {/* Appointments list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-700">Alla bokningar</h2>
          </div>
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">Laddar...</div>
          ) : appointments.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Inga bokningar ännu — lägg till en ovan
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((a) => {
                const st = statusConfig[a.status as keyof typeof statusConfig] ?? statusConfig.confirmed;
                return (
                  <div key={a.id} className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{a.patient_name}</span>
                          <span className="text-xs text-gray-400">{a.language === "sv" ? "🇸🇪" : "🇬🇧"}</span>
                          {a.reminder_sent && (
                            <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-0.5 rounded-full">
                              Påminnelse skickad
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{a.patient_email}</div>
                        {a.treatment_type && (
                          <div className="text-sm text-gray-400 mt-1">{a.treatment_type}</div>
                        )}
                        <div className="text-sm font-medium mt-1" style={{color: "#c17f5a"}}>
                          {formatDate(a.appointment_date)}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${st.color}`}>
                          {st.label}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => sendReminder(a)}
                            disabled={sending === a.id || a.reminder_sent}
                            className="text-xs text-white px-3 py-1 rounded-lg disabled:opacity-40 transition-colors" style={{backgroundColor: "#c17f5a"}}
                          >
                            {sending === a.id ? "Skickar..." : "Skicka påminnelse"}
                          </button>
                          <button
                            onClick={() => sendReviewRequest(a)}
                            disabled={reviewSending === a.id}
                            className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
                          >
                            {reviewSending === a.id ? "Skickar..." : "⭐ Be om recension"}
                          </button>
                                                    {instructions.length > 0 && (
                            <select
                              onChange={(e) => { sendInstruction(a, e.target.value); e.target.value = ""; }}
                              disabled={instrSending === a.id}
                              defaultValue=""
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none text-gray-900 bg-white"
                            >
                              <option value="" disabled>{instrSending === a.id ? "Skickar..." : "📋 Instruktioner"}</option>
                              {instructions.map((i) => (
                                <option key={i.id} value={i.id}>{i.title}</option>
                              ))}
                            </select>
                          )}
                          <select
                            value={a.status}
                            onChange={e => updateStatus(a.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none text-gray-900 bg-white"
                          >
                            <option value="confirmed">Bekräftad</option>
                            <option value="reminded">Påmind</option>
                            <option value="cancelled">Avbokad</option>
                            <option value="completed">Genomförd</option>
                            <option value="no_show">Utebliven</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
   
  );
}