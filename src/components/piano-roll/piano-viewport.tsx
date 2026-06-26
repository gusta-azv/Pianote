"use client";
import {
  BLACK_KEYS_WIDTH,
  getVisibleNotes,
  NOTE_WIDTH,
  prepareRenderNotes,
} from "@/lib/piano";
import { PianoNote } from "./piano-note";
import { useCallback, useState } from "react";
import { Note } from "@/types/note";
import {
  HIT_LINE_Y,
  PX_PER_MS,
  VIEWPORT_HEIGHT,
  viewportMs,
} from "@/lib/constants";
import { getMsPerBar } from "@/lib/music";
import { TimeSignature } from "@/types/song";
import { getMusicTime } from "@/lib/playback";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { usePlaybackContext } from "@/app/contexts/playback-context";

// Notes from A0 to C8
const OCTAVE_WHITE_COUNTS = [2, 7, 7, 7, 7, 7, 7, 7, 1];

// Test notes
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

// Song info
const BPM = 120;
const timeSignature: TimeSignature = {
  beatsPerBar: 4,
  beatUnit: 4,
};

const renderNotes = prepareRenderNotes(testNotes, BPM, timeSignature);

export const PianoViewport = () => {
  const [realTime, setRealTime] = useState(0);
  const { playback, setPlayback } = usePlaybackContext();

  const onFrame = useCallback((t: number) => setRealTime(t), []);
  useAnimationFrame(onFrame);

  const musicTime = getMusicTime(playback, realTime);
  const cameraTime = musicTime;

  const lastNoteMs = Math.max(
    ...renderNotes.map((n) => n.startMs + n.durationMs),
  );

  const totalBars = Math.ceil(lastNoteMs / getMsPerBar(BPM, timeSignature)) + 1;

  const visibleNotes = getVisibleNotes(renderNotes, cameraTime, viewportMs);

  // Camera scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    setPlayback((prev) => {
      if (prev.mode !== "pause") return prev;

      return {
        ...prev,
        baseTime: Math.max(viewportMs, prev.baseTime - e.deltaY / PX_PER_MS),
      };
    });
  };

  return (
    <div
      className="relative h-96 bg-zinc-800 overflow-hidden"
      onWheel={handleWheel}
    >
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
