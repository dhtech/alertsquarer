import { Font, FontInstance, LedMatrix, LedMatrixInstance } from 'rpi-led-matrix'

const heartBitmap = [
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0]
]

const colorMap = {
  0: -1,
  Y: 0xffff00,
  B: 0x000000,
  W: 0xffffff
}
const smileyBitmap: Array<Array<'0' | 'B' | 'W' | 'Y'>> = [
  ['0', '0', '0', '0', '0', 'B', 'B', 'B', 'B', 'B', '0', '0', '0', '0', '0'],
  ['0', '0', '0', 'B', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'B', '0', '0', '0'],
  ['0', '0', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', '0', '0'],
  ['0', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', '0'],
  ['0', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', '0'],
  ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
  ['B', 'Y', 'B', 'W', 'W', 'B', 'B', 'B', 'B', 'W', 'W', 'B', 'B', 'Y', 'B'],
  ['B', 'Y', 'B', 'W', 'B', 'B', 'B', 'Y', 'B', 'W', 'B', 'B', 'B', 'Y', 'B'],
  ['B', 'Y', 'Y', 'B', 'B', 'B', 'Y', 'Y', 'Y', 'B', 'B', 'B', 'Y', 'Y', 'B'],
  ['B', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B'],
  ['0', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'Y', 'Y', 'B', '0'],
  ['0', 'B', 'Y', 'Y', 'Y', 'B', 'B', 'B', 'B', 'B', 'Y', 'Y', 'Y', 'B', '0'],
  ['0', '0', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', '0', '0'],
  ['0', '0', '0', 'B', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'B', '0', '0', '0'],
  ['0', '0', '0', '0', '0', 'B', 'B', 'B', 'B', 'B', '0', '0', '0', '0', '0']
]
// Update the LED-panels
export const drawState = (matrix: LedMatrixInstance, fonts: Record<string, FontInstance>, panel: number, name: string, errCnt: number, heartbeatTimeout: boolean, showHeart: boolean, n: number): void => {
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

  if (heartbeatTimeout) { // No heartbeat
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

  if (errCnt === 0) {
    // Smiley
    for (let y = 0; y < smileyBitmap.length; y++) {
      for (let x = 0; x < smileyBitmap[y].length; x++) {
        if (smileyBitmap[y][x] !== '0') {
          matrix.fgColor(colorMap[smileyBitmap[y][x]])
          matrix.setPixel((panel * 32) + x + 7, y + 7)
        }
      }
    }
  } else {
    // Count text
    matrix.font(fonts.largeFont)
    matrix.fgColor(fgColor)
    matrix.drawText(effErrCnt, xoffsetErr, 4)
  }

  // Show heart on first panel
  if (showHeart && panel === 0) {
    matrix.fgColor((n % 2 === 0) ? 0x0000ff : 0xffffff)
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        if (heartBitmap[y][x] === 1) {
          matrix.setPixel(x, y)
        }
      }
    }
  }
}

export const getMatrix = (): LedMatrixInstance => new LedMatrix(
  { ...LedMatrix.defaultMatrixOptions(), chainLength: 3 },
  LedMatrix.defaultRuntimeOptions()
)

export const getFonts = (): Record<string, FontInstance> => ({
  smallFont: new Font('tom-thumb', './tom-thumb.bdf'),
  largeFont: new Font('10x20', './10x20.bdf')
})
