import type { drawStateProps } from '../types'
type FontInstance = Record<string, string>

interface LedMatrixInstance {
  clear: () => void
  sync: () => void
  matrix: number[]
}

// Update the LED-panels
export const drawState = ({ panel, name, errCnt, heartbeatTimeout }: drawStateProps): void => {
  const effErrCnt = (errCnt < 10) ? `${errCnt}` : '>9'
  console.log('MATRIX:', { heartbeatTimeout, panel, name, effErrCnt })
}

export const getMatrix = (): LedMatrixInstance => ({
  clear: () => undefined,
  sync: () => undefined,
  matrix: []
})

export const getFonts = (): FontInstance => ({
  smallFont: 'smallFont',
  largeFont: 'largeFont'
})
