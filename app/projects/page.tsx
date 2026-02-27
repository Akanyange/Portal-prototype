"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectsTable } from "@/components/projects-table"
import { GanttChart } from "@/components/gantt-chart"
import { ProjectFilters } from "@/components/project-filters"

type View = "list" | "timeline"

export default function ProjectsPage() {
  const [view, setView] = useState<View>("list")

  return (
    <div className="space-y-5">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">All Projects</h1>
        <Button className="rounded-full px-5 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add New Project
        </Button>
      </div>

      {/* ── Filters + view tabs ─────────────────────────────────────────────── */}
      <ProjectFilters activeView={view} onViewChange={setView} />

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {view === "list" ? <ProjectsTable /> : <GanttChart />}
    </div>
  )
}
