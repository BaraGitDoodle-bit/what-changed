import type { ComponentType, ReactNode } from 'react';
import { ART } from '../../shared/art-meta';
import type { PlacedObject } from '../../shared/types';
import type { ArtProps } from './types';
import {
  Balloon,
  Bench,
  Bush,
  Cat,
  Cloud,
  Dog,
  Duck,
  Flower,
  Kite,
  Lamp,
  Sign,
  Squirrel,
  Sun,
  Trashcan,
  Tree,
} from './common';
import {
  Alien,
  Astronaut,
  Console,
  Crate,
  Flag,
  Planet,
  Porthole,
  Rocket,
  Satellite,
  StarShape,
} from './space';
import {
  BallArt,
  Boat,
  Bucket,
  Crab,
  Palm,
  Sandcastle,
  Seagull,
  Shell,
  Starfish,
  Towel,
  Umbrella,
} from './beach';
import { Bananas, Bowl, Lantern, Stall, Stool, Streetlamp } from './market';

export const RENDERERS: Record<string, ComponentType<ArtProps>> = {
  tree: Tree,
  bush: Bush,
  bench: Bench,
  duck: Duck,
  squirrel: Squirrel,
  flower: Flower,
  sign: Sign,
  kite: Kite,
  trashcan: Trashcan,
  lamp: Lamp,
  cloud: Cloud,
  balloon: Balloon,
  sun: Sun,
  dog: Dog,
  cat: Cat,
  planet: Planet,
  star: StarShape,
  rocket: Rocket,
  satellite: Satellite,
  alien: Alien,
  astronaut: Astronaut,
  porthole: Porthole,
  console: Console,
  crate: Crate,
  flag: Flag,
  umbrella: Umbrella,
  towel: Towel,
  sandcastle: Sandcastle,
  crab: Crab,
  starfish: Starfish,
  seagull: Seagull,
  shell: Shell,
  boat: Boat,
  palm: Palm,
  bucket: Bucket,
  ball: BallArt,
  stall: Stall,
  lantern: Lantern,
  stool: Stool,
  bananas: Bananas,
  bowl: Bowl,
  streetlamp: Streetlamp,
};

export function ObjectArt({ object, ink }: { object: PlacedObject; ink: string }): ReactNode {
  const Renderer = RENDERERS[object.kind];
  const meta = ART[object.kind];
  if (!Renderer || !meta) return null;

  const fill = object.tint ?? meta.primary;
  return (
    <g
      transform={`translate(${object.x} ${object.y})${
        object.flip ? ` translate(${object.w} 0) scale(-1 1)` : ''
      }`}
      stroke={ink}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Renderer
        w={object.w}
        h={object.h}
        variant={object.variant}
        fill={fill}
        ink={ink}
      />
    </g>
  );
}

export function artKinds(): string[] {
  return Object.keys(RENDERERS);
}
