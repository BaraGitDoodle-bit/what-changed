import { artFor } from '../../shared/art-meta';
import { colourName, deltaE } from '../../shared/color';
import { dayNumberFor, dayOfYear, weekdayIndex } from '../../shared/date';
import { planForWeekday } from '../../shared/difficulty';
import { rngFor, type Rng } from '../../shared/rng';
import { themeForDate, type Slot, type Theme } from '../../shared/themes';
import {
  MIN_AREA,
  MIN_DELTA_E,
  MIN_DIFF_SEPARATION,
  MIN_SIDE,
  SAFE_INSET,
  TAP_TOLERANCE,
  VH,
  VW,
  type Diff,
  type OpKind,
  type PlacedObject,
  type PublicScene,
  type Rect,
  type Scene,
} from '../../shared/types';

export interface GenerateOptions {
  date: string;
  installId: string;
  salt: string;
  /** Rolling 7-day median solve time, if the subreddit has history. */
  recentMedianMs?: number | null;
}

interface Candidate {
  op: OpKind;
  slotId: string;
  objectId: string;
  beforeObject: PlacedObject | null;
  afterObject: PlacedObject;
  bbox: Rect;
  cx: number;
  cy: number;
  anchorEligible: boolean;
  label: string;
}

const MAX_ATTEMPTS = 120;

export function defaultParMs(diffCount: number): number {
  return 38_000 + diffCount * 5_000;
}

export function computeParMs(recentMedianMs: number | null | undefined, diffCount: number): number {
  const base = recentMedianMs && recentMedianMs > 0 ? recentMedianMs : defaultParMs(diffCount);
  return Math.round(base + Math.max(0, diffCount - 5) * 2_000);
}

function rect(obj: PlacedObject): Rect {
  return { x: obj.x, y: obj.y, w: obj.w, h: obj.h };
}

function unionRect(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    w: Math.max(a.x + a.w, b.x + b.w) - x,
    h: Math.max(a.y + a.h, b.y + b.h) - y,
  };
}

function centreOf(r: Rect): { cx: number; cy: number } {
  return { cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
}

export function insideSafe(r: Rect): boolean {
  return (
    r.x >= SAFE_INSET &&
    r.y >= SAFE_INSET &&
    r.x + r.w <= VW - SAFE_INSET &&
    r.y + r.h <= VH - SAFE_INSET
  );
}

export function hasMinFootprint(r: Rect): boolean {
  return r.w >= MIN_SIDE && r.h >= MIN_SIDE && r.w * r.h >= MIN_AREA;
}

export function diffDistance(a: { cx: number; cy: number }, b: { cx: number; cy: number }): number {
  return Math.hypot(a.cx - b.cx, a.cy - b.cy);
}

export function rectsIntersect(a: Rect, b: Rect, pad = 0): boolean {
  return !(
    a.x + a.w + pad <= b.x ||
    b.x + b.w + pad <= a.x ||
    a.y + a.h + pad <= b.y ||
    b.y + b.h + pad <= a.y
  );
}

function nearCentre(r: Rect): boolean {
  const { cx, cy } = centreOf(r);
  return Math.abs(cx - VW / 2) <= 85 && Math.abs(cy - VH / 2) <= 75;
}

function primaryFill(obj: PlacedObject): string {
  return obj.tint ?? artFor(obj.kind).primary;
}

function placedObjects(theme: Theme, rng: Rng): { before: PlacedObject[]; slotOf: Map<string, Slot> } {
  const before: PlacedObject[] = [];
  const slotOf = new Map<string, Slot>();

  for (const slot of theme.slots) {
    const kind = rng.pick(slot.kinds);
    const meta = artFor(kind);
    const variant = rng.pick(meta.variants);
    const jitter = slot.diffable ? 0 : (slot.jitter ?? 0);
    const jx = jitter ? rng.intRange(-jitter, jitter) : 0;
    const jy = jitter ? rng.intRange(-jitter, jitter) : 0;
    const id = `o-${slot.id}`;
    before.push({
      id,
      kind,
      variant,
      x: Math.round(slot.cx - meta.w / 2 + jx),
      y: Math.round(slot.cy - meta.h / 2 + jy),
      w: meta.w,
      h: meta.h,
      z: slot.z,
      flip: false,
    });
    slotOf.set(id, slot);
  }

  before.sort((a, b) => a.z - b.z || a.id.localeCompare(b.id));
  return { before, slotOf };
}

function freeAddPlacement(
  base: PlacedObject,
  addW: number,
  addH: number,
  rng: Rng,
): { x: number; y: number } | null {
  const options: Array<{ x: number; y: number }> = [
    { x: base.x + base.w + 6, y: base.y + base.h - addH },
    { x: base.x - addW - 6, y: base.y + base.h - addH },
    { x: base.x + base.w / 2 - addW / 2, y: base.y - addH - 6 },
    { x: base.x + base.w / 2 - addW / 2, y: base.y + base.h + 6 },
  ];
  const shuffled = rng.shuffle(options);
  for (const option of shuffled) {
    const candidate = {
      x: Math.round(option.x),
      y: Math.round(option.y),
      w: addW,
      h: addH,
    };
    if (insideSafe(candidate)) return { x: candidate.x, y: candidate.y };
  }
  return null;
}

function pickTint(rng: Rng, theme: Theme, currentFill: string): string | null {
  const options = rng.shuffle(theme.tints);
  for (const tint of options) {
    if (deltaE(currentFill, tint) >= MIN_DELTA_E) return tint;
  }
  return null;
}

function candidatesForSlot(
  obj: PlacedObject,
  slot: Slot,
  theme: Theme,
  rng: Rng,
): Candidate[] {
  const meta = artFor(obj.kind);
  const out: Candidate[] = [];
  const baseRect = rect(obj);
  const base = { ...centreOf(baseRect), objectId: obj.id, slotId: slot.id, beforeObject: obj };

  const push = (candidate: Candidate) => {
    if (!insideSafe(candidate.bbox) || !hasMinFootprint(candidate.bbox)) return;
    out.push(candidate);
  };

  // remove
  push({
    ...base,
    op: 'remove',
    afterObject: obj,
    bbox: baseRect,
    anchorEligible: false,
    label: `The ${meta.label} is gone`,
  });

  // recolor
  const tint = pickTint(rng, theme, primaryFill(obj));
  if (tint) {
    const after = { ...obj, tint };
    push({
      ...base,
      op: 'recolor',
      afterObject: after,
      bbox: baseRect,
      anchorEligible: false,
      label: `The ${meta.label} turned ${colourName(tint)}`,
    });
  }

  // flip
  if (meta.flippable) {
    push({
      ...base,
      op: 'flip',
      afterObject: { ...obj, flip: !obj.flip },
      bbox: baseRect,
      anchorEligible: false,
      label: `The ${meta.label} faces the other way`,
    });
  }

  // scale
  if (meta.scalable) {
    const factor = 1.45;
    const w = Math.round(obj.w * factor);
    const h = Math.round(obj.h * factor);
    const after: PlacedObject = {
      ...obj,
      w,
      h,
      x: Math.round(obj.x + (obj.w - w) / 2),
      y: Math.round(obj.y + (obj.h - h)),
    };
    const bbox = unionRect(baseRect, rect(after));
    push({
      ...base,
      op: 'scale',
      afterObject: after,
      bbox,
      cx: centreOf(bbox).cx,
      cy: centreOf(bbox).cy,
      anchorEligible: false,
      label: `The ${meta.label} is much bigger`,
    });
  }

  // nudge
  if (meta.nudgeable) {
    const dir = rng.chance(0.5) ? -1 : 1;
    const dx = 18 * dir;
    const dy = rng.chance(0.35) ? (rng.chance(0.5) ? -12 : 12) : 0;
    const after = { ...obj, x: obj.x + dx, y: obj.y + dy };
    const bbox = unionRect(baseRect, rect(after));
    push({
      ...base,
      op: 'nudge',
      afterObject: after,
      bbox,
      cx: centreOf(bbox).cx,
      cy: centreOf(bbox).cy,
      anchorEligible: false,
      label: `The ${meta.label} drifted over`,
    });
  }

  // swapVariant
  const otherVariants = meta.variants.filter((v) => v !== obj.variant);
  if (otherVariants.length > 0) {
    const variant = rng.pick(otherVariants);
    push({
      ...base,
      op: 'swapVariant',
      afterObject: { ...obj, variant },
      bbox: baseRect,
      anchorEligible: false,
      label: `The ${meta.label} changed into its ${variant} form`,
    });
  }

  // add
  if (slot.adds && slot.adds.length > 0) {
    const addKind = rng.pick(slot.adds);
    const addMeta = artFor(addKind);
    const pos = freeAddPlacement(obj, addMeta.w, addMeta.h, rng);
    if (pos) {
      const added: PlacedObject = {
        id: `a-${slot.id}`,
        kind: addKind,
        variant: rng.pick(addMeta.variants),
        x: pos.x,
        y: pos.y,
        w: addMeta.w,
        h: addMeta.h,
        z: obj.z + 1,
        flip: false,
      };
      const bbox = rect(added);
      out.push({
        op: 'add',
        slotId: slot.id,
        objectId: added.id,
        beforeObject: null,
        afterObject: added,
        bbox,
        ...centreOf(bbox),
        anchorEligible: false,
        label: `A ${addMeta.label} appeared`,
      });
    }
  }

  // Anchor eligibility is judged on the final bbox: big, obvious, near centre.
  for (const candidate of out) {
    const area = candidate.bbox.w * candidate.bbox.h;
    const obvious = candidate.op === 'remove' || candidate.op === 'add' || candidate.op === 'recolor' || candidate.op === 'scale';
    candidate.anchorEligible =
      obvious && area >= 1_200 && nearCentre(candidate.bbox) && candidate.bbox.w >= 30;
  }

  return out;
}

function pickAnchor(candidates: Candidate[], rng: Rng): Candidate | null {
  const pool = candidates.filter((c) => c.anchorEligible);
  if (pool.length === 0) return null;
  return rng.weightedOrder(pool, () => 1)[0] ?? null;
}

function chooseDifferences(
  before: PlacedObject[],
  slotOf: Map<string, Slot>,
  theme: Theme,
  plan: ReturnType<typeof planForWeekday>,
  rng: Rng,
): Candidate[] | null {
  const pool: Candidate[] = [];
  for (const obj of before) {
    const slot = slotOf.get(obj.id);
    if (!slot || !slot.diffable) continue;
    pool.push(...candidatesForSlot(obj, slot, theme, rng));
  }

  const anchor = pickAnchor(pool, rng);
  if (!anchor) return null;

  const picked: Candidate[] = [anchor];
  const usedObjects = new Set<string>([anchor.objectId]);
  const usedSlots = new Set<string>([anchor.slotId]);

  const rest = rng.weightedOrder(
    pool.filter(
      (c) =>
        c !== anchor &&
        plan.ops.includes(c.op) &&
        !usedObjects.has(c.objectId) &&
        !usedSlots.has(c.slotId),
    ),
    (c) => plan.weights[c.op] ?? 1,
  );

  for (const candidate of rest) {
    if (picked.length >= plan.count) break;
    if (usedObjects.has(candidate.objectId) || usedSlots.has(candidate.slotId)) continue;
    const conflict = picked.some(
      (existing) =>
        diffDistance(existing, candidate) < MIN_DIFF_SEPARATION ||
        rectsIntersect(existing.bbox, candidate.bbox, 2),
    );
    if (conflict) continue;
    picked.push(candidate);
    usedObjects.add(candidate.objectId);
    usedSlots.add(candidate.slotId);
  }

  if (picked.length < plan.count) return null;

  // Anchor first so it is always the opening freebie; the rest keep their
  // weighted order (which is deterministic for this rng stream).
  return picked.slice(0, plan.count);
}

function buildScene(
  options: GenerateOptions,
  theme: Theme,
  plan: ReturnType<typeof planForWeekday>,
  before: PlacedObject[],
  picks: Candidate[],
): Scene {
  const byId = new Map(before.map((obj) => [obj.id, obj]));
  const removed = new Set<string>();
  const added: PlacedObject[] = [];
  const patched = new Map<string, PlacedObject>();

  picks.forEach((pick, index) => {
    if (pick.op === 'remove') {
      removed.add(pick.objectId);
    } else if (pick.op === 'add') {
      added.push(pick.afterObject);
    } else {
      patched.set(pick.objectId, { ...byId.get(pick.objectId)!, ...pick.afterObject });
    }
  });

  const after = before
    .filter((obj) => !removed.has(obj.id))
    .map((obj) => patched.get(obj.id) ?? obj)
    .concat(added)
    .sort((a, b) => a.z - b.z || a.id.localeCompare(b.id));

  const diffs: Diff[] = picks.map((pick, index) => ({
    id: `d${index + 1}`,
    op: pick.op,
    slotId: pick.slotId,
    objectId: pick.objectId,
    bbox: pick.bbox,
    cx: Math.round(pick.cx * 10) / 10,
    cy: Math.round(pick.cy * 10) / 10,
    radius: Math.max(TAP_TOLERANCE, Math.min(pick.bbox.w, pick.bbox.h) / 2 + 10),
    anchor: index === 0,
    label: pick.label,
  }));

  return {
    v: 1,
    date: options.date,
    dayNumber: dayNumberFor(options.date),
    theme: theme.id,
    themeName: theme.name,
    width: VW,
    height: VH,
    before,
    after,
    diffs,
    parMs: computeParMs(options.recentMedianMs, diffs.length),
  };
}

/**
 * Generate the frozen daily scene. Deterministic for (date, installId, salt).
 * Throws only if 120 independent compositions all fail validation, which the
 * 200-day generation test asserts never happens.
 */
export function generateScene(options: GenerateOptions): Scene {
  const plan = planForWeekday(weekdayIndex(options.date));
  const theme = themeForDate(dayOfYear(options.date));

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = rngFor(options.date, options.installId, options.salt, attempt);
    const { before, slotOf } = placedObjects(theme, rng);
    const picks = chooseDifferences(before, slotOf, theme, plan, rng);
    if (!picks) continue;
    const scene = buildScene(options, theme, plan, before, picks);
    const issues = validateScene(scene, plan.count);
    if (issues.length === 0) return scene;
  }

  throw new Error(`Could not generate a fair scene for ${options.date}`);
}

/** Strip the answer key before anything crosses the wire to a browser. */
export function toPublicScene(scene: Scene): PublicScene {
  return {
    v: 1,
    date: scene.date,
    dayNumber: scene.dayNumber,
    theme: scene.theme,
    themeName: scene.themeName,
    width: scene.width,
    height: scene.height,
    before: scene.before,
    after: scene.after,
    total: scene.diffs.length,
    parMs: scene.parMs,
  };
}

/**
 * Fairness gate. Failures are strings so tests and the scene inspector can
 * explain exactly which rule broke.
 */
export function validateScene(scene: Scene, expectedCount?: number): string[] {
  const issues: string[] = [];
  const { diffs, before, after } = scene;
  const byBefore = new Map(before.map((o) => [o.id, o]));
  const byAfter = new Map(after.map((o) => [o.id, o]));

  if (expectedCount !== undefined && diffs.length !== expectedCount) {
    issues.push(`expected ${expectedCount} differences, found ${diffs.length}`);
  }

  const anchors = diffs.filter((d) => d.anchor);
  if (anchors.length !== 1) issues.push(`expected exactly one anchor, found ${anchors.length}`);

  for (const diff of diffs) {
    const { bbox } = diff;
    if (!insideSafe(bbox)) issues.push(`${diff.id} touches a panel edge`);
    if (!hasMinFootprint(bbox)) issues.push(`${diff.id} is below the minimum footprint`);
    if (!diff.label) issues.push(`${diff.id} has no reveal label`);

    if (diff.anchor) {
      const area = bbox.w * bbox.h;
      if (area < 1_200) issues.push('anchor difference is too small');
      if (!nearCentre(bbox)) issues.push('anchor difference is not near the centre');
      if (
        diff.op !== 'remove' &&
        diff.op !== 'add' &&
        diff.op !== 'recolor' &&
        diff.op !== 'scale'
      ) {
        issues.push('anchor difference is not an obvious op');
      }
    }

    // Solvable by construction: every diff must be an applied op on a placed
    // object, with a bbox that covers the real change.
    if (diff.op === 'remove') {
      if (!byBefore.has(diff.objectId)) issues.push(`${diff.id} removes a missing object`);
      if (byAfter.has(diff.objectId)) issues.push(`${diff.id} removes but still renders after`);
    } else if (diff.op === 'add') {
      if (byBefore.has(diff.objectId)) issues.push(`${diff.id} adds an existing object`);
      if (!byAfter.has(diff.objectId)) issues.push(`${diff.id} adds but object is missing after`);
    } else {
      const b = byBefore.get(diff.objectId);
      const a = byAfter.get(diff.objectId);
      if (!b || !a) {
        issues.push(`${diff.id} references an object missing from a panel`);
      } else {
        const changed = changedProps(b, a);
        const allowed = allowedProps(diff.op);
        if (!changed.includes(expectedProp(diff.op))) {
          issues.push(`${diff.id} op ${diff.op} does not explain the change`);
        } else if (!changed.every((prop) => allowed.includes(prop))) {
          issues.push(`${diff.id} changes unexpected properties (${changed.join(', ')})`);
        }
        const union = unionRect(rect(b), rect(a));
        if (!rectCovers(diff.bbox, union)) issues.push(`${diff.id} bbox misses the changed region`);
        if (diff.op === 'recolor' && deltaE(primaryFill(b), primaryFill(a)) < MIN_DELTA_E) {
          issues.push(`${diff.id} recolour is below the colour-distance floor`);
        }
      }
    }

    if (diff.op === 'add') {
      const a = byAfter.get(diff.objectId);
      if (a && !rectCovers(diff.bbox, rect(a))) issues.push(`${diff.id} bbox misses the added object`);
    }
  }

  for (let i = 0; i < diffs.length; i++) {
    for (let j = i + 1; j < diffs.length; j++) {
      const a = diffs[i]!;
      const b = diffs[j]!;
      if (diffDistance(a, b) < MIN_DIFF_SEPARATION) {
        issues.push(`${a.id} and ${b.id} are closer than ${MIN_DIFF_SEPARATION}px`);
      }
      if (rectsIntersect(a.bbox, b.bbox, 2)) {
        issues.push(`${a.id} and ${b.id} have overlapping regions`);
      }
    }
  }

  return issues;
}

function rectCovers(outer: Rect, inner: Rect): boolean {
  return (
    outer.x <= inner.x + 0.01 &&
    outer.y <= inner.y + 0.01 &&
    outer.x + outer.w >= inner.x + inner.w - 0.01 &&
    outer.y + outer.h >= inner.y + inner.h - 0.01
  );
}

function changedProps(before: PlacedObject, after: PlacedObject): string[] {
  const changed: string[] = [];
  if (before.variant !== after.variant) changed.push('variant');
  if ((before.tint ?? '') !== (after.tint ?? '')) changed.push('tint');
  if (before.flip !== after.flip) changed.push('flip');
  if (before.x !== after.x || before.y !== after.y) changed.push('position');
  if (before.w !== after.w || before.h !== after.h) changed.push('size');
  return changed;
}

function allowedProps(op: OpKind): string[] {
  switch (op) {
    case 'recolor':
      return ['tint'];
    case 'flip':
      return ['flip'];
    case 'scale':
      return ['size', 'position'];
    case 'swapVariant':
      return ['variant'];
    case 'nudge':
      return ['position'];
    default:
      return [];
  }
}

function expectedProp(op: OpKind): string {
  switch (op) {
    case 'recolor':
      return 'tint';
    case 'flip':
      return 'flip';
    case 'scale':
      return 'size';
    case 'swapVariant':
      return 'variant';
    case 'nudge':
      return 'position';
    default:
      return '';
  }
}

/** Small helper for tests / inspector: a stable identity for a scene. */
export function sceneSignature(scene: Scene): string {
  return scene.diffs
    .map((d) => `${d.op}:${d.objectId}@${Math.round(d.cx)},${Math.round(d.cy)}`)
    .join('|');
}
