import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function toHijri(date: Date): string {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  const months = ["محرم","صفر","ربيع الأول","ربيع الآخر","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
  return `${day} ${months[month - 1]} ${year} هـ`;
}

export async function POST(req: NextRequest) {
  try {
    const { appointmentId, customData } = await req.json();
    let patientName = "", treatment = "", price = 0, currency = "AED";
    let clinicName = "", vatNumber = "", vatRate = 15, city = "";

    if (appointmentId) {
      const { data: appt } = await supabase.from("appointments").select("*").eq("id", appointmentId).single();
      if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const { data: settings } = await supabase.from("clinic_settings").select("*").eq("user_id", appt.clinic_id).single();
      patientName = appt.patient_name; treatment = appt.treatment_type || "علاج طبي";
      price = appt.price || 0; currency = appt.currency || "AED";
      clinicName = settings?.clinic_name || "العيادة"; vatNumber = settings?.vat_number || "";
      vatRate = settings?.vat_rate || 15; city = settings?.city || "";
    } else if (customData) {
      ({ patientName, treatment, price, currency, clinicName, vatNumber, vatRate, city } = customData);
    }

    const now = new Date();
    const invoiceNum = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const vatAmount = price * (vatRate / 100);
    const total = price + vatAmount;
    const gregDate = now.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
    const hijriDate = toHijri(now);

    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',system-ui,sans-serif;background:#fff;color:#1a1a2e;padding:40px;direction:rtl}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #0F0B2D}.brand{font-size:28px;font-weight:800;color:#0F0B2D}.brand span{color:#C9A84C}.dates{display:flex;gap:16px;margin-bottom:24px}.date-box{background:#F8F6FF;border:1px solid #EDE9FF;border-radius:10px;padding:12px 16px;flex:1}.date-box .label{font-size:11px;color:#6B7280;margin-bottom:4px}.date-box .value{font-size:14px;font-weight:600}.parties{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}.party{background:#F8F6FF;border:1px solid #EDE9FF;border-radius:10px;padding:16px}.party h3{font-size:11px;color:#6B7280;margin-bottom:8px}.party p{font-size:14px;line-height:1.6}table{width:100%;border-collapse:collapse;margin-bottom:24px}th{background:#0F0B2D;color:white;padding:10px 14px;font-size:12px}td{padding:12px 14px;border-bottom:1px solid #EDE9FF;font-size:13px}.total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}.total-row.grand{font-size:16px;font-weight:800;border-top:2px solid #0F0B2D;padding-top:10px;margin-top:6px}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #EDE9FF;text-align:center;font-size:11px;color:#9CA3AF}</style></head><body>
<div class="header"><div class="brand">${clinicName}</div><div><h1 style="font-size:22px">فاتورة ضريبية</h1><div style="font-size:14px;color:#6B7280;margin-top:4px">${invoiceNum}</div></div></div>
<div class="dates"><div class="date-box"><div class="label">التاريخ الميلادي</div><div class="value">${gregDate}</div></div><div class="date-box"><div class="label">التاريخ الهجري</div><div class="value">${hijriDate}</div></div>${city ? `<div class="date-box"><div class="label">المدينة</div><div class="value">${city}</div></div>` : ""}</div>
<div class="parties"><div class="party"><h3>مقدم الخدمة</h3><p><strong>${clinicName}</strong></p>${vatNumber ? `<p>الرقم الضريبي: ${vatNumber}</p>` : ""}</div><div class="party"><h3>العميل</h3><p><strong>${patientName}</strong></p></div></div>
<table><thead><tr><th>#</th><th>الخدمة</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody><tr><td>1</td><td>${treatment}</td><td>1</td><td>${price.toLocaleString("ar-SA")} ${currency}</td><td>${price.toLocaleString("ar-SA")} ${currency}</td></tr></tbody></table>
<div style="width:280px"><div class="total-row"><span>المبلغ قبل الضريبة</span><span>${price.toLocaleString("ar-SA")} ${currency}</span></div><div class="total-row" style="color:#D97706"><span>ضريبة القيمة المضافة (${vatRate}%)</span><span>${vatAmount.toLocaleString("ar-SA")} ${currency}</span></div><div class="total-row grand"><span>الإجمالي</span><span>${total.toLocaleString("ar-SA")} ${currency}</span></div></div>
<div class="footer"><p>شكراً لثقتكم — هذه فاتورة ضريبية مطابقة لمتطلبات هيئة الزكاة والضريبة والجمارك</p><p style="margin-top:6px">مدعوم بـ هلاجAI × Aurive</p></div>
</body></html>`;

    return NextResponse.json({ html, invoiceNumber: invoiceNum, total, vatAmount, currency });
  } catch (error) {
    console.error("Invoice error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
