"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRole } from "@/lib/role-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { projects, PM_OWNED_PROJECT_IDS, STATUS_BADGE, STATUS_LABEL, type ProjectStatus } from "@/lib/projects-data"

const PE_OPTIONS    = ["AI Network Foundations", "Service Observability", "Use case for AN L4"]
const TRIBE_OPTIONS = ["AI for Networks"]
const STATUS_OPTIONS: ProjectStatus[] = ["planned", "ongoing", "completed"]
import { toast } from "@/lib/toast"
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Archive,
  MoreHorizontal,
  Search,
  Trash2,
  Milestone,
} from "lucide-react"

const PER_PAGE_OPTIONS = [10, 20, 50]

interface ProjectsTableProps {
  defaultTribe?: string
  hideHeader?: boolean
  scope?: "all" | "mine"
}

export function ProjectsTable({ defaultTribe = "", hideHeader = false, scope: scopeProp = "all" }: ProjectsTableProps) {
  const router = useRouter()
  const { role } = useRole()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectAll, setSelectAll] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "archive"
    projectId: string
    projectName: string
  } | null>(null)
  const [filterPE,     setFilterPE]     = useState<string>("")
  const [filterTribe,  setFilterTribe]  = useState<string>(defaultTribe)
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [scope,        setScope]        = useState<"all" | "mine">(scopeProp)

  const roleFiltered = projects
    .filter(p => role !== "General User" || p.visibility === "Public")
    .filter(p => scope !== "mine" || PM_OWNED_PROJECT_IDS.has(p.id))

  const visibleProjects = roleFiltered.filter(p => {
    if (filterPE     && p.pe     !== filterPE)     return false
    if (filterTribe  && p.tribe  !== filterTribe)  return false
    if (filterStatus && p.status !== filterStatus) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(visibleProjects.length / itemsPerPage))
  const start      = (currentPage - 1) * itemsPerPage
  const paginated  = visibleProjects.slice(start, start + itemsPerPage)

  function toggleRow(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectAll) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paginated.map(p => p.id)))
    }
    setSelectAll(!selectAll)
  }

  function goTo(page: number) {
    setCurrentPage(Math.min(totalPages, Math.max(1, page)))
  }

  function handlePerPage(value: string) {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">

      {/* ── Header bar ────────────────────────────────────────────────────── */}
      {!hideHeader && <div className="flex items-center justify-between px-4 py-3 border-b gap-3 flex-wrap">
        <span className="font-semibold text-sm">Projects List</span>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort */}
          <button className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors whitespace-nowrap">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Sort:</span>
            <span>Due date</span>
          </button>

          {/* Portfolio Element filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none">
                {filterPE || "Portfolio Element"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuRadioGroup value={filterPE} onValueChange={v => { setFilterPE(v === filterPE ? "" : v); setCurrentPage(1) }}>
                {PE_OPTIONS.map(opt => (
                  <DropdownMenuRadioItem key={opt} value={opt}>{opt}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tribe filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none">
                {filterTribe || "Tribe"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuRadioGroup value={filterTribe} onValueChange={v => { setFilterTribe(v === filterTribe ? "" : v); setCurrentPage(1) }}>
                {TRIBE_OPTIONS.map(opt => (
                  <DropdownMenuRadioItem key={opt} value={opt}>{opt}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none">
                {filterStatus ? STATUS_LABEL[filterStatus as ProjectStatus] : "Status"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              <DropdownMenuRadioGroup value={filterStatus} onValueChange={v => { setFilterStatus(v === filterStatus ? "" : v); setCurrentPage(1) }}>
                {STATUS_OPTIONS.map(opt => (
                  <DropdownMenuRadioItem key={opt} value={opt}>{STATUS_LABEL[opt]}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assigned to me / All — PM only */}
          {role === "Project Manager" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none ${scope === "mine" ? "border-primary text-primary" : ""}`}>
                  {scope === "mine" ? "Assigned to me" : "All Projects"}
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuRadioGroup value={scope} onValueChange={v => { setScope(v as "all" | "mine"); setCurrentPage(1) }}>
                  <DropdownMenuRadioItem value="all">All Projects</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mine">Assigned to me</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Search */}
          <div className="flex items-center gap-2 border rounded-full px-3 py-1.5 bg-background min-w-50">
            <input
              placeholder="Search"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            />
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </div>
      </div>}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="w-10 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-left font-semibold text-foreground whitespace-nowrap">Project Name</th>
              <th className="px-3 py-3 text-left font-semibold text-foreground whitespace-nowrap">Lead</th>
              <th className="px-3 py-3 text-left font-semibold text-foreground whitespace-nowrap">Tribe</th>
              <th className="px-3 py-3 text-left font-semibold text-foreground whitespace-nowrap">PE</th>
              <th className="px-3 py-3 text-left font-semibold text-foreground whitespace-nowrap">Start Date</th>
              <th className="px-3 py-3 text-left font-semibold text-foreground whitespace-nowrap">Estimated End Date</th>
              <th className="px-3 py-3 text-left font-semibold text-foreground whitespace-nowrap">Board</th>
              <th className="px-3 py-3 text-left font-semibold text-foreground whitespace-nowrap">Status</th>
              <th className="px-3 py-3 text-left font-semibold text-foreground whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((project) => (
              <tr key={project.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                {/* Checkbox */}
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(project.id)}
                    onChange={() => toggleRow(project.id)}
                    className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                  />
                </td>

                {/* Project Name */}
                <td className="px-3 py-3">
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium underline underline-offset-2 hover:text-primary transition-colors whitespace-nowrap"
                  >
                    {project.name}
                  </Link>
                </td>

                {/* Lead */}
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{project.lead}</td>

                {/* Tribe */}
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{project.tribe}</td>

                {/* PE */}
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{project.pe}</td>

                {/* Start Date */}
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{project.startDate}</td>

                {/* Estimated End Date */}
                <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{project.endDate}</td>

                {/* Board */}
                <td className="px-3 py-3">
                  <a
                    href={project.boardUrl}
                    className="underline underline-offset-2 hover:text-primary transition-colors whitespace-nowrap"
                  >
                    Jira board
                  </a>
                </td>

                {/* Status */}
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_BADGE[project.status]}`}>
                    {STATUS_LABEL[project.status]}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-3 py-3">
                  {role === "General User" ? null : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/edit`)}>
                          <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/milestones`)}>
                          <Milestone className="h-3.5 w-3.5 mr-2" /> View Milestones
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setConfirmAction({ type: "archive", projectId: project.id, projectName: project.name })}>
                          <Archive className="h-3.5 w-3.5 mr-2" /> Archive
                        </DropdownMenuItem>
                        {role === "Admin" && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setConfirmAction({ type: "delete", projectId: project.id, projectName: project.name })}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-t">

        {/* Per-page selector — uses portal so it's never clipped */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
              {itemsPerPage} per page
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="min-w-30">
            <DropdownMenuRadioGroup value={String(itemsPerPage)} onValueChange={handlePerPage}>
              {PER_PAGE_OPTIONS.map(n => (
                <DropdownMenuRadioItem key={n} value={String(n)}>
                  {n} per page
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => goTo(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 flex items-center justify-center rounded-full border text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 flex items-center justify-center rounded-full border text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <span className="px-3 text-sm text-muted-foreground whitespace-nowrap">
            {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 flex items-center justify-center rounded-full border text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => goTo(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 flex items-center justify-center rounded-full border text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Confirm modal ─────────────────────────────────────────────────── */}
      {confirmAction && (
        <Dialog open onOpenChange={() => setConfirmAction(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{confirmAction.type === "delete" ? "Delete Project" : "Archive Project"}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-2">
              Are you sure you want to {confirmAction.type} <span className="text-foreground font-medium">&ldquo;{confirmAction.projectName}&rdquo;</span>?
              {confirmAction.type === "delete" && " This action cannot be undone."}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
              <Button
                variant={confirmAction.type === "delete" ? "destructive" : "default"}
                onClick={() => {
                  const action = confirmAction
                  setConfirmAction(null)
                  if (action.type === "delete") {
                    toast("Project deleted", `"${action.projectName}" has been removed.`, "error")
                  } else {
                    toast("Project archived", `"${action.projectName}" has been archived.`)
                  }
                }}
              >
                {confirmAction.type === "delete" ? "Delete" : "Archive"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
