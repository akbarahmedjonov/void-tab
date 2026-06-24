# void-tab

Minimal Firefox startpage/new-tab extension. No build, no deps, no tests.

## Source location

All source lives in `Startpage-For-Browser/`:
- `manifest.json` — MV3 extension manifest
- `index.html` — UI + inline CSS in `<style>`
- `script.js` — all logic (no modules)
- `icon.png` — single icon for all sizes

## Commands

No build, test, lint, typecheck, or format commands exist. The only operation is:

```sh
# Package for AMO submission (run from inside Startpage-For-Browser/)
zip -r void-tab-1.0.zip manifest.json index.html script.js icon.png README.md
```

## Development workflow

1. Open `about:debugging#/runtime/this-firefox` in Firefox
2. Click **Load Temporary Add-on** → select `manifest.json`
3. Edit files and reload the extension after changes

## Key details

- Extension ID: `void-tab@example.com` (must be unique for signing)
- Min Firefox: 140.0 (desktop), 142.0 (Android)
- All state stored in `localStorage` with `startpage_` prefixed keys
- External APIs (no keys needed): Open-Meteo (weather), ip-api.com (geolocation fallback)
- No external dependencies, no npm, no bundlers

## Architecture

Single-file script with no imports. Event-driven: clock interval, form submit, settings overlay toggle. Theme via `data-theme` attribute on `<html>`. Search template URL uses `%s` placeholder for custom engines.
