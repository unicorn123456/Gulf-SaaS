"use client";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [trialExpired, setTrialExpired] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      // Check trial status
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, trial_started_at, plan")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        const isActive = profile.subscription_status === "active";
        const isTrial = profile.subscription_status === "trial";
        
        if (isTrial && profile.trial_started_at) {
          const trialEnd = new Date(profile.trial_started_at);
          trialEnd.setDate(trialEnd.getDate() + 30);
          if (new Date() > trialEnd) {
            setTrialExpired(true);
            setChecking(false);
            return;
          }
        }

        if (!isActive && !isTrial && profile.subscription_status !== "free") {
          setTrialExpired(false);
        }
      }

      setChecking(false);
    }
    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: "#fdf8f3"}}>
        <div className="text-sm" style={{color: "#9c7b6b"}}>Laddar...</div>
      </div>
    );
  }

  if (trialExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{backgroundColor: "#fdf8f3"}}>
        <div className="max-w-md w-full bg-white rounded-2xl border p-8 text-center" style={{borderColor: "#e8d5c4"}}>
          <div className="text-4xl mb-4">⏰</div>
          <h1 className="text-xl font-semibold mb-2" style={{fontFamily: "Georgia, serif", color: "#3d2b1f"}}>
            Din provperiod har gått ut
          </h1>
          <p className="text-sm mb-6" style={{color: "#9c7b6b"}}>
            Uppgradera för att fortsätta använda VårdAI och behålla alla dina patientdata.
          </p>
          <a
            href="/api/checkout"
            onClick={async (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: "growth" }),
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}
            className="inline-block text-white px-8 py-3 rounded-xl text-sm font-medium"
            style={{backgroundColor: "#c17f5a"}}
          >
            Uppgradera nu — 4 500 kr/mån
          </a>
          <p className="text-xs mt-4" style={{color: "#b8a090"}}>
            Frågor? Kontakta oss på{" "}
            <a href="mailto:hello@vardai.se" style={{color: "#c17f5a"}}>hello@vardai.se</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{backgroundColor: "#fdf8f3"}}>
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}