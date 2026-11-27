import type { ArtProps } from './types';

export function Umbrella({ variant, fill }: ArtProps) {
  const striped = variant === 'striped';
  return (
    <>
      <rect x={21} y={16} width={3} height={28} fill="#8B5A2B" />
      <path d="M9 2 C4 4 4 12 2 18 L44 18 C42 12 42 4 37 2 C30 -1 16 -1 9 2 Z" fill={fill} />
      {striped && (
        <>
          <path d="M14 1 C12 6 12 13 11 18 L18 18 C17 12 17 6 17 1 Z" fill="#F7F7F2" opacity={0.9} />
          <path d="M30 1 C31 6 31 12 32 18 L38 18 C37 12 35 5 35 1 Z" fill="#F7F7F2" opacity={0.9} />
        </>
      )}
      <path d="M2 18 Q7 22 12 18 Q17 22 22 18 Q27 22 32 18 Q37 22 44 18" fill="none" />
      <path d="M23 44 Q29 44 29 40" fill="none" />
    </>
  );
}

export function Towel({ variant, fill }: ArtProps) {
  return (
    <>
      <rect x={1} y={4} width={48} height={15} rx={3} fill={fill} />
      {variant === 'stripe' && (
        <>
          <rect x={9} y={4} width={5} height={15} fill="#F7F7F2" opacity={0.9} />
          <rect x={24} y={4} width={5} height={15} fill="#F7F7F2" opacity={0.9} />
          <rect x={39} y={4} width={5} height={15} fill="#F7F7F2" opacity={0.9} />
        </>
      )}
      <path d="M1 9 L49 9" stroke="#20312B" strokeWidth={1} opacity={0.25} fill="none" />
    </>
  );
}

export function Sandcastle({ variant, fill }: ArtProps) {
  return (
    <>
      <rect x={1} y={22} width={44} height={13} rx={2} fill={fill} />
      <rect x={4} y={13} width={10} height={11} fill={fill} />
      <rect x={32} y={13} width={10} height={11} fill={fill} />
      {[4, 8, 12].map((x) => (
        <rect key={`a${x}`} x={x} y={10} width={2.5} height={3} fill={fill} />
      ))}
      {[32, 36, 40].map((x) => (
        <rect key={`b${x}`} x={x} y={10} width={2.5} height={3} fill={fill} />
      ))}
      {variant === 'wall' && <rect x={12} y={26} width={20} height={9} fill={fill} />}
      <path d="M19 35 L19 28 Q23 25 27 28 L27 35 Z" fill="#B99A55" />
      <circle cx={9} cy={20} r={1.2} fill="#8B6B2B" stroke="none" />
      <circle cx={35} cy={20} r={1.2} fill="#8B6B2B" stroke="none" />
    </>
  );
}

export function Crab({ variant, fill }: ArtProps) {
  const blue = variant === 'blue';
  const body = blue ? '#3E7BFA' : fill;
  return (
    <>
      <ellipse cx={13} cy={11} rx={8} ry={5} fill={body} />
      <path d="M6 7 L2 3" fill="none" />
      <path d="M20 7 L24 3" fill="none" />
      <circle cx={1.5} cy={3} r={3.4} fill={body} />
      <circle cx={24.5} cy={4} r={2.4} fill={body} />
      <path d="M7 15 L4 18 M10 16 L8 18 M16 16 L18 18 M19 15 L22 18" fill="none" strokeWidth={1.8} />
      <circle cx={10} cy={9} r={1.2} fill="#20312B" stroke="none" />
      <circle cx={16} cy={9} r={1.2} fill="#20312B" stroke="none" />
    </>
  );
}

export function Starfish({ variant, fill }: ArtProps) {
  if (variant === 'four') {
    return (
      <polygon
        points="11,0 14,7 22,8 16,12 17,20 11,15 5,20 6,12 0,8 8,7"
        fill={fill}
      />
    );
  }
  return (
    <polygon
      points="11,0 13.4,7 21,7 15,11.6 17.4,19 11,14.6 4.6,19 7,11.6 1,7 8.6,7"
      fill={fill}
    />
  );
}

export function Seagull({ variant, fill }: ArtProps) {
  if (variant === 'perch') {
    return (
      <>
        <ellipse cx={13} cy={11} rx={7} ry={4.5} fill={fill} />
        <circle cx={20} cy={7} r={3.4} fill={fill} />
        <polygon points="23,6 28,7.5 23,9" fill="#F2A03D" />
        <path d="M10 9 Q14 5 18 9" fill="#C7D2E0" />
        <path d="M10 15 L10 18 M16 15 L16 18" fill="none" strokeWidth={1.6} />
        <circle cx={21} cy={6} r={0.9} fill="#20312B" stroke="none" />
      </>
    );
  }
  return (
    <>
      <path d="M1 10 Q7 1 13 9 Q19 1 27 10" fill="none" strokeWidth={2.6} stroke={fill} />
      <ellipse cx={14} cy={10} rx={4} ry={2.4} fill={fill} />
      <path d="M18 9 L21 7 L19 10 Z" fill="#F2A03D" />
      <circle cx={17} cy={8.6} r={0.8} fill="#20312B" stroke="none" />
    </>
  );
}

export function Shell({ variant, fill }: ArtProps) {
  if (variant === 'spiral') {
    return (
      <>
        <path d="M10 17 C1 17 1 4 10 3 C17 2 19 12 12 13 C8 14 7 9 11 8" fill={fill} />
        <path d="M10 17 C1 17 1 4 10 3 C17 2 19 12 12 13" fill="none" strokeWidth={1.4} />
      </>
    );
  }
  return (
    <>
      <path d="M10 18 C1 16 0 4 10 1 C20 4 19 16 10 18 Z" fill={fill} />
      <path d="M10 17 L4 5 M10 17 L7 3 M10 17 L13 3 M10 17 L16 5" fill="none" strokeWidth={1.3} />
    </>
  );
}

export function Boat({ variant, fill }: ArtProps) {
  return (
    <>
      <path d="M1 15 L39 15 L33 22 L7 22 Z" fill={fill} />
      <rect x={12} y={2} width={2.6} height={13} fill="#8B5A2B" />
      {variant === 'sail' ? (
        <path d="M15 3 L30 14 L15 14 Z" fill="#F7F7F2" />
      ) : (
        <>
          <path d="M15 8 L15 20 M15 8 L6 14" fill="none" strokeWidth={1.8} />
          <path d="M28 10 L38 18" fill="none" strokeWidth={1.8} />
        </>
      )}
    </>
  );
}

export function Palm({ variant, fill }: ArtProps) {
  const bushy = variant === 'bushy';
  return (
    <>
      <path d="M20 59 C24 46 26 28 28 16" fill="none" strokeWidth={6} stroke="#8B5A2B" />
      <path d="M28 16 C18 6 6 6 2 12 C10 10 20 12 26 17 Z" fill={fill} />
      <path d="M28 16 C36 4 44 4 42 12 C38 12 33 14 30 18 Z" fill={fill} />
      <path d="M28 16 C38 18 42 26 36 30 C34 24 31 20 27 19 Z" fill={fill} />
      <path d="M28 16 C20 24 12 26 10 20 C16 20 23 18 27 15 Z" fill={fill} />
      <path d="M28 16 C28 26 24 34 18 34 C21 28 24 21 26 15 Z" fill={fill} />
      {bushy && (
        <>
          <path d="M28 16 C8 14 4 20 8 26 C14 20 22 18 28 18 Z" fill={fill} />
          <path d="M28 16 C42 10 46 16 42 22 C37 18 32 17 28 18 Z" fill={fill} />
        </>
      )}
      <circle cx={31} cy={20} r={2.4} fill="#7A4A22" stroke="none" />
      <circle cx={26} cy={22} r={2.2} fill="#7A4A22" stroke="none" />
    </>
  );
}

export function Bucket({ variant, fill }: ArtProps) {
  return (
    <>
      {variant === 'square' ? (
        <rect x={3} y={7} width={14} height={12} rx={1} fill={fill} />
      ) : (
        <path d="M4 7 L16 7 L14 19 L6 19 Z" fill={fill} />
      )}
      <path d="M5 7 Q10 0 15 7" fill="none" />
      <path d="M4 7 L16 7" strokeWidth={1.6} fill="none" />
    </>
  );
}

export function BallArt({ variant, fill }: ArtProps) {
  return (
    <>
      <circle cx={10} cy={10} r={9} fill={fill} />
      {variant === 'beach' ? (
        <>
          <path d="M10 1 C6 6 6 14 10 19" fill="none" stroke="#F7F7F2" strokeWidth={2.6} />
          <path d="M1 10 C6 7 14 7 19 10" fill="none" stroke="#F7F7F2" strokeWidth={2.6} />
        </>
      ) : (
        <circle cx={7} cy={7} r={2.4} fill="#F7F7F2" stroke="none" />
      )}
    </>
  );
}
