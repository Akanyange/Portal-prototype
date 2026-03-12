import { LayoutList } from "lucide-react"
import { Card } from "@/components/ui/card"
import { GanttChart } from "@/components/gantt-chart"
import { ProjectFilters } from "@/components/project-filters"
import { StatusPieChart } from "@/components/status-pie-chart"
import { CompletedMonthlyChart } from "@/components/completed-monthly-chart"

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
        <CompletedMonthlyChart />
      </div>

      {/* ── Project / Timeline section ────────────────────────────────────── */}
      <ProjectFilters />
      <GanttChart />
    </div>
  )
}
