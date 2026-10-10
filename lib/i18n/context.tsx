"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, Dictionary } from "./types";
import { id } from "./dictionaries/id";
import { en } from "./dictionaries/en";

const dictionaries: Record<Language, Dictionary> = {
  id,
  en,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dictionary;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "id",
  setLanguage: () => {},
  t: id,
  toggleLanguage: () => {},
});

const COOKIE_NAME = "valo_lang";
const STORAGE_KEY = "valorant_scrim_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- Restore persisted language and cookie preference once at startup. */
  useEffect(() => {
    // 1. Read from localStorage or cookie
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === "id" || stored === "en") {
      setLanguageState(stored);
    } else {
      // Check document cookie
      const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
      if (match && (match[2] === "id" || match[2] === "en")) {
        setLanguageState(match[2] as Language);
      }
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.cookie = `${COOKIE_NAME}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.error("Failed to persist language preference:", e);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === "id" ? "en" : "id";
    setLanguage(nextLang);
  };

  const currentDictionary = dictionaries[language] || id;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: currentDictionary,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const { t, language, setLanguage, toggleLanguage } = useContext(LanguageContext);
  return { t, language, setLanguage, toggleLanguage };
}
