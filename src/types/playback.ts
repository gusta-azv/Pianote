export type Playback = {
  mode: "play" | "pause";
  baseTime: number; // frozen time when paused
  startRealTime: number; // when it started playing
};
