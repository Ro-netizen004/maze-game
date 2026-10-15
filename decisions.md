# Decision log

## Current branch: original maze maps

Branch: `codex/original-maze-maps`. The maze maps are restored from
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
## 19. Shrub tiles for the original maps; deploy this branch — 2026-10-14

Use the supplied Shrub tiles pack (3 vars, seamless) by LOLIPOP, CC BY 4.0, as
the visible walls of Stonegate, Amber Halls, and Twilight Labyrinth. Preserve
their original grids, keys, gates, and progression. Extract all three tile
examples from the showcase; normalize their footprints to 2 × 2 meters and
height to 2.4 meters, with the base at zero. Instance shared assets and resize
textures to 512 pixels to keep the browser model small. Gate cells stay clear.
Include creator/license attribution in the game menu and CREDITS.

The user explicitly selected codex/original-maze-maps as the website deployment
branch. Its workflow triggers on this branch and rejects dispatches from other
branches. Restrict the github-pages deployment environment to this branch so
future main pushes cannot replace this website. Keep main's game source intact.
## 20. More lightposts and rune gardens — 2026-10-14

At the user's request, attach three side clearings to existing paths in each
original maze. Preserve all interior corridor cells and key/gate world positions.
Symmetric grid padding provides room outside the old perimeter; isolated access
spurs prevent new shortcuts around gates. Keep the old start/end openings and
update coordinate-based fixtures and landmarks for the padded grid.

Use ARTEL_3D's previously supplied ritual-circle model in each garden, with faint
self-lit glyphs, an E/touch prompt within three meters, and persistent brighter
glow after activation. Show rune progress in the HUD. The existing key-and-gate
exit remains; Twilight's Dawn/Moon runes still operate its optional shortcut.

Add 15–18 physical lightposts per desktop map and nine on mobile, including two
per desktop garden. Pool actual point lights at the nearest five desktop or
three mobile posts and avoid their shadow passes. Cache static collision bounds
per gate state so larger padded maps do not recreate walls every movement step.
Continue deploying codex/original-maze-maps.

## 21. Honest hedge gaps, menu settings and forest ambience

Close misleading shrub gaps using overlapping instances within collision footprints. Keep approximately 30% of eligible isolated hedge recesses as walkable, single-entrance hiding pockets; avoid gates and never join corridors. E enters/exits a pocket and hidden players emit no footsteps. Retain the original three mazes and their key progression. Port main's forest menu styling and graphics choices, expose settings before play, and keep audio mute/volume preferences. User-supplied ambience loops only during active visible gameplay with szegvari/Pixabay credits. Remove obsolete box-maze components, unused starter assets and standalone preview entry points; retain source models and exporters.

## 22. Scene-first menu and rendering efficiency

Use the supplied shooter lobby reference for layout: centered title/play action, left navigation, right maze/difficulty setup, and an unobstructed scene. Reorganize only existing instructions, best times, settings and credits; add no gameplay or online systems. Batch trail tiles into a single instanced draw with the same texture and geometry. Memoize static forest and lighting components so timer/HUD updates do not rebuild the scene. Preserve existing graphics presets, vegetation, lights and shadows.

## 23. Foreground flashlight and entrance shelter

Render the held flashlight in a small foreground scene after clearing world depth, so hedges cannot occlude or cut through it. Keep its fixed camera-relative position and render its beams in the world as before. Add one guaranteed hedge hiding pocket beside the outside entrance step on each maze, in addition to the roughly 30% optional recesses. Keep it isolated from adjacent pockets and retain gate progression.

## 24. Recognizable hiding markers

Mark every usable hiding spot with the same small wooden sign: a pale green crouching figure behind cover and HIDE lettering. Place hedge signs beside the pocket entrance without occupying its walking center. A softly emissive painted face remains readable at night without new lights or animation. Reuse one generated texture for all signs and explain the cue in the existing guide. Preserve E interaction and hiding mechanics.

## 25. Connected escape objectives

Ruby's key opens its seal, which awakens Dawn. Sapphire's key opens its seal, which awakens Moon. Lit Dawn and Moon enable Watcher; all three runes plus both inner seals are required to open the exit. The HUD names the next step, locked rune prompts explain missing dependencies, and the solvability checker simulates ritual progress. Preserve the original maps, hiding and guardian behavior. Multiplayer remains a proposal in MULTIPLAYER_DESIGN.md: shared clues, paired mechanisms, ritual channeling and group evacuation/rescue; do not imply networking is implemented.

## 26. Blackout, flashlight exposure and stronger Hard mode

At 90 seconds of active run time, all lightposts flicker for 1.2 seconds and then go fully dark for 12 seconds before recovering. Pausing freezes this schedule; restarting resets it. The flashlight is independent and a full charge now lasts five minutes. A beam hitting the guardian reveals the player's position regardless of facing or hiding, while walls, closed doors, beam direction and range still matter. Revealed shelters remain vulnerable briefly after the beam switches off, with an explicit HUD warning; a different hiding spot is not automatically exposed. Hard mode outruns walking (4.7 m/s versus 4), has broader sight, stronger hearing, a 16-second search and longer exposure memory. Sprinting and breaking sight remain escape options.

## 27. Earlier lightpost blackout

Move the first lightpost flicker from 90 to 45 seconds of active run time, as requested. Retain the 1.2-second flicker, 12-second darkness, pause behavior and independent flashlight.

## 28. Separate shelter exposure from ordinary pursuit

Fix reports of players being caught after switching the flashlight off before hiding. A beam from a walking player still starts a chase, but cannot expose a shelter entered later. Record a separate shelter position only when the guardian is illuminated while the player is already hidden; ordinary sightings and noises cannot transfer that exposure to a different location. Preserve the brief memory of a genuinely revealed shelter after its light is switched off. Add regressions for normal and Hard mode and for moving to a different hiding location.

## 29. Make the lightpost flicker visibly distinct

Keep the requested once-per-run blackout at 45 seconds. Replace the brief 12 Hz dim flicker with three seconds of slower, full-brightness flashes that are easier to see, followed by a full twelve seconds of darkness. Latch the event instead of deriving it only from the current timer: a long frame stall must not skip the whole outage. Cap phase advancement on delayed ticks, freeze while paused, and reset on restart. Without stalls, lightposts restore at 60 seconds. Keep the flashlight independent.

## 30. Guardian proximity whisper

Use the user-supplied Demonic Whisper by Magnesus (Freesound), via Pixabay, as a proximity warning. Start within six metres, increase volume as the guardian approaches, and stop at eight metres to avoid rapid toggling at the threshold. Loop the clip only during active, visible gameplay, including while hiding; silence it on pause and after the run ends. Unlock playback from Start/Resume gestures and reuse the existing audio mute/volume settings, relabelled for both forest and guardian audio. Credit the artist and Pixabay Content License in the menu and CREDITS.md. This sound is a warning for the player and does not itself reveal their hiding spot.

## 31. Meaningful place names

Rename the maps to The Forgotten Garden, The Keeper’s Grounds and The Ritual Grove. Keep their internal IDs and original layout lookup names so saved best times/unlocks survive. Give Dawn, Moon and Watcher distinct place names: Sunwell Clearing, Moonwell Clearing and The Watcher’s Court. Retain the rune names for the objective chain, add sun/crescent/eye plaques in their clearings, and give Sunwell warm lights and Moonwell cool lights. Rename existing landmarks after nearby paths, seals, shelters and the Old Road exit instead of inventing buildings or props that are not there. Update menu, HUD prompts, guide and objectives consistently.

## 32. Ritual offerings extend the quest

Add one collectible relic per rune: Sun Ember for Dawn, Moon Tear for Moon, and Watcher’s Eye for Watcher. Ruby and Sapphire seals awaken their respective relics; both earlier runes must be lit before the Eye can be collected. Carry each relic back to its matching ritual and offer it with the existing interaction control. Retain the seal requirements and require all three completed rituals for escape. Relics occupy distinct original maze trail cells away from their ritual sites, avoiding key spawn pools, gates, traps and shelters. Use small, static emissive meshes without new point lights or downloaded assets. Show missing, carried and offered states in the inventory, explain locks in prompts, and guide each collection/delivery step in the HUD. Clear offerings on restart and validate all seeded maps plus missing-relic deadlocks.

## 33. Supplied eyeball for the Watcher’s Eye

Replace the torus placeholder with one eye extracted from the user-supplied Eyeballs Earthly Series Eyes v.4 by MovedSitesCheckProfile (CC BY 4.0). Preserve the offering’s maze cell and quest requirements. Normalize the model to 0.48 metres, center it above the pedestal with clearance, and face the iris toward the approach along the trail. Reduce geometry and textures for browser performance and include a fallback during loading. Credit the source and adaptations in the menu and CREDITS.md.

## 34. Modelled offerings, ritual candles and sequential revelation

Use the supplied potion bottle for Moon Tear and FNAF wall sun for Sun Ember. Add one collectible candle per ritual, requiring both the original offering and its candle before activation. Sequence: Ruby seal → Sun Ember → Dawn Candle → Dawn; then Sapphire seal → Moon Tear → Moon Candle → Moon; then Watcher’s Eye → Watcher Candle → Watcher. Reveal the next relic only when its preceding conditions are met; hide both model/pedestal and interaction until then. Both earlier rituals remain prerequisites for Watcher. Display a candle at each completed ritual as confirmation. Keep flame flicker lightweight and freeze it when paused or reduced motion is enabled. Normalize assets to fit above their pedestals, retain source assets/exporters, credit every author, retain the sun’s noncommercial terms, and distribute the adapted candle under CC BY-SA 4.0. Extend HUD/guide/progression validation to all six relics and verify that opening seals early cannot reveal later relics.

## 35. Carried inventory and deposited ritual offerings

Show a compact inventory of carried items with distinct icons and full labels on desktop and touch layouts. Remove keys from the box when their seal is opened, and remove both a ritual’s offering and candle when its rune is activated. Place those actual models inside the completed ritual circle, including the supplied eyeball. Keep immutable collection history for quest progress so consumed items cannot respawn or interrupt sequential revelation. Add activation feedback and verify inventory consumption separately from progression history.

## 36. Quest module refactor and review-image cleanup

Group quest definitions, progression, placement, inventory selectors and relic rendering under `src/quest`. Extract collection/activation/reset state into `useQuestProgress` so App focuses on composing the run. Merge the eyeball and other relic loaders, sharing geometry/textures while isolating materials and candle animation; split trail and deposited rendering into small components. Keep gameplay, model placements, saved IDs and quest order intact. Remove generated review screenshots while retaining model textures and original source assets. Document the module boundaries in README.md.

## 37. Solo and networked cooperative multiplayer

Keep Solo as the existing offline-capable game. Add 2–4 player co-op with private invite-code rooms, discoverable public lobbies and quick join matching the chosen maze/difficulty. Use a separate Node WebSocket service: it owns the seed, quest history, timer/blackout, guardian, catches and group result. Bound and collision-check position updates and validate nearby interactions and prerequisites on the server. Share keys/relics/runes and the carried inventory across the team; show synchronized teammate avatars. A caught player can be revived nearby with E/Use and receives five seconds of immunity. Require all connected players to reach the exit, or end the run when no remaining explorer can rescue the group. Transfer room ownership when the host leaves; preserve discoveries on disconnect, disallow mid-run joins, and reset everyone’s local stamina/light/cover state for new rounds. Keep Solo best times separate. Local pause stops player input while the shared world continues. Rooms are in memory on a single server instance. Supply a runtime server URL field, optional VITE_MULTIPLAYER_URL build variable, health endpoint and container/setup instructions; GitHub Pages still hosts only the client. Public internet multiplayer requires the user’s separately hosted wss:// endpoint. Do not add chat/accounts or the proposed paired-mechanism/journal quest extensions yet.

## 38. More connected maze routes with retained dead ends

Add four hand-placed connections per map: two interior hedge cuts, one western flank loop, and a second Moonwell approach. Expand the perimeter padding by one cell on each side while preserving original world positions and saved map IDs. Extend short blind branches from the western and northern loops and retain remaining dead ends and hiding pockets. Build routes before selecting hiding pockets so shelters stay leaf recesses instead of blocking connections. Mark the outer loops with lightposts while keeping the nearest-point-light cap. Preserve the Ruby barrier, keyed progression and ritual/exit requirements. Use the same generated layout for Solo and the multiplayer server, and test alternate paths, dead ends, all seeded quest variants, and both player/guardian collision clearance.

## 39. Hosted multiplayer endpoint

Use the user-provided Render server at wss://maze-game-h8ed.onrender.com as the default production multiplayer endpoint. Keep localhost for development and retain the VITE_MULTIPLAYER_URL override. Verify both the /health response and a WebSocket handshake/room listing using the GitHub Pages origin before configuring the address. Publish client and server layout changes together so both use the same maze routes.
