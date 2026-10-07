import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { LangProvider } from "./i18n";
import { Home } from "./pages/Home";
import { LegalPage } from "./pages/LegalPage";

const page = document.body.dataset.page ?? "home";
document.body.classList.add("grain");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {page === "home" ? (
      <LangProvider><Home /></LangProvider>
    ) : page === "privacy" ? (
      <LangProvider fixed="en"><LegalPage page="privacy" /></LangProvider>
    ) : page === "datenschutz" ? (
      <LangProvider fixed="de"><LegalPage page="datenschutz" /></LangProvider>
    ) : page === "impressum" ? (
      <LangProvider fixed="de"><LegalPage page="impressum" /></LangProvider>
    ) : (
      <LangProvider><LegalPage page="support" /></LangProvider>
    )}
  </StrictMode>,
);
