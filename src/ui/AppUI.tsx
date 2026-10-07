// Earshift app UI rebuilt as plain React (no hooks) so the website and the
// Remotion demo video render the exact same mockups. Looks follow App/Skins.swift
// and the App Store screenshots: Glass (native grey), Signal (mode-colored header),
// Studio (black, mono labels, beige accent). No backdrop-filter anywhere: it
// flickers in frame-by-frame video rendering.

import type { CSSProperties, ReactNode } from "react";
import {
  AudioLines, Bluetooth, Brain, Flashlight, Headphones, Mic, MicOff, Moon, Music, Plane, Play,
  Plus, Settings, Signal as SignalIcon, SkipBack, SkipForward, Sun, Video, VideoOff, Volume2, Waves, Wifi, Ear, PhoneOff,
} from "lucide-react";
import { DEVICE_NAME, MODES, MODE_ORDER, UI_FONT, type Lang, type ModeKey } from "./modes";

export type Skin = "glass" | "signal" | "studio";
export const SKINS: Skin[] = ["glass", "studio", "signal"];
export const SKIN_LABEL: Record<Skin, string> = { glass: "Glass", studio: "Studio", signal: "Signal" };

const STUDIO = { bg: "#0a0a0b", text: "#f2f0ed", secondary: "#8d887f", tertiary: "#6f6a62", accent: "#d9be93", line: "rgba(255,255,255,0.08)" };
const MONO = '"Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace';

const T = {
  activeMode: { de: "AKTIVER MODUS", en: "ACTIVE MODE" },
  profile: { de: "PROFIL", en: "PROFILE" },
  profiles: { de: "Profile", en: "Profiles" },
  manage: { de: "Verwalten", en: "Manage" },
  focus: { de: "Fokus", en: "Focus" },
  music: { de: "Musik", en: "Music" },
  meeting: { de: "Meeting", en: "Meeting" },
  travel: { de: "Reise", en: "Travel" },
  profileWord: { de: "Profil", en: "Profile" },
  connected: { de: "Verbunden", en: "Connected" },
  active: { de: "aktiv", en: "active" },
  start: { de: "Starten", en: "Start" },
  settings: { de: "Einstellungen", en: "Settings" },
  disconnect: { de: "Trennen", en: "Disconnect" },
  quit: { de: "Beenden", en: "Quit Earshift" },
  widgets: { de: "Widgets", en: "Widgets" },
  startFocus: { de: "25 Minuten starten", en: "Start 25 minutes" },
  focusFor: { de: "25 Minuten fokussieren", en: "Focus for 25 minutes" },
  device: { de: "GERÄT", en: "DEVICE" },
  mode: { de: "MODUS", en: "MODE" },
  track: { de: "Ruhige Stunde", en: "Quiet Hour" },
  sound: { de: "Klang", en: "Sound" },
  bass: { de: "Bass", en: "Bass" },
  mid: { de: "Mitten", en: "Mid" },
  treble: { de: "Höhen", en: "Treble" },
  muted: { de: "stumm", en: "muted" },
  next: { de: "Nächster Modus", en: "Next Mode" },
};

export function ModeIcon({ mode, size = 18, color, stroke = 2 }: { mode: ModeKey; size?: number; color?: string; stroke?: number }) {
  const p = { size, color: color ?? "currentColor", strokeWidth: stroke };
  if (mode === "quiet") return <Moon {...p} fill={color ?? "currentColor"} />;
  if (mode === "aware") return <Ear {...p} />;
  return <Waves {...p} />;
}

function BatteryGlyph({ level, w = 24, h = 11, fill = "#fff", track = "rgba(255,255,255,0.22)" }: { level: number; w?: number; h?: number; fill?: string; track?: string }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: w, height: h, borderRadius: h * 0.3, background: track, flexShrink: 0 }}>
      <span style={{ position: "absolute", left: 1.5, top: 1.5, height: h - 3, width: Math.max(2, (w - 3) * level / 100), borderRadius: h * 0.22, background: fill }} />
    </span>
  );
}

type Profile = { icon: ReactNode; name: string; mode: ModeKey; sub?: string };
function profilesFor(lang: Lang, size = 14): Profile[] {
  return [
    { icon: <Brain size={size} />, name: T.focus[lang], mode: "quiet", sub: `Quiet · ${T.muted[lang]}` },
    { icon: <Music size={size} />, name: T.music[lang], mode: "immersion" },
    { icon: <Video size={size} />, name: T.meeting[lang], mode: "aware" },
    { icon: <Plane size={size} />, name: T.travel[lang], mode: "quiet" },
  ];
}

export interface PanelProps {
  mode: ModeKey;
  lang: Lang;
  /// briefly highlighted (pressed) mode tile
  pressed?: ModeKey;
  hover?: ModeKey;
  battery?: number;
  /// iPhone variant: footer shows "Widgets" instead of "Quit"
  phone?: boolean;
}

// ─── Glass ───────────────────────────────────────────────────────────────────

function GlassPanel({ mode, lang, pressed, hover, battery = 72, phone }: PanelProps) {
  const m = MODES[mode];
  const card: CSSProperties = { borderRadius: 7, background: "rgba(255,255,255,0.075)", border: "1px solid rgba(255,255,255,0.06)" };
  return (
    <div style={{ width: 320, color: "#fff", fontFamily: UI_FONT, fontSize: 12, background: "#262529" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 10px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Headphones size={18} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{DEVICE_NAME[lang]}</div>
          <div style={{ opacity: 0.55, fontSize: 11.5, whiteSpace: "nowrap" }}>{T.connected[lang]} · {m.label} {T.active[lang]}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 10, background: "rgba(255,255,255,0.08)", fontWeight: 600 }}>
          {battery}% <BatteryGlyph level={battery} w={20} h={10} fill="#30d158" track="rgba(255,255,255,0.25)" />
        </div>
      </div>
      <div style={{ margin: "0 12px", padding: 4, display: "flex", gap: 4, borderRadius: 10, background: "rgba(0,0,0,0.28)" }}>
        {MODE_ORDER.map((k) => {
          const sel = k === mode;
          return (
            <div key={k} style={{ flex: 1, padding: "9px 0 8px", borderRadius: 7, display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              background: sel ? "rgba(255,255,255,0.2)" : pressed === k ? "rgba(255,255,255,0.16)" : hover === k ? "rgba(255,255,255,0.08)" : "transparent",
              boxShadow: sel ? "0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)" : undefined, transform: pressed === k ? "scale(0.96)" : undefined }}>
              <ModeIcon mode={k} size={17} color="#fff" />
              <span style={{ fontSize: 11.5, fontWeight: sel ? 700 : 500 }}>{MODES[k].label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "12px 0 10px" }} />
      <div style={{ padding: "0 14px", display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600 }}>
        <span style={{ opacity: 0.6 }}>{T.profiles[lang]}</span><span style={{ color: "#0a84ff" }}>{T.manage[lang]}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "8px 14px 0" }}>
        {profilesFor(lang).map((p) => <div key={p.name} style={{ ...card, padding: "7px 10px", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>{p.icon}{p.name}</div>)}
      </div>
      <div style={{ padding: "12px 14px 0", fontSize: 11, opacity: 0.6, fontWeight: 600 }}>{T.focus[lang]}</div>
      <div style={{ display: "flex", gap: 4, margin: "6px 14px 0", padding: 2, borderRadius: 7, background: "rgba(0,0,0,0.22)" }}>
        {[15, 25, 50, 90].map((n) => <div key={n} style={{ flex: 1, textAlign: "center", padding: "4px 0", borderRadius: 5, fontWeight: 600, background: n === 25 ? "rgba(255,255,255,0.2)" : "transparent" }}>{n}</div>)}
      </div>
      <div style={{ margin: "10px 14px 0", padding: "8px 0", borderRadius: 7, background: "#0a84ff", textAlign: "center", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Play size={11} fill="currentColor" /> {T.startFocus[lang]}
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "12px 0 0" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", fontSize: 11.5 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.7 }}><Settings size={12} />{T.settings[lang]}</span>
        <span style={{ color: "#ff453a" }}>{T.disconnect[lang]}</span>
        <span style={{ flex: 1 }} />
        <span style={{ opacity: 0.6 }}>{phone ? T.widgets[lang] : T.quit[lang]}</span>
      </div>
    </div>
  );
}

// ─── Signal ──────────────────────────────────────────────────────────────────

function SignalPanel({ mode, lang, pressed, battery = 72, phone }: PanelProps) {
  const m = MODES[mode];
  const darkOn = mode === "aware" ? "#1a1204" : "#fff";
  return (
    <div style={{ width: 320, color: "#fff", fontFamily: UI_FONT, background: "#0d0c14" }}>
      <div style={{ padding: "14px 16px 18px", background: `radial-gradient(120% 140% at 80% 0%, ${m.gradient[0]} 0%, ${m.gradient[1]} 55%, ${m.gradient[2]} 100%)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: "#30d158", boxShadow: "0 0 0 3px rgba(48,209,88,0.22)" }} />
          <span style={{ opacity: 0.75, fontWeight: 500 }}>{DEVICE_NAME[lang]}</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontWeight: 600, opacity: 0.9 }}>{battery}%</span>
          <BatteryGlyph level={battery} w={24} h={11} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9.5, letterSpacing: 2, opacity: 0.55, fontWeight: 500 }}>{T.activeMode[lang]}</div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1 }}>{m.label}</div>
            <div style={{ fontSize: 11.5, opacity: 0.6, marginTop: 3 }}>{m.descLong[lang]}</div>
          </div>
          <ModeIcon mode={mode} size={34} stroke={1.4} color="rgba(255,255,255,0.92)" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 7, padding: 11 }}>
        {MODE_ORDER.map((k) => {
          const sel = k === mode, s = MODES[k];
          return (
            <div key={k} style={{ flex: 1, padding: "11px 10px", borderRadius: 12, background: sel ? s.tileFill : pressed === k ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${sel ? s.tileStroke : "transparent"}`, transform: pressed === k ? "scale(0.96)" : undefined }}>
              <ModeIcon mode={k} size={16} color={sel ? "#fff" : s.accent} />
              <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 600, opacity: sel ? 1 : 0.8 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "2px 14px 0", display: "flex", justifyContent: "space-between", fontSize: 9.5, letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>
        <span>{T.profile[lang]}</span><span style={{ letterSpacing: 0, fontSize: 11, color: m.light }}>{T.manage[lang]}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, padding: 11 }}>
        {profilesFor(lang, 16).map((p) => (
          <div key={p.name} style={{ display: "flex", gap: 9, alignItems: "center", padding: "10px 10px", borderRadius: 12, background: "rgba(255,255,255,0.05)" }}>
            <span style={{ color: MODES[p.mode].accent, display: "flex" }}>{p.icon}</span>
            <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 10.5, opacity: 0.5 }}>{T.profileWord[lang]} · {MODES[p.mode].label}</div></div>
          </div>
        ))}
      </div>
      <div style={{ margin: "0 11px", padding: 12, borderRadius: 14, background: "rgba(255,255,255,0.045)" }}>
        <div style={{ fontSize: 9.5, letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>{T.focus[lang].toUpperCase()}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, border: `5px solid ${m.accent}`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>25</div><div style={{ fontSize: 7.5, opacity: 0.55, letterSpacing: 1 }}>MIN</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {[15, 25, 50, 90].map((n) => <div key={n} style={{ flex: 1, textAlign: "center", padding: "5px 0", borderRadius: 7, fontSize: 12, fontWeight: 600, background: n === 25 ? m.accent : "rgba(255,255,255,0.07)", color: n === 25 ? darkOn : "#fff" }}>{n}</div>)}
            </div>
            <div style={{ marginTop: 8, padding: "7px 0", borderRadius: 9, background: m.accent, color: darkOn, fontWeight: 600, fontSize: 12.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Play size={11} fill="currentColor" /> {T.start[lang]}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)", fontSize: 11.5 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.7 }}><Settings size={12} />{T.settings[lang]}</span>
        <span style={{ color: "#ff453a" }}>{T.disconnect[lang]}</span>
        <span style={{ flex: 1 }} />
        <span style={{ opacity: 0.6 }}>{phone ? T.widgets[lang] : T.quit[lang]}</span>
      </div>
    </div>
  );
}

// ─── Studio ──────────────────────────────────────────────────────────────────

function StudioPanel({ mode, lang, pressed, battery = 72, phone }: PanelProps) {
  const label: CSSProperties = { fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: STUDIO.tertiary, textTransform: "uppercase" };
  const line = <div style={{ height: 1, background: STUDIO.line }} />;
  return (
    <div style={{ width: 320, color: STUDIO.text, fontFamily: UI_FONT, background: STUDIO.bg }}>
      <div style={{ padding: "16px 16px 14px", display: "flex", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={label}>{T.device[lang]}</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{DEVICE_NAME[lang]}</div>
          <div style={{ fontSize: 11, color: STUDIO.secondary, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: STUDIO.accent }} />{T.connected[lang]} · BLE
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -1, lineHeight: 1 }}>{battery}<span style={{ fontSize: 11, color: STUDIO.secondary, marginLeft: 2 }}>%</span></div>
          <div style={{ marginTop: 8, width: 78, height: 2, backgroundImage: `repeating-linear-gradient(90deg, ${STUDIO.accent} 0 4px, transparent 4px 7px)` }} />
        </div>
      </div>
      {line}
      <div style={{ padding: "14px 10px 8px" }}>
        <div style={{ ...label, padding: "0 6px 8px" }}>{T.mode[lang]}</div>
        {MODE_ORDER.map((k) => {
          const sel = k === mode;
          return (
            <div key={k} style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 8, marginBottom: 3,
              background: sel ? "rgba(217,190,147,0.1)" : pressed === k ? "rgba(255,255,255,0.06)" : "transparent", border: `1px solid ${sel ? "rgba(217,190,147,0.32)" : "transparent"}` }}>
              {sel && <span style={{ position: "absolute", left: 5, top: 10, bottom: 10, width: 2, borderRadius: 1, background: STUDIO.accent }} />}
              <span style={{ width: 22, display: "flex", justifyContent: "center" }}><ModeIcon mode={k} size={16} stroke={1.6} color={sel ? STUDIO.accent : STUDIO.secondary} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: sel ? 600 : 500 }}>{MODES[k].label}</div>
                <div style={{ fontSize: 10.5, color: STUDIO.secondary }}>{MODES[k].desc[lang]}</div>
              </div>
              {sel && <AudioLines size={16} color={STUDIO.accent} />}
            </div>
          );
        })}
      </div>
      {line}
      <div style={{ padding: "12px 16px 6px", display: "flex", justifyContent: "space-between" }}>
        <span style={label}>{T.profiles[lang]}</span><span style={{ fontSize: 10.5, color: STUDIO.secondary }}>{T.manage[lang]}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "0 16px 12px" }}>
        {profilesFor(lang).map((p) => (
          <div key={p.name} style={{ padding: "8px 10px", borderRadius: 7, border: `1px solid ${STUDIO.line}` }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: STUDIO.tertiary }}>{p.sub ?? MODES[p.mode].label}</div>
          </div>
        ))}
      </div>
      {line}
      <div style={{ padding: "12px 16px" }}>
        <div style={label}>{T.focus[lang]}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, fontSize: 12.5 }}>
          {[15, 25, 50, 90].map((n) => <span key={n} style={{ color: n === 25 ? STUDIO.text : STUDIO.tertiary, fontWeight: n === 25 ? 700 : 500, borderBottom: n === 25 ? `2px solid ${STUDIO.accent}` : "2px solid transparent", paddingBottom: 3 }}>{n}</span>)}
          <span style={{ flex: 1 }} />
          <span style={{ fontFamily: MONO, fontSize: 10, color: STUDIO.secondary }}>- MIN +</span>
        </div>
        <div style={{ marginTop: 12, padding: "8px 0", borderRadius: 7, background: STUDIO.accent, color: "#1a160f", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Play size={10} fill="currentColor" /> {T.focusFor[lang]}
        </div>
      </div>
      {line}
      <div style={{ ...label, display: "flex", padding: "10px 16px 12px", fontSize: 8.5 }}>
        <span>{T.settings[lang]}</span><span style={{ flex: 1 }} /><span>{T.disconnect[lang]} · {phone ? T.widgets[lang] : "Quit"}</span>
      </div>
    </div>
  );
}

export function Panel({ skin, ...p }: PanelProps & { skin: Skin }) {
  if (skin === "studio") return <StudioPanel {...p} />;
  if (skin === "signal") return <SignalPanel {...p} />;
  return <GlassPanel {...p} />;
}

// ─── Mac popover ─────────────────────────────────────────────────────────────

export function MacPopover({ skin = "glass", ...p }: PanelProps & { skin?: Skin }) {
  return (
    <div style={{ width: 320, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
      <Panel skin={skin} {...p} />
    </div>
  );
}

// ─── iPhone app ──────────────────────────────────────────────────────────────

export function StatusBar({ time = "9:41", dark = false }: { time?: string; dark?: boolean }) {
  const c = dark ? "#000" : "#fff";
  return (
    <div style={{ height: 54, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 34px 8px 46px", fontSize: 16, fontWeight: 600, color: c, fontFamily: UI_FONT }}>
      <span>{time}</span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>{[5, 7, 9, 11].map((h) => <span key={h} style={{ width: 3, height: h, borderRadius: 1, background: c }} />)}</span>
        <Wifi size={15} color={c} strokeWidth={2.6} />
        <span style={{ width: 25, height: 12, borderRadius: 4, border: `1.5px solid ${c}88`, padding: 1.5, boxSizing: "border-box", display: "flex" }}><span style={{ width: "75%", background: c, borderRadius: 2 }} /></span>
      </span>
    </div>
  );
}

function HomeIndicator({ color = "rgba(255,255,255,0.6)" }: { color?: string }) {
  return <div style={{ position: "absolute", bottom: 8, left: "50%", marginLeft: -67, width: 134, height: 5, borderRadius: 3, background: color }} />;
}

export function PhoneApp({ skin = "signal", mode, lang, pressed, battery = 72 }: PanelProps & { skin?: Skin }) {
  const m = MODES[mode];
  const bg = skin === "studio" ? "#050505" : skin === "glass" ? "#1c1c1f" : "#0d0c14";
  const accent = skin === "studio" ? STUDIO.accent : skin === "glass" ? "#0a84ff" : m.accent;
  return (
    <div style={{ width: 390, height: 844, background: bg, color: "#fff", fontFamily: UI_FONT, overflow: "hidden", position: "relative" }}>
      <StatusBar />
      <div style={{ margin: "8px 14px 0", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", zoom: 362 / 320 } as CSSProperties}>
        <Panel skin={skin} mode={mode} lang={lang} pressed={pressed} battery={battery} phone />
      </div>
      <div style={{ margin: "12px 14px 0", padding: 16, borderRadius: 24, background: skin === "studio" ? "#0d0d0e" : skin === "glass" ? "#262529" : "#16151f", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 600 }}><AudioLines size={17} /> {T.sound[lang]}</div>
        {([[T.bass[lang], 0.65], [T.mid[lang], 0.5], [T.treble[lang], 0.4]] as [string, number][]).map(([l, v]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, fontSize: 14 }}>
            <span style={{ width: 56, opacity: 0.85 }}>{l}</span>
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)", position: "relative" }}>
              <div style={{ width: `${v * 100}%`, height: 5, borderRadius: 3, background: accent }} />
              <div style={{ position: "absolute", left: `calc(${v * 100}% - 13px)`, top: -8, width: 26, height: 21, borderRadius: 11, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
            </div>
          </div>
        ))}
      </div>
      <HomeIndicator />
    </div>
  );
}

// ─── Widgets (Shared/WidgetConfig.swift) ─────────────────────────────────────

export type WidgetSize = "small" | "medium" | "large";
export type WidgetDesign = "app" | "glass" | "studio" | "signal";
export type WidgetAccent = "app" | "blue" | "purple" | "pink" | "red" | "orange" | "yellow" | "green" | "graphite";
export type WidgetLabel = "iconAndText" | "iconOnly" | "textOnly";
export type WidgetLayout = "statusAndButtons" | "buttons" | "status" | "battery" | "focus";

export const WIDGET_ACCENTS: Record<Exclude<WidgetAccent, "app">, string> = {
  blue: "#0a84ff", purple: "#bf5af2", pink: "#ff375f", red: "#ff453a", orange: "#ff9f0a", yellow: "#ffd60a", green: "#30d158", graphite: "#8e8e93",
};
export const WIDGET_DIMS: Record<WidgetSize, [number, number]> = { small: [170, 170], medium: [364, 170], large: [364, 382] };

export interface WidgetProps {
  mode: ModeKey;
  lang: Lang;
  size?: WidgetSize;
  design?: WidgetDesign;
  accent?: WidgetAccent;
  label?: WidgetLabel;
  layout?: WidgetLayout;
  pressed?: string;
  /// app skin used when design == "app"
  appSkin?: Skin;
  battery?: number;
  showName?: boolean;
}

/// One configurable Earshift widget in its native point size.
export function Widget({ mode, lang, size = "medium", design = "app", accent = "app", label = "iconAndText", layout = "statusAndButtons", pressed, appSkin = "signal", battery = 72, showName = true }: WidgetProps) {
  const [w, h] = WIDGET_DIMS[size];
  const skin: Skin = design === "app" ? appSkin : design;
  const m = MODES[mode];
  const acc = accent === "app" ? (skin === "studio" ? STUDIO.accent : skin === "glass" ? "#ffffff" : m.accent) : WIDGET_ACCENTS[accent];
  const bg = skin === "signal"
    ? accent === "app"
      ? `linear-gradient(135deg, ${m.gradient[0]} 0%, ${m.gradient[1]} 62%, ${m.gradient[2]} 100%)`
      : `linear-gradient(135deg, ${acc} 0%, ${acc}88 55%, #0b0a12 100%)`
    : skin === "studio" ? "#0b0b0c" : "linear-gradient(160deg, #4a4a50 0%, #2c2c31 100%)";
  const selFill = skin === "signal" ? "rgba(255,255,255,0.32)" : skin === "studio" ? acc : accent === "app" ? "rgba(255,255,255,0.34)" : acc;
  const selText = skin === "studio" || (skin === "glass" && accent !== "app" && accent !== "graphite" && accent !== "blue" && accent !== "purple" && accent !== "red" && accent !== "pink") ? "#16130d" : "#fff";
  const idle = skin === "studio" ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.13)";
  const iconSize = size === "small" ? 19 : size === "large" ? 26 : 22;
  const buttons: { key: string; icon: ReactNode; text: string; mode?: ModeKey }[] = [
    ...MODE_ORDER.map((k) => ({ key: k as string, mode: k, icon: <ModeIcon mode={k} size={iconSize} />, text: MODES[k].label })),
    { key: "focus", icon: <Brain size={iconSize} />, text: T.focus[lang] },
    { key: "music", icon: <Music size={iconSize} />, text: T.music[lang] },
    { key: "meeting", icon: <Video size={iconSize} />, text: T.meeting[lang] },
  ];
  const shown = size === "large" ? buttons : size === "medium" ? buttons.slice(0, 4) : buttons.slice(0, layout === "buttons" ? 4 : 3);
  const cols = size === "large" ? 3 : size === "small" && layout === "buttons" ? 2 : shown.length;
  const status = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <ModeIcon mode={mode} size={17} color={skin === "studio" ? acc : "#fff"} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.15 }}>{m.label}</div>
        {showName && size !== "small" && <div style={{ fontSize: 11, opacity: 0.6, whiteSpace: "nowrap" }}>{DEVICE_NAME[lang]}</div>}
      </div>
      <BatteryGlyph level={battery} w={20} h={9} />
      {size !== "small" && <span style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>{battery}%</span>}
    </div>
  );
  const grid = (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 7, flex: 1, marginTop: layout === "buttons" ? 0 : 12 }}>
      {shown.map((b) => {
        const sel = b.mode === mode;
        return (
          <div key={b.key} style={{ borderRadius: size === "small" ? 12 : 15, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
            background: sel ? selFill : pressed === b.key ? "rgba(255,255,255,0.26)" : idle, color: sel ? selText : "#fff",
            border: sel && skin !== "studio" ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent", transform: pressed === b.key ? "scale(0.93)" : undefined }}>
            {label !== "textOnly" && b.icon}
            {label !== "iconOnly" && size !== "small" && <span style={{ fontSize: label === "textOnly" ? 13 : 11, fontWeight: 600 }}>{b.text}</span>}
          </div>
        );
      })}
    </div>
  );
  let body: ReactNode;
  if (layout === "status") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><ModeIcon mode={mode} size={30} color={skin === "studio" ? acc : "#fff"} /><span style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><BatteryGlyph level={battery} w={20} h={9} />{battery}%</span></div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: size === "small" ? 26 : 34, fontWeight: 700, letterSpacing: -0.8 }}>{m.label}</div>
        {showName && <div style={{ fontSize: 12, opacity: 0.6 }}>{DEVICE_NAME[lang]}</div>}
      </div>
    );
  } else if (layout === "battery") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><Headphones size={22} /><ModeIcon mode={mode} size={18} color={skin === "studio" ? acc : "#fff"} /></div>
        <div style={{ flex: 1 }} />
        <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.18)" }}><div style={{ width: `${battery}%`, height: 12, borderRadius: 6, background: skin === "studio" ? acc : accent === "app" ? "#0a84ff" : acc }} /></div>
        <div style={{ fontSize: size === "small" ? 30 : 38, fontWeight: 700, marginTop: 8, textAlign: "center" }}>{battery}%</div>
        {showName && <div style={{ fontSize: 11.5, opacity: 0.6, textAlign: "center" }}>{DEVICE_NAME[lang]}</div>}
      </div>
    );
  } else if (layout === "focus") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}><Brain size={15} />{T.focus[lang]}<span style={{ flex: 1 }} /><span style={{ fontSize: 11, opacity: 0.8 }}>{battery}%</span></div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: size === "small" ? "1fr 1fr" : "repeat(4, 1fr)", gridAutoRows: "1fr", gap: 7, marginTop: 10 }}>
          {(size === "small" ? [25, 50] : size === "large" ? [15, 25, 50, 90, 120, 180, 240, 300] : [15, 25, 50, 90]).map((n) => (
            <div key={n} style={{ borderRadius: 13, background: n === 25 ? selFill : idle, color: n === 25 ? selText : "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{n}</span><span style={{ fontSize: 10, opacity: 0.7 }}>min</span>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    body = (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {layout === "statusAndButtons" && status}
        {grid}
      </div>
    );
  }
  return (
    <div style={{ width: w, height: h, borderRadius: 26, padding: size === "small" ? 14 : 16, boxSizing: "border-box", color: "#fff", fontFamily: UI_FONT, background: bg, overflow: "hidden",
      border: skin === "studio" ? "1px solid rgba(255,255,255,0.08)" : undefined, boxShadow: "0 12px 34px rgba(0,0,0,0.35)" }}>
      {body}
    </div>
  );
}

// ─── Lock Screen + Control Center (no fake app icons) ────────────────────────

export const WALLPAPER = "radial-gradient(90% 60% at 30% 10%, #4b3fb0 0%, #231d55 38%, #0c0a1c 75%, #06050c 100%)";

export function LockScreen({ mode, lang, pressed }: { mode: ModeKey; lang: Lang; pressed?: ModeKey }) {
  const m = MODES[mode];
  const pill: CSSProperties = { background: "rgba(255,255,255,0.16)", borderRadius: 18 };
  return (
    <div style={{ width: 390, height: 844, position: "relative", overflow: "hidden", background: WALLPAPER, color: "#fff", fontFamily: UI_FONT }}>
      <StatusBar />
      <div style={{ textAlign: "center", marginTop: 22, fontSize: 19, fontWeight: 600, opacity: 0.85 }}>{lang === "de" ? "Dienstag, 7. Oktober" : "Tuesday, October 7"}</div>
      <div style={{ textAlign: "center", fontSize: 96, fontWeight: 700, letterSpacing: -2, lineHeight: 1, marginTop: 2 }}>9:41</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 18 }}>
        <div style={{ ...pill, width: 72, height: 72, borderRadius: 36, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <ModeIcon mode={mode} size={22} color="#fff" /><span style={{ fontSize: 11, fontWeight: 700 }}>72</span>
        </div>
        <div style={{ ...pill, width: 170, height: 72, padding: "10px 12px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700 }}><ModeIcon mode={mode} size={14} color="#fff" />{m.label}<span style={{ flex: 1 }} /><span style={{ fontSize: 11, fontWeight: 600 }}>72%</span></div>
          <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
            {MODE_ORDER.map((k) => (
              <div key={k} style={{ flex: 1, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
                background: k === mode ? "rgba(255,255,255,0.85)" : pressed === k ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)", transform: pressed === k ? "scale(0.9)" : undefined }}>
                <ModeIcon mode={k} size={12} color={k === mode ? "#14122e" : "#fff"} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 46, left: 50, width: 50, height: 50, borderRadius: 25, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}><Flashlight size={22} /></div>
      <div style={{ position: "absolute", bottom: 46, right: 50, width: 50, height: 50, borderRadius: 25, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}><Headphones size={22} /></div>
      <HomeIndicator color="rgba(255,255,255,0.85)" />
    </div>
  );
}

/// iOS Control Center with the Earshift controls. `open` 0..1 animates it in.
export function ControlCenter({ mode, lang, pressed, open = 1 }: { mode: ModeKey; lang: Lang; pressed?: string; open?: number }) {
  const m = MODES[mode];
  const tile: CSSProperties = { background: "rgba(44,42,52,0.94)", borderRadius: 28 };
  const round = (color: string, icon: ReactNode) => (
    <div style={{ width: 58, height: 58, borderRadius: 29, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
  );
  return (
    <div style={{ width: 390, height: 844, position: "relative", overflow: "hidden", background: WALLPAPER, fontFamily: UI_FONT, color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: `rgba(6,5,12,${0.66 * open})` }} />
      <div style={{ position: "absolute", inset: 0, opacity: open, transform: `translateY(${(1 - open) * -70}px) scale(${0.95 + 0.05 * open})`, transformOrigin: "top center" }}>
        <StatusBar />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "26px 24px 0" }}>
          <div style={{ ...tile, padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, justifyItems: "center" }}>
            {round("#ff9f0a", <Plane size={24} />)}{round("#30d158", <SignalIcon size={24} />)}
            {round("#0a84ff", <Wifi size={24} />)}{round("#0a84ff", <Bluetooth size={24} />)}
          </div>
          <div style={{ ...tile, padding: 16, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, opacity: 0.75 }}><Headphones size={14} />{DEVICE_NAME[lang]}</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>{T.track[lang]}</div>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 10 }}><SkipBack size={20} fill="#fff" /><Play size={20} fill="#fff" /><SkipForward size={20} fill="#fff" /></div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, padding: "14px 24px 0" }}>
          <div style={{ ...tile, height: 150, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
            <div style={{ height: "62%", background: "rgba(255,255,255,0.92)", display: "flex", justifyContent: "center", paddingTop: 14, color: "#555" }}><Sun size={22} /></div>
          </div>
          <div style={{ ...tile, height: 150, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
            <div style={{ height: "46%", background: "rgba(255,255,255,0.92)", display: "flex", justifyContent: "center", paddingTop: 14, color: "#555" }}><Volume2 size={22} /></div>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ ...tile, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}><Flashlight size={24} /></div>
            <div style={{ ...tile, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}><Moon size={24} /></div>
          </div>
        </div>
        <div style={{ padding: "22px 28px 0", fontSize: 13, fontWeight: 600, opacity: 0.6 }}>Earshift</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "10px 24px 0" }}>
          {MODE_ORDER.map((k) => {
            const sel = k === mode;
            return (
              <div key={k} style={{ ...tile, height: 74, borderRadius: 24, display: "flex", alignItems: "center", gap: 12, padding: "0 16px",
                background: sel ? "rgba(255,255,255,0.94)" : pressed === k ? "rgba(255,255,255,0.32)" : tile.background, color: sel ? "#111" : "#fff", transform: pressed === k ? "scale(0.95)" : undefined }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: sel ? MODES[k].accent : "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ModeIcon mode={k} size={20} color="#fff" />
                </div>
                <div><div style={{ fontSize: 15, fontWeight: 600 }}>{MODES[k].label}</div><div style={{ fontSize: 11.5, opacity: 0.6 }}>Earshift</div></div>
              </div>
            );
          })}
          <div style={{ ...tile, height: 74, borderRadius: 24, display: "flex", alignItems: "center", gap: 12, padding: "0 16px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: m.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Waves size={20} /></div>
            <div><div style={{ fontSize: 15, fontWeight: 600 }}>{T.next[lang]}</div><div style={{ fontSize: 11.5, opacity: 0.6 }}>Earshift</div></div>
          </div>
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}

// ─── Mac: menu bar, settings (Automation), call window, frames ───────────────

export function MenuBar({ mode, width = 1280, active = true, flash = 0 }: { mode: ModeKey; width?: number; active?: boolean; flash?: number }) {
  return (
    <div style={{ width, height: 28, display: "flex", alignItems: "center", gap: 18, padding: "0 16px", boxSizing: "border-box",
      background: "rgba(16,14,26,0.72)", color: "#fff", fontFamily: UI_FONT, fontSize: 13 }}>
      <span style={{ fontWeight: 700 }}>Finder</span>
      {["File", "Edit", "View", "Go", "Window"].map((s) => <span key={s} style={{ opacity: 0.9 }}>{s}</span>)}
      <span style={{ flex: 1 }} />
      <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 8px", borderRadius: 5,
        background: active ? "rgba(255,255,255,0.22)" : flash > 0 ? `rgba(255,255,255,${0.3 * flash})` : "transparent",
        boxShadow: flash > 0 ? `0 0 ${18 * flash}px ${MODES[mode].accent}` : undefined }}>
        <ModeIcon mode={mode} size={14} color="#fff" /><span style={{ fontSize: 12, fontWeight: 600 }}>72%</span>
      </span>
      <Wifi size={15} strokeWidth={2.4} />
      <span style={{ opacity: 0.9 }}>Tue 9:41</span>
    </div>
  );
}

function TrafficLights() {
  return <div style={{ display: "flex", gap: 8 }}>{["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}</div>;
}

export interface Rule { app: string; when: string; mode: ModeKey; color: string; icon: ReactNode }

export function defaultRules(lang: Lang): Rule[] {
  return [
    { app: lang === "de" ? "Musik" : "Music", when: lang === "de" ? "im Vordergrund" : "foreground", mode: "immersion", color: "#ff375f", icon: <Music size={15} /> },
    { app: lang === "de" ? "Täglich 9:00-12:00" : "Daily 9:00-12:00", when: lang === "de" ? "Zeitfenster" : "schedule", mode: "quiet", color: "#5e5ce6", icon: <Moon size={15} /> },
  ];
}

export function zoomRule(lang: Lang): Rule {
  return { app: "Zoom", when: lang === "de" ? "im Vordergrund" : "foreground", mode: "aware", color: "#2d8cff", icon: <Video size={15} /> };
}

/// Earshift Settings → Automation. `ruleIn` 0..1 slides the new rule in.
export function MacSettingsAutomation({ lang, rules, newRule, ruleIn = 0, pressedAdd, highlight = 0 }: { lang: Lang; rules: Rule[]; newRule?: Rule; ruleIn?: number; pressedAdd?: boolean; highlight?: number }) {
  const de = lang === "de";
  const tabs = de ? ["Allgemein", "Klang", "Profile", "Automation", "Kurzbefehle", "Über"] : ["General", "Sound", "Profiles", "Automation", "Shortcuts", "About"];
  const row = (r: Rule, extra?: CSSProperties) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", ...extra }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: r.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{r.icon}</div>
      <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{r.app}</div><div style={{ fontSize: 11, opacity: 0.5 }}>{r.when}</div></div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: MODES[r.mode].tileFill, color: MODES[r.mode].light, fontSize: 12, fontWeight: 600 }}>
        <ModeIcon mode={r.mode} size={12} color={MODES[r.mode].light} />{MODES[r.mode].label}
      </div>
    </div>
  );
  const toggle = (on: boolean) => <div style={{ width: 34, height: 20, borderRadius: 10, background: on ? "#30d158" : "rgba(255,255,255,0.18)", position: "relative" }}><div style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: 8, background: "#fff" }} /></div>;
  return (
    <div style={{ width: 760, height: 520, borderRadius: 12, overflow: "hidden", background: "#1e1d22", color: "#fff", fontFamily: UI_FONT, display: "flex",
      border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 80px rgba(0,0,0,0.55)" }}>
      <div style={{ width: 190, background: "#17161a", padding: "14px 10px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <TrafficLights />
        <div style={{ marginTop: 22, display: "grid", gap: 2 }}>
          {tabs.map((t, i) => <div key={t} style={{ padding: "7px 10px", borderRadius: 7, fontSize: 13, background: i === 3 ? "#0a84ff" : "transparent", opacity: i === 3 ? 1 : 0.8 }}>{t}</div>)}
        </div>
      </div>
      <div style={{ flex: 1, padding: "18px 22px", overflow: "hidden" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Automation</div>
        <div style={{ marginTop: 14, fontSize: 11, fontWeight: 600, opacity: 0.55 }}>{de ? "Verhalten" : "Behavior"}</div>
        <div style={{ marginTop: 6, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", fontSize: 13 }}><span style={{ flex: 1 }}>{de ? "Automatikmodus" : "Automatic Mode"}</span>{toggle(false)}</div>
          <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", fontSize: 13, borderTop: "1px solid rgba(255,255,255,0.06)" }}><span style={{ flex: 1 }}>{de ? "Intelligentes Lernen" : "Smart Learning"}</span>{toggle(true)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.55 }}>{de ? "Regeln" : "Rules"}</div>
            <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>{de ? "Modus wechseln, wenn eine App aktiv wird oder in einem Zeitfenster." : "Switch mode when an app becomes active or during a time window."}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, background: pressedAdd ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)", fontSize: 12, fontWeight: 600, transform: pressedAdd ? "scale(0.95)" : undefined }}>
            <Plus size={13} />{de ? "Regel hinzufügen" : "Add Rule"}
          </div>
        </div>
        <div style={{ marginTop: 8, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          {newRule && ruleIn > 0 && (
            <div style={{ height: 51 * ruleIn, overflow: "hidden", opacity: ruleIn }}>
              {row(newRule, { borderTop: "none", background: `rgba(240,180,41,${0.14 * highlight})` })}
            </div>
          )}
          {rules.map((r, i) => <div key={r.app}>{row(r, i === 0 && !(newRule && ruleIn > 0) ? { borderTop: "none" } : undefined)}</div>)}
        </div>
      </div>
    </div>
  );
}

/// A generic video-call window ("Zoom" only as text, no logo).
export function CallWindow({ lang, speaking = 0, title = "Zoom" }: { lang: Lang; speaking?: number; title?: string }) {
  const people = [
    { n: "Lena", c: ["#f97316", "#7c2d12"] }, { n: "Jonas", c: ["#22c55e", "#14532d"] },
    { n: "Mara", c: ["#3b82f6", "#1e3a8a"] }, { n: lang === "de" ? "Du" : "You", c: ["#a855f7", "#4c1d95"] },
  ];
  return (
    <div style={{ width: 640, height: 420, borderRadius: 12, overflow: "hidden", background: "#111114", color: "#fff", fontFamily: UI_FONT,
      border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 34, display: "flex", alignItems: "center", gap: 12, padding: "0 12px", background: "#1c1c20" }}>
        <TrafficLights /><span style={{ flex: 1, textAlign: "center", fontSize: 12.5, fontWeight: 600, opacity: 0.8, marginRight: 52 }}>{title} · {lang === "de" ? "Team-Call" : "Team call"}</span>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: 6 }}>
        {people.map((p, i) => (
          <div key={p.n} style={{ position: "relative", borderRadius: 8, overflow: "hidden", background: `linear-gradient(140deg, ${p.c[0]}55, ${p.c[1]}aa)`,
            boxShadow: i === 0 ? `inset 0 0 0 ${2 + 2 * speaking}px rgba(48,209,88,${0.4 + 0.6 * speaking})` : undefined, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: `linear-gradient(140deg, ${p.c[0]}, ${p.c[1]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700 }}>{p.n[0]}</div>
            <div style={{ position: "absolute", left: 10, bottom: 8, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.45)", padding: "3px 8px", borderRadius: 6 }}>
              {i === 2 ? <MicOff size={11} color="#ff453a" /> : <Mic size={11} />}{p.n}
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, background: "#1c1c20" }}>
        <div style={{ width: 38, height: 38, borderRadius: 19, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Mic size={18} /></div>
        <div style={{ width: 38, height: 38, borderRadius: 19, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><VideoOff size={18} /></div>
        <div style={{ width: 54, height: 38, borderRadius: 19, background: "#ff453a", display: "flex", alignItems: "center", justifyContent: "center" }}><PhoneOff size={18} /></div>
      </div>
    </div>
  );
}

export function PhoneFrame({ children, scale = 1 }: { children: ReactNode; scale?: number }) {
  return (
    <div style={{ width: 414 * scale, height: 868 * scale, borderRadius: 64 * scale, padding: 12 * scale, boxSizing: "border-box",
      background: "linear-gradient(145deg, #4a4a52, #16161a 38%, #2c2c33 70%, #4a4a52)", boxShadow: `0 ${40 * scale}px ${90 * scale}px rgba(0,0,0,0.6), inset 0 0 0 ${1.5 * scale}px rgba(255,255,255,0.12)` }}>
      <div style={{ width: 390 * scale, height: 844 * scale, borderRadius: 52 * scale, overflow: "hidden", position: "relative", background: "#000" }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 390, height: 844 }}>{children}</div>
        <div style={{ position: "absolute", top: 11 * scale, left: "50%", marginLeft: -62 * scale, width: 124 * scale, height: 36 * scale, borderRadius: 20 * scale, background: "#000" }} />
      </div>
    </div>
  );
}

export const MAC_WALLPAPER = "radial-gradient(90% 90% at 70% 10%, #2c2470 0%, #120f2a 50%, #06050c 100%)";

/// A Mac screen crop: wallpaper + menu bar, children are positioned freely inside.
export function MacScreen({ width, height, mode, children, menuActive = true, flash = 0 }: { width: number; height: number; mode: ModeKey; children?: ReactNode; menuActive?: boolean; flash?: number }) {
  return (
    <div style={{ width, height, position: "relative", overflow: "hidden", borderRadius: 16, background: MAC_WALLPAPER,
      boxShadow: "0 40px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)" }}>
      <MenuBar mode={mode} width={width} active={menuActive} flash={flash} />
      {children}
    </div>
  );
}
