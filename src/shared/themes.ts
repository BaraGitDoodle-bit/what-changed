import type { ThemeId } from './types';

export interface Slot {
  id: string;
  /** Centre of the object in the 320x220 virtual space (diff-bearing slots). */
  cx: number;
  cy: number;
  /** Allowed kinds; one is picked per scene. */
  kinds: string[];
  z: number;
  /** Diff-bearing slots sit on a hex lattice so 96px separation is reachable. */
  diffable: boolean;
  /** Kinds eligible to appear next to this slot via the `add` op. */
  adds?: string[];
  /** Decor only: position jitter in px (diff slots never jitter). */
  jitter?: number;
}

export interface ThemePalette {
  sky: string;
  skyDeep: string;
  ground: string;
  groundDeep: string;
  ink: string;
  accent: string;
  night?: boolean;
}

export interface Theme {
  id: ThemeId;
  name: string;
  blurb: string;
  palette: ThemePalette;
  /** High-contrast recolour options, validated with CIE76 at generation. */
  tints: string[];
  slots: Slot[];
  /** Nearest landmark phrases used by the !hint reply. */
  places: { nw: string; ne: string; sw: string; se: string };
}

/**
 * Nine diff-bearing slots sit on a staggered lattice:
 *   y = 24 / 110 / 194, row offsets 0 / 48 / 0
 * with 96px same-row spacing and >=96px diagonals. Remaining slots are decor
 * (never differences) and may jitter.
 */
const PARK: Theme = {
  id: 'park',
  name: 'Park Afternoon',
  blurb: 'Same bench, same pond, same ducks. Mostly.',
  palette: {
    sky: '#B9E4D0',
    skyDeep: '#8FD3B4',
    ground: '#82CD74',
    groundDeep: '#6BB862',
    ink: '#20312B',
    accent: '#F2C14E',
  },
  tints: ['#FF5D8F', '#3E7BFA', '#FFC93C', '#E5484D', '#9B5DE5', '#F7F7F2'],
  places: {
    nw: 'top-left, over by the trees',
    ne: 'top-right, up near the sky',
    sw: 'bottom-left, by the path',
    se: 'bottom-right, near the pond edge',
  },
  slots: [
    // sky row
    { id: 'pa', cx: 44, cy: 24, kinds: ['balloon', 'cloud'], z: 8, diffable: true, adds: ['balloon'] },
    { id: 'pb', cx: 140, cy: 24, kinds: ['cloud'], z: 7, diffable: true, adds: ['kite'] },
    { id: 'pc', cx: 236, cy: 24, kinds: ['balloon', 'cloud'], z: 8, diffable: true, adds: ['balloon'] },
    // middle row
    { id: 'pd', cx: 92, cy: 110, kinds: ['tree'], z: 10, diffable: true },
    { id: 'pe', cx: 188, cy: 110, kinds: ['tree'], z: 11, diffable: true, adds: ['balloon'] },
    { id: 'pf', cx: 284, cy: 110, kinds: ['lamp'], z: 9, diffable: true },
    // ground row
    { id: 'pg', cx: 44, cy: 194, kinds: ['bench'], z: 20, diffable: true },
    { id: 'ph', cx: 140, cy: 194, kinds: ['duck', 'dog', 'flower'], z: 22, diffable: true, adds: ['flower'] },
    { id: 'pi', cx: 236, cy: 194, kinds: ['cat', 'squirrel', 'flower'], z: 22, diffable: true },
    // decor
    { id: 'pj', cx: 286, cy: 20, kinds: ['sun'], z: 1, diffable: false },
    { id: 'pk', cx: 252, cy: 156, kinds: ['bush'], z: 6, diffable: false, jitter: 6 },
    { id: 'pl', cx: 104, cy: 170, kinds: ['flower'], z: 12, diffable: false, jitter: 8 },
    { id: 'pm', cx: 300, cy: 164, kinds: ['trashcan'], z: 14, diffable: false },
    { id: 'pn', cx: 262, cy: 58, kinds: ['cloud'], z: 4, diffable: false, jitter: 6 },
    { id: 'po', cx: 20, cy: 140, kinds: ['sign'], z: 14, diffable: false },
    { id: 'pp', cx: 120, cy: 176, kinds: ['flower'], z: 12, diffable: false, jitter: 8 },
  ],
};

const SPACE: Theme = {
  id: 'space',
  name: 'Space Station',
  blurb: 'Deck nine, third shift. Nothing moved. Allegedly.',
  palette: {
    sky: '#141A38',
    skyDeep: '#0C1028',
    ground: '#2A3358',
    groundDeep: '#1E2547',
    ink: '#070A18',
    accent: '#7FD1F2',
    night: true,
  },
  tints: ['#FF5D8F', '#FFC93C', '#45D483', '#9B5DE5', '#59B7E8', '#F7F7F2'],
  places: {
    nw: 'top-left, near the viewport',
    ne: 'top-right, by the warning lights',
    sw: 'bottom-left, around the supply crates',
    se: 'bottom-right, by the control console',
  },
  slots: [
    { id: 'sa', cx: 44, cy: 24, kinds: ['star', 'satellite'], z: 8, diffable: true, adds: ['star'] },
    { id: 'sb', cx: 140, cy: 24, kinds: ['star', 'satellite'], z: 7, diffable: true, adds: ['star'] },
    { id: 'sc', cx: 236, cy: 24, kinds: ['star', 'satellite'], z: 8, diffable: true, adds: ['star'] },
    { id: 'sd', cx: 92, cy: 110, kinds: ['planet'], z: 9, diffable: true },
    { id: 'se', cx: 188, cy: 110, kinds: ['rocket', 'astronaut'], z: 12, diffable: true, adds: ['star'] },
    { id: 'sf', cx: 284, cy: 110, kinds: ['alien', 'porthole'], z: 11, diffable: true },
    { id: 'sg', cx: 44, cy: 194, kinds: ['crate'], z: 16, diffable: true },
    { id: 'sh', cx: 140, cy: 194, kinds: ['console', 'crate'], z: 16, diffable: true, adds: ['crate'] },
    { id: 'si', cx: 236, cy: 194, kinds: ['crate', 'flag'], z: 18, diffable: true },
    { id: 'sj', cx: 16, cy: 50, kinds: ['planet'], z: 1, diffable: false },
    { id: 'sk', cx: 280, cy: 168, kinds: ['planet'], z: 1, diffable: false },
    { id: 'sl', cx: 24, cy: 74, kinds: ['star'], z: 2, diffable: false, jitter: 6 },
    { id: 'sm', cx: 112, cy: 68, kinds: ['star'], z: 2, diffable: false, jitter: 6 },
    { id: 'sn', cx: 300, cy: 58, kinds: ['star'], z: 2, diffable: false, jitter: 6 },
    { id: 'so', cx: 160, cy: 162, kinds: ['star'], z: 2, diffable: false, jitter: 6 },
    { id: 'sp', cx: 60, cy: 168, kinds: ['star'], z: 2, diffable: false, jitter: 6 },
  ],
};

const BEACH: Theme = {
  id: 'beach',
  name: 'Beach Day',
  blurb: 'One umbrella, two towels, a suspicious number of gulls.',
  palette: {
    sky: '#BFE9F5',
    skyDeep: '#8FD6EA',
    ground: '#F2DFA8',
    groundDeep: '#E3C97F',
    ink: '#26343A',
    accent: '#FF8A5B',
  },
  tints: ['#FF5D8F', '#3E7BFA', '#FFC93C', '#E5484D', '#9B5DE5', '#F7F7F2'],
  places: {
    nw: 'top-left, over the water',
    ne: 'top-right, by the gulls',
    sw: 'bottom-left, near the towels',
    se: 'bottom-right, along the shoreline',
  },
  slots: [
    { id: 'ba', cx: 44, cy: 24, kinds: ['seagull'], z: 8, diffable: true, adds: ['seagull'] },
    { id: 'bb', cx: 140, cy: 24, kinds: ['cloud', 'seagull'], z: 7, diffable: true, adds: ['seagull'] },
    { id: 'bc', cx: 236, cy: 24, kinds: ['seagull', 'cloud'], z: 8, diffable: true, adds: ['seagull'] },
    { id: 'bd', cx: 92, cy: 110, kinds: ['palm'], z: 10, diffable: true },
    { id: 'be', cx: 188, cy: 110, kinds: ['umbrella'], z: 12, diffable: true, adds: ['ball'] },
    { id: 'bf', cx: 284, cy: 110, kinds: ['boat'], z: 9, diffable: true },
    { id: 'bg', cx: 44, cy: 194, kinds: ['towel'], z: 14, diffable: true },
    { id: 'bh', cx: 140, cy: 194, kinds: ['crab', 'bucket', 'starfish', 'ball'], z: 16, diffable: true, adds: ['bucket'] },
    { id: 'bi', cx: 236, cy: 194, kinds: ['shell', 'starfish', 'bucket', 'towel'], z: 16, diffable: true },
    { id: 'bj', cx: 286, cy: 18, kinds: ['sun'], z: 1, diffable: false },
    { id: 'bk', cx: 108, cy: 152, kinds: ['sandcastle'], z: 8, diffable: false },
    { id: 'bl', cx: 16, cy: 150, kinds: ['sign'], z: 10, diffable: false },
    { id: 'bm', cx: 200, cy: 50, kinds: ['seagull'], z: 6, diffable: false, jitter: 6 },
    { id: 'bn', cx: 64, cy: 168, kinds: ['ball'], z: 14, diffable: false, jitter: 4 },
    { id: 'bo', cx: 272, cy: 172, kinds: ['shell'], z: 12, diffable: false, jitter: 4 },
    { id: 'bp', cx: 120, cy: 70, kinds: ['cloud'], z: 4, diffable: false, jitter: 8 },
  ],
};

const MARKET: Theme = {
  id: 'market',
  name: 'Night Market',
  blurb: 'Three stalls, a hundred lanterns, one cat with no alibi.',
  palette: {
    sky: '#2A2140',
    skyDeep: '#1B1530',
    ground: '#3A3350',
    groundDeep: '#2B2540',
    ink: '#120D1F',
    accent: '#FFB36B',
    night: true,
  },
  tints: ['#FF5D8F', '#FFC93C', '#45D483', '#3E7BFA', '#F7F7F2', '#FF9F45'],
  places: {
    nw: 'top-left, above the first stall',
    ne: 'top-right, under the lantern strings',
    sw: 'bottom-left, by the crates',
    se: 'bottom-right, near the food bowls',
  },
  slots: [
    { id: 'na', cx: 44, cy: 24, kinds: ['lantern'], z: 8, diffable: true, adds: ['lantern'] },
    { id: 'nb', cx: 140, cy: 24, kinds: ['lantern'], z: 7, diffable: true, adds: ['lantern'] },
    { id: 'nc', cx: 236, cy: 24, kinds: ['lantern'], z: 8, diffable: true, adds: ['lantern'] },
    { id: 'nd', cx: 92, cy: 110, kinds: ['stall'], z: 12, diffable: true },
    { id: 'ne', cx: 188, cy: 110, kinds: ['stall'], z: 12, diffable: true, adds: ['lantern'] },
    { id: 'nf', cx: 284, cy: 110, kinds: ['streetlamp', 'lantern'], z: 14, diffable: true },
    { id: 'ng', cx: 44, cy: 194, kinds: ['crate', 'stool'], z: 18, diffable: true },
    { id: 'nh', cx: 140, cy: 194, kinds: ['stool', 'bananas'], z: 18, diffable: true, adds: ['bananas'] },
    { id: 'ni', cx: 236, cy: 194, kinds: ['bowl', 'cat', 'crate'], z: 18, diffable: true },
    { id: 'nj', cx: 20, cy: 96, kinds: ['streetlamp'], z: 14, diffable: false },
    { id: 'nk', cx: 76, cy: 162, kinds: ['crate'], z: 16, diffable: false },
    { id: 'nl', cx: 252, cy: 158, kinds: ['bananas'], z: 16, diffable: false, jitter: 4 },
    { id: 'nm', cx: 110, cy: 148, kinds: ['sign'], z: 18, diffable: false },
    { id: 'nn', cx: 186, cy: 158, kinds: ['bowl'], z: 16, diffable: false, jitter: 4 },
    { id: 'no', cx: 300, cy: 164, kinds: ['lantern'], z: 16, diffable: false },
    { id: 'np', cx: 300, cy: 60, kinds: ['lantern'], z: 6, diffable: false },
  ],
};

export const THEMES: Record<ThemeId, Theme> = {
  park: PARK,
  space: SPACE,
  beach: BEACH,
  market: MARKET,
};

export const THEME_ORDER: ThemeId[] = ['park', 'space', 'beach', 'market'];

export function themeForDate(dayIndex: number): Theme {
  return THEMES[THEME_ORDER[((dayIndex % THEME_ORDER.length) + THEME_ORDER.length) % THEME_ORDER.length]!]!;
}
