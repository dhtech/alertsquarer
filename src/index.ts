import fastify from 'fastify'
import { wait, setupLog } from './common'
import { getFonts, getMatrix, drawState } from './libs/matrix'
//import { getFonts, getMatrix, drawState } from './libs/fakeMatrix'

import { teams, defaultTTL, heartbeatTTL, updateMs, host, port, debugOutputInterval, pruneInterval } from './settings'

import type { IQueryString, IBody, Data, Alerts, Team } from './types'

const DEBUG = process.env.NODE_ENV === "dev"

if (DEBUG) {
  setupLog()
}

const server = fastify({})

const data: Data = {
  alerts: {},
  heartbeatTS: 0
}

let lastDebugOutput = 0
let lastPruneTS = 0

// Create a dict with each team being the key and the value the number of active alerts.
const countAlerts = (alerts: Alerts): Record<Team, number> => {
  const count = Object.keys(alerts).reduce((result: Record<Team, number>, key: string) => {
    const alert = alerts[key]
    result[alert.team] = (result[alert.team] ?? 0) + 1
    return result
  }, { access: 0, core: 0, services: 0, observer: 0 }) // FIXME: This shouldn't be hardcoded

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
  const { team } = request.query as IQueryString
  const { groupKey, status } = request.body as IBody

  if (team === 'heartbeat') {
    if (DEBUG) {
      console.log("Recieved heartbeat")
    }
    data.heartbeatTS = new Date().getTime()
    return { result: 'success', message: '<3' }
  } else if (!teams.includes(team as Team)) {
    console.error(`Unkown team ${team}.`)
    return { result: 'failed', message: `${team} is not a valid team.` }
  }

  if (DEBUG) {
    console.log(`Recieved error for ${team} (${groupKey})`)
  }

  //  groupkey:
  // '{}/{layer=~"^(?:dist|core|firewall)$"}:{alertname="RancidBackupTooOld", host="d-southwest-sw.event.dreamhack.se", instance="rancid.event.dreamhack.se:9100", layer="core"}'
  let realTeam = (team === 'dist' ? 'core' : team) as Team

  const observerMatch = groupKey.match(/instance="observer-nr.*event.dreamhack.se.+/)
  if (realTeam === 'services' && observerMatch != null) { // special case to create alerts for observers
    realTeam = 'observer'
  }

  data.alerts[`${realTeam}:${groupKey}`] = { team: realTeam, groupKey, status, timestamp: new Date().getTime() }

  return { result: 'success', message: 'Sorry to hear, but noted.' }
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
  // Start matrix
  const matrix = getMatrix()

  // Load fonts, one small for the team name and one large for the number
  // of active alerts
  const fonts = getFonts()

  let iterator = 0;

  while (true) {
    iterator += 1

    const now = new Date().getTime()

    // remove old alerts periodically
    if (now - lastPruneTS > pruneInterval) {
      data.alerts = pruneAlerts(data.alerts) // Remove old alerts
      lastPruneTS = now
    }

    const alertCount = countAlerts(data.alerts) // Count alerts per team
    const heartbeatTimeout = (new Date().getTime() - data.heartbeatTS) > heartbeatTTL // Check if we have heartbeat
    const showHeart = ((new Date().getTime() - data.heartbeatTS) < 1000)

    matrix.clear() // blank the (virtual) matrix
    // For each team, draw the state of that teams count of active alerts
    teams.forEach((name: Team, panel: number) => {
      const errCnt = alertCount[name] ?? 0
      drawState({ matrix, fonts, panel, name, errCnt, heartbeatTimeout, showHeart, iterator })
    })
    matrix.sync() // Sync the matrix to the panels

    // print some debug info to console
    if (DEBUG && now - lastDebugOutput > debugOutputInterval) {
      console.log(alertCount)
      lastDebugOutput = now
    }

    await wait(updateMs)
  }
}

void main()
