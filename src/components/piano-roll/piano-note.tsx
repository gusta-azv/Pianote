import { VIEWPORT_HEIGHT } from "@/lib/constants";
import { RenderNote } from "@/types/render-note";

type Props = {
  note: RenderNote;
  time: number; // ms
  left: number;
  width: number;
  pxPerMs: number;
};

export const PianoNote = ({ note, time, left, width, pxPerMs }: Props) => {
  const height = note.durationMs * pxPerMs;
  const y = (time - note.startMs) * pxPerMs - height;

  const isHit = y + height >= VIEWPORT_HEIGHT && y <= VIEWPORT_HEIGHT;

  return (
    <div
      className={`absolute ${isHit ? "bg-emerald-300" : "bg-emerald-500"}`}
      style={{
        left: `${left}%`,
        width: `${width}%`,
        height: `${height}px`,
        top: `${y}px`,
      }}
    />
  );
};
