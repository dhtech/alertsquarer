
type FontInstance = Record<string, string>
interface LedMatrixInstance {
  afterSync(hook: any): void;
  bgColor(color: any): void;
  brightness(brightness: number): void;
  clear(): void;
  drawBuffer(buffer: Buffer | Uint8Array, w?: number, h?: number): void;
  drawCircle(x: number, y: number, r: number): void;
  drawLine(x0: number, y0: number, x1: number, y1: number): void;
  drawRect(x0: number, y0: number, width: number, height: number): void;
  drawText(text: string, x: number, y: number, kerning?: number): void;
  fgColor(): void;
  fill(): void;
  fill(x0: number, y0: number, x1: number, y1: number): void;
  font(font: FontInstance): void;
  getAvailablePixelMappers(): void;
  height(): void;
  luminanceCorrect(correct: boolean): void;
  luminanceCorrect(): void;
  map(cb: (coords: [unknown, unknown, unknown], t: unknown) => unknown): void;
  pwmBits(pwmBits: number): void;
  pwmBits(): void;
  setPixel(x: number, y: number): void;
  sync(): void;
  width(): void;
}

// FIXME: använd https://font.tomchen.org/bdfparser_js/


// Update the LED-panels
export const drawState = (_matrix: unknown, _fonts: unknown, panel: number, name: string, errCnt: number, heartbeatTimeout: boolean, showHeart: boolean, n: number): void => {
  /*
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
  */
}

export const getMatrix = (): LedMatrixInstance => ({
  afterSync: (hook: unknown) => undefined,
  bgColor: (color: unknown) => undefined,
  brightness: (brightness: unknown) => undefined,
  clear: () => undefined,
  drawBuffer: (buffer: unknown, w?: unknown, h?: unknown) => undefined,
  drawCircle: (x: unknown, y: unknown, r: unknown) => undefined,
  drawLine: (x0: unknown, y0: unknown, x1: unknown, y1: unknown) => undefined,
  drawRect: (x0: unknown, y0: unknown, width: unknown, height: unknown) => undefined,
  drawText: (text: string, x: unknown, y: unknown, kerning?: unknown) => undefined,
  fgColor: () => undefined,
  fill: () => undefined,
  font: (font: unknown) => undefined,
  getAvailablePixelMappers: () => undefined,
  height: () => undefined,
  luminanceCorrect: () => undefined,
  map: (cb: (coords: [unknown, unknown, unknown], t: unknown) => unknown) => undefined,
  pwmBits: () => undefined,
  setPixel: (x: unknown, y: unknown) => undefined,
  sync: () => undefined,
  width: () => undefined,
})

export const getFonts = (): FontInstance => ({
  smallFont: 'smallFont',
  largeFont: 'largeFont'
})
