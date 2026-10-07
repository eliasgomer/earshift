import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setConcurrency(6);
// The bundled chrome-headless-shell hangs on this macOS; the installed Chrome works.
Config.setBrowserExecutable("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");

// The UI mockups live in ../src/ui (shared with the website). Resolve react & co.
// from this package so there is exactly one React instance in the bundle.
const local = (p: string) => path.join(process.cwd(), "node_modules", p);
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      react: local("react"),
      "react-dom": local("react-dom"),
      "lucide-react": local("lucide-react"),
    },
  },
}));
