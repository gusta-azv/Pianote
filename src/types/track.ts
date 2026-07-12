import { Note } from "./note";

export type Track = {
  id: string;
  name: string;
  color: string;
  notes: Note[];
  muted: boolean;
  instrumentFamily: string;
  instrumentNumber: number;
};
