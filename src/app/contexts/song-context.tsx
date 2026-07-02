"use client";
import { getMusicTime } from "@/lib/playback";
import { RenderNote } from "@/types/render-note";
import { Song } from "@/types/song";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePlaybackContext } from "./playback-context";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { getActiveMidis, prepareRenderNotes } from "@/lib/piano";
import { HIT_LINE_Y, NOTE_GAP_PX, VIEWPORT_HEIGHT } from "@/lib/constants";
import { useAudio } from "@/hooks/useAudio";
import { useSettingsContext } from "./settings-context";
import { getMsPerBeat } from "@/lib/music";
import { useMetronome } from "@/hooks/useMetronome";
import { loadMetronome, loadSampler } from "@/lib/audio";

type SongContextType = {
  song: Song;
  setSong: React.Dispatch<React.SetStateAction<Song>>;
  renderNotes: RenderNote[];
  musicTime: number;
  activeMidis: Set<number>;
  effectivePxPerMs: number;
  effectiveViewportMs: number;
};

const SongContext = createContext<SongContextType | null>(null);

type Props = {
  children: React.ReactNode;
  song: Song;
};

export function SongProvider({ children, song: initialSong }: Props) {
  const { playback, setPlayback } = usePlaybackContext();
  const { settings, PX_PER_MS } = useSettingsContext();
  const [realTime, setRealTime] = useState(0);
  const [song, setSong] = useState<Song>(initialSong);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const msPerBeat = getMsPerBeat(song.bpm);
  const autoZoom = Math.min(2, 120 / song.bpm);
  const effectivePxPerMs = PX_PER_MS * autoZoom;
  const effectiveViewportMs = VIEWPORT_HEIGHT / effectivePxPerMs;
  const prevViewportMsRef = useRef(effectiveViewportMs);

  const onFrame = useCallback((t: number) => setRealTime(t), []);
  useAnimationFrame(onFrame);

  const renderNotes = useMemo(
    () => prepareRenderNotes(song.notes, song.bpm, song.timeSignature),
    [song],
  );

  useLayoutEffect(() => {
    const delta = effectiveViewportMs - prevViewportMsRef.current;
    prevViewportMsRef.current = effectiveViewportMs;
    if (delta === 0) return;
    setPlayback((prev) => ({
      ...prev,
      baseTime: Math.max(effectiveViewportMs, prev.baseTime + delta),
    }));
  }, [effectiveViewportMs, setPlayback]);

  const musicTime = getMusicTime(playback, realTime);
  const NOTE_GAP_MS = NOTE_GAP_PX / PX_PER_MS;
  const activeMidis = getActiveMidis(
    renderNotes,
    musicTime - HIT_LINE_Y / PX_PER_MS,
    NOTE_GAP_MS,
  );

  useMetronome(
    musicTime - HIT_LINE_Y / PX_PER_MS,
    msPerBeat,
    song.timeSignature.beatsPerBar,
    settings.metronomeActive && playback.mode === "play",
  );

  useAudio(activeMidis, audioLoaded);

  useEffect(() => {
    Promise.all([loadSampler(), loadMetronome()]).then(() => {
      setAudioLoaded(true);
    });
  }, []);

  return (
    <SongContext.Provider
      value={{
        song,
        setSong,
        renderNotes,
        musicTime,
        activeMidis,
        effectivePxPerMs,
        effectiveViewportMs,
      }}
    >
      {children}
    </SongContext.Provider>
  );
}

export function useSongContext() {
  const ctx = useContext(SongContext);
  if (!ctx) throw new Error("useSongContext must be used within SongProvider");
  return ctx;
}
