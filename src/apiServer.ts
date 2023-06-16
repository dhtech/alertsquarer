import fastify from 'fastify'
import * as fs from 'fs'

import { wait } from './common'

import { teams, defaultTTL, heartbeatTTL, updateSeconds, P_API_TO_MATRIX, host, port } from './settings'

import type { IQueryString, IBody, Data, Alerts, Team } from './types'

const server = fastify({})

const data: Data = {
  alerts: {},
  heartbeatTS: 0
}

// Create a dict with each team being the key and the value the number of active alerts.
const countAlerts = (alerts: Alerts): Record<Team, number> => {
  const count = Object.keys(alerts).reduce((result: Record<Team, number>, key: string) => {
    const alert = alerts[key]
    result[alert.team] = (result[alert.team] ?? 0) + 1
    console.log(key)
    return result
  }, { access: 0, core: 0, services: 0 }) // FIXME: This shouldn't be hardcoded
  console.log(count)

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
    } else {
      //
      console.log('removing', (now - alert.timestamp), alert)
    }

    return result
  }, {})
  const endCount = Object.keys(outData).length

  console.log(`Pruned ${startCount - endCount} alerts.`)
  return outData
}

server.post('/api/v1/alerts', async (request, reply) => {
  const { team } = request.query as IQueryString
  const { groupKey, status } = request.body as IBody

  if (team === 'heartbeat') {
    data.heartbeatTS = new Date().getTime()
    return { result: 'success', message: '<3' }
  } else if (!teams.includes(team)) {
    console.error(`Unkown team ${team}.`)
    return { result: 'failed', message: `${team} is not a valid team.` }
  }

  data.alerts[`${team}:${groupKey}`] = { team, groupKey, status, timestamp: new Date().getTime() }

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
  while (!fs.existsSync(P_API_TO_MATRIX)) {
    console.log('Waiting for MatrixCtrl to start...')
    await wait(1000)
  }

  while (true) {
    data.alerts = pruneAlerts(data.alerts) // Remove old alerts
    const count = countAlerts(data.alerts) // Count alerts per team
    const heartbeat = (new Date().getTime() - data.heartbeatTS) < heartbeatTTL // Check if we have heartbeat

    const fifoWs = fs.createWriteStream(P_API_TO_MATRIX)
    fifoWs.write(JSON.stringify({
      ts: new Date().getTime(),
      count,
      heartbeat
    }) + '\n')
    fifoWs.close()
    await wait(updateSeconds * 1000)
  }
}

void main()
