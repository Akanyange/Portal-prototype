import Link from "next/link"
import { TrendingUp, Activity, Calendar, Search, ChevronDown, LayoutList, GanttChartSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GanttChart } from "@/components/gantt-chart"

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
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center gap-2 text-primary">
              <LayoutList className="h-4 w-4 shrink-0" />
              <CardTitle className="text-sm font-medium text-foreground">All Projects Statuses</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            <span className="text-4xl font-bold">{TOTAL}</span>
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
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center gap-2 text-primary">
              <LayoutList className="h-4 w-4 shrink-0" />
              <CardTitle className="text-sm font-medium text-foreground">Total Completed Projects</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2">
            <span className="text-4xl font-bold">15</span>
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              <span>5% increase than last month</span>
            </div>
            <Link href="/projects" className="block text-sm text-primary font-medium hover:underline">
              View All &gt;
            </Link>
          </CardContent>
        </Card>

        {/* Card 3 – Active Projects */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center gap-2 text-primary">
              <Activity className="h-4 w-4 shrink-0" />
              <CardTitle className="text-sm font-medium text-foreground">Active Projects</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <span className="text-4xl font-bold">10</span>
          </CardContent>
        </Card>
      </div>

      {/* ── Project / Timeline section ────────────────────────────────────── */}
      <section>
        {/* Section header row */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          {/* Left: label + List/Timeline tabs */}
          <div className="flex items-center gap-4">
            <span className="font-semibold text-base">Project</span>
            <div className="flex items-center gap-0">
              {/* List tab */}
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors">
                <LayoutList className="h-4 w-4" />
                List
              </button>
              {/* Timeline tab (active) */}
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary border-b-2 border-primary transition-colors">
                <GanttChartSquare className="h-4 w-4 text-primary" />
                Timeline
              </button>
            </div>
          </div>

          {/* Right: Filter dropdowns + Date + Search */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by PE */}
            <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors">
              Filter by PE
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {/* All Tribes */}
            <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors">
              All Tribes
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {/* Date pill */}
            <div className="flex flex-col items-start border rounded-xl px-3 py-1 text-sm bg-background min-w-[110px] cursor-pointer hover:bg-muted/50 transition-colors">
              <span className="text-[10px] text-muted-foreground leading-none mb-0.5">Date</span>
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="font-semibold text-sm">2026</span>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Search pill */}
            <div className="flex items-center gap-2 border rounded-xl px-3 py-2 text-sm bg-background min-w-[160px] cursor-pointer hover:bg-muted/50 transition-colors">
              <span className="text-muted-foreground flex-1">Search</span>
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <GanttChart />
      </section>
    </div>
  )
}
