// App Store screenshots (iPhone 6.9", iPad 13", Mac 16:10), product page header (21:9)
// and search result image (3:2). Rendered as stills at the exact pixel sizes.

import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Check, Keyboard } from "lucide-react";
import {
  CallWindow, ControlCenter, LockScreen, MacPopover, MacScreen, MacSettingsAutomation, PhoneApp, PhoneFrame, Widget,
  defaultRules, zoomRule, type Skin, type WidgetProps,
} from "../../../src/ui/AppUI";
import { MODES, type Lang, type ModeKey } from "../../../src/ui/modes";
import { IOSAutomations, IPAD, IPadApp, IPadFrame } from "./StoreUI";

export type Platform = "iphone" | "ipad" | "mac";
export const SIZES: Record<Platform | "header" | "search", [number, number]> = {
  iphone: [1320, 2868], ipad: [2064, 2752], mac: [2880, 1800], header: [3840, 1646], search: [3840, 2560],
};

const SANS = '"Geist Variable", -apple-system, sans-serif';
const MONO = '"Geist Mono Variable", ui-monospace, monospace';

type Copy = { kicker: Record<Lang, string>; title: Record<Lang, [string, string]>; accent: ModeKey | "studio" };

const MOBILE: Copy[] = [
  { kicker: { de: "Earshift", en: "Earshift" }, title: { de: ["Lärm aus.", "Mit einem Tipp."], en: ["Noise off.", "In one tap."] }, accent: "quiet" },
  { kicker: { de: "Kontrollzentrum & Sperrbildschirm", en: "Control Center & Lock Screen" }, title: { de: ["Schalten,", "ohne die App."], en: ["Switch modes", "without the app."] }, accent: "aware" },
  { kicker: { de: "Widgets", en: "Widgets" }, title: { de: ["Dein Widget.", "Deine Regeln."], en: ["Your widget.", "Your rules."] }, accent: "immersion" },
  { kicker: { de: "Fokus · Kurzbefehle · Siri", en: "Focus · Shortcuts · Siri" }, title: { de: ["Schaltet", "von selbst."], en: ["Switches", "by itself."] }, accent: "quiet" },
  { kicker: { de: "Glass · Studio · Signal", en: "Glass · Studio · Signal" }, title: { de: ["Drei Designs.", "Deine Wahl."], en: ["Three designs.", "Your call."] }, accent: "studio" },
  { kicker: { de: "Equalizer & Spatial Audio", en: "Equalizer & Spatial Audio" }, title: { de: ["Klang nach", "deinem Ohr."], en: ["Sound, tuned", "to you."] }, accent: "immersion" },
  { kicker: { de: "Kein Abo", en: "No subscription" }, title: { de: ["7 Tage gratis.", "Dann für immer."], en: ["7 days free.", "Then yours forever."] }, accent: "aware" },
];

const MAC: Copy[] = [
  { kicker: { de: "Earshift für Mac", en: "Earshift for Mac" }, title: { de: ["Deine Kopfhörer,", "ein Klick entfernt."], en: ["Your headphones,", "one click away."] }, accent: "quiet" },
  { kicker: { de: "Automationen", en: "Automations" }, title: { de: ["Zoom öffnet.", "Aware schaltet selbst."], en: ["Zoom opens.", "Aware switches itself."] }, accent: "aware" },
  { kicker: { de: "Glass · Studio · Signal", en: "Glass · Studio · Signal" }, title: { de: ["Drei Designs.", "Deine Wahl."], en: ["Three designs.", "Your call."] }, accent: "studio" },
  { kicker: { de: "Widgets", en: "Widgets" }, title: { de: ["Widgets für", "deinen Schreibtisch."], en: ["Widgets for", "your desktop."] }, accent: "immersion" },
  { kicker: { de: "Tastenkürzel", en: "Keyboard shortcuts" }, title: { de: ["Ein Kürzel.", "Jeder Modus."], en: ["One shortcut.", "Any mode."] }, accent: "quiet" },
  { kicker: { de: "Kein Abo", en: "No subscription" }, title: { de: ["7 Tage gratis.", "Dann für immer."], en: ["7 days free.", "Then yours forever."] }, accent: "aware" },
];

export const SHOT_COUNT: Record<Platform, number> = { iphone: MOBILE.length, ipad: MOBILE.length, mac: MAC.length };

const accentOf = (a: Copy["accent"]) => (a === "studio" ? { base: "#d9be93", light: "#e7d0aa" } : { base: MODES[a].accent, light: MODES[a].light });

function Backdrop({ color, children }: { color: string; children: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: "#07060b", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(70% 45% at 50% 0%, ${color}55 0%, transparent 70%), radial-gradient(80% 45% at 50% 100%, ${color}40 0%, transparent 70%)` }} />
      {children}
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%"><filter id="sg"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" /></filter><rect width="100%" height="100%" filter="url(#sg)" /></svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Headline({ c, lang, u, align = "center", top, left }: { c: Copy; lang: Lang; u: number; align?: "center" | "left"; top: number; left?: number }) {
  const a = accentOf(c.accent);
  const pos: CSSProperties = align === "center" ? { left: 0, right: 0, textAlign: "center" } : { left };
  return (
    <div style={{ position: "absolute", top, ...pos, color: "#fff", fontFamily: SANS }}>
      <div style={{ fontFamily: MONO, fontSize: 30 * u, letterSpacing: 7 * u, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", display: "flex", justifyContent: align === "center" ? "center" : "flex-start", alignItems: "center", gap: 18 * u }}>
        <span style={{ width: 14 * u, height: 14 * u, borderRadius: 99, background: a.base }} />{c.kicker[lang]}
      </div>
      <div style={{ fontSize: 124 * u, fontWeight: 700, letterSpacing: -4.5 * u, lineHeight: 1.0, marginTop: 34 * u }}>
        {c.title[lang][0]}<br /><span style={{ color: a.light }}>{c.title[lang][1]}</span>
      </div>
    </div>
  );
}

const W = (p: Partial<WidgetProps> & { mode: ModeKey; lang: Lang }, scale: number, style?: CSSProperties) => (
  <div style={{ position: "absolute", transform: `scale(${scale})`, transformOrigin: "top left", ...style }}><Widget {...p} /></div>
);

function PricingBlock({ lang, u, width }: { lang: Lang; u: number; width: number }) {
  const de = lang === "de";
  const items = de ? ["Alle Funktionen 7 Tage gratis", "Danach ein einmaliger Kauf", "iPhone, iPad und Mac", "Familienfreigabe", "Nie automatische Kosten"]
    : ["Every feature free for 7 days", "Then a single one-time purchase", "iPhone, iPad and Mac", "Family Sharing", "Never charged automatically"];
  return (
    <div style={{ width, fontFamily: SANS, color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 36 * u }}>
        <Img src={staticFile("icon.png")} style={{ width: 200 * u, height: 200 * u, borderRadius: 46 * u, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }} />
        <div>
          <div style={{ fontSize: 76 * u, fontWeight: 700, letterSpacing: -2 * u }}>Earshift</div>
          <div style={{ fontFamily: MONO, fontSize: 26 * u, letterSpacing: 5 * u, color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>Lifetime</div>
        </div>
      </div>
      <div style={{ marginTop: 60 * u, borderTop: "1px solid rgba(255,255,255,0.14)" }}>
        {items.map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 26 * u, padding: `${30 * u}px 0`, borderBottom: "1px solid rgba(255,255,255,0.14)", fontSize: 46 * u }}>
            <Check size={44 * u} color={MODES.aware.light} strokeWidth={2.5} />{t}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── iPhone / iPad ───────────────────────────────────────────────────────────

function MobileVisual({ i, lang, platform, u }: { i: number; lang: Lang; platform: "iphone" | "ipad"; u: number }) {
  const ipad = platform === "ipad";
  const device = (child: ReactNode, s: number, style: CSSProperties, appSkin: Skin = "signal", mode: ModeKey = "quiet") =>
    ipad ? <div style={{ position: "absolute", ...style }}><IPadFrame scale={s}>{child ?? <IPadApp skin={appSkin} mode={mode} lang={lang} />}</IPadFrame></div>
      : <div style={{ position: "absolute", ...style }}><PhoneFrame scale={s}>{child ?? <PhoneApp skin={appSkin} mode={mode} lang={lang} />}</PhoneFrame></div>;
  const big = ipad ? 1.62 : 2.42;
  const centerX = (w: number) => (SIZES[platform][0] - w) / 2;
  const phoneW = (s: number) => 414 * s, padW = (s: number) => (IPAD.w + 44) * s;
  const dw = ipad ? padW(big) : phoneW(big);
  const top = ipad ? 760 * u : 900 * u;
  switch (i) {
    case 0: return device(null, big, { left: centerX(dw), top }, "signal", "quiet");
    case 1: {
      if (ipad) return (<>
        {device(<ControlCenterPad lang={lang} />, 1.1, { left: 70 * u, top: top + 120 * u, transform: "rotate(-4deg)" })}
        <div style={{ position: "absolute", left: 830 * u, top: top + 40 * u, transform: "rotate(5deg)" }}><PhoneFrame scale={1.6}><LockScreen mode="aware" lang={lang} /></PhoneFrame></div>
      </>);
      const s = 1.95;
      return (<>
        <div style={{ position: "absolute", left: 40 * u, top: top + 140 * u, transform: "rotate(-6deg)" }}><PhoneFrame scale={s}><LockScreen mode="aware" lang={lang} /></PhoneFrame></div>
        <div style={{ position: "absolute", left: 500 * u, top: top + 40 * u, transform: "rotate(5deg)" }}><PhoneFrame scale={s}><ControlCenter mode="aware" lang={lang} /></PhoneFrame></div>
      </>);
    }
    case 2: {
      const k = ipad ? u : 1.0;
      return (<>
        {W({ mode: "immersion", lang, size: "large" }, 1.85 * k, { left: 120 * u, top: top + 30 * u })}
        {W({ mode: "quiet", lang, size: "small", design: "studio", layout: "battery" }, 1.85 * k, { left: 830 * u, top: top + 30 * u })}
        {W({ mode: "aware", lang, size: "small", design: "glass", layout: "status", accent: "orange" }, 1.85 * k, { left: 830 * u, top: top + 380 * u })}
        {W({ mode: "quiet", lang, size: "medium", design: "glass" }, 1.85 * k, { left: 120 * u, top: top + 790 * u })}
        {W({ mode: "immersion", lang, size: "medium", design: "signal", accent: "pink", layout: "focus" }, 1.85 * k, { left: 120 * u, top: top + 1150 * u })}
        {W({ mode: "quiet", lang, size: "medium", design: "studio", label: "iconOnly" }, 1.85 * k, { left: 120 * u, top: top + 1510 * u })}
      </>);
    }
    case 3: return ipad
      ? (<>{device(null, 1.3, { left: 110 * u, top: top + 80 * u }, "signal", "quiet")}<div style={{ position: "absolute", left: 830 * u, top: top + 10 * u }}><PhoneFrame scale={1.75}><IOSAutomations lang={lang} /></PhoneFrame></div></>)
      : device(<IOSAutomations lang={lang} />, big, { left: centerX(dw), top });
    case 4: {
      if (ipad) return (<>
        {(["glass", "studio", "signal"] as Skin[]).map((s, k) => (
          <div key={s} style={{ position: "absolute", left: (38 + k * 392) * u, top: top + (k === 1 ? 0 : 120) * u, transform: `rotate(${(k - 1) * 4}deg)`, zIndex: k === 1 ? 2 : 1 }}>
            <PhoneFrame scale={1.75}><PhoneApp skin={s} mode={(["aware", "quiet", "immersion"] as ModeKey[])[k]} lang={lang} /></PhoneFrame>
          </div>
        ))}
      </>);
      return (<>
        {(["glass", "studio", "signal"] as Skin[]).map((s, k) => (
          <div key={s} style={{ position: "absolute", left: (-40 + k * 400) * u, top: top + (k === 1 ? 0 : 150) * u, transform: `rotate(${(k - 1) * 5}deg)`, zIndex: k === 1 ? 2 : 1 }}>
            <PhoneFrame scale={1.62}><PhoneApp skin={s} mode={(["aware", "quiet", "immersion"] as ModeKey[])[k]} lang={lang} /></PhoneFrame>
          </div>
        ))}
      </>);
    }
    case 5: return device(null, big, { left: centerX(dw), top }, "studio", "immersion");
    default: return (<>
      <div style={{ position: "absolute", left: (ipad ? 90 : 120) * u, top: top + 40 * u }}>
        <PricingBlock lang={lang} u={ipad ? u * 0.78 : u} width={(ipad ? 760 : 1080) * u} />
      </div>
      <div style={{ position: "absolute", left: (ipad ? 870 : 260) * u, top: top + (ipad ? 0 : 1080) * u, transform: `rotate(${ipad ? 4 : -3}deg)` }}>
        <PhoneFrame scale={ipad ? 1.85 : 1.95}><PhoneApp skin="signal" mode="aware" lang={lang} /></PhoneFrame>
      </div>
    </>);
  }
}

function ControlCenterPad({ lang }: { lang: Lang }) {
  return (
    <div style={{ width: IPAD.w, height: IPAD.h, background: "#0c0a1c", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: (IPAD.w - 390 * 1.6) / 2, top: 40, transform: "scale(1.6)", transformOrigin: "top left" }}>
        <ControlCenter mode="aware" lang={lang} />
      </div>
    </div>
  );
}

export function MobileShot({ platform, index, lang }: { platform: "iphone" | "ipad"; index: number; lang: Lang }) {
  const [w] = SIZES[platform];
  const u = w / 1320;
  const c = MOBILE[index];
  return (
    <Backdrop color={accentOf(c.accent).base}>
      <Headline c={c} lang={lang} u={platform === "ipad" ? u * 0.92 : u} top={(platform === "ipad" ? 150 : 190) * u} />
      <MobileVisual i={index} lang={lang} platform={platform} u={u} />
    </Backdrop>
  );
}

// ─── Mac ─────────────────────────────────────────────────────────────────────

export function MacShot({ index, lang }: { index: number; lang: Lang }) {
  const c = MAC[index];
  const u = 1.55;
  const screen = (child: ReactNode, mode: ModeKey, menuActive = true) => (
    <div style={{ position: "absolute", left: 293, top: 740, transform: "scale(1.85)", transformOrigin: "top left" }}>
      <MacScreen width={1240} height={720} mode={mode} menuActive={menuActive}>{child}</MacScreen>
    </div>
  );
  let visual: ReactNode;
  switch (index) {
    case 0: visual = screen(<div style={{ position: "absolute", right: 60, top: 34 }}><MacPopover skin="glass" mode="quiet" lang={lang} /></div>, "quiet"); break;
    case 1: visual = screen(<>
      <div style={{ position: "absolute", left: 40, top: 70, transform: "scale(0.86)", transformOrigin: "top left" }}><MacSettingsAutomation lang={lang} rules={defaultRules(lang)} newRule={zoomRule(lang)} ruleIn={1} highlight={0.6} /></div>
      <div style={{ position: "absolute", left: 600, top: 230, transform: "scale(0.9)", transformOrigin: "top left" }}><CallWindow lang={lang} speaking={0.8} /></div>
    </>, "aware", false); break;
    case 2: visual = (<>
      {(["glass", "studio", "signal"] as Skin[]).map((s, k) => (
        <div key={s} style={{ position: "absolute", left: 400 + k * 740, top: 760 + (k === 1 ? 0 : 60), transform: "scale(1.75)", transformOrigin: "top left" }}>
          <MacPopover skin={s} mode={(["aware", "quiet", "immersion"] as ModeKey[])[k]} lang={lang} />
        </div>
      ))}
    </>); break;
    case 3: visual = screen(<>
      <div style={{ position: "absolute", left: 60, top: 70, transform: "scale(0.9)", transformOrigin: "top left" }}><Widget mode="immersion" lang={lang} size="large" /></div>
      <div style={{ position: "absolute", left: 440, top: 70, transform: "scale(0.9)", transformOrigin: "top left" }}><Widget mode="quiet" lang={lang} size="medium" design="glass" /></div>
      <div style={{ position: "absolute", left: 440, top: 250, transform: "scale(0.9)", transformOrigin: "top left" }}><Widget mode="quiet" lang={lang} size="medium" design="studio" label="iconOnly" /></div>
      <div style={{ position: "absolute", left: 800, top: 70, transform: "scale(0.9)", transformOrigin: "top left" }}><Widget mode="aware" lang={lang} size="small" design="signal" layout="status" /></div>
      <div style={{ position: "absolute", left: 980, top: 70, transform: "scale(0.9)", transformOrigin: "top left" }}><Widget mode="quiet" lang={lang} size="small" design="studio" layout="battery" /></div>
      <div style={{ position: "absolute", left: 800, top: 250, transform: "scale(0.9)", transformOrigin: "top left" }}><Widget mode="quiet" lang={lang} size="medium" design="signal" accent="blue" layout="focus" /></div>
    </>, "immersion", false); break;
    case 4: visual = (<>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", gap: 46 }}>
        {["⌃", "⌥", "1"].map((k) => (
          <div key={k} style={{ width: 260, height: 260, borderRadius: 52, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: 120, color: "#fff",
            background: "linear-gradient(180deg,#3b3946,#24222c)", boxShadow: "0 18px 0 #0d0c12, 0 40px 80px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.15)" }}>{k}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1250, display: "flex", justifyContent: "center", gap: 30, fontFamily: SANS, color: "rgba(255,255,255,0.75)", fontSize: 44 }}>
        {(["quiet", "aware", "immersion"] as ModeKey[]).map((m, k) => (
          <div key={m} style={{ display: "flex", alignItems: "center", gap: 18, padding: "22px 36px", borderRadius: 999, border: `2px solid ${MODES[m].accent}66`, color: MODES[m].light }}>
            <Keyboard size={38} />⌃⌥{k + 1} → {MODES[m].label}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1440, textAlign: "center", fontFamily: MONO, fontSize: 34, letterSpacing: 6, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
        {lang === "de" ? "Kürzel frei wählbar · ohne Zusatzrechte" : "Set your own · no extra permissions"}
      </div>
    </>); break;
    default: visual = (<>
      <div style={{ position: "absolute", left: 360, top: 760 }}><PricingBlock lang={lang} u={u * 0.72} width={1100} /></div>
      <div style={{ position: "absolute", left: 1620, top: 760, transform: "scale(1.6)", transformOrigin: "top left" }}><MacPopover skin="signal" mode="aware" lang={lang} /></div>
    </>);
  }
  return (
    <Backdrop color={accentOf(c.accent).base}>
      <Headline c={c} lang={lang} u={u * 0.95} top={150} />
      {visual}
    </Backdrop>
  );
}

// ─── product page header (21:9) + search result (3:2) ────────────────────────

export function HeaderArt({ lang }: { lang: Lang }) {
  return (
    <AbsoluteFill style={{ background: "#07060b", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(40% 70% at 30% 50%, ${MODES.quiet.accent}55, transparent 70%), radial-gradient(35% 70% at 72% 40%, ${MODES.immersion.accent}33, transparent 70%), radial-gradient(30% 60% at 88% 90%, ${MODES.aware.accent}30, transparent 70%)` }} />
      <div style={{ position: "absolute", left: 420, top: 150, transform: "scale(2.05)", transformOrigin: "top left" }}>
        <MacScreen width={1150} height={640} mode="quiet"><div style={{ position: "absolute", right: 50, top: 34 }}><MacPopover skin="glass" mode="quiet" lang={lang} /></div></MacScreen>
      </div>
      <div style={{ position: "absolute", left: 2780, top: 250, transform: "rotate(4deg)" }}><PhoneFrame scale={1.55}><PhoneApp skin="signal" mode="quiet" lang={lang} /></PhoneFrame></div>
      <div style={{ position: "absolute", left: 120, top: 1050, transform: "scale(1.9) rotate(-4deg)", transformOrigin: "top left" }}><Widget mode="quiet" lang={lang} size="medium" /></div>
    </AbsoluteFill>
  );
}

export function SearchArt({ lang }: { lang: Lang }) {
  const de = lang === "de";
  return (
    <AbsoluteFill style={{ background: "#07060b", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 60% at 25% 20%, ${MODES.quiet.accent}55, transparent 70%), radial-gradient(50% 55% at 85% 85%, ${MODES.immersion.accent}38, transparent 70%)` }} />
      <div style={{ position: "absolute", left: 230, top: 330, fontFamily: SANS, color: "#fff" }}>
        <div style={{ fontFamily: MONO, fontSize: 52, letterSpacing: 12, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>iPhone · iPad · Mac</div>
        <div style={{ fontSize: 250, fontWeight: 700, letterSpacing: -9, lineHeight: 0.95, marginTop: 60 }}>{de ? "Lärm aus." : "Noise off."}<br /><span style={{ color: MODES.quiet.light }}>{de ? "Mit einem Tipp." : "In one tap."}</span></div>
      </div>
      <div style={{ position: "absolute", left: 230, top: 1640, transform: "scale(2.3)", transformOrigin: "top left" }}><Widget mode="quiet" lang={lang} size="medium" /></div>
      <div style={{ position: "absolute", left: 2560, top: 300, transform: "rotate(5deg)" }}><PhoneFrame scale={2.45}><PhoneApp skin="signal" mode="quiet" lang={lang} /></PhoneFrame></div>
    </AbsoluteFill>
  );
}
