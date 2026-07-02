export type Playback = {
  mode: "play" | "pause";
  baseBeat: number; // frozes time when paused
  startRealTime: number; // when it starts playing
};
