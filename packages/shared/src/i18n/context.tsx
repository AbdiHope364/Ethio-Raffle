"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "./en";
import { am } from "./am";

export type Language = "EN" | "AM";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof en;
}

const I18nContext = createContext<I18nContextType>({
  language: "EN",
  setLanguage: () => {},
  t: en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("EN");

  useEffect(() => {
    const saved = localStorage.getItem("raffle_lang") as Language;
    if (saved === "EN" || saved === "AM") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("raffle_lang", lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "AM" ? "am" : "en";
    }
  };

  const t = language === "AM" ? am : en;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

