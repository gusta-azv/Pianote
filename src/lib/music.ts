import { TimeSignature } from "@/types/song";

export function beatToMs(beat: number, bpm: number) {
  return (beat * 60_000) / bpm;
}

export const getMsPerBeat = (bpm: number) => 60_000 / bpm;
export const getMsPerBar = (bpm: number, timeSignature: TimeSignature) => {
  const msPerBeat = getMsPerBeat(bpm);
  const beatDuration = 4 / timeSignature.beatUnit;
  return msPerBeat * timeSignature.beatsPerBar * beatDuration;
};
