import { Font, LedMatrix } from 'rpi-led-matrix'
import fastify from 'fastify'
import type { IQueryString, IBody, Alert } from './types'

const defaultTTL = 600000 // 10 minutes in milliseconds
const heartbeatTTL = defaultTTL // In original python code this was 11 sec
const teams = ['core', 'access', 'services'] // available teams to keep track of, needs to have one panel each

let heartbeatTS = 0

const server = fastify({})

const wait = async (ms: number): Promise<void> => await new Promise((resolve: () => void) => setTimeout(resolve, ms))

// Keeps track of a list of alerts
let alerts: Record<string, Alert> = {}

server.post('/api/v1/alerts', async (request, reply) => {
  const { team } = request.query as IQueryString
  const { groupKey, status } = request.body as IBody

  if (team === 'heartbeat') {
    heartbeatTS = new Date().getTime()
    return { result: 'success', message: '<3' }
  } else if (!teams.includes(team)) {
    console.error(`Unkown team ${team}.`)
    return { result: 'failed', message: `${team} is not a valid team` }
  }

  alerts[`${team}:${groupKey}`] = { team, groupKey, status, timestamp: new Date().getTime() }

  return { result: 'success', message: 'Sorry to hear, but noted' }
})

// Remove alerts that are too old
const pruneAlerts = (): void => {
  const startCount = Object.keys(alerts).length
  const now = new Date().getTime()

  alerts = Object.keys(alerts).reduce((result: Record<string, Alert>, key: string) => {
    const alert = alerts[key]
    if (now - alert.timestamp < defaultTTL) {
      // keep the alert if it's younger than defaultTTL
      result[`${alert.team}:${alert.groupKey}`] = alert
    } else {
      //
      console.log('removing', (now - alert.timestamp), alert)
    }

    return result
  }, {})
  const endCount = Object.keys(alerts).length

  console.log(`Pruned ${startCount - endCount} alerts.`)
}

const serverCallback = (err: Error | null, addr: string): void => {
  if (err !== null) {
    console.error(err)
  } else {
    console.log(`API-server listening on ${addr}`)
  }
}

// Create a dict with each team being the key and the value the number of active alerts.
const countAlerts = (alerts: Record<string, Alert>): Record<string, number> => {
  const count = Object.keys(alerts).reduce((result: Record<string, number>, key: string) => {
    const alert = alerts[key]
    result[alert.team] = (result[alert.team] ?? 0) + 1
    return result
  }, {})
  console.log(count)
  return count
}

void (async () => {
  console.log('Starting...')

  // start webserver
  await server.listen({ host: '0.0.0.0', port: 6379 }, serverCallback)

  // start pruning evert 3s
  console.log('Pruning started...')
  setInterval(pruneAlerts, 3000)

  try {
    // Initialize LED-matrix
    const matrix = new LedMatrix(
      { ...LedMatrix.defaultMatrixOptions(), chainLength: 3 },
      LedMatrix.defaultRuntimeOptions()
    )

    // Load fonts, one small for the team name and one large for the number
    // of active alerts
    const smallFont = new Font('tom-thumb', './tom-thumb.bdf')
    const largeFont = new Font('10x20', './10x20.bdf')

    // Update the LED-panels
    const drawState = (panel: number, name: string, errCnt: number, heartbeatAge: number, n: number): void => {
      let bgColor = 0x000000
      let fgColor = 0xffffff

      if (errCnt < 0) {
        bgColor = 0x000000
        fgColor = 0xffff00
      } else if (errCnt === 0) {
        bgColor = 0x00ff00
        fgColor = 0x000000
      } else if (errCnt <= 2) {
        bgColor = 0xffff00
        fgColor = 0x000000
      } else if (errCnt <= 5) {
        bgColor = 0xff0000
        fgColor = 0x000000
      } else if (errCnt > 5) {
        if (n % 2 === 0) {
          fgColor = 0xff0000
        } else {
          fgColor = 0x000000
          bgColor = 0xff0000
        }
      }

      const effErrCnt = (errCnt < 10) ? `${errCnt}` : '>9'
      const xoffsetErr = (effErrCnt.length === 1 ? 10 : 5) + (panel * 32)

      // Team Text
      matrix.font(smallFont)
      const xoffsetName = (16 - ((name.length * 4) / 2)) + (panel * 32)

      if (heartbeatAge > heartbeatTTL) { // No heartbeat
        const hbFgColor = (n % 2 === 0) ? 0xffffff : 0x000000
        const hbBgColor = (n % 2 === 0) ? 0xaa0000 : 0xffff00

        matrix.fgColor(hbBgColor)
        matrix.fill(0 + (panel * 32), 25, 32 + (panel * 32), 31)
        matrix.fgColor(hbFgColor)
        matrix.drawText(name, xoffsetName, 26)
      } else {
        matrix.fgColor(0xffffff)
        matrix.drawText(name, xoffsetName, 26)
      }

      // Background color
      matrix.fgColor(bgColor)
      matrix.fill(0 + (panel * 32), 0, 32 + (panel * 32), 24)

      // Count text
      matrix.font(largeFont)
      matrix.fgColor(fgColor)
      matrix.drawText(effErrCnt, xoffsetErr, 4)
    }

    let n = 0 // iterator so we can blink

    // Main loop for updating panels
    while (true) {
      n += 1
      matrix.clear() // blank the (virtual) matrix

      const alertCount = countAlerts(alerts) // Get the number of alerts per team
      const heartbeatAge = new Date().getTime() - heartbeatTS // Get the age of the last heartbeat

      // For each team, draw the state of that teams count of active alerts
      teams.forEach((team: string, i: number) => {
        const state = alertCount[team] ?? 0
        drawState(i, team.toUpperCase(), state, heartbeatAge, n)
      })

      matrix.sync() // Sync the matrix to the panels
      await wait(200) // wait a while, this affects the blinking speed mostly
    }
  } catch (error) {
    console.error('ERROR:', error)
  }
})()
