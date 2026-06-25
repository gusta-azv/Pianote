import { Note } from "./note";

export type TimeSignature = {
  beatsPerBar: number;
  beatUnit: 1 | 2 | 4 | 8 | 16 | 32;
};

export type Song = {
  title: string;
  artist: string;
  bpm: number;
  timeSignature: TimeSignature;
  notes: Note[];
};
