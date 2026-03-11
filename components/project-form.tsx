"use client"

import { useState } from "react"
import {
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Info,
  CheckCircle2,
} from "lucide-react"
import { MilestoneModal, type MilestoneData } from "@/components/milestone-modal"

// ── Constants ──────────────────────────────────────────────────────────────────

const TRIBES = [
  "AI for Networks",
  "Core Network",
  "Digital Channels",
  "Data & Analytics",
]

const PES = [
  "AI Network Foundations",
  "Service Observability",
  "Use case for AN L4",
  "Core Platform",
]

const STATUS_COLORS: Record<MilestoneData["status"], string> = {
  "Not Started": "bg-muted text-muted-foreground",
  "In Progress":  "bg-blue-500/20 text-blue-400",
  "Completed":    "bg-emerald-500/20 text-emerald-400",
  "At Risk":      "bg-orange-500/20 text-orange-400",
}

// ── Accordion section ──────────────────────────────────────────────────────────

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <span className="font-semibold text-sm">{title}</span>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t px-5 pt-4 pb-5 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Labelled field wrapper ─────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="border rounded-xl px-4 pt-4 pb-3">
      <label className="block text-xs text-muted-foreground mb-0.5">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────────

export interface ProjectFormInitialData {
  name: string
  description: string
  startDate: string
  endDate: string
  tribe: string
  pe: string
  isPublic: boolean
  boardUrl: string
  leadEmail: string
  milestones: MilestoneData[]
}

interface ProjectFormProps {
  mode: "create" | "edit"
  initialData?: ProjectFormInitialData
  projectId?: string
  onSave: (data: ProjectFormInitialData) => void
  onCancel: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProjectForm({ mode, initialData, onSave, onCancel }: ProjectFormProps) {
  // Form state
  const [name,        setName]        = useState(initialData?.name        ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [startDate,   setStartDate]   = useState(initialData?.startDate   ?? "")
  const [endDate,     setEndDate]     = useState(initialData?.endDate     ?? "")
  const [tribe,       setTribe]       = useState(initialData?.tribe       ?? "")
  const [pe,          setPe]          = useState(initialData?.pe          ?? "")
  const [isPublic,    setIsPublic]    = useState(initialData?.isPublic    ?? true)
  const [boardUrl,    setBoardUrl]    = useState(initialData?.boardUrl    ?? "")
  const [leadEmail,   setLeadEmail]   = useState(initialData?.leadEmail   ?? "")
  const [milestones,  setMilestones]  = useState<MilestoneData[]>(initialData?.milestones ?? [])

  // Accordion state
  const [openInfo,       setOpenInfo]       = useState(false)
  const [openContact,    setOpenContact]    = useState(false)
  const [openMilestones, setOpenMilestones] = useState(false)

  // Milestone modal
  const [showModal,        setShowModal]        = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<MilestoneData | undefined>()

  // Tooltip
  const [showTooltip, setShowTooltip] = useState(false)

  function openAddMilestone() {
    setEditingMilestone(undefined)
    setShowModal(true)
  }

  function openEditMilestone(m: MilestoneData) {
    setEditingMilestone(m)
    setShowModal(true)
  }

  function handleSaveMilestone(m: MilestoneData) {
    setMilestones(prev => {
      const exists = prev.find(x => x.id === m.id)
      return exists ? prev.map(x => x.id === m.id ? m : x) : [...prev, m]
    })
    setShowModal(false)
    setEditingMilestone(undefined)
  }

  function deleteMilestone(id: string) {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  function handleSave() {
    if (!name.trim()) return
    onSave({ name, description, startDate, endDate, tribe, pe, isPublic, boardUrl, leadEmail, milestones })
  }

  const canSave = !!name.trim()

  return (
    <>
      {/* Required fields note */}
      <p className="text-xs text-muted-foreground">
        Fields marked with <span className="text-destructive">*</span> are required.
      </p>

      {/* Card with accordion sections */}
      <div className="bg-card rounded-2xl border shadow-sm p-5 space-y-4">

        {/* ── Project Information ──────────────────────────────────────────── */}
        <Section title="Project Information" open={openInfo} onToggle={() => setOpenInfo(v => !v)}>

          {/* Name */}
          <Field label="Project Name" required>
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Input value"
                className="flex-1 text-sm outline-none placeholder:text-muted-foreground"
              />
              {name && <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>
          </Field>

          {/* Description */}
          <div className="border rounded-xl px-4 pt-4 pb-2">
            <label className="block text-xs text-muted-foreground mb-1">Project Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full text-sm outline-none resize-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" required>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full text-sm outline-none bg-transparent scheme-dark"
              />
            </Field>
            <Field label="Estimated End Date" required>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full text-sm outline-none bg-transparent scheme-dark"
              />
            </Field>
          </div>

          {/* Tribe / PE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-xl px-4 pt-4 pb-3 relative">
              <label className="block text-xs text-muted-foreground mb-0.5">
                Select a Tribe<span className="text-destructive ml-0.5">*</span>
              </label>
              <select
                value={tribe}
                onChange={e => setTribe(e.target.value)}
                className="w-full text-sm outline-none bg-card appearance-none cursor-pointer pr-6"
              >
                <option value="" disabled />
                {TRIBES.map(t => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <div className="border rounded-xl px-4 pt-4 pb-3 relative">
              <label className="block text-xs text-muted-foreground mb-0.5">
                Select Portfolio Element<span className="text-destructive ml-0.5">*</span>
              </label>
              <select
                value={pe}
                onChange={e => setPe(e.target.value)}
                className="w-full text-sm outline-none bg-card appearance-none cursor-pointer pr-6"
              >
                <option value="" disabled />
                {PES.map(p => <option key={p}>{p}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Public Project toggle + info tooltip */}
          <div className="flex items-center gap-2 py-1">
            <span className="text-sm">Public Project</span>
            <button
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic(v => !v)}
              className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors focus-visible:outline-none ${
                isPublic ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  isPublic ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Info className="h-4 w-4" />
              </button>
              {showTooltip && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 bg-foreground text-background text-xs px-3 py-2.5 rounded-lg w-64 shadow-xl leading-relaxed">
                  Public projects are visible and accessible to everyone. If you want to restrict access and keep this project only for yourself, switch the toggle to make it private.
                </div>
              )}
            </div>
          </div>

          {/* Board link */}
          <Field label="link to the board">
            <input
              value={boardUrl}
              onChange={e => setBoardUrl(e.target.value)}
              placeholder="https://"
              className="w-full text-sm outline-none placeholder:text-muted-foreground"
            />
          </Field>
        </Section>

        {/* ── Main Contact ─────────────────────────────────────────────────── */}
        <Section title="Main Contact" open={openContact} onToggle={() => setOpenContact(v => !v)}>
          <Field label="Project Lead Email" required>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={leadEmail}
                onChange={e => setLeadEmail(e.target.value)}
                placeholder="example@telekom.de"
                className="flex-1 text-sm outline-none placeholder:text-muted-foreground"
              />
              {leadEmail && <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>
          </Field>
        </Section>

        {/* ── Add Milestones ────────────────────────────────────────────────── */}
        <Section title="Add Milestones" open={openMilestones} onToggle={() => setOpenMilestones(v => !v)}>

          {/* Milestone cards */}
          {milestones.map(m => (
            <div key={m.id} className="flex items-center justify-between border rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold leading-tight">{m.label}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${STATUS_COLORS[m.status]}`}>
                  {m.status}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground shrink-0 ml-4">
                <button className="p-1.5 rounded hover:bg-muted/50 hover:text-foreground transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openEditMilestone(m)}
                  className="p-1.5 rounded hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteMilestone(m.id)}
                  className="p-1.5 rounded hover:bg-muted/50 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add button */}
          <button
            type="button"
            onClick={openAddMilestone}
            className="w-full flex items-center justify-center gap-2 border rounded-full py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Milestone
          </button>
        </Section>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-4 pb-8">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-full border text-sm font-medium hover:bg-muted/30 transition-colors bg-background"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mode === "create" ? "Save Project" : "Save Changes"}
        </button>
      </div>

      {/* Milestone modal */}
      {showModal && (
        <MilestoneModal
          initial={editingMilestone}
          onSave={handleSaveMilestone}
          onClose={() => { setShowModal(false); setEditingMilestone(undefined) }}
        />
      )}
    </>
  )
}
