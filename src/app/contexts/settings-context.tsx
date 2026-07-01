import { Settings } from "@/types/settings";
import { createContext, useContext, useState } from "react";

type SettingsContextType = {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  toggleMetronome: () => void;
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

  return (
    <SettingsContext.Provider
      value={{ settings, setSettings, toggleMetronome }}
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
