# Build 0.2 — Contract and evidence

The user-supplied APK was inventoried locally (SHA-256 b0072debdac7a8b336bcb4f4959c59289ee7d4dd4359bea59f3d05d17064a319). Directory-level inspection recorded 2,582 ZIP entries, 3 classes*.dex units, 1,785 PNG files, and 25 MP3 files. These facts are **not** equivalent to executing the APK or verifying internal mechanics. No original APK bytes or asset files were placed into this repository.

## Independent prototype contract

- Seven distinct virtual-pet rooms, arrow navigation, 4 HUD needs + hygiene, coins/level/XP, reactive character Canvas drawing.
- Feed using owned inventory, refill via store, prevent overfeeding, soap/bathroom cleaning, lab potions, energy recovery with bedroom lamp, tapping/ball fun, garden rewards.
- Memory, color match and timed star tap minigames with objectives, scoring and coins/XP rewards.
- Shop inventory, cosmetic colors/headwear/wall decor, persistence in localStorage.

## Validation

8/8 Node logic tests passed; Playwright Chromium mobile viewport simulated interacting with menu/nav/feed/store/game/bath/persistence, with no JavaScript page errors. Direct origin navigation was restricted by sandbox browser policy; HTML/CSS/JS were injected into the browser to test behavior. This does **not** prove the public deployment or Android parity.

## Clean-room boundary and limits

All JavaScript, Canvas code and CSS are independently authored, using no extracted game assets or original code. Behavioral references came from public instructions and a private ZIP inventory, not a runtime reproduction. The same supervised session worked on both tasks, so strict personnel-separated Clean Room is **not yet established**. Formal separation requires isolated A/B agent contexts and independent reviewers. Behavioral constants, progression timing and minigame implementation are prototype choices, **not verified equivalents** of APK internals.

Next: run reference APK on isolated authorized Android emulator and establish measurable acceptance tests per room/minigame.
