import { getMusicTime } from "@/lib/playback";
import { clock } from "@/lib/time/clock";
import { Playback } from "@/types/playback";
import { useCallback, useEffect, useState } from "react";

export function usePlayback(viewportMs: number) {
  const [playback, setPlayback] = useState<Playback>({
    mode: "play",
    baseTime: viewportMs,
    startRealTime: 0,
  });

  // Toggle play
  const togglePlay = useCallback(() => {
    const real = clock.getTime();

    setPlayback((prev) => {
      if (prev.mode === "play") {
        return {
          mode: "pause",
          baseTime: getMusicTime(prev, real),
          startRealTime: real,
        };
      }

      return {
        mode: "play",
        baseTime: prev.baseTime,
        startRealTime: real,
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

  return { playback, setPlayback, togglePlay };
}
