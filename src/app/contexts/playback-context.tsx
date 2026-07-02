"use client";
import { usePlayback } from "@/hooks/usePlayback";
import { Playback } from "@/types/playback";
import { createContext, useContext } from "react";

type PlaybackContextType = {
  playback: Playback;
  setPlayback: React.Dispatch<React.SetStateAction<Playback>>;
  togglePlay: () => void;
  skipForward: () => void;
  skipBack: () => void;
};

type Props = {
  children: React.ReactNode;
  viewportMs: number;
  lastNoteMs: number;
  msPerBar: number;
  bpm: number;
};

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export function PlaybackProvider({
  children,
  viewportMs,
  lastNoteMs,
  msPerBar,
  bpm,
}: Props) {
  const { playback, setPlayback, togglePlay, skipForward, skipBack } =
    usePlayback(viewportMs, lastNoteMs, msPerBar, bpm);
  return (
    <PlaybackContext.Provider
      value={{ playback, setPlayback, togglePlay, skipForward, skipBack }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlaybackContext() {
  const ctx = useContext(PlaybackContext);
  if (!ctx)
    throw new Error("usePlaybackContext must be used within PlaybackProvider");
  return ctx;
}
