// Renders the App Store previews and re-encodes them to Apple's spec
// (H.264 High@4.0, ~11 Mbit/s, 30 fps, stereo AAC 256 kbit/s).
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [iosOut, macOut] = process.argv.slice(2);
const browserExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const serveUrl = await bundle({ entryPoint: join(root, "src/index.ts") });
const comps = (await getCompositions(serveUrl, { browserExecutable })).filter((c) => c.id.startsWith("preview-"));
for (const comp of comps) {
  const [, device, lang] = comp.id.split("-");
  const dir = join(device === "mac" ? macOut : iosOut, lang);
  mkdirSync(dir, { recursive: true });
  const tmp = join(root, "out", `${comp.id}.raw.mp4`);
  await renderMedia({ composition: comp, serveUrl, codec: "h264", outputLocation: tmp, crf: 14, browserExecutable });
  const out = join(dir, `app-preview-${device}.mp4`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, "-c:v", "libx264", "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p",
    "-b:v", "11M", "-maxrate", "12M", "-bufsize", "24M", "-r", "30", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", out]);
  rmSync(tmp);
  console.log(comp.id, "->", out);
}
