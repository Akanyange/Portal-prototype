"use client"

import { useEffect, useState } from "react"
import type { MilestoneRow, MilestoneMarker, ProjectStatus } from "@/lib/projects-data"
import { STATUS_LABEL, STATUS_BADGE } from "@/lib/projects-data"
import { MilestoneViewModal } from "@/components/milestone-view-modal"
import { MilestoneModal, type MilestoneData } from "@/components/milestone-modal"

// ── Types ──────────────────────────────────────────────────────────────────────

export type GanttTimeView = "Weeks" | "Months" | "Quarters"

interface ViewConfig {
  colW: number
  totalCols: number
  daysPerCol: number
  headers: string[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const ORDINAL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

function formatIsoDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const suffix = [11,12,13].includes(day) ? "th"
    : day % 10 === 1 ? "st"
    : day % 10 === 2 ? "nd"
    : day % 10 === 3 ? "rd" : "th"
  return `${day}${suffix} ${ORDINAL_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ── Constants ──────────────────────────────────────────────────────────────────

const GANTT_START  = new Date(2026, 0, 5)   // Jan 5, 2026 (Monday)
const ROW_H        = 76
const HEADER_H     = 44
const LEFT_W       = 268
const BAR_H        = 14    // px — matches main gantt chart
const DIAMOND_S    = 18    // px — rotated square side length

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

function pxToShortDate(px: number, cfg: ViewConfig): string {
  const days = (px / cfg.colW) * cfg.daysPerCol
  const d = new Date(GANTT_START.getTime() + days * 24 * 60 * 60 * 1000)
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
  canEdit?: boolean
}

export function MilestoneGantt({ projectName, projectStatus, milestoneRows, timeView, canEdit }: Props) {
  const [todayPx,  setTodayPx]  = useState<number | null>(null)
  const [hoverPx,  setHoverPx]  = useState<number | null>(null)
  const [activeMarker,  setActiveMarker]  = useState<{ marker: MilestoneMarker; rowIdx: number; mkIdx: number; rowName: string } | null>(null)
  const [editingMarker, setEditingMarker] = useState<{ marker: MilestoneMarker; rowIdx: number; mkIdx: number; rowName: string } | null>(null)
  const [markerOverrides, setMarkerOverrides] = useState<Record<string, Partial<MilestoneMarker>>>({})

  function getMarker(rowIdx: number, mkIdx: number, mk: MilestoneMarker): MilestoneMarker {
    const ov = markerOverrides[`${rowIdx}-${mkIdx}`]
    return ov ? { ...mk, ...ov } : mk
  }

  function markerToModalData(mk: MilestoneMarker, rowName: string): MilestoneData {
    const STATUS_MAP: Record<string, MilestoneData["status"]> = {
      "completed":   "Completed",
      "not-started": "Not Started",
    }
    return {
      id:          "",
      label:       rowName,
      description: mk.description ?? "",
      startDate:   mk.date,
      endDate:     mk.date,
      status:      STATUS_MAP[mk.status] ?? "Not Started",
    }
  }

  function handleMarkerModalSave(data: MilestoneData) {
    if (!editingMarker) return
    const STATUS_MAP: Record<string, MilestoneMarker["status"]> = {
      "Completed":   "completed",
      "Not Started": "not-started",
      "In Progress": "not-started",
      "At Risk":     "not-started",
    }
    const key = `${editingMarker.rowIdx}-${editingMarker.mkIdx}`
    setMarkerOverrides(prev => ({
      ...prev,
      [key]: { description: data.description, status: STATUS_MAP[data.status] },
    }))
    setEditingMarker(null)
  }

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
            <div
              className="relative"
              onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                setHoverPx(e.clientX - rect.left)
              }}
              onMouseLeave={() => setHoverPx(null)}
            >

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

              {/* Hover date line */}
              {hoverPx !== null && hoverPx >= 0 && hoverPx <= totalWidth && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-primary/40 z-20 pointer-events-none"
                  style={{ left: hoverPx }}
                >
                  <span
                    className="absolute top-0.5 left-1.5 text-[9px] font-medium text-foreground/70 bg-card border border-border rounded px-1 py-0.5 whitespace-nowrap leading-none shadow-sm"
                  >
                    {pxToShortDate(hoverPx, cfg)}
                  </span>
                </div>
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
                    // vertical rhythm: label at 10px, bar centred at 38px
                    const barTop = Math.round((ROW_H - BAR_H) / 2) + 4
                    return (
                      <div
                        key={si}
                        className="absolute"
                        style={{ left, width, top: 0, height: ROW_H }}
                      >
                        <div
                          className={`absolute left-0 right-0 rounded-full ${
                            seg.type === "not-started"
                              ? "bg-gray-300 dark:bg-gray-600"
                              : seg.type === "in-progress"
                              ? "bg-primary/80"
                              : "bg-primary"
                          }`}
                          style={{ top: barTop, height: BAR_H }}
                        />
                      </div>
                    )
                  })}

                  {/* Diamond markers */}
                  {row.markers.map((rawMk, mi) => {
                    const mk     = getMarker(ri, mi, rawMk)
                    const x      = dateToPx(mk.date, cfg)
                    const barTop = Math.round((ROW_H - BAR_H) / 2) + 4
                    const diamondTop = barTop + BAR_H / 2 - DIAMOND_S / 2
                    return (
                      <div
                        key={mi}
                        className="absolute z-10"
                        style={{ left: x, top: 0, height: ROW_H }}
                      >
                        {/* Label above diamond */}
                        <span
                          className="absolute text-[9px] font-semibold text-foreground/80 whitespace-nowrap leading-tight"
                          style={{
                            top: diamondTop - 14,
                            transform: "translateX(-50%)",
                            maxWidth: 80,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {row.name}
                        </span>
                        {/* Diamond */}
                        <div
                          className={`absolute cursor-pointer hover:scale-125 transition-transform ${
                            mk.status === "completed"
                              ? "bg-primary"
                              : "bg-card border-2 border-gray-400"
                          }`}
                          style={{
                            width:  DIAMOND_S,
                            height: DIAMOND_S,
                            top:    diamondTop,
                            transform: "translateX(-50%) rotate(45deg)",
                          }}
                          onClick={e => { e.stopPropagation(); setActiveMarker({ marker: mk, rowIdx: ri, mkIdx: mi, rowName: row.name }) }}
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

      {/* ── Marker view modal ─────────────────────────────────────────────────── */}
      {activeMarker && !editingMarker && (
        <MilestoneViewModal
          title={activeMarker.rowName}
          status={activeMarker.marker.status}
          timelineDate={formatIsoDate(activeMarker.marker.date)}
          description={activeMarker.marker.description}
          updatedAt={activeMarker.marker.updatedAt}
          canEdit={canEdit}
          onClose={() => setActiveMarker(null)}
          onEditClick={() => setEditingMarker(activeMarker)}
        />
      )}

      {/* ── Marker edit modal ─────────────────────────────────────────────────── */}
      {editingMarker && (
        <MilestoneModal
          initial={markerToModalData(editingMarker.marker, editingMarker.rowName)}
          onClose={() => setEditingMarker(null)}
          onSave={handleMarkerModalSave}
        />
      )}

      {/* ── Legend ────────────────────────────────────────────────────────────── */}
      <div className="border-t px-4 py-2.5 flex items-center justify-between text-xs text-muted-foreground bg-card">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Updated 5m ago</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rotate-45 bg-primary shrink-0" />
            <span>Milestone completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rotate-45 bg-card border-2 border-gray-400 shrink-0" />
            <span>Milestone not started</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span>not started</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-10 rounded-full bg-primary/80" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-10 rounded-full bg-primary" />
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
