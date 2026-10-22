# Coastline Rush 1.35 — Driver upgrade

## Included

- Driver Hub on the startup screen: Auto, Low, Balanced and High graphics; tilt sensitivity; corner assist; reduced motion; replayable practice; medals; backups.
- Low targets 30 fps, lowers rendering resolution, disables shadows, shortens scenery visibility, uses simpler nearby opponent models and reduces mountain terrain tessellation and weather particles. High retains detailed assets and shadows. Auto chooses a preset from available device hints and can fall back to Low after sustained slow frames. A target is not a guaranteed frame rate.
- Cached road deformation calculations, fewer mountain normal recalculations, throttled HUD updates and bounded physics substeps reduce CPU work and keep simulation time more consistent during slower frames.
- Gentler, filtered corner pull; slower sensor jitter filtering with a fixed calibrated centre; native accelerometer low-pass filtering. Neutral straight-road controls produce no sideways force. The keyboard menu guard is fixed.
- Optional four-step practice: accelerate, steer, brake and double-tap gas for nitro. Practice has no rivals, rewards or recorded race results. Skip or replay it from Driver Hub.
- Rivals anticipate traffic, choose clear overtaking lanes, avoid obstacles, seek boost strips, defend early with a safety gap and brake for upcoming corners. They retain comparable car builds and existing earned nitro.
- Gradually narrowing mountain switchbacks, harbour and underpass sections. Road meshes, markings, rails and driving bounds use the same width profile. Mountain Pass gains a textured, illuminated Summit tunnel, repeated on longer championship courses.
- Braking while steering into a bend above 85 km/h starts a controlled drift. A clean release banks a small nitro reward; wrong-way turns, guardrails, airborne travel and Career cannot farm drift rewards. Car yaw, tyre smoke and a drift HUD show the action.
- Race medals and six permanent, one-time milestones. Three clean drifts in one run unlock Ember paint. Existing coins, cars, upgrades, cups and completed results remain saved.
- JSON export/import of the normalized profile, including championship progress, paint, milestones, history and trial ghosts. Imports validate size, format, history and numeric values, show a preview, and require replacement confirmation. A local recovery copy is kept. Android uses the system document picker; browser builds use normal file downloads and selection.
- Starting-grid camera movement, reduced-motion support, a podium strip, finish animation and milestone breakdown in results.

## Verification and limits

Automated checks cover controls, tilt, bot safety, drift rewards, route widths, save round trips and rejected backups, one-time milestone rewards, paint ownership, existing missions, races, trials, shortcuts and all 22 championship rounds. Browser checks cover the complete tutorial, graphics controls, import/recovery, tunnel rendering and result payouts.

At the same 1.55 km Mountain Pass position and 1280 × 720 browser viewport, observed rendering work was 934,552 triangles at 1088 × 612 pixels on Low versus 1,221,846 triangles at 2048 × 1152 on High. This is approximately 24% fewer triangles and 72% fewer pixels. It is not a measured performance guarantee for a physical phone.

Physical Android device checks remain necessary for frame rate, memory, tilt feel, multi-touch, audio and the native document-picker workflow. Signed APK compilation verifies that the native APIs and resources build together. This is a direct-install beta and uses the previous signing key.

## itch.io update

Replace the previous Android download with `CoastlineRush-1.35-beta.apk`, keep the Android platform flag, update the description version, and add a development log with these changes. The existing public beta is https://myncreate.itch.io/coastline-rush . A local build or web deployment does not update that APK listing automatically.
