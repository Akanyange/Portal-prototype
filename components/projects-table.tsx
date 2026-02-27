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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectAll, setSelectAll] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

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

  function handlePerPage(value: string) {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">

      {/* ── Header bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b gap-3 flex-wrap">
        <span className="font-semibold text-sm">Projects List</span>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort */}
          <button className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors whitespace-nowrap">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Sort:</span>
            <span>Due date</span>
          </button>

          {/* Filter */}
          <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors">
            Filter
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {/* Search */}
          <div className="flex items-center gap-2 border rounded-full px-3 py-1.5 bg-background min-w-[200px]">
            <input
              placeholder="Search"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            />
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </div>
      </div>

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
              <th className="px-3 py-3 text-left font-semibold text-foreground whitespace-nowrap">Visibility</th>
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
                  <span className="font-medium underline underline-offset-2 cursor-pointer hover:text-primary transition-colors whitespace-nowrap">
                    {project.name}
                  </span>
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

                {/* Visibility */}
                <td className="px-3 py-3 text-muted-foreground">{project.visibility}</td>

                {/* Status */}
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_BADGE[project.status]}`}>
                    {STATUS_LABEL[project.status]}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-3 py-3">
                  <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
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
          <DropdownMenuContent align="start" side="top" className="min-w-[120px]">
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
    </div>
  )
}
