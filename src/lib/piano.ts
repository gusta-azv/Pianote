import { PianoKey } from "@/types/piano-key";
import { RenderNote } from "@/types/render-note";
import { Note } from "@/types/note";
import { PreparedPianoKey } from "@/types/prepared-piano-key";
import { TimeSignature } from "@/types/song";
import { NOTE_WIDTH_RATIO } from "./constants";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const WHITE_KEYS_COUNT = 52;
export const WHITE_KEY_WIDTH = 100 / WHITE_KEYS_COUNT;
export const BLACK_KEYS_WIDTH = WHITE_KEY_WIDTH * 0.6;
export const COL_WIDTH = 100 / WHITE_KEYS_COUNT;
export const NOTE_WIDTH = COL_WIDTH * NOTE_WIDTH_RATIO;
export const NOTE_OFFSET = (COL_WIDTH - NOTE_WIDTH) / 2;

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

export function getBlackKeyPosition(whiteIdx: number) {
  return (whiteIdx + 1) * WHITE_KEY_WIDTH - BLACK_KEYS_WIDTH / 2;
}

export function preparePianoKeys(): {
  whiteKeys: PreparedPianoKey[];
  blackKeys: PreparedPianoKey[];
} {
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

export function getKeyByMidi(midi: number): PreparedPianoKey | undefined {
  return (
    preparedKeys.whiteKeys.find((key) => key.midi === midi) ??
    preparedKeys.blackKeys.find((key) => key.midi === midi)
  );
}

export function prepareRenderNotes(
  notes: Note[],
  timeSignature: TimeSignature,
): RenderNote[] {
  const INTRO_BEATS = timeSignature.beatsPerBar; // Empty pickup measure

  return notes.map((note) => {
    const key = getKeyByMidi(note.midi);
    if (!key) throw new Error(`Midi ${note.midi} not found.`);

    const left = key.isBlack
      ? getBlackKeyPosition(key.whiteIdx)
      : (key.whiteIdx / WHITE_KEYS_COUNT) * 100 + NOTE_OFFSET;

    return {
      midi: note.midi,
      startBeat: note.startBeat + INTRO_BEATS,
      durationBeat: note.durationBeat,
      whiteIdx: key.whiteIdx,
      isBlack: key.isBlack,
      left,
    };
  });
}

export function getVisibleNotes(
  notes: RenderNote[],
  cameraBeat: number,
  viewportBeats: number,
) {
  return notes.filter((note) => {
    const viewStart = cameraBeat - viewportBeats;
    const viewEnd = cameraBeat;

    return (
      note.startBeat + note.durationBeat >= viewStart &&
      note.startBeat <= viewEnd
    );
  });
}

export function getActiveMidis(
  renderNotes: RenderNote[],
  musicBeat: number,
  gapBeats = 0,
): Set<number> {
  const active = new Set<number>();

  for (const note of renderNotes) {
    if (
      musicBeat >= note.startBeat &&
      musicBeat < note.startBeat + note.durationBeat - gapBeats
    ) {
      active.add(note.midi);
    }
  }

  return active;
}
