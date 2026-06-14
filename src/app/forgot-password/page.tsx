"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://vardai.se/reset-password",
      });
      if (error) throw error;
      setSent(true);
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
          {sent ? (
            <div className="text-center">
              <p className="text-sm text-green-600 mb-4">
                ✓ Vi har skickat en återställningslänk till {email}
              </p>
              <a href="/login" className="text-sm text-blue-600 hover:underline">
                Tillbaka till inloggningen
              </a>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Glömt lösenord?</h2>
              <p className="text-sm text-gray-500 mb-4">Ange din e-post så skickar vi en återställningslänk.</p>
              <input
                type="email"
                placeholder="E-postadress"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400"
              />
              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium mt-4 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Skickar..." : "Skicka återställningslänk"}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                <a href="/login" className="text-blue-600 hover:underline">Tillbaka till inloggningen</a>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}