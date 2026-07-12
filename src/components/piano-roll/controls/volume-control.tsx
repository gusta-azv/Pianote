import { useSettingsContext } from "@/app/contexts/settings-context";
import * as Slider from "@radix-ui/react-slider";
import { Volume1, Volume2, VolumeX } from "lucide-react";

export const VolumeControl = () => {
  const { settings, setSettings, toggleMute } = useSettingsContext();

  return (
    <div className="flex items-center relative w-36 gap-2 group">
      <button className="focus:outline-none" onClick={toggleMute}>
        {settings.muted ? (
          <VolumeX size={20} />
        ) : settings.volume < 33 ? (
          <Volume1 size={20} />
        ) : (
          <Volume2 size={20} />
        )}
      </button>
      <Slider.Root
        className="relative flex items-center w-full h-5"
        min={0}
        value={[settings.volume]}
        max={100}
        step={1}
        onValueChange={([v]) =>
          setSettings((prev) => ({ ...prev, volume: v, muted: v === 0 }))
        }
      >
        <Slider.Track className="bg-zinc-300 relative grow rounded-full h-2">
          <Slider.Range className="absolute bg-emerald-500 h-full rounded-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 bg-emerald-500 rounded-full shadow-md cursor-pointer focus:outline-none
            opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      </Slider.Root>
      <span className="text-sm min-w-[2ch] text-right">{settings.volume}</span>
    </div>
  );
};
