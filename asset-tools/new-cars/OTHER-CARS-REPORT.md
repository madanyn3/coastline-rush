# Additional detailed car source candidates

Downloaded source assets only. Nothing in this task was copied into the game, published, or executed. Both selected models are self-contained glTF 2.0 binary files with no Draco, Meshopt, or external dependencies. Original images and geometry are unchanged.

## BMW M4 Competition M Package — sporty road coupe

- Local source: `bmw-m4/source.glb`, 22,739,084 bytes.
- Download URL: https://raw.githubusercontent.com/lukaizj/car-mod-saas/main/public/models/bmw-m4.glb
- Original author metadata: **𝙎𝙍𝙏 𝙋𝙚𝙧𝙛𝙤𝙢𝙖𝙣𝙘𝙚™**, https://sketchfab.com/TheRealSRT
- Original model URL: https://sketchfab.com/3d-models/bmw-m4-competition-m-package-5c0a2dafb1ad408d9fc9eeef9aee531b
- Embedded original Sketchfab export `asset.extras` explicitly identifies **CC-BY-4.0**, https://creativecommons.org/licenses/by/4.0/ . Retain author/title/source/license, and identify adaptations in game credits.
- Secondary distribution attribution: https://github.com/lukaizj/car-mod-saas/blob/main/public/models/ATTRIBUTION.md and https://github.com/coopercodes/bmwGLB (both identify same original author, URL, and CC-BY).
- 206,593 triangles, 30 meshes, 35 nodes, 28 materials, 12 embedded images. PNG textures are 512–1024 px, plus one 4×4 texture. No geometry extension required.
- Material `Meshesbody151Mtl` is the main paint candidate; inspect the livery/body textures before recoloring. `Mesheswindows1Mtl` is separate. Detailed grille, cabin, engine, lights, rims, and logos are present.
- Raw world bounds from glTF transforms: min `[-4.9781,0.00028,-10.5486]`, max `[3.6309,5.8808,9.2455]`. Normalize by actual length, recenter horizontally, and put the lowest vertex at road height. Y-up after source transforms. Front is inferred **+Z**: piggrill and radiator meshes occupy z approximately +8.0 to +9.25, against overall rear extent -10.55. Confirm in visual preview.
- Source preserved with full original texture resolution, including logos. Do not imply manufacturer endorsement.

## Dodge Challenger RT — muscle coupe

- Local source: `challenger/source.glb`, 17,484,524 bytes.
- Download URL: https://raw.githubusercontent.com/Vivekkk-1/3D-Models/main/Cars/dodge_challenger_rt.glb
- Original author metadata: **vecarz**, https://sketchfab.com/heynic and https://www.vecarz.com/
- Original model URL: https://sketchfab.com/3d-models/dodge-challenger-rt-wwwvecarzcom-73b11a33ba8c4a64a7c06ebb0fe7a93a
- Embedded original Sketchfab export `asset.extras` explicitly identifies **CC-BY-4.0**, https://creativecommons.org/licenses/by/4.0/ . Retain author/title/source/license, and identify adaptations in game credits.
- Supporting reupload page names original and CC Attribution: https://sketchfab.com/3d-models/dodge-challenger-rt-52f53cb8935249598342ad19d912043d . That reupload was not used as the download source.
- 196,492 unique-mesh triangles, 1,417 meshes, 5,690 nodes, 20 materials, 24 embedded images. Most texture images are 64–512 px; one is 1024×512. Geometry carries the detail, including grille, wheels, cockpit, and trim.
- Optional material extensions: `KHR_materials_specular`, `KHR_materials_clearcoat`, `KHR_materials_transmission`. Three.js GLTFLoader supports these. No compressed geometry or external texture decoder.
- Main paint material is `dDodge_ChallengerRTShakerF7_2015Paint_Material1`, with another `Color_2` paint group. Separate window, grille, light, and wheel materials.
- Source export world bounds are very small: min `[-.010893,-.000014,-.026819]`, max `[.010893,.014911,.025876]`. Normalize model length to approximately 4.9 game meters and set bottom to road height. Front is inferred **+Z** from Grille1A mesh at z +.0172 to +.0236. Y-up after source transforms. Confirm in visual preview.
- **Runtime preparation needed:** collapse/merge static pieces by material while preserving normals, UVs, and all triangles. Cloning 1,417 draw meshes per car would be too expensive. No source simplification was performed here.

## Evidence and inspection limits

`*/gltf-metadata.json` preserves complete original GLB JSON metadata, including primary export license fields. `*/inspection.json` records measured bounds, materials, and embedded image dimensions. The current original Sketchfab HTML pages returned 403 and model API returned 404, so current web-page license state could not be verified directly. The original Sketchfab-export metadata is the primary licensing evidence available locally; supporting mirrors/reuploads are documented, not presented as a new grant.

No source code in third-party repositories was run. This report does not claim that CC-BY grants manufacturer trademarks or any endorsement.

## Rejected research candidates (do not ship)

- **Khronos Buggy:** current Khronos Sample Assets README explicitly says it was removed for missing/unsuitable licensing: https://github.com/KhronosGroup/glTF-Sample-Assets#obsolete-interface . Saved historical README gives conversion credit but no use license.
- **Three.js Ferrari 458:** original vicent091036 Sketchfab listing currently unavailable; GLB has Draco geometry and no embedded license. Research copy `research/ferrari.glb` is not approved for integration.
- **Concept Car 037:** filename/title says public-domain CC0, but embedded export says `SKETCHFAB Standard`; conflicting evidence, so not selected. Research copy is not approved for integration.

## Files added by this task

- `bmw-m4/source.glb`, `ATTRIBUTION.md`, `gltf-metadata.json`, `inspection.json`
- `challenger/source.glb`, `gltf-metadata.json`, `inspection.json`
- `research/` contains metadata responses, historical Buggy README, and the rejected research-only GLBs. Keep them out of the game distribution.
