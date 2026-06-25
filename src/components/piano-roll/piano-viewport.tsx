"use client";
import { prepareRenderNotes } from "@/lib/piano";
import { createClock } from "@/lib/time/clock";
import { PianoNote } from "./piano-note";
import { useEffect, useState } from "react";
import { Note } from "@/types/note";
import { VIEWPORT_HEIGHT } from "@/lib/constants";
import { getMsPerBar } from "@/lib/music";
import { TimeSignature } from "@/types/song";

// Notes from A0 to C8
const OCTAVE_WHITE_COUNTS = [2, 7, 7, 7, 7, 7, 7, 7, 1];

const WHITE_KEYS_COUNT = 52;
const NOTE_WIDTH_RATIO = 0.85;

const COL_WIDTH = 100 / WHITE_KEYS_COUNT;
const NOTE_WIDTH = COL_WIDTH * NOTE_WIDTH_RATIO;
const NOTE_OFFSET = (COL_WIDTH - NOTE_WIDTH) / 2;

// Test notes
const testNotes: Note[] = [
  { midi: 60, startBeat: 0, durationBeat: 4 }, // 1 compass, 1 beat
  { midi: 62, startBeat: 0.5, durationBeat: 0.75 },
  { midi: 64, startBeat: 1, durationBeat: 0.5 },
];
const BPM = 120;
const timeSignature: TimeSignature = {
  beatsPerBar: 4,
  beatUnit: 4,
};

// Piano roll settings
const zoom = 1;
const PX_PER_SEC = 120 * zoom;
const PX_PER_MS = PX_PER_SEC / 1000;

// Bar lines
const viewportMs = VIEWPORT_HEIGHT / PX_PER_MS;
const LOOKAHEAD_MS = viewportMs;

const renderNotes = prepareRenderNotes(testNotes, BPM, timeSignature);

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

  const cameraTime = time + LOOKAHEAD_MS;

  return (
    <div className="relative h-96 border overflow-hidden">
      <div
        className="absolute left-0 right-0 bottom-0 h-2 bg-zinc-700 z-10"
        style={{ top: VIEWPORT_HEIGHT - 8 }}
      />
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

      {/* Bar lines */}
      {Array.from({ length: 40 }).map((_, i) => {
        const barStartMs = i * getMsPerBar(BPM, timeSignature);
        const y = (cameraTime - barStartMs) * PX_PER_MS;
        if (y < 0 || y > VIEWPORT_HEIGHT) return null;

        return (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-zinc-700 pointer-events-none"
            style={{ top: `${y}px` }}
          />
        );
      })}

      {/* Notes */}
      {renderNotes.map((note) => {
        const left = (note.whiteIdx / WHITE_KEYS_COUNT) * 100 + NOTE_OFFSET;

        return (
          <PianoNote
            key={`${note.midi}-${note.startMs}`}
            note={note}
            time={cameraTime}
            left={left}
            width={NOTE_WIDTH}
            pxPerMs={PX_PER_MS}
          />
        );
      })}
    </div>
  );
};
