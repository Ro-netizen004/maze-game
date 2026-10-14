# Longleat Hedge Maze

"Longleat Hedge Maze" (https://skfb.ly/6TYUT) by Marius Dobre is licensed under
Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/

Source: root `longleat_hedge_maze.glb` (preserved unmodified).
Adaptations: normalize the long dimension to 96 meters; cut three circular
clearings of radius 5 meters in the middle; level the ground; remove supplied
preview characters and elevated bridges/platforms, since gameplay uses flat
ground; resize textures to 1024 pixels. The authored hedge corridors remain.

`scripts/assets/export-longleat.py` produces `maze.glb`, the mesh-derived
collision/navigation grid in `src/game/world/longleatLayout.json`, and an
overhead render in `docs/layout/longleat-clearings.png`.

The collision grid is sampled from the edited hedge mesh, not procedurally
generated. Objective placements use reachable authored paths. No extra paths
are carved to connect objectives.
