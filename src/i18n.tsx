import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./ui/modes";

const KEY = "earshift.lang";

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "de" || saved === "en") return saved;
  } catch { /* storage blocked */ }
  return navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });

export function LangProvider({ children, fixed }: { children: ReactNode; fixed?: Lang }) {
  const [lang, setLangState] = useState<Lang>(fixed ?? initialLang());
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

/// Pick the string for the current language: t({ de: "…", en: "…" }).
export function useT() {
  const { lang } = useLang();
  return <T,>(v: Record<Lang, T>) => v[lang];
}

export const BASE = import.meta.env.BASE_URL;
