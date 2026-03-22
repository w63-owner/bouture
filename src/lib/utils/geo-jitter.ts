/**
 * Applies a deterministic ~200m random offset to coordinates for privacy.
 * Uses a seeded PRNG so the same listing always gets the same jitter.
 */

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 0x100000000;
  };
}

const JITTER_METERS = 200;
const EARTH_RADIUS_M = 6_371_000;

export function jitterCoordinates(
  lat: number,
  lng: number,
  seed: string,
): { lat: number; lng: number } {
  const rng = seededRandom(seed);

  const angle = rng() * 2 * Math.PI;
  const distance = (rng() * 0.5 + 0.5) * JITTER_METERS;

  const dLat = (distance * Math.cos(angle)) / EARTH_RADIUS_M;
  const dLng =
    (distance * Math.sin(angle)) /
    (EARTH_RADIUS_M * Math.cos((lat * Math.PI) / 180));

  return {
    lat: lat + (dLat * 180) / Math.PI,
    lng: lng + (dLng * 180) / Math.PI,
  };
}
