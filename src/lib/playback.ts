import { Playback } from "@/types/playback";

export function getMusicTime(
  playback: Playback,
  realTime: number,
  bpm: number,
) {
  const msPerBeat = 60_000 / bpm;

  if (playback.mode === "pause") {
    return playback.baseBeat * msPerBeat;
  }

  const elapsedMs = realTime - playback.startRealTime;
  const elapsedBeats = elapsedMs / msPerBeat;

  return (playback.baseBeat + elapsedBeats) * msPerBeat;
}
