"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { projects, STATUS_BADGE, STATUS_LABEL } from "@/lib/projects-data"
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
} from "lucide-react"

const PER_PAGE_OPTIONS = [10, 20, 50]

export function ProjectsTable() {
  const [currentPage,      setCurrentPage]      = useState(1)
  const [itemsPerPage,     setItemsPerPage]      = useState(10)
  const [showPerPageMenu,  setShowPerPageMenu]   = useState(false)
  const [selectAll,        setSelectAll]         = useState(false)
  const [selected,         setSelected]          = useState<Set<string>>(new Set())

  const totalPages = Math.max(1, Math.ceil(projects.length / itemsPerPage))
  const start      = (currentPage - 1) * itemsPerPage
  const paginated  = projects.slice(start, start + itemsPerPage)

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

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">

      {/* ── Table header bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b gap-3 flex-wrap">
        <span className="font-semibold text-sm">Projects List</span>
        <div className="flex items-center gap-2 flex-wrap">

          {/* Sort */}
          <button className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors whitespace-nowrap">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Sort:</span>
            <span className="font-medium">Due date</span>
          </button>

          {/* Filter */}
          <button className="flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors">
            Filter
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {/* Search */}
          <div className="flex items-center gap-2 border rounded-full px-3 py-1.5 bg-background min-w-[180px]">
            <input
              placeholder="Search"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            />
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-10 px-4">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
              />
            </TableHead>
            <TableHead className="font-semibold text-foreground min-w-[160px]">Project Name</TableHead>
            <TableHead className="font-semibold text-foreground min-w-[160px]">Lead</TableHead>
            <TableHead className="font-semibold text-foreground">Tribe</TableHead>
            <TableHead className="font-semibold text-foreground min-w-[160px]">PE</TableHead>
            <TableHead className="font-semibold text-foreground whitespace-nowrap">Start Date</TableHead>
            <TableHead className="font-semibold text-foreground whitespace-nowrap">Estimated End Date</TableHead>
            <TableHead className="font-semibold text-foreground">Board</TableHead>
            <TableHead className="font-semibold text-foreground">Visibility</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((project) => (
            <TableRow key={project.id} className="hover:bg-muted/30">
              {/* Checkbox */}
              <TableCell className="px-4">
                <input
                  type="checkbox"
                  checked={selected.has(project.id)}
                  onChange={() => toggleRow(project.id)}
                  className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                />
              </TableCell>

              {/* Project Name */}
              <TableCell>
                <span className="text-sm font-medium underline underline-offset-2 cursor-pointer hover:text-primary transition-colors">
                  {project.name}
                </span>
              </TableCell>

              {/* Lead */}
              <TableCell className="text-sm text-muted-foreground">{project.lead}</TableCell>

              {/* Tribe */}
              <TableCell className="text-sm text-muted-foreground">{project.tribe}</TableCell>

              {/* PE */}
              <TableCell className="text-sm text-muted-foreground">{project.pe}</TableCell>

              {/* Start Date */}
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{project.startDate}</TableCell>

              {/* Estimated End Date */}
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{project.endDate}</TableCell>

              {/* Board */}
              <TableCell>
                <a
                  href={project.boardUrl}
                  className="text-sm underline underline-offset-2 hover:text-primary transition-colors"
                >
                  Jira board
                </a>
              </TableCell>

              {/* Visibility */}
              <TableCell className="text-sm text-muted-foreground">{project.visibility}</TableCell>

              {/* Status */}
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[project.status]}`}>
                  {STATUS_LABEL[project.status]}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell>
                <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-t">

        {/* Per-page selector */}
        <div className="relative">
          <button
            onClick={() => setShowPerPageMenu(v => !v)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {itemsPerPage} per page
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showPerPageMenu && (
            <div className="absolute bottom-full mb-1 left-0 bg-card border rounded-lg shadow-md py-1 z-20 min-w-[120px]">
              {PER_PAGE_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => { setItemsPerPage(n); setCurrentPage(1); setShowPerPageMenu(false) }}
                  className={`block w-full text-left px-4 py-1.5 text-sm hover:bg-muted/50 transition-colors ${
                    n === itemsPerPage ? "font-medium text-primary" : ""
                  }`}
                >
                  {n} per page
                </button>
              ))}
            </div>
          )}
        </div>

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
    </div>
  )
}
