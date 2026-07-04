import React, { createContext, useContext, useState } from "react";
import { getTranslations } from "@/lib/i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("app-lang") || "es");

  const t = getTranslations(lang);

  const changeLang = (code) => {
    setLang(code);
    localStorage.setItem("app-lang", code);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}