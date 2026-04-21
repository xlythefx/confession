export const CHUNK_SIZE = 8;
export const CHUNK_GRID_RADIUS = 3;
export const TUFT_BLADES_PER_CHUNK = 15;

export function worldToChunk(x: number, z: number) {
  return {
    cx: Math.floor(x / CHUNK_SIZE),
    cz: Math.floor(z / CHUNK_SIZE),
  };
}

export function chunkKey(cx: number, cz: number) {
  return `${cx}|${cz}`;
}

export function hash2(cx: number, cz: number, seed = 1337) {
  let h = cx * 374761393 + cz * 668265263 + seed * 982451653;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export interface Blade {
  x: number;
  z: number;
  rot: number;
  scale: number;
  tint: number;
}

export function generateBladesForChunk(
  cx: number,
  cz: number,
  count = 36,
): Blade[] {
  const r = rng(hash2(cx, cz));
  const blades: Blade[] = [];
  const baseX = cx * CHUNK_SIZE;
  const baseZ = cz * CHUNK_SIZE;
  for (let i = 0; i < count; i++) {
    blades.push({
      x: baseX + r() * CHUNK_SIZE,
      z: baseZ + r() * CHUNK_SIZE,
      rot: r() * Math.PI * 2,
      scale: 0.7 + r() * 0.9,
      tint: r(),
    });
  }
  return blades;
}
