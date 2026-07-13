import { Track } from "@/types/track";
import { Midi } from "@tonejs/midi";
import { TRACK_COLORS } from "./track-colors";

export async function loadMidi(
  url: string,
): Promise<{ tracks: Track[]; bpm: number }> {
  // Fetch midi file and parse it into a midi object
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const midi = new Midi(buffer);

  // Debug: log track info
  midi.tracks.forEach((track, i) => {
    console.log({
      index: i,
      name: track.name,
      instrumentNumber: track.instrument.number,
      instrumentName: track.instrument.name,
      instrumentFamily: track.instrument.family,
      noteCount: track.notes.length,
    });
  });

  // Extract the bpm from the first tempo, default to 120 if none
  const bpm = Math.round(midi.header.tempos[0]?.bpm ?? 120);

  // Get active midi tracks
  const activeTracks = midi.tracks.filter((track) => track.notes.length > 0);

  // Each instrument group becomes one Track with merged notes
  const tracks: Track[] = activeTracks.map((track, i) => ({
    id: `track-${i}`,
    name:
      activeTracks.filter(
        (t) => t.instrument.number === track.instrument.number,
      ).length > 1
        ? `${track.instrument.name}` || `${i + 1}`
        : track.instrument.name || `Track ${i + 1}`,
    color: TRACK_COLORS[i % TRACK_COLORS.length].base,
    darkColor: TRACK_COLORS[i % TRACK_COLORS.length].dark,
    hit: TRACK_COLORS[i % TRACK_COLORS.length].hit,
    hitDark: TRACK_COLORS[i % TRACK_COLORS.length].hitDark,
    muted: false,
    solo: false,
    instrumentFamily: track.instrument.family,
    instrumentNumber: track.instrument.number,
    //Merge all notes from tracks with the same instrument
    notes:
      // Convert midi notes from all tracks to the Note format
      // ticks / ppq converts midi ticks to quarter notes (beats)
      track.notes
        .filter(
          (note, i, arr) =>
            // Remove duplicated notes with same midi and tick
            arr.findIndex(
              (n) =>
                n.midi === note.midi &&
                n.ticks === note.ticks &&
                n.durationTicks === note.durationTicks,
            ) === i,
        )
        .map((note) => ({
          midi: note.midi,
          startBeat: note.ticks / midi.header.ppq,
          durationBeat: note.durationTicks / midi.header.ppq,
        })),
  }));

  return { tracks, bpm };
}
