import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import { Composition } from "remotion";
import { LaunchFilm, type LaunchFilmProps } from "./LaunchFilm";
import { resolveTimeline, type Durations } from "./timeline";
import narration from "./vo-durations.json";
import { IPadPreview, IPhonePreview, MacPreview, PREVIEW_SPECS } from "./store/PreviewFilms";
import { HeaderArt, MacShot, MobileShot, SHOT_COUNT, SIZES, SearchArt } from "./store/StoreShots";

const film = (id: string, props: LaunchFilmProps) => (
  <Composition id={id} component={LaunchFilm} fps={30} width={1920} height={1080} defaultProps={props}
    durationInFrames={resolveTimeline(props.durations).total}
    calculateMetadata={({ props: p }) => ({ durationInFrames: resolveTimeline(p.durations).total })} />
);

export const Root = () => (
  <>
    {film("film-de", { lang: "de" })}
    {film("film-en", { lang: "en" })}
    {film("film-narrated-de", { lang: "de", voice: true, durations: narration.de as Durations })}
    {film("film-narrated-en", { lang: "en", voice: true, durations: narration.en as Durations })}
    {(["de", "en"] as const).flatMap((lang) => [
      ...(["iphone", "ipad"] as const).flatMap((p) => Array.from({ length: SHOT_COUNT[p] }, (_, i) => (
        <Composition key={`${p}-${i}-${lang}`} id={`shot-${p}-${i + 1}-${lang}`} component={MobileShot} durationInFrames={1} fps={30}
          width={SIZES[p][0]} height={SIZES[p][1]} defaultProps={{ platform: p, index: i, lang }} />
      ))),
      ...Array.from({ length: SHOT_COUNT.mac }, (_, i) => (
        <Composition key={`mac-${i}-${lang}`} id={`shot-mac-${i + 1}-${lang}`} component={MacShot} durationInFrames={1} fps={30}
          width={SIZES.mac[0]} height={SIZES.mac[1]} defaultProps={{ index: i, lang }} />
      )),
      <Composition key={`header-${lang}`} id={`header-${lang}`} component={HeaderArt} durationInFrames={1} fps={30} width={SIZES.header[0]} height={SIZES.header[1]} defaultProps={{ lang }} />,
      <Composition key={`preview-iphone-${lang}`} id={`preview-iphone-${lang}`} component={IPhonePreview} durationInFrames={PREVIEW_SPECS.iphone.duration} fps={30} width={886} height={1920} defaultProps={{ lang }} />,
      <Composition key={`preview-ipad-${lang}`} id={`preview-ipad-${lang}`} component={IPadPreview} durationInFrames={PREVIEW_SPECS.ipad.duration} fps={30} width={1200} height={1600} defaultProps={{ lang }} />,
      <Composition key={`preview-mac-${lang}`} id={`preview-mac-${lang}`} component={MacPreview} durationInFrames={PREVIEW_SPECS.mac.duration} fps={30} width={1920} height={1080} defaultProps={{ lang }} />,
      <Composition key={`search-${lang}`} id={`search-${lang}`} component={SearchArt} durationInFrames={1} fps={30} width={SIZES.search[0]} height={SIZES.search[1]} defaultProps={{ lang }} />,
    ])}
  </>
);
