"use client";
import {
  BLACK_KEYS_WIDTH,
  getVisibleNotes,
  NOTE_WIDTH,
  preparePianoKeys,
  prepareRenderNotes,
} from "@/lib/piano";
import { createClock } from "@/lib/time/clock";
import { PianoNote } from "./piano-note";
import { useEffect, useState } from "react";
import { Note } from "@/types/note";
import { HIT_LINE_Y, VIEWPORT_HEIGHT } from "@/lib/constants";
import { getMsPerBar } from "@/lib/music";
import { TimeSignature } from "@/types/song";

// Notes from A0 to C8
const OCTAVE_WHITE_COUNTS = [2, 7, 7, 7, 7, 7, 7, 7, 1];

// Single test notes

const testNotes: Note[] = [
  { midi: 60, startBeat: 0, durationBeat: 4 },
  { midi: 64, startBeat: 0, durationBeat: 4 },
  { midi: 67, startBeat: 0, durationBeat: 4 },
  { midi: 70, startBeat: 0, durationBeat: 4 },
  { midi: 70, startBeat: 16, durationBeat: 0.5 },
  { midi: 70, startBeat: 16.5, durationBeat: 0.5 },
  { midi: 70, startBeat: 17, durationBeat: 0.5 },
  { midi: 70, startBeat: 17.5, durationBeat: 0.5 },
];

// Multiple test notes
/*
const { whiteKeys } = preparePianoKeys();
const WHITE_MIDIS = whiteKeys.map((k) => k.midi);
const testNotes = Array.from({ length: 2000 }).map((_, i) => ({
  midi: WHITE_MIDIS[i % WHITE_MIDIS.length],
  startBeat: i * 0.25,
  durationBeat: 0.2,
}));
*/

const BPM = 120;
const timeSignature: TimeSignature = {
  beatsPerBar: 4,
  beatUnit: 4,
};

const zoom = 1;
const PX_PER_SEC = 120 * zoom;
const PX_PER_MS = PX_PER_SEC / 1000;

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

  const lastNoteMs = Math.max(
    ...renderNotes.map((n) => n.startMs + n.durationMs),
  );

  const totalBars = Math.ceil(lastNoteMs / getMsPerBar(BPM, timeSignature)) + 1;

  const visibleNotes = getVisibleNotes(renderNotes, cameraTime, viewportMs);

  return (
    <div className="relative h-96 bg-zinc-800 overflow-hidden">
      <div
        className="absolute left-0 right-0 bottom-0 h-2 bg-zinc-700 z-10"
        style={{ top: HIT_LINE_Y }}
      />
      {/* Octaves division */}
      <div className="absolute inset-0 flex pointer-events-none">
        {OCTAVE_WHITE_COUNTS.map((count, index) => (
          <div
            key={index}
            className="h-full border-r border-zinc-700"
            style={{
              flex: count,
              borderRight:
                index === OCTAVE_WHITE_COUNTS.length - 1 ? "none" : undefined,
            }}
          />
        ))}
      </div>

      {/* Bar lines */}
      {Array.from({ length: totalBars }).map((_, i) => {
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
      {visibleNotes.map((note) => {
        return (
          <PianoNote
            key={`${note.midi}-${note.startMs}`}
            note={note}
            time={cameraTime}
            width={note.isBlack ? BLACK_KEYS_WIDTH : NOTE_WIDTH}
            pxPerMs={PX_PER_MS}
          />
        );
      })}
    </div>
  );
};
