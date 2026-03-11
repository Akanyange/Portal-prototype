import { BarChart2, LayoutList } from "lucide-react"
import { Card } from "@/components/ui/card"
import { GanttChart } from "@/components/gantt-chart"
import { ProjectFilters } from "@/components/project-filters"
import { StatusPieChart } from "@/components/status-pie-chart"

// ─── Stat data ────────────────────────────────────────────────────────────────

const PLANNED   = 8
const ONGOING   = 22
const COMPLETED = 10
const TOTAL     = PLANNED + ONGOING + COMPLETED   // 40

const PIE_SLICES = [
  { label: "Planned",   count: PLANNED,   color: "#3b82f6" },
  { label: "Ongoing",   count: ONGOING,   color: "#f59e0b" },
  { label: "Completed", count: COMPLETED, color: "#10b981" },
]

// Monthly completed projects (Jan–Dec)
const MONTHLY_COMPLETED = [1, 0, 2, 1, 3, 2, 1, 2, 3, 1, 2, 0]
const MONTH_ABBREVS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function CompletedMonthlyChart() {
  const max      = Math.max(...MONTHLY_COMPLETED, 1)
  const Y_W      = 14   // y-axis label column width
  const BAR_W    = 14
  const GAP      = 5
  const CHART_H  = 46
  const LABEL_H  = 10
  const BARS_W   = MONTHLY_COMPLETED.length * (BAR_W + GAP) - GAP
  const SVG_W    = Y_W + BARS_W
  const SVG_H    = CHART_H + LABEL_H
  const Y_TICKS  = Array.from({ length: max + 1 }, (_, i) => i)   // 0 … max

  return (
    <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="xMidYMid meet">
      {/* ── Horizontal grid lines + y-axis labels ── */}
      {Y_TICKS.map(tick => {
        const y = CHART_H - Math.round((tick / max) * CHART_H)
        return (
          <g key={tick}>
            {/* grid line */}
            <line x1={Y_W} y1={y} x2={SVG_W} y2={y}
              stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.8} />
            {/* y label */}
            <text x={Y_W - 2} y={y + 1} textAnchor="end"
              fontSize={5} fill="currentColor" opacity={0.4} dominantBaseline="middle">
              {tick}
            </text>
          </g>
        )
      })}

      {/* ── Bars + x labels ── */}
      {MONTHLY_COMPLETED.map((val, i) => {
        const barH = val === 0 ? 1.5 : Math.round((val / max) * CHART_H)
        const x    = Y_W + i * (BAR_W + GAP)
        const y    = CHART_H - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={BAR_W} height={barH} rx={3}
              fill="#10b981" opacity={val === 0 ? 0.15 : 0.85} />
            <text x={x + BAR_W / 2} y={SVG_H - 1} textAnchor="middle"
              fontSize={5} fill="currentColor" opacity={0.45}>
              {MONTH_ABBREVS[i]}
            </text>
          </g>
        )
      })}

      {/* ── Y-axis line ── */}
      <line x1={Y_W} y1={0} x2={Y_W} y2={CHART_H}
        stroke="currentColor" strokeOpacity={0.15} strokeWidth={0.8} />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track project timelines and progress across all tribes</p>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:block" suppressHydrationWarning>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* ── Analytics cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Card 1 – All Projects Status (pie chart) */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <div className="flex items-center gap-1.5">
              <LayoutList className="h-3 w-3 text-primary shrink-0" />
              <span className="text-[12px] font-medium text-muted-foreground">All Projects Status</span>
            </div>
            <span className="text-[12px] font-medium text-emerald-400">+5% vs last month</span>
          </div>
          <div className="px-4 pb-3 pt-1 flex items-center">
            <StatusPieChart slices={PIE_SLICES} total={TOTAL} compact />
          </div>
        </Card>

        {/* Card 2 – Completed Projects Monthly (bar chart) */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
            <BarChart2 className="h-3 w-3 text-primary shrink-0" />
            <span className="text-[12px] font-medium text-muted-foreground">Completed Projects Monthly</span>
          </div>
          <div className="px-4 pb-3 pt-1">
            <CompletedMonthlyChart />
          </div>
        </Card>
      </div>

      {/* ── Project / Timeline section ────────────────────────────────────── */}
      <ProjectFilters />
      <GanttChart />
    </div>
  )
}
