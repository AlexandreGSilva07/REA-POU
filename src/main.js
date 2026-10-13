import { WORLD, advance, clamp, createState } from "./engine.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const pad = document.getElementById("joystick");
const knob = document.getElementById("joystick-knob");
const reset = document.getElementById("reset");
let state = createState();
const stick = { x: 0, y: 0 };
const held = new Set();
let pointerId = null;

function setStick(clientX, clientY) {
  const rect = pad.getBoundingClientRect();
  const x = clientX - rect.left - rect.width / 2;
  const y = clientY - rect.top - rect.height / 2;
  const radius = rect.width * 0.28;
  const distance = Math.hypot(x, y) || 1;
  const scale = Math.min(distance, radius) / distance;
  const nx = x * scale;
  const ny = y * scale;
  stick.x = nx / radius;
  stick.y = ny / radius;
  knob.style.transform = "translate(" + nx + "px," + ny + "px)";
}
function releaseStick() {
  pointerId = null;
  stick.x = 0; stick.y = 0;
  knob.style.transform = "translate(0,0)";
}
pad.addEventListener("pointerdown", e => {
  if (pointerId !== null) return;
  pointerId = e.pointerId;
  pad.setPointerCapture(e.pointerId);
  setStick(e.clientX, e.clientY);
});
pad.addEventListener("pointermove", e => {
  if (e.pointerId === pointerId) setStick(e.clientX, e.clientY);
});
pad.addEventListener("pointerup", e => { if (e.pointerId === pointerId) releaseStick(); });
pad.addEventListener("pointercancel", e => { if (e.pointerId === pointerId) releaseStick(); });
window.addEventListener("blur", () => { held.clear(); releaseStick(); });
window.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();
  if (["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"].includes(key)) {
    held.add(key); e.preventDefault();
  }
});
window.addEventListener("keyup", e => held.delete(e.key.toLowerCase()));
reset.addEventListener("click", () => { state = createState(); });

function getInput() {
  const x = stick.x + Number(held.has("d") || held.has("arrowright")) - Number(held.has("a") || held.has("arrowleft"));
  const y = stick.y + Number(held.has("s") || held.has("arrowdown")) - Number(held.has("w") || held.has("arrowup"));
  return { x: clamp(x, -1, 1), y: clamp(y, -1, 1) };
}

function draw() {
  const { width: w, height: h } = WORLD;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#101f3b"); bg.addColorStop(1, "#1c3750");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#39618148"; ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 36) { ctx.beginPath(); ctx.moveTo(x, 105); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 105; y <= h; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.strokeStyle = "#7fd4d133"; ctx.lineWidth = 2;
  for (let r = 45; r <= 155; r += 55) {
    ctx.beginPath(); ctx.arc(w/2, h/2 + 25, r, 0, Math.PI*2); ctx.stroke();
  }
  ctx.fillStyle = "#9ac2dc";
  ctx.font = "11px system-ui"; ctx.textAlign = "center";
  ctx.fillText("AMBIENTE DE MOVIMENTAÇÃO", w / 2, 156);
  ctx.fillStyle = "#06112470";
  ctx.beginPath(); ctx.ellipse(state.x, state.y + 16, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
  const orb = ctx.createRadialGradient(state.x - 8, state.y - 10, 2, state.x, state.y, WORLD.radius + 4);
  orb.addColorStop(0, "#e7fbff"); orb.addColorStop(0.38, "#89dfe8"); orb.addColorStop(1, "#338ca1");
  ctx.fillStyle = orb; ctx.beginPath(); ctx.arc(state.x, state.y, WORLD.radius, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#c7f6ff"; ctx.lineWidth = 2; ctx.stroke();
}

let previous = 0;
function frame(now) {
  const seconds = previous ? (now - previous) / 1000 : 0;
  previous = now;
  state = advance(state, getInput(), seconds);
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
