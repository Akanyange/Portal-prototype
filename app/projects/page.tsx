"use client"

import { useState } from "react"
import { Plus, LayoutList, GanttChartSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectsTable } from "@/components/projects-table"
import { GanttChart } from "@/components/gantt-chart"

type View = "list" | "timeline"

export default function ProjectsPage() {
  const [view, setView] = useState<View>("list")

  return (
    <div className="space-y-4">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">All Projects</h1>
        <Button className="rounded-full px-5 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          <Plus className="h-4 w-4" />
          Add New Project
        </Button>
      </div>

      {/* ── View tabs ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-border">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-1.5 px-3 pb-2.5 pt-1 text-sm border-b-2 -mb-px transition-colors ${
            view === "list"
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutList className="h-4 w-4" />
          Projects List
        </button>
        <button
          onClick={() => setView("timeline")}
          className={`flex items-center gap-1.5 px-3 pb-2.5 pt-1 text-sm border-b-2 -mb-px transition-colors ${
            view === "timeline"
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <GanttChartSquare className="h-4 w-4" />
          Projects Timeline
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {view === "list" ? <ProjectsTable /> : <GanttChart />}
    </div>
  )
}
