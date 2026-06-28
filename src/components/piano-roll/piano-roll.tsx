import { SongProvider } from "@/app/contexts/song-context";
import { PianoKeyboard } from "./piano-keyboard";
import { PianoViewport } from "./piano-viewport";
import { Song } from "@/types/song";

export const PianoRoll = ({ song }: { song: Song }) => {
  return (
    <SongProvider song={song}>
      <div className="w-full max-w-screen-2xl mx-auto">
        <PianoViewport />
        <PianoKeyboard />
      </div>
    </SongProvider>
  );
};
