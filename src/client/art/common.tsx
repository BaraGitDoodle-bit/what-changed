import type { ArtProps } from './types';

/* All shapes are drawn in the object's own box (see src/shared/art-meta.ts).
   The outline is supplied by the parent <g> so every object shares one ink. */

export function Tree({ variant, fill }: ArtProps) {
  const trunk = <rect x={29} y={54} width={7} height={32} rx={2} fill="#8B5A2B" />;
  if (variant === 'pine') {
    return (
      <>
        {trunk}
        <polygon points="34,3 57,36 11,36" fill={fill} />
        <polygon points="32,24 61,62 3,62" fill={fill} />
        <polygon points="32,46 55,80 9,80" fill={fill} />
        <circle cx={40} cy={68} r={2} fill="#FFD86B" stroke="none" />
      </>
    );
  }
  return (
    <>
      {trunk}
      <circle cx={32} cy={36} r={27} fill={fill} />
      <circle cx={17} cy={47} r={14} fill={fill} />
      <circle cx={47} cy={47} r={14} fill={fill} />
      <circle cx={45} cy={24} r={4} fill="#E5484D" />
      <path d="M50 40 L62 33" fill="none" />
    </>
  );
}

export function Bush({ variant, fill }: ArtProps) {
  return (
    <>
      <circle cx={12} cy={15} r={10} fill={fill} />
      <circle cx={25} cy={12} r={11} fill={fill} />
      <circle cx={34} cy={16} r={8} fill={fill} />
      {variant === 'berry' && (
        <>
          <circle cx={16} cy={11} r={2.2} fill="#E5484D" stroke="none" />
          <circle cx={27} cy={16} r={2.2} fill="#E5484D" stroke="none" />
          <circle cx={33} cy={11} r={2.2} fill="#E5484D" stroke="none" />
        </>
      )}
    </>
  );
}

export function Bench({ variant, fill }: ArtProps) {
  const stone = variant === 'stone';
  return (
    <>
      <rect x={9} y={19} width={5} height={11} rx={1} fill={stone ? '#7C8791' : '#7A4A22'} />
      <rect x={48} y={19} width={5} height={11} rx={1} fill={stone ? '#7C8791' : '#7A4A22'} />
      <rect x={2} y={9} width={58} height={8} rx={2} fill={fill} />
      <rect x={4} y={2} width={54} height={6} rx={2} fill={fill} />
      <rect x={55} y={2} width={4} height={17} rx={2} fill={stone ? '#5F6A73' : '#8B5A2B'} />
      {!stone &&
        [8, 18, 28, 38, 48].map((x) => (
          <line key={x} x1={x} y1={4} x2={x} y2={22} stroke="#6B3D1B" strokeWidth={1.4} fill="none" />
        ))}
    </>
  );
}

export function Duck({ variant, fill }: ArtProps) {
  const white = variant === 'white';
  return (
    <>
      <ellipse cx={11} cy={14} rx={9} ry={6} fill={white ? '#F7F7F2' : fill} />
      <polygon points="2,12 0,7 7,10" fill={white ? '#F7F7F2' : fill} />
      <circle cx={19} cy={7} r={5} fill={white ? '#F7F7F2' : fill} />
      <circle cx={20.5} cy={5.5} r={1.2} fill="#20312B" stroke="none" />
      <polygon points="23,7 28,8.5 23,10" fill="#F28C28" />
      <path d="M8 17 L8 19 M14 17 L14 19" fill="none" strokeWidth={1.8} />
    </>
  );
}

export function Squirrel({ variant, fill }: ArtProps) {
  const body = variant === 'grey' ? '#9AA3AB' : fill;
  return (
    <>
      <path d="M5 25 C-2 16 3 4 12 6 C18 8 16 17 11 21" fill={body} />
      <ellipse cx={14} cy={14} rx={7} ry={5} fill={body} />
      <circle cx={20} cy={9} r={4.5} fill={body} />
      <polygon points="17,5 18,1 21,5" fill={body} />
      <circle cx={21.5} cy={8.5} r={1} fill="#20312B" stroke="none" />
      <path d="M8 17 L8 20 M15 17 L15 20" fill="none" strokeWidth={1.8} />
    </>
  );
}

export function Flower({ variant, fill }: ArtProps) {
  const daisy = variant === 'daisy';
  return (
    <>
      <path d="M8 22 L8 10" fill="none" />
      <ellipse cx={11} cy={17} rx={4} ry={2} fill="#4CAF6D" />
      {daisy ? (
        <>
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx={8 + Math.cos((angle * Math.PI) / 180) * 4}
              cy={8 + Math.sin((angle * Math.PI) / 180) * 4}
              rx={3}
              ry={2}
              fill="#F7F7F2"
              transform={`rotate(${angle} ${8 + Math.cos((angle * Math.PI) / 180) * 4} ${
                8 + Math.sin((angle * Math.PI) / 180) * 4
              })`}
            />
          ))}
          <circle cx={8} cy={8} r={2.4} fill="#FFC93C" />
        </>
      ) : (
        <>
          <path d="M8 2 C13 2 13 7 11 10 L8 8 L5 10 C3 7 3 2 8 2 Z" fill={fill} />
          <circle cx={8} cy={9} r={1.6} fill="#FFC93C" stroke="none" />
        </>
      )}
    </>
  );
}

export function Sign({ variant, fill }: ArtProps) {
  return (
    <>
      <rect x={14} y={12} width={3} height={14} fill="#8B5A2B" />
      {variant === 'round' ? (
        <>
          <circle cx={15.5} cy={8} r={7.5} fill={fill} />
          <circle cx={15.5} cy={8} r={2.2} fill="#20312B" stroke="none" />
        </>
      ) : (
        <>
          <rect x={2} y={2} width={22} height={13} rx={2} fill={fill} />
          <polygon points="24,8.5 30,8.5 30,5 36,10 30,15 30,11.5 24,11.5" fill={fill} />
          <circle cx={8} cy={8.5} r={1.6} fill="#20312B" stroke="none" />
        </>
      )}
    </>
  );
}

export function Kite({ variant }: ArtProps) {
  if (variant === 'bird') {
    return (
      <>
        <path d="M2 12 Q8 2 13 10 Q18 2 24 12 L13 26 Z" fill="#E5484D" />
        <path d="M13 26 C10 30 16 31 13 34" fill="none" />
        <circle cx={9} cy={9} r={1.2} fill="#20312B" stroke="none" />
        <circle cx={17} cy={9} r={1.2} fill="#20312B" stroke="none" />
      </>
    );
  }
  return (
    <>
      <polygon points="13,1 25,14 13,27 1,14" fill="#E5484D" />
      <path d="M13 1 L13 27 M1 14 L25 14" fill="none" strokeWidth={1.6} />
      <path d="M13 27 C9 30 16 31 12 34" fill="none" />
      <path d="M12 31 L16 33" fill="none" strokeWidth={1.6} />
    </>
  );
}

export function Trashcan({ variant, fill }: ArtProps) {
  const body = variant === 'green' ? '#3E8E5A' : fill;
  return (
    <>
      <rect x={1} y={3} width={18} height={4} rx={2} fill={body} />
      <path d="M3 8 L17 8 L15 25 L5 25 Z" fill={body} />
      <path d="M7 11 L7 22 M10 11 L10 22 M13 11 L13 22" stroke="#20312B" strokeWidth={1.4} fill="none" />
    </>
  );
}

export function Lamp({ variant, fill }: ArtProps) {
  return (
    <>
      <rect x={7} y={12} width={4} height={46} rx={2} fill={fill} />
      <rect x={4} y={54} width={10} height={4} rx={2} fill={fill} />
      {variant === 'street' ? (
        <rect x={2} y={2} width={14} height={11} rx={2} fill="#FFE9A8" />
      ) : (
        <>
          <path d="M4 12 L14 12 L12 2 L6 2 Z" fill="#FFE9A8" />
          <circle cx={9} cy={7} r={2.4} fill="#FFF7D6" stroke="none" />
        </>
      )}
    </>
  );
}

export function Cloud({ variant, fill }: ArtProps) {
  if (variant === 'flat') {
    return (
      <>
        <ellipse cx={27} cy={13} rx={26} ry={8} fill={fill} />
        <ellipse cx={14} cy={10} rx={10} ry={7} fill={fill} />
        <ellipse cx={38} cy={9} rx={11} ry={7} fill={fill} />
      </>
    );
  }
  return (
    <>
      <circle cx={15} cy={13} r={9} fill={fill} />
      <circle cx={30} cy={10} r={11} fill={fill} />
      <circle cx={44} cy={14} r={8} fill={fill} />
      <rect x={8} y={12} width={40} height={9} rx={4.5} fill={fill} />
    </>
  );
}

export function Balloon({ variant, fill }: ArtProps) {
  return (
    <>
      {variant === 'heart' ? (
        <path
          d="M10 20 C2 14 1 7 5 5 C8 3 10 5 10 7 C10 5 12 3 15 5 C19 7 18 14 10 20 Z"
          fill={fill}
        />
      ) : (
        <ellipse cx={10} cy={10} rx={8} ry={9.5} fill={fill} />
      )}
      <polygon points="10,20 7,23 13,23" fill={fill} />
      <path d="M10 23 C7 25 13 26 9 28" fill="none" strokeWidth={1.4} />
    </>
  );
}

export function Sun({ variant, fill }: ArtProps) {
  return (
    <>
      {variant === 'rays' &&
        [0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={angle}
              x1={17 + Math.cos(rad) * 12}
              y1={17 + Math.sin(rad) * 12}
              x2={17 + Math.cos(rad) * 16}
              y2={17 + Math.sin(rad) * 16}
              strokeWidth={2.4}
              fill="none"
            />
          );
        })}
      <circle cx={17} cy={17} r={11} fill={fill} />
      <circle cx={13} cy={14} r={1.5} fill="#20312B" stroke="none" />
      <circle cx={21} cy={14} r={1.5} fill="#20312B" stroke="none" />
      <path d="M13 21 Q17 24 21 21" fill="none" strokeWidth={1.6} />
    </>
  );
}

export function Dog({ variant, fill }: ArtProps) {
  const pug = variant === 'pug';
  return (
    <>
      <ellipse cx={16} cy={16} rx={12} ry={6.5} fill={pug ? '#E3C9A6' : fill} />
      <circle cx={27} cy={9} r={6} fill={pug ? '#E3C9A6' : fill} />
      {pug ? (
        <>
          <ellipse cx={27} cy={9} rx={4} ry={3} fill="#D9B98F" />
          <circle cx={25} cy={8} r={1.2} fill="#20312B" stroke="none" />
          <circle cx={30} cy={8} r={1.2} fill="#20312B" stroke="none" />
          <path d="M27 11 L27 12.5" fill="none" strokeWidth={1.4} />
        </>
      ) : (
        <>
          <path d="M23 4 C20 6 21 11 24 12" fill="#B07338" />
          <circle cx={29} cy={7.5} r={1.3} fill="#20312B" stroke="none" />
          <circle cx={33} cy={9.5} r={1.6} fill="#20312B" stroke="none" />
          <path d="M31 12 Q33 13 34 11" fill="none" strokeWidth={1.4} />
        </>
      )}
      <path d="M8 21 L8 25 M20 21 L20 25" fill="none" strokeWidth={2} />
      <path d="M3 12 C0 8 1 5 3 6" fill="none" />
    </>
  );
}

export function Cat({ variant, fill }: ArtProps) {
  const black = variant === 'black';
  const body = black ? '#3A3A44' : fill;
  return (
    <>
      <path d="M3 15 C-1 11 1 5 5 7 C8 9 6 13 5 15" fill={body} />
      <ellipse cx={13} cy={16} rx={9} ry={6} fill={body} />
      <circle cx={21} cy={9} r={5.5} fill={body} />
      <polygon points="17,5 16,1 20,3" fill={body} />
      <polygon points="23,4 26,1 26,5" fill={body} />
      <circle cx={19} cy={8} r={1.1} fill="#F2E9C9" stroke="none" />
      <circle cx={23.5} cy={8} r={1.1} fill="#F2E9C9" stroke="none" />
      {!black &&
        [9, 13, 17].map((x) => (
          <path key={x} d={`M${x} 10 L${x} 22`} stroke="#4A4A4A" strokeWidth={1.2} fill="none" />
        ))}
      <path d="M7 21 L7 24 M19 21 L19 24" fill="none" strokeWidth={1.8} />
    </>
  );
}
