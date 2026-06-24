import { Note } from "./note";

export type Song = {
  title: string;
  artist: string;
  bpm: number;
  notes: Note[];
};
