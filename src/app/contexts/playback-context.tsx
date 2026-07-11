"use client";
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
  playback: Playback;
  setPlayback: React.Dispatch<React.SetStateAction<Playback>>;
  togglePlay: () => void;
  skipForward: () => void;
  skipBack: () => void;
};

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export function PlaybackProvider({
  children,
  playback,
  setPlayback,
  togglePlay,
  skipForward,
  skipBack,
}: Props) {
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
