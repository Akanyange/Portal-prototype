"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, ChevronRight, CalendarDays, User, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { projects, STATUS_DOT, STATUS_LABEL, type TaskStatus, type GanttMilestone } from "@/lib/projects-data"
import { useRole } from "@/lib/role-context"
import { MilestoneViewModal } from "@/components/milestone-view-modal"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentYearFraction(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1).getTime()
  const end   = new Date(now.getFullYear() + 1, 0, 1).getTime()
  return (now.getTime() - start) / (end - start)
}

const ORDINAL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

function positionToDateStr(position: number): string {
  const d = new Date(2026, 0, 1 + Math.round(position * 365))
  const day = d.getDate()
  const suffix = [11,12,13].includes(day) ? "th"
    : day % 10 === 1 ? "st"
    : day % 10 === 2 ? "nd"
    : day % 10 === 3 ? "rd" : "th"
  return `${day}${suffix} ${ORDINAL_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const QUARTERS = ["Q1","Q2","Q3","Q4"]
const ROW_H    = 66

const ACCORDION_H = 88

const TASK_BAR: Record<TaskStatus, string> = {
  "completed":   "bg-primary",
  "in-progress": "bg-primary",
  "not-started": "bg-gray-300",
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GanttChart() {
  const router = useRouter()
  const { role } = useRole()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [todayFraction, setTodayFraction] = useState<number | null>(null)
  const [activeMilestone, setActiveMilestone] = useState<{ ms: GanttMilestone; projectName: string } | null>(null)

  const visibleProjects = role === "General User"
    ? projects.filter(p => p.visibility === "Public")
    : projects

  useEffect(() => {
    setTodayFraction(getCurrentYearFraction())
  }, [])

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="rounded-lg border bg-card overflow-hidden text-sm shadow-sm">
      <div className="flex">

        {/* ── Left panel ───────────────────────────────────────────────────── */}
        <div className="w-[268px] shrink-0 border-r flex flex-col">
          {/* Header cell — same height as Q + month headers (72 px) */}
          <div className="h-[72px] flex items-center justify-between px-4 border-b bg-card">
            <span className="font-semibold text-sm">Projects</span>
            {role !== "General User" && (
              <div className="relative group">
                <Link href="/projects/new">
                  <Button size="icon" variant="outline" className="h-7 w-7 rounded-full border-muted-foreground/30">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">
                  Add New Project
                </div>
              </div>
            )}
          </div>

          {/* Project rows */}
          {visibleProjects.map(project => {
            const isOpen  = expanded.has(project.id)
            const totalH  = isOpen ? ROW_H + ACCORDION_H : ROW_H
            return (
              <div key={project.id} className="border-b overflow-hidden" style={{ height: totalH }}>
                {/* Main row */}
                <div
                  className="flex items-center gap-2 px-3 cursor-pointer hover:bg-muted/40 transition-colors"
                  style={{ height: ROW_H }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <ChevronRight
                    className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
                    onClick={e => { e.stopPropagation(); toggle(project.id) }}
                  />
                  {/* T-logo */}
                  <div className="h-7 w-7 shrink-0 rounded-sm bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                    T
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate leading-tight">{project.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[project.status]}`} />
                      <span className="text-xs text-muted-foreground">{STATUS_LABEL[project.status]}</span>
                    </div>
                  </div>
                </div>

                {/* Accordion details */}
                {isOpen && (
                  <div className="px-4 pb-3 space-y-1.5 bg-muted/30 border-t border-border" style={{ height: ACCORDION_H }}>
                    <div className="flex items-center gap-1.5 pt-2">
                      <User className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-[11px] text-muted-foreground">Lead:</span>
                      <span className="text-[11px] font-medium truncate">{project.lead}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-[11px] text-muted-foreground">Deadline:</span>
                      <span className="text-[11px] font-medium">{project.endDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-[11px] text-muted-foreground">Jira:</span>
                      <a
                        href={project.boardUrl}
                        onClick={e => e.stopPropagation()}
                        className="text-[11px] text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                      >
                        Open board
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Right: scrollable timeline ────────────────────────────────────── */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[780px]">

            {/* Quarter header row */}
            <div className="flex h-9 border-b bg-card">
              {QUARTERS.map(q => (
                <div key={q} className="flex-1 flex items-center justify-center text-xs font-medium text-muted-foreground border-r last:border-r-0">
                  {q}
                </div>
              ))}
            </div>

            {/* Month header row */}
            <div className="flex h-[33px] border-b bg-card">
              {MONTHS.map(month => (
                <div key={month} className="flex-1 flex items-center justify-center text-[11px] text-muted-foreground border-r last:border-r-0 min-w-[62px]">
                  {month}
                </div>
              ))}
            </div>

            {/* Timeline rows */}
            <div className="relative">
              {/* Vertical month grid lines */}
              {Array.from({ length: 11 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-border/50 pointer-events-none z-0"
                  style={{ left: `${((i + 1) / 12) * 100}%` }}
                />
              ))}

              {/* Today line — only rendered client-side to avoid hydration mismatch */}
              {todayFraction !== null && (
                <div
                  className="absolute top-0 bottom-0 w-[1.5px] bg-primary/70 z-20 pointer-events-none"
                  style={{ left: `${todayFraction * 100}%` }}
                />
              )}

              {visibleProjects.map(project => {
                const isOpen = expanded.has(project.id)
                const totalH = isOpen ? ROW_H + ACCORDION_H : ROW_H
                return (
                <div
                  key={project.id}
                  className="relative border-b bg-card"
                  style={{ height: totalH }}
                >
                  {/* ── Task bars: label above + thin bar ─────────────────── */}
                  {project.tasks.map((task, i) => {
                    const leftPct  = task.start * 100
                    const widthPct = (task.end - task.start) * 100
                    return (
                      <div
                        key={i}
                        className="absolute"
                        style={{
                          left:   `${leftPct}%`,
                          width:  `calc(${widthPct}% - 2px)`,
                          top:    0,
                          height: ROW_H,
                        }}
                      >
                        {/* Bar */}
                        <div
                          className={`absolute left-0 right-0 h-3.5 rounded-full ${TASK_BAR[task.status]}`}
                          style={{ top: Math.round((ROW_H - 14) / 2) }}
                        />
                      </div>
                    )
                  })}

                  {/* ── Milestones: diamond at top of row + label below ───── */}
                  {project.milestones.map((ms, i) => (
                    <div
                      key={i}
                      className="absolute z-10"
                      style={{ left: `${ms.position * 100}%`, top: 0, height: ROW_H }}
                    >
                      {/* Diamond — sits at the very top of the row */}
                      <div
                        className={`absolute h-3 w-3 rotate-45 shrink-0 cursor-pointer hover:scale-125 transition-transform ${
                          ms.status === "completed"
                            ? "bg-primary"
                            : "bg-card border-2 border-gray-400"
                        }`}
                        style={{ top: 4, transform: "translateX(-50%)" }}
                        onClick={e => { e.stopPropagation(); setActiveMilestone({ ms, projectName: project.name }) }}
                      />
                      {/* Label — below the diamond, above the bar */}
                      {ms.label && (
                        <span
                          className="absolute text-[8px] text-muted-foreground text-center leading-tight whitespace-nowrap"
                          style={{ top: 19, transform: "translateX(-50%)", maxWidth: 60 }}
                        >
                          {ms.label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>

      {/* ── Milestone view modal ────────────────────────────────────────────── */}
      {activeMilestone && (
        <MilestoneViewModal
          title={activeMilestone.ms.label}
          status={activeMilestone.ms.status}
          timelineDate={positionToDateStr(activeMilestone.ms.position)}
          description={activeMilestone.ms.description}
          updatedAt={activeMilestone.ms.updatedAt}
          canEdit={role !== "General User"}
          onClose={() => setActiveMilestone(null)}
        />
      )}

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div className="border-t px-4 py-2.5 flex items-center justify-between text-xs text-muted-foreground bg-card">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Updated 5m ago</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rotate-45 bg-primary shrink-0" />
            <span>Milestone completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rotate-45 bg-card border-2 border-gray-400 shrink-0" />
            <span>Milestone pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-10 rounded-full bg-gray-500" />
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-10 rounded-full bg-primary" />
            <span>Ongoing / Completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
