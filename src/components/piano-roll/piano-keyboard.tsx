import { useSongContext } from "@/app/contexts/song-context";
import {
  BLACK_KEYS_WIDTH,
  getBlackKeyPosition,
  preparePianoKeys,
} from "@/lib/piano";

export const PianoKeyboard = () => {
  const { whiteKeys, blackKeys } = preparePianoKeys();
  const { activeMidis } = useSongContext();

  return (
    <div className="relative">
      <div
        className="grid w-full"
        style={{ gridTemplateColumns: "repeat(52,1fr)" }}
      >
        {whiteKeys.map((key) => (
          <div
            key={key.midi}
            className={`h-40 border border-zinc-700 ${activeMidis.has(key.midi) ? "bg-emerald-300" : "bg-white"} `}
          />
        ))}
      </div>
      <div className="absolute inset-0">
        {blackKeys.map((key) => (
          <div
            key={key.midi}
            className={`absolute top-0 h-[65%] ${activeMidis.has(key.midi) ? "bg-emerald-600" : "bg-black"}`}
            style={{
              width: `${BLACK_KEYS_WIDTH}%`,
              left: `${getBlackKeyPosition(key.whiteIdx)}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
