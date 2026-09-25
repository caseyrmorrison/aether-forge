# Aether Forge

A single-player incremental game built with TypeScript, Three.js, and Vite. Features a procedural crystalline island with bloom, twelve structures, eighteen research upgrades, eight worlds, ascension and permanent relics, local saves, save import/export, and up to eight hours of offline production.

## Run

```sh
npm install
npm run dev
```

## Validate

```sh
npm test
npm run build
```

Click the crystal, use the Harvest button, or press Space. Buy structures to automate income, research to multiply production, and worlds to extend progression. Ascend after earning 100K aether in an expedition to gain permanent stardust bonuses. Sound is optional and disabled by default. Saves are local to your browser; export a backup in Settings before clearing browser storage.

Game economy and persistence live in `src/game.ts`, rendering in `src/scene.ts`, and interface orchestration in `src/main.ts`. The scene uses generated geometry with no external image assets. Fonts gracefully fall back to system sans-serif. WebGL-unavailable browsers retain the full game loop with a static visual fallback.

## Expansion: Echoes of Genesis

Harvest manually to fill Core Overdrive (50 harvests by default), then activate 3× production and harvest power for 20 seconds. Comets arrive after 45 seconds, remain available for 15 seconds, and award aether plus 20 charge. Capturing one starts a 60-second countdown. Offline income integrates only the actual remaining overdrive duration and is capped at eight hours.

Ascension still grants automatic stardust power. Runs earning at least 1M aether also grant **Echoes**: one per order of magnitude starting at 1M, plus one for each reached world beyond world 3. Seven one-time challenges grant additional Echoes. Use the Legacy tab to claim rewards and purchase eight milestone-gated permanent relics. Purchases never consume stardust. Relic prices double per rank; rank limits are visible in the shop.

Starter drones and remembered research apply on the next ascension. Other relics apply immediately and persist through resets. Your existing original-version save migrates automatically, retaining structures, research, currencies and current world. Old saves cannot reconstruct historical clicks or past-world records that were never stored; current-expedition records are carried forward.

## Play online and deploy

Public game URL: https://caseyrmorrison.github.io/aether-forge/

GitHub Actions runs the tests, builds the game, and deploys `dist/` to GitHub Pages on every push to `main`. In the repository's Pages settings, the source must be **GitHub Actions**. Relative asset paths support the repository subdirectory.

Each friend has an independent single-player save stored in their own browser. To move an existing localhost save to the live site, export it in the local game's Settings, then import it in Settings on the live site. Saves do not sync between browsers or devices automatically.

## Expansion: Chart Your Own Path (v3)

The game now has 16 structures, 26 research upgrades, 12 worlds, and 14 permanent relics. Structure bulk purchases support ×1, ×10, and ×100. Research purchases update their existing rows so the list retains its scroll position.

The Expedition tab includes three once-per-run specializations, a three-slot artifact loadout, and three challenge expeditions. Trials unlock after the first ascension. Starting one explicitly resets the current run without ascension rewards. They disable stardust power, relic effects, artifact bonuses and starter gifts; completing or abandoning starts a new normal run. Trial completions award Echoes once and unlock artifacts and powerful relics.

After the first ascension, enable auto-buyers and select cheapest-first or base-output-per-cost priority, with a 10%, 25%, or 50% per-tick budget. Automation buys at most ten structures per second while the browser tab is visible, respects trial restrictions, and does not simulate purchases offline.

Four world abilities rotate through the twelve worlds with a shared 90-second cooldown. Orbital modules appear as your structure count grows, comets cross the scene during capture windows, Overdrive accelerates drones and brightens the core, and discoveries emit expanding rings. Reduced-motion preferences suppress the moving effects. Original and v2 saves migrate to the expanded structure and relic arrays.
