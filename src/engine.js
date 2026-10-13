/** Independent placeholder mechanics. No game-specific APK behavior is claimed. */
export const WORLD = Object.freeze({ width: 360, height: 640, radius: 17, speed: 160 });

export function clamp(value, lower, upper) {
  return Math.max(lower, Math.min(upper, value));
}

export function createState() {
  return { x: WORLD.width / 2, y: WORLD.height / 2 + 25, elapsed: 0 };
}

export function advance(state, input, deltaSeconds) {
  const dt = clamp(Number.isFinite(deltaSeconds) ? deltaSeconds : 0, 0, 0.05);
  const ix = Number.isFinite(input?.x) ? input.x : 0;
  const iy = Number.isFinite(input?.y) ? input.y : 0;
  const magnitude = Math.hypot(ix, iy);
  const ratio = magnitude > 1 ? 1 / magnitude : 1;
  return {
    x: clamp(state.x + ix * ratio * WORLD.speed * dt, WORLD.radius, WORLD.width - WORLD.radius),
    y: clamp(state.y + iy * ratio * WORLD.speed * dt, 115 + WORLD.radius, WORLD.height - 160),
    elapsed: state.elapsed + dt,
  };
}
