"use client"

import { X, Pencil, Trash2 } from "lucide-react"

export interface MilestoneViewProps {
  title: string
  status: "completed" | "not-started" | "in-progress"
  /** Single date string (already formatted for display) */
  timelineDate?: string
  /** Range start (already formatted for display) */
  timelineStart?: string
  /** Range end (already formatted for display) */
  timelineEnd?: string
  description?: string
  updatedAt?: string
  canEdit?: boolean
  onClose: () => void
}

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  "completed":   { bg: "bg-emerald-600", label: "Completed"   },
  "not-started": { bg: "bg-zinc-600",    label: "Not Started" },
  "in-progress": { bg: "bg-blue-600",    label: "In Progress" },
}

export function MilestoneViewModal({
  title,
  status,
  timelineDate,
  timelineStart,
  timelineEnd,
  description,
  updatedAt,
  canEdit,
  onClose,
}: MilestoneViewProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["not-started"]

  const timeline = timelineDate
    ? timelineDate
    : [timelineStart, timelineEnd].filter(Boolean).join(" - ")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-zinc-900 rounded-2xl p-6 w-full max-w-125 text-white shadow-2xl">

        {/* Title + close */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-xl font-bold leading-tight">{title}</h2>
          <button
            onClick={onClose}
            className="mt-0.5 shrink-0 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status badge + edit/delete actions */}
        <div className="flex items-center justify-between mb-1">
          <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${cfg.bg}`}>
            {cfg.label}
          </span>
          {canEdit && (
            <div className="flex items-center gap-3">
              <button className="text-zinc-400 hover:text-white transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
              <button className="text-zinc-400 hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Last updated */}
        {updatedAt && (
          <p className="text-xs text-zinc-400 mb-4">Last updated: {updatedAt}</p>
        )}

        {/* Timeline dates */}
        {timeline && (
          <div className="flex gap-4 mb-4 text-sm">
            <span className="text-zinc-400 shrink-0 w-28">Timeline Dates</span>
            <span className="text-white">{timeline}</span>
          </div>
        )}

        {/* Description */}
        <div>
          <p className="text-sm font-semibold mb-1.5 text-zinc-200">Description</p>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  )
}
