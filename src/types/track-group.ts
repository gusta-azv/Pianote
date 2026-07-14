import { Track } from "./track";

export type TrackGroup = {
  id: string;
  name: string;
  instrumentFamily: string;
  instrumentNumber: number;
  tracks: Track[];
};
