const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPNG(width, height) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const raw = Buffer.alloc((width * 4 + 1) * height);
  const cx = width / 2;
  const cy = height / 2;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const nx = Math.abs(x - cx) / (width * 0.45);
      const ny = Math.abs(y - cy) / (height * 0.45);
      const inSquircle = Math.pow(nx, 4) + Math.pow(ny, 4) <= 1.0;

      if (!inSquircle) {
        raw[offset++] = 0;
        raw[offset++] = 0;
        raw[offset++] = 0;
        raw[offset++] = 0;
        continue;
      }

      const grad = (y / height) * 0.25;
      let red = Math.round(220 * (1 - grad));
      let green = Math.round(38 * (1 - grad));
      let blue = Math.round(38 * (1 - grad));
      let alpha = 255;

      const inBagBody = (x >= width * 0.28 && x <= width * 0.72 && y >= height * 0.42 && y <= height * 0.78);
      const hdx = x - cx;
      const hdy = y - height * 0.42;
      const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
      const inHandle = (hdist >= width * 0.12 && hdist <= width * 0.18 && y <= height * 0.42);

      const inPointer = (x >= width * 0.44 && x <= width * 0.58 && y >= height * 0.52 && y <= height * 0.68 && (x - width * 0.44) * 1.1 >= (y - height * 0.52));

      if (inHandle) {
        red = 255; green = 255; blue = 255;
      } else if (inBagBody) {
        if (inPointer) {
          red = 220; green = 38; blue = 38;
        } else {
          red = 255; green = 255; blue = 255;
        }
      }

      raw[offset++] = red;
      raw[offset++] = green;
      raw[offset++] = blue;
      raw[offset++] = alpha;
    }
  }

  const compressed = zlib.deflateSync(raw);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

const logoBuffer = createPNG(128, 128);
const outPath = path.join(__dirname, '..', 'public', 'logo.png');
fs.writeFileSync(outPath, logoBuffer);
console.log('Successfully generated public/logo.png (' + logoBuffer.length + ' bytes)');
