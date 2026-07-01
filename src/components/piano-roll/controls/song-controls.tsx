import { useSettingsContext } from "@/app/contexts/settings-context";
import { Metronome } from "lucide-react";

export const SongControls = () => {
  const { settings, toggleMetronome } = useSettingsContext();

  return (
    <div className="flex items-center gap-8">
      <button onClick={toggleMetronome} className="focus:outline-none">
        {settings.metronomeActive ? (
          <Metronome className="text-emerald-500 transition-colors" />
        ) : (
          <Metronome className="transition-colors" />
        )}
      </button>
    </div>
  );
};
