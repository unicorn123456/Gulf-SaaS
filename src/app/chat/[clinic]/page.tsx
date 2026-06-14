"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type Message = { role: "user" | "assistant"; content: string };

export default function ClinicChat() {
  const params = useParams();
  const clinicSlug = params.clinic as string;
  const [clinicName, setClinicName] = useState("VårdAI Receptionist");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hej! Välkommen. Hur kan jag hjälpa dig idag? / Hello! Welcome. How can I help you today? / أهلاً! كيف يمكنني مساعدتك اليوم؟",
    },
  ]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function loadClinicName() {
      const { data } = await supabase
        .from("profiles")
        .select("clinic_name")
        .eq("slug", clinicSlug)
        .single();
      if (data?.clinic_name) setClinicName(data.clinic_name);
    }
    if (clinicSlug) loadClinicName();
  }, [clinicSlug]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: "user", content: input };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/receptionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, clinicSlug, sessionId }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...updated,
        { role: "assistant", content: "Tyvärr, något gick fel. Försök igen." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg flex flex-col h-[600px]">
        <div className="bg-blue-600 text-white rounded-t-2xl px-6 py-4">
          <h1 className="text-lg font-semibold">{clinicName}</h1>
          <p className="text-blue-100 text-sm">AI-driven klinikassistent</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-400 rounded-2xl rounded-bl-sm px-4 py-2 text-sm">
                VårdAI skriver...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Skriv ditt meddelande..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Skicka
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}