import { HIT_LINE_Y, NOTE_GAP_PX } from "@/lib/constants";
import { RenderNote } from "@/types/render-note";

type Props = {
  note: RenderNote;
  time: number; // camera time, ms
  width: number;
  pxPerMs: number;
  msPerBeat: number;
};

export const PianoNote = ({ note, time, width, pxPerMs, msPerBeat }: Props) => {
  const startMs = note.startBeat * msPerBeat;
  const durationMs = note.durationBeat * msPerBeat;

  const height = durationMs * pxPerMs - NOTE_GAP_PX;
  const y = (time - startMs) * pxPerMs - height;

  const isHit = y + height >= HIT_LINE_Y && y <= HIT_LINE_Y;

  return (
    <div
      className={`absolute rounded-sm ${
        isHit
          ? note.isBlack
            ? "bg-emerald-600"
            : "bg-emerald-300"
          : note.isBlack
            ? "bg-emerald-800"
            : "bg-emerald-500"
      }`}
      style={{
        left: `${note.left}%`,
        width: `${width}%`,
        height: `${height}px`,
        top: `${y}px`,
      }}
    />
  );
};
