"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hej! Välkommen till VårdAI. Hur kan jag hjälpa dig idag?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch("/api/receptionist", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? ""}`
        },
       body: JSON.stringify({ 
          messages: updatedMessages,
          clinicId: session?.user?.id ?? null,
          sessionId,
        }),
      });

      const data = await res.json();

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Tyvärr, något gick fel. Vänligen försök igen.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="text-white rounded-t-2xl px-6 py-4" style={{backgroundColor: "#c17f5a"}}>
          <h1 className="text-lg font-semibold">VårdAI Receptionist</h1>
          <p className="text-sm" style={{color: "#f5ede3"}}>AI-driven klinikassistent</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
                style={msg.role === "user" ? {backgroundColor: "#c17f5a"} : {}}
              >
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

        {/* Input */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Skriv ditt meddelande..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#c17f5a]"
              />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors" style={{backgroundColor: "#c17f5a"}}
            >
              Skicka
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}