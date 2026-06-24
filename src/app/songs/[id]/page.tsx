import { PianoRoll } from "@/components/piano-roll/piano-roll";

const song = {
  title: "Song 1",
  artist: "Artist 1",
};

export default function SongPage() {
  return (
    <main className="flex flex-col items-center pt-4">
      <header className="flex flex-col items-center gap-1">
        <h1 className="text-2xl">{song.title}</h1>
        <h2 className="text-zinc-400">{song.artist}</h2>
      </header>
      <PianoRoll />
    </main>
  );
}
