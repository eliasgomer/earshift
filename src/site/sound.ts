// Site sound: real street ambience + a music loop through Web Audio.
// Aware = ambience clear, Quiet = ambience through an "ANC" low-pass and almost
// silent while the music comes forward, Immersion = music up, ambience gone.
// Starts only after a click (browsers block autoplay with sound).

import type { ModeKey } from "../ui/modes";

const BASE = import.meta.env.BASE_URL;

const LEVELS: Record<ModeKey, { cutoff: number; amb: number; music: number }> = {
  aware: { cutoff: 18000, amb: 0.9, music: 0.12 },
  quiet: { cutoff: 300, amb: 0.14, music: 0.55 },
  immersion: { cutoff: 300, amb: 0.08, music: 0.8 },
};

class SiteSound {
  private ctx?: AudioContext;
  private amb?: GainNode;
  private music?: GainNode;
  private master?: GainNode;
  private lp?: BiquadFilterNode;
  private mode: ModeKey = "aware";
  private loading?: Promise<void>;
  on = false;
  private listeners = new Set<(on: boolean) => void>();

  subscribe(fn: (on: boolean) => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private emit() { this.listeners.forEach((fn) => fn(this.on)); }

  private async load() {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;
    const fetchBuf = async (name: string) => ctx.decodeAudioData(await (await fetch(`${BASE}audio/${name}`)).arrayBuffer());
    const [ambBuf, musicBuf] = await Promise.all([fetchBuf("ambience.m4a"), fetchBuf("music.m4a")]);
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    this.lp = ctx.createBiquadFilter();
    this.lp.type = "lowpass";
    this.lp.Q.value = 0.7;
    this.amb = ctx.createGain();
    this.music = ctx.createGain();
    this.lp.connect(this.amb).connect(this.master);
    this.music.connect(this.master);
    const loop = (buf: AudioBuffer, to: AudioNode) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(to); s.start(); };
    loop(ambBuf, this.lp);
    loop(musicBuf, this.music);
    this.apply(true);
  }

  private apply(instant = false) {
    if (!this.ctx || !this.lp || !this.amb || !this.music) return;
    const l = LEVELS[this.mode], t = this.ctx.currentTime, k = instant ? 0.01 : 0.35;
    this.lp.frequency.setTargetAtTime(l.cutoff, t, k);
    this.amb.gain.setTargetAtTime(l.amb, t, k);
    this.music.gain.setTargetAtTime(l.music, t, k * 1.5);
  }

  setMode(m: ModeKey) { this.mode = m; this.apply(); }

  async toggle() {
    if (!this.on) {
      this.on = true; this.emit();
      try {
        this.loading ??= this.load();
        await this.loading;
        await this.ctx!.resume();
        this.master!.gain.setTargetAtTime(1, this.ctx!.currentTime, 0.4);
      } catch { this.on = false; this.emit(); }
    } else {
      this.on = false; this.emit();
      if (this.ctx && this.master) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
  }

  /// Fade out while the demo video plays with its own sound.
  duck(d: boolean) { if (this.ctx && this.master && this.on) this.master.gain.setTargetAtTime(d ? 0 : 1, this.ctx.currentTime, 0.3); }
}

export const siteSound = new SiteSound();
