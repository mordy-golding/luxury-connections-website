// Build responsive photos, favicons and the Open Graph image from <site>/source into <site>/assets.
// Run after tools/split-logo.mjs. Usage: node tools/build-images.mjs .
import fs from 'node:fs';
import sharp from 'sharp';

const site = process.argv[2];
const A = `${site}/assets`, SRC = `${site}/source`;
fs.mkdirSync(`${A}/img`, { recursive: true });

// 1 · Responsive photos
const widths = [640, 960, 1280, 1672];
for (const name of ['hero', 'door']) {
  for (const w of widths) {
    const img = () => sharp(`${SRC}/${name}.png`).resize({ width: w });
    await img().avif({ quality: 52, effort: 6 }).toFile(`${A}/img/${name}-${w}.avif`);
    await img().webp({ quality: 74 }).toFile(`${A}/img/${name}-${w}.webp`);
  }
  await sharp(`${SRC}/${name}.png`).resize({ width: 1280 }).jpeg({ quality: 78, mozjpeg: true }).toFile(`${A}/img/${name}-1280.jpg`);
}

// 2 · Favicons — gold knot on a navy square, matching LC_ICON.png
const knot = fs.readFileSync(`${A}/logo-knot.svg`, 'utf8');
const knotBody = knot.match(/<g[\s\S]*<\/g>/)[0];
const [kx, ky, kw] = knot.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
const side = +(kw / 0.74).toFixed(2), cx = kx + kw / 2, cy = ky + kw / 2;
const fx = +(cx - side / 2).toFixed(2), fy = +(cy - side / 2).toFixed(2);
fs.writeFileSync(`${site}/favicon.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fx} ${fy} ${side} ${side}"><rect x="${fx}" y="${fy}" width="${side}" height="${side}" fill="#16324F"/>${knotBody}</svg>\n`);

await sharp(`${SRC}/LC_ICON.png`).resize(180).png().toFile(`${site}/apple-touch-icon.png`);
// favicon.ico holding a single 32px PNG
const png32 = await sharp(`${SRC}/LC_ICON.png`).resize(32).png().toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12); ico.writeUInt32LE(png32.length, 14); ico.writeUInt32LE(22, 18);
fs.writeFileSync(`${site}/favicon.ico`, Buffer.concat([ico, png32]));

// 3 · Open Graph image: hero crop, soft ivory glow, full logo centered
const W = 1200, H = 630;
const base = await sharp(`${SRC}/hero.png`).resize(W, H, { fit: 'cover', position: 'centre' }).toBuffer();
const glow = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#F2EADB" stop-opacity=".82"/><stop offset=".55" stop-color="#F2EADB" stop-opacity=".5"/>
    <stop offset="1" stop-color="#F2EADB" stop-opacity="0"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="#F2EADB" fill-opacity=".08"/>
  <ellipse cx="${W / 2}" cy="${H / 2}" rx="420" ry="300" fill="url(#g)"/></svg>`);
const logoH = 400;
const logo = await sharp(fs.readFileSync(`${SRC}/LC_LOGO_Color with Tagline.svg`), { density: 600 }).resize({ height: logoH }).png().toBuffer();
const { width: logoW } = await sharp(logo).metadata();
await sharp(base)
  .composite([{ input: glow }, { input: logo, left: Math.round((W - logoW) / 2), top: Math.round((H - logoH) / 2) }])
  .jpeg({ quality: 84, mozjpeg: true }).toFile(`${A}/img/og.jpg`);

console.log('done');
