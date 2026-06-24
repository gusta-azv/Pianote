type Props = {
  note: Note;
  time: number; // ms
  left: number;
  width: number;
};

export const PianoNote = ({ note, time, left, width }: Props) => {
  const PX_PER_SEC = 120;
  const PX_PER_MS = PX_PER_SEC / 1000;

  const y = (time - note.start) * PX_PER_MS;
  const noteHeight = note.duration * PX_PER_MS;

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
