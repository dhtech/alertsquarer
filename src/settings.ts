import type { Team } from './types'

export const host = '127.0.0.1'
export const port = 8080

export const teams: Team[] = ['core', 'access', 'services']
export const defaultTTL = 120000
export const heartbeatTTL = 10000
export const updateMs = 200
