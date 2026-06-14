import { createCanvas, loadImage } from 'canvas'
import { Font, FontInstance, LedMatrix, LedMatrixInstance } from 'rpi-led-matrix'
import type { drawStateProps, PanelImage } from '../types'
import { heartBitmap, smileyBitmap, screamBitmap, xBitmap} from './bitmaps'
import { chainLength, panelWidth, panelHeight, smallFontCharWidth, imagesDir, fontsDir, panelImages, gpioSlowdown, pwmLsbNanoseconds, pwmBits, pwmDitherBits, showRefreshRate, limitRefreshRateHz, brightness } from '../settings'

// Decode each configured PNG once at startup into a flat list of lit pixels
// (transparent pixels are dropped) so the render loop only does setPixel calls.
export const getImages = async (): Promise<Partial<Record<string, PanelImage>>> => {
  const result: Partial<Record<string, PanelImage>> = {}

  for (const [team, file] of Object.entries(panelImages)) {
    if (file === undefined) continue
    try {
      const img = await loadImage(`${imagesDir}/${file}`)
      const canvas = createCanvas(panelWidth, panelHeight)
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, panelWidth, panelHeight)
      ctx.drawImage(img, 0, 0, panelWidth, panelHeight) // scale to fill the panel
      const { data } = ctx.getImageData(0, 0, panelWidth, panelHeight)

      const pixels: PanelImage['pixels'] = []
      for (let y = 0; y < panelHeight; y++) {
        for (let x = 0; x < panelWidth; x++) {
          const i = (y * panelWidth + x) * 4
          if (data[i + 3] < 128) continue // skip (mostly) transparent pixels
          const color = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]
          pixels.push({ x, y, color })
        }
      }
      result[team] = { pixels }
      console.log(`Loaded panel image for ${team}: ${file} (${pixels.length} px)`)
    } catch (error) {
      console.error(`Failed to load panel image for ${team} (${file}):`, error)
    }
  }

  return result
}

const getBitmapXOffset = (bitmapWidth: number, panel: number): number => {
  return (panel * panelWidth) + Math.floor((panelWidth - bitmapWidth) / 2)
}

const getBitmapYOffset = (bitmapHeight: number, targetAreaHeight: number = 24): number => {
  return Math.floor((targetAreaHeight - bitmapHeight) / 2)
}

// Update the LED-panels
export const drawState = ({ matrix, fonts, panel, name, errCnt, heartbeatTimeout, showHeart, iterator, panelImage }: drawStateProps): void => {
  // Static PNG panel: draw the image full-screen and skip all alert rendering.
  // The matrix is cleared each loop, so dropped (transparent) pixels stay black.
  if (panelImage !== undefined) {
    const baseX = panel * panelWidth
    for (const px of panelImage.pixels) {
      matrix.fgColor(px.color)
      matrix.setPixel(baseX + px.x, px.y)
    }
    return
  }

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
  const xoffsetErr = (effErrCnt.length === 1 ? 10 : 5) + (panel * panelWidth)

  // Team Text
  matrix.font(fonts.smallFont)
  const xoffsetName = (panelWidth / 2 - ((name.length * smallFontCharWidth) / 2)) + (panel * panelWidth)

  if (heartbeatTimeout) { // No heartbeat
    const hbFgColor = (iterator % 2 === 0) ? 0xffffff : 0x000000
    const hbBgColor = (iterator % 2 === 0) ? 0xaa0000 : 0xffff00

    matrix.fgColor(hbBgColor)
    matrix.fill(0 + (panel * panelWidth), 25, panelWidth + (panel * panelWidth), 31)
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
    matrix.drawText(panelText[panel], (panelWidth / 2 - ((panelText[panel].length * smallFontCharWidth) / 2)) + (panel * panelWidth), 26)

  } else {
    matrix.fgColor(0xffffff)
    matrix.drawText(name.toLocaleUpperCase(), xoffsetName, 26)
  }

  // Background color
  matrix.fgColor(bgColor)
  matrix.fill(0 + (panel * panelWidth), 0, panelWidth + (panel * panelWidth), 24)

  if (heartbeatTimeout) {
    const bitmap = xBitmap;
    const bitmapWidth = bitmap[0]?.length ?? 0
    const bitmapHeight = bitmap.length
    const xOffset = getBitmapXOffset(bitmapWidth, panel)
    const yOffset = getBitmapYOffset(bitmapHeight)
    for (let y = 0; y < bitmap.length; y++) {
      for (let x = 0; x < bitmap[y].length; x++) {
        if (bitmap[y][x] !== undefined) {
          matrix.fgColor(bitmap[y][x] as number)
          matrix.setPixel(xOffset + x, yOffset + y)
        }
      }
    }
  } else if (errCnt === 0) {
    // Smiley
    const bitmapWidth = smileyBitmap[0]?.length ?? 0
    const bitmapHeight = smileyBitmap.length
    const xOffset = getBitmapXOffset(bitmapWidth, panel)
    const yOffset = getBitmapYOffset(bitmapHeight)
    for (let y = 0; y < smileyBitmap.length; y++) {
      for (let x = 0; x < smileyBitmap[y].length; x++) {
        if (smileyBitmap[y][x] !== undefined) {
          matrix.fgColor(smileyBitmap[y][x] as number)
          matrix.setPixel(xOffset + x, yOffset + y)
        }
      }
    }
  } else if (errCnt > 5 && showHeart) {
    const bitmap = screamBitmap
    const bitmapWidth = bitmap[0]?.length ?? 0
    const bitmapHeight = bitmap.length
    const xOffset = getBitmapXOffset(bitmapWidth, panel)
    const yOffset = getBitmapYOffset(bitmapHeight)
    for (let y = 0; y < bitmap.length; y++) {
      for (let x = 0; x < bitmap[y].length; x++) {
        if (bitmap[y][x] !== undefined) {
          matrix.fgColor(bitmap[y][x] as number)
          matrix.setPixel(xOffset + x, yOffset + y)
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
  { ...LedMatrix.defaultMatrixOptions(), chainLength, cols: 64, rows: panelHeight, pwmLsbNanoseconds, pwmBits, pwmDitherBits, showRefreshRate, limitRefreshRateHz, brightness },
  { ...LedMatrix.defaultRuntimeOptions(), doGpioInit: true, gpioSlowdown }
)

export const getFonts = (): Record<string, FontInstance> => ({
  smallFont: new Font('tom-thumb', `${fontsDir}/tom-thumb.bdf`),
  largeFont: new Font('10x20', `${fontsDir}/10x20.bdf`)
})
