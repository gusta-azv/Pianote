import { Note } from "@/types/note";
import { Midi } from "@tonejs/midi";

export async function loadMidi(
  url: string,
): Promise<{ notes: Note[]; bpm: number }> {
  // Fetch midi file and parse it into a midi object
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const midi = new Midi(buffer);

  // Extract the bpm from the first tempo, default to 120 if none
  const bpm = Math.round(midi.header.tempos[0]?.bpm ?? 120);

  // Convert midi notes from all tracks to the Note format
  // ticks / ppq converts midi ticks to quarter notes (beats)
  const notes: Note[] = midi.tracks.flatMap((track) =>
    track.notes.map((note) => ({
      midi: note.midi,
      startBeat: note.ticks / midi.header.ppq,
      durationBeat: note.durationTicks / midi.header.ppq,
    })),
  );

  return { notes, bpm };
}
