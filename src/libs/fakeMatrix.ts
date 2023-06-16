type FontInstance = Record<string, string>
interface LedMatrixInstance {
  clear: () => void
  sync: () => void
}

// Update the LED-panels
export const drawState = (_matrix: LedMatrixInstance, _fonts: Record<string, string>, panel: number, name: string, errCnt: number, heartbeat: boolean, _n: number): void => {
  const effErrCnt = (errCnt < 10) ? `${errCnt}` : '>9'
  console.log('MATRIX:', { heartbeat, panel, name, effErrCnt })
}

export const getMatrix = (): LedMatrixInstance => ({
  clear: () => undefined,
  sync: () => undefined
})

export const getFonts = (): FontInstance => ({
  smallFont: 'smallFont',
  largeFont: 'largeFont'
})
