import { Font, FontInstance, LedMatrix, LedMatrixInstance } from 'rpi-led-matrix'

const heartBitmap = [
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0]
]

type Color = '0' | 'B' | 'W' | 'Y' | 'O' | 'D' | 'L' | 'R'

const colorMap: Record<Color, number> = {
  0: -1,
  Y: 0xffff00,
  B: 0x000000,
  W: 0xffffff,
  O: 0xfe7d3e,
  D: 0x4c71a2,
  L: 0x79afd9,
  R: 0xbf2f36
}

const smileyBitmap: Color[][] = [
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

const screamBitmap: Color[][] = [
  ['0', '0', '0', '0', '0', '0', 'D', 'D', 'D', 'D', 'D', 'D', '0', '0', '0', '0', '0', '0'],
  ['0', '0', '0', '0', 'D', 'D', 'L', 'L', 'L', 'L', 'L', 'L', 'D', 'D', '0', '0', '0', '0'],
  ['0', '0', '0', 'D', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'D', '0', '0', '0'],
  ['0', '0', 'D', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'D', '0', '0'],
  ['0', 'D', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'D', '0'],
  ['0', 'D', 'L', 'L', 'B', 'B', 'B', 'L', 'L', 'L', 'L', 'B', 'B', 'B', 'L', 'L', 'D', '0'],
  ['O', 'L', 'L', 'B', 'W', 'W', 'W', 'B', 'Y', 'Y', 'B', 'W', 'W', 'W', 'B', 'L', 'L', 'O'],
  ['O', 'Y', 'B', 'W', 'W', 'W', 'W', 'B', 'Y', 'Y', 'B', 'W', 'W', 'W', 'W', 'B', 'Y', 'O'],
  ['O', 'Y', 'B', 'W', 'W', 'W', 'B', 'Y', 'Y', 'Y', 'Y', 'B', 'W', 'W', 'W', 'B', 'Y', 'O'],
  ['O', 'Y', 'B', 'W', 'W', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'W', 'W', 'B', 'Y', 'O'],
  ['O', 'Y', 'Y', 'B', 'B', 'Y', 'Y', 'Y', 'B', 'B', 'Y', 'Y', 'Y', 'B', 'B', 'Y', 'Y', 'O'],
  ['O', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'R', 'R', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'O'],
  ['0', 'O', 'O', 'O', 'Y', 'Y', 'Y', 'B', 'R', 'R', 'B', 'Y', 'Y', 'Y', 'O', 'O', 'O', '0'],
  ['0', 'O', 'Y', 'Y', 'O', 'Y', 'Y', 'B', 'R', 'R', 'B', 'Y', 'Y', 'O', 'Y', 'Y', 'O', '0'],
  ['0', 'O', 'Y', 'Y', 'Y', 'O', 'Y', 'B', 'R', 'R', 'B', 'Y', 'O', 'Y', 'Y', 'Y', 'O', '0'],
  ['0', '0', 'O', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'O', '0', '0'],
  ['0', '0', '0', 'O', 'Y', 'Y', 'O', 'O', 'Y', 'Y', 'O', 'O', 'Y', 'Y', 'O', '0', '0', '0'],
  ['0', '0', '0', 'O', 'Y', 'Y', 'O', '0', 'O', 'O', '0', 'O', 'Y', 'Y', 'O', '0', '0', '0']
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
          matrix.setPixel((panel * 32) + x + 8, y + 6) // the '8' offset should be dynamic based on the bitmap
        }
      }
    }
  } else if (errCnt > 5 && showHeart) {
    const bitmap = screamBitmap
    for (let y = 0; y < bitmap.length; y++) {
      for (let x = 0; x < bitmap[y].length; x++) {
        if (bitmap[y][x] !== '0') {
          matrix.fgColor(colorMap[bitmap[y][x]])
          matrix.setPixel((panel * 32) + x + Math.floor(bitmap[y].length / 2) - 2, y + Math.floor(bitmap.length / 2) - 6) // the '8' offset should be dynamic based on the bitmap
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
          matrix.setPixel(x + 1, y + 1)
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
