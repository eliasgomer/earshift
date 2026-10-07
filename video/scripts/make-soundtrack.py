#!/usr/bin/env python3
"""Soundtrack for the launch film (public/soundtrack*.wav).

Layers, all driven by src/timeline.json (+ optional voice durations):
  ambience  street + crowd; clear in Aware, "ANC" filtered in Quiet/Immersion
  music     CC0 lofi track - what you are listening to; comes forward once the noise is gone
  call      crowd recording band-limited like a phone line while the video call is open
  sfx       UI clicks, transition swells, outro hit
  voice     (optional) ElevenLabs narration per scene, ambience/music ducked underneath

Usage: make-soundtrack.py                 -> public/soundtrack.wav
       make-soundtrack.py --voice de|en   -> public/soundtrack-narrated-<lang>.wav (needs vo/<lang>/<scene>.mp3)
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = json.loads((ROOT / "src/timeline.json").read_text())
VOICE = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == "--voice" else None
OVER = json.loads((ROOT / "src/vo-durations.json").read_text()).get(VOICE, {}) if VOICE else {}
FPS = RAW["fps"]

start, dur, t = {}, {}, 0
for s in RAW["scenes"]:
    start[s["id"]] = t
    dur[s["id"]] = max(s["dur"], OVER.get(s["id"], 0))
    t += dur[s["id"]]
TOTAL = t / FPS
sec = lambda f: f / FPS
absf = lambda e: start[e["scene"]] + e["at"]
modes = [(sec(absf(m)), m["mode"]) for m in RAW["modes"]]
clicks = [sec(absf(c)) for c in RAW["clicks"]]
call_from = sec(start[RAW["call"]["scene"]] + RAW["call"]["from"])
call_to = sec(start["designs"])
outro = sec(start["outro"])
cuts = [sec(start[s["id"]]) for s in RAW["scenes"][1:]]
FADE = 0.5


def env(points):
    pts = sorted(points)
    parts = []
    for (t0, g0), (t1, g1) in zip(pts, pts[1:]):
        if t1 <= t0:
            continue
        parts.append(f"between(t,{t0:.3f},{t1:.3f})*({g0}+({g1}-{g0})*(t-{t0:.3f})/{t1 - t0:.3f})")
    return "(" + "+".join(parts) + ")"


def mode_env(level):
    """Gain over time from a per-mode level, crossfading at each change, fading out at the end."""
    pts = [(0.0, level(modes[0][1]))]
    for i, (at, m) in enumerate(modes[1:], 1):
        pts += [(at, level(modes[i - 1][1])), (at + FADE, level(m))]
    pts += [(outro, level(modes[-1][1])), (outro + 1.2, level(modes[-1][1]) * 0.5), (TOTAL - 0.4, 0), (TOTAL, 0)]
    return env(pts)


# Ambience: loud in Aware, muffled otherwise; the cold open swells in.
clear = mode_env(lambda m: 1.0 if m == "aware" else 0.0)
anc = mode_env(lambda m: 0.0 if m == "aware" else 1.0)
open_swell = env([(0, 0.25), (1.6, 1.0), (TOTAL, 1.0)])
# Music: hidden under the noise at first, forward in Quiet, biggest in Immersion, ducked in the call.
music_lv = {"aware": 0.22, "quiet": 0.95, "immersion": 1.15}
music = mode_env(lambda m: music_lv[m])
music_open = env([(0, 0.0), (sec(start["click"]) - 0.5, 0.0), (sec(start["click"]), 1.0), (TOTAL, 1.0)])
duck_call = env([(0, 1), (call_from, 1), (call_from + 0.6, 0.55), (call_to, 0.55), (call_to + 0.6, 1), (TOTAL, 1)])
call_gain = env([(0, 0), (call_from, 0), (call_from + 0.4, 1), (call_to - 0.3, 1), (call_to, 0), (TOTAL, 0)])
outro_lift = env([(0, 1), (outro, 1), (outro + 0.4, 1.35), (TOTAL - 1.5, 1.35), (TOTAL, 0)])

inputs = ["-i", str(ROOT / "audio-src/street1.ogg"), "-i", str(ROOT / "audio-src/mall.ogg"), "-i", str(ROOT / "audio-src/lofi.m4a")]
f = [
    f"[0:a]atrim=200:{200 + TOTAL},asetpts=N/SR/TB,aformat=channel_layouts=stereo[street]",
    f"[1:a]aloop=loop=3:size=2000000,atrim=0:{TOTAL},asetpts=N/SR/TB,aformat=channel_layouts=stereo,volume=0.7[mall]",
    "[street][mall]amix=inputs=2:normalize=0,loudnorm=I=-19:TP=-2:LRA=9,aresample=48000,asplit=2[bA][bB]",
    f"[bA]volume='{clear}*{open_swell}':eval=frame[amb_clear]",
    f"[bB]lowpass=f=320,lowpass=f=320,highpass=f=40,volume=0.15,volume='{anc}':eval=frame[amb_anc]",
    # Music from its full-beat section, widened in Immersion via extrastereo.
    f"[2:a]atrim=15:{15 + TOTAL},asetpts=N/SR/TB,aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-18:TP=-2,"
    f"volume='{music}*{music_open}*{duck_call}*{outro_lift}':eval=frame,extrastereo=m=1.6[music]",
    # Video call voices: crowd recording through a phone-band filter, mono-ish.
    f"[1:a]atrim=4:{4 + TOTAL},asetpts=N/SR/TB,aresample=48000,highpass=f=350,lowpass=f=3200,acompressor,pan=stereo|c0=0.6*c0+0.4*c1|c1=0.4*c0+0.6*c1,"
    f"volume=1.4,volume='{call_gain}':eval=frame[call]",
]
mix = ["[amb_clear]", "[amb_anc]", "[music]", "[call]"]
for i, t0 in enumerate(clicks):
    ms = int(t0 * 1000)
    f.append(f"aevalsrc='0.5*sin(2*PI*2300*t)*exp(-t*95)+0.32*sin(2*PI*880*t)*exp(-t*55)|0.5*sin(2*PI*2300*t)*exp(-t*95)+0.32*sin(2*PI*880*t)*exp(-t*55)':s=48000:d=0.15,adelay={ms}|{ms},apad=whole_dur={TOTAL}[c{i}]")
    mix.append(f"[c{i}]")
for i, t0 in enumerate(cuts):
    ms = int(max(0, t0 - 0.55) * 1000)
    f.append(f"anoisesrc=d=1.0:c=pink:a=0.3:r=48000,aformat=channel_layouts=stereo,bandpass=f=1400:w=1100,afade=t=in:d=0.6,afade=t=out:st=0.6:d=0.4,volume=0.3,adelay={ms}|{ms},apad=whole_dur={TOTAL}[s{i}]")
    mix.append(f"[s{i}]")
ms = int(outro * 1000)
f.append(f"aevalsrc='0.6*sin(2*PI*(55-25*t)*t)*exp(-t*3.2)|0.6*sin(2*PI*(55-25*t)*t)*exp(-t*3.2)':s=48000:d=2.2,lowpass=f=180,adelay={ms + 250}|{ms + 250},apad=whole_dur={TOTAL}[hit]")
mix.append("[hit]")

if VOICE:
    vdir = ROOT / "vo" / VOICE
    voice_parts = []
    for s in RAW["scenes"]:
        mp3 = vdir / f"{s['id']}.mp3"
        if not mp3.exists():
            continue
        idx = len(inputs) // 2
        inputs += ["-i", str(mp3)]
        delay = int((sec(start[s["id"]] + RAW.get("voiceOffsets", {}).get(s["id"], 0)) + 0.35) * 1000)
        f.append(f"[{idx}:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-1.5,adelay={delay}|{delay},apad=whole_dur={TOTAL}[v_{s['id']}]")
        voice_parts.append(f"[v_{s['id']}]")
    f.append(f"{''.join(voice_parts)}amix=inputs={len(voice_parts)}:normalize=0,asplit=2[voice][vkey]")
    bed = "".join(mix)
    f.append(f"{bed}amix=inputs={len(mix)}:normalize=0[bed]")
    f.append("[bed][vkey]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[ducked]")
    f.append(f"[ducked][voice]amix=inputs=2:normalize=0,atrim=0:{TOTAL},alimiter=limit=0.89[out]")
    out = ROOT / f"public/soundtrack-narrated-{VOICE}.wav"
else:
    f.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{TOTAL},alimiter=limit=0.89[out]")
    out = ROOT / "public/soundtrack.wav"

subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *inputs, "-filter_complex", ";".join(f),
                "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", str(out)], check=True)
print("wrote", out, f"{TOTAL:.2f}s")
