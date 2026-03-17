"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  CircleUser,
  Link2,
  Pencil,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  RefreshCw,
  CheckCircle2,
} from "lucide-react"
import { projects, STATUS_BADGE, STATUS_LABEL, type MilestoneRow } from "@/lib/projects-data"
import { MilestoneGantt, type GanttTimeView } from "@/components/milestone-gantt"
import { useRole } from "@/lib/role-context"
import { JiraConnectModal } from "@/components/jira-connect-modal"
import type { JiraConfig } from "@/lib/jira-service"

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [timeView, setTimeView] = useState<GanttTimeView>("Months")
  const { role } = useRole()

  const project = projects.find(p => p.id === id)

  const [isPublic, setIsPublic] = useState<boolean>(
    project ? project.visibility === "Public" : false
  )

  // ── JIRA integration state ──────────────────────────────────────────────────
  const [jiraModalOpen,  setJiraModalOpen]  = useState(false)
  const [jiraConfig,     setJiraConfig]     = useState<JiraConfig | null>(null)
  const [jiraSyncedAt,   setJiraSyncedAt]   = useState<string | null>(null)
  const [jiraRows,       setJiraRows]       = useState<MilestoneRow[] | null>(null)
  const [syncing,        setSyncing]        = useState(false)

  function handleJiraConnected(rows: MilestoneRow[], config: JiraConfig) {
    setJiraRows(rows)
    setJiraConfig(config)
    setJiraSyncedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
  }

  async function handleSyncNow() {
    if (!jiraConfig) return
    setSyncing(true)
    try {
      const { fetchJiraMilestones } = await import("@/lib/jira-service")
      const rows = await fetchJiraMilestones(jiraConfig)
      setJiraRows(rows)
      setJiraSyncedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    } finally {
      setSyncing(false)
    }
  }

  // Active milestone rows: JIRA rows take precedence over static data
  const activeMilestoneRows = jiraRows ?? project?.milestoneRows

  if (!project) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Project not found.{" "}
        <Link href="/projects" className="text-primary underline">
          Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <span>•</span>
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      {/* ── Title + Edit button ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[project.status]}`}>
              {STATUS_LABEL[project.status]}
            </span>
          </div>
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, i) => (
                <span
                  key={tag}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    i === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setJiraModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Import Project Data
          </button>
          <Link
            href={`/projects/${project.id}/edit`}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Project
          </Link>
        </div>
      </div>

      {/* ── Meta row ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
        {project.createdDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">{project.createdDate}</span>
          </div>
        )}
        {project.projectLead && (
          <div className="flex items-center gap-2">
            <CircleUser className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Project Lead</span>
            <span className="font-medium">{project.projectLead}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Due</span>
          <span className="font-medium">{project.endDate}</span>
        </div>
        {/* Public Project toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-muted-foreground">Public Project</span>
          <button
            role="switch"
            aria-checked={isPublic}
            onClick={() => setIsPublic(v => !v)}
            className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isPublic ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                isPublic ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── JIRA connection status badge ────────────────────────────────────── */}
      {jiraConfig && (
        <div className="flex items-center gap-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20 px-4 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Connected to JIRA
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              {jiraConfig.domain} · project <strong>{jiraConfig.projectKey}</strong>
            </span>
          </div>
          {jiraSyncedAt && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Last synced {jiraSyncedAt}
            </span>
          )}
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync now"}
          </button>
        </div>
      )}

      {/* ── Links ───────────────────────────────────────────────────────────── */}
      {project.links && project.links.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <span>Links</span>
          </div>
          {project.links.map(link => (
            <a
              key={link}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      )}

      {/* ── Description ─────────────────────────────────────────────────────── */}
      {project.description && (
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
        </div>
      )}

      {/* ── Timeline section ────────────────────────────────────────────────── */}
      {activeMilestoneRows && activeMilestoneRows.length > 0 && (
        <div className="space-y-3">

          {/* Timeline header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm">{project.name} Timeline</span>
              <div className="flex items-center gap-0.5 bg-muted rounded-full p-0.5">
                {(["Months", "Quarters"] as GanttTimeView[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setTimeView(v)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      timeView === v
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-full px-1.5 py-1 bg-card">
                <button className="p-0.5 hover:bg-muted rounded-full transition-colors">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm px-2">Today</span>
                <button className="p-0.5 hover:bg-muted rounded-full transition-colors">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <button className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-sm bg-card hover:bg-muted/50 transition-colors whitespace-nowrap">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Sort:</span>
                <span>Due date</span>
              </button>
              <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-card hover:bg-muted/50 transition-colors">
                Filter
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <MilestoneGantt
            projectName={project.name}
            projectStatus={project.status}
            milestoneRows={activeMilestoneRows!}
            timeView={timeView}
            canEdit={role !== "General User"}
          />
        </div>
      )}

      {/* ── JIRA Connect Modal ───────────────────────────────────────────────── */}
      <JiraConnectModal
        open={jiraModalOpen}
        onClose={() => setJiraModalOpen(false)}
        projectName={project.name}
        projectKey={project.id.toUpperCase().replace(/-/g, "")}
        onConnected={handleJiraConnected}
      />
    </div>
  )
}
