export function beatToMs(beat: number, bpm: number) {
  return (beat * 60_000) / bpm;
}
