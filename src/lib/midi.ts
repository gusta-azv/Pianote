import { Track } from "@/types/track";
import { Midi } from "@tonejs/midi";

const TRACK_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
];

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

  // Group midi tracks by instrument number
  const activeTracks = midi.tracks.filter((track) => track.notes.length > 0);

  const instrumentGroups = activeTracks.reduce(
    (groups, track) => {
      const key = track.instrument.number;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(track);

      return groups;
    },
    {} as Record<number, typeof activeTracks>,
  );

  // Each instrument group becomes one Track with merged notes
  const tracks: Track[] = Object.entries(instrumentGroups).map(
    ([instrumentNumber, trackGroup], i) => ({
      id: `track-${i}`,
      name: trackGroup[0].instrument.name || `Track ${i + 1}`,
      color: TRACK_COLORS[i % TRACK_COLORS.length],
      muted: false,
      instrumentFamily: trackGroup[0].instrument.family,
      instrumentNumber: Number(instrumentNumber),
      //Merge all notes from tracks with the same instrument
      notes: trackGroup.flatMap((track) =>
        // Convert midi notes from all tracks to the Note format
        // ticks / ppq converts midi ticks to quarter notes (beats)
        track.notes.map((note) => ({
          midi: note.midi,
          startBeat: note.ticks / midi.header.ppq,
          durationBeat: note.durationTicks / midi.header.ppq,
        })),
      ),
    }),
  );

  return { tracks, bpm };
}
