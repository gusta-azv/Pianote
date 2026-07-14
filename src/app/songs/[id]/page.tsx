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
    loadMidi("/midi/Aphex Twin - Avril 14th.mid").then(
      ({ trackGroups, bpm }) => {
        setSong({
          title: "Title",
          artist: "Artist",
          bpm,
          originalBpm: bpm,
          timeSignature: { beatsPerBar: 4, beatUnit: 4 },
          trackGroups,
        });
      },
    );
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
