import { Font, FontInstance, LedMatrix, LedMatrixInstance } from 'rpi-led-matrix'
import type { drawStateProps } from '../types'
import { heartBitmap, smileyBitmap, screamBitmap, xBitmap} from './bitmaps'

// Update the LED-panels
export const drawState = ({ matrix, fonts, panel, name, errCnt, heartbeatTimeout, showHeart, iterator }: drawStateProps): void => {
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
    if (iterator % 2 === 0) {
      fgColor = 0xff0000
    } else {
      fgColor = 0x000000
      bgColor = 0xff0000
    }
  } else {
    fgColor = 0x000000
    if (iterator % 2 === 0) {
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
    const hbFgColor = (iterator % 2 === 0) ? 0xffffff : 0x000000
    const hbBgColor = (iterator % 2 === 0) ? 0xaa0000 : 0xffff00

    matrix.fgColor(hbBgColor)
    matrix.fill(0 + (panel * 32), 25, 32 + (panel * 32), 31)
    matrix.fgColor(hbFgColor)
    //matrix.drawText(name.toLocaleUpperCase(), xoffsetName, 26)
    if (iterator % 2 === 0) {
      bgColor = 0xdddd00
    } else {
      bgColor = 0x000000
    }

    const panelText = [
      "NO",
      "HEART",
      "BEAT",
      ":("
    ]
    matrix.drawText(panelText[panel], (16 - ((panelText[panel].length * 4) / 2)) + (panel * 32), 26)

  } else {
    matrix.fgColor(0xffffff)
    matrix.drawText(name.toLocaleUpperCase(), xoffsetName, 26)
  }

  // Background color
  matrix.fgColor(bgColor)
  matrix.fill(0 + (panel * 32), 0, 32 + (panel * 32), 24)

  if (heartbeatTimeout) {
    const bitmap = xBitmap;
    for (let y = 0; y < bitmap.length; y++) {
      for (let x = 0; x < bitmap[y].length; x++) {
        if (bitmap[y][x] !== undefined) {
          matrix.fgColor(bitmap[y][x] as number)
          matrix.setPixel((panel * 32) + x + Math.floor(bitmap[y].length / 2) - 2, y + Math.floor(bitmap.length / 2) - 6) // the '8' offset should be dynamic based on the bitmap
        }
      }
    }
  } else if (errCnt === 0) {
    // Smiley
    for (let y = 0; y < smileyBitmap.length; y++) {
      for (let x = 0; x < smileyBitmap[y].length; x++) {
        if (smileyBitmap[y][x] !== undefined) {
          matrix.fgColor(smileyBitmap[y][x] as number)
          matrix.setPixel((panel * 32) + x + 8, y + 6) // the '8' offset should be dynamic based on the bitmap
        }
      }
    }
  } else if (errCnt > 5 && showHeart) {
    const bitmap = screamBitmap
    for (let y = 0; y < bitmap.length; y++) {
      for (let x = 0; x < bitmap[y].length; x++) {
        if (bitmap[y][x] !== undefined) {
          matrix.fgColor(bitmap[y][x] as number)
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
    matrix.fgColor((iterator % 2 === 0) ? 0x0000ff : 0xffffff)
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
  { ...LedMatrix.defaultMatrixOptions(), chainLength: 2, cols: 64, rows: 32 },
  { ...LedMatrix.defaultRuntimeOptions(), doGpioInit: true, gpioSlowdown: 3 }
)

export const getFonts = (): Record<string, FontInstance> => ({
  smallFont: new Font('tom-thumb', './tom-thumb.bdf'),
  largeFont: new Font('10x20', './10x20.bdf')
})
