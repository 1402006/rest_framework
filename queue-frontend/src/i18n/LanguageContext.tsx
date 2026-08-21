import { createContext, useContext, useState, type ReactNode } from "react";
import { translations, SERVICE_NAME_TRANSLATIONS, type Lang } from "./translations";

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: typeof translations["fr"];
  serviceName: (serviceId: string, fallback: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");

  function toggleLang() {
    setLang((prev) => (prev === "fr" ? "en" : "fr"));
  }

  function serviceName(serviceId: string, fallback: string) {
    return SERVICE_NAME_TRANSLATIONS[serviceId]?.[lang] ?? fallback;
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t: translations[lang], serviceName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage doit être utilisé à l'intérieur de LanguageProvider");
  return ctx;
}
