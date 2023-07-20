import * as fs from 'fs'
import { spawn } from 'child_process'

import { wait } from './common'
import { getFonts, getMatrix, drawState } from './libs/matrix'
import { teams, updateMs, P_API_TO_MATRIX } from './settings'
import type { Team } from './types'

interface AlertData {
  type: 'alerts'
  ts: number
  count: Record<Team, number>
  heartbeatTimeout: boolean
  heartbeatTS: number
}

let heartbeatTimeout = false
let showHeart = false
let alertCount: Record<Team, number> = { core: 0, access: 0, services: 0 }

const runMatrix = async (): Promise<void> => {
  console.log('Starting matrix...')
  try {
    // Setup FIFO
    if (fs.existsSync(P_API_TO_MATRIX)) {
      /* Doesnt work on the DietPI for some reason EACCESS on fifo
      console.log('Deleting', P_API_TO_MATRIX)
      fs.unlinkSync(P_API_TO_MATRIX) */
    } else {
      // Workaround for the above
      console.log(`Please create fifo, mkfifo ${P_API_TO_MATRIX} -m777`)
      return
    }
    const fifoAPI = spawn('mkfifo', [P_API_TO_MATRIX]) // Create named pipe

    fifoAPI.on('exit', function (status) {
      console.log('Created Pipe', status)

      const fd = fs.openSync(P_API_TO_MATRIX, 'r+')
      const fifoRs = fs.createReadStream('', { fd })

      fifoRs.on('data', rawData => {
        const apiData = JSON.parse(rawData.toString()) as AlertData
        const dataAge = new Date().getTime() - apiData.ts
        if (dataAge > 10000) {
          console.log(`Discarding data from server, too old ´(${dataAge})`)
          return
        }

        // Update state
        heartbeatTimeout = (apiData).heartbeatTimeout
        alertCount = (apiData).count
        showHeart = ((new Date().getTime() - apiData.heartbeatTS) < 1000)
      })
    })

    // Initialize LED-matrix
    const matrix = getMatrix()

    // Load fonts, one small for the team name and one large for the number
    // of active alerts
    const fonts = getFonts()

    let n = 0 // iterator so we can blink \o/

    // Main loop for updating panels
    while (true) {
      n += 1
      matrix.clear() // blank the (virtual) matrix

      // For each team, draw the state of that teams count of active alerts
      teams.forEach((name: Team, panel: number) => {
        const errCnt = alertCount[name] ?? 0
        drawState({ matrix, fonts, panel, name, errCnt, heartbeatTimeout, showHeart, n })
      })
      matrix.sync() // Sync the matrix to the panels
      await wait(updateMs) // wait a while, this affects the blinking speed mostly
    }
  } catch (error) {
    console.error('ERROR:', error)
  }
}

void runMatrix()
