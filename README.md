# The Keeper’s Forest

A first-person nighttime forest exploration game built with React, Three.js,
React Three Fiber, Vite, and Tailwind. Recover five journals, learn the keeper’s
story, avoid the guardian, and escape along the Old Road. There are no maze
corridors made of box walls, keys, or locked gates in the active game. The active
layout uses the supplied **Longleat Hedge Maze by Marius Dobre**, CC BY 4.0, with
three circular rune clearings cut into its middle. The original hedge paths are
preserved; collision and navigation are sampled from the edited model.

## Run locally

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Desktop controls: WASD to move, mouse to look, Shift to sprint, Space to jump,
E to collect/read journals or hide, J to reread the archive, F to toggle the
flashlight, and Escape to pause or close a journal. If mouse capture
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

## Code organization

Gameplay modules live in `src/game`, grouped by world, player, guardian, quest,
environment, lighting, state, rendering, and UI. The session controller is separate
from scene composition. Regression tests live in `tests`, preview entry points in
`src/previews`, and model preparation tools in `scripts/assets`. Run those tools
from the repository root. Dormant maze code is isolated in `src/legacy`.

See [architecture](docs/architecture.md) for module ownership and
[decisions](decisions.md) for current, superseded, and pending major choices.

Explore the Longleat hedge maze, normalized to 96 meters along its longer side.
Player collision, guardian paths, and blocked sight follow the supplied hedges.
Three circular clearings of radius five meters run along the middle, each with
one rune. Eight hooded statues face inward around the middle clearing.
See [the actual edited model](docs/layout/longleat-clearings.png). Regenerate the
browser model, collision data, and overhead image with
`blender --background --python scripts/assets/export-longleat.py`.
The five journals can be found in any order; each contains original lore
and a clue to another location. Collecting one opens a reader and pauses the
guardian, player, timer, and flashlight battery. Reopen recovered books using J
or the HUD archive button. Activate the three ritual circles in the middle
clearings with E (or the touch Interact button). Circles have a faint turquoise glow
and floating marker before activation, then stay brightly lit with a light column.
Interaction works within three meters from any side and requires no precise aim.
Once all five journals are recovered and all three runes are lit, step into the glowing
Old Road clearing in the northeast to win.

The journal prop uses the supplied **Book Prop by Sofkin**, licensed under CC BY
4.0. Attribution appears in the game menu and CREDITS.md. Original asset files
remain in `src/book-prop`; the browser copy is in `public/models/book-prop`.

Ritual circles use **Occult Ritual Circle – Stylized Prop by ARTEL_3D**, licensed
under CC BY 4.0. `scripts/assets/export-ritual-circle.py` creates a 12,000-triangle browser copy
with 1024-pixel textures from the preserved supplied source asset.
The flashlight now lasts five minutes per full charge and recharges fully in
50 seconds while switched off. Reading or pausing does not drain its battery.

Old gated maps are kept only in `tests/fixtures/mazeLevels.js` for navigation/collision
regression tests; the game imports its open-forest definition from `src/game/world/levels.js`.

Graphics defaults to Balanced. In Pause → Settings choose Performance for slower
devices or High for a sharper image. Touch devices always use the smaller budget.
Menus and journal reading stop continuous rendering. Vegetation uses simplified
GLBs, detailed grass props are capped and stable across HUD updates, fog layers
are limited, and only the flashlight casts dynamic shadows. Forest ground detail,
soft footpaths, moss patches, fern clusters and fallen branches use small textures
and shared instanced batches. The Old Road continuation avoids loading a second
large forest scene during play.

Regenerate the simplified assets with Blender:
`blender --background --python scripts/assets/export-performance-assets.py`.
For local profiling, visit `/?profile`; the console reports frame and draw budgets.

The hunt escalates with each lit rune. Ritual activation is heard across the forest
and sends the guardian to that ritual’s location. On Normal and Hard it runs faster
than walking, searches longer, and moves freely within the same boundary as the
player. Trees can break sight, but standing inside scenery does not grant immunity.
Sprinting lasts roughly 3.3 seconds; after exhaustion it must recover to 25% before
another sprint. Hiding requires breaking the guardian’s line of sight first.
Easy remains a gentler option, and journal reading still pauses the game.
