# Asset credits

## Ritual offering models

- **Potion Bottle Inspired By Death Becomes Her** by **Gregory Allen Brown**:
  https://skfb.ly/oJAyw · CC BY 4.0, https://creativecommons.org/licenses/by/4.0/.
  Adapted as Moon Tear: reduced geometry, portable materials replacing Blender
  procedural shaders, normalized and grounded on its pedestal.
- **FNAF Wall Sun** by **EmilJoes Games**: https://skfb.ly/owHBx · CC BY-NC 4.0,
  https://creativecommons.org/licenses/by-nc/4.0/. Adapted as Sun Ember: normalized
  collectible size and 512-pixel textures. This asset is licensed for noncommercial use.
- **Candle Light Animated** by **CΛTΞИCOΔΞ**: https://skfb.ly/69TFS · CC BY-SA 4.0,
  https://creativecommons.org/licenses/by-sa/4.0/. Adapted as three ritual candles:
  normalized geometry, browser-driven emissive flame flicker replacing the source
  animation. The adapted candle GLB is distributed under CC BY-SA 4.0; see
  `public/models/ritual-candle/LICENSE.md`. These asset licenses apply to the
  respective assets; this notice does not relicense unrelated game code.

**Eyeballs Earthly Series Eyes v.4** by **MovedSitesCheckProfile**

- Original model: https://skfb.ly/oKpyC
- License: Creative Commons Attribution 4.0 International, https://creativecommons.org/licenses/by/4.0/
- Source: `src/assets/models/eyeballs-earthly-series-eyes-v4/`.
- Game adaptation: extracted one eye, reduced to 6,000 polygons, resized its color
  texture to 512 pixels, and centered/scaled it to a 0.48-metre collectible.
  Browser asset: `public/models/watcher-eye/watcher-eye.glb`.

**Demonic Whisper** by **Magnesus (Freesound)**, distributed by
**freesound_community** on Pixabay.
- Source: https://pixabay.com/sound-effects/horror-demonic-whisper-100425/
- License: Pixabay Content License, https://pixabay.com/service/license-summary/
- User-supplied MP3: `public/audio/demonic-whisper.mp3`; looped as a guardian
  proximity cue with distance-based volume. Stops outside range and when paused.

**Flashlight** by **MAR.COS.**

- Original model: https://skfb.ly/o8H9O
- License: Creative Commons Attribution 4.0 International
  https://creativecommons.org/licenses/by/4.0/
- Game adaptation: converted for browser use, resized and oriented for a
  flashlight-only first-person view; textures resized to 1024 pixels;
  lighting controlled by the game.

**Realistic Trees Collection** by **Jungle Jim**

- Original collection: https://skfb.ly/pDzJR
- License: Creative Commons Attribution 4.0 International
  https://creativecommons.org/licenses/by/4.0/
- Game adaptation: selected three tree varieties and one bush, resized textures,
  grounded/scaled plants, and rendered repeated plants with shared instances.

**a forest (3) with a road at night for game** by **dasy444**

- Original scene: https://skfb.ly/pMHKA
- License: Creative Commons Attribution 4.0 International
  https://creativecommons.org/licenses/by/4.0/
- Game adaptation: combined static meshes by material, resized textures,
  applied foliage cutouts, and placed the scene beyond the exit.

**Grass** by **Cosmic_dust**

- Original asset: https://skfb.ly/p6tJE
- License: Creative Commons Attribution 4.0 International
  https://creativecommons.org/licenses/by/4.0/
- Game adaptation: selected grass clump, converted materials, resized textures,
  scaled/instanced plants along paths, and added gentle wind motion.

The blocky player avatar, mist, and maze forest layout are original game code.
## Shrub tiles pack (3 vars, seamless)

"Shrub tiles pack (3 vars, seamless)" (https://skfb.ly/pOyYY) by LOLIPOP is licensed
under Creative Commons Attribution (https://creativecommons.org/licenses/by/4.0/).
Source: `src/shrub_tiles_pack_3_vars_seamless.glb`. Adaptations: extracted the three
tile examples, resized textures to 512 pixels, normalized each to a 2 × 2 meter
footprint and 2.4-meter height with its base on the floor, and instanced the tiles
along the original maze walls. Browser asset: `public/models/shrub-tiles/shrubs.glb`.
## Occult Ritual Circle – Stylized Prop

"Occult Ritual Circle – Stylized Prop" (https://skfb.ly/pBDOJ) by ARTEL_3D is
licensed under Creative Commons Attribution (https://creativecommons.org/licenses/by/4.0/).
Browser asset: `public/models/ritual-circle/ritual-circle.glb`, restored from main's
optimized derivative (12,000 triangles). Adaptations: reduced geometry/textures,
normalized scale and height, self-lit glyphs and activation glow. Original source
and exporter are preserved in the main branch's history.

## Additional co-op relic models

- **Moon pendant** by **cyrus**, https://skfb.ly/oLLRF — Eclipse Ember.
  Source: `src/moon_pendant.glb`.
- **Iluminati Eye Symbol ( free )** by **Lucid Dreams (FAB)**,
  https://skfb.ly/opyCX — Watcher Ember. Source: `src/iluminati_eye_symbol__free.glb`.
- **Celtic silver ring** by **Aren Boada**, https://skfb.ly/6YC6Z — Silver Ember.
  Source: `src/celtic_silver_ring.glb`.

All three are licensed under Creative Commons Attribution 4.0:
https://creativecommons.org/licenses/by/4.0/. Adaptations: grounded and normalized
to a 0.55 metre maximum dimension, resized textures to at most 512 pixels,
reduced dense meshes and oriented the Watcher symbol toward the viewer.
Browser assets: `public/models/{eclipse-ember,watcher-ember,silver-ember}/`.
Rebuild with `export-coop-relics.py`. The four cooperative potion liquids reuse
the credited Gregory Allen Brown bottle with separate runtime colour materials.

## Golden Eye — Millinuim Eye

"Millinuim Eye" (https://skfb.ly/pwHPY) by **Seras** is licensed under
Creative Commons Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/).
User-supplied source: `src/millinuim_eye.glb`. Adaptation: normalized to a
0.56 metre maximum dimension, centered horizontally and grounded for the Golden
Eye offering. Browser asset: `public/models/golden-eye/golden-eye.glb`.
Rebuild with `export-golden-eye.py`. Other eye relics retain their existing model.

## Forest ambience

**Forest jungle nature dark Atmo** by **szegvari (Freesound)**, distributed by
**freesound_community** on Pixabay.
- Source: https://pixabay.com/sound-effects/nature-forest-jungle-nature-dark-atmo-6154/
- License: Pixabay Content License, https://pixabay.com/service/license-summary/
- User-supplied MP3 moved to public/audio/forest-ambience.mp3; looped with adjustable volume.
