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

The deployment workflow validates and publishes pushes to `main`. In repository
Settings → Pages, choose **GitHub Actions** as the source. The workflow builds
with the `/maze-game/` base path; local development uses `/`.

## Asset credits

See [CREDITS.md](CREDITS.md) for creators, source links, licenses, and adaptations.
Original models are preserved in `src`; browser-ready copies live in
`public/models`. The optional Blender export scripts regenerate those copies.
Portable tools, dependencies, build output, and local review screenshots are
excluded from Git.

Stonegate forest quest: explore the larger looping trails, recover Ruby, Emerald,
Amber and Sapphire keys, and read the Dawn and Dusk journals with E. The journal
panel gives the next objective and landmark hint. All four inner seals and both
journals are required before the exit opens. Wider clearings allow movement around
the guardian, with grass along trail shoulders. Shift runs; Space jumps.
