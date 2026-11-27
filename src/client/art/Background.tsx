import type { ThemeId } from '../../shared/types';
import { THEMES } from '../../shared/themes';

interface Props {
  theme: ThemeId;
}

const STARS: Array<[number, number, number]> = [
  [24, 18, 1.3],
  [66, 34, 1],
  [104, 14, 1.2],
  [148, 30, 0.9],
  [196, 16, 1.3],
  [238, 42, 1],
  [282, 22, 1.1],
  [310, 48, 0.9],
  [40, 54, 0.9],
  [126, 48, 1],
  [172, 60, 0.8],
  [258, 66, 1.2],
];

export function Background({ theme }: Props) {
  const palette = THEMES[theme].palette;

  if (theme === 'park') {
    return (
      <>
        <rect x={0} y={0} width={320} height={140} fill={palette.sky} />
        <circle cx={292} cy={22} r={26} fill={palette.skyDeep} opacity={0.5} />
        <ellipse cx={60} cy={148} rx={96} ry={40} fill={palette.groundDeep} opacity={0.55} />
        <ellipse cx={250} cy={152} rx={110} ry={44} fill={palette.groundDeep} opacity={0.45} />
        <rect x={0} y={140} width={320} height={80} fill={palette.ground} />
        <ellipse cx={160} cy={196} rx={96} ry={16} fill={palette.groundDeep} opacity={0.35} />
        <path d="M0 210 Q80 196 160 206 Q240 216 320 202 L320 220 L0 220 Z" fill="#E7D3A6" />
        <ellipse cx={178} cy={190} rx={52} ry={11} fill="#59B7E8" />
        <ellipse cx={178} cy={190} rx={52} ry={11} fill="none" stroke={palette.ink} strokeWidth={2} opacity={0.25} />
        {[
          [86, 132],
          [104, 136],
          [214, 132],
          [232, 138],
          [14, 132],
        ].map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x} ${y} l3 -9 l3 9`} fill="none" stroke={palette.ink} strokeWidth={1.6} opacity={0.35} />
        ))}
      </>
    );
  }

  if (theme === 'space') {
    return (
      <>
        <rect x={0} y={0} width={320} height={220} fill={palette.sky} />
        <rect x={0} y={0} width={320} height={220} fill={palette.skyDeep} opacity={0.4} />
        {STARS.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#F7F7F2" opacity={0.85} />
        ))}
        <path d="M0 168 L320 168 L320 220 L0 220 Z" fill={palette.ground} />
        <path d="M0 168 L320 168" stroke={palette.accent} strokeWidth={2} opacity={0.5} fill="none" />
        <path d="M26 220 L26 188 M294 220 L294 188" stroke={palette.groundDeep} strokeWidth={5} fill="none" />
        <circle cx={74} cy={122} r={30} fill={palette.accent} opacity={0.08} />
        <circle cx={74} cy={122} r={18} fill={palette.accent} opacity={0.12} />
        <path d="M0 60 Q80 40 160 56 Q240 72 320 52" stroke={palette.accent} strokeWidth={1.2} opacity={0.2} fill="none" />
      </>
    );
  }

  if (theme === 'beach') {
    return (
      <>
        <rect x={0} y={0} width={320} height={96} fill={palette.sky} />
        <circle cx={286} cy={22} r={24} fill="#FFE9A8" opacity={0.7} />
        <rect x={0} y={88} width={320} height={58} fill="#4FB6D9" />
        <path d="M0 96 Q24 92 48 96 T96 96 T144 96 T192 96 T240 96 T288 96 T320 96" fill="none" stroke="#F7F7F2" strokeWidth={2.4} opacity={0.7} />
        <path d="M0 112 Q24 108 48 112 T96 112 T144 112 T192 112 T240 112 T288 112 T320 112" fill="none" stroke="#F7F7F2" strokeWidth={2} opacity={0.45} />
        <path d="M0 146 Q60 136 120 144 Q200 154 260 142 Q292 136 320 142 L320 220 L0 220 Z" fill={palette.ground} />
        <path d="M0 150 Q60 141 120 148 Q200 158 260 147 Q292 141 320 147" fill="none" stroke={palette.groundDeep} strokeWidth={2.4} />
        {[
          [36, 196],
          [92, 208],
          [176, 202],
          [250, 210],
          [300, 192],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.4} fill={palette.groundDeep} />
        ))}
      </>
    );
  }

  return (
    <>
      <rect x={0} y={0} width={320} height={150} fill={palette.sky} />
      <rect x={0} y={0} width={320} height={150} fill={palette.skyDeep} opacity={0.35} />
      {[
        [18, 66, 40, 84],
        [58, 52, 26, 98],
        [114, 72, 34, 78],
        [210, 58, 30, 92],
        [268, 70, 36, 80],
        [300, 60, 20, 90],
      ].map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={palette.skyDeep} opacity={0.7} />
      ))}
      {[
        [0, 34, 320],
        [0, 46, 280],
      ].map(([x1, y, x2]) => (
        <path
          key={`str-${y}`}
          d={`M${x1} ${y} Q160 ${y + 22} ${x2} ${y}`}
          fill="none"
          stroke="#6B5A3B"
          strokeWidth={1.4}
        />
      ))}
      {[18, 64, 110, 156, 202, 248, 294].map((x, index) => (
        <circle
          key={`glow-${x}`}
          cx={x}
          cy={index % 2 === 0 ? 38 : 50}
          r={3.2}
          fill="#FFE9A8"
          opacity={0.9}
        />
      ))}
      <rect x={0} y={150} width={320} height={70} fill={palette.ground} />
      <path d="M0 150 L320 150" stroke={palette.groundDeep} strokeWidth={2.4} fill="none" />
      {[
        [40, 168],
        [96, 204],
        [170, 176],
        [230, 212],
        [286, 186],
      ].map(([x, y]) => (
        <rect key={`tile-${x}-${y}`} x={x} y={y} width={16} height={5} fill={palette.groundDeep} opacity={0.5} />
      ))}
    </>
  );
}
