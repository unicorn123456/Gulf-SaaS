import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

function getGroq() {
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY || "placeholder",
    baseURL: "https://api.groq.com/openai/v1",
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function buildSystemPrompt(settings: {
  clinic_name?: string;
  booking_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
} | null) {
  const name = settings?.clinic_name || "العيادة";
  const city = settings?.city || "الرياض";
  const country = settings?.country || "SA";
  const vatRate = country === "AE" ? "5%" : "15%";

  return `You are an AI receptionist for ${name} clinic in ${city}.
Your name is HalajaAI (هلاجAI).

CRITICAL LANGUAGE RULE — FOLLOW THIS EXACTLY:
- Detect the language of EVERY user message
- If the user writes in Arabic (contains Arabic letters) → respond ONLY in Arabic
- If the user writes in English → respond ONLY in English
- If the user writes in a mix → use whichever language dominates
- NEVER respond in a different language than the user wrote in
- Do NOT mix languages in a single response

Your role:
- Welcome patients warmly on behalf of ${name}
- Ask questions to understand their needs
- Assess urgency level (emergency, urgent, routine)
- Guide them toward booking an appointment
- Answer common questions about clinic services

${settings?.booking_url ? `Booking link: ${settings.booking_url}` : ""}
${settings?.phone ? `Clinic phone: ${settings.phone}` : ""}
${settings?.address ? `Clinic address: ${settings.address}` : ""}

Additional info:
- VAT rate: ${vatRate}
- Clinic respects prayer times for scheduling

Urgency levels:
- emergency: severe pain, swelling, bleeding, trauma → ask them to call immediately or go to emergency. Collect name and phone
- urgent: moderate pain, broken tooth, lost filling → offer earliest appointment. Collect name and phone
- routine: checkup, cleaning, whitening → normal booking

Important rules:
- NEVER diagnose or prescribe medication
- Keep responses short — 2-4 sentences max
- Always end with a clear next step for the patient

After your response, add on a new line ONE of:
URGENCY:emergency
URGENCY:urgent
URGENCY:routine

If patient confirms booking with name and preferred time, also add:
BOOK:name=Name,time=Time,type=TreatmentType`;
}

function detectUrgency(text: string): string {
  if (text.includes("URGENCY:emergency")) return "emergency";
  if (text.includes("URGENCY:urgent")) return "urgent";
  if (text.includes("URGENCY:routine")) return "routine";
  return "unknown";
}

function cleanResponse(text: string): string {
  return text
    .replace(/URGENCY:(emergency|urgent|routine)/g, "")
    .replace(/BOOK:[^\n]*/g, "")
    .trim();
}

function detectLanguage(text: string): string {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[åäöÅÄÖ]/.test(text)) return "sv";
  return "en";
}

export async function POST(req: NextRequest) {
  try {
    const { messages, clinicId, clinicSlug, sessionId } = await req.json();

    // Get clinic settings
    let clinicSettings = null;
    if (clinicSlug) {
      const { data } = await supabase
        .from("profiles")
        .select("id, clinic_name, slug")
        .eq("slug", clinicSlug)
        .single();

      if (data) {
        const { data: settings } = await supabase
          .from("clinic_settings")
          .select("*")
          .eq("user_id", data.id)
          .single();
        clinicSettings = { ...settings, clinic_name: data.clinic_name };
      }
    } else if (clinicId) {
      const { data } = await supabase
        .from("clinic_settings")
        .select("*")
        .eq("user_id", clinicId)
        .single();
      clinicSettings = data;
    }

    const systemPrompt = buildSystemPrompt(clinicSettings);

    const groq = getGroq();
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const rawReply = response.choices[0].message.content ?? "";
    const urgency = detectUrgency(rawReply);
    const cleanReply = cleanResponse(rawReply);
    const lastUserMessage = messages[messages.length - 1]?.content ?? "";
    const language = detectLanguage(lastUserMessage);

    // Determine clinic user ID
    let userId = clinicId ?? "demo";
    if (!clinicId && clinicSlug) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", clinicSlug)
        .single();
      if (profile) userId = profile.id;
    }

    // Save conversation
    if (userId !== "demo") {
      if (sessionId) {
        const { data: existing } = await supabase
          .from("conversations")
          .select("id, urgency")
          .eq("session_id", sessionId)
          .single();

        const urgencyPriority: Record<string, number> = {
          emergency: 3, urgent: 2, routine: 1, unknown: 0,
        };
        const newHigher = (urgencyPriority[urgency] ?? 0) >
          (urgencyPriority[existing?.urgency ?? "unknown"] ?? 0);

        if (existing) {
          await supabase.from("conversations").update({
            patient_message: lastUserMessage,
            ai_response: cleanReply,
            urgency: newHigher ? urgency : existing.urgency,
            language,
          }).eq("session_id", sessionId);
        } else {
          await supabase.from("conversations").insert({
            clinic_id: userId,
            patient_message: lastUserMessage,
            ai_response: cleanReply,
            urgency,
            language,
            session_id: sessionId,
          });
        }
      } else {
        await supabase.from("conversations").insert({
          clinic_id: userId,
          patient_message: lastUserMessage,
          ai_response: cleanReply,
          urgency,
          language,
        });
      }
    }

    return NextResponse.json({ reply: cleanReply, urgency });
  } catch (error) {
    console.error("Receptionist error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
