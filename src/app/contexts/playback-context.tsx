"use client";
import { usePlayback } from "@/hooks/usePlayback";
import { Playback } from "@/types/playback";
import { createContext, useContext } from "react";

type PlaybackContextType = {
  playback: Playback;
  setPlayback: React.Dispatch<React.SetStateAction<Playback>>;
  togglePlay: () => void;
};

type Props = {
  children: React.ReactNode;
  viewportMs: number;
};

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export function PlaybackProvider({ children, viewportMs }: Props) {
  const { playback, setPlayback, togglePlay } = usePlayback(viewportMs);
  return (
    <PlaybackContext.Provider value={{ playback, setPlayback, togglePlay }}>
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
