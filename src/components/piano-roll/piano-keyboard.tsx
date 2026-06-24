import {
  BLACK_KEY_WIDTH,
  getBlackKeyPosition,
  preparePianoKeys,
} from "@/lib/piano";

export const PianoKeyboard = () => {
  const { whiteKeys, blackKeys } = preparePianoKeys();

  return (
    <div className="relative">
      <div
        className="grid w-full"
        style={{ gridTemplateColumns: "repeat(52,1fr)" }}
      >
        {whiteKeys.map((key) => (
          <div
            key={key.midi}
            className="h-40 bg-white border border-zinc-900"
          />
        ))}
      </div>
      <div className="absolute inset-0">
        {blackKeys.map((key) => (
          <div
            key={key.midi}
            className="absolute top-0 h-[65%] bg-black"
            style={{
              width: `${BLACK_KEY_WIDTH}%`,
              left: `${getBlackKeyPosition(key.whiteIdx)}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
