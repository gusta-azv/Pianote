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
  const msPerBeat = getMsPerBeat(song.bpm);
  const msPerBar = getMsPerBar(song.bpm, song.timeSignature);

  const lastNoteBeat = Math.max(
    0,
    ...renderNotes.map((n) => n.startBeat + n.durationBeat),
  );
  const lastNoteMs = lastNoteBeat * msPerBeat;

  return Math.ceil(lastNoteMs / msPerBar) + 1;
}
