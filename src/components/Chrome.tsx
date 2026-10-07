// Site header + footer shared by all pages.

import { useEffect, useState, type ReactNode } from "react";
import { ArrowUp } from "lucide-react";
import { BASE, useLang, useT } from "../i18n";

export const LINKS = {
  home: BASE,
  support: `${BASE}support/`,
  privacy: `${BASE}privacy/`,
  datenschutz: `${BASE}datenschutz/`,
  impressum: `${BASE}impressum/`,
  repo: "https://github.com/eliasgomer/earshift",
  appStore: "",
};

export function LangToggle({ disabled }: { disabled?: boolean }) {
  const { lang, setLang } = useLang();
  if (disabled) return null;
  return (
    <div className="flex rounded-full border border-line p-0.5 font-mono text-[11px] tracking-widest">
      {(["de", "en"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`cursor-pointer rounded-full px-2.5 py-1 uppercase transition-colors ${lang === l ? "bg-fg text-ink-0" : "text-fg-3 hover:text-fg"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

export function Header({ home, fixedLang, extra }: { home?: boolean; fixedLang?: boolean; extra?: ReactNode }) {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const nav = home
    ? [
        ["#film", "Film"],
        ["#designs", "Designs"],
        ["#widgets", "Widgets"],
        ["#pricing", t({ de: "Preis", en: "Pricing" })],
        ["#faq", "FAQ"],
      ]
    : [[LINKS.home, t({ de: "Start", en: "Home" })], [LINKS.support, "Support"]];
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-line/70 bg-ink-0/70 backdrop-blur-xl" : "border-b border-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-5 sm:px-10">
        <a href={LINKS.home} className="flex items-center gap-2.5 font-semibold tracking-tight">
          <img src={`${BASE}img/icon.png`} alt="" className="h-7 w-7 rounded-[7px]" />
          Earshift
        </a>
        <nav className="ml-auto hidden items-center gap-6 text-sm text-fg-2 md:flex">
          {nav.map(([href, label]) => <a key={href} href={href} className="transition-colors hover:text-fg">{label}</a>)}
        </nav>
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          {extra}
          <LangToggle disabled={fixedLang} />
          {home && (
            <a href="#pricing" className="hidden rounded-full bg-fg px-4 py-1.5 text-sm font-medium text-ink-0 transition-transform hover:scale-[1.03] sm:block">
              {t({ de: "7 Tage gratis", en: "Try free" })}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const t = useT();
  const { lang } = useLang();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          <div className="flex items-center gap-3">
            <img src={`${BASE}img/icon.png`} alt="" className="h-9 w-9 rounded-[9px]" />
            <div>
              <div className="font-semibold">Earshift</div>
              <div className="label !text-[10.5px]">iPhone · iPad · Mac</div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-2 sm:ml-auto">
            <a className="hover:text-fg" href={LINKS.support}>Support</a>
            <a className="hover:text-fg" href={lang === "de" ? LINKS.datenschutz : LINKS.privacy}>{t({ de: "Datenschutz", en: "Privacy" })}</a>
            <a className="hover:text-fg" href={LINKS.impressum}>{t({ de: "Impressum", en: "Legal Notice" })}</a>
            <a className="hover:text-fg" href="mailto:earshiftapp@ggsells.de">{t({ de: "Kontakt", en: "Contact" })}</a>
            <a className="inline-flex items-center gap-1 hover:text-fg" href="#top"><ArrowUp size={14} />{t({ de: "Nach oben", en: "Top" })}</a>
          </nav>
        </div>
        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-fg-3">
          © 2026 Elias Gomer. {t({
            de: "Earshift ist eine unabhängige App und steht in keiner Verbindung zur Bose Corporation, wird von ihr weder unterstützt noch gesponsert. Bose und QuietComfort sind Marken der Bose Corporation. Apple, iPhone, iPad, Mac und App Store sind Marken der Apple Inc.",
            en: "Earshift is an independent app and is not affiliated with, endorsed or sponsored by Bose Corporation. Bose and QuietComfort are trademarks of Bose Corporation. Apple, iPhone, iPad, Mac and App Store are trademarks of Apple Inc.",
          })}
        </p>
      </div>
    </footer>
  );
}
