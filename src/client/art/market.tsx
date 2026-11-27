import type { ArtProps } from './types';

export function Stall({ variant, fill }: ArtProps) {
  const awning = variant === 'green' ? '#45D483' : variant === 'blue' ? '#3E7BFA' : fill;
  return (
    <>
      <rect x={4} y={22} width={4} height={34} fill="#6B4A2B" />
      <rect x={62} y={22} width={4} height={34} fill="#6B4A2B" />
      <rect x={4} y={40} width={62} height={14} rx={2} fill="#A9713F" />
      <rect x={1} y={30} width={68} height={4} rx={2} fill="#6B4A2B" />
      <path d="M1 22 L69 22 L69 8 Q60 2 51 8 Q42 2 33 8 Q24 2 15 8 Q6 2 1 8 Z" fill={awning} />
      <path d="M13 21 L13 8 M31 21 L31 8 M49 21 L49 8" stroke="#20312B" strokeWidth={1.4} opacity={0.4} fill="none" />
      <circle cx={18} cy={37} r={3} fill="#FFC93C" stroke="none" />
      <circle cx={27} cy={37} r={3} fill="#E5484D" stroke="none" />
      <circle cx={36} cy={37} r={3} fill="#45D483" stroke="none" />
      <path d="M58 30 L66 30 L66 38 L58 38 Z" fill="#F7F7F2" opacity={0.7} />
    </>
  );
}

export function Lantern({ variant, fill }: ArtProps) {
  const body = variant === 'blue' ? '#3E7BFA' : fill;
  return (
    <>
      <path d="M9 0 L9 4" fill="none" />
      <rect x={5} y={4} width={8} height={2.4} rx={1} fill="#6B4A2B" />
      <ellipse cx={9} cy={14} rx={7} ry={8} fill={body} />
      <path d="M9 6 L9 22" stroke="#20312B" strokeWidth={1.1} opacity={0.35} fill="none" />
      <rect x={5} y={21} width={8} height={2.4} rx={1} fill="#6B4A2B" />
      <path d="M9 24 L9 26" fill="none" />
      <circle cx={9} cy={14} r={2.6} fill="#FFE9A8" stroke="none" />
    </>
  );
}

export function Stool({ variant, fill }: ArtProps) {
  return (
    <>
      {variant === 'cushion' && <ellipse cx={12} cy={5} rx={11} ry={4.5} fill="#E5484D" />}
      <ellipse cx={12} cy={7} rx={10} ry={4} fill={fill} />
      <path d="M4 9 L2 21 M20 9 L22 21 M12 11 L12 21" fill="none" strokeWidth={2.4} />
      <path d="M4 15 L20 15" fill="none" strokeWidth={1.6} />
    </>
  );
}

export function Bananas({ variant, fill }: ArtProps) {
  if (variant === 'single') {
    return <path d="M6 4 C4 12 9 16 18 15 C13 18 5 16 3 8 Z" fill={fill} />;
  }
  return (
    <>
      <path d="M6 3 C3 11 8 16 18 15 C13 19 4 17 2 7 Z" fill={fill} />
      <path d="M11 2 C8 9 12 14 21 13 C16 17 9 15 7 6 Z" fill={fill} opacity={0.92} />
      <path d="M16 1 C13 7 16 11 24 10 C20 14 14 13 12 5 Z" fill={fill} opacity={0.84} />
      <path d="M6 3 L8 1" fill="none" strokeWidth={1.6} />
    </>
  );
}

export function Bowl({ variant, fill }: ArtProps) {
  return (
    <>
      {variant === 'basket' ? (
        <path d="M2 5 L34 5 L30 17 L6 17 Z" fill={fill} />
      ) : (
        <path d="M1 4 L35 4 C33 13 26 18 18 18 C10 18 3 13 1 4 Z" fill={fill} />
      )}
      <path d="M1 4 L35 4" strokeWidth={1.8} fill="none" />
      {variant === 'basket' ? (
        <>
          <path d="M7 5 L9 17 M14 5 L15 17 M21 5 L21 17 M28 5 L27 17" fill="none" strokeWidth={1.3} />
          <circle cx={12} cy={2} r={2.4} fill="#E5484D" stroke="none" />
          <circle cx={20} cy={1.6} r={2.4} fill="#FFC93C" stroke="none" />
        </>
      ) : (
        <>
          <ellipse cx={12} cy={3} rx={4} ry={2.4} fill="#FFC93C" stroke="none" />
          <ellipse cx={22} cy={3} rx={4} ry={2.4} fill="#45D483" stroke="none" />
        </>
      )}
    </>
  );
}

export function Streetlamp({ variant, fill }: ArtProps) {
  return (
    <>
      <rect x={7} y={10} width={4} height={48} rx={2} fill={fill} />
      <rect x={4} y={55} width={10} height={3} rx={1.5} fill={fill} />
      <path d="M9 10 L9 4 L14 4" fill="none" strokeWidth={2.2} />
      {variant === 'double' && <path d="M9 8 L4 8 L4 4" fill="none" strokeWidth={2.2} />}
      <rect x={12} y={1} width={6} height={7} rx={1.6} fill="#FFE9A8" />
      {variant === 'double' && <rect x={0} y={1} width={6} height={7} rx={1.6} fill="#FFE9A8" />}
    </>
  );
}
