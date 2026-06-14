"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Instruction = {
  id: string;
  title: string;
  type: string;
  content: string;
  pdf_url: string | null;
};

export default function Instructions() {
  const [items, setItems] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "aftercare", content: "", pdf_url: "" });

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("instructions")
      .select("*")
      .eq("clinic_id", user.id)
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  async function addItem() {
    if (!form.title || !form.content) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("instructions").insert({ ...form, clinic_id: user.id });
    setForm({ title: "", type: "aftercare", content: "", pdf_url: "" });
    setShowForm(false);
    fetchItems();
  }

  async function deleteItem(id: string) {
    await supabase.from("instructions").delete().eq("id", id);
    fetchItems();
  }

  return (
    
      <div className="min-h-screen bg-gray-50">
    
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Instruktioner</h1>
              <p className="text-sm text-gray-500">Mallar för förberedelser och eftervård</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-sm text-white px-4 py-2 rounded-lg" style={{backgroundColor: "#c17f5a"}}
            >
              + Ny mall
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6">
          {showForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Ny instruktionsmall</h2>
              <div className="space-y-3">
                <input
                  placeholder="Titel (t.ex. Botox – Eftervård) *"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
                />
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
                >
                  <option value="precare">Före behandling (förberedelser)</option>
                  <option value="aftercare">Efter behandling (eftervård)</option>
                </select>
                <textarea
                  placeholder="Skriv instruktionerna här... *"
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
                />
                <input
                  placeholder="Länk till PDF (valfritt)"
                  value={form.pdf_url}
                  onChange={e => setForm({ ...form, pdf_url: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={addItem} className="text-white px-4 py-2 rounded-lg text-sm" style={{backgroundColor: "#c17f5a"}}>Spara</button>
                <button onClick={() => setShowForm(false)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900">Avbryt</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-700">Dina mallar</h2>
            </div>
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Laddar...</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Inga mallar ännu — skapa en ovan</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((it) => (
                  <div key={it.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{it.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${it.type === "precare" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                            {it.type === "precare" ? "Före" : "Efter"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 whitespace-pre-line">{it.content}</p>
                        {it.pdf_url && <a href={it.pdf_url} target="_blank" className="text-xs hover:underline mt-1 inline-block" style={{color: "#c17f5a"}}>📎 PDF bifogad</a>}
                      </div>
                      <button onClick={() => deleteItem(it.id)} className="text-xs text-red-500 hover:underline">Ta bort</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

  );
}