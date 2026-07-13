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
import { getActiveMidis, isNoteActive, prepareRenderNotes } from "@/lib/piano";
import { HIT_LINE_Y, NOTE_GAP_PX, VIEWPORT_HEIGHT } from "@/lib/constants";
import { useAudio } from "@/hooks/useAudio";
import { useSettingsContext } from "./settings-context";
import { getMsPerBar, getMsPerBeat } from "@/lib/music";
import { useMetronome } from "@/hooks/useMetronome";
import { getSampler, loadMetronome, loadSampler } from "@/lib/audio";
import { usePlayback } from "@/hooks/usePlayback";
import { PlaybackProvider } from "./playback-context";
import { clock } from "@/lib/time/clock";

type SongContextType = {
  song: Song;
  setSong: React.Dispatch<React.SetStateAction<Song>>;
  renderNotes: RenderNote[];
  musicTime: number;
  activeMidis: Set<number>;
  activeMidiColors: Map<number, { color: string; hit: string }>;
  effectivePxPerMs: number;
  effectiveViewportMs: number;
  lastNoteMs: number;
  activeTrackId: string;
  setActiveTrackId: (id: string) => void;
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
  const [activeTrackId, setActiveTrackId] = useState<string>(
    () => initialSong.tracks[0]?.id ?? "",
  );

  const autoZoom = Math.min(2, 120 / song.originalBpm);
  const effectivePxPerMs = PX_PER_MS * autoZoom;
  const effectiveViewportMs = VIEWPORT_HEIGHT / effectivePxPerMs;

  const prevViewportMsRef = useRef(effectiveViewportMs);

  const prevBpmRef = useRef(song.bpm);

  const msPerBeat = getMsPerBeat(song.originalBpm);
  const msPerBar = getMsPerBar(song.originalBpm, song.timeSignature);

  const NOTE_GAP_MS = NOTE_GAP_PX / PX_PER_MS;

  const renderNotes = useMemo(
    () =>
      song.tracks.flatMap((track) =>
        prepareRenderNotes(
          track.notes,
          song.originalBpm,
          song.timeSignature,
          track.color,
          track.darkColor,
          track.hit,
          track.hitDark,
          track.id,
        ),
      ),
    [song.originalBpm, song.timeSignature, song.tracks],
  );

  // All no muted tracks
  const allRenderNotes = useMemo(
    () =>
      song.tracks
        .filter((t) => !t.muted)
        .flatMap((track) =>
          prepareRenderNotes(
            track.notes,
            song.originalBpm,
            song.timeSignature,
            track.color,
            track.darkColor,
            track.hit,
            track.hitDark,
            track.id,
          ),
        ),
    [song.originalBpm, song.timeSignature, song.tracks],
  );

  const lastNoteMs = useMemo(
    () => Math.max(...renderNotes.map((n) => n.startMs + n.durationMs)),
    [renderNotes],
  );

  const speed = song.bpm / song.originalBpm;

  const { playback, setPlayback, togglePlay, skipForward, skipBack } =
    usePlayback(effectiveViewportMs, lastNoteMs, msPerBar, speed);

  const onFrame = useCallback((t: number) => setRealTime(t), []);
  useAnimationFrame(onFrame);

  const musicTime = getMusicTime(playback, realTime, speed);

  const activeMidis = getActiveMidis(
    allRenderNotes,
    musicTime - HIT_LINE_Y / effectivePxPerMs,
    NOTE_GAP_MS,
  );

  const activeMidiColors = useMemo(() => {
    const map = new Map<number, { color: string; hit: string }>();
    const adjustedTime = musicTime - HIT_LINE_Y / effectivePxPerMs;

    renderNotes.forEach((note) => {
      if (isNoteActive(note, adjustedTime, NOTE_GAP_MS)) {
        map.set(note.midi, { color: note.color, hit: note.hit });
      }
    });

    return map;
  }, [musicTime, renderNotes, effectivePxPerMs, NOTE_GAP_MS]);

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

  // Control volume
  useEffect(() => {
    const sampler = getSampler();

    if (!sampler) return;

    if (settings.muted) {
      sampler.volume.value = -Infinity;
    } else {
      sampler.volume.value = 20 * Math.log10(settings.volume / 100);
    }
  }, [settings.muted, settings.volume]);

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
          activeMidiColors,
          effectivePxPerMs,
          effectiveViewportMs,
          lastNoteMs,
          activeTrackId,
          setActiveTrackId,
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
