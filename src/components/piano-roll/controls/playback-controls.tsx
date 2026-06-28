"use client";
import { usePlaybackContext } from "@/app/contexts/playback-context";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

const iconStyle = "fill-transparent hover:fill-current transition-colors";

export const PlaybackControls = () => {
  const { playback, togglePlay, skipForward, skipBack } = usePlaybackContext();
  const isPlaying = playback.mode === "play";

  return (
    <div className="flex items-center gap-8">
      <button onClick={togglePlay} className="group focus:outline-none">
        {isPlaying ? (
          <Pause
            size={24}
            className="fill-transparent group-hover:fill-current transition-colors"
          />
        ) : (
          <Play
            size={24}
            className="fill-transparent group-hover:fill-current transition-colors"
          />
        )}
      </button>
      <div className="flex items-center gap-2">
        <button onClick={skipBack} className="focus:outline-none">
          <SkipBack size={24} className={iconStyle} />
        </button>
        <button onClick={skipForward} className="focus:outline-none">
          <SkipForward size={24} className={iconStyle} />
        </button>
      </div>
    </div>
  );
};
