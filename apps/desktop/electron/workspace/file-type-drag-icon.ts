import { deflateSync } from 'node:zlib';
import { fileTypeLabel } from '../../src/file-type-icon-svg';

const SCALE = 2;
const WIDTH = 48 * SCALE;
const HEIGHT = 56 * SCALE;
const STROKE: Rgba = [154, 163, 150, 255];
const PAGE: Rgba = [255, 255, 255, 255];
const FOLD: Rgba = [231, 238, 228, 255];
const TEXT: Rgba = [49, 66, 54, 255];

type Rgba = readonly [number, number, number, number];

const glyphs: Record<string, readonly string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
};

export function renderFileTypeIconPng(name?: string, customLabel?: string) {
  const label = fileTypeLabel(name, customLabel);
  const pixels = new Uint8Array(WIDTH * HEIGHT * 4);

  for (let py = 0; py < HEIGHT; py += 1) {
    for (let px = 0; px < WIDTH; px += 1) {
      const color = sample((px + 0.5) / SCALE, (py + 0.5) / SCALE);

      if (color) {
        const offset = (py * WIDTH + px) * 4;
        pixels[offset] = color[0];
        pixels[offset + 1] = color[1];
        pixels[offset + 2] = color[2];
        pixels[offset + 3] = color[3];
      }
    }
  }

  drawLabel(pixels, label);

  return encodePng(WIDTH, HEIGHT, pixels);
}

function sample(x: number, y: number): Rgba | undefined {
  const page = insidePage(x, y);
  const fold = insideFold(x, y);

  if (onEdge(insidePage, x, y) || onEdge(insideFold, x, y)) {
    return STROKE;
  }

  if (fold) {
    return FOLD;
  }

  if (page) {
    return PAGE;
  }

  return undefined;
}

function onEdge(inside: (x: number, y: number) => boolean, x: number, y: number) {
  const here = inside(x, y);

  for (let step = 0; step < 8; step += 1) {
    const angle = (step / 8) * Math.PI * 2;

    if (inside(x + Math.cos(angle), y + Math.sin(angle)) !== here) {
      return true;
    }
  }

  return false;
}

function insidePage(x: number, y: number) {
  if (x - y > 26 || x < 4 || x > 42 || y < 2 || y > 54) {
    return false;
  }

  if (x < 10.5 && y < 6.5) {
    return (x - 10.5) ** 2 + (y - 6.5) ** 2 <= 4.5 ** 2;
  }

  if (x < 10.5 && y > 47.5) {
    return (x - 10.5) ** 2 + (y - 47.5) ** 2 <= 6.5 ** 2;
  }

  if (x > 35.5 && y > 47.5) {
    return (x - 35.5) ** 2 + (y - 47.5) ** 2 <= 6.5 ** 2;
  }

  return true;
}

function insideFold(x: number, y: number) {
  return insidePolygon(x, y, [
    [28, 2],
    [28, 14.5],
    [29.5, 16],
    [42, 16],
  ]);
}

function insidePolygon(x: number, y: number, points: ReadonlyArray<readonly [number, number]>) {
  let inside = false;

  for (let index = 0, previous = points.length - 1; index < points.length; previous = index, index += 1) {
    const current = points[index];
    const prior = points[previous];

    if (!current || !prior) {
      continue;
    }

    const [xi, yi] = current;
    const [xj, yj] = prior;
    const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (crosses) {
      inside = !inside;
    }
  }

  return inside;
}

function drawLabel(pixels: Uint8Array, label: string) {
  const fontSize = label.length > 3 ? 8 : 10;
  const scale = fontSize / 7;
  const glyphWidth = 5 * scale;
  const gap = scale;
  let cursor = 24 - (label.length * glyphWidth + Math.max(0, label.length - 1) * gap) / 2;
  const top = 40 - 7 * scale;

  for (const char of label) {
    const rows = glyphs[char];

    if (rows) {
      rows.forEach((row, rowIndex) => {
        for (let column = 0; column < row.length; column += 1) {
          if (row[column] === '1') {
            fill(pixels, cursor + column * scale, top + rowIndex * scale, scale, scale, TEXT);
          }
        }
      });
    }

    cursor += glyphWidth + gap;
  }
}

function fill(pixels: Uint8Array, x: number, y: number, width: number, height: number, color: Rgba) {
  const x0 = Math.max(0, Math.round(x * SCALE));
  const y0 = Math.max(0, Math.round(y * SCALE));
  const x1 = Math.min(WIDTH, Math.round((x + width) * SCALE));
  const y1 = Math.min(HEIGHT, Math.round((y + height) * SCALE));

  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      const offset = (py * WIDTH + px) * 4;
      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
      pixels[offset + 3] = color[3];
    }
  }
}

function encodePng(width: number, height: number, rgba: Uint8Array) {
  const raw = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, row + 1);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function chunk(type: string, data: Buffer) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(body));

  return Buffer.concat([length, body, checksum]);
}

function crc32(data: Buffer) {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return ~crc >>> 0;
}
