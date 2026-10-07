import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import { Composition } from "remotion";
import { LaunchFilm, type LaunchFilmProps } from "./LaunchFilm";
import { resolveTimeline, type Durations } from "./timeline";
import narration from "./vo-durations.json";

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
  </>
);
