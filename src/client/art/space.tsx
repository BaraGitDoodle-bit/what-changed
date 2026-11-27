import type { ArtProps } from './types';

export function Planet({ variant, fill, ink }: ArtProps) {
  const crater = (cx: number, cy: number, r: number) => (
    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={ink} opacity={0.18} stroke="none" />
  );
  return (
    <>
      <circle cx={23} cy={23} r={16} fill={fill} />
      {variant === 'ringed' && (
        <>
          <ellipse
            cx={23}
            cy={23}
            rx={26}
            ry={7}
            fill="none"
            stroke="#FFD86B"
            strokeWidth={3.4}
            transform="rotate(-18 23 23)"
          />
          <circle cx={23} cy={23} r={16} fill={fill} />
          {crater(17, 18, 3)}
          {crater(29, 27, 4)}
        </>
      )}
      {variant !== 'ringed' && (
        <>
          {crater(16, 16, 3.4)}
          {crater(28, 22, 2.6)}
          {crater(21, 31, 3)}
          {crater(31, 12, 1.8)}
        </>
      )}
    </>
  );
}

export function StarShape({ variant, fill }: ArtProps) {
  if (variant === 'four') {
    return <polygon points="9,0 12,6 18,9 12,12 9,18 6,12 0,9 6,6" fill={fill} />;
  }
  return (
    <polygon
      points="9,0 11.3,6 18,6.6 13,11 14.5,18 9,14.2 3.5,18 5,11 0,6.6 6.7,6"
      fill={fill}
    />
  );
}

export function Rocket({ variant, fill }: ArtProps) {
  const fin = variant === 'blue' ? '#3E7BFA' : '#E5484D';
  return (
    <>
      <path d="M17 2 C24 10 27 22 27 32 L7 32 C7 22 10 10 17 2 Z" fill={fill} />
      <path d="M7 24 L0 38 L8 34 Z" fill={fin} />
      <path d="M27 24 L34 38 L26 34 Z" fill={fin} />
      <circle cx={17} cy={18} r={4.4} fill="#7FD1F2" />
      <path d="M12 40 C13 47 21 47 22 40 Z" fill="#FFC93C" />
      <path d="M15 38 C15 42 19 42 19 38 Z" fill="#FF8A5B" />
      <path d="M24 12 L30 8" fill="none" />
    </>
  );
}

export function Satellite({ variant, fill }: ArtProps) {
  return (
    <>
      <rect x={11} y={9} width={9} height={8} rx={1} fill={fill} />
      <rect x={1} y={10} width={8} height={6} rx={1} fill="#3E7BFA" />
      {variant === 'panel' ? (
        <rect x={21} y={10} width={8} height={6} rx={1} fill="#3E7BFA" />
      ) : (
        <path d="M22 6 A5 5 0 0 1 29 12 L22 12 Z" fill="#F7F7F2" />
      )}
      <line x1={9} y1={13} x2={11} y2={13} strokeWidth={1.6} fill="none" />
      <line x1={20} y1={13} x2={21} y2={13} strokeWidth={1.6} fill="none" />
      <circle cx={15} cy={13} r={1.6} fill="#FF5D8F" stroke="none" />
    </>
  );
}

export function Alien({ variant, fill }: ArtProps) {
  const skin = variant === 'purple' ? '#B07CFF' : fill;
  return (
    <>
      <ellipse cx={13} cy={12} rx={8} ry={9} fill={skin} />
      <path d="M8 5 C6 0 10 0 11 4" fill="none" />
      <path d="M18 4 C21 0 24 1 21 5" fill="none" />
      <ellipse cx={10} cy={11} rx={2.2} ry={3} fill="#120D1F" stroke="none" />
      <ellipse cx={16} cy={11} rx={2.2} ry={3} fill="#120D1F" stroke="none" />
      <path d="M11 18 Q13 20 15 18" fill="none" strokeWidth={1.6} />
      <rect x={10} y={22} width={6} height={7} rx={2} fill={skin} />
      <path d="M8 29 L6 30 M18 29 L20 30" fill="none" strokeWidth={1.8} />
    </>
  );
}

export function Astronaut({ variant, fill }: ArtProps) {
  return (
    <>
      {variant === 'pack' && <rect x={1} y={17} width={6} height={14} rx={2} fill="#9AA3AB" />}
      <circle cx={14} cy={10} r={8} fill={fill} />
      <rect x={8} y={6} width={12} height={7} rx={3.5} fill="#2C4A6A" />
      <rect x={6} y={17} width={16} height={14} rx={5} fill={fill} />
      <rect x={9} y={20} width={10} height={6} rx={2} fill="#3E7BFA" />
      <path d="M22 20 L27 14" fill="none" strokeWidth={3.4} />
      <path d="M4 20 L1 26" fill="none" strokeWidth={3.4} />
      <path d="M9 30 L9 38 M19 30 L19 38" fill="none" strokeWidth={4} />
      <circle cx={19} cy={4} r={1.8} fill="#E5484D" stroke="none" />
    </>
  );
}

export function Porthole({ variant, fill }: ArtProps) {
  return (
    <>
      {variant === 'square' ? (
        <>
          <rect x={1} y={1} width={24} height={24} rx={4} fill="#C7D2E0" />
          <rect x={5} y={5} width={16} height={16} rx={2} fill={fill} />
        </>
      ) : (
        <>
          <circle cx={13} cy={13} r={12} fill="#C7D2E0" />
          <circle cx={13} cy={13} r={8.5} fill={fill} />
        </>
      )}
      <circle cx={13} cy={4} r={1.2} fill="#4A5A7A" stroke="none" />
      <circle cx={13} cy={22} r={1.2} fill="#4A5A7A" stroke="none" />
      <circle cx={4} cy={13} r={1.2} fill="#4A5A7A" stroke="none" />
      <circle cx={22} cy={13} r={1.2} fill="#4A5A7A" stroke="none" />
    </>
  );
}

export function Console({ variant, fill }: ArtProps) {
  return (
    <>
      <rect x={1} y={7} width={38} height={20} rx={3} fill={fill} />
      {variant === 'dials' ? (
        <>
          <circle cx={9} cy={16} r={4} fill="#7FD1F2" />
          <circle cx={20} cy={16} r={4} fill="#FFC93C" />
          <circle cx={31} cy={16} r={4} fill="#45D483" />
          <path d="M9 16 L11 13 M20 16 L22 14" fill="none" strokeWidth={1.4} />
        </>
      ) : (
        <>
          <rect x={4} y={10} width={20} height={11} rx={1.5} fill="#7FD1F2" />
          <path d="M6 18 L10 15 L13 16 L18 12" fill="none" strokeWidth={1.4} />
          <circle cx={30} cy={13} r={2} fill="#45D483" stroke="none" />
          <circle cx={30} cy={19} r={2} fill="#FF5D8F" stroke="none" />
        </>
      )}
    </>
  );
}

export function Crate({ variant, fill }: ArtProps) {
  const metal = variant === 'metal';
  return (
    <>
      <rect x={1} y={3} width={26} height={19} rx={2} fill={metal ? '#8B98A5' : fill} />
      <path d="M1 12 L27 12 M1 7 L27 7 M1 17 L27 17" fill="none" strokeWidth={1.6} />
      <path d="M7 3 L7 22 M21 3 L21 22" fill="none" strokeWidth={1.6} />
      {metal &&
        [4, 24].map((x) => (
          <circle key={x} cx={x} cy={6} r={1.1} fill="#20312B" stroke="none" />
        ))}
    </>
  );
}

export function Flag({ variant, fill }: ArtProps) {
  return (
    <>
      <rect x={4} y={1} width={3} height={29} rx={1.5} fill="#C7D2E0" />
      {variant === 'checker' ? (
        <>
          <path d="M7 3 L21 6 L7 13 Z" fill="#F7F7F2" />
          <path d="M7 8 L16 10 L7 13 Z" fill={fill} />
        </>
      ) : (
        <path d="M7 3 L21 7 L7 14 Z" fill={fill} />
      )}
      <circle cx={5.5} cy={2} r={1.4} fill="#FFC93C" stroke="none" />
    </>
  );
}
