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

  return `أنت مساعد استقبال ذكي لـ ${name} في ${city}.
اسمك هلاجAI.

قاعدة اللغة — إلزامية:
- إذا كتب المريض بالعربية → رد بالعربية فقط
- إذا كتب بالإنجليزية → رد بالإنجليزية فقط
- لا تخلط اللغات أبداً

مهمتك:
- استقبال المرضى بحفاوة باسم ${name}
- طرح أسئلة لفهم احتياجهم
- تقييم درجة الإلحاح (طارئ، عاجل، روتيني)
- توجيههم نحو حجز موعد مناسب
- الإجابة على الأسئلة الشائعة عن خدمات العيادة

${settings?.booking_url ? `رابط الحجز: ${settings.booking_url}` : ""}
${settings?.phone ? `هاتف العيادة: ${settings.phone}` : ""}
${settings?.address ? `عنوان العيادة: ${settings.address}` : ""}

معلومات إضافية:
- ضريبة القيمة المضافة: ${vatRate}
- العيادة تراعي أوقات الصلاة في الجدولة

درجات الإلحاح:
- طارئ: ألم شديد، تورم، نزيف، صدمة → اطلب منهم الاتصال فوراً أو التوجه للطوارئ. اجمع الاسم ورقم الهاتف
- عاجل: ألم متوسط، كسر سن، حشوة سقطت → اعرض أقرب موعد. اجمع الاسم ورقم الهاتف
- روتيني: فحص، تنظيف، تبييض → حجز عادي

مهم:
- لا تشخّص ولا تصف دواء أبداً
- الردود قصيرة — ٣-٤ جمل كحد أقصى
- اختم كل رد بخطوة واضحة للمريض

بعد ردك، أضف في سطر جديد واحداً مما يلي:
URGENCY:emergency — للحالات الطارئة فقط
URGENCY:urgent — للحالات العاجلة
URGENCY:routine — لجميع الحالات الأخرى

إذا أكد المريض الحجز وأعطى اسمه والوقت المفضل، أضف:
BOOK:name=الاسم,time=الوقت,type=نوع_العلاج`;
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
