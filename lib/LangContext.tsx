"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const LANGUAGES = [
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "de", flag: "🇩🇪", label: "DE" },
  { code: "it", flag: "🇮🇹", label: "IT" },
  { code: "pt", flag: "🇧🇷", label: "PT" },
  { code: "ja", flag: "🇯🇵", label: "JA" },
  { code: "zh", flag: "🇨🇳", label: "ZH" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

type LangCtx = { lang: LangCode; setLang: (l: LangCode) => void };

const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {} });

const STORAGE_KEY = "prank-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        setLangState(saved);
      }
    } catch {}
  }, []);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}
