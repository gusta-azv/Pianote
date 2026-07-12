import { HIT_LINE_Y, NOTE_GAP_PX } from "@/lib/constants";
import { RenderNote } from "@/types/render-note";

type Props = {
  note: RenderNote;
  time: number; // ms
  width: number;
  pxPerMs: number;
};

export const PianoNote = ({ note, time, width, pxPerMs }: Props) => {
  const height = note.durationMs * pxPerMs - NOTE_GAP_PX;
  const y = (time - note.startMs) * pxPerMs - height;

  const isHit = y + height >= HIT_LINE_Y && y <= HIT_LINE_Y;

  return (
    <div
      className={`absolute rounded-sm`}
      style={{
        left: `${note.left}%`,
        width: `${width}%`,
        height: `${height}px`,
        top: `${y}px`,
        backgroundColor: isHit ? note.hit : note.color,
      }}
    />
  );
};
