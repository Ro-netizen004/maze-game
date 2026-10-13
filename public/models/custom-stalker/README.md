# Custom deep-sea stalker

Game copy of `src/bioluminescent_deep_sea_stalker.main_design.glb`.
Run `node prepare-monster.mjs` to rebuild it. Large CAD/modeling metadata is
removed; positions, normals, indices, materials, and named parts are preserved.

The source contains no skeleton or animation clips. `src/customMonsterRig.js`
builds a rigid-part joint hierarchy at runtime for idle breathing, walking,
running, and reaching attacks. This does not require Blender or a paid service.
The original asset remains unchanged. Its ownership/license remains that of
the supplied original asset.

For a development preview, open `/monster-preview.html` on the Vite server.
