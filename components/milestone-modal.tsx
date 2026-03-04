"use client"

import { useState } from "react"
import { X, CheckCircle2, ChevronDown } from "lucide-react"

export interface MilestoneData {
  id: string
  label: string
  description: string
  startDate: string
  endDate: string
  status: "Not Started" | "In Progress" | "Completed" | "At Risk"
}

const STATUSES: MilestoneData["status"][] = [
  "Not Started",
  "In Progress",
  "Completed",
  "At Risk",
]

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
  const [status,      setStatus]      = useState<MilestoneData["status"]>(initial?.status ?? "Not Started")

  function handleSave() {
    if (!label.trim()) return
    onSave({
      id:          initial?.id ?? crypto.randomUUID(),
      label:       label.trim(),
      description,
      startDate,
      endDate,
      status,
    })
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
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

        <div className="px-6 pb-6 space-y-4">

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
            <label className="block text-xs text-muted-foreground mb-1">Label</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as MilestoneData["status"])}
              className="w-full text-sm font-medium outline-none bg-transparent appearance-none cursor-pointer pr-6"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

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
