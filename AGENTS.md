# void-tab

Minimal Firefox/Chromium startpage extension. No build, no deps, no tests.

## Source

All files at repo root (not in a subdirectory):
- `manifest.json` — MV3 extension manifest
- `index.html` — UI + inline CSS in `<style>`
- `script.js` — all logic (no modules, no imports)
- `icon.png` — single icon for all sizes (16/48/128)

## Commands

No build/test/lint/typecheck commands exist. Only operation:

```sh
# Package for AMO submission
zip -r void-tab-1.0.2.zip manifest.json index.html script.js icon.png README.md LICENSE.md
```

## Dev workflow

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on** → select `manifest.json`
3. Reload via extension card after edits

### Chromium (Chrome/Edge/Brave/Vivaldi)
1. Open `chrome://extensions`
2. Enable **Developer mode**, click **Load unpacked** → select repo root

## Live demo

`https://akbarahmedjonov.github.io/void-tab/` — standalone HTML, works without installing.

## Key facts

- Extension ID: `void-tab@example.com` (must be unique for signing)
- Min Firefox: 140.0 (desktop), 142.0 (Android)
- All state in `localStorage` with `startpage_` prefix (e.g. `startpage_engine`, `startpage_links`)
- Theme via `data-theme` attribute on `<html>` (values: `light`, `dark`, or none for system)
- Custom search template uses `%s` placeholder for query
- External APIs (no keys): `api.open-meteo.com` (weather), `ip-api.com` (geolocation fallback)
- Manifest host permissions cover both API origins
