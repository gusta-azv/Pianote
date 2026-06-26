import { Playback } from "@/types/playback";

export function getMusicTime(playback: Playback, realTime: number) {
  if (playback.mode === "pause") {
    return playback.baseTime;
  }

  return playback.baseTime + (realTime - playback.startRealTime);
}
