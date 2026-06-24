import { PianoKey } from "@/types/piano-key";
import { RenderNote } from "@/types/render-note";
import { beatToMs } from "./music";
import { Note } from "@/types/note";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function generatePianoKeys(): PianoKey[] {
  const keys: PianoKey[] = [];

  for (let midi = 21; midi <= 108; midi++) {
    const noteIdx = midi % 12;

    const note = NOTES[noteIdx];

    const octave = Math.floor(midi / 12) - 1;

    keys.push({
      midi,
      note,
      octave,
      isBlack: note.includes("#"),
    });
  }

  return keys;
}

export const WHITE_KEY_COUNT = 52;

export const WHITE_KEY_WIDTH = 100 / WHITE_KEY_COUNT;
export const BLACK_KEY_WIDTH = WHITE_KEY_WIDTH * 0.6;

export function getBlackKeyPosition(whiteIdx: number) {
  return (whiteIdx + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
}

export function preparePianoKeys() {
  const keys = generatePianoKeys();

  let whiteIdx = -1;

  const preparedKeys = keys.map((key) => {
    if (!key.isBlack) {
      whiteIdx++;
    }
    return {
      ...key,
      whiteIdx,
    };
  });

  return {
    whiteKeys: preparedKeys.filter((key) => !key.isBlack),
    blackKeys: preparedKeys.filter((key) => key.isBlack),
  };
}

const preparedKeys = preparePianoKeys();

export function getKeyByMidi(midi: number) {
  return preparedKeys.whiteKeys.find((key) => key.midi === midi);
}

export function prepareRenderNotes(notes: Note[], bpm: number): RenderNote[] {
  return notes.map((note) => {
    const key = getKeyByMidi(note.midi);

    if (!key) throw new Error(`Midi ${note.midi} not found.`);

    return {
      midi: note.midi,
      startMs: beatToMs(note.startBeat, bpm),
      durationMs: beatToMs(note.durationBeat, bpm),
      whiteIdx: key.whiteIdx,
    };
  });
}
