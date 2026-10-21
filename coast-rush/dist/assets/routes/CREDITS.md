# Route scenery assets

All downloaded assets below are provided by [Poly Haven](https://polyhaven.com/) under [CC0](https://polyhaven.com/license). They are bundled locally for offline Android play. Authors are credited voluntarily.

| Asset | Authors | Local use |
| --- | --- | --- |
| [Rock Face 01](https://polyhaven.com/a/rock_face_01) | Dario Barresi | `rock_face_01.glb`: scanned cliff geometry, original 20,174 triangles, 2K base color, normal, and ARM textures |
| [Boulder 01](https://polyhaven.com/a/boulder_01) | Rico Cilliers | `boulder_01.glb`: scanned rock, geometry simplified to 54,146 triangles with UVs and PBR maps preserved; 2K textures |
| [Modular Urban Apartments Facade](https://polyhaven.com/a/modular_urban_apartments_facade) | James Ray Cock | `modular_urban_apartments_facade.glb`: two selected modules (`wall_window_centered_large_01` and `window_centered_large_01`) from the 147-module source kit; original detailed geometry, node transforms, and unchanged 2K PBR materials |
| [Concrete Wall 006](https://polyhaven.com/a/concrete_wall_006) | Dario Barresi (processing), Charlotte Baglioni (photography) | 2K concrete diffuse, normal, roughness, and ARM maps for flyovers and underpasses |
| [Rock Face 03](https://polyhaven.com/a/rock_face_03) | Dario Barresi (photography), Rico Cilliers (processing) | 2K cliff diffuse, normal, roughness, and ARM maps for mountain terrain |
| [Kloofendal 48d Partly Cloudy Pure Sky](https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky) | Greg Zaal (original), Jarod Guest (sky edits) | 2K HDR mountain sky and reflections |
| [Evening Road 01 Pure Sky](https://polyhaven.com/a/evening_road_01_puresky) | Sergej Majboroda (original), Jarod Guest (sky edits) | 1K HDR evening city sky and reflections |

GLBs use glTF 2.0 metallic/roughness materials, Y-up coordinates, and meter units. Base color textures are sRGB; normal and ARM maps are linear. ARM channels are ambient occlusion, roughness, metallic. No runtime remote asset requests or compressed-geometry decoder is required.

`asset-report.json` contains measured mesh bounds and individual apartment module names. Source metadata and reproducible download/conversion scripts are retained in the workspace `downloads/` and `asset-tools/` folders.

Rock Face 03 PBR maps also texture the rough shortcut surfaces and small shortcut rocks.
