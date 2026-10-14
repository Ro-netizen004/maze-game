# Maze Game

A first-person nighttime forest maze built with React, Three.js, React Three Fiber,
Vite, and Tailwind. Collect keys, open gates, avoid the guardian, and reach the exit.

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

The production site is in `dist`. No backend is required for the current
single-player game. The blocky avatar is prepared for future multiplayer work.

## GitHub Pages

The deployment workflow validates and publishes pushes to `codex/original-maze-maps`. In repository
Settings → Pages, choose **GitHub Actions** as the source. The workflow builds
with the `/maze-game/` base path; local development uses `/`.

The `github-pages` environment permits deployments only from this branch.
Stonegate, Amber Halls, and Twilight Labyrinth retain their original layouts and
progression. Visible maze walls use all three supplied shrub tile variants by
LOLIPOP. Each tile meets the floor, fills its two-meter wall footprint, and shares
geometry/materials across the maze. `export-shrub-tiles.py` rebuilds the optimized
browser asset from `src/shrub_tiles_pack_3_vars_seamless.glb`.

## Asset credits

See [CREDITS.md](CREDITS.md) for creators, source links, licenses, and adaptations.
Original models are preserved in `src`; browser-ready copies live in
`public/models`. The optional Blender export scripts regenerate those copies.
Portable tools, dependencies, build output, and local review screenshots are
excluded from Git.
