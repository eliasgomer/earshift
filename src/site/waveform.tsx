import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger } from "animejs";
import type { ModeKey } from "../ui/modes";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/// A noisy waveform collapses into one calm line, then the page appears.
export function NoiseIntro() {
  const [done, setDone] = useState(() => {
    try { return reduced() || sessionStorage.getItem("earshift.intro") === "1"; } catch { return reduced(); }
  });
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (done || !root.current) return;
    document.documentElement.style.overflow = "hidden";
    const bars = root.current.querySelectorAll<HTMLElement>(".ibar");
    const jitter = animate(bars, {
      scaleY: () => 0.15 + Math.random() * 0.85,
      duration: 140, ease: "inOutSine", loop: true, alternate: true, delay: stagger(6, { from: "center" }),
    });
    const tl = createTimeline({
      onComplete: () => {
        try { sessionStorage.setItem("earshift.intro", "1"); } catch { /* ignore */ }
        document.documentElement.style.overflow = "";
        setDone(true);
      },
    });
    tl.add(bars, { scaleY: 0.03, duration: 650, ease: "outExpo", delay: stagger(8, { from: "center" }), onBegin: () => jitter.pause() }, 900)
      .add(root.current.querySelector(".iline")!, { scaleX: [0, 1], opacity: [0, 1], duration: 500, ease: "outExpo" }, "-=380")
      .add(root.current.querySelector(".iword")!, { opacity: [0, 1], translateY: [12, 0], duration: 420, ease: "outExpo" }, "-=300")
      .add(root.current, { opacity: [1, 0], duration: 520, ease: "inOutQuad" }, "+=260");
    return () => { jitter.pause(); tl.pause(); document.documentElement.style.overflow = ""; };
  }, [done]);
  if (done) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-0" onClick={() => { document.documentElement.style.overflow = ""; setDone(true); }}>
      <div className="relative flex h-40 w-[min(720px,86vw)] items-center justify-between">
        {Array.from({ length: 56 }, (_, i) => (
          <span key={i} className="ibar block h-full w-[3px] origin-center rounded-full bg-fg/80" style={{ transform: `scaleY(${0.2 + Math.abs(Math.sin(i * 1.7)) * 0.7})` }} />
        ))}
        <span className="iline absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--accent)] opacity-0" />
      </div>
      <div className="iword label mt-8 opacity-0">Earshift</div>
    </div>
  );
}

/// Loud chaos (Aware), calm line (Quiet), flowing music (Immersion).
export function ModeWaveform({ mode, className, color, calmOnScroll }: { mode: ModeKey; className?: string; color: string; calmOnScroll?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const target = useRef({ chaos: 1, music: 0 });
  target.current = { chaos: mode === "aware" ? 1 : mode === "immersion" ? 0.12 : 0.03, music: mode === "immersion" ? 1 : 0 };
  const colorRef = useRef(color);
  colorRef.current = color;
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0, chaos = 1, music = 0;
    const seeds = Array.from({ length: 200 }, () => Math.random());
    const still = reduced();
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth, h = c.clientHeight;
      if (c.width !== w * dpr) { c.width = w * dpr; c.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const scrollCalm = calmOnScroll ? Math.min(1, window.scrollY / (window.innerHeight * 0.9)) : 0;
      chaos += (target.current.chaos * (1 - scrollCalm * 0.85) - chaos) * 0.06;
      music += (target.current.music - music) * 0.06;
      const n = Math.max(40, Math.floor(w / 9));
      const bw = w / n;
      ctx.fillStyle = colorRef.current;
      for (let i = 0; i < n; i++) {
        const x = i / n;
        const env = Math.pow(Math.sin(Math.PI * x), 0.7);
        const noisy = (0.25 + 0.75 * Math.abs(Math.sin(t * (1.5 + seeds[i % 200] * 4) + seeds[(i * 7) % 200] * 10))) * (0.55 + 0.45 * Math.sin(i * 0.9 + t * 3));
        const calm = 0.035 + 0.02 * Math.sin(i * 0.25 + t * 1.2);
        const flow = 0.2 + 0.32 * Math.abs(Math.sin(i * 0.11 + t * 0.9)) * (0.6 + 0.4 * Math.sin(i * 0.05 - t * 0.6));
        const base = calm + (noisy - calm) * chaos;
        const v = (base + (flow - base) * music) * env;
        const bh = Math.max(2, v * h);
        ctx.globalAlpha = 0.25 + 0.75 * env;
        ctx.beginPath();
        ctx.roundRect(i * bw + bw * 0.25, (h - bh) / 2, bw * 0.5, bh, bw * 0.25);
        ctx.fill();
      }
      t += 0.016;
      if (!still) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [calmOnScroll]);
  return <canvas ref={ref} className={className} aria-hidden />;
}
