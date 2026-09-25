"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { en } from "@/locales/en";
import { fr } from "@/locales/fr";
import type { LanguageCode, Translations } from "@/locales/types";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  toggleLanguage: () => void;
  t: Translations;
  isFrench: boolean;
  isEnglish: boolean;
}

const dictionaries: Record<LanguageCode, Translations> = {
  en,
  fr,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    // 1. Try reading from localStorage
    try {
      const stored = localStorage.getItem("amtc-lang");
      if (stored === "fr" || stored === "en") {
        setLanguageState(stored);
        document.documentElement.lang = stored;
        return;
      }
    } catch {
      // localStorage may fail in restricted privacy mode
    }

    // 2. Try reading from cookie
    try {
      const match = document.cookie.match(/(?:^|;\s*)amtc-lang=([a-z]{2})/);
      if (match && (match[1] === "fr" || match[1] === "en")) {
        setLanguageState(match[1] as LanguageCode);
        document.documentElement.lang = match[1];
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = React.useCallback((newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem("amtc-lang", newLang);
    } catch {
      // ignore
    }
    try {
      document.cookie = `amtc-lang=${newLang};path=/;max-age=31536000;SameSite=Lax`;
    } catch {
      // ignore
    }
    try {
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = React.useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === "en" ? "fr" : "en";
      try {
        localStorage.setItem("amtc-lang", next);
      } catch {
        // ignore
      }
      try {
        document.cookie = `amtc-lang=${next};path=/;max-age=31536000;SameSite=Lax`;
      } catch {
        // ignore
      }
      try {
        document.documentElement.lang = next;
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const t = useMemo(() => dictionaries[language] || dictionaries.en, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isFrench: language === "fr",
      isEnglish: language === "en",
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
