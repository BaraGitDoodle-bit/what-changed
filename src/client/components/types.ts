import type { Rect } from '../../shared/types';

/** What the client knows about a found difference: its ring and nothing else. */
export interface SceneRing {
  id: string;
  bbox: Rect;
}
