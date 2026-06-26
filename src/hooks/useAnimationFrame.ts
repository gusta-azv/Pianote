import { clock } from "@/lib/time/clock";
import { useEffect } from "react";

export function useAnimationFrame(callback: (time: number) => void) {
  // Clock
  useEffect(() => {
    let raf: number;

    const loop = () => {
      callback(clock.getTime());
      raf = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(raf);
  }, [callback]);
}
