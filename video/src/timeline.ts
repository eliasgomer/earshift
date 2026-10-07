// Scene-relative events → absolute frames. The narrated cut passes longer scene
// durations; events stay relative to their scene.

import raw from "./timeline.json";
import type { ModeKey } from "../../src/ui/modes";

export type SceneId = "open" | "click" | "cc" | "auto" | "designs" | "widgets" | "outro";
export type Durations = Partial<Record<SceneId, number>>;

export interface Resolved {
  fps: number;
  total: number;
  start: Record<SceneId, number>;
  dur: Record<SceneId, number>;
  modes: { at: number; mode: ModeKey }[];
  clicks: number[];
  callFrom: number;
  words: number[];
}

export function resolveTimeline(over: Durations = {}): Resolved {
  const start = {} as Record<SceneId, number>;
  const dur = {} as Record<SceneId, number>;
  let t = 0;
  for (const s of raw.scenes) {
    const id = s.id as SceneId;
    start[id] = t;
    dur[id] = Math.max(s.dur, over[id] ?? 0);
    t += dur[id];
  }
  const abs = (e: { scene: string; at: number }) => start[e.scene as SceneId] + e.at;
  return {
    fps: raw.fps,
    total: t,
    start,
    dur,
    modes: raw.modes.map((m) => ({ at: abs(m), mode: m.mode as ModeKey })),
    clicks: raw.clicks.map(abs),
    callFrom: start[raw.call.scene as SceneId] + raw.call.from,
    words: raw.words.map(abs),
  };
}
