"use client";
import { useSongContext } from "@/app/contexts/song-context";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { BpmInput } from "@/components/ui/bpm-input";
import { PERCENTAGES } from "@/lib/constants";

export const BpmControl = () => {
  const { song, setSong } = useSongContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close popover window
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const bpmValues = useMemo(
    () => PERCENTAGES.map((p) => Math.round((song.originalBpm * p) / 100)),
    [song.originalBpm],
  );

  const currentIndex = bpmValues.reduce(
    (closest, val, i) =>
      Math.abs(val - song.bpm) < Math.abs(bpmValues[closest] - song.bpm)
        ? i
        : closest,
    0,
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex flex-col items-center focus:outline-none"
      >
        <span>{song.bpm}</span>
        <span className="text-sm">BPM</span>
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg p-4 z-50 w-60 shadow-lg">
          <div className="flex justify-center items-center mb-3">
            <BpmInput
              value={song.bpm}
              onChange={(value) =>
                setSong((prev) => ({ ...prev, bpm: Math.round(value) }))
              }
            />
          </div>
          <div className="flex justify-between items-center">
            <p>Speed (%)</p>
          </div>
          <Slider.Root
            className="relative flex items-center w-full h-5"
            value={[currentIndex]}
            min={0}
            max={bpmValues.length - 1}
            step={1}
            onValueChange={([index]) =>
              setSong((prev) => ({ ...prev, bpm: bpmValues[index] }))
            }
          >
            <Slider.Track className="bg-zinc-700 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-emerald-500 h-full rounded-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-emerald-500 rounded-full shadow cursor-pointer" />
          </Slider.Root>
          <div
            className="grid text-xs"
            style={{
              gridTemplateColumns: `repeat(${PERCENTAGES.length}, 1fr)`,
              marginInline: "-8px",
            }}
          >
            {PERCENTAGES.map((p, i) => (
              <span
                key={i}
                className={`text-center ${currentIndex === i ? "text-emerald-500" : ""}`}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
