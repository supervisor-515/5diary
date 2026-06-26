// Generate PWA icons as PNGs using only Node built-ins (zlib).
// Warm Paper Diary mark: clay rounded card on warm paper with a serif-ish
// page motif. Run: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'icons');
mkdirSync(OUT, { recursive: true });

const COLORS = {
  paper: [244, 238, 226, 255],
  clay: [200, 120, 90, 255],
  cream: [248, 244, 236, 255],
  olive: [124, 127, 82, 255],
};

function makeCanvas(size) {
  const buf = new Uint8Array(size * size * 4);
  return { size, buf };
}

function setPx(c, x, y, [r, g, b, a]) {
  x = x | 0;
  y = y | 0;
  if (x < 0 || y < 0 || x >= c.size || y >= c.size) return;
  const i = (y * c.size + x) * 4;
  // simple alpha-over composite
  const af = a / 255;
  c.buf[i] = Math.round(r * af + c.buf[i] * (1 - af));
  c.buf[i + 1] = Math.round(g * af + c.buf[i + 1] * (1 - af));
  c.buf[i + 2] = Math.round(b * af + c.buf[i + 2] * (1 - af));
  c.buf[i + 3] = 255;
}

function fill(c, color) {
  for (let y = 0; y < c.size; y++) for (let x = 0; x < c.size; x++) setPx(c, x, y, color);
}

function roundRect(c, x0, y0, w, h, r, color) {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  w = Math.round(w);
  h = Math.round(h);
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const dx = Math.max(x0 + r - x, x - (x0 + w - 1 - r), 0);
      const dy = Math.max(y0 + r - y, y - (y0 + h - 1 - r), 0);
      if (dx * dx + dy * dy <= r * r) setPx(c, x, y, color);
    }
  }
}

function drawIcon(size, { maskable }) {
  const c = makeCanvas(size);
  fill(c, maskable ? COLORS.clay : COLORS.paper);

  const pad = maskable ? size * 0.18 : size * 0.1;
  const cardR = size * 0.18;
  // clay card (or cream page on maskable)
  if (maskable) {
    roundRect(c, pad, pad, size - pad * 2, size - pad * 2, cardR, COLORS.cream);
  } else {
    roundRect(c, pad, pad, size - pad * 2, size - pad * 2, cardR, COLORS.clay);
  }

  // inner "photo" square
  const ipad = maskable ? size * 0.3 : size * 0.24;
  const innerColor = maskable ? COLORS.clay : COLORS.cream;
  const iw = size - ipad * 2;
  roundRect(c, ipad, ipad, iw, iw * 0.62, size * 0.06, innerColor);

  // olive text lines under the photo
  const lineX = ipad;
  const lineW = iw;
  const lineH = Math.max(2, Math.round(size * 0.03));
  const lineColor = maskable ? COLORS.olive : COLORS.olive;
  const y1 = ipad + iw * 0.62 + size * 0.07;
  roundRect(c, lineX, y1, lineW, lineH, lineH / 2, lineColor);
  roundRect(c, lineX, y1 + size * 0.07, lineW * 0.7, lineH, lineH / 2, lineColor);

  return c;
}

/* ---- PNG encoding ---- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(c) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.size, 0);
  ihdr.writeUInt32BE(c.size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc(c.size * (c.size * 4 + 1));
  for (let y = 0; y < c.size; y++) {
    raw[y * (c.size * 4 + 1)] = 0; // filter none
    for (let x = 0; x < c.size * 4; x++) {
      raw[y * (c.size * 4 + 1) + 1 + x] = c.buf[y * c.size * 4 + x];
    }
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const targets = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
];

for (const t of targets) {
  const c = drawIcon(t.size, { maskable: t.maskable });
  writeFileSync(join(OUT, t.name), encodePNG(c));
  console.log('wrote', t.name);
}
