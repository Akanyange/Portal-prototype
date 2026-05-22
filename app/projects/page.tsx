"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, LayoutList, GanttChartSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectsTable } from "@/components/projects-table"
import { GanttChart } from "@/components/gantt-chart"
import { useRole } from "@/lib/role-context"

type View  = "list" | "timeline"
type Scope = "all" | "mine"

export default function ProjectsPage() {
  const { role } = useRole()
  const [view,  setView]  = useState<View>("list")
  const [scope, setScope] = useState<Scope>("all")

  return (
    <div className="space-y-4">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Projects</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Browse and manage all projects across tribes and portfolio elements.</p>
        </div>
        <Link href="/projects/new">
          <Button className="rounded-full px-5 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
            <Plus className="h-4 w-4" />
            Add New Project
          </Button>
        </Link>
      </div>

      {/* ── View tabs + scope toggle ──────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-1">
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

        {/* My / All Projects — Project Managers only */}
        {role === "Project Manager" && (
          <div className="flex items-center bg-muted rounded-lg p-0.5 mb-px">
            {(["mine", "all"] as Scope[]).map(s => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  scope === s
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "mine" ? "My Projects" : "All Projects"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {view === "list" ? <ProjectsTable scope={scope} /> : <GanttChart scope={scope} />}
    </div>
  )
}
