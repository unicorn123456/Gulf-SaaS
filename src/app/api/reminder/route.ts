import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendMsegatSMS(phone: string, message: string): Promise<boolean> {
  const MSEGAT_USER = process.env.MSEGAT_USERNAME;
  const MSEGAT_API_KEY = process.env.MSEGAT_API_KEY;
  const MSEGAT_SENDER = process.env.MSEGAT_SENDER_ID || "هلاجAI";

  if (!MSEGAT_USER || !MSEGAT_API_KEY) {
    console.log("Msegat not configured — SMS skipped");
    return false;
  }

  // Normalize phone number
  let normalized = phone.replace(/\D/g, "");
  if (normalized.startsWith("0")) normalized = "966" + normalized.slice(1);
  if (!normalized.startsWith("966") && !normalized.startsWith("971")) {
    normalized = "966" + normalized;
  }

  const res = await fetch("https://www.msegat.com/gw/sendsms.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName: MSEGAT_USER,
      apiKey: MSEGAT_API_KEY,
      numbers: normalized,
      userSender: MSEGAT_SENDER,
      msg: message,
      msgEncoding: "UTF8",
    }),
  });

  const data = await res.json();
  return data.code === "1" || data.code === 1;
}

function buildReminderMessage(patientName: string, clinicName: string, date: string, time: string, treatment: string): string {
  return `السلام عليكم ${patientName}،

تذكير بموعدكم في ${clinicName}:
📅 التاريخ: ${date}
🕐 الوقت: ${time}
🦷 العلاج: ${treatment || "موعد طبي"}

للإلغاء أو التعديل، يرجى الاتصال بنا مسبقاً.

هلاجAI × ${clinicName}`;
}

export async function POST(req: NextRequest) {
  try {
    const { appointmentId, manual } = await req.json();

    if (appointmentId) {
      // Send reminder for specific appointment
      const { data: appt } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .single();

      if (!appt) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
      if (!appt.patient_phone) return NextResponse.json({ error: "No phone number" }, { status: 400 });

      // Get clinic name
      const { data: settings } = await supabase
        .from("clinic_settings")
        .select("clinic_name")
        .eq("user_id", appt.clinic_id)
        .single();

      const clinicName = settings?.clinic_name || "العيادة";
      const apptDate = new Date(appt.appointment_date);
      const dateStr = apptDate.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const timeStr = apptDate.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

      const message = buildReminderMessage(appt.patient_name, clinicName, dateStr, timeStr, appt.treatment_type);
      const sent = await sendMsegatSMS(appt.patient_phone, message);

      if (sent) {
        await supabase.from("appointments").update({ reminder_sent: true }).eq("id", appointmentId);
      }

      return NextResponse.json({ success: sent, message: sent ? "SMS sent" : "SMS service not configured" });
    }

    // Cron job — send reminders for tomorrow's appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: appointments } = await supabase
      .from("appointments")
      .select("*")
      .gte("appointment_date", `${tomorrowStr}T00:00:00`)
      .lte("appointment_date", `${tomorrowStr}T23:59:59`)
      .eq("status", "confirmed")
      .eq("reminder_sent", false);

    let sent = 0;
    for (const appt of appointments || []) {
      if (!appt.patient_phone) continue;

      const { data: settings } = await supabase
        .from("clinic_settings")
        .select("clinic_name")
        .eq("user_id", appt.clinic_id)
        .single();

      const clinicName = settings?.clinic_name || "العيادة";
      const apptDate = new Date(appt.appointment_date);
      const dateStr = apptDate.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const timeStr = apptDate.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

      const message = buildReminderMessage(appt.patient_name, clinicName, dateStr, timeStr, appt.treatment_type);
      const ok = await sendMsegatSMS(appt.patient_phone, message);
      if (ok) {
        await supabase.from("appointments").update({ reminder_sent: true }).eq("id", appt.id);
        sent++;
      }
    }

    return NextResponse.json({ success: true, sent, total: appointments?.length || 0 });
  } catch (error) {
    console.error("Reminder error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
