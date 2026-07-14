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
import { Track } from "@/types/track";

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
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
  activeTrackGroupId: string;
  setActiveTrackGroupId: (id: string) => void;
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
  const [activeTrackGroupId, setActiveTrackGroupId] = useState(
    () => initialSong.trackGroups[0]?.id ?? "",
  );

  const autoZoom = Math.min(2, 120 / song.originalBpm);
  const effectivePxPerMs = PX_PER_MS * autoZoom;
  const effectiveViewportMs = VIEWPORT_HEIGHT / effectivePxPerMs;
  const msPerBeat = getMsPerBeat(song.originalBpm);
  const msPerBar = getMsPerBar(song.originalBpm, song.timeSignature);
  const NOTE_GAP_MS = NOTE_GAP_PX / PX_PER_MS;
  const speed = song.bpm / song.originalBpm;

  const prevViewportMsRef = useRef(effectiveViewportMs);
  const prevBpmRef = useRef(song.bpm);

  // Helper
  // Converts a track into renderable notes
  const prepareTrackNotes = useCallback(
    (track: Track) =>
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
    [song.originalBpm, song.timeSignature],
  );

  const activeTrackGroup = useMemo(
    () => song.trackGroups.find((g) => g.id === activeTrackGroupId),
    [activeTrackGroupId, song.trackGroups],
  );

  const renderNotes = useMemo(() => {
    if (!activeTrackGroup) return [];

    return activeTrackGroup.tracks.flatMap(prepareTrackNotes);
  }, [activeTrackGroup, prepareTrackNotes]);

  const toggleSolo = (trackId: string) => {
    setSong((prev) => ({
      ...prev,
      trackGroups: prev.trackGroups.map((group) => ({
        ...group,
        tracks: group.tracks.map((t) =>
          t.id === trackId ? { ...t, solo: !t.solo } : t,
        ),
      })),
    }));
  };

  const toggleMute = (trackId: string) => {
    setSong((prev) => {
      // When muted, all soloed tracks are disabled
      const allTracks = song.trackGroups.flatMap((g) => g.tracks);
      const hasSolo = allTracks.some((t) => t.solo);
      return {
        ...prev,
        trackGroups: prev.trackGroups.map((group) => ({
          ...group,
          tracks: group.tracks.map((t) =>
            hasSolo
              ? {
                  ...t,
                  solo: false,
                  muted: t.id === trackId ? !t.muted : t.muted,
                }
              : { ...t, muted: t.id === trackId ? !t.muted : t.muted },
          ),
        })),
      };
    });
  };

  const allTracks = useMemo(
    () => song.trackGroups.flatMap((g) => g.tracks),
    [song.trackGroups],
  );

  const hasSolo = useMemo(() => allTracks.some((t) => t.solo), [allTracks]);

  const audibleTracks = useMemo(
    () => allTracks.filter((t) => (hasSolo ? t.solo : !t.muted)),
    [allTracks, hasSolo],
  );

  // Render notes from audible tracks
  const allRenderNotes = useMemo(
    () => audibleTracks.flatMap(prepareTrackNotes),
    [audibleTracks, prepareTrackNotes],
  );

  const lastNoteMs = useMemo(
    () => Math.max(...renderNotes.map((n) => n.startMs + n.durationMs)),
    [renderNotes],
  );

  const { playback, setPlayback, togglePlay, skipForward, skipBack } =
    usePlayback(effectiveViewportMs, lastNoteMs, msPerBar, speed);

  const onFrame = useCallback((t: number) => setRealTime(t), []);
  useAnimationFrame(onFrame);

  const musicTime = getMusicTime(playback, realTime, speed);

  const adjustedMusicTime = musicTime - HIT_LINE_Y / effectivePxPerMs;

  const activeMidis = getActiveMidis(
    allRenderNotes,
    adjustedMusicTime,
    NOTE_GAP_MS,
  );

  const activeMidiColors = useMemo(() => {
    const map = new Map<number, { color: string; hit: string }>();

    renderNotes.forEach((note) => {
      if (isNoteActive(note, adjustedMusicTime, NOTE_GAP_MS)) {
        map.set(note.midi, { color: note.color, hit: note.hit });
      }
    });

    return map;
  }, [renderNotes, adjustedMusicTime, NOTE_GAP_MS]);

  useMetronome(
    adjustedMusicTime,
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
          toggleMute,
          toggleSolo,
          activeTrackGroupId,
          setActiveTrackGroupId,
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
