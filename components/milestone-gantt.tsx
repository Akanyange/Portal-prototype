"use client"

import { useEffect, useState } from "react"
import type { MilestoneRow, ProjectStatus } from "@/lib/projects-data"
import { STATUS_LABEL, STATUS_BADGE } from "@/lib/projects-data"

// ── Types ──────────────────────────────────────────────────────────────────────

export type GanttTimeView = "Weeks" | "Months" | "Quarters"

interface ViewConfig {
  colW: number
  totalCols: number
  daysPerCol: number
  headers: string[]
}

// ── Constants ──────────────────────────────────────────────────────────────────

const GANTT_START  = new Date(2026, 0, 5)   // Jan 5, 2026 (Monday)
const ROW_H        = 72
const HEADER_H     = 44
const LEFT_W       = 220

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const MONTHS_LONG  = ["January","February","March","April","May","June","July","August","September","October","November","December"]

// ── Helpers ────────────────────────────────────────────────────────────────────

function weekStartDate(i: number): Date {
  const d = new Date(GANTT_START)
  d.setDate(d.getDate() + i * 7)
  return d
}

function formatWeek(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}-${MONTHS_SHORT[d.getMonth()]}`
}

function getViewConfig(view: GanttTimeView): ViewConfig {
  switch (view) {
    case "Weeks":
      return {
        colW: 80,
        totalCols: 20,
        daysPerCol: 7,
        headers: Array.from({ length: 20 }, (_, i) => formatWeek(weekStartDate(i))),
      }
    case "Months":
      return {
        colW: 160,
        totalCols: 6,
        daysPerCol: 30.44,
        headers: MONTHS_LONG.slice(0, 6),   // Jan–Jun
      }
    case "Quarters":
      return {
        colW: 320,
        totalCols: 4,
        daysPerCol: 91.25,
        headers: ["Q1", "Q2", "Q3", "Q4"],
      }
  }
}

function dateToPx(iso: string, cfg: ViewConfig): number {
  const ms = new Date(iso).getTime() - GANTT_START.getTime()
  const days = ms / (24 * 60 * 60 * 1000)
  return (days / cfg.daysPerCol) * cfg.colW
}

function getTodayPx(cfg: ViewConfig): number {
  const ms = new Date().getTime() - GANTT_START.getTime()
  const days = ms / (24 * 60 * 60 * 1000)
  return (days / cfg.daysPerCol) * cfg.colW
}

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  projectName: string
  projectStatus: ProjectStatus
  milestoneRows: MilestoneRow[]
  timeView: GanttTimeView
}

export function MilestoneGantt({ projectName, projectStatus, milestoneRows, timeView }: Props) {
  const [todayPx, setTodayPx] = useState<number | null>(null)

  const cfg        = getViewConfig(timeView)
  const totalWidth = cfg.totalCols * cfg.colW

  useEffect(() => {
    setTodayPx(getTodayPx(cfg))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeView])

  return (
    <div className="rounded-lg border bg-card overflow-hidden text-sm shadow-sm">
      <div className="flex">

        {/* ── Left panel (fixed width) ───────────────────────────────────────── */}
        <div className="shrink-0 border-r flex flex-col" style={{ width: LEFT_W }}>

          {/* Header cell */}
          <div
            className="border-b bg-card px-3 flex items-center justify-between gap-2"
            style={{ height: HEADER_H }}
          >
            <span className="font-semibold text-sm truncate">{projectName}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_BADGE[projectStatus]}`}>
              {STATUS_LABEL[projectStatus]}
            </span>
          </div>

          {/* Milestone label rows */}
          {milestoneRows.map((row, ri) => (
            <div
              key={row.id + ri}
              className="border-b flex flex-col justify-center px-3"
              style={{ height: ROW_H }}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="font-semibold text-xs leading-tight">{row.name}</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">Due: {row.dueDate}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${row.status === "on-track" ? "bg-emerald-500" : "bg-orange-500"}`} />
                <span className="text-xs text-muted-foreground">
                  {row.status === "on-track" ? "On Track" : "At Risk"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Right: scrollable timeline ────────────────────────────────────── */}
        <div className="flex-1 overflow-x-auto">
          <div style={{ width: totalWidth }}>

            {/* Column header row */}
            <div className="flex border-b bg-card" style={{ height: HEADER_H }}>
              {cfg.headers.map((label, i) => (
                <div
                  key={i}
                  className="flex-none flex items-center justify-center text-[11px] text-muted-foreground border-r last:border-r-0"
                  style={{ width: cfg.colW }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Timeline rows */}
            <div className="relative">

              {/* Vertical grid lines */}
              {Array.from({ length: cfg.totalCols - 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-border/40 pointer-events-none"
                  style={{ left: (i + 1) * cfg.colW }}
                />
              ))}

              {/* Today line — client-only */}
              {todayPx !== null && todayPx >= 0 && todayPx <= totalWidth && (
                <div
                  className="absolute top-0 bottom-0 w-[1.5px] bg-primary/70 z-20 pointer-events-none"
                  style={{ left: todayPx }}
                />
              )}

              {milestoneRows.map((row, ri) => (
                <div
                  key={row.id + ri}
                  className="relative border-b bg-card"
                  style={{ height: ROW_H }}
                >
                  {/* Segments */}
                  {row.segments.map((seg, si) => {
                    const left  = dateToPx(seg.startDate, cfg)
                    const width = dateToPx(seg.endDate, cfg) - left
                    if (width <= 0) return null
                    return (
                      <div
                        key={si}
                        className="absolute"
                        style={{ left, width, top: 0, height: ROW_H }}
                      >
                        <span
                          className="absolute left-0 right-0 text-[9px] text-foreground leading-tight overflow-hidden whitespace-nowrap pl-0.5"
                          style={{ top: 16 }}
                        >
                          {seg.label}
                        </span>
                        <div
                          className={`absolute left-0 right-0 h-[7px] rounded-full ${
                            seg.type === "not-started" ? "bg-gray-300" : "bg-primary"
                          }`}
                          style={{ top: 32 }}
                        />
                      </div>
                    )
                  })}

                  {/* Diamond markers */}
                  {row.markers.map((mk, mi) => {
                    const x = dateToPx(mk.date, cfg)
                    return (
                      <div
                        key={mi}
                        className="absolute z-10"
                        style={{ left: x, top: 0, height: ROW_H }}
                      >
                        <div
                          className={`absolute h-3 w-3 rotate-45 ${
                            mk.status === "completed"
                              ? "bg-primary"
                              : "bg-card border-2 border-gray-400"
                          }`}
                          style={{ top: 29, transform: "translate(-50%, 0)" }}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Legend ────────────────────────────────────────────────────────────── */}
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
          <div className="h-2 w-8 rounded-l-full bg-primary inline-block" />
          <div className="h-2 w-3 rounded-r-full bg-gray-300 -ml-px inline-block" />
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
