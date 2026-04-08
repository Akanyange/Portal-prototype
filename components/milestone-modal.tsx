"use client"

import { useState } from "react"
import { X, CheckCircle2, ChevronDown, Clock } from "lucide-react"
import type { StatusTrailEntry } from "@/lib/projects-data"

export interface MilestoneData {
  id: string
  label: string
  description: string
  startDate: string
  endDate: string
  status: "Planned" | "Ongoing" | "Completed"
  statusHistory?: StatusTrailEntry[]
}

const STATUSES: MilestoneData["status"][] = ["Planned", "Ongoing", "Completed"]

const STATUS_STYLE: Record<MilestoneData["status"], { dot: string; badge: string }> = {
  "Planned":   { dot: "bg-blue-500",    badge: "bg-blue-500/15 border-blue-200 text-blue-700"          },
  "Ongoing":   { dot: "bg-amber-500",   badge: "bg-amber-500/15 border-amber-200 text-amber-700"        },
  "Completed": { dot: "bg-emerald-500", badge: "bg-emerald-500/15 border-emerald-200 text-emerald-700"  },
}

// Relative time anchored to 2026-04-08
const NOW = new Date("2026-04-08T12:00:00")
function relativeTime(iso: string): string {
  const diff = NOW.getTime() - new Date(iso).getTime()
  const mins = Math.round(diff / 60_000)
  if (mins < 2)  return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs  < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 7)  return `${days}d ago`
  const wks = Math.round(days / 7)
  if (wks  < 5)  return `${wks}w ago`
  return `${Math.round(days / 30)}mo ago`
}

interface Props {
  initial?: MilestoneData
  onSave: (m: MilestoneData) => void
  onClose: () => void
}

export function MilestoneModal({ initial, onSave, onClose }: Props) {
  const [label,       setLabel]       = useState(initial?.label ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [startDate,   setStartDate]   = useState(initial?.startDate ?? "")
  const [endDate,     setEndDate]     = useState(initial?.endDate ?? "")
  const [status,      setStatus]      = useState<MilestoneData["status"]>(initial?.status ?? "Planned")
  const [statusOpen,  setStatusOpen]  = useState(false)

  const trail = initial?.statusHistory ?? []

  function handleSave() {
    if (!label.trim()) return
    onSave({
      id:            initial?.id ?? crypto.randomUUID(),
      label:         label.trim(),
      description,
      startDate,
      endDate,
      status,
      statusHistory: initial?.statusHistory,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-140 mx-4 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg font-bold">
            {initial ? "Edit Milestone" : "Create New Milestone"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4 overflow-y-auto">

          {/* Label */}
          <div className="border rounded-xl px-4 pt-4 pb-3">
            <label className="block text-xs text-muted-foreground mb-0.5">Label</label>
            <div className="flex items-center gap-2">
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Mask Placeholder"
                className="flex-1 text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              {label && <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>
          </div>

          {/* Description */}
          <div className="border rounded-xl px-4 pt-4 pb-2">
            <label className="block text-xs text-muted-foreground mb-1">Milestone Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder=""
              className="w-full text-sm outline-none resize-none bg-transparent"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-xl px-4 pt-4 pb-3">
              <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
            <div className="border rounded-xl px-4 pt-4 pb-3">
              <label className="block text-xs text-muted-foreground mb-1">Estimated End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div className="border rounded-xl px-4 pt-4 pb-3 relative">
            <label className="block text-xs text-muted-foreground mb-1">Status</label>
            <button
              type="button"
              onClick={() => setStatusOpen(v => !v)}
              className="flex items-center justify-between w-full text-sm font-medium outline-none"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[status].dot}`} />
                <span>{status}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${statusOpen ? "rotate-180" : ""}`} />
            </button>
            {statusOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+2px)] z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setStatus(s); setStatusOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/40 transition-colors flex items-center gap-2"
                  >
                    <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[s].dot}`} />
                    <span className={s === status ? "text-primary font-medium" : ""}>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Trail */}
          {trail.length > 0 && (
            <div className="border rounded-xl overflow-hidden">
              <div className="px-4 pt-3 pb-2 border-b bg-muted/20">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Status Trail
                </span>
              </div>
              <div className="divide-y divide-border">
                {trail.map((entry, i) => {
                  const key = (entry.status.charAt(0).toUpperCase() + entry.status.slice(1)) as MilestoneData["status"]
                  const style = STATUS_STYLE[key] ?? STATUS_STYLE["Planned"]
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${style.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {key}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>
                          Updated {relativeTime(entry.updatedAt)} by{" "}
                          <span className="font-medium text-foreground">{entry.updatedBy}</span>
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!label.trim()}
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
