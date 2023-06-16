import { Font, FontInstance, LedMatrix, LedMatrixInstance } from 'rpi-led-matrix'

// Update the LED-panels
export const drawState = (matrix: LedMatrixInstance, fonts: Record<string, FontInstance>, panel: number, name: string, errCnt: number, heartbeat: boolean, n: number): void => {
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
  } else if (errCnt <= 99) {
    if (n % 2 === 0) {
      fgColor = 0xff0000
    } else {
      fgColor = 0x000000
      bgColor = 0xff0000
    }
  } else {
    fgColor = 0x000000
    if (n % 2 === 0) {
      bgColor = 0x0000ff
    } else {
      bgColor = 0xff0000
    }
  }

  const effErrCnt = (errCnt <= 99) ? `${errCnt}` : ':(' // If we have 100 or more errors, just show a sad face
  const xoffsetErr = (effErrCnt.length === 1 ? 10 : 5) + (panel * 32)

  // Team Text
  matrix.font(fonts.smallFont)
  const xoffsetName = (16 - ((name.length * 4) / 2)) + (panel * 32)

  if (!heartbeat) { // No heartbeat
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
  matrix.font(fonts.largeFont)
  matrix.fgColor(fgColor)
  matrix.drawText(effErrCnt, xoffsetErr, 4)
}

export const getMatrix = (): LedMatrixInstance => new LedMatrix(
  { ...LedMatrix.defaultMatrixOptions(), chainLength: 3 },
  LedMatrix.defaultRuntimeOptions()
)

export const getFonts = (): Record<string, FontInstance> => ({
  smallFont: new Font('tom-thumb', './tom-thumb.bdf'),
  largeFont: new Font('10x20', './10x20.bdf')
})
