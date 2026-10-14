# Decision log

## Current branch: original maze maps

Branch: `codex/original-maze-maps`. The game source is restored exactly from
`69f2491` (the initial maze game), with Stonegate, Amber Halls, and Twilight
Labyrinth. Keys, gates, and original progression are restored. The later forest,
journal, ritual-circle, custom-layout, and Longleat changes remain on main.

## 18. Restore the initial maze on a separate branch — 2026-10-14

The user canceled the Longleat grounding work and requested the initial maze maps
on a different branch. Start from the initial committed game rather than editing
or replacing those maps. Preserve main and its deployed version. Keep the user's
untracked audio file. Retain the previous decisions below as history from main;
their “current” labels refer to that branch at the time of each decision.

## Archived decision history from main

Major decisions made through 2026-10-14. This records the current game and the
choices it replaced; it is not a list of proposed features. The gameplay baseline
before this refactor is commit `910a267f49edadb4aadd8c75f77b0f559149f993`.

## 1. Browser game architecture — current

Use React, Three.js/React Three Fiber, Vite, and Tailwind for a single-player,
first-person game. No backend is needed. A prepared player avatar supports later
experimentation, but multiplayer has not been implemented.

## 2. Keys and gated maze progression — superseded

The original game used maze corridors, colored keys, locked seals, and multiple
levels (Stonegate, Amber Halls, Twilight Labyrinth). Stonegate was expanded with
four keys/seals and Dawn/Dusk journals. The user subsequently chose journals in
place of keys and explicitly requested removing the maze. Old maps and maze
renderers remain reference material and regression fixtures, not active levels.

## 3. Five journals with lore and clues — current

Find five journals in any order. Each contains original keeper lore and a clue to
another location. Collecting opens a reader; recovered journals can be reopened
with J or the HUD archive. Reading pauses movement, the guardian, the run timer,
and battery use so players can actually read the story.

The first proposed model was Old Journal by omccartan; a downloadable asset was
unavailable and a placeholder was briefly used. The supplied **Book Prop by
Sofkin**, licensed CC BY 4.0, became the actual journal model. Keep creator,
license, source links, and adaptations in CREDITS.md and the game credits.

## 4. Open forest and free movement — superseded by decision 13

Use one 50-by-50-meter nighttime forest with six landmark signs and scattered
groves. The user requested free movement inside a boundary: the player can cross
scenery cells, while radius-aware rectangular limits keep walking, sprinting,
and jumping inside the perimeter. Low posts and rope make that boundary visible.
The guardian also moves freely within the forest bounds.

## 5. Ritual circles replace doors — current

Use **Occult Ritual Circle – Stylized Prop by ARTEL_3D**, CC BY 4.0, at five sites
just south of the journals. Dormant circles have a faint self-lit glow and marker;
activated circles stay brightly lit with a light column. E or touch Interact works
within three meters from any side, without precise aiming. They remain visible
with the flashlight off and avoid adding a dynamic light per circle.

Activate circles in any order. Escape at the Old Road clearing in the southeast
requires **all five journals and all five activated circles**.

## 6. Controls and accessibility — current

WASD movement, mouse look, Shift sprint, Space jump, E interaction, J archive,
F flashlight, and Escape pause/close reader. Drag-to-look is the fallback when
pointer lock is unavailable. Touch devices have virtual controls. Settings include
look sensitivity, invert Y, reduced motion, flashlight intensity, and graphics.

## 7. Flashlight duration — current

The user reported the flashlight turned off too quickly. Replace the approximately
40-second battery with five minutes per full charge; recharge fully in 50 seconds
while switched off. Pausing and reading do not drain the battery.

## 8. Performance and environment — current

Preserve original model files and serve optimized copies from public/models.
Use smaller vegetation meshes, merged book parts, capped stable grass, shared
instanced scenery, limited fog, and flashlight-only dynamic shadows. The ritual
model was reduced from roughly 61 MB/500,000 triangles to 4.7 MB/12,000 triangles
with 1024-pixel textures. Menus and reading use demand rendering.

Provide Balanced, Performance, and High graphics settings; touch devices use the
smaller budget. Ground texture, soft paths, ferns, moss, moon/stars, and fallen
branches improve the forest. The exit uses a lightweight Old Road continuation
instead of loading another expensive scene. Development profiling is available
with `?profile`; measured improvements are observations, not guaranteed FPS.

## 9. Guardian and stamina difficulty — implemented baseline

The first difficulty pass increased guardian sight, hearing, search duration, and
movement speeds. Normal chase speed is 4.8 m/s versus player walking at 4 and
sprinting at 7.2; Hard starts at 5.5. Easy remains gentler. Each activated circle
increases aggression, and activation is globally audible at its location.
Activation noise is protected briefly from being overwritten by footsteps.

Search behavior turns at the last known position. Scenery provides line-of-sight
occlusion; hiding cannot be entered while actively chased, and hidden players are
silent. Sprint drains 30 stamina/second, regenerates 12/second, and exhaustion
requires 25% recovery before a new sprint. The HUD explains exhaustion.

## 10. More dangerous guardian, open forest retained — superseded direction

The user still found the open forest easier than the maze and chose **keep the
open forest and focus on a more dangerous guardian**. Further AI changes have
not been implemented. The subsequent request explicitly prioritizes refactoring
and reorganization first. Do not treat speculative AI ideas as completed work.

## 11. Persistence and deployment — current

Keep local settings, difficulty, unlock state, and best times in the version-1
`maze:progress` localStorage record. Preserve that key during reorganization.
GitHub Actions validates and deploys main to GitHub Pages with `/maze-game/` as
the production base path. Local development uses `/`. Run lint, Node regression
tests, and production builds before shipping. Pushing remains a separate action.

## 12. Refactor before further gameplay changes — current request

Separate session state/actions, scene composition, UI, world logic, player,
guardian, quests, environment, lighting, persistence, and rendering. Move tests
to tests/, preview entry points to src/previews/, export tools to scripts/assets/,
and dormant maze code to src/legacy/. Keep public asset URLs, gameplay tuning,
save format, and credits intact. Original source model directories retain their
existing paths because Windows prevents moving those folders in this session.
See docs/architecture.md for module ownership and maintenance commands.

Update this log when a major decision changes, explicitly marking replaced
choices and distinguishing agreed future work from implemented behavior.

## 13. Return to a maze made of trees — superseded by decision 16

The user supplied a sketch of broken circular rings and hooked corridors and
requested a maze-like structure again, using trees instead of plain box walls.
The active forest now has a deterministic 25-by-25 tree-barrier layout within the
existing 50-meter footprint. Broken rings, winding branches, and connected
clearings replace scattered islands. Player collision, guardian routing, and
guardian sight use the barrier grid; the guardian cannot take direct shortcuts
through trees. This supersedes unrestricted movement through scenery and the
earlier preference to retain an entirely open forest.

Keep the five journals, five ritual circles, any-order collection, southeast
Old Road exit, five-minute flashlight, and existing guardian/stamina tuning.
Reserve clearings for objectives and connect disconnected paths by opening the
fewest tree cells. Use the existing instanced tree assets and undergrowth as the
visible barriers. No box walls are added. Update lore that described wall-free
forest travel. The layout image and JSON in docs/layout are generated from the
same active map; scripts/layout regenerates them.

## 14. Central ring of hooded statues — current, 2026-10-14

At the user's request, use the supplied Hooded Figure Statue by llussun7
(https://skfb.ly/pyB9M), CC BY 4.0, in the central circle. Eight copies face
inward at a radius of 4.8 meters, each 2.4 meters tall. Offset the ring so its
north/south entrances remain between statues. Share geometry, materials, and
textures; avoid additional dynamic lights or statue shadow passes. Preserve
the original downloaded files and add attribution to CREDITS and the game menu.
The statues are decorative and do not change objectives or guardian tuning.

## 16. Use the supplied Longleat maze — current, 2026-10-14

The user explicitly replaced the custom map: use Longleat Hedge Maze by Marius
Dobre (https://skfb.ly/6TYUT), CC BY 4.0, and make exactly three circular clearings
in the middle for the runes. This supersedes decisions 13 and 15's generated tree
walls. Preserve the supplied hedge corridor plan; the only path layout cuts are
the three circles. Derive collision/navigation by raycasting the edited hedge
geometry. Do not generate connecting corridors or substitute a custom maze.

Normalize the longest dimension to 96 meters. Clearings have radius 5 meters at
game positions (0,-14), (0,0), (0,14), each with one ritual circle. Keep five
journals on reachable authored paths. Escape now requires five journals and three
runes. Update HUD/menu instructions and journal clues accordingly. The statue
ring remains in the middle clearing, tightened to radius 3.5 meters.

Level the supplied ground for fixed-height movement, remove source preview
characters and elevated bridges/platforms, and resize textures for the browser.
Preserve the original GLB and source attribution. A distinct level ID keeps old
forest best times separate. Generate an overhead render from the actual edited
asset. Prior layout images are historical references, not the active map.

## 17. Spread the rune clearings farther apart — 2026-10-14

At the user's request, move the north/south clearings from z=-14/+14 to
z=-24/+24, keeping the central clearing at zero and all radii at five meters.
Adjacent centers are now 24 meters apart, with 14 meters between their edges.
Regenerate from the untouched supplied source so the earlier cuts are restored.
Keep the Longleat corridors and verify all three runes are reachable. Deploy the
finished change to GitHub Pages as explicitly requested.

## 15. Visible maze barriers and empty scenery batches — tree walls superseded by decision 16

Browser verification found that empty path/rock instance batches crashed the
scene after the labyrinth update. Empty batches now render nothing. Tall trees
alone also left visually open gaps beneath their canopies, so add dense evergreen
saplings along the same barrier grid. Use shared low-poly geometry, three
instanced batches, and no additional shadows to make the walls visible at player
height without multiplying imported tree costs. Keep the existing layout intact.
