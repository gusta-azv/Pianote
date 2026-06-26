"use client";
import { PlaybackProvider } from "@/app/contexts/playback-context";
import { PianoRoll } from "@/components/piano-roll/piano-roll";
import { viewportMs } from "@/lib/constants";
import { usePlaybackContext } from "@/app/contexts/playback-context";
import { Pause, Play } from "lucide-react";

const song = {
  title: "Song 1",
  artist: "Artist 1",
};

function SongPageContent() {
  const { playback, togglePlay } = usePlaybackContext();
  const isPlaying = playback.mode === "play";

  return (
    <main className="flex flex-col items-center">
      <header className="flex w-full max-w-7xl mx-auto justify-between items-center px-6 py-2">
        <button onClick={togglePlay}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <div className="text-center">
          <h1 className="text-2xl">{song.title}</h1>
          <h2 className="text-zinc-400">{song.artist}</h2>
        </div>
        <div className="w-12" />
      </header>
      <PianoRoll />
    </main>
  );
}

export default function SongPage() {
  return (
    <PlaybackProvider viewportMs={viewportMs}>
      <SongPageContent />
    </PlaybackProvider>
  );
}
