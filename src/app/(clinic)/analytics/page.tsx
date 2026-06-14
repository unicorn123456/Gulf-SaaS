"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Stats = {
  totalConversations: number;
  emergencies: number;
  urgent: number;
  routine: number;
  totalAppointments: number;
  noShows: number;
  remindedCount: number;
  noShowRate: string;
  swedishPatients: number;
  englishPatients: number;
};

export default function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    loadStats();
  }, [period]);

  async function loadStats() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const since = new Date();
    since.setDate(since.getDate() - parseInt(period));

    const [{ data: conversations }, { data: appointments }] = await Promise.all([
      supabase.from("conversations")
        .select("*")
        .eq("clinic_id", user.id)
        .gte("created_at", since.toISOString()),
      supabase.from("appointments")
        .select("*")
        .eq("clinic_id", user.id)
        .gte("created_at", since.toISOString()),
    ]);

    const c = conversations ?? [];
    const a = appointments ?? [];

    const noShows = a.filter(x => x.status === "no_show").length;
    const reminded = a.filter(x => x.reminder_sent).length;
    const noShowRate = reminded > 0
      ? ((noShows / reminded) * 100).toFixed(1)
      : "0";

    setStats({
      totalConversations: c.length,
      emergencies: c.filter(x => x.urgency === "emergency").length,
      urgent: c.filter(x => x.urgency === "urgent").length,
      routine: c.filter(x => x.urgency === "routine").length,
      totalAppointments: a.length,
      noShows,
      remindedCount: reminded,
      noShowRate,
      swedishPatients: c.filter(x => x.language === "sv").length,
      englishPatients: c.filter(x => x.language === "en").length,
    });
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Analys</h1>
          <p className="text-sm text-gray-500">Statistik och insikter för din klinik</p>
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
        >
          <option value="7">Senaste 7 dagarna</option>
          <option value="30">Senaste 30 dagarna</option>
          <option value="90">Senaste 90 dagarna</option>
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Laddar...</div>
      ) : stats ? (
        <div className="space-y-6">

          {/* Conversations */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Patientärenden</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Totalt", value: stats.totalConversations, color: "text-gray-900" },
                { label: "Akuta", value: stats.emergencies, color: "text-red-600" },
                { label: "Brådskande", value: stats.urgent, color: "text-orange-600" },
                { label: "Rutin", value: stats.routine, color: "text-green-600" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Bokningar</h2>
            <div className="grid grid-cols-3 gap-4">
             {[
                { label: "Totalt bokade", value: stats.totalAppointments, color: "" },
                { label: "Påminnelser skickade", value: stats.remindedCount, color: "text-yellow-600" },
                { label: "Uteblivna", value: stats.noShows, color: "text-red-600" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className={`text-2xl font-bold ${s.color}`} style={s.label === "Totalt bokade" ? {color: "#c17f5a"} : {}}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* No-show rate */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">No-show rate</h2>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold" style={{color: "#c17f5a"}}>{stats.noShowRate}%</div>
              <div>
                <p className="text-sm text-gray-500">av påminda patienter uteblev</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {stats.noShows} av {stats.remindedCount} påminda patienter
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${Math.min(parseFloat(stats.noShowRate), 100)}%` }}
              />
            </div>
          </div>

          {/* Language breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Patientspråk</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇸🇪</span>
                <div>
                  <div className="text-xl font-bold text-gray-900">{stats.swedishPatients}</div>
                  <div className="text-sm text-gray-500">Svenska</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇬🇧</span>
                <div>
                  <div className="text-xl font-bold text-gray-900">{stats.englishPatients}</div>
                  <div className="text-sm text-gray-500">Engelska</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}