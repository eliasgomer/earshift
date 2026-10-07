// Earshift listening modes - colors and copy mirror the apps
// (Shared/Models.swift SignalPalette, Shared/L10n.swift mode.*).

export type ModeKey = "quiet" | "aware" | "immersion";
export type Lang = "de" | "en";

export interface ModeStyle {
  label: string;
  accent: string;
  light: string;
  gradient: [string, string, string];
  tileFill: string;
  tileStroke: string;
  desc: Record<Lang, string>;
  descLong: Record<Lang, string>;
}

export const MODES: Record<ModeKey, ModeStyle> = {
  quiet: {
    label: "Quiet",
    accent: "#7c6cf5",
    light: "#a99bff",
    gradient: ["#4a3bd4", "#2a2470", "#14122e"],
    tileFill: "#2b2585",
    tileStroke: "rgba(169,155,255,0.45)",
    desc: { en: "Maximum cancellation", de: "Maximale Unterdrückung" },
    descLong: { en: "Maximum noise cancellation", de: "Maximale Geräuschunterdrückung" },
  },
  aware: {
    label: "Aware",
    accent: "#f0b429",
    light: "#ffd166",
    gradient: ["#d99413", "#7a5208", "#2a1d05"],
    tileFill: "#5e430b",
    tileStroke: "rgba(255,209,102,0.45)",
    desc: { en: "Hear your surroundings", de: "Umgebung durchhören" },
    descLong: { en: "Hear your surroundings clearly", de: "Umgebung klar durchhören" },
  },
  immersion: {
    label: "Immersion",
    accent: "#2fd6c0",
    light: "#7ae7d8",
    gradient: ["#12a89a", "#0a5c56", "#04211f"],
    tileFill: "#0b4a45",
    tileStroke: "rgba(122,231,216,0.45)",
    desc: { en: "Spatial sound", de: "Räumlicher Klang" },
    descLong: { en: "Immersive spatial sound", de: "Räumlicher, eintauchender Klang" },
  },
};

export const MODE_ORDER: ModeKey[] = ["quiet", "aware", "immersion"];

/// Neutral device name - no trademarks in visuals.
export const DEVICE_NAME: Record<Lang, string> = { de: "Kopfhörer", en: "Headphones" };

export const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Geist Variable", "Segoe UI", sans-serif';
