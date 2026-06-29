import { ARROW_KEY_STEP_MS } from "@/lib/constants";
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

  const move = useCallback(
    (deltaMs: number) => {
      setPlayback((prev) => {
        if (prev.mode !== "pause") return prev;

        return {
          ...prev,
          baseTime: Math.max(viewportMs, prev.baseTime + deltaMs),
        };
      });
    },
    [viewportMs],
  );

  const moveUp = useCallback(() => {
    move(ARROW_KEY_STEP_MS);
  }, [move]);

  const moveDown = useCallback(() => {
    move(-ARROW_KEY_STEP_MS);
  }, [move]);

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          skipForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipBack();
          break;
        case "ArrowUp":
          e.preventDefault();
          moveUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          moveDown();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skipForward, skipBack, moveUp, moveDown]);

  return { playback, setPlayback, togglePlay, skipForward, skipBack };
}
