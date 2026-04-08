"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronDown, Check, Clock, Calendar } from "lucide-react"
import { projects } from "@/lib/projects-data"
import type { MilestoneRowStatus, StatusTrailEntry } from "@/lib/projects-data"
import { useRole } from "@/lib/role-context"
import { toast } from "@/lib/toast"

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS: {
  value: MilestoneRowStatus
  label: string
  dot: string
  badge: string
  text: string
}[] = [
  { value: "planned",   label: "Planned",   dot: "bg-blue-500",    badge: "bg-blue-500/15 border-blue-200 text-blue-700",       text: "text-blue-600"    },
  { value: "ongoing",   label: "Ongoing",   dot: "bg-amber-500",   badge: "bg-amber-500/15 border-amber-200 text-amber-700",    text: "text-amber-600"   },
  { value: "completed", label: "Completed", dot: "bg-emerald-500", badge: "bg-emerald-500/15 border-emerald-200 text-emerald-700", text: "text-emerald-600" },
]

function getStatus(value: MilestoneRowStatus) {
  return STATUS_OPTIONS.find(o => o.value === value) ?? STATUS_OPTIONS[3]
}

// ── Relative time (anchored to 2026-04-08) ───────────────────────────────────

const NOW = new Date("2026-04-08T12:00:00")

function relativeTime(iso: string): string {
  const diff = NOW.getTime() - new Date(iso).getTime()
  const mins  = Math.round(diff / 60_000)
  if (mins < 2)   return "just now"
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs  < 24)  return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 7)   return `${days}d ago`
  const wks = Math.round(days / 7)
  if (wks  < 5)   return `${wks}w ago`
  return `${Math.round(days / 30)}mo ago`
}

// ── Local state shape ─────────────────────────────────────────────────────────

interface MilestoneState {
  id: string
  name: string
  dueDate: string
  status: MilestoneRowStatus
  history: StatusTrailEntry[]
  justUpdated: boolean
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MilestonesUpdatePage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const { role } = useRole()

  const project = projects.find(p => p.id === id)

  const [milestones, setMilestones] = useState<MilestoneState[]>(() =>
    project?.milestoneRows?.map(m => ({
      id:          m.id,
      name:        m.name,
      dueDate:     m.dueDate,
      status:      m.status,
      history:     m.statusHistory ?? [],
      justUpdated: false,
    })) ?? []
  )

  const [openDropdown,  setOpenDropdown]  = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<Set<string>>(new Set())
  const [hasChanges,    setHasChanges]    = useState(false)

  const currentUser =
    role === "Admin"           ? "Alycia Smith"  :
    role === "Project Manager" ? "John Manager"  : "Guest"

  // Close dropdown on outside click
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  if (!project) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Project not found.{" "}
        <Link href="/projects" className="text-primary underline">Back to projects</Link>
      </div>
    )
  }

  // Show 2 milestones with history + 1 without (total 3)
  const withHistory    = milestones.filter(m => m.history.length > 0).slice(0, 2)
  const withoutHistory = milestones.filter(m => m.history.length === 0).slice(0, 1)
  const displayed      = [...withHistory, ...withoutHistory]

  if (!displayed.length) {
    return (
      <div className="space-y-5 max-w-170 mx-auto">
        <Breadcrumb id={id} name={project.name} />
        <div className="text-center py-16 text-muted-foreground">No milestones for this project.</div>
      </div>
    )
  }

  function toggleAccordion(milestoneId: string) {
    setOpenAccordion(prev => {
      const next = new Set(prev)
      next.has(milestoneId) ? next.delete(milestoneId) : next.add(milestoneId)
      return next
    })
  }

  function updateStatus(milestoneId: string, newStatus: MilestoneRowStatus) {
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId || m.status === newStatus) return m
      const entry: StatusTrailEntry = {
        status:    newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser,
      }
      // Auto-open the accordion so the new entry is visible
      setOpenAccordion(s => new Set(s).add(milestoneId))
      return { ...m, status: newStatus, history: [entry, ...m.history], justUpdated: true }
    }))
    setOpenDropdown(null)
    setHasChanges(true)
    setTimeout(() => {
      setMilestones(prev => prev.map(m =>
        m.id === milestoneId ? { ...m, justUpdated: false } : m
      ))
    }, 2000)
  }

  function handleSave() {
    toast("Milestones updated", "All milestone statuses have been saved.")
    setHasChanges(false)
    router.push(`/projects/${id}`)
  }

  return (
    <div className="space-y-5 max-w-170 mx-auto" ref={containerRef}>

      {/* Breadcrumb */}
      <Breadcrumb id={id} name={project.name} />

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Update Milestones</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{project.name}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="shrink-0 rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>

      {/* Milestone cards */}
      <div className="space-y-4">
        {displayed.map(ms => {
          const cfg         = getStatus(ms.status)
          const isDropOpen  = openDropdown === ms.id
          const hasHistory  = ms.history.length > 0
          const isAccOpen   = openAccordion.has(ms.id)

          return (
            <div
              key={ms.id}
              className={`rounded-xl border bg-card shadow-sm overflow-hidden transition-all duration-300 ${
                ms.justUpdated ? "border-primary/40 shadow-md shadow-primary/10" : "border-border"
              }`}
            >
              {/* ── Milestone header ──────────────────────────────────────── */}
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                {/* Left: dot · name · separator · status */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                  <span className="font-bold text-base leading-tight">{ms.name}</span>
                  <span className="text-muted-foreground/50 mx-0.5">•</span>
                  <span className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</span>
                </div>

                {/* Right: status dropdown trigger */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setOpenDropdown(isDropOpen ? null : ms.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${cfg.badge}`}
                  >
                    {cfg.label}
                    <ChevronDown className={`h-3 w-3 transition-transform ${isDropOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isDropOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-border bg-card shadow-xl z-20 py-1.5 overflow-hidden">
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateStatus(ms.id, opt.value)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                        >
                          <span className={`h-2 w-2 rounded-full shrink-0 ${opt.dot}`} />
                          <span className="text-sm flex-1">{opt.label}</span>
                          {ms.status === opt.value && (
                            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Due date */}
              <div className="flex items-center gap-1.5 px-5 pb-3.5 -mt-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Due {ms.dueDate}</span>
              </div>

              {/* ── Status trail ──────────────────────────────────────────── */}
              <div className="border-t border-border">
                {hasHistory ? (
                  <>
                    {/* Accordion toggle */}
                    <button
                      onClick={() => toggleAccordion(ms.id)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Status Trail
                        <span className="ml-2 normal-case font-normal text-muted-foreground/60">
                          ({ms.history.length} {ms.history.length === 1 ? "entry" : "entries"})
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                          isAccOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Accordion body */}
                    {isAccOpen && (
                      <div className="divide-y divide-border border-t border-border">
                        {ms.history.map((entry, i) => {
                          const eCfg = getStatus(entry.status)
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-3 px-5 py-3"
                            >
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${eCfg.badge}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${eCfg.dot}`} />
                                {eCfg.label}
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
                    )}
                  </>
                ) : (
                  /* No history — plain, no accordion */
                  <div className="flex items-center gap-2 px-5 py-3.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Status Trail
                    </span>
                    <span className="text-xs text-muted-foreground/60">— No status changes recorded yet.</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky bottom save bar */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-center">
          <div className="flex items-center gap-3 bg-card border border-border rounded-2xl shadow-lg px-4 py-3">
            <span className="text-sm text-muted-foreground">You have unsaved changes</span>
            <button
              onClick={handleSave}
              className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
      <span>•</span>
      <Link href={`/projects/${id}`} className="hover:text-foreground transition-colors">{name}</Link>
      <span>•</span>
      <span className="text-foreground font-medium">Update Milestones</span>
    </div>
  )
}
