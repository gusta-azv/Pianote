import { RenderNote } from "@/types/render-note";

type Props = {
  note: RenderNote;
  time: number; // ms
  left: number;
  width: number;
  pxPerMs: number;
};

export const PianoNote = ({ note, time, left, width, pxPerMs }: Props) => {
  const y = (time - note.startMs) * pxPerMs;
  const noteHeight = note.durationMs * pxPerMs;

  return (
    <div
      className="absolute bg-emerald-500"
      style={{
        left: `${left}%`,
        width: `${width}%`,
        height: `${noteHeight}px`,
        top: `${y}px`,
      }}
    />
  );
};
