import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PLANS: Record<string, { amount: number; currency: string; name: string }> = {
  starter: { amount: 99, currency: "AED", name: "هلاجAI أساسي" },
  pro:     { amount: 249, currency: "AED", name: "هلاجAI احترافي" },
  clinic:  { amount: 499, currency: "AED", name: "هلاجAI عيادة" },
};

export async function POST(req: NextRequest) {
  try {
    const { plan, email } = await req.json();
    const planData = PLANS[plan];
    if (!planData) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const TAP_SECRET = process.env.TAP_SECRET_KEY;

    // If no Tap key configured, return info
    if (!TAP_SECRET) {
      return NextResponse.json({
        error: "Tap Payments not configured yet",
        message: "Please add TAP_SECRET_KEY to environment variables",
        plan: planData,
      }, { status: 503 });
    }

    // Create Tap Payments charge
    const tapRes = await fetch("https://api.tap.company/v2/charges", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TAP_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: planData.amount,
        currency: planData.currency,
        description: planData.name,
        customer: { email },
        source: { id: "src_card" },
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL || "https://gulf-saas-ten.vercel.app"}/dashboard?payment=success`,
        },
        post: {
          url: `${process.env.NEXT_PUBLIC_APP_URL || "https://gulf-saas-ten.vercel.app"}/api/webhook`,
        },
      }),
    });

    const tapData = await tapRes.json();

    if (tapData.transaction?.url) {
      return NextResponse.json({ url: tapData.transaction.url });
    }

    return NextResponse.json({ error: "Payment failed", details: tapData }, { status: 500 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
