---
name: run-hexgl
description: Run, start, launch, screenshot or drive HexGL (static WebGL racing game) headless on Windows with Chrome. Use to see the game working in a real browser.
---

HexGL is a static site (no build). Serve it over HTTP, drive it with `driver.mjs` (Chrome DevTools Protocol, Node 24, no deps). Paths are relative to the HexGL repo root (`<unit>`).

## Run (agent path)

```bash
python -m http.server 8765 &        # serve index.html
node .claude/skills/run-hexgl/driver.mjs http://localhost:8765/index.html "$TEMP/hexgl-menu.png" "$TEMP/hexgl-race.png"
```

Chrome path defaults to `C:/Program Files/Google/Chrome/Application/chrome.exe` (3rd arg overrides). The driver clicks START, then the help screen, waits for the race, and screenshots the menu first, then the countdown + HUD. Takes ~1 min. Look at the PNG: a menu or blank frame means failure.

## Human path

Open http://localhost:8765/index.html in a browser (`file://` also works for the menu).

## Gotchas

- Headless needs `--enable-unsafe-swiftshader --use-angle=swiftshader` for WebGL (already in the driver); race loading is slow under software rendering (~30-45 s), so the driver polls `#step-4` instead of sleeping.
- START opens a help screen (`#step-2`); a second click starts loading. The driver uses DOM `.click()` because mouse coordinates hit the wrong menu row while assets load.
- `formation/tests/ci-chrome.sh` returns code 2 ("aucun resultat HTML") on Windows with Chrome: `--dump-dom` produced no stdout here. It also leaves `formation/tests/rapport_erreur.html` behind; delete it.
- Port 9333 is used for CDP; kill stray chrome.exe if a run died.
