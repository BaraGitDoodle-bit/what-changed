import type { PingZone, PublicScene } from '../../shared/types';
import { THEMES } from '../../shared/themes';
import type { SceneRing } from './types';
import { Background } from '../art/Background';
import { ObjectArt } from '../art';

interface Props {
  scene: PublicScene;
  panel: 'before' | 'after';
  rings: SceneRing[];
  pingZone?: PingZone | null;
  numbered?: boolean;
}

export function SceneSvg({ scene, panel, rings, pingZone, numbered = true }: Props) {
  const ink = THEMES[scene.theme].palette.ink;
  const objects = panel === 'before' ? scene.before : scene.after;

  return (
    <svg
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      className="block h-full w-full"
      role="img"
      aria-label={`${panel === 'before' ? 'Before' : 'After'} panel of ${scene.themeName}`}
    >
      <Background theme={scene.theme} />
      {objects.map((object) => (
        <ObjectArt key={object.id} object={object} ink={ink} />
      ))}

      {rings.map((ring, index) => {
        const cx = ring.bbox.x + ring.bbox.w / 2;
        const cy = ring.bbox.y + ring.bbox.h / 2;
        const radius = Math.max(14, Math.min(34, Math.max(ring.bbox.w, ring.bbox.h) / 2 + 5));
        return (
          <g key={ring.id} className="wc-pop" style={{ animationDelay: `${index * 60}ms` }}>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="#FFC93C"
              opacity={0.14}
              stroke="none"
            />
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#FFC93C"
              strokeWidth={2.8}
              strokeDasharray="6 4"
              vectorEffect="non-scaling-stroke"
            />
            {numbered && (
              <g transform={`translate(${cx + radius * 0.72} ${cy - radius * 0.72})`}>
                <circle r={8.5} fill="#FFC93C" stroke={ink} strokeWidth={2} />
                <text
                  textAnchor="middle"
                  y={3.4}
                  fontSize={9.5}
                  fontWeight={800}
                  fill={ink}
                  stroke="none"
                >
                  {index + 1}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {pingZone && (
        <g className="wc-pulse" pointerEvents="none">
          <circle
            cx={pingZone.x}
            cy={pingZone.y}
            r={pingZone.r}
            fill="#7FD1F2"
            opacity={0.22}
          />
          <circle
            cx={pingZone.x}
            cy={pingZone.y}
            r={pingZone.r}
            fill="none"
            stroke="#7FD1F2"
            strokeWidth={2.4}
            strokeDasharray="7 5"
          />
        </g>
      )}
    </svg>
  );
}
