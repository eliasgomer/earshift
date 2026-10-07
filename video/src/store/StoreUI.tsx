// UI pieces only needed for App Store assets: iPad app + frame, iOS automation list.

import type { CSSProperties, ReactNode } from "react";
import { AudioLines, Brain, ChevronRight, Clock, MapPin, Mic, Music, Zap } from "lucide-react";
import { ModeIcon, Panel, StatusBar, Widget, type Skin } from "../../../src/ui/AppUI";
import { MODES, UI_FONT, type Lang, type ModeKey } from "../../../src/ui/modes";

export const IPAD = { w: 1032, h: 1376 };

export function IPadFrame({ children, scale = 1 }: { children: ReactNode; scale?: number }) {
  const b = 22 * scale;
  return (
    <div style={{ width: IPAD.w * scale + 2 * b, height: IPAD.h * scale + 2 * b, borderRadius: 58 * scale, padding: b, boxSizing: "border-box",
      background: "linear-gradient(145deg, #4a4a52, #17171b 40%, #2c2c33 75%, #4a4a52)", boxShadow: `0 ${50 * scale}px ${110 * scale}px rgba(0,0,0,0.6), inset 0 0 0 ${1.5 * scale}px rgba(255,255,255,0.12)` }}>
      <div style={{ width: IPAD.w * scale, height: IPAD.h * scale, borderRadius: 38 * scale, overflow: "hidden", position: "relative", background: "#000" }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: IPAD.w, height: IPAD.h }}>{children}</div>
      </div>
    </div>
  );
}

const T = {
  sound: { de: "Klang", en: "Sound" },
  eq: { de: "Equalizer", en: "Equalizer" },
  bands: { de: ["Bass", "Mitten", "Höhen"], en: ["Bass", "Mid", "Treble"] },
  presets: { de: ["Neutral", "Bass betonen", "Stimme"], en: ["Flat", "Bass boost", "Voice"] },
  spatial: { de: ["Aus", "Raum", "Kopf"], en: ["Off", "Room", "Head"] },
  widgets: { de: "Widgets", en: "Widgets" },
};

/// iPad regular width: skin panel left, sound + widgets right (MainView two-column layout).
export function IPadApp({ skin = "signal", mode, lang }: { skin?: Skin; mode: ModeKey; lang: Lang }) {
  const accent = skin === "studio" ? "#d9be93" : skin === "glass" ? "#0a84ff" : MODES[mode].accent;
  const card: CSSProperties = { borderRadius: 26, background: skin === "studio" ? "#0d0d0e" : skin === "glass" ? "#262529" : "#16151f", border: "1px solid rgba(255,255,255,0.07)", padding: 22 };
  return (
    <div style={{ width: IPAD.w, height: IPAD.h, background: skin === "studio" ? "#050505" : skin === "glass" ? "#1c1c1f" : "#0d0c14", color: "#fff", fontFamily: UI_FONT, position: "relative", overflow: "hidden" }}>
      <div style={{ zoom: 1 } as CSSProperties}><StatusBar /></div>
      <div style={{ display: "flex", gap: 22, padding: "220px 30px 0" }}>
        <div style={{ width: 480, display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ width: 320, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", zoom: 1.5 } as CSSProperties}>
            <Panel skin={skin} mode={mode} lang={lang} phone />
          </div>
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 14, background: `linear-gradient(135deg, ${accent}, #1d1b2b)` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, letterSpacing: 2, opacity: 0.5 }}>{lang === "de" ? "JETZT LÄUFT" : "NOW PLAYING"}</div>
              <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>{lang === "de" ? "Ruhige Stunde" : "Quiet Hour"}</div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", marginTop: 12 }}><div style={{ width: "38%", height: 4, borderRadius: 2, background: "#fff" }} /></div>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 26, background: "#fff", color: "#0d0c14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>▶</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 600 }}><AudioLines size={22} />{T.sound[lang]}</div>
            <div style={{ fontSize: 15, opacity: 0.55, marginTop: 14 }}>{T.eq[lang]}</div>
            {T.bands[lang].map((b, i) => {
              const v = [0.66, 0.5, 0.42][i];
              return (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, fontSize: 18 }}>
                  <span style={{ width: 74, opacity: 0.85 }}>{b}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.12)", position: "relative" }}>
                    <div style={{ width: `${v * 100}%`, height: 6, borderRadius: 3, background: accent }} />
                    <div style={{ position: "absolute", left: `calc(${v * 100}% - 15px)`, top: -10, width: 30, height: 25, borderRadius: 13, background: "#fff" }} />
                  </div>
                  <span style={{ width: 32, textAlign: "right", opacity: 0.7 }}>{["+3", "0", "-2"][i]}</span>
                </div>
              );
            })}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 22 }}>
              {T.presets[lang].map((p, i) => <div key={p} style={{ padding: "9px 0", textAlign: "center", borderRadius: 10, fontSize: 14, fontWeight: 600, background: i === 1 ? accent : "rgba(255,255,255,0.08)", color: i === 1 && skin === "studio" ? "#1a160f" : "#fff" }}>{p}</div>)}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 18, padding: 4, borderRadius: 12, background: "rgba(255,255,255,0.06)" }}>
              {T.spatial[lang].map((s, i) => <div key={s} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 9, fontSize: 15, fontWeight: 600, background: i === 1 ? "rgba(255,255,255,0.18)" : "transparent" }}>{s}</div>)}
            </div>
          </div>
          <div style={{ ...card, padding: 18 }}>
            <div style={{ fontSize: 15, opacity: 0.55, marginBottom: 14 }}>{T.widgets[lang]}</div>
            <div style={{ zoom: 0.68 } as CSSProperties}><Widget mode={mode} lang={lang} size="medium" design={skin} /></div>
            <div style={{ zoom: 0.68, marginTop: 14 } as CSSProperties}><Widget mode={mode} lang={lang} size="large" design={skin} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/// iOS: Focus filters + Shortcuts automations that drive Earshift.
export function IOSAutomations({ lang }: { lang: Lang }) {
  const de = lang === "de";
  const rows: [ReactNode, string, string, string, ModeKey][] = [
    [<Brain size={18} />, "#5e5ce6", de ? "Fokus „Arbeit“" : "Work Focus", de ? "Fokusfilter" : "Focus filter", "quiet"],
    [<Clock size={18} />, "#ff9f0a", de ? "Täglich um 18:00" : "Every day at 6 pm", de ? "Automation" : "Automation", "immersion"],
    [<MapPin size={18} />, "#30d158", de ? "Ankunft im Büro" : "Arrive at the office", de ? "Automation" : "Automation", "quiet"],
    [<Music size={18} />, "#ff375f", de ? "Musik wird geöffnet" : "Music is opened", de ? "Automation" : "Automation", "immersion"],
    [<Mic size={18} />, "#0a84ff", de ? "„Earshift auf Aware“" : "“Earshift to Aware”", "Siri", "aware"],
    [<Zap size={18} />, "#bf5af2", de ? "Aktionstaste" : "Action Button", de ? "Steuerelement" : "Control", "quiet"],
  ];
  return (
    <div style={{ width: 390, height: 844, background: "#000", color: "#fff", fontFamily: UI_FONT, position: "relative", overflow: "hidden" }}>
      <StatusBar />
      <div style={{ padding: "8px 20px 0" }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>{de ? "Automationen" : "Automations"}</div>
        <div style={{ fontSize: 15, opacity: 0.55, marginTop: 4 }}>{de ? "Earshift wechselt den Modus von selbst." : "Earshift switches the mode by itself."}</div>
      </div>
      <div style={{ margin: "22px 16px 0", borderRadius: 14, background: "#1c1c1e", overflow: "hidden" }}>
        {rows.map(([icon, color, title, sub, m], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderTop: i ? "0.5px solid rgba(255,255,255,0.12)" : undefined }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{title}</div>
              <div style={{ fontSize: 13, opacity: 0.5 }}>{sub}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 9, background: MODES[m].tileFill, color: MODES[m].light, fontSize: 13, fontWeight: 600 }}>
              <ModeIcon mode={m} size={12} color={MODES[m].light} />{MODES[m].label}
            </div>
            <ChevronRight size={16} opacity={0.3} />
          </div>
        ))}
      </div>
      <div style={{ margin: "18px 16px 0", padding: 16, borderRadius: 14, background: "#1c1c1e", fontSize: 14, lineHeight: 1.45, opacity: 0.75 }}>
        {de ? "Alle Earshift-Aktionen gibt es in der Kurzbefehle-App - sie laufen im Hintergrund, ohne die App zu öffnen."
          : "Every Earshift action is in the Shortcuts app - they run in the background without opening the app."}
      </div>
    </div>
  );
}
