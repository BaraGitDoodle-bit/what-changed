export interface ArtProps {
  /** Rendered size in virtual px; kept for renderers that scale details. */
  w: number;
  h: number;
  variant: string;
  /** Primary fill, already resolved from tint or catalogue colour. */
  fill: string;
  ink: string;
}

export const INK_WIDTH = 2.5;
