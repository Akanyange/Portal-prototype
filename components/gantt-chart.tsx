"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = "not-started" | "in-progress" | "completed"
type MilestoneStatus = "completed" | "not-started"
type ProjectStatus = "on-track" | "at-risk" | "paused" | "off-track"

interface GanttTask {
  label: string
  start: number  // 0–1 fraction of year
  end: number    // 0–1 fraction of year
  status: TaskStatus
}

interface GanttMilestone {
  label: string
  position: number  // 0–1 fraction of year
  status: MilestoneStatus
}

interface GanttProject {
  id: string
  name: string
  status: ProjectStatus
  tasks: GanttTask[]
  milestones: GanttMilestone[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** month 1–12, day 1–31 → year fraction 0–1 */
function f(month: number, day = 1): number {
  return (month - 1 + (day - 1) / 30) / 12
}

function getCurrentYearFraction(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1).getTime()
  const end   = new Date(now.getFullYear() + 1, 0, 1).getTime()
  return (now.getTime() - start) / (end - start)
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const QUARTERS = ["Q1","Q2","Q3","Q4"]
const ROW_H    = 66  // px — keep left & right panels in sync

const STATUS_DOT: Record<ProjectStatus, string> = {
  "on-track":  "bg-emerald-500",
  "at-risk":   "bg-orange-500",
  "paused":    "bg-gray-400",
  "off-track": "bg-red-500",
}
const STATUS_LABEL: Record<ProjectStatus, string> = {
  "on-track":  "On Track",
  "at-risk":   "At Risk",
  "paused":    "Paused",
  "off-track": "Off Track",
}
const TASK_BAR: Record<TaskStatus, string> = {
  "completed":   "bg-primary",
  "in-progress": "bg-primary",
  "not-started": "bg-gray-300",
}

// ─── Project data ─────────────────────────────────────────────────────────────

const projects: GanttProject[] = [
  {
    id: "fach-cab",
    name: "Fach CAB & Change Mgmt Agent",
    status: "on-track",
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1),    end: f(3, 8),     status: "completed"   },
      { label: "Establish API access for ChaCo",      start: f(3, 8), end: f(7),        status: "not-started" },
      { label: "Establish API access for ChaCo",      start: f(7, 5), end: f(9, 12),    status: "not-started" },
    ],
    milestones: [
      { label: "MVP\n1", position: f(3, 8),  status: "completed"   },
      { label: "MVP\n2", position: f(7, 5),  status: "completed"   },
      { label: "MVP\n3", position: f(9, 8),  status: "completed"   },
    ],
  },
  {
    id: "incident-perceptor",
    name: "Incident Perceptor",
    status: "paused",
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1),    end: f(2, 15),    status: "completed"   },
      { label: "Establish CASM-Connection via Kafka", start: f(4),    end: f(6, 28),    status: "in-progress" },
      { label: "Establish CASM-Connection via Kafka", start: f(7, 8), end: f(10, 15),   status: "not-started" },
    ],
    milestones: [
      { label: "", position: f(2, 15), status: "completed"   },
      { label: "", position: f(7, 8),  status: "not-started" },
    ],
  },
  {
    id: "mbfd",
    name: "MBfD",
    status: "off-track",
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1),  end: f(8, 20),  status: "in-progress" },
      { label: "Establish CASM-Connection via Kafka", start: f(9),  end: f(12, 31), status: "not-started" },
    ],
    milestones: [
      { label: "", position: f(8, 20),  status: "completed"   },
      { label: "", position: f(12, 25), status: "not-started" },
    ],
  },
  {
    id: "mndr",
    name: "MNDR",
    status: "at-risk",
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1), end: f(3, 28), status: "in-progress" },
    ],
    milestones: [
      { label: "", position: f(4, 12), status: "not-started" },
    ],
  },
  {
    id: "netinsights",
    name: "NetInsights",
    status: "at-risk",
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1), end: f(3, 25), status: "completed" },
    ],
    milestones: [],
  },
  {
    id: "ran-guardian",
    name: "RAN Guardian CZ",
    status: "at-risk",
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1), end: f(4, 25), status: "completed" },
    ],
    milestones: [],
  },
  {
    id: "ai-ops",
    name: "AI ops",
    status: "at-risk",
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(3, 20), end: f(8, 28), status: "in-progress" },
    ],
    milestones: [],
  },
  {
    id: "olt-swap",
    name: "OLT Swap",
    status: "at-risk",
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1), end: f(8, 28), status: "in-progress" },
    ],
    milestones: [],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function GanttChart() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [todayFraction, setTodayFraction] = useState<number | null>(null)

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
            <div className="relative group">
              <Button size="icon" variant="outline" className="h-7 w-7 rounded-full border-muted-foreground/30">
                <Plus className="h-3.5 w-3.5" />
              </Button>
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-sm">
                Add New Project
              </div>
            </div>
          </div>

          {/* Project rows */}
          {projects.map(project => (
            <div
              key={project.id}
              className="border-b cursor-pointer hover:bg-muted/40 transition-colors"
              style={{ height: ROW_H }}
              onClick={() => toggle(project.id)}
            >
              <div className="flex items-center gap-2 px-3 h-full">
                <ChevronRight
                  className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-150 ${
                    expanded.has(project.id) ? "rotate-90" : ""
                  }`}
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
            </div>
          ))}
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

              {projects.map(project => (
                <div
                  key={project.id}
                  className="relative border-b bg-card"
                  style={{ height: ROW_H }}
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
                        {/* Label */}
                        <span
                          className="absolute left-0 right-0 text-[9px] text-foreground leading-tight overflow-hidden whitespace-nowrap pl-0.5"
                          style={{ top: 18 }}
                        >
                          {task.label}
                        </span>
                        {/* Bar */}
                        <div
                          className={`absolute left-0 right-0 h-[7px] rounded-full ${TASK_BAR[task.status]}`}
                          style={{ top: 32 }}
                        />
                      </div>
                    )
                  })}

                  {/* ── Milestones: label + diamond ───────────────────────── */}
                  {project.milestones.map((ms, i) => (
                    <div
                      key={i}
                      className="absolute z-10"
                      style={{ left: `${ms.position * 100}%`, top: 0, height: ROW_H }}
                    >
                      {ms.label && (
                        <span
                          className="absolute text-[8px] text-muted-foreground text-center whitespace-pre leading-tight"
                          style={{ top: 14, transform: "translateX(-50%)" }}
                        >
                          {ms.label}
                        </span>
                      )}
                      <div
                        className={`absolute h-3 w-3 rotate-45 shrink-0 ${
                          ms.status === "completed"
                            ? "bg-primary"
                            : "bg-card border-2 border-gray-400"
                        }`}
                        style={{ top: 29, transform: "translateX(-50%)" }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div className="border-t px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground bg-card">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Updated 5m ago</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rotate-45 bg-primary shrink-0" />
          <span>Milestone completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rotate-45 bg-card border-2 border-gray-400 shrink-0" />
          <span>Milestone not started</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-10 rounded-full bg-gray-300" />
          <span>not started</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-10 rounded-full bg-primary" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-10 rounded-full bg-primary" />
          <span>Completed</span>
        </div>
      </div>
    </div>
  )
}
