// import { heartBitmap, smileyBitmap, screamBitmap, } from './bitmaps'

// import {createCanvas} from 'canvas'



// type FontInstance = Record<string, string>

// export interface drawStateProps {
//   matrix: FakeLedMatrixInstance
//   fonts: Record<string, FontInstance>
//   panel: number
//   name: string
//   errCnt: number
//   heartbeatTimeout: boolean
//   showHeart: boolean
//   iterator: number
// }


// /*
// interface FakeLedMatrixInstance {
//   afterSync(hook: any): void;
//   bgColor(color: any): void;
//   brightness(brightness: number): void;
//   clear(): void;
//   drawBuffer(buffer: Buffer | Uint8Array, w?: number, h?: number): void;
//   drawCircle(x: number, y: number, r: number): void;
//   drawLine(x0: number, y0: number, x1: number, y1: number): void;
//   drawRect(x0: number, y0: number, width: number, height: number): void;
//   drawText(text: string, x: number, y: number, kerning?: number): void;
//   fgColor(): void;
//   fill(): void;
//   fill(x0: number, y0: number, x1: number, y1: number): void;
//   font(font: FontInstance): void;
//   getAvailablePixelMappers(): void;
//   height(): void;
//   luminanceCorrect(correct: boolean): void;
//   luminanceCorrect(): void;
//   map(cb: (coords: [unknown, unknown, unknown], t: unknown) => unknown): void;
//   pwmBits(pwmBits: number): void;
//   pwmBits(): void;
//   setPixel(x: number, y: number): void;
//   sync(): void;
//   width(): void;
// }
// */


// interface FakeLedMatrixInstanceProps {
//   cols: number;
//   rows: number;
//   chainLength: number;
// }


// export class FakeLedMatrixInstance {

//   _cols: number;
//   _rows: number;
//   _chainLength: number;

//   _fgColor: number;
//   _bgColor: number;

//   _buffer_col: Array<number>
//   _buffer_txt: Array<string>
//   _pixelCount: number
//   _width: number
//   _height: number

//   constructor (conf: FakeLedMatrixInstanceProps) {
//     this._fgColor = 0xffffff
//     this._bgColor = 0x000000
//     this._cols = conf.cols
//     this._rows = conf.rows
//     this._chainLength = conf.chainLength
//     this._buffer_col = []
//     this._buffer_txt = []

//     this._width = this._cols * this._chainLength
//     this._height = this._rows

//     this._pixelCount = this._rows*this._cols*this._chainLength

//     // fill buffer
//     this.clear()

//     const WIDTH = 100;
// const HEIGHT = 50;

// const canvas = createCanvas(WIDTH, HEIGHT);
// const ctx = canvas.getContext("2d");

// ctx.fillStyle = "#222222";
// ctx.fillRect(0, 0, WIDTH, HEIGHT);
// ctx.fillStyle = "#f2f2f2";
// ctx.font = "32px Arial";
// ctx.fillText("Hello", 13, 35);

// const buffer = canvas.toBuffer("image/png");
// fs.writeFileSync("test.png", buffer);


//   }
//   public bgColor(color: any): void { this._bgColor = color; };
//   public clear(): void {
//     for(let i = 0; i < this._pixelCount; i++) {
//       this._buffer_col[i] = 0
//       this._buffer_txt[i] = '#'
//     }
//   };
//   public fgColor(color: number): void { this._fgColor = color };
//   public fill(x0: number, y0: number, x1: number, y1: number): void {
//     for (let y=y0; y<y1; y++) {
//       for (let x=x0; x<x1; x++) {
//         this._buffer_col[x + y*this._rows] = this._fgColor
//       }
//     }
//   };

//   public drawText(text: string, x: number, y: number, kerning?: number): void {
//     // NOT IMPLEMENTED
//   };

//   public sync(): void {
//     for (let i = 0; i < this._buffer_txt.length; i += this._width) {
//         const row_txt = this._buffer_txt.slice(i, i + this._width);
//         const row_col = this._buffer_col.slice(i, i + this._width)

//         let result = []
//         for(let x = 0; x < this._width; x++) {
//           result.push()
//         }
//         console.log(row_txt.join(''))
//     }
//   };


//   public afterSync(hook: any): void {};
//   public brightness(brightness: number): void {};
//   public drawBuffer(buffer: Buffer | Uint8Array, w?: number, h?: number): void {};
//   public drawCircle(x: number, y: number, r: number): void {};
//   public drawLine(x0: number, y0: number, x1: number, y1: number): void {};
//   public drawRect(x0: number, y0: number, width: number, height: number): void {};
//   public font(font: FontInstance): void {};
//   public getAvailablePixelMappers(): void {};
//   public height(): void {};
//   public luminanceCorrect(correct: boolean): void {};
//   public map(cb: (coords: [unknown, unknown, unknown], t: unknown) => unknown): void {};
//   public pwmBits(pwmBits: number): void {};
//   public setPixel(x: number, y: number): void {};
//   public width(): void {};
// }

// // FIXME: använd https://font.tomchen.org/bdfparser_js/


// // Update the LED-panels
// export const drawState = ({ matrix, fonts, panel, name, errCnt, heartbeatTimeout, showHeart, iterator }: drawStateProps): void => {
//   console.log("drawstate", {panel, name, errCnt})
  
//   let bgColor = 0x000000
//   let fgColor = 0xffffff

//   if (errCnt < 0) {
//     bgColor = 0x000000
//     fgColor = 0xffff00
//   } else if (errCnt === 0) {
//     bgColor = 0x00ff00
//     fgColor = 0x000000
//   } else if (errCnt <= 2) {
//     bgColor = 0xffff00
//     fgColor = 0x000000
//   } else if (errCnt <= 5) {
//     bgColor = 0xff0000
//     fgColor = 0x000000
//   } else if (errCnt <= 99) {
//     if (iterator % 2 === 0) {
//       fgColor = 0xff0000
//     } else {
//       fgColor = 0x000000
//       bgColor = 0xff0000
//     }
//   } else {
//     fgColor = 0x000000
//     if (iterator % 2 === 0) {
//       bgColor = 0x0000ff
//     } else {
//       bgColor = 0xff0000
//     }
//   }

//   const effErrCnt = (errCnt <= 99) ? `${errCnt}` : ':(' // If we have 100 or more errors, just show a sad face
//   const xoffsetErr = (effErrCnt.length === 1 ? 10 : 5) + (panel * 32)

//   // Team Text
//   matrix.font(fonts.smallFont)
  
//   const xoffsetName = (16 - ((name.length * 4) / 2)) + (panel * 32)

//   if (heartbeatTimeout) { // No heartbeat
//     const hbFgColor = (iterator % 2 === 0) ? 0xffffff : 0x000000
//     const hbBgColor = (iterator % 2 === 0) ? 0xaa0000 : 0xffff00

//     matrix.fgColor(hbBgColor)
//     matrix.fill(0 + (panel * 32), 25, 32 + (panel * 32), 31)
//     matrix.fgColor(hbFgColor)
//     matrix.drawText(name.toLocaleUpperCase(), xoffsetName, 26)
//   } else {
//     matrix.fgColor(0xffffff)
//     matrix.drawText(name.toLocaleUpperCase(), xoffsetName, 26)
//   }

//   // Background color
//   matrix.fgColor(bgColor)
//   matrix.fill(0 + (panel * 32), 0, 32 + (panel * 32), 24)

//   if (errCnt === 0) {
//     // Smiley
//     for (let y = 0; y < smileyBitmap.length; y++) {
//       for (let x = 0; x < smileyBitmap[y].length; x++) {
//         if (smileyBitmap[y][x] !== undefined) {
//           matrix.fgColor(smileyBitmap[y][x] as number)
//           matrix.setPixel((panel * 32) + x + 8, y + 6) // the '8' offset should be dynamic based on the bitmap
//         }
//       }
//     }
//   } else if (errCnt > 5 && showHeart) {
//     const bitmap = screamBitmap
//     for (let y = 0; y < bitmap.length; y++) {
//       for (let x = 0; x < bitmap[y].length; x++) {
//         if (bitmap[y][x] !== undefined) {
//           matrix.fgColor(bitmap[y][x] as number)
//           matrix.setPixel((panel * 32) + x + Math.floor(bitmap[y].length / 2) - 2, y + Math.floor(bitmap.length / 2) - 6) // the '8' offset should be dynamic based on the bitmap
//         }
//       }
//     }
//   } else {
//     // Count text
//     matrix.font(fonts.largeFont)
//     matrix.fgColor(fgColor)
//     matrix.drawText(effErrCnt, xoffsetErr, 4)
//   }

//   // Show heart on first panel
//   if (showHeart && panel === 0) {
//     matrix.fgColor((iterator % 2 === 0) ? 0x0000ff : 0xffffff)
//     for (let y = 0; y < 5; y++) {
//       for (let x = 0; x < 5; x++) {
//         if (heartBitmap[y][x] === 1) {
//           matrix.setPixel(x + 1, y + 1)
//         }
//       }
//     }
//   }
// }

// export const getMatrix = (): FakeLedMatrixInstance => new FakeLedMatrixInstance({ chainLength: 2, cols: 64, rows: 32 })

// export const getFonts = (): Record<string, FontInstance> => ({
//   smallFont: {smallFont: 'smallFont'},
//   largeFont: {largeFont: 'largeFont'}
// })
