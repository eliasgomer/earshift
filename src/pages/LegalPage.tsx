import { Footer, Header, LINKS } from "../components/Chrome";
import { useLang } from "../i18n";
import privacy from "../content/privacy.html?raw";
import datenschutz from "../content/datenschutz.html?raw";
import impressum from "../content/impressum.html?raw";
import supportEn from "../content/support.html?raw";
import supportDe from "../content/support-de.html?raw";

type Page = "privacy" | "datenschutz" | "impressum" | "support";

export function LegalPage({ page }: { page: Page }) {
  const { lang } = useLang();
  const html = page === "privacy" ? privacy : page === "datenschutz" ? datenschutz : page === "impressum" ? impressum
    : lang === "de" ? supportDe : supportEn;
  const other = page === "privacy" ? [LINKS.datenschutz, "Deutsch"] : page === "datenschutz" ? [LINKS.privacy, "English"] : null;
  return (
    <div id="top" className="min-h-screen">
      <Header fixedLang={page !== "support"} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_80%_at_50%_0%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent)]" />
      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6">
        {other && <a href={other[0]} className="label mb-6 inline-block hover:text-fg">→ {other[1]}</a>}
        <article className="prose-legal" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
      <Footer />
    </div>
  );
}
