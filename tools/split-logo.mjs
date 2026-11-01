// Split the client logo into knot / wordmark / tagline SVGs with tight viewBoxes.
// Usage: node tools/split-logo.mjs "source/LC_LOGO_Color with Tagline.svg" assets
import fs from 'node:fs';
import { svgPathBbox } from 'svg-path-bbox';

const [src, outDir] = process.argv.slice(2);
const svg = fs.readFileSync(src, 'utf8');

// The logo has four <g> groups of paths: knot (gold), LUXURY, CONNECTIONS, tagline.
const groups = [...svg.matchAll(/<g>\s*((?:<path[^>]*\/>\s*)+)<\/g>/g)].map(m =>
  [...m[1].matchAll(/<path class="(cls-\d)" d="([^"]+)"\/>/g)].map(p => ({ cls: p[1], d: p[2] }))
);
if (groups.length !== 4) throw new Error(`expected 4 groups, got ${groups.length}`);

const fills = { 'cls-1': '#B08D57', 'cls-2': '#15324F' };
const bbox = paths => paths.map(p => svgPathBbox(p.d)).reduce((a, b) =>
  [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
const r = n => Math.round(n * 100) / 100;

function write(name, paths, { fill, pad = 0.5 } = {}) {
  const [x0, y0, x1, y1] = bbox(paths);
  const vb = [r(x0 - pad), r(y0 - pad), r(x1 - x0 + 2 * pad), r(y1 - y0 + 2 * pad)];
  const body = paths.map(p => `<path d="${p.d}"/>`).join('');
  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}"><g fill="${fill ?? fills[paths[0].cls]}">${body}</g></svg>\n`;
  fs.writeFileSync(`${outDir}/${name}.svg`, out);
  console.log(name, 'viewBox', vb.join(' '), 'bytes', out.length);
  return vb;
}

const [knot, luxury, connections, tagline] = groups;
// Drop the zero-area stray anchor paths from the knot (tiny "h0" fragments).
const knotClean = knot.filter(p => { const b = svgPathBbox(p.d); return (b[2] - b[0]) * (b[3] - b[1]) > 0.5; });
console.log('knot paths', knot.length, '->', knotClean.length);

write('logo-knot', knotClean);
write('logo-wordmark', [...luxury, ...connections]);
write('logo-tagline', tagline);
// Full-logo bboxes for proportion reference
for (const [n, g] of Object.entries({ knot: knotClean, luxury, connections, tagline })) console.log(n, bbox(g).map(r).join(' '));
