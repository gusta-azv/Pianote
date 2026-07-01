"use client";
import { BLACK_KEYS_WIDTH, getVisibleNotes, NOTE_WIDTH } from "@/lib/piano";
import { PianoNote } from "./piano-note";
import { HIT_LINE_Y, VIEWPORT_HEIGHT } from "@/lib/constants";
import { getMsPerBar } from "@/lib/music";
import { usePlaybackContext } from "@/app/contexts/playback-context";
import { useSongContext } from "@/app/contexts/song-context";
import { useSettingsContext } from "@/app/contexts/settings-context";

// Notes from A0 to C8
const OCTAVE_WHITE_COUNTS = [2, 7, 7, 7, 7, 7, 7, 7, 1];

export const PianoViewport = () => {
  const { setPlayback } = usePlaybackContext();
  const { viewportMs, PX_PER_MS } = useSettingsContext();
  const { song, renderNotes, musicTime } = useSongContext();

  const cameraTime = musicTime;
  const BPM = song.bpm;
  const timeSignature = song.timeSignature;

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
      className="relative bg-zinc-800 overflow-hidden"
      onWheel={handleWheel}
      style={{ height: `${VIEWPORT_HEIGHT}px` }}
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
            className="absolute left-0 right-0 pointer-events-none"
            style={{ top: `${y}px` }}
          >
            <div className="h-px bg-zinc-700" />
            {i > 0 && (
              <span className="absolute left-2 -top-5 text-sm text-zinc-500 select-none">
                {i}
              </span>
            )}
          </div>
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
