import { useSongContext } from "@/app/contexts/song-context";
import { ChevronDown, Headphones, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const TrackControl = () => {
  const {
    song,
    activeTrackGroupId,
    setActiveTrackGroupId,
    toggleMute,
    toggleSolo,
  } = useSongContext();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const activeTrackGroup = song.trackGroups.find(
    (g) => g.id === activeTrackGroupId,
  );

  // Close popover window
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Close groups
  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);

      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }

      return next;
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        className="flex items-center justify-between bg-zinc-800 w-48 h-8 rounded-lg px-3 hover:bg-zinc-700 transition-colors duration-200 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm truncate capitalize">
          {activeTrackGroup?.name}
        </span>
        <ChevronDown
          size={16}
          className={`text-zinc-300 transition-transform duration-150
            ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg p-3 z-50 w-max min-w-80 shadow-lg">
          {song.trackGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);

            return (
              <div key={group.id}>
                <div
                  className="flex items-center justify-between px-2 gap-4 py-1.5 rounded hover:bg-zinc-700 cursor-pointer"
                  onClick={() => {
                    setActiveTrackGroupId(group.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="capitalize">{group.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroupExpanded(group.id);
                    }}
                    className="p-2 -m-2"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-150
                       ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {isExpanded && (
                  <>
                    {group.tracks.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between px-4 py-1 gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: track.color }}
                          />
                          <span
                            className={`text-sm capitalize select-none ${track.muted ? "text-zinc-500 transition-colors" : "transition-colors"}`}
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
                              <VolumeX
                                size={18}
                                className="transition-colors"
                              />
                            )}
                          </button>

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
                              <Headphones
                                size={16}
                                className="transition-colors"
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
