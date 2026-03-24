"use client"

import { useState } from "react"
import { BarChart2 } from "lucide-react"
import { Card } from "@/components/ui/card"

// ── Data ──────────────────────────────────────────────────────────────────────

const YEARLY_DATA: Record<number, number[]> = {
  2024: [2, 1, 3, 2, 4, 3, 2, 3, 4, 2, 3, 1],
  2025: [1, 2, 2, 3, 2, 3, 1, 2, 3, 1, 2, 1],
  2026: [1, 0, 2, 1, 3, 2, 1, 2, 3, 1, 2, 0],
}

const CURRENT_YEAR  = new Date().getFullYear()
const YEARS         = Object.keys(YEARLY_DATA).map(Number).sort()
const MONTH_ABBREVS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

// ── Layout constants ──────────────────────────────────────────────────────────

const Y_W     = 14
const BAR_W   = 9
const GAP     = 7
const CHART_H = 46
const LABEL_H = 10
const BARS_W  = 12 * (BAR_W + GAP) - GAP
const SVG_W   = Y_W + BARS_W
const SVG_H   = CHART_H + LABEL_H

// ── Component ─────────────────────────────────────────────────────────────────

export function CompletedMonthlyChart() {
  const [selectedYear,  setSelectedYear]  = useState(CURRENT_YEAR)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [hoveredMonth,  setHoveredMonth]  = useState<number | null>(null)
  const [tooltipPos,    setTooltipPos]    = useState<{ x: number; y: number } | null>(null)

  const data   = YEARLY_DATA[selectedYear] ?? Array(12).fill(0)
  const max    = Math.max(...data, 1)
  const yTicks = Array.from({ length: max + 1 }, (_, i) => i)

  function handleYearChange(yr: number) {
    setSelectedYear(yr)
    setSelectedMonth(yr === CURRENT_YEAR ? new Date().getMonth() : 0)
  }

  const hoveredVal = hoveredMonth !== null ? data[hoveredMonth] : null

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5">
          <BarChart2 className="h-3 w-3 text-primary shrink-0" />
          <span className="text-[12px] font-medium text-muted-foreground">Completed Projects Monthly</span>
        </div>
        <select
          value={selectedYear}
          onChange={e => handleYearChange(Number(e.target.value))}
          className="text-[11px] font-medium bg-muted/40 border border-border rounded px-2 py-0.5 text-foreground outline-none cursor-pointer hover:bg-muted/70 transition-colors"
        >
          {YEARS.map(yr => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </div>

      {/* Bar chart */}
      <div
        className="px-4 pb-3 pt-1 relative"
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        }}
        onMouseLeave={() => {
          setHoveredMonth(null)
          setTooltipPos(null)
        }}
      >
        {/* Tooltip */}
        {hoveredMonth !== null && tooltipPos && (
          <div
            className="pointer-events-none absolute z-20 rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-white shadow-lg whitespace-nowrap -translate-x-1/2 -translate-y-full"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 8 }}
          >
            <span className="font-semibold">{MONTH_ABBREVS[hoveredMonth]} {selectedYear}</span>
            <span className="ml-1.5 text-zinc-300">
              — {hoveredVal} project{hoveredVal !== 1 ? "s" : ""} completed
            </span>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-900" />
          </div>
        )}

        <svg
          width="100%"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "visible" }}
        >
          {/* Grid lines + y-axis labels */}
          {yTicks.map(tick => {
            const y = CHART_H - Math.round((tick / max) * CHART_H)
            return (
              <g key={tick}>
                <line x1={Y_W} y1={y} x2={SVG_W} y2={y}
                  stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.8} />
                <text x={Y_W - 2} y={y + 1} textAnchor="end"
                  fontSize={5} fill="currentColor" opacity={0.4} dominantBaseline="middle">
                  {tick}
                </text>
              </g>
            )
          })}

          {/* Bars + x labels */}
          {data.map((val, i) => {
            const barH     = val === 0 ? 1.5 : Math.round((val / max) * CHART_H)
            const x        = Y_W + i * (BAR_W + GAP)
            const y        = CHART_H - barH
            const isActive = i === selectedMonth
            const isHover  = i === hoveredMonth
            const opacity  = val === 0 ? 0.12 : isActive ? 1 : isHover ? 0.75 : 0.45

            return (
              <g
                key={i}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedMonth(i)}
                onMouseEnter={() => setHoveredMonth(i)}
              >
                {/* Invisible hit area */}
                <rect x={x} y={0} width={BAR_W} height={SVG_H} fill="transparent" />
                <rect
                  x={x} y={y} width={BAR_W} height={barH} rx={0}
                  fill={isActive ? "#E20074" : "#10b981"}
                  opacity={opacity}
                />
                <text
                  x={x + BAR_W / 2} y={SVG_H - 1}
                  textAnchor="middle" fontSize={5}
                  fill="currentColor"
                  opacity={isActive ? 0.9 : isHover ? 0.7 : 0.45}
                  fontWeight={isActive ? "bold" : "normal"}
                >
                  {MONTH_ABBREVS[i]}
                </text>
              </g>
            )
          })}

          {/* Y-axis line */}
          <line x1={Y_W} y1={0} x2={Y_W} y2={CHART_H}
            stroke="currentColor" strokeOpacity={0.15} strokeWidth={0.8} />
        </svg>
      </div>
    </Card>
  )
}
