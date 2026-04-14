'use client'

import { DIMENSIONS, RADAR_ORDER, type DimensionKey } from '@/lib/assessment-questions'

interface Props {
  scores: Record<DimensionKey, number>
  size?: number
}

export default function CompetencyRadar({ scores, size = 320 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.38
  const labelR = size * 0.48
  const steps = [20, 40, 60, 80, 100]
  const n = RADAR_ORDER.length

  function getPoint(index: number, value: number): [number, number] {
    // Start at top (−90°), go clockwise
    const angle = (index / n) * 2 * Math.PI - Math.PI / 2
    const r = (value / 100) * maxR
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  }

  function getLabelPoint(index: number): [number, number] {
    const angle = (index / n) * 2 * Math.PI - Math.PI / 2
    return [cx + labelR * Math.cos(angle), cy + labelR * Math.sin(angle)]
  }

  const polygon = RADAR_ORDER.map((dim, i) => getPoint(i, scores[dim] ?? 0))
    .map(([x, y]) => `${x},${y}`)
    .join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* Background grid rings */}
      {steps.map(step => {
        const ringPoints = RADAR_ORDER.map((_, i) => getPoint(i, step))
          .map(([x, y]) => `${x},${y}`)
          .join(' ')
        return (
          <polygon
            key={step}
            points={ringPoints}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        )
      })}

      {/* Axis lines */}
      {RADAR_ORDER.map((_, i) => {
        const [x, y] = getPoint(i, 100)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        )
      })}

      {/* Score polygon — fill */}
      <polygon
        points={polygon}
        fill="rgba(124, 58, 237, 0.15)"
        stroke="#7c3aed"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Score dots */}
      {RADAR_ORDER.map((dim, i) => {
        const [x, y] = getPoint(i, scores[dim] ?? 0)
        return (
          <circle
            key={dim}
            cx={x}
            cy={y}
            r={4}
            fill={DIMENSIONS[dim].color}
            stroke="white"
            strokeWidth="2"
          />
        )
      })}

      {/* Labels */}
      {RADAR_ORDER.map((dim, i) => {
        const [lx, ly] = getLabelPoint(i)
        const info = DIMENSIONS[dim]

        // Anchor based on position
        const angle = (i / n) * 360
        let anchor: 'start' | 'middle' | 'end' = 'middle'
        if (angle > 15 && angle < 165) anchor = 'start'
        else if (angle > 195 && angle < 345) anchor = 'end'

        return (
          <g key={dim}>
            <text
              x={lx}
              y={ly - 6}
              textAnchor={anchor}
              fontSize={11}
              fontWeight="700"
              fill={info.color}
            >
              {info.icon} {info.label}
            </text>
            <text
              x={lx}
              y={ly + 8}
              textAnchor={anchor}
              fontSize={10}
              fill="#6b7280"
            >
              {scores[dim] ?? 0}%
            </text>
          </g>
        )
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill="#d1d5db" />
    </svg>
  )
}
