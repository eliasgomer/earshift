import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { ArrowUpRight, Pause, Plus, Volume2, VolumeX } from "lucide-react";
import { LINKS } from "../components/Chrome";
import { ModeWaveform } from "./waveform";
import { BASE, useLang, useT } from "../i18n";
import {
  ControlCenter, LockScreen, MacPopover, MacScreen, ModeIcon, PhoneApp, PhoneFrame, SKIN_LABEL, WIDGET_ACCENTS, WIDGET_DIMS, Widget,
  type Skin, type WidgetAccent, type WidgetDesign, type WidgetLabel, type WidgetLayout, type WidgetSize,
} from "../ui/AppUI";
import { MODES, MODE_ORDER, type ModeKey } from "../ui/modes";
import { Magnetic, Rise, ScrollTrigger, SplitReveal, finePointer, gsap, reducedMotion } from "./motion";
import { siteSound } from "./sound";

export type SetMode = (m: ModeKey) => void;

// ─── small shared bits ───────────────────────────────────────────────────────

export function useSoundOn() {
  const [on, setOn] = useState(siteSound.on);
  useEffect(() => siteSound.subscribe(setOn), []);
  return on;
}

export function SoundToggle({ compact }: { compact?: boolean }) {
  const t = useT();
  const on = useSoundOn();
  return (
    <button onClick={() => void siteSound.toggle()} aria-pressed={on} data-cursor={on ? t({ de: "Ton aus", en: "Mute" }) : t({ de: "Ton an", en: "Sound" })}
      className="group flex cursor-pointer items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-2 transition-colors hover:text-fg">
      <span className="flex h-4 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="w-[2px] rounded-full bg-current transition-all duration-500" style={{ height: on ? `${[60, 100, 45, 80][i]}%` : "20%", animation: on ? `eqbar ${0.6 + i * 0.13}s ease-in-out ${i * 0.1}s infinite alternate` : undefined }} />
        ))}
      </span>
      {compact ? (on ? <Volume2 size={15} /> : <VolumeX size={15} />) : <span>{on ? t({ de: "Ton an", en: "Sound on" }) : t({ de: "Ton aus", en: "Sound off" })}</span>}
    </button>
  );
}

function Label({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <div className="label flex items-center gap-3">
      {n && <span className="text-[var(--accent)]">{n}</span>}
      {n && <span className="h-px w-10 bg-line-strong" />}
      <span>{children}</span>
    </div>
  );
}

const SECTION = "relative mx-auto w-full max-w-[1440px] px-5 sm:px-10";

// ─── hero ────────────────────────────────────────────────────────────────────

export function Hero({ mode, setMode }: { mode: ModeKey; setMode: SetMode }) {
  const t = useT();
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-line > span", { yPercent: 115, duration: 1.4, ease: "expo.out", stagger: 0.1, delay: 0.15 });
      gsap.from(".hero-fade", { opacity: 0, y: 20, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.6 });
      gsap.to(".hero-title", { yPercent: 18, opacity: 0.25, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className="relative flex min-h-[100svh] flex-col overflow-hidden pt-24">
      <div className="pointer-events-none absolute inset-0 transition-[background] duration-1000" style={{ background: `radial-gradient(70% 60% at 50% 0%, ${MODES[mode].accent}2e, transparent 70%)` }} />
      <div className={`${SECTION} hero-fade flex items-center justify-between`}>
        <div className="label">iPhone · iPad · Mac</div>
        <div className="label hidden sm:block">{t({ de: "Für Bose QuietComfort-Kopfhörer", en: "For Bose QuietComfort headphones" })}</div>
      </div>
      <div className={`${SECTION} hero-title mt-[4vh] flex-1`}>
        <h1 className="font-semibold leading-[0.84] tracking-[-0.06em] text-[clamp(84px,min(19vw,27svh),300px)]">
          <span className="hero-line block overflow-hidden pb-[0.04em]"><span className="block">{t({ de: "Lärm", en: "Noise" })}</span></span>
          <span className="hero-line block overflow-hidden pb-[0.06em]"><span className="mode-word block" style={{ color: MODES[mode].light }}>{t({ de: "aus.", en: "off." })}</span></span>
        </h1>
      </div>
      <div className="relative h-[16vh] min-h-24 w-full">
        <ModeWaveform mode={mode} color={MODES[mode].light} calmOnScroll className="h-full w-full" />
      </div>
      <div className={`${SECTION} hero-fade grid gap-8 border-t border-line py-8 md:grid-cols-[1fr_auto_auto] md:items-end`}>
        <p className="max-w-md text-[17px] leading-relaxed text-fg-2">
          {t({ de: "Wechsle zwischen Quiet, Aware und Immersion - per Widget, Kontrollzentrum, Siri oder aus der Mac-Menüleiste. Probier es aus, mit Ton:", en: "Switch between Quiet, Aware and Immersion - from a widget, Control Center, Siri or the Mac menu bar. Try it, with sound:" })}
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {MODE_ORDER.map((k) => (
            <Magnetic key={k}>
              <button onClick={() => setMode(k)} aria-pressed={k === mode} data-cursor={MODES[k].label}
                className={`flex cursor-pointer items-center gap-2.5 text-2xl font-medium tracking-tight transition-colors sm:text-3xl ${k === mode ? "text-fg" : "text-fg-3 hover:text-fg-2"}`}>
                <ModeIcon mode={k} size={22} color={k === mode ? MODES[k].light : "currentColor"} />
                {MODES[k].label}
              </button>
            </Magnetic>
          ))}
        </div>
        <div className="flex items-center gap-6 md:justify-end"><SoundToggle /></div>
      </div>
    </section>
  );
}

// ─── pinned story: scroll switches the mode ──────────────────────────────────

export function Story({ mode, setMode }: { mode: ModeKey; setMode: SetMode }) {
  const t = useT();
  const { lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const copy: Record<ModeKey, { title: string; text: string }> = {
    aware: { title: t({ de: "Hör, was um dich passiert.", en: "Hear what's around you." }), text: t({ de: "Durchsagen, Kollegen, Verkehr - Aware lässt die Welt herein.", en: "Announcements, colleagues, traffic - Aware lets the world in." }) },
    quiet: { title: t({ de: "Dann wird es still.", en: "Then it goes quiet." }), text: t({ de: "Ein Klick in der Menüleiste oder ein Tipp aufs Widget. Der Lärm ist weg, deine Musik bleibt.", en: "One click in the menu bar or one tap on a widget. The noise is gone, your music stays." }) },
    immersion: { title: t({ de: "Nur noch Musik.", en: "Nothing but music." }), text: t({ de: "Immersion mit Spatial Audio - für Filme, Alben, lange Flüge.", en: "Immersion with spatial audio - for movies, albums, long flights." }) },
  };
  const order: ModeKey[] = ["aware", "quiet", "immersion"];
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      ScrollTrigger.create({
        trigger: root.current, start: "top top", end: "+=220%", pin: ".story-stage", scrub: false,
        onUpdate: (st) => { const m = order[Math.min(2, Math.floor(st.progress * 3))]; setMode(m); },
      });
    });
    mm.add("(max-width: 899px)", () => {
      gsap.utils.toArray<HTMLElement>(".story-step").forEach((el, i) => {
        ScrollTrigger.create({ trigger: el, start: "top 60%", end: "bottom 40%", onToggle: (st) => st.isActive && setMode(order[i]) });
      });
    });
    return () => mm.revert();
  }, [setMode]);
  return (
    <section ref={root} id="story" className="relative md:min-h-[320vh]">
      <div className="story-stage relative hidden h-[100svh] overflow-hidden md:block">
        <div className={`${SECTION} grid h-full grid-cols-[1fr_1.15fr] items-center gap-10`}>
          <div>
            <Label n="01">{t({ de: "Ein Tipp", en: "One tap" })}</Label>
            <div className="relative mt-8 h-[0.9em] text-[clamp(80px,10vw,170px)] font-semibold leading-none tracking-[-0.05em]">
              {order.map((k) => (
                <span key={k} className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
                  style={{ opacity: k === mode ? 1 : 0, transform: `translateY(${k === mode ? 0 : order.indexOf(k) < order.indexOf(mode) ? -40 : 40}px)`, color: MODES[k].light, filter: k === mode ? "none" : "blur(8px)" }}>
                  {MODES[k].label}
                </span>
              ))}
            </div>
            <div className="relative mt-10 min-h-40 max-w-md">
              {order.map((k) => (
                <div key={k} className="absolute inset-0 transition-all duration-700" style={{ opacity: k === mode ? 1 : 0, transform: `translateY(${k === mode ? 0 : 16}px)` }}>
                  <div className="text-3xl font-medium tracking-tight">{copy[k].title}</div>
                  <p className="mt-4 text-lg leading-relaxed text-fg-2">{copy[k].text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              {order.map((k) => <span key={k} className="h-[3px] w-12 rounded-full transition-colors duration-500" style={{ background: k === mode ? MODES[k].accent : "var(--color-line-strong)" }} />)}
            </div>
          </div>
          <div className="relative">
            <div className="relative" style={{ height: "min(78vh, 720px)" }}>
              <div className="absolute left-0 top-[10%] w-[78%]">
                <ScaledBox width={1000} height={620}>
                  <MacScreen width={1000} height={620} mode={mode}>
                    <div style={{ position: "absolute", right: 40, top: 34 }}><MacPopover skin="glass" mode={mode} lang={lang} /></div>
                  </MacScreen>
                </ScaledBox>
              </div>
              <div className="absolute bottom-0 right-0 w-[32%]">
                <ScaledBox width={414} height={868}><PhoneFrame><PhoneApp skin="signal" mode={mode} lang={lang} /></PhoneFrame></ScaledBox>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* mobile */}
      <div className={`${SECTION} space-y-24 py-24 md:hidden`}>
        <Label n="01">{t({ de: "Ein Tipp", en: "One tap" })}</Label>
        {order.map((k) => (
          <div key={k} className="story-step">
            <div className="text-6xl font-semibold tracking-tight" style={{ color: MODES[k].light }}>{MODES[k].label}</div>
            <div className="mt-4 text-2xl font-medium">{copy[k].title}</div>
            <p className="mt-3 text-fg-2">{copy[k].text}</p>
            <div className="mt-8 w-2/3"><ScaledBox width={414} height={868}><PhoneFrame><PhoneApp skin="signal" mode={k} lang={lang} /></PhoneFrame></ScaledBox></div>
          </div>
        ))}
      </div>
    </section>
  );
}

/// Scales a fixed-size mockup to its container width (no layout shift).
export function ScaledBox({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setS(el.clientWidth / width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={ref} style={{ width: "100%", height: height * s, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width, height, transform: `scale(${s})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}

// ─── film ────────────────────────────────────────────────────────────────────

export function Film() {
  const t = useT();
  const { lang } = useLang();
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const src = `${BASE}video/earshift-film-${lang}.mp4`;
  useEffect(() => { setPlaying(false); siteSound.duck(false); }, [src]);
  const start = () => {
    const v = ref.current!;
    if (playing) { v.pause(); setPlaying(false); siteSound.duck(false); return; }
    if (v.muted) { v.currentTime = 0; v.muted = false; v.loop = false; }
    void v.play(); setPlaying(true); siteSound.duck(true);
  };
  return (
    <section id="film" className="relative py-28 sm:py-40">
      <div className={SECTION}>
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Label n="02">Film</Label>
            <SplitReveal className="mt-6 text-[clamp(44px,7vw,112px)] font-semibold leading-[0.95] tracking-[-0.045em]">{t({ de: "Hör den Unterschied.", en: "Hear the difference." })}</SplitReveal>
          </div>
          <Rise className="flex flex-wrap items-center gap-6 font-mono text-[11px] uppercase tracking-[0.18em]">
            <span className="text-fg-3">{t({ de: "46 Sek. · Kopfhörer empfohlen", en: "46 sec · headphones recommended" })}</span>
          </Rise>
        </div>
      </div>
      <Rise className="mt-14 px-3 sm:px-6">
        <div className="relative overflow-hidden rounded-[20px] bg-ink-2 sm:rounded-[28px]" data-cursor={playing ? "Pause" : t({ de: "Mit Ton", en: "Play" })} onClick={start}>
          <video key={src} ref={ref} className="block aspect-video w-full" autoPlay muted loop playsInline preload="metadata" poster={`${BASE}video/earshift-film-${lang}.jpg`}
            onEnded={() => { const v = ref.current; if (v) { v.muted = true; v.loop = true; void v.play(); } setPlaying(false); siteSound.duck(false); }}>
            <source src={src} type="video/mp4" />
          </video>
          <button className={`absolute bottom-4 left-4 flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-ink-0 transition-opacity sm:bottom-6 sm:left-6 ${finePointer() && !playing ? "opacity-0" : "opacity-100"}`}
            onClick={(e) => { e.stopPropagation(); start(); }}>
            {playing ? <><Pause size={15} /> Pause</> : <><Volume2 size={15} /> {t({ de: "Mit Ton abspielen", en: "Play with sound" })}</>}
          </button>
        </div>
      </Rise>
      <p className={`${SECTION} mt-5 text-xs text-fg-3`}>{t({ de: "Geräusche und Musik: gemeinfreie bzw. CC0-Aufnahmen (Wikimedia Commons). Gerätename im Film neutralisiert.", en: "Sound and music: public-domain and CC0 recordings (Wikimedia Commons). Device name neutralized in the film." })}</p>
    </section>
  );
}

// ─── three designs (horizontal pin) ──────────────────────────────────────────

export function Designs({ mode }: { mode: ModeKey }) {
  const t = useT();
  const { lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const skins: Skin[] = ["glass", "studio", "signal"];
  const text: Record<Skin, string> = {
    glass: t({ de: "Nativ und vertraut. Fügt sich in macOS und iOS ein, als wäre es von Anfang an da gewesen.", en: "Native and familiar. Blends into macOS and iOS as if it had always been there." }),
    studio: t({ de: "Schwarz, ruhig, typografisch. Ein Design wie ein Studio-Gerät, mit warmem Beige-Akzent.", en: "Black, calm, typographic. Designed like studio gear, with a warm beige accent." }),
    signal: t({ de: "Farbe pro Modus. Quiet in Violett, Aware in Gold, Immersion in Türkis - auf einen Blick.", en: "Color per mode. Quiet in violet, Aware in gold, Immersion in teal - at a glance." }),
  };
  const bg: Record<Skin, string> = { glass: "#101014", studio: "#050505", signal: "#0b0a16" };
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const el = track.current!;
      gsap.to(el, {
        x: () => -(el.scrollWidth - window.innerWidth), ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${el.scrollWidth - window.innerWidth}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, []);
  return (
    <section id="designs" ref={root} className="relative overflow-hidden">
      <div ref={track} className="flex flex-col md:h-[100svh] md:w-max md:flex-row">
        <div className="flex shrink-0 flex-col justify-center px-5 py-24 sm:px-10 md:w-[42vw] md:py-0">
          <Label n="03">Designs</Label>
          <SplitReveal className="mt-6 text-[clamp(44px,6vw,96px)] font-semibold leading-[0.95] tracking-[-0.045em]">{t({ de: "Drei Designs. Deine Wahl.", en: "Three designs. Your call." })}</SplitReveal>
          <p className="mt-6 max-w-sm text-lg text-fg-2">{t({ de: "Glass, Studio oder Signal - für Menüleiste, App und Widgets. Umschalten in den Einstellungen.", en: "Glass, Studio or Signal - for the menu bar, the app and widgets. Switch any time in Settings." })}</p>
        </div>
        {skins.map((s, i) => (
          <div key={s} className="relative flex shrink-0 flex-col overflow-hidden md:h-full md:w-[86vw] md:flex-row md:items-center" style={{ background: bg[s] }}>
            <div className="pointer-events-none absolute -bottom-[0.18em] left-0 select-none text-[28vw] font-bold leading-none tracking-[-0.06em] outline-text md:text-[22vw]">{SKIN_LABEL[s]}</div>
            <div className="relative z-10 px-5 pt-20 sm:px-10 md:w-[34%] md:pt-0">
              <div className="font-mono text-sm text-fg-3">0{i + 1} / 03</div>
              <div className="mt-4 text-6xl font-semibold tracking-tight md:text-7xl">{SKIN_LABEL[s]}</div>
              <p className="mt-5 max-w-xs text-lg leading-relaxed text-fg-2">{text[s]}</p>
            </div>
            <div className="relative z-10 flex flex-1 items-center justify-center gap-[3vw] px-5 py-14 sm:px-10 md:py-0">
              <div className="w-[52%] max-w-[420px]"><ScaledBox width={320} height={s === "studio" ? 560 : s === "signal" ? 520 : 470}><MacPopover skin={s} mode={mode} lang={lang} /></ScaledBox></div>
              <div className="w-[34%] max-w-[300px]"><ScaledBox width={414} height={868}><PhoneFrame><PhoneApp skin={s} mode={mode} lang={lang} /></PhoneFrame></ScaledBox></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── widget studio ───────────────────────────────────────────────────────────

export function WidgetStudio({ mode }: { mode: ModeKey }) {
  const t = useT();
  const { lang } = useLang();
  const [size, setSize] = useState<WidgetSize>("medium");
  const [design, setDesign] = useState<WidgetDesign>("signal");
  const [accent, setAccent] = useState<WidgetAccent>("app");
  const [label, setLabel] = useState<WidgetLabel>("iconAndText");
  const [layout, setLayout] = useState<WidgetLayout>("statusAndButtons");
  const [pop, setPop] = useState(0);
  const touch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPop((p) => p + 1); };
  const row = <T extends string>(title: string, value: T, set: (v: T) => void, opts: [T, string][]) => (
    <div className="grid gap-3 border-t border-line py-5 sm:grid-cols-[150px_1fr] sm:items-baseline">
      <div className="label">{title}</div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {opts.map(([v, l]) => (
          <button key={v} onClick={() => touch(set)(v)} className={`cursor-pointer text-xl tracking-tight transition-colors sm:text-2xl ${value === v ? "text-fg" : "text-fg-3 hover:text-fg-2"}`}>
            {l}{value === v && <span className="ml-1 text-[var(--accent)]">•</span>}
          </button>
        ))}
      </div>
    </div>
  );
  const [w, h] = WIDGET_DIMS[size];
  const variants: Parameters<typeof Widget>[0][] = [
    { mode: "quiet", lang, size: "medium", design: "glass" }, { mode: "aware", lang, size: "small", design: "signal", layout: "status" },
    { mode: "immersion", lang, size: "medium", design: "studio", label: "iconOnly" }, { mode: "quiet", lang, size: "small", design: "studio", layout: "battery" },
    { mode: "aware", lang, size: "medium", design: "signal", accent: "orange", layout: "focus" }, { mode: "quiet", lang, size: "small", design: "glass", accent: "green", layout: "buttons" },
    { mode: "immersion", lang, size: "medium", design: "signal" }, { mode: "quiet", lang, size: "medium", design: "glass", accent: "pink", label: "textOnly" },
  ];
  return (
    <section id="widgets" className="relative py-28 sm:py-40">
      <div className={`${SECTION} grid gap-14 lg:grid-cols-[1fr_1fr]`}>
        <div>
          <Label n="04">Widgets</Label>
          <SplitReveal className="mt-6 text-[clamp(44px,6vw,96px)] font-semibold leading-[0.95] tracking-[-0.045em]">{t({ de: "Dein Widget. Deine Regeln.", en: "Your widget. Your rules." })}</SplitReveal>
          <p className="mt-6 max-w-md text-lg text-fg-2">{t({ de: "Größe, Design, Farbe, Beschriftung und Inhalt - stell es dir hier zusammen, genau wie auf dem Home-Bildschirm.", en: "Size, design, color, labels and content - put it together right here, just like on your Home Screen." })}</p>
          <div className="mt-10 border-b border-line">
            {row(t({ de: "Größe", en: "Size" }), size, setSize, [["small", t({ de: "Klein", en: "Small" })], ["medium", t({ de: "Mittel", en: "Medium" })], ["large", t({ de: "Groß", en: "Large" })]])}
            {row("Design", design, setDesign, [["app", t({ de: "Wie App", en: "Like app" })], ["glass", "Glass"], ["studio", "Studio"], ["signal", "Signal"]])}
            <div className="grid gap-3 border-t border-line py-5 sm:grid-cols-[150px_1fr] sm:items-center">
              <div className="label">{t({ de: "Akzent", en: "Accent" })}</div>
              <div className="flex flex-wrap gap-3">
                {(["app", ...Object.keys(WIDGET_ACCENTS)] as WidgetAccent[]).map((a) => (
                  <button key={a} onClick={() => touch(setAccent)(a)} aria-label={a} data-cursor={a}
                    className={`h-7 w-7 cursor-pointer rounded-full transition-transform ${accent === a ? "scale-110 ring-2 ring-fg ring-offset-2 ring-offset-ink-0" : "hover:scale-110"}`}
                    style={{ background: a === "app" ? `conic-gradient(${MODES.quiet.accent}, ${MODES.aware.accent}, ${MODES.immersion.accent}, ${MODES.quiet.accent})` : WIDGET_ACCENTS[a as Exclude<WidgetAccent, "app">] }} />
                ))}
              </div>
            </div>
            {row(t({ de: "Beschriftung", en: "Labels" }), label, setLabel, [["iconAndText", t({ de: "Symbol + Text", en: "Icon + text" })], ["iconOnly", t({ de: "Symbol", en: "Icon" })], ["textOnly", "Text"]])}
            {row(t({ de: "Inhalt", en: "Content" }), layout, setLayout, [["statusAndButtons", t({ de: "Status + Buttons", en: "Status + buttons" })], ["buttons", "Buttons"], ["status", t({ de: "Modus", en: "Mode" })], ["battery", t({ de: "Akku", en: "Battery" })], ["focus", t({ de: "Fokus", en: "Focus" })]])}
          </div>
        </div>
        <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-[32px] lg:sticky lg:top-24 lg:h-[calc(100svh-140px)]"
          style={{ background: "radial-gradient(90% 70% at 30% 10%, #4b3fb0 0%, #231d55 40%, #0c0a1c 80%)" }}>
          <div key={pop} className="transition-transform" style={{ animation: reducedMotion() ? undefined : "widgetpop .6s cubic-bezier(.34,1.56,.64,1)" }}>
            <div style={{ width: w * (size === "large" ? 1.1 : 1.35), maxWidth: "88vw" }}>
              <ScaledBox width={w} height={h}><Widget mode={mode} lang={lang} size={size} design={design} accent={accent} label={label} layout={layout} /></ScaledBox>
            </div>
          </div>
          <div className="absolute bottom-5 left-0 right-0 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">{t({ de: "Live-Vorschau", en: "Live preview" })}</div>
        </div>
      </div>
      <div className="mt-24 overflow-hidden">
        <div className="marquee flex w-max items-center gap-6">
          {[...variants, ...variants].map((v, i) => <div key={i} style={{ transform: "scale(0.9)" }}><Widget {...v} /></div>)}
        </div>
      </div>
    </section>
  );
}

// ─── automations ─────────────────────────────────────────────────────────────

export function Automations() {
  const t = useT();
  const rows: [string, string, ModeKey][] = [
    [t({ de: "Zoom kommt in den Vordergrund", en: "Zoom comes to the front" }), "Mac", "aware"],
    [t({ de: "Fokus „Arbeit“ startet", en: "Work Focus starts" }), t({ de: "Fokus-Filter", en: "Focus filter" }), "quiet"],
    [t({ de: "Musik-App spielt", en: "Music app plays" }), "Mac", "immersion"],
    [t({ de: "Jeden Tag um 18:00", en: "Every day at 6 pm" }), t({ de: "Kurzbefehle", en: "Shortcuts" }), "immersion"],
    [t({ de: "„Hey Siri, Earshift auf Quiet“", en: "“Hey Siri, Earshift to Quiet”" }), "Siri", "quiet"],
    [t({ de: "Du betrittst das Büro", en: "You arrive at the office" }), t({ de: "Ort", en: "Location" }), "quiet"],
  ];
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".auto-row").forEach((el) => {
        gsap.from(el.querySelector(".auto-line"), { scaleX: 0, transformOrigin: "left", duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
        gsap.from(el.querySelectorAll(".auto-in"), { opacity: 0, y: 24, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 85%" } });
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className="relative py-28 sm:py-40">
      <div className={SECTION}>
        <Label n="05">{t({ de: "Automatisch", en: "Automatic" })}</Label>
        <SplitReveal className="mt-6 max-w-5xl text-[clamp(44px,6vw,96px)] font-semibold leading-[0.95] tracking-[-0.045em]">{t({ de: "Es schaltet, bevor du dran denkst.", en: "It switches before you think of it." })}</SplitReveal>
        <div className="mt-16 border-b border-line">
          {rows.map(([when, via, m], i) => (
            <div key={i} className="auto-row group relative grid grid-cols-[1fr_auto] items-center gap-6 border-t border-line py-7 sm:grid-cols-[60px_1fr_160px_200px]">
              <span className="auto-line absolute left-0 top-[-1px] h-px w-full" style={{ background: MODES[m].accent }} />
              <span className="auto-in hidden font-mono text-sm text-fg-3 sm:block">0{i + 1}</span>
              <span className="auto-in text-2xl tracking-tight sm:text-4xl">{when}</span>
              <span className="auto-in hidden font-mono text-xs uppercase tracking-[0.18em] text-fg-3 sm:block">{via}</span>
              <span className="auto-in flex items-center justify-end gap-3 text-2xl font-medium tracking-tight sm:text-4xl" style={{ color: MODES[m].light }}>
                <ModeIcon mode={m} size={26} color={MODES[m].light} />{MODES[m].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── everywhere index with cursor-following preview ──────────────────────────

export function Everywhere({ mode }: { mode: ModeKey }) {
  const t = useT();
  const { lang } = useLang();
  const [hover, setHover] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const items: [string, string, ReactNode][] = [
    [t({ de: "Kontrollzentrum", en: "Control Center" }), "iOS · macOS", <PhoneFrame scale={0.5}><ControlCenter mode={mode} lang={lang} /></PhoneFrame>],
    [t({ de: "Sperrbildschirm", en: "Lock Screen" }), "iOS", <PhoneFrame scale={0.5}><LockScreen mode={mode} lang={lang} /></PhoneFrame>],
    [t({ de: "Home-Bildschirm", en: "Home Screen" }), "iOS · iPadOS", <Widget mode={mode} lang={lang} size="medium" />],
    [t({ de: "Menüleiste", en: "Menu bar" }), "macOS", <div style={{ transform: "scale(0.9)" }}><MacPopover skin="studio" mode={mode} lang={lang} /></div>],
    [t({ de: "Aktionstaste", en: "Action Button" }), "iPhone", <Widget mode={mode} lang={lang} size="small" layout="status" design="studio" />],
    [t({ de: "Siri & Kurzbefehle", en: "Siri & Shortcuts" }), t({ de: "20 Aktionen", en: "20 actions" }), <Widget mode={mode} lang={lang} size="small" layout="focus" />],
    [t({ de: "Tastenkürzel", en: "Keyboard shortcuts" }), "macOS", <div className="flex gap-3">{["⌥", "⌘", "Q"].map((k) => <span key={k} className="flex h-20 w-20 items-center justify-center rounded-2xl bg-ink-3 text-3xl shadow-[0_6px_0_#000]">{k}</span>)}</div>],
    [t({ de: "Fokus-Session", en: "Focus session" }), t({ de: "Live-Aktivität", en: "Live Activity" }), <Widget mode="quiet" lang={lang} size="medium" layout="focus" design="signal" />],
  ];
  useEffect(() => {
    if (!finePointer()) return;
    const el = preview.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }), yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const move = (e: PointerEvent) => { xTo(e.clientX); yTo(e.clientY); };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <section className="relative py-28 sm:py-40">
      <div className={SECTION}>
        <Label n="06">{t({ de: "Überall", en: "Everywhere" })}</Label>
        <SplitReveal className="mt-6 text-[clamp(44px,6vw,96px)] font-semibold leading-[0.95] tracking-[-0.045em]">{t({ de: "Da, wo du gerade bist.", en: "Wherever you are." })}</SplitReveal>
        <ul className="mt-16 border-b border-line" onPointerLeave={() => setHover(null)}>
          {items.map(([name, where], i) => (
            <li key={name} onPointerEnter={() => setHover(i)} className="group flex items-baseline gap-6 border-t border-line py-5 transition-colors sm:py-6">
              <span className="w-10 font-mono text-sm text-fg-3">0{i + 1}</span>
              <span className={`flex-1 text-[clamp(30px,5vw,72px)] font-medium leading-none tracking-[-0.04em] transition-all duration-500 ${hover === null || hover === i ? "text-fg" : "text-fg-3/40"} ${hover === i ? "translate-x-3" : ""}`}>{name}</span>
              <span className="hidden font-mono text-xs uppercase tracking-[0.18em] text-fg-3 sm:block">{where}</span>
              <ArrowUpRight className={`shrink-0 transition-all duration-500 ${hover === i ? "rotate-45 text-[var(--accent)]" : "text-fg-3"}`} />
            </li>
          ))}
        </ul>
      </div>
      <div ref={preview} className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block" aria-hidden>
        <div className="-translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-300" style={{ opacity: hover === null ? 0 : 1, transform: `translate(-50%, -50%) scale(${hover === null ? 0.8 : 1}) rotate(${hover === null ? -4 : 0}deg)` }}>
          {hover !== null && items[hover][2]}
        </div>
      </div>
    </section>
  );
}

// ─── sound (EQ curve) ────────────────────────────────────────────────────────

export function SoundSection({ mode }: { mode: ModeKey }) {
  const t = useT();
  const [eq, setEq] = useState([4, -1, 3]);
  const [spatial, setSpatial] = useState(1);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<number | null>(null);
  const W = 1200, H = 360, xs = [W * 0.17, W * 0.5, W * 0.83];
  const y = (v: number) => H / 2 - (v / 10) * (H / 2 - 30);
  const pts = [[0, y(eq[0] * 0.6)], [xs[0], y(eq[0])], [xs[1], y(eq[1])], [xs[2], y(eq[2])], [W, y(eq[2] * 0.6)]];
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const cx = (x0 + x1) / 2; d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`; }
  const onMove = (e: RPointerEvent) => {
    if (drag.current === null || !svg.current) return;
    const r = svg.current.getBoundingClientRect();
    const v = Math.round(((r.top + r.height / 2 - e.clientY) / (r.height / 2 - 30 * r.height / H)) * 10);
    setEq((q) => q.map((x, i) => (i === drag.current ? Math.max(-10, Math.min(10, v)) : x)));
  };
  const accent = MODES[mode].light;
  const presets: [string, number[]][] = [[t({ de: "Neutral", en: "Flat" }), [0, 0, 0]], [t({ de: "Bass betonen", en: "Bass boost" }), [7, 1, -1]], [t({ de: "Stimme", en: "Voice" }), [-3, 5, 3]], [t({ de: "Höhen", en: "Treble" }), [-1, 0, 6]]];
  return (
    <section className="relative py-28 sm:py-40">
      <div className={SECTION}>
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Label n="07">{t({ de: "Klang", en: "Sound" })}</Label>
            <SplitReveal className="mt-6 text-[clamp(44px,6vw,96px)] font-semibold leading-[0.95] tracking-[-0.045em]">{t({ de: "Klang nach deinem Ohr.", en: "Sound, tuned to you." })}</SplitReveal>
          </div>
          <p className="max-w-sm text-lg text-fg-2">{t({ de: "3-Band-Equalizer, direkt in den Kopfhörern gespeichert. Zieh an den Punkten.", en: "A 3-band equalizer saved right on your headphones. Drag the points." })}</p>
        </div>
      </div>
      <div className="mt-14 px-5 sm:px-10">
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none" onPointerMove={onMove} onPointerUp={() => (drag.current = null)} onPointerLeave={() => (drag.current = null)}>
          <defs><linearGradient id="eqfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={accent} stopOpacity="0.28" /><stop offset="1" stopColor={accent} stopOpacity="0" /></linearGradient></defs>
          <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="var(--color-line-strong)" strokeDasharray="4 6" />
          <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#eqfill)" />
          <path d={d} fill="none" stroke={accent} strokeWidth="3" />
          {xs.map((x, i) => (
            <g key={i} onPointerDown={(e) => { drag.current = i; (e.target as Element).setPointerCapture?.(e.pointerId); }} data-cursor={t({ de: "Ziehen", en: "Drag" })} className="cursor-grab">
              <circle cx={x} cy={y(eq[i])} r="26" fill="transparent" />
              <circle cx={x} cy={y(eq[i])} r="11" fill="#fff" />
              <text x={x} y={H - 6} textAnchor="middle" fill="var(--color-fg-3)" fontSize="15" fontFamily="var(--font-mono)" letterSpacing="2">
                {[t({ de: "BASS", en: "BASS" }), t({ de: "MITTEN", en: "MID" }), t({ de: "HÖHEN", en: "TREBLE" })][i]} {eq[i] > 0 ? `+${eq[i]}` : eq[i]}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className={`${SECTION} mt-10 flex flex-wrap items-center gap-x-10 gap-y-4`}>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {presets.map(([n, v]) => <button key={n} onClick={() => setEq(v)} className={`cursor-pointer text-xl transition-colors ${eq.join() === v.join() ? "text-fg" : "text-fg-3 hover:text-fg-2"}`}>{n}</button>)}
        </div>
        <span className="hidden h-6 w-px bg-line-strong sm:block" />
        <div className="flex items-center gap-6">
          <span className="label">Spatial Audio</span>
          {[t({ de: "Aus", en: "Off" }), t({ de: "Raum", en: "Room" }), t({ de: "Kopf", en: "Head" })].map((s, i) => (
            <button key={s} onClick={() => setSpatial(i)} className={`cursor-pointer text-xl transition-colors ${spatial === i ? "text-fg" : "text-fg-3 hover:text-fg-2"}`}>{s}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── privacy, pricing, compat, faq ───────────────────────────────────────────

export function Privacy() {
  const t = useT();
  const { lang } = useLang();
  return (
    <section className="relative py-28 sm:py-40">
      <div className={SECTION}>
        <Label n="08">{t({ de: "Privat", en: "Private" })}</Label>
        <div className="mt-10 grid grid-cols-3 border-y border-line">
          {[t({ de: "Konten", en: "Accounts" }), "Tracker", "Server"].map((w, i) => (
            <Rise key={w} delay={i * 0.08} className={`py-8 ${i ? "border-l border-line pl-4 sm:pl-10" : ""}`}>
              <div className="text-[clamp(90px,17vw,280px)] font-semibold leading-[0.8] tracking-[-0.06em]">0</div>
              <div className="label mt-6">{w}</div>
            </Rise>
          ))}
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <p className="max-w-xl text-xl leading-relaxed text-fg-2">{t({ de: "Earshift spricht direkt per Bluetooth mit deinen Kopfhörern. Kein Konto, keine Cloud, keine Analyse. Einstellungen bleiben auf deinem Gerät.", en: "Earshift talks to your headphones directly over Bluetooth. No account, no cloud, no analytics. Settings stay on your device." })}</p>
          <a href={lang === "de" ? LINKS.datenschutz : LINKS.privacy} className="flex items-center gap-2 self-end text-lg text-fg md:justify-self-end">{t({ de: "Datenschutzerklärung", en: "Privacy policy" })} <ArrowUpRight size={18} /></a>
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  const t = useT();
  const live = !!LINKS.appStore;
  return (
    <section id="pricing" className="relative py-28 sm:py-40">
      <div className={SECTION}>
        <Label n="09">{t({ de: "Preis", en: "Pricing" })}</Label>
        <SplitReveal className="mt-6 text-[clamp(44px,6vw,96px)] font-semibold leading-[0.95] tracking-[-0.045em]">{t({ de: "Einmal zahlen. Für immer behalten.", en: "Pay once. Keep it forever." })}</SplitReveal>
        <div className="mt-16 grid border-y border-line md:grid-cols-2">
          <Rise className="py-10 md:pr-10">
            <div className="label">{t({ de: "Testphase", en: "Trial" })}</div>
            <div className="mt-6 text-[clamp(72px,11vw,170px)] font-semibold leading-[0.85] tracking-[-0.05em]">{t({ de: "7 Tage", en: "7 days" })}</div>
            <div className="mt-3 text-2xl text-fg-2">{t({ de: "gratis, alle Funktionen", en: "free, every feature" })}</div>
          </Rise>
          <Rise delay={0.08} className="border-t border-line py-10 md:border-l md:border-t-0 md:pl-10">
            <div className="label">Lifetime</div>
            <div className="mt-6 text-[clamp(72px,11vw,170px)] font-semibold leading-[0.85] tracking-[-0.05em]" style={{ color: "var(--accent-light)" }}>3,99 €</div>
            <div className="mt-3 text-2xl text-fg-2">{t({ de: "einmalig, kein Abo", en: "once, no subscription" })}</div>
          </Rise>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-lg text-fg-2">
            {[t({ de: "iPhone, iPad und Mac", en: "iPhone, iPad and Mac" }), t({ de: "Familienfreigabe", en: "Family Sharing" }), t({ de: "Alle Updates inklusive", en: "All updates included" }), t({ de: "Nie automatische Kosten", en: "Never charged automatically" })].map((x) => (
              <li key={x} className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />{x}</li>
            ))}
          </ul>
          <Magnetic>
            <a href={live ? LINKS.appStore : "#pricing"} data-cursor={live ? "App Store" : t({ de: "Bald", en: "Soon" })} className="flex items-center gap-3 rounded-full bg-fg py-3 pl-3 pr-6 text-ink-0">
              <img src={`${BASE}img/icon.png`} alt="" className="h-9 w-9 rounded-[9px]" />
              <span className="leading-tight"><span className="block font-mono text-[10px] uppercase tracking-widest opacity-60">{live ? t({ de: "Laden im", en: "Download on the" }) : t({ de: "Bald im", en: "Coming soon to the" })}</span><span className="block text-lg font-semibold">App Store</span></span>
            </a>
          </Magnetic>
        </div>
        <p className="mt-8 text-sm text-fg-3">{t({ de: "Preis in Deutschland inkl. MwSt.; in anderen Ländern legt Apple den Preis in Landeswährung fest. Kauf und Rückerstattung über Apple.", en: "Price in Germany incl. VAT; Apple sets the local price elsewhere. Purchases and refunds are handled by Apple." })}</p>
      </div>
    </section>
  );
}

export function CompatFaq() {
  const t = useT();
  const models: [string, string][] = [
    ["QuietComfort Ultra Headphones (2nd Gen)", t({ de: "getestet · iPhone, iPad, Mac", en: "tested · iPhone, iPad, Mac" })],
    ["QuietComfort Ultra Earbuds (2nd Gen)", "Beta · iPhone, iPad, Mac"],
    ["QuietComfort Headphones (2nd Gen)", "Beta · iPhone, iPad, Mac"],
    ["QuietComfort Ultra Headphones & Earbuds (1st Gen)", "Beta · iPhone, iPad, Mac"],
    ["QuietComfort 45 · 35 / 35 II · Earbuds · Headphones (1st Gen)", "Beta · Mac"],
    ["Ultra Open Earbuds", "Beta · Mac"],
  ];
  const faq: [string, string][] = [
    [t({ de: "Brauche ich die Bose-App?", en: "Do I need the Bose app?" }), t({ de: "Nein. Earshift spricht direkt per Bluetooth mit den Kopfhörern. Die Bose-App sollte während der Nutzung sogar geschlossen sein, weil sie die Steuerverbindung belegen kann.", en: "No. Earshift talks to the headphones directly over Bluetooth. Keep the Bose app closed, since it can hold the control connection." })],
    [t({ de: "Muss die App offen sein?", en: "Does the app have to be open?" }), t({ de: "Nein. Widgets, Kontrollzentrum, Aktionstaste, Siri und Kurzbefehle schalten im Hintergrund.", en: "No. Widgets, Control Center, the Action Button, Siri and Shortcuts switch in the background." })],
    [t({ de: "Ist das ein Abo?", en: "Is this a subscription?" }), t({ de: "Nein. 7 Tage gratis testen, danach einmalig 3,99 €. Es wird nie automatisch etwas berechnet.", en: "No. Try it free for 7 days, then €3.99 once (local price in your country). Nothing is charged automatically." })],
    [t({ de: "Gilt der Kauf auf allen Geräten?", en: "Does one purchase cover all my devices?" }), t({ de: "Ja - iPhone, iPad und Mac mit derselben Apple-ID, plus Familienfreigabe.", en: "Yes - iPhone, iPad and Mac with the same Apple Account, plus Family Sharing." })],
    [t({ de: "Ist Earshift eine offizielle Bose-App?", en: "Is Earshift an official Bose app?" }), t({ de: "Nein. Earshift ist eine unabhängige App eines Einzelentwicklers.", en: "No. Earshift is an independent app by a solo developer." })],
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="relative py-28 sm:py-40">
      <div className={`${SECTION} grid gap-20 lg:grid-cols-2`}>
        <div>
          <Label n="10">{t({ de: "Kompatibel", en: "Compatible" })}</Label>
          <SplitReveal className="mt-6 text-[clamp(36px,4.5vw,64px)] font-semibold leading-[0.98] tracking-[-0.04em]">{t({ de: "Kompatible Kopfhörer.", en: "Compatible headphones." })}</SplitReveal>
          <ul className="mt-10 border-b border-line">
            {models.map(([m, s], i) => (
              <li key={m} className="flex flex-col gap-1 border-t border-line py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <span className={`text-lg ${i === 0 ? "text-fg" : "text-fg-2"}`}>Bose {m}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-3">{s}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-fg-3">iOS / iPadOS 18+, macOS 13+.</p>
        </div>
        <div>
          <Label>FAQ</Label>
          <SplitReveal className="mt-6 text-[clamp(36px,4.5vw,64px)] font-semibold leading-[0.98] tracking-[-0.04em]">{t({ de: "Gute Fragen.", en: "Good questions." })}</SplitReveal>
          <div className="mt-10 border-b border-line">
            {faq.map(([q, a], i) => (
              <div key={q} className="border-t border-line">
                <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full cursor-pointer items-center gap-6 py-5 text-left text-lg">
                  <span className="flex-1">{q}</span><Plus size={18} className={`shrink-0 text-fg-3 transition-transform duration-500 ${open === i ? "rotate-45" : ""}`} />
                </button>
                <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.16,1,.3,1)]" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden"><p className="pb-6 pr-10 leading-relaxed text-fg-2">{a}</p></div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-fg-3">{t({ de: "Noch Fragen?", en: "More questions?" })} <a className="text-fg underline-offset-4 hover:underline" href={LINKS.support}>Support</a> · <a className="text-fg underline-offset-4 hover:underline" href="mailto:earshiftapp@ggsells.de">earshiftapp@ggsells.de</a></p>
        </div>
      </div>
    </section>
  );
}

export function BigFooter() {
  const t = useT();
  const { lang } = useLang();
  return (
    <footer className="relative overflow-hidden border-t border-line pt-16">
      <div className={`${SECTION} grid gap-10 md:grid-cols-[1fr_auto]`}>
        <div>
          <div className="text-3xl font-medium tracking-tight sm:text-5xl">{t({ de: "Mach mal Ruhe.", en: "Get some quiet." })}</div>
          <p className="mt-3 text-fg-2">{t({ de: "7 Tage gratis, dann 3,99 € einmalig.", en: "7 days free, then €3.99 once." })}</p>
        </div>
        <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-fg-2 sm:grid-cols-3">
          <a className="hover:text-fg" href={LINKS.support}>Support</a>
          <a className="hover:text-fg" href={lang === "de" ? LINKS.datenschutz : LINKS.privacy}>{t({ de: "Datenschutz", en: "Privacy" })}</a>
          <a className="hover:text-fg" href={LINKS.impressum}>{t({ de: "Impressum", en: "Legal Notice" })}</a>
          <a className="hover:text-fg" href="mailto:earshiftapp@ggsells.de">{t({ de: "Kontakt", en: "Contact" })}</a>
          <a className="hover:text-fg" href={LINKS.repo}>GitHub</a>
          <a className="hover:text-fg" href="#top">{t({ de: "Nach oben ↑", en: "Top ↑" })}</a>
        </nav>
      </div>
      <p className={`${SECTION} mt-12 max-w-4xl text-xs leading-relaxed text-fg-3`}>
        © 2026 Elias Gomer. {t({
          de: "Earshift ist eine unabhängige App und steht in keiner Verbindung zur Bose Corporation, wird von ihr weder unterstützt noch gesponsert. Bose und QuietComfort sind Marken der Bose Corporation. Apple, iPhone, iPad, Mac und App Store sind Marken der Apple Inc.",
          en: "Earshift is an independent app and is not affiliated with, endorsed or sponsored by Bose Corporation. Bose and QuietComfort are trademarks of Bose Corporation. Apple, iPhone, iPad, Mac and App Store are trademarks of Apple Inc.",
        })}
      </p>
      <div aria-hidden className="pointer-events-none mt-6 select-none whitespace-nowrap text-center text-[25vw] font-bold leading-[0.78] tracking-[-0.07em] text-fg/[0.06]" style={{ marginBottom: "-0.12em" }}>Earshift</div>
    </footer>
  );
}

