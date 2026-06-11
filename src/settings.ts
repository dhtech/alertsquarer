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