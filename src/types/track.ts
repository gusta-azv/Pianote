import { Note } from "./note";

export type Track = {
  id: string;
  name: string;
  color: string;
  darkColor: string;
  hit: string;
  hitDark: string;
  notes: Note[];
  muted: boolean;
  instrumentFamily: string;
  instrumentNumber: number;
};
