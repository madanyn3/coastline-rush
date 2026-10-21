# Coastline Rush

Offline arcade racing for Android, with a browser version built from the same game files.

## Source layout

- `coast-rush/dist/`: complete playable game and bundled runtime models, textures, fonts and licence credits.
- `android/`: Android WebView host, launcher resources and PowerShell APK build.
- `test-*.mjs`: focused Node regression checks. Run from the repository root.
- `asset-tools/`: asset preparation and historical feature-authoring scripts. Many authoring scripts mutate existing source and must not be rerun on the finished game without review.
- `beta/`: itch.io listing copy and release notes. APKs are generated locally and excluded from Git.

## Preview and test

Run `node preview-routes.mjs`, then open `http://127.0.0.1:4179/`.

Run `node test-championship.mjs` and `node test-physics.mjs` for the championship and driving regressions. Other `test-*.mjs` files cover individual gameplay systems.

## Android build

See `android/README.md`. The existing local build uses Android SDK 34 tools and Java 17. Run `./android/build.ps1` on Windows with that SDK installed. Install Node dependencies under `asset-tools/` and run `node asset-tools/build-launcher-icons.mjs` only when regenerating launcher PNG sizes.

Signing keys and generated APKs are deliberately excluded. Back up signing keys separately. The current direct-install beta uses the existing development signing certificate; store release preparation remains separate.

## Assets and release status

Third-party licence and attribution files are included under `coast-rush/dist/assets/` and `coast-rush/dist/vendor/`. See their individual licences; this repository does not grant a new licence for third-party assets. The launcher artwork was generated for the project; its prompt and derivation notes are in `android/artwork/README.md`.

This is an in-development beta. Automated/browser checks do not substitute for physical-phone testing of performance, multi-touch, tilt, audio and lifecycle behaviour. Progress is saved locally; there is no cloud save.
