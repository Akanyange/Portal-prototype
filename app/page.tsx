import Link from "next/link"
import { TrendingUp, Activity, LayoutList } from "lucide-react"
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Projects Overview</h1>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Card 1 – All Projects Statuses */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-1.5 px-3 py-1">
            <LayoutList className="h-3 w-3 text-primary shrink-0" />
            <span className="text-[11px] font-medium text-muted-foreground">All Projects Status</span>
          </div>
          <div className="px-3 pb-1.5">
            <StatusPieChart slices={PIE_SLICES} total={TOTAL} compact />
          </div>
        </Card>

        {/* Card 2 – Total Completed */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-1.5 px-3 py-1">
            <LayoutList className="h-3 w-3 text-primary shrink-0" />
            <span className="text-[11px] font-medium text-muted-foreground">Total Completed Projects</span>
          </div>
          <div className="px-3 py-1">
            <span className="text-lg font-bold leading-none">{COMPLETED}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 pb-1.5">
            <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="text-[10px] text-emerald-400 flex-1">+5% vs last month</span>
            <Link href="/projects" className="text-[10px] text-primary font-medium hover:underline whitespace-nowrap">
              View All &gt;
            </Link>
          </div>
        </Card>

        {/* Card 3 – Ongoing Projects */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-1.5 px-3 py-1">
            <Activity className="h-3 w-3 text-primary shrink-0" />
            <span className="text-[11px] font-medium text-muted-foreground">Ongoing Projects</span>
          </div>
          <div className="px-3 pb-1.5 py-1">
            <span className="text-lg font-bold leading-none">{ONGOING}</span>
          </div>
        </Card>
      </div>

      {/* ── Project / Timeline section ────────────────────────────────────── */}
      <ProjectFilters />
      <GanttChart />
    </div>
  )
}
