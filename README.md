# TRACKSHIFT 3D — Visual experiment

**Status:** independent 3D WebGL prototype. Not a copy of Subway Surfers. No original game assets included.

## Goal

Validate a real 3D mobile browser scene with a third-person moving runner, authored 3D train meshes, rails, buildings, jumping, rolling, collectible coins, obstacle collision and endless-run persistence.

## Run locally

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080` with a WebGL-capable browser. The prototype has no CDN, `npm install`, network API, or remote asset dependencies. An optional Google Fonts `@import` affects only typography; standard system fonts are used if offline.

## Controls

- Swipe left/right to switch among 3 lanes.
- Swipe up to jump. Swipe down to roll.
- Tap the board power-up at bottom left.
- Keyboard: arrows/WASD, space, B.

## Architecture

- `src/engine.js` — proven independent gameplay simulation, kept from the original TRACKSHIFT branch.
- `src/webgl.js` — custom WebGL camera, mesh builder, shaders and a Canvas2D 3D-mesh fallback for WebGL-less devices.
- `src/scene.js` — meshes authored for urban surroundings, trains, player, track and obstacles; articulated animation.
- `src/main.js` — inputs, score HUD, modal screens and saves.
- `src/ui.css` — responsive portrait UI and environmental overlay.

## Verification

- 14 game engine unit tests pass.
- 11 browser interaction checks passed using a **real GPU WebGL context**, running Chromium via virtual X11 with SwiftShader.
- Actual captures `previews/menu-webgl.png` and `previews/game-webgl.png` were rendered by the prototype, not sourced from the original game or image search.
- Further artistic work and a real Android hardware test remain necessary. The artwork is procedural and does **not** achieve the quality of the proprietary Unity assets.

## Source APK research

The supplied Subway Surfers 3.70.2 APK was inspected privately. It contains Unity with IL2CPP and a Unity Addressables catalogue. Its bundles include game-specific assets, but this prototype does not contain or load models/textures extracted from the APK. Extracting and converting Unity materials/models requires a separately authorized private pipeline and a license assessment before redistribution. Do not commit proprietary game files into this public repository.

## Branch policy

- `main` — REA-POU, leave unchanged.
- `reverse/next-game` — earlier TRACKSHIFT 2.5D.
- `experiment/trackshift-webgl-3d` — this experimental 3D prototype, independently staged.
