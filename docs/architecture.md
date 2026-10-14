# Repository architecture

`src/main.jsx` mounts the stable `src/App.jsx` entry point. App delegates to
`src/game/Game.jsx`, which assembles DOM overlays around `GameScene.jsx`.
`hooks/useGameSession.js` owns session state, lifecycle effects, persistence,
collection actions, pause/read behavior, and result transitions. GameScene owns
the Three.js canvas and connects session state/actions to scene entities.

| Directory | Responsibility |
| --- | --- |
| `src/game/world` | Active level definitions, seeded runtime, collision, navigation, landmarks |
| `src/game/player` | Movement, avatar, input, stamina |
| `src/game/guardian` | Guardian behavior, sensing, models, animation |
| `src/game/quest` | Journals, circles, escape requirements, interactable props |
| `src/game/environment` | Forest scenery, boundaries, exit, sky, textures, shared primitives |
| `src/game/lighting` | Flashlight rendering and battery rules |
| `src/game/state` | Save format and run timer calculations |
| `src/game/rendering` | Graphics budgets, asset fallback, developer profiling |
| `src/game/ui` | HUD, menus, settings, journal reader, touch controls |
| `src/previews` | Avatar, guardian, and road preview entry points |
| `src/legacy` | Dormant maze rendering and unused starter CSS |
| `tests` | Node regression tests; old maze maps live in `tests/fixtures` |
| `scripts/assets` | Optional Blender and Node model preparation tools |

Pure rule modules can be tested without mounting React or WebGL. Runtime modules
must not import fixtures or legacy scenes. Shared forest primitives live in the
active environment folder rather than depending on the old maze renderer.

The active level keeps `openForest` for journal/rune quest behavior and sets
`treeLabyrinth` for grid collision, guardian routing, and blocked sight. It uses
the supplied Longleat GLB through `environment/LongleatMaze.jsx`. The Blender
exporter `scripts/assets/export-longleat.py` cuts three middle clearings and samples
collision data into `world/longleatLayout.json`. `world/levels.js` places journals
on reachable authored paths. Imported maps declare their own cell size; legacy
maps retain two-meter cells. Prior custom-map files and images are historical.

Some internal names (`collectedClues`, `activatedShrines`, key/door helpers) are
retained for compatibility with existing components and regression fixtures.
They do not imply keys or doors are present in the active open-forest level.

## Assets and tools

Browser-ready models stay under `public/models`; their URLs are unchanged.
Original supplied assets retain their existing locations under `src/book-prop`,
`src/flashlight`, `src/occult-ritual-circle-stylized-prop`, and the source GLBs in
`src`. These are tooling inputs, not imports in the active game bundle.
See CREDITS.md and each public model's README for licenses and adaptations.

Run Node exporters **from the repository root**:

```sh
node scripts/assets/export-creature.mjs
node scripts/assets/prepare-monster.mjs
```

Blender exporters resolve the repository root from their own location:

```sh
blender --background --python scripts/assets/export-performance-assets.py
blender --background --python scripts/assets/export-ritual-circle.py
```

## Validation and previews

```sh
npm test
npm run lint
npm run build
npm run build -- --base=/maze-game/
```

`npm test` discovers `tests/*.test.js`. Start `npm run dev` to use the game and
`/avatar-preview.html`, `/monster-preview.html`, `/forest-road-preview.html`.
The previews are local review tools; deployment builds the main game entry point.
`/?profile` adds development frame statistics.

Major product and architecture choices are recorded in [decisions.md](../decisions.md).
