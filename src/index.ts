import fastify from 'fastify'
import { wait, setupLog } from './common'
import { getFonts, getMatrix, drawState, getImages } from './libs/matrix'

import { teams, defaultTTL, heartbeatTTL, updateMs, host, port, debugOutputInterval, pruneInterval } from './settings'

import type { IQueryString, IBody, Data, Alerts, Team } from './types'

const DEBUG = process.env.NODE_ENV === "dev"

const isTeam = (value: string): value is Team => {
  return teams.includes(value as Team)
}

if (DEBUG) {
  setupLog()
}

const server = fastify({})

// Note: In Node.js single-threaded event loop, concurrent access to data.alerts
// is safe as operations are executed sequentially. No explicit synchronization needed.
const data: Data = {
  alerts: {},
  heartbeatTS: 0
}

let lastDebugOutput = 0
let lastPruneTS = 0

// Create a dict with each team being the key and the value the number of active alerts.
const countAlerts = (alerts: Alerts): Record<Team, number> => {
  const initialCount = teams.reduce((result: Record<Team, number>, team: Team) => {
    result[team] = 0
    return result
  }, {} as Record<Team, number>)

  const count = Object.keys(alerts).reduce((result: Record<Team, number>, key: string) => {
    const alert = alerts[key]
    result[alert.team] = (result[alert.team] ?? 0) + 1
    return result
  }, initialCount)

  return count
}

// Remove alerts that are too old
const pruneAlerts = (inData: Alerts): Alerts => {
  const startCount = Object.keys(inData).length
  const now = new Date().getTime()

  const outData = Object.keys(inData).reduce((result: Alerts, key: string) => {
    const alert = inData[key]
    if (now - alert.timestamp < defaultTTL) {
      // keep the alert if it's younger than defaultTTL
      result[`${alert.team}:${alert.groupKey}`] = alert
    }

    return result
  }, {})
  const endCount = Object.keys(outData).length

  if (startCount - endCount > 0) {
    console.log(`Pruned ${startCount - endCount} alerts.`)
  }
  return outData
}

server.post('/api/v1/alerts', async (request, reply) => {
  try {
    const { team } = request.query as IQueryString
    const { groupKey, status } = request.body as IBody

    if (!team || typeof team !== 'string') {
      return { result: 'failed', message: 'Missing or invalid team parameter.' }
    }

    if (team === 'heartbeat') {
      if (DEBUG) {
        console.log("Received heartbeat")
      }
      data.heartbeatTS = new Date().getTime()
      return { result: 'success', message: '<3' }
    }

    // Map 'dist' to 'core' before validation
    const normalizedTeam = (team === 'dist' ? 'core' : team)

    if (!isTeam(normalizedTeam)) {
      console.error(`Unknown team ${team}.`)
      return { result: 'failed', message: `${team} is not a valid team.` }
    }

    if (!groupKey || typeof groupKey !== 'string') {
      return { result: 'failed', message: 'Missing or invalid groupKey parameter.' }
    }

    if (!status || typeof status !== 'string') {
      return { result: 'failed', message: 'Missing or invalid status parameter.' }
    }

    if (DEBUG) {
      console.log(`Received error for ${team} (${groupKey})`)
    }

    //  groupkey:
    // '{}/{layer=~"^(?:dist|core|firewall)$"}:{alertname="RancidBackupTooOld", host="d-southwest-sw.event.dreamhack.se", instance="rancid.event.dreamhack.se:9100", layer="core"}'
    let realTeam = normalizedTeam

    const observerMatch = groupKey.match(/instance="observer-nr.*event.dreamhack.se.+/)
    if (realTeam === 'services' && observerMatch != null) { // special case to create alerts for observers
      realTeam = 'observer'
    }

    data.alerts[`${realTeam}:${groupKey}`] = { team: realTeam, groupKey, status, timestamp: new Date().getTime() }

    return { result: 'success', message: 'Sorry to hear, but noted.' }
  } catch (error) {
    console.error('Error processing alert:', error)
    return { result: 'failed', message: 'Internal server error.' }
  }
})

const serverCallback = (err: Error | null, addr: string): void => {
  if (err !== null) {
    console.error(err)
  } else {
    console.log(`API-server listening on ${addr}`)
  }
}

// start webserver
server.listen({ host, port }, serverCallback)

// Main loop
const main = async (): Promise<void> => {
  try {
    // Start matrix
    let matrix: ReturnType<typeof getMatrix>
    try {
      matrix = getMatrix()
    } catch (error) {
      console.error('Failed to initialize matrix:', error)
      process.exit(1)
    }

    // Load fonts, one small for the team name and one large for the number
    // of active alerts
    let fonts: ReturnType<typeof getFonts>
    try {
      fonts = getFonts()
    } catch (error) {
      console.error('Failed to load fonts:', error)
      process.exit(1)
    }

    // Load any configured static PNG panels (decoded once, then reused)
    let images: Awaited<ReturnType<typeof getImages>>
    try {
      images = await getImages()
    } catch (error) {
      console.error('Failed to load panel images:', error)
      images = {}
    }

    let iterator = 0;

    while (true) {
      try {
        iterator += 1

        const now = new Date().getTime()

        // remove old alerts periodically
        if (now - lastPruneTS > pruneInterval) {
          data.alerts = pruneAlerts(data.alerts) // Remove old alerts
          lastPruneTS = now
        }

        const alertCount = countAlerts(data.alerts) // Count alerts per team
        const hasHeartbeatTimeout = (new Date().getTime() - data.heartbeatTS) > heartbeatTTL // Check if we have heartbeat
        const showHeart = ((new Date().getTime() - data.heartbeatTS) < 1000)

        matrix.clear() // blank the (virtual) matrix
        // For each team, draw the state of that teams count of active alerts
        teams.forEach((name: Team, panel: number) => {
          const errCnt = alertCount[name] ?? 0
          drawState({ matrix, fonts, panel, name, errCnt, heartbeatTimeout: hasHeartbeatTimeout, showHeart, iterator, panelImage: images[name] })
        })
        matrix.sync() // Sync the matrix to the panels

        // print some debug info to console
        if (DEBUG && now - lastDebugOutput > debugOutputInterval) {
          console.log(alertCount)
          lastDebugOutput = now
        }

        await wait(updateMs)
      } catch (error) {
        console.error('Error in main loop iteration:', error)
        await wait(updateMs)
      }
    }
  } catch (error) {
    console.error('Fatal error in main loop:', error)
    process.exit(1)
  }
}

void main()
