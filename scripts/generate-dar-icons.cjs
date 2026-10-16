const fs = require('fs');
const zlib = require('zlib');

function createPngWithDAR(size, isMaskable = false) {
  const width = size;
  const height = size;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, combined, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: 2 (RGB)
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);

  // Simple 5x7 bitmap font for "D A R"
  const glyphD = [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0]
  ];

  const glyphA = [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1]
  ];

  const glyphR = [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,1,0,0],
    [1,0,0,1,0],
    [1,0,0,0,1]
  ];

  // Draw background & "DAR"
  const scale = Math.floor(size / 30);
  const startY = Math.floor(size * 0.38);
  const letterW = 5 * scale;
  const letterSpacing = Math.floor(scale * 1.8);
  const totalW = letterW * 3 + letterSpacing * 2;
  const startX = Math.floor((size - totalW) / 2);

  function isPixelInGlyph(glyph, px, py, gStartX, gStartY) {
    const gx = Math.floor((px - gStartX) / scale);
    const gy = Math.floor((py - gStartY) / scale);
    if (gx >= 0 && gx < 5 && gy >= 0 && gy < 7) {
      return glyph[gy][gx] === 1;
    }
    return false;
  }

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;

      // Dark metallic carbon / automotive gradient background
      const distFromCenter = Math.hypot(x - width / 2, y - height / 2) / (width / 2);
      let r = Math.round(10 + (1 - distFromCenter) * 15);
      let g = Math.round(15 + (1 - distFromCenter) * 25);
      let b = Math.round(30 + (1 - distFromCenter) * 60);

      // Speedometer arc at top
      const dx = x - width / 2;
      const dy = y - height * 0.45;
      const dist = Math.hypot(dx, dy);
      const arcR = width * 0.36;
      if (Math.abs(dist - arcR) < Math.max(3, width * 0.02) && dy < height * 0.15) {
        // Cyan/blue speedometer arc
        r = 14;
        g = 165;
        b = 233;
      }

      // Check D, A, R letters
      const inD = isPixelInGlyph(glyphD, x, y, startX, startY);
      const inA = isPixelInGlyph(glyphA, x, y, startX + letterW + letterSpacing, startY);
      const inR = isPixelInGlyph(glyphR, x, y, startX + (letterW + letterSpacing) * 2, startY);

      if (inD || inA || inR) {
        // Crisp white / bright cyan gradient for "DAR"
        const verticalFade = (y - startY) / (7 * scale);
        r = Math.round(255 - verticalFade * 20);
        g = Math.round(255 - verticalFade * 40);
        b = Math.round(255);
      }

      // Bottom pill badge: "AUTO CRM" indicator
      const pillY = Math.floor(size * 0.76);
      const pillH = Math.max(8, Math.floor(size * 0.08));
      const pillW = Math.floor(size * 0.44);
      const pillX = Math.floor((size - pillW) / 2);
      if (x >= pillX && x < pillX + pillW && y >= pillY && y < pillY + pillH) {
        r = 37;
        g = 99;
        b = 235;
      }

      rawData[pxOffset] = Math.max(0, Math.min(255, r));
      rawData[pxOffset + 1] = Math.max(0, Math.min(255, g));
      rawData[pxOffset + 2] = Math.max(0, Math.min(255, b));
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync('public/pwa-192x192.png', createPngWithDAR(192));
fs.writeFileSync('public/pwa-512x512.png', createPngWithDAR(512));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPngWithDAR(512, true));
fs.writeFileSync('public/apple-touch-icon.png', createPngWithDAR(180));
console.log('DAR mobile icons generated successfully!');
