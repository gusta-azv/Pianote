"use client";
import { getMusicTime } from "@/lib/playback";
import { RenderNote } from "@/types/render-note";
import { Song } from "@/types/song";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
};

const SongContext = createContext<SongContextType | null>(null);

type Props = {
  children: React.ReactNode;
  song: Song;
};

export function SongProvider({ children, song: initialSong }: Props) {
  const { playback } = usePlaybackContext();
  const { settings, PX_PER_MS, viewportMs } = useSettingsContext();
  const [realTime, setRealTime] = useState(0);
  const [song, setSong] = useState<Song>(initialSong);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const onFrame = useCallback((t: number) => setRealTime(t), []);
  useAnimationFrame(onFrame);

  const renderNotes = useMemo(
    () => prepareRenderNotes(song.notes, song.timeSignature),
    [song],
  );

  const musicTime = getMusicTime(playback, realTime, song.bpm);

  const msPerBeat = getMsPerBeat(song.bpm);
  const musicBeat = musicTime / msPerBeat;
  const viewportBeats = viewportMs / msPerBeat;
  const NOTE_GAP_BEATS = NOTE_GAP_PX / PX_PER_MS / msPerBeat;
  const hitLineOffsetBeats =
    (VIEWPORT_HEIGHT - HIT_LINE_Y) / PX_PER_MS / msPerBeat;

  const activeMidis = getActiveMidis(
    renderNotes,
    musicBeat - viewportBeats + hitLineOffsetBeats,
    NOTE_GAP_BEATS,
  );

  useMetronome(
    musicTime - HIT_LINE_Y / PX_PER_MS,
    msPerBeat,
    song.timeSignature.beatsPerBar,
    settings.metronomeActive && playback.mode === "play",
  );

  useAudio(activeMidis, audioLoaded);

  useEffect(() => {
    loadMetronome();
    loadSampler();
    Promise.all([loadSampler(), loadMetronome()]).then(() => {
      setAudioLoaded(true);
    });
  }, []);

  return (
    <SongContext.Provider
      value={{ song, setSong, renderNotes, musicTime, activeMidis }}
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
