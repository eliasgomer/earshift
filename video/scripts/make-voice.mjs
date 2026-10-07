#!/usr/bin/env node
// Generates the narration with ElevenLabs (one clip per scene and language) and
// writes src/vo-durations.json so scenes are long enough for their line.
// Key: ~/.elevenlabs-key. Voices per language: vo/script.json → voices.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const key = readFileSync(join(homedir(), ".elevenlabs-key"), "utf8").trim();
const script = JSON.parse(readFileSync(join(root, "vo/script.json"), "utf8"));
const timeline = JSON.parse(readFileSync(join(root, "src/timeline.json"), "utf8"));
const FPS = timeline.fps;
const LEAD = 0.35, TAIL = 0.9; // seconds before / after each line

const durations = {};
for (const lang of ["de", "en"]) {
  const voiceId = script.voices[lang];
  durations[lang] = {};
  mkdirSync(join(root, "vo", lang), { recursive: true });
  const ids = timeline.scenes.map((s) => s.id);
  for (const [i, id] of ids.entries()) {
    const text = script[lang][id];
    if (!text) continue;
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json", accept: "audio/mpeg" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        language_code: lang,
        previous_text: i > 0 ? script[lang][ids[i - 1]] : undefined,
        next_text: script[lang][ids[i + 1]],
        voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0, use_speaker_boost: true, speed: 1.0 },
      }),
    });
    if (!res.ok) throw new Error(`${lang}/${id}: ${res.status} ${await res.text()}`);
    const file = join(root, "vo", lang, `${id}.mp3`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    const secs = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());
    durations[lang][id] = Math.ceil((LEAD + (timeline.voiceOffsets?.[id] ?? 0) / FPS + secs + TAIL) * FPS);
    console.log(lang, id, secs.toFixed(2) + "s");
  }
}
writeFileSync(join(root, "src/vo-durations.json"), JSON.stringify(durations, null, 2) + "\n");
console.log("wrote src/vo-durations.json");
