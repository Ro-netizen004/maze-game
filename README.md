# Maze Game

A first-person nighttime forest maze built with React, Three.js, React Three Fiber,
Vite, and Tailwind. Collect keys, open gates, avoid the guardian, and reach the exit.

## Code organization

- `src/App.jsx` composes the run, rendering, audio and menus.
- `src/quest/` owns ritual definitions, progression rules, generated offering
  locations, carried/deposited inventory selectors and the quest state hook.
- `src/quest/OfferingObjects.jsx` renders trail collectibles and deposited items;
  `RelicModel.jsx` shares GLTF loading, cloned material cleanup and candle flicker.
- `src/components/` contains the HUD, labeled inventory and menu controls.
- `src/multiplayer/` handles browser connections, room UI, synchronized avatars,
  the shared guardian renderer and the team HUD. `coopMap.js` defines the one
  fixed 82 × 82 m co-op maze; `coopQuest.js` shares inventory, ritual and respawn
  rules between client and server.
- `server/` hosts in-memory rooms and validates shared quest actions, movement,
  guardian behavior, revives and group escape through WebSockets.
- Root `src/*.test.js` files verify progression, collision, guardian behavior,
  model constraints and persistence with `npm test`.

Collection history is retained after items are used. Inventory derives what is
still carried from opened seals and completed rituals in Solo. Co-op tracks
personal carriers, explicit deposits and recoverable drops separately from
discovery history. Its four sequential runes require 16 relics with two carrying
slots per player. Caught explorers can be rescued or respawn after 15 seconds.
Generated review screenshots are temporary and should not be committed.

## Run locally

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Desktop controls: WASD to move, mouse to look, Shift to sprint, Space to jump,
E to interact, F to toggle the flashlight, and Escape to pause. If mouse capture
is unavailable, drag the scene to look. Touch devices have virtual controls.

## Validate and build

```sh
npm run lint
npm test
npm run build
```

The production site is in `dist`. Solo needs no backend. Multiplayer uses the
separate WebSocket service started with `npm run server`; see
[MULTIPLAYER_SETUP.md](MULTIPLAYER_SETUP.md) for local and hosted setup.

## GitHub Pages

The deployment workflow validates and publishes pushes to `codex/original-maze-maps`. In repository
Settings → Pages, choose **GitHub Actions** as the source. The workflow builds
with the `/maze-game/` base path; local development uses `/`.

The `github-pages` environment permits deployments only from this branch.
Stonegate, Amber Halls, and Twilight Labyrinth retain their original progression,
with four added connecting routes per map, two blind spurs and a slightly wider
perimeter. `src/mazeRoutes.js` defines the interior links, western flank and
Moonwell return path. Visible maze walls use all three supplied shrub tile variants by
LOLIPOP. Each tile meets the floor, fills its two-meter wall footprint, and shares
geometry/materials across the maze. `export-shrub-tiles.py` rebuilds the optimized
browser asset from `src/shrub_tiles_pack_3_vars_seamless.glb`.

Each Solo map includes three side clearings with glowing ritual circles. Stand
within three meters and press E (or touch Interact) to activate one. The HUD tracks
lit runes. Keys and gates still control the exit; in Twilight, Dawn and Moon runes
also unlock the existing optional shortcut. Added gardens have single access
paths and do not replace interior maze corridors.

Lightposts cover more path turns and surround each garden: 15–18 posts on desktop
and 9 on mobile. Only the nearest five (three on mobile) use actual point lights,
without extra point-light shadows, so additional lamps stay inexpensive.
The larger co-op map uses spatial shrub batches that skip distant foliage
beyond the fog, while retaining instancing and the same nearby appearance.

## Asset credits

See [CREDITS.md](CREDITS.md) for creators, source links, licenses, and adaptations.
Original models are preserved in `src`; browser-ready copies live in
`public/models`. The optional Blender export scripts regenerate those copies.
Portable tools, dependencies, build output, and local review screenshots are
excluded from Git.
