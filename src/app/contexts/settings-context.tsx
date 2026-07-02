import { PX_PER_SEC, VIEWPORT_HEIGHT } from "@/lib/constants";
import { Settings } from "@/types/settings";
import { createContext, useContext, useState } from "react";

type SettingsContextType = {
  PX_PER_MS: number;
  viewportMs: number;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  toggleMetronome: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

type Props = {
  children: React.ReactNode;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: Props) {
  const [settings, setSettings] = useState<Settings>({
    metronomeActive: false,
    zoom: 1,
  });

  const toggleMetronome = () =>
    setSettings((prev) => ({
      ...prev,
      metronomeActive: !prev.metronomeActive,
    }));

  const zoomIn = () =>
    setSettings((prev) => ({
      ...prev,
      zoom: Math.min(3, prev.zoom + 0.25),
    }));

  const zoomOut = () =>
    setSettings((prev) => ({
      ...prev,
      zoom: Math.max(0.25, prev.zoom - 0.25),
    }));

  const PX_PER_MS = (PX_PER_SEC * settings.zoom) / 1000;

  const viewportMs = VIEWPORT_HEIGHT / PX_PER_MS;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        toggleMetronome,
        PX_PER_MS,
        viewportMs,
        zoomIn,
        zoomOut,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettingsContext must be used within SettingsProvider");
  return ctx;
}
