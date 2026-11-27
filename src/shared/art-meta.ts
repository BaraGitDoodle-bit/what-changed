/**
 * Art catalogue metadata, shared by the server (geometry, colour distance) and
 * the client (SVG renderers). Sizes are in virtual scene px (320x220 space).
 */

export interface ArtMeta {
  label: string;
  w: number;
  h: number;
  /** Primary fill colour; recolour distances are measured from this. */
  primary: string;
  variants: string[];
  flippable?: boolean;
  scalable?: boolean;
  nudgeable?: boolean;
}

export const ART: Record<string, ArtMeta> = {
  // ---- park / shared -------------------------------------------------------
  tree: {
    label: 'tree',
    w: 64,
    h: 86,
    primary: '#3E9B5F',
    variants: ['round', 'pine'],
    flippable: true,
    scalable: true,
  },
  bush: {
    label: 'bush',
    w: 40,
    h: 24,
    primary: '#4CAF6D',
    variants: ['round', 'berry'],
    scalable: true,
  },
  bench: {
    label: 'bench',
    w: 62,
    h: 30,
    primary: '#B5652E',
    variants: ['wood', 'stone'],
    flippable: true,
    scalable: true,
  },
  duck: {
    label: 'duck',
    w: 24,
    h: 20,
    primary: '#F2C14E',
    variants: ['mallard', 'white'],
    flippable: true,
  },
  squirrel: {
    label: 'squirrel',
    w: 22,
    h: 20,
    primary: '#B5652E',
    variants: ['red', 'grey'],
    flippable: true,
  },
  flower: {
    label: 'flower',
    w: 16,
    h: 22,
    primary: '#FF6B9A',
    variants: ['tulip', 'daisy'],
    scalable: true,
  },
  sign: {
    label: 'sign',
    w: 30,
    h: 26,
    primary: '#E0A33E',
    variants: ['arrow', 'round'],
    flippable: true,
  },
  kite: {
    label: 'kite',
    w: 26,
    h: 34,
    primary: '#E5484D',
    variants: ['diamond', 'bird'],
    nudgeable: true,
  },
  trashcan: {
    label: 'bin',
    w: 20,
    h: 26,
    primary: '#6B7C8A',
    variants: ['green', 'grey'],
  },
  lamp: {
    label: 'park lamp',
    w: 18,
    h: 58,
    primary: '#5B6B7A',
    variants: ['park', 'street'],
  },
  cloud: {
    label: 'cloud',
    w: 54,
    h: 22,
    primary: '#FFFFFF',
    variants: ['puff', 'flat'],
    nudgeable: true,
  },
  balloon: {
    label: 'balloon',
    w: 20,
    h: 28,
    primary: '#FF5D8F',
    variants: ['round', 'heart'],
    nudgeable: true,
  },
  sun: {
    label: 'sun',
    w: 34,
    h: 34,
    primary: '#FFC93C',
    variants: ['plain', 'rays'],
  },
  dog: {
    label: 'dog',
    w: 34,
    h: 26,
    primary: '#C98A4B',
    variants: ['retriever', 'pug'],
    flippable: true,
  },
  cat: {
    label: 'cat',
    w: 28,
    h: 24,
    primary: '#6B6B6B',
    variants: ['tabby', 'black'],
    flippable: true,
  },

  // ---- space ---------------------------------------------------------------
  planet: {
    label: 'planet',
    w: 46,
    h: 46,
    primary: '#B07CFF',
    variants: ['ringed', 'plain'],
    nudgeable: true,
  },
  star: {
    label: 'star',
    w: 18,
    h: 18,
    primary: '#FFD86B',
    variants: ['five', 'four'],
  },
  rocket: {
    label: 'rocket',
    w: 34,
    h: 54,
    primary: '#F2F4F7',
    variants: ['red', 'blue'],
    flippable: true,
  },
  satellite: {
    label: 'satellite',
    w: 30,
    h: 24,
    primary: '#C7D2E0',
    variants: ['dish', 'panel'],
    nudgeable: true,
  },
  alien: {
    label: 'alien',
    w: 26,
    h: 30,
    primary: '#5BD68A',
    variants: ['green', 'purple'],
    flippable: true,
  },
  astronaut: {
    label: 'astronaut',
    w: 28,
    h: 40,
    primary: '#F2F4F7',
    variants: ['visor', 'pack'],
    flippable: true,
  },
  porthole: {
    label: 'porthole',
    w: 26,
    h: 26,
    primary: '#7FD1F2',
    variants: ['round', 'square'],
  },
  console: {
    label: 'console',
    w: 40,
    h: 28,
    primary: '#4A5A7A',
    variants: ['screen', 'dials'],
  },
  crate: {
    label: 'crate',
    w: 28,
    h: 24,
    primary: '#A9713F',
    variants: ['wood', 'metal'],
    scalable: true,
  },
  flag: {
    label: 'flag',
    w: 22,
    h: 30,
    primary: '#E5484D',
    variants: ['red', 'checker'],
    flippable: true,
  },

  // ---- beach ---------------------------------------------------------------
  umbrella: {
    label: 'beach umbrella',
    w: 46,
    h: 44,
    primary: '#FF5D8F',
    variants: ['striped', 'plain'],
    flippable: true,
  },
  towel: {
    label: 'towel',
    w: 50,
    h: 22,
    primary: '#3E7BFA',
    variants: ['stripe', 'plain'],
  },
  sandcastle: {
    label: 'sandcastle',
    w: 46,
    h: 36,
    primary: '#E8C97A',
    variants: ['tower', 'wall'],
    scalable: true,
  },
  crab: {
    label: 'crab',
    w: 26,
    h: 18,
    primary: '#F06A4A',
    variants: ['red', 'blue'],
    flippable: true,
  },
  starfish: {
    label: 'starfish',
    w: 22,
    h: 20,
    primary: '#FF8A5B',
    variants: ['five', 'four'],
  },
  seagull: {
    label: 'seagull',
    w: 28,
    h: 18,
    primary: '#F7F7F2',
    variants: ['glide', 'perch'],
    flippable: true,
    nudgeable: true,
  },
  shell: {
    label: 'shell',
    w: 20,
    h: 18,
    primary: '#FFD1C1',
    variants: ['scallop', 'spiral'],
  },
  boat: {
    label: 'boat',
    w: 40,
    h: 24,
    primary: '#3E7BFA',
    variants: ['sail', 'row'],
    flippable: true,
  },
  palm: {
    label: 'palm tree',
    w: 44,
    h: 60,
    primary: '#3E9B5F',
    variants: ['tall', 'bushy'],
    flippable: true,
  },
  bucket: {
    label: 'bucket',
    w: 20,
    h: 20,
    primary: '#FFC93C',
    variants: ['round', 'square'],
  },
  ball: {
    label: 'beach ball',
    w: 20,
    h: 20,
    primary: '#FF5D8F',
    variants: ['beach', 'plain'],
  },

  // ---- night market --------------------------------------------------------
  stall: {
    label: 'stall',
    w: 70,
    h: 60,
    primary: '#E5484D',
    variants: ['red', 'green', 'blue'],
    scalable: true,
  },
  lantern: {
    label: 'lantern',
    w: 18,
    h: 26,
    primary: '#FF9F45',
    variants: ['red', 'blue'],
    nudgeable: true,
  },
  stool: {
    label: 'stool',
    w: 24,
    h: 22,
    primary: '#A9713F',
    variants: ['wood', 'cushion'],
  },
  bananas: {
    label: 'bananas',
    w: 26,
    h: 18,
    primary: '#FFC93C',
    variants: ['bunch', 'single'],
  },
  bowl: {
    label: 'bowl',
    w: 36,
    h: 18,
    primary: '#3E7BFA',
    variants: ['bowl', 'basket'],
  },
  streetlamp: {
    label: 'street lamp',
    w: 18,
    h: 58,
    primary: '#4A4A5A',
    variants: ['double', 'single'],
  },
};

export const ART_KINDS = Object.keys(ART);

export function artFor(kind: string): ArtMeta {
  const meta = ART[kind];
  if (!meta) throw new Error(`Unknown art kind: ${kind}`);
  return meta;
}
