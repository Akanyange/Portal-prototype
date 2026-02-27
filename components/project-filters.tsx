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

type View = "list" | "timeline"

interface ProjectFiltersProps {
  activeView?: View
  onViewChange?: (view: View) => void
}

export function ProjectFilters({ activeView, onViewChange }: ProjectFiltersProps) {
  const [selectedPE,    setSelectedPE]    = useState<string>("")
  const [selectedTribe, setSelectedTribe] = useState<string>("")

  const isListActive     = !activeView || activeView === "list"
  const isTimelineActive = activeView === "timeline"

  return (
    <section>
      {/* ── Section header row ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        {/* Left: label + List / Timeline tabs */}
        <div className="flex items-center gap-4">
          <span className="font-semibold text-base">Project</span>
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

          {/* Filter by PE */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none">
                {selectedPE || "Filter by PE"}
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

          {/* All Tribes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none">
                {selectedTribe || "All Tribes"}
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

          {/* Date pill */}
          <div className="flex flex-col items-start border rounded-xl px-3 py-1 text-sm bg-background min-w-[110px] cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-[10px] text-muted-foreground leading-none mb-0.5">Date</span>
            <div className="flex items-center gap-2 w-full justify-between">
              <span className="font-semibold text-sm">2026</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Search pill */}
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 text-sm bg-background min-w-[160px] cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-muted-foreground flex-1">Search</span>
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  )
}
