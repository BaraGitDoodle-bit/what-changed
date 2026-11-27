import {
  TAP_TOLERANCE,
  VH,
  VW,
  type Diff,
  type Rect,
  type Scene,
} from '../../shared/types';

/** Convert a normalised tap (0..1 of each panel) into virtual px. */
export function tapToScene(nx: number, ny: number): { x: number; y: number } {
  const clampedX = Math.min(1, Math.max(0, nx));
  const clampedY = Math.min(1, Math.max(0, ny));
  return { x: clampedX * VW, y: clampedY * VH };
}

export function hitsDiff(diff: Diff, x: number, y: number): boolean {
  const b: Rect = diff.bbox;
  const inside =
    x >= b.x - TAP_TOLERANCE &&
    x <= b.x + b.w + TAP_TOLERANCE &&
    y >= b.y - TAP_TOLERANCE &&
    y <= b.y + b.h + TAP_TOLERANCE;
  if (inside) return true;
  return Math.hypot(x - diff.cx, y - diff.cy) <= TAP_TOLERANCE;
}

/**
 * Server-side tap resolution: only the first unfound diff under the finger is
 * returned, so the response can never enumerate the remaining answers.
 */
export function resolveTap(scene: Scene, found: string[], x: number, y: number): Diff | null {
  let best: Diff | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const diff of scene.diffs) {
    if (found.includes(diff.id)) continue;
    if (!hitsDiff(diff, x, y)) continue;
    const distance = Math.hypot(x - diff.cx, y - diff.cy);
    if (distance < bestDistance) {
      best = diff;
      bestDistance = distance;
    }
  }

  return best;
}

/** Next unfound diff in canonical order; drives pings and !hint. */
export function nextUnfound(scene: Scene, found: string[]): Diff | null {
  return scene.diffs.find((diff) => !found.includes(diff.id)) ?? null;
}

/** A 64px hot zone that always contains the target diff, off-centre by <= 12px. */
export function hotZoneFor(diff: Diff, seed: number): { x: number; y: number; r: number } {
  const angle = ((seed % 360) * Math.PI) / 180;
  const distance = 8 + ((seed * 7919) % 5);
  const x = Math.min(VW - 32, Math.max(32, diff.cx + Math.cos(angle) * distance));
  const y = Math.min(VH - 32, Math.max(32, diff.cy + Math.sin(angle) * distance));
  return { x: Math.round(x), y: Math.round(y), r: 32 };
}

export function zoneContains(zone: { x: number; y: number; r: number }, diff: Diff): boolean {
  return Math.hypot(zone.x - diff.cx, zone.y - diff.cy) <= zone.r;
}
