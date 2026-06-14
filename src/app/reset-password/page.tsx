"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleReset() {
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => { window.location.href = "/login"; }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">VårdAI</h1>
          <p className="text-sm text-gray-500 mt-1">Återställ lösenord</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {done ? (
            <p className="text-sm text-green-600 text-center">
              ✓ Lösenordet är uppdaterat! Skickar dig till inloggningen...
            </p>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Välj nytt lösenord</h2>
              <input
                type="password"
                placeholder="Nytt lösenord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReset()}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
              />
              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium mt-4 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Vänta..." : "Spara nytt lösenord"}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}