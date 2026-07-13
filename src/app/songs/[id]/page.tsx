"use client";
import { PianoRoll } from "@/components/piano-roll/piano-roll";
import { Song } from "@/types/song";
import { PlaybackControls } from "@/components/piano-roll/controls/playback-controls";
import { BpmControl } from "@/components/piano-roll/controls/bpm-control";
import { SongProvider } from "@/app/contexts/song-context";
import { SongControls } from "@/components/piano-roll/controls/song-controls";
import { SettingsProvider } from "@/app/contexts/settings-context";
import { useEffect, useState } from "react";
import { loadMidi } from "@/lib/midi";
import { VolumeControl } from "@/components/piano-roll/controls/volume-control";
import { TrackControl } from "@/components/piano-roll/controls/track-control";

/*
const song: Song = {
  title: "Afterthought",
  artist: "Fugazi",
  bpm: 115,
  originalBpm: 115,
  timeSignature: { beatsPerBar: 4, beatUnit: 4 },
  notes: [
    { midi: 38, startBeat: 0, durationBeat: 4 },
    { midi: 50, startBeat: 0, durationBeat: 0.5 },
    { midi: 66, startBeat: 0.5, durationBeat: 0.5 },
    { midi: 64, startBeat: 1, durationBeat: 0.5 },
    { midi: 66, startBeat: 1.5, durationBeat: 0.5 },
    { midi: 62, startBeat: 2, durationBeat: 0.5 },
    { midi: 66, startBeat: 2.5, durationBeat: 0.5 },
    { midi: 64, startBeat: 3, durationBeat: 0.5 },
    { midi: 66, startBeat: 3.5, durationBeat: 0.5 },
    { midi: 33, startBeat: 4, durationBeat: 4 },
    { midi: 64, startBeat: 4, durationBeat: 0.5 },
    { midi: 62, startBeat: 4.5, durationBeat: 0.5 },
    { midi: 61, startBeat: 5, durationBeat: 3 },
    { midi: 40, startBeat: 8, durationBeat: 4 },
    { midi: 52, startBeat: 8, durationBeat: 0.5 },
    { midi: 68, startBeat: 8.5, durationBeat: 0.5 },
    { midi: 66, startBeat: 9, durationBeat: 0.5 },
    { midi: 68, startBeat: 9.5, durationBeat: 0.5 },
    { midi: 71, startBeat: 10, durationBeat: 1 },
    { midi: 68, startBeat: 11, durationBeat: 1 },
    { midi: 35, startBeat: 12, durationBeat: 4 },
    { midi: 66, startBeat: 12, durationBeat: 4 },
    { midi: 41, startBeat: 16, durationBeat: 4 },
    { midi: 69, startBeat: 16.5, durationBeat: 0.5 },
    { midi: 67, startBeat: 17, durationBeat: 0.5 },
    { midi: 69, startBeat: 17.5, durationBeat: 0.5 },
    { midi: 70, startBeat: 18, durationBeat: 1.5 },
    { midi: 69, startBeat: 19.5, durationBeat: 0.5 },
    { midi: 40, startBeat: 20, durationBeat: 2 },
    { midi: 67, startBeat: 20, durationBeat: 1.5 },
    { midi: 65, startBeat: 21.5, durationBeat: 0.5 },
    { midi: 35, startBeat: 22, durationBeat: 2 },
    { midi: 62, startBeat: 22, durationBeat: 2 },
    { midi: 45, startBeat: 24, durationBeat: 4 },
    { midi: 60, startBeat: 24, durationBeat: 3 },
    { midi: 60, startBeat: 27, durationBeat: 1 },
    { midi: 40, startBeat: 28, durationBeat: 4 },
    { midi: 58, startBeat: 28, durationBeat: 4 },
  ],
};
*/

function SongPageContent({ song }: { song: Song }) {
  return (
    <main className="flex flex-col items-center">
      <header className="grid grid-cols-3 w-full max-w-7xl mx-auto items-center px-6 py-2">
        <div className="flex items-center gap-8">
          <PlaybackControls />
          <BpmControl />
          <SongControls />
        </div>
        <div className="text-center">
          <h1 className="text-2xl">{song.title}</h1>
          <h2 className="text-zinc-400">{song.artist}</h2>
        </div>
        <div className="flex justify-end gap-8">
          <TrackControl />
          <VolumeControl />
        </div>
      </header>
      <PianoRoll />
    </main>
  );
}

export default function SongPage() {
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    loadMidi(
      "/midi/Franz Liszt - La Campanella - Grandes Etudes de Paganini No. 3.mid",
    ).then(({ tracks, bpm }) => {
      setSong({
        title: "La Campanella",
        artist: "Franz Liszt",
        bpm,
        originalBpm: bpm,
        timeSignature: { beatsPerBar: 4, beatUnit: 4 },
        tracks,
      });
    });
  }, []);

  if (!song)
    return (
      <div className="absolute inset-0 flex items-center justify-center text-3xl">
        Loading...
      </div>
    );

  return (
    <SettingsProvider>
      <SongProvider song={song}>
        <SongPageContent song={song} />
      </SongProvider>
    </SettingsProvider>
  );
}
