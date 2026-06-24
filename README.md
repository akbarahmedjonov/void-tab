# void-tab

Minimal, privacy-first browser startpage. Replaces new tab with a clock, multi-engine search, weather, and customizable links.

[Install from Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/void-tab/) · [Try live demo](https://akbarahmedjonov.github.io/void-tab/)

## Features

- **Clock** - current time
- **Search** - Google, DuckDuckGo, Startpage, Gemini, Claude, Grok, ChatGPT, or custom URL (`%s` placeholder)
- **Weather** - Open-Meteo forecast (optional, toggle on/off, manual lat/lon override)
- **Links** - add/remove with auto-fetched favicons, collapse/expand
- **Theme** - system / light / dark
- **No tracking** - no analytics, no telemetry, no cookies, no API keys

## Install from source

### Firefox (desktop 140+ / Android 142+)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on** → select `manifest.json`
3. Reload after edits via the extension card

To package for AMO:

```sh
zip -r void-tab-1.0.3.zip manifest.json index.html script.js icon.png README.md LICENSE.md
```

### Chromium (Chrome/Edge/Brave/Vivaldi, etc.)

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle top-right)
3. Click **Load unpacked** → select this directory
4. Set `chrome://settings/manageProfile` → start page / home page to `chrome://newtab` if needed

## Manual install (no extension)

1. Open `index.html` directly in any browser (drag into tab, or `file:///path/to/index.html`)
2. Set it as your browser's startup/home page:
   - **Firefox:** Preferences → Home → Custom URLs → `file:///path/to/index.html`
   - **Chromium:** Settings → On startup → Open a specific page → `file:///path/to/index.html`

## Structure

```
├── manifest.json   # MV3 extension manifest
├── index.html      # UI + inline CSS
├── script.js       # all logic
└── icon.png        # single icon (16/48/128)
```

## External APIs

| API | Usage | Key required |
|-----|-------|-------------|
| [Open-Meteo](https://open-meteo.com/) | Weather forecast | No |
| [ip-api.com](https://ip-api.com/) | Geolocation fallback | No |

## Storage

All state uses `localStorage` with `startpage_` prefix. No data leaves your browser except weather/location requests (only when weather is enabled).

## License

MIT
