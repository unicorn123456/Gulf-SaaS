import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "هلاجAI — نظام إدارة العيادات للخليج",
  description: "مساعد ذكاء اصطناعي لعيادات الخليج — تقويم هجري، أوقات الصلاة، Tap Payments، دعم عربي كامل",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
