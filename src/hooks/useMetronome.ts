import { getMetronome } from "@/lib/audio";
import { useEffect, useRef } from "react";

export function useMetronome(
  musicTime: number,
  msPerBeat: number,
  beatsPerBar: number,
  active: boolean,
) {
  const prevBeatRef = useRef(-1);

  useEffect(() => {
    if (!active) return;

    const metronome = getMetronome();
    if (!metronome) return;

    const currentBeat = Math.floor(musicTime / msPerBeat);

    if (currentBeat !== prevBeatRef.current) {
      prevBeatRef.current = currentBeat;
      const isAccent = currentBeat % beatsPerBar === 0;
      if (isAccent) metronome.accent();
      else metronome.tick();
    }
  }, [active, beatsPerBar, msPerBeat, musicTime]);
}
