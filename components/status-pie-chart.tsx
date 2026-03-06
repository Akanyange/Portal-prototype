"use client"

import { useState } from "react"

interface Slice {
  label: string
  count: number
  color: string
}

// ── Full-size dimensions ─────────────────────────────────────────────────────
const R_FULL  = 38
const SW_FULL = 15
const C_FULL  = 55

// ── Compact dimensions ───────────────────────────────────────────────────────
const R_SM  = 10
const SW_SM = 4
const C_SM  = 14

interface Props {
  slices: Slice[]
  total: number
  compact?: boolean
}

export function StatusPieChart({ slices, total, compact = false }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  const R    = compact ? R_SM  : R_FULL
  const SW   = compact ? SW_SM : SW_FULL
  const CX   = compact ? C_SM  : C_FULL
  const CY   = compact ? C_SM  : C_FULL
  const CIRC = 2 * Math.PI * R

  let cumulative = 0
  const arcs = slices.map(sl => {
    const pct  = total > 0 ? sl.count / total : 0
    const dash = pct * CIRC
    const arc  = { ...sl, pct, dash, offset: cumulative }
    cumulative += dash
    return arc
  })

  const active = hovered !== null ? arcs[hovered] : null

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Mini donut — no centre text, just the ring */}
        <svg
          width={CX * 2} height={CY * 2}
          viewBox={`0 0 ${CX * 2} ${CY * 2}`}
          style={{ overflow: "visible", flexShrink: 0 }}
        >
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={SW} />
          {total > 0 && arcs.map((arc, i) => (
            <circle
              key={i} cx={CX} cy={CY} r={R} fill="none"
              stroke={arc.color}
              strokeWidth={hovered === i ? SW + 2 : SW}
              strokeDasharray={`${arc.dash} ${CIRC - arc.dash}`}
              strokeDashoffset={CIRC / 4 - arc.offset}
              strokeLinecap="butt"
              style={{
                transition: "stroke-width 0.15s ease, opacity 0.15s ease",
                opacity: hovered !== null && hovered !== i ? 0.3 : 1,
                cursor: "pointer",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        {/* Total + inline legend chips */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-xl font-bold leading-none">
              {active ? active.count : total}
            </span>
            {active && (
              <span className="text-[10px]" style={{ color: active.color }}>
                {active.label} · {Math.round(active.pct * 100)}%
              </span>
            )}
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {arcs.map((arc, i) => (
              <span
                key={i}
                className="flex items-center gap-1 text-[10px] cursor-default select-none"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: arc.color,
                    transform: hovered === i ? "scale(1.5)" : "scale(1)",
                    transition: "transform 0.15s ease",
                  }}
                />
                <span
                  className="font-semibold"
                  style={{ color: hovered === i ? arc.color : undefined }}
                >
                  {arc.count}
                </span>
                <span className="text-muted-foreground">{arc.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Full-size variant ──────────────────────────────────────────────────────
  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <svg
          width={CX * 2} height={CY * 2}
          viewBox={`0 0 ${CX * 2} ${CY * 2}`}
          style={{ overflow: "visible" }}
        >
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={SW} />
          {total > 0 && arcs.map((arc, i) => (
            <circle
              key={i} cx={CX} cy={CY} r={R} fill="none"
              stroke={arc.color}
              strokeWidth={hovered === i ? SW + 5 : SW}
              strokeDasharray={`${arc.dash} ${CIRC - arc.dash}`}
              strokeDashoffset={CIRC / 4 - arc.offset}
              strokeLinecap="butt"
              style={{
                transition: "stroke-width 0.15s ease, opacity 0.15s ease",
                opacity: hovered !== null && hovered !== i ? 0.3 : 1,
                cursor: "pointer",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          <text x={CX} y={CY - 7} textAnchor="middle"
            style={{ fontSize: 22, fontWeight: 700, fill: "currentColor" }}>
            {active ? active.count : total}
          </text>
          <text x={CX} y={CY + 11} textAnchor="middle"
            style={{ fontSize: 9.5, fill: "currentColor", opacity: 0.5 }}>
            {active ? active.label : "Total"}
          </text>
          {active && (
            <text x={CX} y={CY + 25} textAnchor="middle"
              style={{ fontSize: 9, fill: active.color, opacity: 0.85 }}>
              {Math.round(active.pct * 100)}%
            </text>
          )}
        </svg>
      </div>

      <div className="flex flex-col gap-2.5">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center gap-2 cursor-default select-none"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: arc.color,
                transition: "transform 0.15s ease",
                transform: hovered === i ? "scale(1.4)" : "scale(1)",
              }}
            />
            <span className="text-xs">
              <span className="font-semibold" style={{ color: hovered === i ? arc.color : undefined }}>
                {arc.count}
              </span>{" "}
              <span className="text-muted-foreground">{arc.label}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
