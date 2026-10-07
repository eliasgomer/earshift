#!/usr/bin/env python3
"""Audio for the App Store previews (public/preview-<device>.wav) from src/store/preview-specs.json:
street ambience clear in Aware and "ANC"-filtered otherwise, the CC0 music forward once it is quiet,
taps/clicks, and phone-band crowd voices while the Mac video call is open."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPECS = json.loads((ROOT / "src/store/preview-specs.json").read_text())
FPS, FADE = 30, 0.45


def env(points):
    pts = sorted(points)
    return "(" + "+".join(
        f"between(t,{a:.3f},{b:.3f})*({g0}+({g1}-{g0})*(t-{a:.3f})/{b - a:.3f})"
        for (a, g0), (b, g1) in zip(pts, pts[1:]) if b > a) + ")"


for device, spec in SPECS.items():
    total = spec["duration"] / FPS
    modes = [(at / FPS, m) for at, m in spec["modes"]]

    def mode_env(level):
        pts = [(0.0, level(modes[0][1]))]
        for i, (at, m) in enumerate(modes[1:], 1):
            pts += [(at, level(modes[i - 1][1])), (at + FADE, level(m))]
        pts += [(total - 0.6, level(modes[-1][1])), (total, 0)]
        return env(pts)

    clear = mode_env(lambda m: 1.0 if m == "aware" else 0.0)
    anc = mode_env(lambda m: 0.0 if m == "aware" else 1.0)
    music = mode_env(lambda m: {"aware": 0.2, "quiet": 0.9, "immersion": 1.1}[m])
    f = [
        f"[0:a]atrim=200:{200 + total},asetpts=N/SR/TB,aformat=channel_layouts=stereo[st]",
        f"[1:a]aloop=loop=2:size=2000000,atrim=0:{total},asetpts=N/SR/TB,aformat=channel_layouts=stereo,volume=0.7[ml]",
        "[st][ml]amix=inputs=2:normalize=0,loudnorm=I=-19:TP=-2,aresample=48000,asplit=2[a][b]",
        f"[a]volume='{clear}':eval=frame[c]",
        f"[b]lowpass=f=320,lowpass=f=320,volume=0.15,volume='{anc}':eval=frame[n]",
        f"[2:a]atrim=15:{15 + total},asetpts=N/SR/TB,aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-18:TP=-2,volume='{music}':eval=frame[m]",
    ]
    mix = ["[c]", "[n]", "[m]"]
    if "call" in spec:
        a, b = spec["call"][0] / FPS, spec["call"][1] / FPS
        g = env([(0, 0), (a, 0), (a + 0.4, 1), (b - 0.3, 1), (b, 0), (total, 0)])
        f.append(f"[1:a]atrim=4:{4 + total},asetpts=N/SR/TB,aresample=48000,highpass=f=350,lowpass=f=3200,aformat=channel_layouts=stereo,volume=1.3,volume='{g}':eval=frame[v]")
        mix.append("[v]")
    for i, tap in enumerate(spec["taps"]):
        ms = int(tap / FPS * 1000)
        f.append(f"aevalsrc='0.5*sin(2*PI*2300*t)*exp(-t*95)+0.3*sin(2*PI*880*t)*exp(-t*55)|0.5*sin(2*PI*2300*t)*exp(-t*95)+0.3*sin(2*PI*880*t)*exp(-t*55)':s=48000:d=0.15,adelay={ms}|{ms},apad=whole_dur={total}[k{i}]")
        mix.append(f"[k{i}]")
    f.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=first,atrim=0:{total},alimiter=limit=0.89[out]")
    out = ROOT / f"public/preview-{device}.wav"
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                    "-i", str(ROOT / "audio-src/street1.ogg"), "-i", str(ROOT / "audio-src/mall.ogg"), "-i", str(ROOT / "audio-src/lofi.m4a"),
                    "-filter_complex", ";".join(f), "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", str(out)], check=True)
    print("wrote", out.name, f"{total:.1f}s")
