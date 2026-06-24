"use client";
import { getKeyByMidi } from "@/lib/piano";
import { createClock } from "@/lib/time/clock";
import { PianoNote } from "./piano-note";
import { useEffect, useState } from "react";

// Notes from A0 to C8
const OCTAVE_WHITE_COUNTS = [2, 7, 7, 7, 7, 7, 7, 7, 1];

const WHITE_KEYS_COUNT = 52;
const NOTE_WIDTH_RATIO = 0.85;

const COL_WIDTH = 100 / WHITE_KEYS_COUNT;
const NOTE_WIDTH = COL_WIDTH * NOTE_WIDTH_RATIO;
const NOTE_OFFSET = (COL_WIDTH - NOTE_WIDTH) / 2;

const testNotes: Note[] = [
  { midi: 60, startBeat: 0, durationBeat: 1 },
  { midi: 62, startBeat: 0.5, durationBeat: 0.75 },
  { midi: 64, startBeat: 1, durationBeat: 0.5 },
];
const BPM = 120;

const clock = createClock();
export const PianoViewport = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let raf: number;

    const loop = () => {
      setTime(clock.getTime());
      raf = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative h-96 border overflow-hidden">
      {/* Octaves division */}
      <div className="absolute inset-0 flex pointer-events-none">
        {OCTAVE_WHITE_COUNTS.map((count, index) => (
          <div
            key={index}
            className="h-full border-r border-zinc-800"
            style={{ flex: count }}
          />
        ))}
      </div>

      {/* Notes */}
      {testNotes.map((note) => {
        const key = getKeyByMidi(note.midi);
        if (!key) return null;

        const left = (key.whiteIdx / WHITE_KEYS_COUNT) * 100 + NOTE_OFFSET;

        return (
          <PianoNote
            key={`${note.midi}`}
            note={note}
            time={time}
            left={left}
            width={NOTE_WIDTH}
            bpm={BPM}
          />
        );
      })}
    </div>
  );
};
