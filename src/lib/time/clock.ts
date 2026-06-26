export function createClock(speed = 1) {
  const start = performance.now();
  return {
    getTime: () => (performance.now() - start) * speed,
  };
}

export const clock = createClock();
