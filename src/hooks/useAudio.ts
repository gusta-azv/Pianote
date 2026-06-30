import { getSampler } from "@/lib/audio";
import { useEffect, useRef } from "react";
import * as Tone from "tone";

export function useAudio(activeMidis: Set<number>) {
  const prevMidisRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const sampler = getSampler();
    if (!sampler) return;

    const prevMidis = prevMidisRef.current;

    activeMidis.forEach((midi) => {
      if (!prevMidis.has(midi)) {
        const note = Tone.Frequency(midi, "midi").toNote();
        sampler.triggerAttack(note, Tone.now());
      }
    });

    prevMidis.forEach((midi) => {
      if (!activeMidis.has(midi)) {
        const note = Tone.Frequency(midi, "midi").toNote();
        sampler.triggerRelease(note, Tone.now());
      }
    });

    prevMidisRef.current = activeMidis;
  }, [activeMidis]);
}
