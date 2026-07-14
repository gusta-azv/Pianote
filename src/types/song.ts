import { TrackGroup } from "./track-group";

export type TimeSignature = {
  beatsPerBar: number;
  beatUnit: 1 | 2 | 4 | 8 | 16 | 32;
};

export type Song = {
  title: string;
  artist: string;
  bpm: number;
  originalBpm: number;
  timeSignature: TimeSignature;
  trackGroups: TrackGroup[];
};
