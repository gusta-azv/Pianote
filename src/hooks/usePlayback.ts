import { getMusicTime } from "@/lib/playback";
import { clock } from "@/lib/time/clock";
import { Playback } from "@/types/playback";
import { useCallback, useEffect, useState } from "react";

export function usePlayback(
  viewportMs: number,
  lastNoteMs: number,
  msPerBar: number,
) {
  const [playback, setPlayback] = useState<Playback>({
    mode: "pause",
    baseTime: viewportMs,
    startRealTime: 0,
  });

  // Toggle play
  const togglePlay = useCallback(() => {
    const realTime = clock.getTime();

    setPlayback((prev) => {
      if (prev.mode === "play") {
        return {
          mode: "pause",
          baseTime: getMusicTime(prev, realTime),
          startRealTime: realTime,
        };
      }

      return {
        mode: "play",
        baseTime: prev.baseTime,
        startRealTime: realTime,
      };
    });
  }, []);

  // Spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  const skipForward = useCallback(() => {
    setPlayback((prev) => {
      const currentTime =
        prev.mode === "play"
          ? getMusicTime(prev, clock.getTime())
          : prev.baseTime;

      const nextTimeMs = (Math.floor(currentTime / msPerBar) + 1) * msPerBar;

      const realTime = clock.getTime();

      return {
        mode: "play",
        baseTime: Math.min(nextTimeMs, lastNoteMs + viewportMs),
        startRealTime: realTime,
      };
    });
  }, [lastNoteMs, msPerBar, viewportMs]);

  const skipBack = useCallback(() => {
    const realTime = clock.getTime();
    setPlayback({
      mode: "pause",
      baseTime: viewportMs,
      startRealTime: realTime,
    });
  }, [viewportMs]);

  return { playback, setPlayback, togglePlay, skipForward, skipBack };
}
