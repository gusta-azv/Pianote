type Props = {
  note: Note;
  time: number; // ms
  left: number;
  width: number;
  bpm: number;
};

export const PianoNote = ({ note, time, left, width, bpm }: Props) => {
  const PX_PER_SEC = 120;
  const PX_PER_MS = PX_PER_SEC / 1000;
  const beatToMs = (beat: number, bpm: number) => (beat / bpm) * 60_000;

  const startMs = beatToMs(note.startBeat, bpm);
  const durationMs = beatToMs(note.durationBeat, bpm);

  const y = (time - startMs) * PX_PER_MS;
  const noteHeight = durationMs * PX_PER_MS;

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
