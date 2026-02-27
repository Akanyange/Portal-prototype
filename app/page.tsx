import Link from "next/link"
import { TrendingUp, Activity, LayoutList } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GanttChart } from "@/components/gantt-chart"
import { ProjectFilters } from "@/components/project-filters"

// ─── Stat data ────────────────────────────────────────────────────────────────

const ON_TRACK  = 24
const AT_RISK   = 7
const PAUSED    = 6
const OFF_TRACK = 3
const TOTAL     = ON_TRACK + AT_RISK + PAUSED + OFF_TRACK   // 40

const segments = [
  { pct: (ON_TRACK  / TOTAL) * 100, color: "bg-emerald-500" },
  { pct: (AT_RISK   / TOTAL) * 100, color: "bg-orange-500"  },
  { pct: (PAUSED    / TOTAL) * 100, color: "bg-gray-300"    },
  { pct: (OFF_TRACK / TOTAL) * 100, color: "bg-red-500"     },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Projects Overview</h1>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Card 1 – All Projects Statuses */}
        <Card>
          <CardHeader className="pb-1 pt-2 px-5">
            <div className="flex items-center gap-2 text-primary">
              <LayoutList className="h-4 w-4 shrink-0" />
              <CardTitle className="text-sm font-medium text-foreground">All Projects Statuses</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-2 space-y-1">
            <span className="text-2xl font-bold">{TOTAL}</span>
            {/* Segmented bar */}
            <div className="flex h-2 rounded-full overflow-hidden gap-px">
              {segments.map(({ pct, color }, i) => (
                <div key={i} className={`${color} rounded-full`} style={{ width: `${pct}%` }} />
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                {ON_TRACK} On Track
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 inline-block" />
                {AT_RISK} At Risk
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 inline-block" />
                Paused
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
                {OFF_TRACK} Off Track
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 – Total Completed */}
        <Card>
          <CardHeader className="pb-1 pt-2 px-5">
            <div className="flex items-center gap-2 text-primary">
              <LayoutList className="h-4 w-4 shrink-0" />
              <CardTitle className="text-sm font-medium text-foreground">Total Completed Projects</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-2 space-y-1">
            <span className="text-2xl font-bold">15</span>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-sm text-emerald-600">
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span>5% increase than last month</span>
              </div>
              <Link href="/projects" className="text-sm text-primary font-medium hover:underline whitespace-nowrap">
                View All &gt;
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 – Active Projects */}
        <Card>
          <CardHeader className="pb-1 pt-2 px-5">
            <div className="flex items-center gap-2 text-primary">
              <Activity className="h-4 w-4 shrink-0" />
              <CardTitle className="text-sm font-medium text-foreground">Active Projects</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-2">
            <span className="text-2xl font-bold">10</span>
          </CardContent>
        </Card>
      </div>

      {/* ── Project / Timeline section ────────────────────────────────────── */}
      <ProjectFilters />
      <GanttChart />
    </div>
  )
}
