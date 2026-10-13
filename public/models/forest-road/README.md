# Forest road scenery

"a forest (3) with a road at night for game" by dasy444:
https://skfb.ly/pMHKA

Creative Commons Attribution 4.0 International:
https://creativecommons.org/licenses/by/4.0/

Adaptation: static meshes combined by material (roughly 1,480 meshes to
three mesh batches), textures capped at 1024 pixels, foliage alpha cutouts,
and scaled/oriented placement beyond the game's exit.

This is scenic terrain, not the maze collision map. The current win trigger
is at the maze exit; walking through this hilly scene would need terrain
collision and a dedicated playable layout.

Original preserved at `src/a_forest_3_with_a_road_at_night_for_game.glb`.
Rebuild with Blender background mode and `export-forest-road.py`.
Development preview: `/forest-road-preview.html`.

Performance update (October 2026): simplified to 67,231 triangles and 10,188,096 bytes.
Detailed scenery is loaded only within 9 world units of the exit. Original source
remains under src; this static backdrop does not change maze collision.
