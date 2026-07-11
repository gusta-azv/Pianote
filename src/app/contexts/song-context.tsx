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
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { getActiveMidis, prepareRenderNotes } from "@/lib/piano";
import { HIT_LINE_Y, NOTE_GAP_PX, VIEWPORT_HEIGHT } from "@/lib/constants";
import { useAudio } from "@/hooks/useAudio";
import { useSettingsContext } from "./settings-context";
import { getMsPerBar, getMsPerBeat } from "@/lib/music";
import { useMetronome } from "@/hooks/useMetronome";
import { loadMetronome, loadSampler } from "@/lib/audio";
import { usePlayback } from "@/hooks/usePlayback";
import { PlaybackProvider } from "./playback-context";
import { clock } from "@/lib/time/clock";

type SongContextType = {
  song: Song;
  setSong: React.Dispatch<React.SetStateAction<Song>>;
  renderNotes: RenderNote[];
  musicTime: number;
  activeMidis: Set<number>;
  effectivePxPerMs: number;
  effectiveViewportMs: number;
  lastNoteMs: number;
};

const SongContext = createContext<SongContextType | null>(null);

type Props = {
  children: React.ReactNode;
  song: Song;
};

export function SongProvider({ children, song: initialSong }: Props) {
  const { settings, PX_PER_MS } = useSettingsContext();

  const [realTime, setRealTime] = useState(0);
  const [song, setSong] = useState<Song>(initialSong);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const autoZoom = Math.min(2, 120 / song.originalBpm);
  const effectivePxPerMs = PX_PER_MS * autoZoom;
  const effectiveViewportMs = VIEWPORT_HEIGHT / effectivePxPerMs;

  const prevViewportMsRef = useRef(effectiveViewportMs);

  const prevBpmRef = useRef(song.bpm);

  const msPerBeat = getMsPerBeat(song.originalBpm);
  const msPerBar = getMsPerBar(song.originalBpm, song.timeSignature);

  const NOTE_GAP_MS = NOTE_GAP_PX / PX_PER_MS;

  const renderNotes = useMemo(
    () => prepareRenderNotes(song.notes, song.originalBpm, song.timeSignature),
    [song.notes, song.originalBpm, song.timeSignature],
  );

  const lastNoteMs = useMemo(
    () => Math.max(...renderNotes.map((n) => n.startMs + n.durationMs)),
    [renderNotes],
  );

  const { playback, setPlayback, togglePlay, skipForward, skipBack } =
    usePlayback(effectiveViewportMs, lastNoteMs, msPerBar);

  const onFrame = useCallback((t: number) => setRealTime(t), []);
  useAnimationFrame(onFrame);

  const speed = song.bpm / song.originalBpm;
  const musicTime = getMusicTime(playback, realTime, speed);

  const activeMidis = getActiveMidis(
    renderNotes,
    musicTime - HIT_LINE_Y / effectivePxPerMs,
    NOTE_GAP_MS,
  );

  useMetronome(
    musicTime - HIT_LINE_Y / effectivePxPerMs,
    msPerBeat,
    song.timeSignature.beatsPerBar,
    settings.metronomeActive && playback.mode === "play",
  );

  useAudio(activeMidis, audioLoaded, playback.mode === "play");

  useLayoutEffect(() => {
    const delta = effectiveViewportMs - prevViewportMsRef.current;

    prevViewportMsRef.current = effectiveViewportMs;

    if (delta === 0) return;

    setPlayback((prev) => ({
      ...prev,
      baseTime: Math.max(effectiveViewportMs, prev.baseTime + delta),
    }));
  }, [effectiveViewportMs, setPlayback]);

  useLayoutEffect(() => {
    if (prevBpmRef.current === song.bpm) return;

    const oldSpeed = prevBpmRef.current / song.originalBpm;

    prevBpmRef.current = song.bpm;

    if (playback.mode !== "play") return;

    const currentMusicTime = getMusicTime(playback, clock.getTime(), oldSpeed);

    setPlayback((prev) => ({
      ...prev,
      baseTime: currentMusicTime,
      startRealTime: clock.getTime(),
    }));
  }, [playback, setPlayback, song.bpm, song.originalBpm]);

  useEffect(() => {
    Promise.all([loadSampler(), loadMetronome()]).then(() => {
      setAudioLoaded(true);
    });
  }, []);

  return (
    <PlaybackProvider
      playback={playback}
      setPlayback={setPlayback}
      togglePlay={togglePlay}
      skipForward={skipForward}
      skipBack={skipBack}
    >
      <SongContext.Provider
        value={{
          song,
          setSong,
          renderNotes,
          musicTime,
          activeMidis,
          effectivePxPerMs,
          effectiveViewportMs,
          lastNoteMs,
        }}
      >
        {children}
      </SongContext.Provider>
    </PlaybackProvider>
  );
}

export function useSongContext() {
  const ctx = useContext(SongContext);
  if (!ctx) throw new Error("useSongContext must be used within SongProvider");
  return ctx;
}
