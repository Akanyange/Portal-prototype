"use client"

import { useState } from "react"
import { ChevronDown, Calendar, Search, GanttChartSquare, LayoutList } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const PE_OPTIONS    = ["AI Network Foundations", "Service Observability", "Use case for AN L4"]
const TRIBE_OPTIONS = ["AI for Networks"]
const YEAR_OPTIONS  = ["2024", "2025", "2026", "2027"]

type View = "list" | "timeline"

interface ProjectFiltersProps {
  activeView?: View
  onViewChange?: (view: View) => void
}

export function ProjectFilters({ activeView, onViewChange }: ProjectFiltersProps) {
  const [selectedPE,    setSelectedPE]    = useState<string>("")
  const [selectedTribe, setSelectedTribe] = useState<string>("")
  const [selectedYear,  setSelectedYear]  = useState<string>("2026")

  const isListActive     = !activeView || activeView === "list"
  const isTimelineActive = activeView === "timeline"

  return (
    <section>
      {/* ── Section header row ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        {/* Left: label + List / Timeline tabs */}
        <div className="flex items-center gap-4">
          <span className="font-semibold text-base">Projects</span>
          <div className="flex items-center">
            <button
              onClick={() => onViewChange?.("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border-b-2 transition-colors ${
                isListActive
                  ? "font-medium text-primary border-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              <LayoutList className={`h-4 w-4 ${isListActive ? "text-primary" : ""}`} />
              List
            </button>
            <button
              onClick={() => onViewChange?.("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border-b-2 transition-colors ${
                isTimelineActive
                  ? "font-medium text-primary border-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              <GanttChartSquare className={`h-4 w-4 ${isTimelineActive ? "text-primary" : ""}`} />
              Projects Timeline
            </button>
          </div>
        </div>

        {/* Right: dropdowns + date + search */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Portfolio Element */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none">
                {selectedPE || "Portfolio Element"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuRadioGroup value={selectedPE} onValueChange={setSelectedPE}>
                {PE_OPTIONS.map(opt => (
                  <DropdownMenuRadioItem key={opt} value={opt}>
                    {opt}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tribe */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none">
                {selectedTribe || "Tribe"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuRadioGroup value={selectedTribe} onValueChange={setSelectedTribe}>
                {TRIBE_OPTIONS.map(opt => (
                  <DropdownMenuRadioItem key={opt} value={opt}>
                    {opt}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date pill — interactive year picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-start border rounded-xl px-3 py-1 text-sm bg-background min-w-27.5 hover:bg-muted/50 transition-colors outline-none">
                <span className="text-[10px] text-muted-foreground leading-none mb-0.5">Date</span>
                <div className="flex items-center gap-2 w-full justify-between">
                  <span className="font-semibold text-sm">{selectedYear}</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-28">
              <DropdownMenuRadioGroup value={selectedYear} onValueChange={setSelectedYear}>
                {YEAR_OPTIONS.map(y => (
                  <DropdownMenuRadioItem key={y} value={y}>{y}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search pill */}
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 text-sm bg-background min-w-40 cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-muted-foreground flex-1">Search</span>
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  )
}
