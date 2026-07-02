import { useSettingsContext } from "@/app/contexts/settings-context";
import { Metronome, ZoomIn, ZoomOut } from "lucide-react";

export const SongControls = () => {
  const { settings, toggleMetronome, zoomIn, zoomOut } = useSettingsContext();

  return (
    <div className="flex items-center gap-8">
      <button onClick={toggleMetronome} className="focus:outline-none">
        {settings.metronomeActive ? (
          <Metronome className="text-emerald-500 transition-colors" />
        ) : (
          <Metronome className="transition-colors" />
        )}
      </button>
      <div className="flex items-center gap-2">
        <button onClick={zoomIn} className="focus:outline-none">
          <ZoomIn className="hover:text-emerald-500 transition-colors" />
        </button>
        <button onClick={zoomOut} className="focus:outline-none">
          <ZoomOut className="hover:text-emerald-500 transition-colors" />
        </button>
      </div>
    </div>
  );
};
