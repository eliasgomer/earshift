import { useCallback, useEffect, useState } from "react";
import { Header } from "../components/Chrome";
import { NoiseIntro } from "../site/waveform";
import { Cursor, SmoothScroll } from "../site/motion";
import {
  Automations, BigFooter, CompatFaq, Designs, Everywhere, Film, Hero, Pricing, Privacy, SoundSection, SoundToggle, Story, WidgetStudio,
} from "../site/sections";
import { siteSound } from "../site/sound";
import { MODES, type ModeKey } from "../ui/modes";

export function Home() {
  const [mode, setModeState] = useState<ModeKey>("aware");
  const setMode = useCallback((m: ModeKey) => setModeState((cur) => (cur === m ? cur : m)), []);
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", MODES[mode].accent);
    document.documentElement.style.setProperty("--accent-light", MODES[mode].light);
    siteSound.setMode(mode);
  }, [mode]);
  return (
    <div id="top">
      <SmoothScroll />
      <Cursor />
      <NoiseIntro />
      <Header home extra={<span className="hidden sm:block"><SoundToggle compact /></span>} />
      <main>
        <Hero mode={mode} setMode={setMode} />
        <Story mode={mode} setMode={setMode} />
        <Film />
        <Designs mode={mode} />
        <WidgetStudio mode={mode} />
        <Automations />
        <Everywhere mode={mode} />
        <SoundSection mode={mode} />
        <Privacy />
        <Pricing />
        <CompatFaq />
      </main>
      <BigFooter />
    </div>
  );
}
