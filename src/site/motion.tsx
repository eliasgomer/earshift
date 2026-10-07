// Smooth scroll (Lenis) + GSAP ScrollTrigger/SplitText helpers + custom cursor.

import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);
export { gsap, ScrollTrigger };

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

export function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // In-page anchors go through Lenis.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const el = a.hash.length > 1 ? document.querySelector(a.hash) : null;
      if (a.hash === "#top") { e.preventDefault(); lenis?.scrollTo(0); return; }
      if (el) { e.preventDefault(); lenis?.scrollTo(el as HTMLElement, { offset: -40 }); }
    };
    document.addEventListener("click", onClick);
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = null; document.removeEventListener("click", onClick); };
  }, []);
  return null;
}

/// Line-by-line masked reveal of a heading when it scrolls into view.
export function SplitReveal({ children, as: Tag = "h2", className, delay = 0, immediate }: { children: ReactNode; as?: "h1" | "h2" | "h3" | "p" | "div"; className?: string; delay?: number; immediate?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!ref.current || reducedMotion()) return;
    const el = ref.current;
    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
      gsap.from(split.lines, {
        yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08, delay,
        scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%" },
      });
    }, el);
    return () => { ctx.revert(); split?.revert(); };
  }, [delay, immediate]);
  const T = Tag as "h2";
  return <T ref={ref as RefObject<HTMLHeadingElement>} className={className}>{children}</T>;
}

/// Fade/rise children into view.
export function Rise({ children, className, delay = 0, y = 40 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!ref.current || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { opacity: 0, y, duration: 1.2, ease: "expo.out", delay, scrollTrigger: { trigger: ref.current, start: "top 90%" } });
    });
    return () => ctx.revert();
  }, [delay, y]);
  return <div ref={ref} className={className}>{children}</div>;
}

/// Pulls an element toward the pointer (magnetic button).
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer() || reducedMotion()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * strength); yTo((e.clientY - r.top - r.height / 2) * strength); };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [strength]);
  return <div ref={ref} className={`inline-block ${className ?? ""}`}>{children}</div>;
}

/// Custom cursor: small dot + ring; elements with data-cursor="label" grow it and show the label.
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!finePointer()) return;
    document.documentElement.classList.add("has-cursor");
    const d = dot.current!, r = ring.current!;
    const dx = gsap.quickTo(d, "x", { duration: 0.08 }), dy = gsap.quickTo(d, "y", { duration: 0.08 });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3.out" }), ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, label");
      const text = t?.dataset.cursor ?? "";
      r.dataset.state = t ? (text ? "label" : "hover") : "";
      if (label.current) label.current.textContent = text;
    };
    window.addEventListener("pointermove", move);
    return () => { window.removeEventListener("pointermove", move); document.documentElement.classList.remove("has-cursor"); };
  }, []);
  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className="cursor-ring" aria-hidden><span ref={label} /></div>
    </>
  );
}
