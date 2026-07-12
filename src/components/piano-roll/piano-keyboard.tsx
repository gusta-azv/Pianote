import { useSongContext } from "@/app/contexts/song-context";
import {
  BLACK_KEYS_WIDTH,
  getBlackKeyPosition,
  preparePianoKeys,
} from "@/lib/piano";

export const PianoKeyboard = () => {
  const { whiteKeys, blackKeys } = preparePianoKeys();
  const { activeMidis, activeMidiColors } = useSongContext();

  return (
    <div className="relative">
      <div
        className="grid w-full"
        style={{ gridTemplateColumns: "repeat(52,1fr)" }}
      >
        {whiteKeys.map((key) => (
          <div
            key={key.midi}
            className="h-40 border border-zinc-700"
            style={{
              backgroundColor: activeMidis.has(key.midi)
                ? activeMidiColors.get(key.midi)!.hit
                : "white",
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0">
        {blackKeys.map((key) => (
          <div
            key={key.midi}
            className="absolute top-0 h-[65%] "
            style={{
              width: `${BLACK_KEYS_WIDTH}%`,
              left: `${getBlackKeyPosition(key.whiteIdx)}%`,
              backgroundColor: activeMidis.has(key.midi)
                ? activeMidiColors.get(key.midi)!.hit
                : "black",
            }}
          />
        ))}
      </div>
    </div>
  );
};
