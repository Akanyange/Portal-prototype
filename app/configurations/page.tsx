"use client"

import { useState } from "react"
import { Pencil, Trash2, Plus, Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { toast } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Tribe {
  id: string
  title: string
  dateModified: string
}

interface Portfolio {
  id: string
  title: string
  category: string
  dateModified: string
}

type Tab = "tribes" | "portfolios"

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_TRIBES: Tribe[] = [
  { id: "1", title: "AI for Network",        dateModified: "Mar. 8. 2026" },
  { id: "2", title: "Tribe 2",               dateModified: "Mar. 8. 2026" },
  { id: "3", title: "Tribe 3",               dateModified: "Mar. 8. 2026" },
]

const SEED_PORTFOLIOS: Portfolio[] = [
  { id: "1", title: "AI Network Foundations", category: "", dateModified: "Mar. 8. 2026" },
  { id: "2", title: "Service Observability",  category: "", dateModified: "Mar. 8. 2026" },
  { id: "3", title: "AN L4",                  category: "", dateModified: "Mar. 8. 2026" },
]

function todayLabel(): string {
  const d = new Date()
  return `${d.toLocaleString("en-US", { month: "short" })}. ${d.getDate()}. ${d.getFullYear()}`
}

function nextId(items: { id: string }[]): string {
  return String(Math.max(0, ...items.map(i => Number(i.id))) + 1)
}

// ── Sort icon helper ──────────────────────────────────────────────────────────

type SortDir = "asc" | "desc"

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
  return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
}

// ── Shared table shell ────────────────────────────────────────────────────────

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {children}
    </div>
  )
}

function TableHeaderRow({ cols }: { cols: string[] }) {
  return (
    <div className="flex items-center px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {cols.map((c, i) => (
        <span
          key={c}
          className={i === 0 ? "flex-1" : i === cols.length - 1 ? "w-28 text-right" : "w-44"}
        >
          {c}
        </span>
      ))}
    </div>
  )
}

// ── Tribes tab ────────────────────────────────────────────────────────────────

function TribesTab() {
  const [tribes, setTribes]   = useState<Tribe[]>(SEED_TRIBES)
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<Tribe | null>(null)
  const [title, setTitle]     = useState("")
  const [delId, setDelId]     = useState<string | null>(null)
  const [search, setSearch]   = useState("")
  const [sortField, setSortField] = useState<"title" | "dateModified">("title")
  const [sortDir, setSortDir]     = useState<SortDir>("asc")

  function toggleSort(field: "title" | "dateModified") {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("asc") }
  }

  const displayed = [...tribes]
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a[sortField].localeCompare(b[sortField]) * (sortDir === "asc" ? 1 : -1))

  function openCreate() {
    setEditing(null)
    setTitle("")
    setOpen(true)
  }

  function openEdit(t: Tribe) {
    setEditing(t)
    setTitle(t.title)
    setOpen(true)
  }

  function handleSave() {
    if (!title.trim()) return
    if (editing) {
      setTribes(prev => prev.map(t =>
        t.id === editing.id ? { ...t, title: title.trim(), dateModified: todayLabel() } : t
      ))
      toast("Tribe updated", `"${title.trim()}" has been updated.`)
    } else {
      setTribes(prev => [
        ...prev,
        { id: nextId(prev), title: title.trim(), dateModified: todayLabel() },
      ])
      toast("Tribe created", `"${title.trim()}" has been added.`)
    }
    setOpen(false)
  }

  function confirmDelete(id: string) { setDelId(id) }

  function handleDelete() {
    if (delId) setTribes(prev => prev.filter(t => t.id !== delId))
    setDelId(null)
    toast("Tribe deleted", "The tribe has been removed.", "error")
  }

  return (
    <>
      {/* Section bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Tribes</span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{tribes.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 bg-background min-w-44">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            />
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
          <Button onClick={openCreate} className="rounded-full gap-1.5 px-5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            Create New
          </Button>
        </div>
      </div>

      {/* Table */}
      <TableShell>
        {/* Sortable header */}
        <div className="flex items-center px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <button className="flex-1 flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("title")}>
            Title <SortIcon field="title" sortField={sortField} sortDir={sortDir} />
          </button>
          <button className="w-44 flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("dateModified")}>
            Date Modified <SortIcon field="dateModified" sortField={sortField} sortDir={sortDir} />
          </button>
          <span className="w-28 text-right">Actions</span>
        </div>
        {displayed.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            {search ? "No tribes match your search." : <>No tribes yet. Click <span className="text-primary font-medium">Create New</span> to add one.</>}
          </div>
        )}
        {displayed.map((t, idx) => (
          <div
            key={t.id}
            className={`flex items-center px-5 py-3.5 hover:bg-muted/20 transition-colors ${idx < displayed.length - 1 ? "border-b border-border" : ""}`}
          >
            <span className="flex-1 text-sm">{t.title}</span>
            <span className="w-44 text-sm text-muted-foreground">{t.dateModified}</span>
            <div className="w-28 flex items-center justify-end gap-3">
              <button
                onClick={() => openEdit(t)}
                className="p-1 rounded hover:bg-primary/10 text-primary transition-colors"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => confirmDelete(t.id)}
                className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </TableShell>

      {/* Create / Edit modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Tribe" : "Create New Tribe"}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tribe Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. AI for Network"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {editing ? "Save Changes" : "Create Tribe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm modal */}
      <Dialog open={delId !== null} onOpenChange={() => setDelId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Tribe</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <span className="text-foreground font-medium">&ldquo;{tribes.find(t => t.id === delId)?.title}&rdquo;</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Portfolio Elements tab ────────────────────────────────────────────────────


function PortfoliosTab() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(SEED_PORTFOLIOS)
  const [open, setOpen]             = useState(false)
  const [editing, setEditing]       = useState<Portfolio | null>(null)
  const [title, setTitle]           = useState("")
  const [delId, setDelId]           = useState<string | null>(null)
  const [search, setSearch]         = useState("")
  const [sortField, setSortField]   = useState<"title" | "dateModified">("title")
  const [sortDir, setSortDir]       = useState<SortDir>("asc")

  function toggleSort(field: "title" | "dateModified") {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("asc") }
  }

  const displayed = [...portfolios]
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a[sortField].localeCompare(b[sortField]) * (sortDir === "asc" ? 1 : -1))

  function openCreate() {
    setEditing(null)
    setTitle("")
    setOpen(true)
  }

  function openEdit(p: Portfolio) {
    setEditing(p)
    setTitle(p.title)
    setOpen(true)
  }

  function handleSave() {
    if (!title.trim()) return
    if (editing) {
      setPortfolios(prev => prev.map(p =>
        p.id === editing.id ? { ...p, title: title.trim(), dateModified: todayLabel() } : p
      ))
      toast("Portfolio Element updated", `"${title.trim()}" has been updated.`)
    } else {
      setPortfolios(prev => [
        ...prev,
        { id: nextId(prev), title: title.trim(), category: "", dateModified: todayLabel() },
      ])
      toast("Portfolio Element created", `"${title.trim()}" has been added.`)
    }
    setOpen(false)
  }

  function handleDelete() {
    if (delId) setPortfolios(prev => prev.filter(p => p.id !== delId))
    setDelId(null)
    toast("Portfolio Element deleted", "The portfolio element has been removed.", "error")
  }

  return (
    <>
      {/* Section bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Portfolio Elements</span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{portfolios.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 bg-background min-w-44">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            />
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
          <Button onClick={openCreate} className="rounded-full gap-1.5 px-5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            Create New
          </Button>
        </div>
      </div>

      {/* Table */}
      <TableShell>
        {/* Sortable header */}
        <div className="flex items-center px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <button className="flex-1 flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("title")}>
            Title <SortIcon field="title" sortField={sortField} sortDir={sortDir} />
          </button>
          <button className="w-44 flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("dateModified")}>
            Date Modified <SortIcon field="dateModified" sortField={sortField} sortDir={sortDir} />
          </button>
          <span className="w-28 text-right">Actions</span>
        </div>
        {displayed.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            {search ? "No portfolio elements match your search." : "No portfolio elements yet."}
          </div>
        )}
        {displayed.map((p, idx) => (
          <div
            key={p.id}
            className={`flex items-center px-5 py-3.5 hover:bg-muted/20 transition-colors ${idx < displayed.length - 1 ? "border-b border-border" : ""}`}
          >
            <span className="flex-1 text-sm">{p.title}</span>
            <span className="w-44 text-sm text-muted-foreground">{p.dateModified}</span>
            <div className="w-28 flex items-center justify-end gap-3">
              <button
                onClick={() => openEdit(p)}
                className="p-1 rounded hover:bg-primary/10 text-primary transition-colors"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDelId(p.id)}
                className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </TableShell>

      {/* Create / Edit modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Portfolio Element" : "Create Portfolio Element"}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Digital Transformation"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {editing ? "Save Changes" : "Create Element"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={delId !== null} onOpenChange={() => setDelId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Portfolio Element</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <span className="text-foreground font-medium">&ldquo;{portfolios.find(p => p.id === delId)?.title}&rdquo;</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ConfigurationsPage() {
  const [tab, setTab] = useState<Tab>("tribes")

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage tribes and portfolios to organize your projects effectively.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {(["tribes", "portfolios"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "tribes" ? "Tribes" : "Portfolio Elements"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {tab === "tribes"     && <TribesTab />}
        {tab === "portfolios" && <PortfoliosTab />}
      </div>
    </div>
  )
}
