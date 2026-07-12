import { useSongContext } from "@/app/contexts/song-context";
import { ChevronDown, Headphones, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const TrackControl = () => {
  const { song, setSong, activeTrackId, setActiveTrackId } = useSongContext();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeTrack = song.tracks.find((t) => t.id === activeTrackId);

  const toggleMute = (trackId: string) => {
    setSong((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId ? { ...t, muted: !t.muted } : t,
      ),
    }));
  };

  /*
  const toggleSolo = (trackId: string) => {
    setSong((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId ? { ...t, solo: !t.solo } : t,
      ),
    }));
  };
  */

  // Close popover window
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        className="flex items-center justify-between bg-zinc-800 w-48 h-8 rounded-lg px-3 hover:bg-zinc-700 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm truncate capitalize">{activeTrack?.name}</span>
        <ChevronDown
          size={16}
          className={`text-zinc-300 transition-transform duration-150
            ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg p-3 z-50 w-max min-w-60 shadow-lg">
          {song.tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between px-2 gap-4 py-1.5 rounded hover:bg-zinc-700 cursor-pointer"
              onClick={() => {
                setActiveTrackId(track.id);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm capitalize ${track.muted ? "text-zinc-500" : ""}`}
                >
                  {track.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute(track.id);
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-50 transition-colors"
                >
                  {track.muted ? (
                    <VolumeX
                      size={18}
                      className="text-emerald-400 transition-colors"
                    />
                  ) : (
                    <VolumeX size={18} className="transition-colors" />
                  )}
                </button>
                {/*}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSolo(track.id);
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-50 transition-colors"
                >
                  {track.solo ? (
                    <Headphones
                      size={16}
                      className="text-emerald-400 transition-colors"
                    />
                  ) : (
                    <Headphones size={16} className="transition-colors" />
                  )}
                </button>
                {*/}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
