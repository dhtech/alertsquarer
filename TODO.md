# TODO

## 1. Image panels swallow the "NO HEARTBEAT" screen
- **Severity:** Medium
- **Where:** `src/libs/matrix.ts` (`drawState`, ~line 53)
- **Problem:** The PNG branch returns before the heartbeat-timeout check, so any
  panel configured with an image drops out of the global `NO / HEART / BEAT / :(`
  display. With the current default, observer is panel 3 (`:(`), so the alarm
  message is silently broken exactly when a heartbeat is lost.
- **Action:** Decide precedence — let a heartbeat timeout override the image
  (recommended), or document that image panels intentionally stay static during
  an outage.

## 2. `canvas` is a heavy native dependency for the Pi 3 target
- **Severity:** Medium
- **Where:** `package.json`, `install.txt`, `src/libs/matrix.ts` (`getImages`)
- **Problem:** `canvas@2` pulls cairo/pango/libjpeg. `install.txt` only installs
  `build-essential`, so a fresh `npm install` on the Pi may fail to build the
  native module when no prebuilt ARM binary is available.
- **Action:** Either (a) add the apt deps to `install.txt`/README
  (`libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev`), or (b) replace
  `canvas` with a pure-JS PNG decoder (e.g. `pngjs`) plus a nearest-neighbor
  scale, since only raw RGBA + scaling is needed.

## 3. Per-pixel `fgColor` churn in the image render path
- **Severity:** Low
- **Where:** `src/libs/matrix.ts` (`drawState`, ~lines 55-57)
- **Problem:** `matrix.fgColor()` is called for every lit pixel every frame
  (up to 1024/panel). The rpi-led-matrix docs note `setPixel` has per-pixel
  overhead and batch ops are preferred.
- **Action:** Sort cached pixels by color and only call `fgColor` when the color
  changes. Minor at ~5 fps, but free.
