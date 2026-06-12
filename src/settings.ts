import type { Team } from './types'

export const host = '127.0.0.1'
export const port = 8080

export const teams: Team[] = ['services', 'access', 'core', 'observer']
export const defaultTTL = 60000    // Milliseconds
export const heartbeatTTL = 10000   // Milliseconds
export const updateMs = 200        // Milliseconds

export const debugOutputInterval = 2000
export const pruneInterval = 5000

export const chainLength = 2
export const panelWidth = 32
export const panelHeight = 32
export const smallFontCharWidth = 4

// Matrix timing / anti-ghosting tuning.
// GPIO clock slowdown. 1-2 is typical on a Pi 3; higher trades refresh rate for
// signal stability (fixes garbled/shifted pixels, not bleeding).
export const gpioSlowdown = 3
// Anti-bleeding PWM settings. Bright content on a black background (this app's
// digits and bitmaps) is the classic ghosting case.
// If bleeding persists, raise pwmLsbNanoseconds in steps until it clears:
//   1. Bump the value: 200 -> 250 -> 300.
//   2. Rebuild/restart and look at the panels after each bump.
//   3. Watch the refresh rate (run with --led-show-refresh); higher ns = lower
//      refresh, so stop at the lowest value that removes the bleeding.
//   4. Still bleeding at ~300? Lower pwmBits to 7 (below) before going higher.
export const pwmLsbNanoseconds = 200  // default 130; higher = less ghosting
export const pwmBits = 7              // default 11; lower = less ghosting, fine for text
export const pwmDitherBits = 1        // recover perceived quality after lowering pwmBits

// Static PNG panels.
// Directory (relative to the process cwd) that PNG files are read from.
// In dev the cwd is ./src, in prod it is ./build — `cp -r src/images ./build/`
// in the build script keeps both in sync.
export const imagesDir = './images'

// Map a team to a PNG filename inside `imagesDir`. Any team listed here shows
// the image full-screen (32x32) instead of its alert count / name. Drop the
// file in src/images/ before building. Example:
//   export const panelImages: Partial<Record<Team, string>> = { services: 'logo.png' }
export const panelImages: Partial<Record<Team, string>> = { observer: 'logo.png' }