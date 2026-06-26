import { RenderNote } from "@/types/render-note";
import { Song, TimeSignature } from "@/types/song";

export function beatToMs(beat: number, bpm: number) {
  return (beat * 60_000) / bpm;
}

export const getMsPerBeat = (bpm: number) => 60_000 / bpm;
export const getMsPerBar = (bpm: number, timeSignature: TimeSignature) => {
  const msPerBeat = getMsPerBeat(bpm);
  const beatDuration = 4 / timeSignature.beatUnit;
  return msPerBeat * timeSignature.beatsPerBar * beatDuration;
};

// future function to get number of bars according to respective song
export function getTotalBars(song: Song, renderNotes: RenderNote[]) {
  const lastNoteMs = Math.max(
    0,
    ...renderNotes.map((n) => n.startMs + n.durationMs),
  );

  const minimumBars =
    Math.ceil(lastNoteMs / getMsPerBar(song.bpm, song.timeSignature)) + 1;

  return Math.max(song.barCount, minimumBars);
}
