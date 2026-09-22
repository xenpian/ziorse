const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const framesDir = path.join(__dirname, '..', 'src', 'assets', 'avatar-frames');
if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

function createPng(width, height, pixelFn) {
  // width x height RGBA
  const rowSize = width * 4 + 1; // +1 for filter byte
  const buffer = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    buffer[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(buffer);

  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1);
}

// 1. Cyber Neon
const cyberPng = createPng(128, 128, (x, y, w, h) => {
  const cx = w / 2, cy = h / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const rOuter = 58, rInner = 48;
  if (dist >= rInner && dist <= rOuter) {
    const angle = Math.atan2(y - cy, x - cx);
    const pulse = (Math.sin(angle * 4) + 1) / 2;
    return [0, Math.floor(200 + 55 * pulse), 254, 255];
  } else if (dist > rOuter && dist <= rOuter + 4) {
    return [0, 242, 254, Math.floor(180 * (1 - (dist - rOuter) / 4))];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(framesDir, 'siber-neon.png'), cyberPng);

// 2. Altın Taç
const goldPng = createPng(128, 128, (x, y, w, h) => {
  const cx = w / 2, cy = h / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const rOuter = 57, rInner = 49;
  if (dist >= rInner && dist <= rOuter) {
    return [246, 211, 101, 255];
  } else if (dist > rOuter && dist <= rOuter + 4) {
    return [253, 160, 133, Math.floor(200 * (1 - (dist - rOuter) / 4))];
  }
  // Crown jewel at top
  if (y <= 20 && Math.abs(x - cx) <= 12) {
    return [255, 215, 0, 255];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(framesDir, 'altin-tac.png'), goldPng);

// 3. Alev Çemberi
const flamePng = createPng(128, 128, (x, y, w, h) => {
  const cx = w / 2, cy = h / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const rOuter = 58, rInner = 48;
  if (dist >= rInner && dist <= rOuter) {
    const angle = Math.atan2(y - cy, x - cx);
    const flick = (Math.sin(angle * 8) + 1) / 2;
    return [255, Math.floor(69 + 120 * flick), 0, 255];
  } else if (dist > rOuter && dist <= rOuter + 5) {
    return [255, 140, 0, Math.floor(190 * (1 - (dist - rOuter) / 5))];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(framesDir, 'ates-cemberi.png'), flamePng);

// 4. Sakura Çiçeği
const sakuraPng = createPng(128, 128, (x, y, w, h) => {
  const cx = w / 2, cy = h / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const rOuter = 57, rInner = 49;
  if (dist >= rInner && dist <= rOuter) {
    return [255, 117, 140, 255];
  } else if (dist > rOuter && dist <= rOuter + 4) {
    return [255, 126, 179, Math.floor(180 * (1 - (dist - rOuter) / 4))];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(framesDir, 'sakura-cicegi.png'), sakuraPng);

// 5. Galaksi Mor
const galaxyPng = createPng(128, 128, (x, y, w, h) => {
  const cx = w / 2, cy = h / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const rOuter = 58, rInner = 48;
  if (dist >= rInner && dist <= rOuter) {
    return [161, 140, 209, 255];
  } else if (dist > rOuter && dist <= rOuter + 4) {
    return [251, 194, 235, Math.floor(200 * (1 - (dist - rOuter) / 4))];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(framesDir, 'galaksi-mor.png'), galaxyPng);

console.log('Sample PNG frames generated successfully in', framesDir);
