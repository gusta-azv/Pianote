import { ARROW_KEY_STEP_MS } from "@/lib/constants";
import { getMusicTime } from "@/lib/playback";
import { clock } from "@/lib/time/clock";
import { Playback } from "@/types/playback";
import { useCallback, useEffect, useRef, useState } from "react";

export function usePlayback(
  viewportMs: number,
  lastNoteMs: number,
  msPerBar: number,
  bpm: number,
) {
  const msPerBeat = 60_000 / bpm;
  const viewportBeats = viewportMs / msPerBeat;
  const bpmRef = useRef(bpm);
  const viewportMsRef = useRef(viewportMs);
  const lastNoteMsRef = useRef(lastNoteMs);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    viewportMsRef.current = viewportMs;
  }, [viewportMs]);
  useEffect(() => {
    lastNoteMsRef.current = lastNoteMs;
  }, [lastNoteMs]);

  const [playback, setPlayback] = useState<Playback>({
    mode: "pause",
    baseBeat: viewportBeats,
    startRealTime: 0,
  });

  const getViewportBeats = useCallback(
    () => viewportMsRef.current / (60_000 / bpmRef.current),
    [],
  );

  // Toggle play
  const togglePlay = useCallback(() => {
    const realTime = clock.getTime();
    const msPerBeat = 60_000 / bpmRef.current;

    setPlayback((prev) => {
      if (prev.mode === "play") {
        const currentMs = getMusicTime(prev, realTime, bpmRef.current);
        return {
          mode: "pause",
          baseBeat: currentMs / msPerBeat,
          startRealTime: realTime,
        };
      }
      return {
        mode: "play",
        baseBeat: prev.baseBeat,
        startRealTime: realTime,
      };
    });
  }, []);

  const skipForward = useCallback(() => {
    const msPerBeat = 60_000 / bpmRef.current;
    const beatsPerBar = msPerBar / msPerBeat;

    setPlayback((prev) => {
      const currentBeat =
        prev.mode === "play"
          ? getMusicTime(prev, clock.getTime(), bpmRef.current) / msPerBeat
          : prev.baseBeat;

      const nextBeat =
        (Math.floor(currentBeat / beatsPerBar) + 1) * beatsPerBar;
      const maxBeat =
        (lastNoteMsRef.current + viewportMsRef.current) / msPerBeat;

      return {
        mode: "play",
        baseBeat: Math.min(nextBeat, maxBeat),
        startRealTime: clock.getTime(),
      };
    });
  }, [msPerBar]);

  const skipBack = useCallback(() => {
    const realTime = clock.getTime();
    setPlayback({
      mode: "pause",
      baseBeat: getViewportBeats(),
      startRealTime: realTime,
    });
  }, [getViewportBeats]);

  const move = useCallback(
    (deltaMs: number) => {
      const msPerBeat = 60_000 / bpmRef.current;
      setPlayback((prev) => {
        if (prev.mode !== "pause") return prev;
        return {
          ...prev,
          baseBeat: Math.max(
            getViewportBeats(),
            prev.baseBeat + deltaMs / msPerBeat,
          ),
        };
      });
    },
    [getViewportBeats],
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
