// Renders every App Store still (screenshots, product page header, search result) as JPEG
// (no alpha channel, as App Store Connect requires).
import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [iosOut, macOut] = process.argv.slice(2);
const browserExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const serveUrl = await bundle({ entryPoint: join(root, "src/index.ts") });
const comps = (await getCompositions(serveUrl, { browserExecutable })).filter((c) => /^(shot|header|search)-/.test(c.id));
for (const comp of comps) {
  const m = comp.id.match(/^(?:shot-)?(iphone|ipad|mac|header|search)(?:-(\d+))?-(de|en)$/);
  const [, kind, n, lang] = m;
  const dir = join(kind === "mac" ? macOut : iosOut, lang);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${n ? `${kind}-${n.padStart(2, "0")}` : kind === "header" ? "product-page-header" : "search-result"}.jpg`);
  await renderStill({ composition: comp, serveUrl, output: file, imageFormat: "jpeg", jpegQuality: 95, browserExecutable });
  console.log(comp.id, "->", file.replace(root, ""));
}
