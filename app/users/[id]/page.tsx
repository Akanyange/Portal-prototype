"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useRef, useState } from "react"
import {
  ArrowLeft, Mail, Building2, CalendarDays,
  FolderKanban, Activity, Camera, Pencil, Check, X, Upload,
} from "lucide-react"
import { USERS, ROLE_BADGE, STATUS_BADGE, avatarColor } from "@/lib/users-data"
import { projects, STATUS_BADGE as PROJECT_STATUS_BADGE, STATUS_LABEL } from "@/lib/projects-data"

// ── Activity data grouped by project ─────────────────────────────────────────

const ACTIVITY_GROUPS = [
  {
    project: "Fach CAB & Change Mgmt Agent",
    projectId: "fach-cab",
    entries: [
      { id: "a1", action: "Updated milestone", detail: "Kafka Connect marked as completed",        time: "2 hours ago" },
      { id: "a3", action: "Added milestone",   detail: "API Access milestone created",             time: "3 days ago"  },
      { id: "a6", action: "Status changed",    detail: "Project moved to Ongoing",                 time: "1 week ago"  },
    ],
  },
  {
    project: "Network Insights",
    projectId: "netinsights",
    entries: [
      { id: "a2", action: "Status changed",   detail: "Project moved to Ongoing",                 time: "1 day ago"   },
      { id: "a5", action: "Submitted update", detail: "Bi-weekly progress update submitted",       time: "2 weeks ago" },
    ],
  },
  {
    project: "AI-Ops Automation",
    projectId: "ai-ops",
    entries: [
      { id: "a4", action: "Project assigned", detail: "Added as project lead",                     time: "1 week ago"  },
    ],
  },
]

type ProfileTab = "projects" | "activity"

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const params    = useParams<{ id: string }>()
  const user      = USERS.find(u => u.id === params.id)
  const fileRef   = useRef<HTMLInputElement>(null)

  const [activeTab,   setActiveTab]   = useState<ProfileTab>("projects")
  const [editing,     setEditing]     = useState(false)
  const [avatarSrc,   setAvatarSrc]   = useState<string | null>(null)
  const [draftAvatar, setDraftAvatar] = useState<string | null>(null)
  const [nameValue,   setNameValue]   = useState(user?.name ?? "")
  const [displayName, setDisplayName] = useState(user?.name ?? "")

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-lg font-semibold">User not found</p>
        <Link href="/user-management" className="text-sm text-primary underline underline-offset-2">
          Back to User Management
        </Link>
      </div>
    )
  }

  const userProjects = projects.filter(p => user.projectIds.includes(p.id))

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setDraftAvatar(URL.createObjectURL(file))
  }

  function startEdit() {
    setNameValue(displayName)
    setDraftAvatar(avatarSrc)
    setEditing(true)
  }

  function saveEdit() {
    if (nameValue.trim()) setDisplayName(nameValue.trim())
    setAvatarSrc(draftAvatar)
    setEditing(false)
  }

  function cancelEdit() {
    setDraftAvatar(null)
    setNameValue(displayName)
    setEditing(false)
  }

  return (
    <div className="space-y-6">

      {/* Back */}
      <Link href="/user-management" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        User Management
      </Link>

      <div className="flex gap-6 items-start">

        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <div className="w-60 shrink-0 space-y-4">

          {/* Avatar + editable name */}
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center text-center gap-3">

            {/* Avatar */}
            <div className="relative">
              {(editing ? draftAvatar : avatarSrc) ? (
                <img src={(editing ? draftAvatar : avatarSrc)!} alt="avatar" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className={`h-20 w-20 rounded-full ${avatarColor(user.initials)} flex items-center justify-center text-2xl font-bold text-white`}>
                  {user.initials}
                </div>
              )}
              {editing && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center gap-0.5"
                >
                  <Upload className="h-4 w-4 text-white" />
                  <span className="text-[10px] text-white font-medium">Upload</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Name */}
            {editing ? (
              <input
                autoFocus
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit() }}
                className="w-full text-sm font-bold text-center bg-muted rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <h2 className="text-base font-bold leading-tight">{displayName}</h2>
            )}

            {/* Role + status */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_BADGE[user.role]}`}>
              {user.role}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_BADGE[user.status]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-zinc-400"}`} />
              {user.status === "active" ? "Active" : "Inactive"}
            </span>

            {/* Edit / Save / Cancel controls */}
            {editing ? (
              <div className="flex w-full gap-2 pt-1">
                <button
                  onClick={saveEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                >
                  <Check className="h-3 w-3" /> Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 border text-xs font-semibold py-1.5 rounded-full hover:bg-muted/50 transition-colors"
                >
                  <X className="h-3 w-3" /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 border text-xs font-medium px-4 py-1.5 rounded-full hover:bg-muted/50 transition-colors mt-1"
              >
                <Pencil className="h-3 w-3" /> Edit Profile
              </button>
            )}
          </div>

          {/* Read-only details */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-xs break-all text-muted-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">{user.department}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">Joined {user.joined}</span>
            </div>
          </div>

        </div>

        {/* ── Right content ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-0">
              {([
                { id: "projects", label: "Projects", icon: <FolderKanban className="h-3.5 w-3.5" /> },
                { id: "activity", label: "Activity",  icon: <Activity     className="h-3.5 w-3.5" /> },
              ] as { id: ProfileTab; label: string; icon: React.ReactNode }[]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Projects tab ───────────────────────────────────────────────── */}
          {activeTab === "projects" && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <span className="flex-1">Project</span>
                <span className="w-32">Portfolio</span>
                <span className="w-28">Status</span>
                <span className="w-24 text-right">Progress</span>
              </div>
              {userProjects.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">No projects assigned.</div>
              )}
              {userProjects.map((p, idx) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className={`flex items-center px-5 py-3.5 hover:bg-muted/20 transition-colors ${idx < userProjects.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.tribe}</p>
                  </div>
                  <span className="w-32 text-xs text-muted-foreground truncate pr-2">{p.pe}</span>
                  <span className="w-28">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PROJECT_STATUS_BADGE[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </span>
                  <div className="w-24 flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-7 text-right">{p.progress}%</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ── Activity tab — trail grouped by project ─────────────────────── */}
          {activeTab === "activity" && (
            <div className="space-y-6">
              {ACTIVITY_GROUPS.map(group => (
                <div key={group.project}>
                  {/* Project header */}
                  <div className="flex items-center gap-2 mb-3">
                    <FolderKanban className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <Link
                      href={`/projects/${group.projectId}`}
                      className="text-sm font-semibold hover:text-primary transition-colors"
                    >
                      {group.project}
                    </Link>
                  </div>

                  {/* Trail */}
                  <div className="ml-1.5 pl-5 border-l-2 border-border space-y-0">
                    {group.entries.map((entry, idx) => (
                      <div key={entry.id} className="relative pb-4 last:pb-0">
                        {/* Dot on the trail line */}
                        <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium leading-snug">{entry.action}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.detail}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 mt-0.5 whitespace-nowrap">{entry.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
