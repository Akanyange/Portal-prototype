"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronDown, Check, Clock, Calendar, Pencil, Trash2, Plus } from "lucide-react"
import { projects } from "@/lib/projects-data"
import type { MilestoneRowStatus, StatusTrailEntry } from "@/lib/projects-data"
import { useRole } from "@/lib/role-context"
import { toast } from "@/lib/toast"
import { MilestoneModal, type MilestoneData } from "@/components/milestone-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS: {
  value: MilestoneRowStatus
  label: string
  dot: string
  badge: string
  text: string
}[] = [
  { value: "planned",   label: "Planned",   dot: "bg-blue-500",    badge: "bg-blue-500/15 border-blue-200 text-blue-700",         text: "text-blue-600"    },
  { value: "ongoing",   label: "Ongoing",   dot: "bg-amber-500",   badge: "bg-amber-500/15 border-amber-200 text-amber-700",      text: "text-amber-600"   },
  { value: "completed", label: "Completed", dot: "bg-emerald-500", badge: "bg-emerald-500/15 border-emerald-200 text-emerald-700", text: "text-emerald-600" },
]

function getStatus(value: MilestoneRowStatus) {
  return STATUS_OPTIONS.find(o => o.value === value) ?? STATUS_OPTIONS[0]
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

// ── SVG illustration for empty state ─────────────────────────────────────────

function NoMilestonesIllustration() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" aria-hidden="true">
      {/* Plant pot */}
      <path d="M22 118 L26 138 L44 138 L48 118Z" fill="hsl(var(--muted))" />
      <rect x="19" y="114" width="32" height="7" rx="3.5" fill="hsl(var(--muted-foreground))" opacity="0.35" />
      {/* Plant stem */}
      <line x1="35" y1="113" x2="35" y2="76" stroke="hsl(var(--muted-foreground))" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Leaves — magenta */}
      <path d="M35 92 C22 82 14 66 18 52 C27 66 31 79 35 92Z" fill="#E20074" />
      <path d="M35 92 C48 79 56 64 50 50 C41 64 38 78 35 92Z" fill="#E20074" opacity="0.75" />
      <path d="M35 106 C24 98 18 84 22 72 C29 84 33 95 35 106Z" fill="#E20074" opacity="0.55" />

      {/* Laptop screen */}
      <rect x="80" y="72" width="96" height="66" rx="7" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
      <rect x="85" y="77" width="86" height="52" rx="4" fill="hsl(var(--muted))" opacity="0.6" />
      {/* Screen content lines */}
      <rect x="94" y="88" width="36" height="3.5" rx="1.75" fill="hsl(var(--muted-foreground))" opacity="0.4" />
      <rect x="94" y="96" width="24" height="3.5" rx="1.75" fill="hsl(var(--muted-foreground))" opacity="0.3" />
      <rect x="94" y="104" width="30" height="3.5" rx="1.75" fill="hsl(var(--muted-foreground))" opacity="0.2" />
      {/* Laptop base */}
      <rect x="72" y="136" width="112" height="9" rx="4.5" fill="hsl(var(--muted))" opacity="0.7" />

      {/* Person head */}
      <circle cx="128" cy="42" r="20" fill="#c4a882" />
      {/* Hair */}
      <path d="M108 38 Q110 22 128 20 Q146 22 148 38 Q148 30 128 28 Q108 30 108 38Z" fill="#2a1a0a" />
      {/* Headphones */}
      <path d="M109 41 Q108 34 112 32" stroke="#1a1a2a" strokeWidth="5" strokeLinecap="round" fill="none" />
      <rect x="107" y="40" width="6" height="8" rx="3" fill="#3a3a4a" />
      <path d="M147 41 Q148 34 144 32" stroke="#1a1a2a" strokeWidth="5" strokeLinecap="round" fill="none" />
      <rect x="143" y="40" width="6" height="8" rx="3" fill="#3a3a4a" />
      {/* Body — magenta top */}
      <path d="M106 72 Q108 58 128 56 Q148 58 150 72 L156 90 H100Z" fill="#E20074" />
      {/* Arms on laptop */}
      <path d="M100 90 Q92 95 88 105" stroke="#c4a882" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M156 90 Q164 95 168 105" stroke="#c4a882" strokeWidth="9" strokeLinecap="round" fill="none" />
    </svg>
  )
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

  // Empty-state / create flow
  const [creating,          setCreating]          = useState(false)
  const [draftMilestones,   setDraftMilestones]   = useState<MilestoneData[]>([])
  const [showQuickAdd,      setShowQuickAdd]       = useState(false)
  const [editingDraft,      setEditingDraft]       = useState<MilestoneData | undefined>()
  const [pendingDeleteDraft, setPendingDeleteDraft] = useState<string | null>(null)
  const [justCreated,      setJustCreated]       = useState(false)

  // Update flow
  const [openDropdown,  setOpenDropdown]  = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<Set<string>>(new Set())
  const [hasChanges,    setHasChanges]    = useState(false)

  const currentUser =
    role === "Admin"           ? "Alycia Smith"  :
    role === "Project Manager" ? "John Manager"  : "Guest"

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

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (milestones.length === 0 && !creating) {
    return (
      <div className="space-y-5 max-w-170 mx-auto">
        <Breadcrumb id={id} name={project.name} />
        <h1 className="text-xl font-bold tracking-tight text-center">{project.name} Milestones</h1>
        <div className="flex flex-col items-center justify-center py-16 gap-5">
          <NoMilestonesIllustration />
          <p className="text-base font-semibold text-muted-foreground">No Milestones Available</p>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Milestones
          </button>
        </div>
      </div>
    )
  }

  // ── Create mode ─────────────────────────────────────────────────────────────

  if (creating) {
    function saveDraft(m: MilestoneData) {
      setDraftMilestones(prev => {
        const exists = prev.find(x => x.id === m.id)
        return exists ? prev.map(x => x.id === m.id ? m : x) : [...prev, m]
      })
      setShowQuickAdd(false)
      setEditingDraft(undefined)
    }

    function deleteDraft(draftId: string) {
      setDraftMilestones(prev => prev.filter(m => m.id !== draftId))
      setPendingDeleteDraft(null)
    }

    function handleCreateSave() {
      const newMilestones: MilestoneState[] = draftMilestones.map(d => ({
        id:          d.id,
        name:        d.label,
        dueDate:     d.endDate || "TBD",
        status:      d.status.toLowerCase() as MilestoneRowStatus,
        history:     [],
        justUpdated: false,
      }))
      setMilestones(newMilestones)
      setCreating(false)
      setJustCreated(true)
      setDraftMilestones([])
      toast("Milestones have been successfully created", "")
    }

    // Badge style keyed by MilestoneData["status"] (capitalized)
    const DRAFT_BADGE: Record<MilestoneData["status"], string> = {
      "Planned":   "bg-blue-500/15 border-blue-200 text-blue-700",
      "Ongoing":   "bg-amber-500/15 border-amber-200 text-amber-700",
      "Completed": "bg-emerald-500/15 border-emerald-200 text-emerald-700",
    }
    const DRAFT_DOT: Record<MilestoneData["status"], string> = {
      "Planned":   "bg-blue-500",
      "Ongoing":   "bg-amber-500",
      "Completed": "bg-emerald-500",
    }

    return (
      <div className="space-y-5 max-w-170 mx-auto">
        <Breadcrumb id={id} name={project.name} />
        <h1 className="text-xl font-bold tracking-tight text-center">{project.name} Milestones</h1>

        {/* Add Milestones card */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold">Add Milestones</h2>

          {/* Draft milestone list */}
          <div className="space-y-3">
            {draftMilestones.map(m => (
              <div key={m.id} className="flex items-center justify-between border rounded-xl px-4 py-3 bg-background">
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{m.label}</p>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium border ${DRAFT_BADGE[m.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${DRAFT_DOT[m.status]}`} />
                    {m.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <button
                    onClick={() => { setEditingDraft(m); setShowQuickAdd(true) }}
                    className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPendingDeleteDraft(m.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={() => { setEditingDraft(undefined); setShowQuickAdd(true) }}
            className="w-full flex items-center justify-center gap-2 border rounded-full py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Milestone
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pb-8">
          <button
            onClick={() => { setCreating(false); setDraftMilestones([]) }}
            className="flex-1 py-3 rounded-full border text-sm font-medium hover:bg-muted/30 transition-colors bg-background"
          >
            Cancel
          </button>
          <button
            disabled={draftMilestones.length === 0}
            onClick={handleCreateSave}
            className="flex-1 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>

        <Dialog open={pendingDeleteDraft !== null} onOpenChange={() => setPendingDeleteDraft(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Milestone</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground py-2">Are you sure you want to delete this milestone? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPendingDeleteDraft(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => pendingDeleteDraft && deleteDraft(pendingDeleteDraft)}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {showQuickAdd && (
          <MilestoneModal
            initial={editingDraft}
            onSave={saveDraft}
            onClose={() => { setShowQuickAdd(false); setEditingDraft(undefined) }}
          />
        )}
      </div>
    )
  }

  // ── Update view ─────────────────────────────────────────────────────────────

  const withHistory    = milestones.filter(m => m.history.length > 0).slice(0, 2)
  const withoutHistory = milestones.filter(m => m.history.length === 0).slice(0, 1)
  const displayed      = justCreated ? milestones : [...withHistory, ...withoutHistory]

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

      <Breadcrumb id={id} name={project.name} />

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

      <div className="space-y-4">
        {displayed.map(ms => {
          const cfg        = getStatus(ms.status)
          const isDropOpen = openDropdown === ms.id
          const hasHistory = ms.history.length > 0
          const isAccOpen  = openAccordion.has(ms.id)

          return (
            <div
              key={ms.id}
              className={`rounded-xl border bg-card shadow-sm overflow-hidden transition-all duration-300 ${
                ms.justUpdated ? "border-primary/40 shadow-md shadow-primary/10" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                  <span className="font-bold text-base leading-tight">{ms.name}</span>
                  <span className="text-muted-foreground/50 mx-0.5">•</span>
                  <span className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</span>
                </div>

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

              <div className="flex items-center gap-1.5 px-5 pb-3.5 -mt-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Due {ms.dueDate}</span>
              </div>

              <div className="border-t border-border">
                {hasHistory ? (
                  <>
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
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isAccOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isAccOpen && (
                      <div className="divide-y divide-border border-t border-border">
                        {ms.history.map((entry, i) => {
                          const eCfg = getStatus(entry.status)
                          return (
                            <div key={i} className="flex items-center gap-3 px-5 py-3">
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
                  <div className="flex items-center gap-2 px-5 py-3.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status Trail</span>
                    <span className="text-xs text-muted-foreground/60">— No status changes recorded yet.</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

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
      <span className="text-foreground font-medium">Milestones</span>
    </div>
  )
}
