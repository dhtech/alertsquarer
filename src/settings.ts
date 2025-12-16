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