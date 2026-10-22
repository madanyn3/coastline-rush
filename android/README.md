# Coastline Rush for Android — 1.35

New in 1.35: Driver Hub graphics/steering settings, first-drive practice, predictive rival driving, route narrowing and Summit tunnel, drift nitro, permanent milestones and Ember paint, save export/import with Android document picker, and grid/podium presentation. See ../beta/RELEASE-1.35.md for the full changes and verification limits.

New in 1.34: custom lime/cyan Coastline Rush launcher artwork, density-specific legacy icons, circular icons and adaptive Android launcher resources. This remains a direct-install beta using the existing signing key. Gameplay and save format are unchanged.

New in 1.33: three-cup championship progression with fixed challenge levels and no cup difficulty selector. Coastline Cup (Rookie) has 5 rounds of 3/4/3/5/6 km, 21 km total. A top-three Coastline finish unlocks Neon Circuit (Pro): 7 rounds of 4/5/4/6/5/6/7 km, 37 km total. A top-three Neon finish unlocks Rush Masters (Elite): 10 rounds of 4/5/6/5/7/6/8/7/9/10 km, 67 km total. Locked cup cards show the required podium condition and cannot be entered. Prior Coastline podium records qualify for Neon automatically, regardless of their original difficulty.

Race physics, bots, finish timing/banner, map, HUD and results use each round's actual distance. Boosts, ramps, nitro bubbles and light obstacles extend along the full route; visible feature pools recycle for late-course content, and shortcuts use matching gates/scenery clearance across additional track sectors. Normal Race and Time Trial keep their 3 km format. Existing active cups keep their recorded rounds and locked car build; unplayed rounds adopt the new Coastline schedule and fixed tier. Past completed distances and rewards remain historical. Earned cup unlocks persist even when older trophy records age out.

New in 1.32: Coastline Cup championships. Tap the trophy/CUP button on the landing page to enter a five-race, 15 km campaign across Coastline, Neon City and Mountain Pass, including preset night and rain rounds. Choose Easy, Medium or Hard and an owned car; the car, upgrades and style are locked for the campaign. The same five named, distinctly coloured rivals return with comparable builds and small round-to-round variation. The main championship rival is ringed on the mini-map after the opener.

Championship points are 10/7/5/3/2/1. Ties use wins, podium finishes, then total race time. Unfinished bots are simulated to the line using race physics for official round results. Progress saves after each round and interrupted rounds can restart. Easy allows unlimited in-round restarts; Medium allows one per cup; Hard allows none. Completed rounds are sealed. Race coins remain available immediately; final bonuses are 600/400/275/175/125/100 coins for places 1–6, multiplied by 1/1.5/2 for Easy/Medium/Hard. A first title unlocks Champion Gold paint for owned cars. Trophy records and bonuses are saved once. Preset event weather does not purchase or revoke free-drive world unlocks. Seven- and ten-race cups arrived in version 1.33.

New in 1.31: Race shortcuts have a shared physics/rendered uneven surface, two low jump crests, textured rough ground, and two spaced props. Flat entry/exit transitions and an open centre line preserve the clean-run advantage. Ground-following suspension and pitch match the road; prop contact gives a single mild speed loss. Career and Time Trials remain unchanged.

New in 1.30: solo 3 km Time Trials with checkpoint splits, build-specific personal bests and a translucent best-run ghost. Career rewards clean close overtakes above 90 km/h with a six-second combo chain, up to ×5 rewards; rails or traffic contact break the chain. Race routes include signed, narrow alternate roads with real guardrail openings and shortcut paths on the mini-map. All three features work offline. Existing purchases and balances are preserved.

New in 1.29: consistent car preview sizes. All five garage images use centered silhouettes and equal margins; Coast Classic no longer uses a different fixed-zoom render. Live previews automatically frame actual body and cosmetic geometry across screen shapes.

New in 1.28: Garage, Worlds and Routes fit in one screen with horizontal item paging, swipe navigation, a page counter and always-visible actions. Safe-area padding keeps controls clear of phone edges. These selection views have no vertical scrolling; car model attribution opens separately. Browser checks passed at 568x320, 667x375, 320x568 and 360x640.

New in 1.27: averaged neutral calibration, small-motion dead zone, sensor smoothing, a recenter control, automatic centering at start/resume/orientation changes, stale-input release, gentler steering response and one-third less curve pull. Race and Career curves still need steering. Phone sensor feel needs physical Android verification.

New in 1.26: Sprint R and Midnight GT now use detailed imported coupe models. Ironclad V8 and Apex X join the garage for 1,600 and 2,800 game coins. Full-resolution close models, simpler distant opponents, body-fitted stripes and paint controls work offline. Existing purchases are preserved and race opponents match the selected car performance. Creator and CC BY 4.0 credits are available in the garage and bundled assets/cars/CREDITS.md.

The collection screens now match the landing page: shared full-screen navigation, a live 3D garage preview, model-based car thumbnails, scenic weather cards, and consistent route, mission, performance and paint screens. Run history uses cards on portrait phones. Existing purchases, saved progress and game rules are preserved.

This release adds restart controls to Race and Career, preserving the current run's setup and previously saved coins. The title screen, HUD, garage and results use a new racing theme with bundled artwork and offline fonts. The terrain HDR loading fix from 1.23 remains included.

Install `CoastlineRush.apk` on Android 6 or newer. This development-signed APK is for direct installation. It uses the same package and signing key as the previous build, so it can update the existing app. The game and all 3D assets run offline in landscape, with fullscreen, touch pedals, and calibrated tilt steering.

Choose a mode before starting:

- **Race:** 3 km with five bots. Contact slows you down in proportion to relative speed and how direct the impact is, and the race continues. Rewards for 1st–6th: 150, 100, 70, 45, 25, 10 game coins. Position uses bot distance and finish times. Each race pays once.
- **Time Trial:** Solo 3 km with the same seeded boosts and ramps on each attempt. Choose route and difficulty; personal bests are separate for each car, upgrade build and world. The latest 12 best-run ghosts are saved locally. There are no coin payouts for trials.
- **Career:** Endless driving with Light, Normal or Heavy traffic. Pick up gold coins on the road. A traffic collision ends the run; touching a guardrail only slows the car. Pickups are saved immediately, including when a run is abandoned.

The road, rails, cars, scenery and coins share a more strongly curved track with small elevation changes. Curves now push the car outward with a speed-squared drift: steer or tilt into bends to hold your lane, or slow down to reduce drift. Holding the guardrail costs substantial speed. Rails keep the car within the road boundaries. Race bots accelerate at 50–54 km/h per second (player: 52), with 196–200 km/h target speeds and small cornering reductions. Hold ACCELERATE to gain speed, release to coast, hold BRAKE to slow down. Both pedals and steering support simultaneous touches. The MODES button pauses the current drive; resume it or start a new run. Enable tilt while holding the phone comfortably to calibrate steering.

The coin wallet, career record, selected mode and traffic density are stored locally on this app/device. Web and Android balances are separate. Clearing app data removes the wallet. Game coins are virtual rewards; there are no purchases.

Build with `./build.ps1` from PowerShell using the installed Android SDK 34 build tools and Java 17. Keep `build/development.jks` to sign compatible future updates. The build embeds the current `../coast-rush/dist` assets and removes the remote font import. Do not use the development key for a store release.

Validation: `node test-physics.mjs` checks controls, rail boundaries in both modes, impact severity, collisions, endless distance, pickups, difficulty, finish timing, all payouts and payout deduplication. Browser play-throughs verified Career collection and crash results, a complete Race with first-place payout, and wallet persistence after reload. APK compilation and signature verification are checked during build. Physical Android touch and tilt testing is still pending.

Additional validation: node test-handling.mjs verifies outward drift on left and right bends, effective countersteering, slower-speed control, rail drag and competitive bot launches and sustained pace. Browser checks verified hands-off rail contact and recovery by steering into the bend.


Version 1.5 smooths steering input across keyboard, touch and tilt, with gradual turn-in, faster centering and direction changes. The response uses elapsed time rather than frame counts. Pause, restart and focus loss clear the filtered steering. node test-steering.mjs checks response, reversal, 30/60/120 Hz consistency and analog jitter filtering.


Version 1.6 fixes tree snapping by keeping each tree anchored until it passes behind the camera, then recycling it into the far fog. Illustrated SVG accelerator and brake pedals replace the text controls, with full touch areas and accessible names. The HUD and menus use short labels and icons. UI text updates only when values change. node test-scenery.mjs verifies continuous tree travel and hidden recycling, including endless runs. The Android asset handler serves the bundled SVG controls offline.


Version 1.7 adds randomized Race boost strips shared by the player and every bot. Each racer can trigger each strip once; the strip raises the speed limit to 270 km/h for two seconds. Player-only nitro charges while driving above 80 km/h, faster at higher speeds; a full meter gives a three-second burst up to 280 km/h. Double-tap the gas pedal (two quick presses), double-tap Up/W, or press N on a keyboard. Nitro shows blue exhaust flames and a short ignition glow. Combined nitro and strip boosts cap at 300 km/h, and excess speed tapers after the boost. Braking cancels nitro. Race crashes reduce both cars' speed, interrupt their boosts, and delay a bot's recovery briefly. Boosts and nitro are disabled in Career. node test-boosts.mjs covers shared strip pickup, caps, nitro lifecycle, collisions and tap gesture handling; a browser play-through verified actual gas-pedal double-tap activation, blue flames and 300 km/h combined boost.


Version 1.30 validation: test-gameplay-expansion.mjs covers complete trials and split timing, deterministic layouts, PB and ghost persistence, reward isolation, near-miss chains, duplicate prevention, combo resets, and genuine shorter paths with smooth entry/traversal/exit for all nine route/difficulty variants. Physics, progression, routes, restart, race features, bot nitro, map, customization/results, audio and smooth-mode regression checks pass. Physical Android testing remains pending.

Version 1.31 validation: test-shortcut-terrain.mjs checks all nine variants, flat merge heights/grades, surface bounds, two jumps at 100/200/280 km/h, obstacle clearance and mild single contact penalties, landing, pause/restart and clean-path time advantage. Existing gameplay expansion, physics, race features and restart checks also pass. Physical Android testing remains pending.

Version 1.32 validation: test-championship.mjs completes all five rounds at all three difficulties and checks frozen builds, seeded restart layouts, real bot finish times, scoring/tie-breaks, interrupted persistence, retry budgets, final bonus deduplication, trophies, gated paint and legacy data. Progression, customization/results, restart, upgrades, normal gameplay, shortcuts, routes/map, bot nitro and tilt regressions pass. Browser checks cover saved round recovery, staged race conditions and compact mobile actions. Physical Android testing remains pending.

Version 1.33 validation: test-championship.mjs completes all 22 races at their exact 3–10 km finish distances, checks fixed tier selection, locked entry, top-three thresholds, permanent unlocks, old save migration, partial campaign resume, repeatable layouts, bonus deduplication, extended feature generation, late render pools, map endpoints and additional shortcut gates. Existing progression, customization, restart, normal/trial gameplay, routes, map, bot nitro and ramp checks pass. Physical Android testing remains pending.
