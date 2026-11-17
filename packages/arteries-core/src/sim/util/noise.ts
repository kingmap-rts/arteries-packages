/** Value noise for map generation (deterministic, seed based). */

export function noiseHash(ix: number, iy: number, s: number) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(s, 982451653)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function valueNoise(x: number, y: number, s: number) {
  const ix = Math.floor(x),
    iy = Math.floor(y),
    fx = x - ix,
    fy = y - iy,
    u = fx * fx * (3 - 2 * fx),
    v = fy * fy * (3 - 2 * fy);
  const a = noiseHash(ix, iy, s),
    b = noiseHash(ix + 1, iy, s),
    c = noiseHash(ix, iy + 1, s),
    d = noiseHash(ix + 1, iy + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x: number, y: number, s: number) {
  let t = 0,
    a = 1,
    f = 1,
    sum = 0;
  for (let o = 0; o < 4; o++) {
    t += valueNoise(x * f, y * f, s + o * 101) * a;
    sum += a;
    a *= 0.5;
    f *= 2;
  }
  return t / sum;
}
