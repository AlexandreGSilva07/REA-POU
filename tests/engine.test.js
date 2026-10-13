import test from "node:test";
import assert from "node:assert/strict";
import { WORLD, createState, advance, clamp } from "../src/engine.js";

test("starts from a deterministic center position", () => {
  assert.deepEqual(createState(), { x: 180, y: 345, elapsed: 0 });
});

test("clamps out-of-range positions", () => {
  const p = advance(createState(), { x: 1000, y: -1000 }, 100);
  assert.ok(p.x >= WORLD.radius && p.x <= WORLD.width - WORLD.radius);
  assert.ok(p.y >= 115 + WORLD.radius && p.y <= WORLD.height - 160);
});

test("normalizes diagonal movement", () => {
  const a = advance(createState(), { x: 1, y: 0 }, 0.05);
  const b = advance(createState(), { x: 1, y: 1 }, 0.05);
  assert.ok(Math.abs(Math.hypot(b.x - 180, b.y - 345) - (a.x - 180)) < 0.001);
});

test("clamp works and negative delta does not reverse time", () => {
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(advance(createState(), { x: 1, y: 0 }, -1).x, 180);
});
