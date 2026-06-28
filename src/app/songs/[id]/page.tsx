"use client";
import { PlaybackProvider } from "@/app/contexts/playback-context";
import { PianoRoll } from "@/components/piano-roll/piano-roll";
import { viewportMs } from "@/lib/constants";
import { usePlaybackContext } from "@/app/contexts/playback-context";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { getMsPerBar } from "@/lib/music";
import { prepareRenderNotes } from "@/lib/piano";
import { Song } from "@/types/song";

const song: Song = {
  title: "Song 1",
  artist: "Artist 1",
  bpm: 120,
  timeSignature: { beatsPerBar: 4, beatUnit: 4 },
  notes: [
    { midi: 60, startBeat: 0, durationBeat: 4 },
    { midi: 64, startBeat: 0, durationBeat: 4 },
    { midi: 67, startBeat: 0, durationBeat: 4 },
    { midi: 70, startBeat: 0, durationBeat: 4 },
    { midi: 70, startBeat: 16, durationBeat: 0.5 },
    { midi: 70, startBeat: 16.5, durationBeat: 0.5 },
    { midi: 70, startBeat: 17, durationBeat: 0.5 },
    { midi: 70, startBeat: 17.5, durationBeat: 0.5 },
  ],
};

const renderNotes = prepareRenderNotes(
  song.notes,
  song.bpm,
  song.timeSignature,
);
const lastNoteMs = Math.max(
  ...renderNotes.map((n) => n.startMs + n.durationMs),
);
const msPerBar = getMsPerBar(song.bpm, song.timeSignature);

function SongPageContent() {
  const { playback, togglePlay, skipForward, skipBack } = usePlaybackContext();
  const isPlaying = playback.mode === "play";

  return (
    <main className="flex flex-col items-center">
      <header className="grid grid-cols-3 w-full max-w-7xl mx-auto items-center px-6 py-2">
        <div className="flex items-center gap-8">
          <button onClick={togglePlay} className="focus:outline-none">
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={skipBack} className="focus:outline-none">
              <SkipBack size={24} />
            </button>
            <button onClick={skipForward} className="focus:outline-none">
              <SkipForward size={24} />
            </button>
          </div>
          <button className="flex flex-col items-center">
            <span>120</span>
            <span>BPM</span>
          </button>
        </div>
        <div className="text-center">
          <h1 className="text-2xl">{song.title}</h1>
          <h2 className="text-zinc-400">{song.artist}</h2>
        </div>
        <div className="w-12" />
      </header>
      <PianoRoll song={song} />
    </main>
  );
}

export default function SongPage() {
  return (
    <PlaybackProvider
      viewportMs={viewportMs}
      lastNoteMs={lastNoteMs}
      msPerBar={msPerBar}
    >
      <SongPageContent />
    </PlaybackProvider>
  );
}
