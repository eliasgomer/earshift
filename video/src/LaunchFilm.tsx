// Scenes: cold open → one click (Mac + iPhone) → Control Center → automation
// (Zoom → Aware) → three designs → widgets → outro. Timing lives in timeline.json;
// scripts/make-soundtrack.py renders the matching audio from the same file.

import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, interpolateColors, random, spring,
  staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { Bell } from "lucide-react";
import {
  CallWindow, ControlCenter, LockScreen, MacPopover, MacScreen, MacSettingsAutomation, ModeIcon,
  PhoneApp, PhoneFrame, SKIN_LABEL, Widget, defaultRules, zoomRule, type Skin, type WidgetProps,
} from "../../src/ui/AppUI";
import { MODES, type Lang, type ModeKey } from "../../src/ui/modes";
import { resolveTimeline, type Durations, type Resolved } from "./timeline";

export interface LaunchFilmProps { lang: Lang; durations?: Durations; voice?: boolean; [key: string]: unknown }

const MONO = '"Geist Mono Variable", ui-monospace, monospace';
const SANS = '"Geist Variable", -apple-system, sans-serif';
const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);

const C = {
  words: { de: ["Bahn.", "Büro.", "Café.", "Zu laut."], en: ["Trains.", "Offices.", "Cafés.", "Too loud."] },
  click: { de: ["01 · Mac", "Ein Klick.", "Ruhe."], en: ["01 · Mac", "One click.", "Silence."] },
  cc: { de: ["02 · iPhone", "Kontrollzentrum.", "Immersion.", "Auch per Widget, Sperrbildschirm, Aktionstaste und Siri."], en: ["02 · iPhone", "Control Center.", "Immersion.", "Also from widgets, the Lock Screen, the Action Button and Siri."] },
  auto: { de: ["03 · Automatisch", "Zoom öffnet.", "Aware schaltet selbst.", "Regel: Zoom → Aware"], en: ["03 · Automatic", "Zoom opens.", "Aware switches itself.", "Rule: Zoom → Aware"] },
  toast: { de: ["Earshift", "Zoom aktiv - Modus Aware"], en: ["Earshift", "Zoom is active - Aware mode"] },
  designs: { de: ["04 · Designs", "Drei Designs.", "Deine Wahl."], en: ["04 · Designs", "Three designs.", "Your call."] },
  widgets: { de: ["05 · Widgets", "Dein Widget.", "Deine Regeln."], en: ["05 · Widgets", "Your widget.", "Your rules."] },
  opts: { de: ["Größe", "Design", "Akzent", "Beschriftung", "Inhalt"], en: ["Size", "Design", "Accent", "Labels", "Content"] },
  outro: { de: ["Hörmodi mit einem Tipp.", "7 Tage gratis", "dann 3,99 € einmalig", "iPhone · iPad · Mac"], en: ["Listening modes in one tap.", "7 days free", "then €3.99 once", "iPhone · iPad · Mac"] },
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (f: number, a: number, b: number, from = 0, to = 1, e = EASE) => interpolate(f, [a, b], [from, to], { ...clamp, easing: e });

function modeAt(tl: Resolved, f: number): ModeKey {
  let m = tl.modes[0].mode;
  for (const c of tl.modes) if (f >= c.at) m = c.mode;
  return m;
}
function accentAt(tl: Resolved, f: number): string {
  for (let i = tl.modes.length - 1; i > 0; i--) {
    const c = tl.modes[i];
    if (f >= c.at) return interpolateColors(ease(f, c.at, c.at + 20), [0, 1], [MODES[tl.modes[i - 1].mode].accent, MODES[c.mode].accent]);
  }
  return MODES[tl.modes[0].mode].accent;
}
function noiseAt(tl: Resolved, f: number) {
  const lv = (m: ModeKey) => (m === "aware" ? 1 : m === "immersion" ? 0.18 : 0.05);
  for (let i = tl.modes.length - 1; i > 0; i--) {
    const c = tl.modes[i];
    if (f >= c.at) return interpolate(f, [c.at, c.at + 18], [lv(tl.modes[i - 1].mode), lv(c.mode)], clamp);
  }
  return lv(tl.modes[0].mode);
}

// ─── shared pieces ───────────────────────────────────────────────────────────

function Waveform({ tl, frame, width, height, color, bars = 120, gain = 1 }: { tl: Resolved; frame: number; width: number; height: number; color: string; bars?: number; gain?: number }) {
  const noise = noiseAt(tl, frame);
  const musical = modeAt(tl, frame) === "immersion" ? 1 : 0;
  const bw = width / bars;
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      {Array.from({ length: bars }, (_, i) => {
        const x = i / bars, env = Math.sin(Math.PI * x) ** 0.6, step = Math.floor(frame / 2);
        const r1 = random(`w${i}-${step}`), r2 = random(`w${i}-${step + 1}`);
        const jitter = r1 + (r2 - r1) * ((frame % 2) / 2);
        const chaos = (0.25 + 0.75 * jitter) * (0.6 + 0.4 * Math.sin(i * 0.9 + frame * 0.35));
        const calm = 0.04 + 0.025 * Math.sin(i * 0.25 + frame * 0.12);
        const music = 0.16 + 0.3 * Math.abs(Math.sin(i * 0.11 + frame * 0.07)) * (0.6 + 0.4 * Math.sin(i * 0.05 - frame * 0.05));
        const base = calm + (chaos - calm) * noise;
        const v = (base + (music - base) * musical) * env * gain;
        const h = Math.max(3, v * height);
        return <rect key={i} x={i * bw + bw * 0.24} y={(height - h) / 2} width={bw * 0.52} height={h} rx={bw * 0.26} fill={color} opacity={0.3 + 0.7 * env} />;
      })}
    </svg>
  );
}

function Cursor({ x, y, pressed }: { x: number; y: number; pressed: boolean }) {
  return (
    <svg width="36" height="42" viewBox="0 0 17 20" style={{ position: "absolute", left: x - 4, top: y - 2, transform: `scale(${pressed ? 0.86 : 1})`, transformOrigin: "4px 2px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.55))", zIndex: 30 }}>
      <path d="M1.5 1.2v14.6l3.7-3.4 2.4 5.6 2.6-1.1-2.3-5.5h5.1z" fill="#fff" stroke="#000" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function Finger({ x, y, frame, from, press }: { x: number; y: number; frame: number; from: number; press: number }) {
  if (frame < from || frame > press + 26) return null;
  const pressed = frame >= press && frame < press + 6;
  const op = ease(frame, from, from + 8) * (1 - ease(frame, press + 14, press + 26));
  return <div style={{ position: "absolute", left: x - 36, top: y - 36, width: 72, height: 72, borderRadius: 36, background: "rgba(255,255,255,0.32)", border: "2px solid rgba(255,255,255,0.85)", opacity: op, transform: `scale(${pressed ? 0.78 : 1})`, zIndex: 30 }} />;
}

function Ripple({ x, y, frame, at, color, size = 220 }: { x: number; y: number; frame: number; at: number; color: string; size?: number }) {
  if (frame < at || frame > at + 34) return null;
  return (
    <>{[0, 8].map((d) => {
      if (frame < at + d) return null;
      const t = ease(frame, at + d, at + d + 26), s = size * t;
      return <div key={d} style={{ position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: "50%", border: `3px solid ${color}`, opacity: 1 - t, zIndex: 29 }} />;
    })}</>
  );
}

/// Lower-left caption: mono label, title, accent word that reveals with blur.
function Caption({ frame, dur, label, title, accent, accentAt, sub, color, x = 120, bottom = 120, size = 76 }: {
  frame: number; dur: number; label: string; title: string; accent?: string; accentAt?: number; sub?: string; color: string; x?: number; bottom?: number; size?: number;
}) {
  const inT = ease(frame, 10, 34), out = ease(frame, dur - 16, dur - 2);
  const acc = accentAt == null ? inT : ease(frame, accentAt, accentAt + 18);
  const mask = (t: number, children: ReactNode, style?: CSSProperties) => (
    <div style={{ overflow: "hidden", paddingBottom: 6 }}><div style={{ transform: `translateY(${(1 - t) * 105}%)`, ...style }}>{children}</div></div>
  );
  return (
    <div style={{ position: "absolute", left: x, bottom, opacity: 1 - out, color: "#fff", zIndex: 40, maxWidth: 820 }}>
      {mask(inT, <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 14 }}><span style={{ width: 36, height: 1.5, background: color }} />{label}</div>)}
      {mask(ease(frame, 14, 40), <div style={{ fontFamily: SANS, fontSize: size, fontWeight: 650, letterSpacing: -2.5, lineHeight: 1.02, marginTop: 14 }}>{title}</div>)}
      {accent && mask(acc, <div style={{ fontFamily: SANS, fontSize: size, fontWeight: 650, letterSpacing: -2.5, lineHeight: 1.02, color, filter: `blur(${(1 - acc) * 10}px)` }}>{accent}</div>)}
      {sub && <div style={{ fontFamily: SANS, fontSize: 26, color: "rgba(255,255,255,0.55)", marginTop: 20, maxWidth: 640, opacity: ease(frame, 40, 60) }}>{sub}</div>}
    </div>
  );
}

/// Scene wrapper: soft scale/opacity in and out.
function SceneShell({ children, dur, inFrames = 14, outFrames = 12 }: { children: ReactNode; dur: number; inFrames?: number; outFrames?: number }) {
  const f = useCurrentFrame();
  const i = ease(f, 0, inFrames), o = ease(f, dur - outFrames, dur, 0, 1, EASE_IO);
  return <AbsoluteFill style={{ opacity: i * (1 - o), transform: `scale(${1.035 - 0.035 * i - 0.03 * o})` }}>{children}</AbsoluteFill>;
}

// ─── scenes ──────────────────────────────────────────────────────────────────

function SceneOpen({ tl, lang }: { tl: Resolved; lang: Lang }) {
  const f = useCurrentFrame();
  const t0 = tl.start.open, dur = tl.dur.open;
  const words = C.words[lang];
  const local = tl.words.map((w) => w - t0);
  let idx = -1;
  local.forEach((w, i) => { if (f >= w) idx = i; });
  const last = idx === words.length - 1;
  return (
    <SceneShell dur={dur} inFrames={4}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: 560, left: 160, opacity: ease(f, 0, 16) }}>
          <Waveform tl={tl} frame={t0 + f} width={1600} height={300} color="#fff" bars={140} gain={ease(f, 0, 24, 0.3, 1)} />
        </div>
        {idx >= 0 && (() => {
          const at = local[idx], t = ease(f, at, at + 14);
          return (
            <div key={idx} style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 700,
              fontSize: last ? 220 : 190, letterSpacing: last ? -9 : -7, color: "#fff", opacity: t, filter: `blur(${(1 - t) * 14}px)`, transform: `scale(${1.18 - 0.18 * t})` }}>
              {words[idx]}
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneShell>
  );
}

function SceneClick({ tl, lang }: { tl: Resolved; lang: Lang }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = tl.start.click, dur = tl.dur.click, abs = t0 + f;
  const mode = modeAt(tl, abs);
  const phoneMode = modeAt(tl, f >= 108 && f < 124 ? t0 + 100 : abs);
  const color = accentAt(tl, abs);
  const enter = spring({ frame: f, fps, config: { damping: 22, stiffness: 70 } });
  const rotY = interpolate(f, [0, dur], [-9, -2.5]);
  const rotX = interpolate(f, [0, dur], [7, 2.5]);
  const dolly = interpolate(f, [0, dur], [0.94, 1.0]);
  const MS = 1.18, macX = 90, macY = 110, popX = 650, popY = 32;
  const target = { x: macX + (popX + 62) * MS, y: macY + (popY + 82) * MS };
  const cur = ease(f, 22, 96);
  const cx = interpolate(cur, [0, 1], [macX + 380 * MS, target.x]);
  const cy = interpolate(cur, [0, 1], [macY + 470 * MS, target.y]) - Math.sin(cur * Math.PI) * 70;
  const pressed = f >= 100 && f < 106 ? ("quiet" as const) : undefined;
  const sweep = ease(f, 108, 150);
  return (
    <SceneShell dur={dur}>
      <AbsoluteFill style={{ perspective: 2600 }}>
        <AbsoluteFill style={{ transform: `translateY(${(1 - enter) * 120}px) scale(${dolly}) rotateY(${rotY}deg) rotateX(${rotX}deg)`, transformStyle: "preserve-3d", opacity: enter }}>
          <div style={{ position: "absolute", left: macX, top: macY, transform: `scale(${MS})`, transformOrigin: "top left" }}>
            <MacScreen width={1000} height={620} mode={mode}>
              <div style={{ position: "absolute", left: popX, top: popY }}>
                <MacPopover skin="glass" mode={mode} lang={lang} pressed={pressed} hover={f > 86 && f < 108 ? "quiet" : undefined} />
              </div>
              {sweep > 0 && sweep < 1 && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${sweep * 140 - 40}%, ${MODES.quiet.light}33 ${sweep * 140 - 20}%, transparent ${sweep * 140}%)` }} />}
            </MacScreen>
          </div>
          <div style={{ position: "absolute", left: 1400, top: 150, transform: "translateZ(80px)" }}>
            <PhoneFrame scale={0.74}><PhoneApp skin="signal" mode={phoneMode} lang={lang} /></PhoneFrame>
          </div>
          <Ripple x={target.x} y={target.y} frame={f} at={104} color={MODES.quiet.light} />
          {f >= 14 && f < 170 && <div style={{ opacity: 1 - ease(f, 150, 170) }}><Cursor x={cx} y={cy} pressed={!!pressed} /></div>}
        </AbsoluteFill>
      </AbsoluteFill>
      <Caption frame={f} dur={dur} label={C.click[lang][0]} title={C.click[lang][1]} accent={C.click[lang][2]} accentAt={108} color={color} bottom={70} size={64} x={120} />
    </SceneShell>
  );
}

function SceneCC({ tl, lang }: { tl: Resolved; lang: Lang }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = tl.start.cc, dur = tl.dur.cc, abs = t0 + f;
  const mode = modeAt(tl, abs);
  const color = accentAt(tl, abs);
  const enter = spring({ frame: f, fps, config: { damping: 20, stiffness: 80 } });
  const open = ease(f, 28, 56);
  const scale = 1.0, px = 1120, py = 106 - (1 - enter) * 60;
  const tap = { x: px + (12 + 106) * scale, y: py + (12 + 582) * scale };
  return (
    <SceneShell dur={dur}>
      <AbsoluteFill style={{ perspective: 2400 }}>
        <div style={{ position: "absolute", left: px, top: py, opacity: enter, transform: `rotateY(${interpolate(f, [0, dur], [10, 4])}deg)` }}>
          <PhoneFrame scale={scale}>
            <div style={{ position: "relative", width: 390, height: 844 }}>
              <div style={{ position: "absolute", inset: 0 }}><LockScreen mode={mode} lang={lang} /></div>
              <div style={{ position: "absolute", inset: 0, opacity: open > 0 ? 1 : 0 }}><ControlCenter mode={mode} lang={lang} open={open} pressed={f >= 100 && f < 106 ? "immersion" : undefined} /></div>
            </div>
          </PhoneFrame>
        </div>
        <Finger x={tap.x} y={tap.y} frame={f} from={84} press={100} />
        <Ripple x={tap.x} y={tap.y} frame={f} at={104} color={MODES.immersion.light} size={180} />
        {/* the Mac follows: small menu bar strip */}
        <div style={{ position: "absolute", left: 120, top: 120, opacity: ease(f, 20, 40), display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 18, color: "rgba(255,255,255,0.5)", letterSpacing: 3 }}>
          MAC
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "#fff", letterSpacing: 0, fontFamily: SANS, fontWeight: 600, boxShadow: f > 116 && f < 150 ? `0 0 30px ${color}` : undefined }}>
            <ModeIcon mode={modeAt(tl, f >= 110 && f < 118 ? t0 + 100 : abs)} size={20} color="#fff" /> 72%
          </div>
        </div>
      </AbsoluteFill>
      <Caption frame={f} dur={dur} label={C.cc[lang][0]} title={C.cc[lang][1]} accent={C.cc[lang][2]} accentAt={110} sub={C.cc[lang][3]} color={color} x={120} bottom={300} size={92} />
    </SceneShell>
  );
}

function SceneAuto({ tl, lang }: { tl: Resolved; lang: Lang }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = tl.start.auto, dur = tl.dur.auto, abs = t0 + f;
  const mode = modeAt(tl, abs);
  const color = accentAt(tl, abs);
  const MS = 1.25, sx = 185, sy = 80;
  const settingsOut = ease(f, 132, 152, 0, 1, EASE_IO);
  const callIn = spring({ frame: f - 150, fps, config: { damping: 18, stiffness: 110 } });
  const flash = f >= 205 ? Math.max(0, 1 - (f - 205) / 40) : 0;
  const addBtn = { x: sx + (190 + 22 + 410) * MS, y: sy + (28 + 205) * MS };
  const cur = ease(f, 6, 36);
  const toast = spring({ frame: f - 212, fps, config: { damping: 16, stiffness: 120 } });
  return (
    <SceneShell dur={dur}>
      <div style={{ position: "absolute", left: sx, top: sy, transform: `scale(${MS})`, transformOrigin: "top left" }}>
        <MacScreen width={1240} height={720} mode={mode} menuActive={false} flash={flash}>
          {settingsOut < 1 && (
            <div style={{ position: "absolute", left: 240, top: 90, opacity: 1 - settingsOut, transform: `scale(${1 - 0.08 * settingsOut}) translateY(${settingsOut * 30}px)` }}>
              <MacSettingsAutomation lang={lang} rules={defaultRules(lang)} newRule={zoomRule(lang)} ruleIn={ease(f, 52, 74)} pressedAdd={f >= 40 && f < 46} highlight={ease(f, 74, 84) * (1 - ease(f, 110, 130))} />
            </div>
          )}
          {f >= 148 && (
            <div style={{ position: "absolute", left: 300, top: 130, opacity: callIn, transform: `scale(${0.86 + 0.14 * callIn})`, transformOrigin: "center" }}>
              <CallWindow lang={lang} speaking={f > 170 ? 0.5 + 0.5 * Math.sin(f * 0.4) : 0} />
            </div>
          )}
          {f >= 212 && (
            <div style={{ position: "absolute", right: 14, top: 40, width: 340, padding: "12px 14px", borderRadius: 14, background: "rgba(40,38,48,0.96)", border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)", display: "flex", gap: 12, alignItems: "center", color: "#fff", transform: `translateX(${(1 - toast) * 380}px)`, fontFamily: SANS }}>
              <Img src={staticFile("icon.png")} style={{ width: 36, height: 36, borderRadius: 9 }} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{C.toast[lang][0]}</div><div style={{ fontSize: 12.5, opacity: 0.75 }}>{C.toast[lang][1]}</div></div>
              <Bell size={14} opacity={0.5} />
            </div>
          )}
        </MacScreen>
      </div>
      {f < 60 && <Cursor x={interpolate(cur, [0, 1], [addBtn.x - 300, addBtn.x])} y={interpolate(cur, [0, 1], [addBtn.y + 220, addBtn.y]) - Math.sin(cur * Math.PI) * 40} pressed={f >= 40 && f < 46} />}
      {f >= 60 && f < 140 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: "#fff", opacity: ease(f, 66, 80) * (1 - ease(f, 126, 140)) }}>
          {C.auto[lang][3]}
        </div>
      )}
      {f >= 150 && <Caption frame={f - 150} dur={dur - 150} label={C.auto[lang][0]} title={C.auto[lang][1]} accent={C.auto[lang][2]} accentAt={55} color={color} x={110} bottom={70} size={58} />}
    </SceneShell>
  );
}

function SceneDesigns({ tl, lang }: { tl: Resolved; lang: Lang }) {
  const f = useCurrentFrame();
  const t0 = tl.start.designs, dur = tl.dur.designs, abs = t0 + f;
  const mode = modeAt(tl, abs);
  const skins: Skin[] = ["glass", "studio", "signal"];
  const seg = (dur - 20) / 3;
  const idx = Math.min(2, Math.floor(Math.max(0, f - 10) / seg));
  const layer = (s: Skin, i: number) => {
    const at = 10 + i * seg;
    const r = i === 0 ? 1 : ease(f, at, at + 18, 0, 1, EASE_IO);
    if (f < at && i > 0) return null;
    return (
      <AbsoluteFill key={s} style={{ clipPath: `circle(${r * 130}% at 50% 55%)` }}>
        <AbsoluteFill style={{ background: s === "studio" ? "#060606" : s === "signal" ? "#0b0a16" : "#121216" }} />
        <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontSize: 330, fontWeight: 800, letterSpacing: -14,
          color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.09)" }}>{SKIN_LABEL[s]}</div>
        <div style={{ position: "absolute", left: 560, top: 190, transform: `translateY(${(1 - ease(f, at, at + 26)) * 40}px)` }}>
          <div style={{ transform: "scale(1.3)", transformOrigin: "top left" }}><MacPopover skin={s} mode={mode} lang={lang} /></div>
        </div>
        <div style={{ position: "absolute", left: 1100, top: 130, transform: `translateY(${(1 - ease(f, at + 4, at + 30)) * 60}px)` }}>
          <PhoneFrame scale={0.86}><PhoneApp skin={s} mode={mode} lang={lang} /></PhoneFrame>
        </div>
      </AbsoluteFill>
    );
  };
  return (
    <SceneShell dur={dur}>
      {skins.map(layer)}
      <div style={{ position: "absolute", left: 120, top: 120, zIndex: 40 }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 36, height: 1.5, background: MODES.quiet.accent }} />{C.designs[lang][0]}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 26 }}>
          {skins.map((s, i) => (
            <div key={s} style={{ fontFamily: SANS, fontSize: 64, fontWeight: 650, letterSpacing: -2, color: i === idx ? "#fff" : "rgba(255,255,255,0.22)", transform: `translateX(${i === idx ? 0 : -6}px)` }}>
              {SKIN_LABEL[s]}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 120, bottom: 90, fontFamily: SANS, fontSize: 30, color: "rgba(255,255,255,0.6)", zIndex: 40 }}>
        {C.designs[lang][1]} <span style={{ color: "#fff" }}>{C.designs[lang][2]}</span>
      </div>
    </SceneShell>
  );
}

const WIDGET_STEPS: (Partial<WidgetProps> & { opt: number; tag: Record<Lang, string> })[] = [
  { size: "medium", opt: 0, tag: { de: "Mittel", en: "Medium" } },
  { size: "small", opt: 0, tag: { de: "Klein", en: "Small" } },
  { size: "large", opt: 0, tag: { de: "Groß", en: "Large" } },
  { size: "medium", design: "glass", opt: 1, tag: { de: "Glass", en: "Glass" } },
  { size: "medium", design: "studio", opt: 1, tag: { de: "Studio", en: "Studio" } },
  { size: "medium", design: "signal", accent: "pink", opt: 2, tag: { de: "Pink", en: "Pink" } },
  { size: "medium", design: "signal", accent: "green", opt: 2, tag: { de: "Grün", en: "Green" } },
  { size: "medium", design: "glass", accent: "orange", label: "iconOnly", opt: 3, tag: { de: "Nur Symbole", en: "Icons only" } },
  { size: "small", design: "studio", layout: "battery", opt: 4, tag: { de: "Akku", en: "Battery" } },
  { size: "medium", design: "signal", accent: "blue", layout: "focus", opt: 4, tag: { de: "Fokus", en: "Focus" } },
];

function SceneWidgets({ tl, lang }: { tl: Resolved; lang: Lang }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = tl.start.widgets, dur = tl.dur.widgets, abs = t0 + f;
  const mode = modeAt(tl, abs);
  const step = Math.max(14, Math.floor((dur - 40) / WIDGET_STEPS.length));
  const i = Math.min(WIDGET_STEPS.length - 1, Math.max(0, Math.floor((f - 16) / step)));
  const at = 16 + i * step;
  const pop = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 180 } });
  const s = WIDGET_STEPS[i];
  const scale = s.size === "large" ? 1.55 : s.size === "small" ? 2.0 : 1.9;
  const accent = s.accent && s.accent !== "app" ? { pink: "#ff375f", green: "#30d158", orange: "#ff9f0a", blue: "#0a84ff" }[s.accent as "pink"] : MODES[mode].accent;
  return (
    <SceneShell dur={dur}>
      <AbsoluteFill style={{ background: `radial-gradient(40% 50% at 66% 52%, ${accent}33, transparent 70%)` }} />
      <div style={{ position: "absolute", left: 1180, top: 540, transform: `translate(-50%, -50%) scale(${scale * (0.9 + 0.1 * pop)})`, opacity: 0.4 + 0.6 * pop }}>
        <Widget mode={mode} lang={lang} {...s} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 150 }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 36, height: 1.5, background: accent }} />{C.widgets[lang][0]}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 84, fontWeight: 650, letterSpacing: -2.5, color: "#fff", marginTop: 16, lineHeight: 1.02 }}>{C.widgets[lang][1]}<br /><span style={{ color: accent }}>{C.widgets[lang][2]}</span></div>
        <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 14 }}>
          {C.opts[lang].map((o, k) => (
            <div key={o} style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: SANS, fontSize: 30, color: k === s.opt ? "#fff" : "rgba(255,255,255,0.28)" }}>
              <span style={{ fontFamily: MONO, fontSize: 16, width: 30, color: k === s.opt ? accent : "rgba(255,255,255,0.28)" }}>0{k + 1}</span>
              {o}
              {k === s.opt && <span style={{ fontFamily: MONO, fontSize: 18, padding: "4px 12px", borderRadius: 999, border: `1px solid ${accent}`, color: accent, opacity: pop }}>{s.tag[lang]}</span>}
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
}

function SceneOutro({ tl, lang }: { tl: Resolved; lang: Lang }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = tl.dur.outro;
  const s = spring({ frame: f - 8, fps, config: { damping: 13, stiffness: 100 } });
  const c = C.outro[lang];
  const fadeOut = ease(f, dur - 14, dur);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: SANS, opacity: 1 - fadeOut }}>
      <div style={{ position: "absolute", width: 940, height: 940, borderRadius: "50%", background: `conic-gradient(from ${f * 2}deg, ${MODES.quiet.accent}, ${MODES.immersion.accent}, ${MODES.aware.accent}, ${MODES.quiet.accent})`, opacity: 0.16 * s, transform: `scale(${0.6 + 0.4 * s})` }} />
      <div style={{ position: "absolute", width: 860, height: 860, borderRadius: "50%", background: "radial-gradient(circle, #07060b 62%, #07060bcc 100%)", transform: `scale(${0.6 + 0.4 * s})` }} />
      <Img src={staticFile("icon.png")} style={{ position: "relative", width: 190, height: 190, borderRadius: 43, transform: `scale(${0.5 + 0.5 * s}) rotate(${(1 - s) * -60}deg)`, opacity: s, boxShadow: "0 30px 80px rgba(124,108,245,0.35)" }} />
      <div style={{ position: "relative", fontSize: 110, fontWeight: 700, letterSpacing: -4, marginTop: 30, opacity: ease(f, 14, 30), transform: `translateY(${(1 - ease(f, 14, 36)) * 30}px)` }}>Earshift</div>
      <div style={{ position: "relative", fontSize: 34, color: "rgba(255,255,255,0.7)", marginTop: 6, opacity: ease(f, 24, 40) }}>{c[0]}</div>
      <div style={{ position: "relative", display: "flex", gap: 16, marginTop: 38, opacity: ease(f, 34, 50), fontFamily: MONO, fontSize: 22, letterSpacing: 2, textTransform: "uppercase" }}>
        <span style={{ padding: "12px 22px", borderRadius: 999, background: "#fff", color: "#07060b" }}>{c[1]}</span>
        <span style={{ padding: "12px 22px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)" }}>{c[2]}</span>
        <span style={{ padding: "12px 22px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.7)" }}>{c[3]}</span>
      </div>
    </AbsoluteFill>
  );
}

// ─── composition ─────────────────────────────────────────────────────────────

export function LaunchFilm({ lang, durations, voice }: LaunchFilmProps) {
  const frame = useCurrentFrame();
  const tl = resolveTimeline(durations);
  const accent = accentAt(tl, frame);
  const drift = Math.sin(frame / 90) * 8;
  const S = (id: keyof Resolved["start"], el: ReactNode) => (
    <Sequence key={id} from={tl.start[id]} durationInFrames={tl.dur[id]} layout="none">{el}</Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#06050a", overflow: "hidden" }}>
      <Audio src={staticFile(voice ? `soundtrack-narrated-${lang}.wav` : "soundtrack.wav")} />
      <AbsoluteFill style={{ background: `radial-gradient(60% 55% at ${50 + drift}% 0%, ${accent}40 0%, transparent 70%), radial-gradient(45% 45% at ${85 - drift}% 100%, ${accent}1f 0%, transparent 70%)` }} />
      {S("open", <SceneOpen tl={tl} lang={lang} />)}
      {S("click", <SceneClick tl={tl} lang={lang} />)}
      {S("cc", <SceneCC tl={tl} lang={lang} />)}
      {S("auto", <SceneAuto tl={tl} lang={lang} />)}
      {S("designs", <SceneDesigns tl={tl} lang={lang} />)}
      {S("widgets", <SceneWidgets tl={tl} lang={lang} />)}
      {S("outro", <SceneOutro tl={tl} lang={lang} />)}
      <AbsoluteFill style={{ pointerEvents: "none", boxShadow: "inset 0 0 260px rgba(0,0,0,0.75)" }} />
      <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.06, mixBlendMode: "overlay" }}>
        <svg width="1920" height="1080"><filter id="g2"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 10} /></filter><rect width="1920" height="1080" filter="url(#g2)" /></svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
