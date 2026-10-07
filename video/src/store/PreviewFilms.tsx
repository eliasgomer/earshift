// App previews (15-30 s) per device: the app full screen, as in a screen recording.
// Audio: scripts/make-preview-audio.py renders public/preview-<device>.wav from PREVIEW_SPECS.

import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  CallWindow, ControlCenter, LockScreen, MacPopover, MacScreen, MacSettingsAutomation, PhoneApp, defaultRules, zoomRule, type Skin,
} from "../../../src/ui/AppUI";
import type { Lang, ModeKey } from "../../../src/ui/modes";
import { IPAD, IPadApp } from "./StoreUI";
import specs from "./preview-specs.json";

type Spec = { duration: number; modes: [number, ModeKey][]; taps: number[] };
export const PREVIEW_SPECS = specs as unknown as Record<"iphone" | "ipad" | "mac", Spec>;

const SANS = '"Geist Variable", -apple-system, sans-serif';
const E = Easing.bezier(0.16, 1, 0.3, 1);
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: E });

function modeAt(spec: Spec, f: number): ModeKey {
  let m = spec.modes[0][1];
  for (const [at, mode] of spec.modes) if (f >= at) m = mode;
  return m;
}

function Touch({ x, y, f, at, size = 90 }: { x: number; y: number; f: number; at: number; size?: number }) {
  if (f < at - 14 || f > at + 22) return null;
  const pressed = f >= at && f < at + 6;
  const op = ease(f, at - 14, at - 6) * (1 - ease(f, at + 10, at + 22));
  return <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size, background: "rgba(255,255,255,0.35)", border: "3px solid rgba(255,255,255,0.9)", opacity: op, transform: `scale(${pressed ? 0.8 : 1})` }} />;
}

function Pointer({ x, y, pressed }: { x: number; y: number; pressed: boolean }) {
  return (
    <svg width="34" height="40" viewBox="0 0 17 20" style={{ position: "absolute", left: x - 4, top: y - 2, transform: `scale(${pressed ? 0.86 : 1})`, transformOrigin: "4px 2px", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.5))" }}>
      <path d="M1.5 1.2v14.6l3.7-3.4 2.4 5.6 2.6-1.1-2.3-5.5h5.1z" fill="#fff" stroke="#000" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function Label({ f, from, to, text, bottom = 70, size = 40 }: { f: number; from: number; to: number; text: string; bottom?: number; size?: number }) {
  const op = ease(f, from, from + 12) * (1 - ease(f, to - 10, to));
  if (op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom, display: "flex", justifyContent: "center", opacity: op, transform: `translateY(${(1 - ease(f, from, from + 14)) * 20}px)` }}>
      <div style={{ padding: `${size * 0.45}px ${size * 0.9}px`, borderRadius: 999, background: "rgba(10,9,16,0.88)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontFamily: SANS, fontSize: size, fontWeight: 600, letterSpacing: -0.5 }}>{text}</div>
    </div>
  );
}

const L = {
  tap: { de: "Ein Tipp: Quiet", en: "One tap: Quiet" },
  lock: { de: "Vom Sperrbildschirm", en: "From the Lock Screen" },
  cc: { de: "Aus dem Kontrollzentrum", en: "From Control Center" },
  designs: { de: "Drei Designs", en: "Three designs" },
  click: { de: "Ein Klick: Quiet", en: "One click: Quiet" },
  rule: { de: "Regel: Zoom → Aware", en: "Rule: Zoom → Aware" },
  auto: { de: "Zoom öffnet - Aware schaltet selbst", en: "Zoom opens - Aware switches itself" },
  immersion: { de: "Immersion für Musik", en: "Immersion for music" },
};

function skinAt(f: number, from: number, step: number): Skin {
  const order: Skin[] = ["glass", "studio", "signal"];
  return order[Math.min(2, Math.max(0, Math.floor((f - from) / step)))];
}

// ─── iPhone (886×1920 = 390×844 pt × 2.272) ──────────────────────────────────

export function IPhonePreview({ lang }: { lang: Lang }) {
  const f = useCurrentFrame();
  const spec = PREVIEW_SPECS.iphone;
  const mode = modeAt(spec, f);
  const k = 886 / 390;
  const [tQuiet, tLock, tCC] = spec.taps;
  let screen: ReactNode;
  if (f < 210) screen = <PhoneApp skin="signal" mode={mode} lang={lang} pressed={f >= tQuiet && f < tQuiet + 6 ? "quiet" : undefined} />;
  else if (f < 390) screen = <LockScreen mode={mode} lang={lang} pressed={f >= tLock && f < tLock + 6 ? "immersion" : undefined} />;
  else if (f < 570) screen = <ControlCenter mode={mode} lang={lang} open={ease(f, 400, 424)} pressed={f >= tCC && f < tCC + 6 ? "aware" : undefined} />;
  else screen = <PhoneApp skin={skinAt(f, 570, 70)} mode={mode} lang={lang} />;
  const cut = (a: number) => 1 - ease(f, a - 8, a) + ease(f, a, a + 8);
  const fade = Math.min(cut(210), cut(390), cut(570), ease(f, 0, 8), 1 - ease(f, spec.duration - 12, spec.duration));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("preview-iphone.wav")} />
      <AbsoluteFill style={{ opacity: fade }}><div style={{ width: 390, height: 844, transform: `scale(${k})`, transformOrigin: "top left" }}>{screen}</div></AbsoluteFill>
      <Touch x={80 * k} y={246 * k} f={f} at={tQuiet} />
      <Touch x={287 * k} y={261 * k} f={f} at={tLock} size={70} />
      <Touch x={284 * k} y={494 * k} f={f} at={tCC} />
      <Label f={f} from={tQuiet + 6} to={205} text={L.tap[lang]} />
      <Label f={f} from={tLock + 6} to={385} text={L.lock[lang]} />
      <Label f={f} from={tCC + 6} to={565} text={L.cc[lang]} />
      <Label f={f} from={580} to={spec.duration - 6} text={`${L.designs[lang]}: ${["Glass", "Studio", "Signal"][Math.min(2, Math.max(0, Math.floor((f - 570) / 70)))]}`} />
    </AbsoluteFill>
  );
}

// ─── iPad (1200×1600 = 1032×1376 pt × 1.163) ─────────────────────────────────

export function IPadPreview({ lang }: { lang: Lang }) {
  const f = useCurrentFrame();
  const spec = PREVIEW_SPECS.ipad;
  const mode = modeAt(spec, f);
  const k = 1200 / IPAD.w;
  const [tQuiet, tImm] = spec.taps;
  const skin = f < 480 ? "signal" : skinAt(f, 480, 100);
  const tile = (i: number) => ({ x: (30 + (11 + 47 + i * 99) * 1.5) * k, y: (54 + 220 + 163 * 1.5) * k });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("preview-ipad.wav")} />
      <AbsoluteFill style={{ opacity: ease(f, 0, 8) * (1 - ease(f, spec.duration - 12, spec.duration)) }}>
        <div style={{ width: IPAD.w, height: IPAD.h, transform: `scale(${k})`, transformOrigin: "top left" }}><IPadApp skin={skin} mode={mode} lang={lang} /></div>
      </AbsoluteFill>
      <Touch x={tile(0).x} y={tile(0).y} f={f} at={tQuiet} size={100} />
      <Touch x={tile(2).x} y={tile(2).y} f={f} at={tImm} size={100} />
      <Label f={f} from={tQuiet + 6} to={tImm - 20} text={L.tap[lang]} size={42} />
      <Label f={f} from={tImm + 6} to={470} text={L.immersion[lang]} size={42} />
      <Label f={f} from={490} to={spec.duration - 6} text={`${L.designs[lang]}: ${["Glass", "Studio", "Signal"][Math.min(2, Math.max(0, Math.floor((f - 480) / 100)))]}`} size={42} />
    </AbsoluteFill>
  );
}

// ─── Mac (1920×1080 = 1440×810 pt × 4/3) ─────────────────────────────────────

export function MacPreview({ lang }: { lang: Lang }) {
  const f = useCurrentFrame();
  const spec = PREVIEW_SPECS.mac;
  const mode = modeAt(spec, f);
  const k = 4 / 3;
  const [tQuiet, tAdd] = spec.taps;
  const popOpen = f < 240 || f >= 600;
  const skin: Skin = f < 600 ? "glass" : skinAt(f, 600, 60);
  const quiet = { x: (1060 + 62) * k, y: (32 + 82) * k };
  const add = { x: (300 + 678) * k, y: (110 + 205) * k };
  const cur = f < 240
    ? { x: interpolate(ease(f, 20, tQuiet - 4), [0, 1], [900, quiet.x]), y: interpolate(ease(f, 20, tQuiet - 4), [0, 1], [700, quiet.y]) }
    : { x: interpolate(ease(f, 250, tAdd - 4), [0, 1], [quiet.x, add.x]), y: interpolate(ease(f, 250, tAdd - 4), [0, 1], [quiet.y, add.y]) };
  const settingsOut = ease(f, 400, 420);
  const callIn = ease(f, 420, 450);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("preview-mac.wav")} />
      <AbsoluteFill style={{ opacity: ease(f, 0, 8) * (1 - ease(f, spec.duration - 12, spec.duration)) }}>
        <div style={{ transform: `scale(${k})`, transformOrigin: "top left" }}>
          <MacScreen width={1440} height={810} mode={mode} menuActive={popOpen} flash={f >= 480 && f < 530 ? 1 - (f - 480) / 50 : 0}>
            {f >= 240 && f < 600 && settingsOut < 1 && (
              <div style={{ position: "absolute", left: 300, top: 110, opacity: (f < 256 ? ease(f, 240, 256) : 1) * (1 - settingsOut) }}>
                <MacSettingsAutomation lang={lang} rules={defaultRules(lang)} newRule={zoomRule(lang)} ruleIn={ease(f, tAdd + 8, tAdd + 28)} pressedAdd={f >= tAdd && f < tAdd + 6} highlight={ease(f, tAdd + 28, tAdd + 38)} />
              </div>
            )}
            {f >= 420 && f < 600 && <div style={{ position: "absolute", left: 400, top: 160, opacity: callIn, transform: `scale(${0.9 + 0.1 * callIn})` }}><CallWindow lang={lang} speaking={f > 450 ? 0.5 + 0.5 * Math.sin(f * 0.4) : 0} /></div>}
            {popOpen && <div style={{ position: "absolute", left: 1060, top: 32 }}><MacPopover skin={skin} mode={mode} lang={lang} pressed={f >= tQuiet && f < tQuiet + 6 ? "quiet" : undefined} hover={f > tQuiet - 20 && f < tQuiet ? "quiet" : undefined} /></div>}
          </MacScreen>
        </div>
      </AbsoluteFill>
      {f < 420 && <Pointer x={cur.x} y={cur.y} pressed={(f >= tQuiet && f < tQuiet + 6) || (f >= tAdd && f < tAdd + 6)} />}
      <Label f={f} from={tQuiet + 6} to={235} text={L.click[lang]} size={34} bottom={50} />
      <Label f={f} from={tAdd + 30} to={400} text={L.rule[lang]} size={34} bottom={50} />
      <Label f={f} from={485} to={595} text={L.auto[lang]} size={34} bottom={50} />
      <Label f={f} from={610} to={spec.duration - 6} text={`${L.designs[lang]}: ${["Glass", "Studio", "Signal"][Math.min(2, Math.max(0, Math.floor((f - 600) / 60)))]}`} size={34} bottom={50} />
    </AbsoluteFill>
  );
}

