# Shrub tiles pack (3 vars, seamless)

By LOLIPOP: https://skfb.ly/pOyYY
Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/

Original source: `src/shrub_tiles_pack_3_vars_seamless.glb`.
`export-shrub-tiles.py` extracts the three furnished tile examples, removes the
showcase scene, and reduces textures to 512 pixels. Each tile is normalized to
a two-meter-square footprint and 2.4-meter height, with its lowest vertex at zero.
The game instances shared meshes/materials at the original maze wall cells.
Passages and gate cells remain clear. The original maps and collision rules stay
unchanged. Runtime materials use alpha testing for foliage rather than blending.
