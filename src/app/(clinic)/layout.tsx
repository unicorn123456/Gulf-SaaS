"use client";
import Sidebar from "@/components/Sidebar";
import { useState, createContext, useContext } from "react";

export const LangContext = createContext<{ lang: "ar" | "en"; setLang: (l: "ar" | "en") => void }>({ lang: "ar", setLang: () => {} });
export const useLang = () => useContext(LangContext);

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div style={{ display: "flex", minHeight: "100vh", background: "#F8F6FF" }} dir={lang === "ar" ? "rtl" : "ltr"}>
        <Sidebar lang={lang} setLang={setLang} />
        <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>{children}</main>
      </div>
    </LangContext.Provider>
  );
}
