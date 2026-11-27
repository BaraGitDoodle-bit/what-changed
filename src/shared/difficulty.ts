import type { DayPlan, OpKind } from './types';
import { ALL_OPS } from './types';

const OBVIOUS: OpKind[] = ['remove', 'add', 'recolor', 'scale'];
const MID: OpKind[] = ['swapVariant', 'flip'];
const SUBTLE: OpKind[] = ['nudge'];

function weights(obvious: number, mid: number, subtle: number): Record<OpKind, number> {
  return {
    remove: obvious,
    add: obvious,
    recolor: obvious,
    scale: obvious,
    swapVariant: mid,
    flip: mid,
    nudge: subtle,
  };
}

/**
 * Weekday curve: Monday is a warm-up of obvious changes, Friday is the same
 * count but subtler ops, Saturday adds one, Sunday is the 7-change Sweep.
 */
const PLANS: Record<number, DayPlan> = {
  1: {
    label: 'Monday warm-up',
    count: 5,
    ops: [...OBVIOUS, 'swapVariant'],
    weights: weights(4, 1, 0.25),
    subtle: false,
  },
  2: {
    label: 'Tuesday',
    count: 5,
    ops: [...OBVIOUS, 'swapVariant', 'flip'],
    weights: weights(3, 1.4, 0.25),
    subtle: false,
  },
  3: {
    label: 'Wednesday',
    count: 5,
    ops: [...OBVIOUS, 'swapVariant', 'flip', 'nudge'],
    weights: weights(2.4, 1.6, 0.8),
    subtle: false,
  },
  4: {
    label: 'Thursday',
    count: 5,
    ops: [...ALL_OPS],
    weights: weights(1.8, 2, 1.2),
    subtle: true,
  },
  5: {
    label: 'Friday subtle',
    count: 5,
    ops: [...ALL_OPS],
    weights: weights(1.1, 2.8, 2.2),
    subtle: true,
  },
  6: {
    label: 'Saturday six',
    count: 6,
    ops: [...ALL_OPS],
    weights: weights(1.3, 2.4, 1.8),
    subtle: true,
  },
  0: {
    label: 'Sunday Sweep',
    count: 7,
    ops: [...ALL_OPS],
    weights: weights(1.2, 2.2, 2),
    subtle: true,
  },
};

export function planForWeekday(weekday: number): DayPlan {
  return PLANS[weekday] ?? PLANS[1]!;
}
