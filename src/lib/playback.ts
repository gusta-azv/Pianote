import { Playback } from "@/types/playback";

export function getMusicTime(
  playback: Playback,
  realTime: number,
  speed = 1,
): number {
  if (playback.mode === "pause") return playback.baseTime;

  const elapsedMs = (realTime - playback.startRealTime) * speed;

  return playback.baseTime + elapsedMs;
}
