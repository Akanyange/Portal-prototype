"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Check, ChevronDown, MoreHorizontal, Pencil, Plus, Search,
  Trash2, UserPlus, X, Users, Shield, Inbox, RefreshCw, Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/lib/toast"
import {
  USERS, ROLE_BADGE, avatarColor,
  type AppUser, type UserRole, type UserStatus,
} from "@/lib/users-data"
import { useRole } from "@/lib/role-context"
import { PM_OWNED_PROJECT_IDS } from "@/lib/projects-data"

// ── Types ─────────────────────────────────────────────────────────────────────

type RequestStatus = "pending" | "invite-sent" | "expired"
type AccessType    = "open" | "invite-only"
type Tab           = "users" | "roles" | "requests"

interface AccessRequest {
  id: string; email: string; status: RequestStatus; role: UserRole
}
interface RoleMember { initials: string; color: string }
interface Role {
  id: string; name: string; permissions: string[]; access: AccessType; members: RoleMember[]
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_REQUESTS: AccessRequest[] = [
  { id: "1", email: "thomas.butler@telekom.de", status: "pending",     role: "Project Manager" },
  { id: "2", email: "anna.schmidt@telekom.de",  status: "pending",     role: "Project Manager" },
  { id: "3", email: "max.meier@telekom.de",     status: "pending",     role: "General User"    },
  { id: "4", email: "lisa.wagner@telekom.de",   status: "pending",     role: "Project Manager" },
  { id: "5", email: "peter.mueller@telekom.de", status: "invite-sent", role: "Admin"           },
  { id: "6", email: "hans.weber@telekom.de",    status: "expired",     role: "Project Manager" },
  { id: "7", email: "frank.braun@telekom.de",   status: "expired",     role: "General User"    },
]

const MEMBER_POOL: RoleMember[] = [
  { initials: "AU", color: "bg-primary"    }, { initials: "WK", color: "bg-blue-500"   },
  { initials: "YM", color: "bg-emerald-500"}, { initials: "LW", color: "bg-amber-500"  },
  { initials: "PB", color: "bg-violet-500" }, { initials: "RS", color: "bg-pink-500"   },
  { initials: "TN", color: "bg-cyan-500"   }, { initials: "HK", color: "bg-orange-500" },
]

const SEED_ROLES: Role[] = [
  { id: "1", name: "Administrator",    permissions: ["view_projects","create_projects","edit_projects","delete_projects","manage_users","admin_access"], access: "invite-only", members: [MEMBER_POOL[0]] },
  { id: "2", name: "Project Managers", permissions: ["view_projects","create_projects","edit_projects"], access: "invite-only", members: MEMBER_POOL.slice(0, 7) },
  { id: "3", name: "Users",            permissions: ["view_projects"], access: "open", members: MEMBER_POOL },
]

const ALL_PERMISSIONS = [
  { key: "view_projects",   label: "View Projects"   }, { key: "create_projects", label: "Create Projects" },
  { key: "edit_projects",   label: "Edit Projects"   }, { key: "delete_projects", label: "Delete Projects" },
  { key: "manage_users",    label: "Manage Users"    }, { key: "admin_access",    label: "Admin Access"    },
]

const ROLE_OPTIONS: UserRole[] = ["Admin", "Project Manager", "General User"]

function nextId(items: { id: string }[]) {
  return String(Math.max(0, ...items.map(i => Number(i.id))) + 1)
}

// ── Avatar stack ──────────────────────────────────────────────────────────────

function AvatarStack({ members, max = 5 }: { members: RoleMember[]; max?: number }) {
  const visible = members.slice(0, max)
  const extra   = members.length - visible.length
  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <div key={i} className={`h-7 w-7 rounded-full ${m.color} flex items-center justify-center text-[10px] font-bold text-white border-2 border-background ${i > 0 ? "-ml-2" : ""}`}>
          {m.initials}
        </div>
      ))}
      {extra > 0 && (
        <div className="-ml-2 h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground border-2 border-background">
          +{extra}
        </div>
      )}
    </div>
  )
}

// ── Change Role modal ─────────────────────────────────────────────────────────

function ChangeRoleModal({
  user, open, onClose, onSave,
}: { user: AppUser | null; open: boolean; onClose: () => void; onSave: (role: UserRole) => void }) {
  const [role, setRole] = useState<UserRole>(user?.role ?? "General User")

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Change Role — {user.name}</DialogTitle></DialogHeader>
        <div className="py-2 space-y-3">
          <p className="text-xs text-muted-foreground">Select a new role for this user.</p>
          <div className="flex flex-col gap-2.5">
            {ROLE_OPTIONS.map(r => (
              <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => setRole(r)}
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${role === r ? "border-primary bg-primary" : "border-border"}`}
                >
                  {role === r && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm">{r}</span>
                {r === user.role && <span className="text-[10px] text-muted-foreground ml-auto">(current)</span>}
              </label>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(role)} className="bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Remove confirm modal ──────────────────────────────────────────────────────

function RemoveUserModal({
  user, open, onClose, onConfirm,
}: { user: AppUser | null; open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Remove User</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground py-2">
          Are you sure you want to remove <span className="font-medium text-foreground">{user?.name}</span> from the portal?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Remove</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Admin Users tab ───────────────────────────────────────────────────────────

function UsersTab({ onInvite }: { onInvite: () => void }) {
  const [users,         setUsers]         = useState<AppUser[]>(USERS)
  const [search,        setSearch]        = useState("")
  const [filterRole,    setFilterRole]    = useState<UserRole | "">("")
  const [filterStatus,  setFilterStatus]  = useState<UserStatus | "">("")
  const [changeRoleUser, setChangeRoleUser] = useState<AppUser | null>(null)
  const [removeUser,     setRemoveUser]     = useState<AppUser | null>(null)

  const filtered = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    if (filterRole   && u.role   !== filterRole)   return false
    if (filterStatus && u.status !== filterStatus) return false
    return true
  })

  function handleChangeRole(role: UserRole) {
    if (!changeRoleUser) return
    setUsers(prev => prev.map(u => u.id === changeRoleUser.id ? { ...u, role } : u))
    toast("Role updated", `${changeRoleUser.name}'s role has been changed to ${role}.`)
    setChangeRoleUser(null)
  }

  function handleRemove() {
    if (!removeUser) return
    setUsers(prev => prev.filter(u => u.id !== removeUser.id))
    toast("User removed", `${removeUser.name} has been removed from the portal.`, "error")
    setRemoveUser(null)
  }

  return (
    <>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold">Users</p>
          <p className="text-xs text-muted-foreground mt-0.5">A complete overview of all users on the portal.</p>
        </div>
        <Button
          onClick={onInvite}
          className="rounded-full gap-2 px-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none ${filterRole ? "border-primary text-primary" : ""}`}>
                {filterRole || "All roles"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {(["", ...ROLE_OPTIONS] as const).map(r => (
                <DropdownMenuItem key={r} onClick={() => setFilterRole(r as UserRole | "")} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center shrink-0 ${filterRole === r ? "border-primary bg-primary" : "border-border"}`}>
                    {filterRole === r && <div className="h-1 w-1 rounded-full bg-white" />}
                  </div>
                  {r === "" ? "All roles" : r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none ${filterStatus ? "border-primary text-primary" : ""}`}>
                {filterStatus ? (filterStatus === "active" ? "Active" : "Inactive") : "Status"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              {(["", "active", "inactive"] as const).map(s => (
                <DropdownMenuItem key={s} onClick={() => setFilterStatus(s as UserStatus | "")} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center shrink-0 ${filterStatus === s ? "border-primary bg-primary" : "border-border"}`}>
                    {filterStatus === s && <div className="h-1 w-1 rounded-full bg-white" />}
                  </div>
                  {s === "" ? "All" : s === "active" ? "Active" : "Inactive"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1.5 border rounded-full px-4 py-1.5 bg-background min-w-56 hover:bg-muted/30 transition-colors">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users"
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
          />
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span className="w-8 shrink-0"><input type="checkbox" className="h-3.5 w-3.5 accent-primary" /></span>
          <span className="flex-1">Name</span>
          <span className="w-64">Email</span>
          <span className="w-44">Role</span>
          <span className="w-16 text-right">Actions</span>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">No users found.</div>
        )}

        {filtered.map((u, idx) => (
          <div
            key={u.id}
            className={`flex items-center px-5 py-3.5 hover:bg-muted/20 transition-colors ${idx < filtered.length - 1 ? "border-b border-border" : ""}`}
          >
            <span className="w-8 shrink-0"><input type="checkbox" className="h-3.5 w-3.5 accent-primary" /></span>

            {/* Name cell */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <div className={`h-8 w-8 rounded-full ${avatarColor(u.initials)} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
                {u.initials}
              </div>
              <span className="text-sm font-medium truncate">{u.name}</span>
            </div>

            <span className="w-64 text-sm text-muted-foreground truncate">{u.email}</span>

            <span className="w-44">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_BADGE[u.role]}`}>
                {u.role}
              </span>
            </span>

            <div className="w-16 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded hover:bg-muted/60 transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => setChangeRoleUser(u)}
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-3.5 w-3.5" /> Change Role
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setRemoveUser(u)}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <span>{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
        <span>1 of 1</span>
      </div>

      <ChangeRoleModal
        user={changeRoleUser}
        open={changeRoleUser !== null}
        onClose={() => setChangeRoleUser(null)}
        onSave={handleChangeRole}
      />
      <RemoveUserModal
        user={removeUser}
        open={removeUser !== null}
        onClose={() => setRemoveUser(null)}
        onConfirm={handleRemove}
      />
    </>
  )
}

// ── PM Users tab (project-scoped) ─────────────────────────────────────────────

function PMUsersTab() {
  const [search, setSearch] = useState("")
  const [removeUser, setRemoveUser] = useState<AppUser | null>(null)
  const [pmUsers, setPmUsers] = useState<AppUser[]>(
    USERS.filter(u => u.projectIds.some(pid => PM_OWNED_PROJECT_IDS.has(pid)))
  )

  const filtered = pmUsers.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function handleRemove() {
    if (!removeUser) return
    setPmUsers(prev => prev.filter(u => u.id !== removeUser.id))
    toast("User removed", `${removeUser.name} has been removed from your project.`, "error")
    setRemoveUser(null)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold">Project Users</p>
          <p className="text-xs text-muted-foreground mt-0.5">Users currently assigned to your project(s).</p>
        </div>
        <div className="flex items-center gap-1.5 border rounded-full px-4 py-1.5 bg-background min-w-56 hover:bg-muted/30 transition-colors">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users"
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
          />
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span className="flex-1">Name</span>
          <span className="w-64">Email</span>
          <span className="w-44">Role</span>
          <span className="w-48 text-right">Actions</span>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">No users found.</div>
        )}

        {filtered.map((u, idx) => (
          <div
            key={u.id}
            className={`flex items-center px-5 py-3.5 hover:bg-muted/20 transition-colors ${idx < filtered.length - 1 ? "border-b border-border" : ""}`}
          >
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <div className={`h-8 w-8 rounded-full ${avatarColor(u.initials)} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
                {u.initials}
              </div>
              <span className="text-sm font-medium truncate">{u.name}</span>
            </div>

            <span className="w-64 text-sm text-muted-foreground truncate">{u.email}</span>

            <span className="w-44">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_BADGE[u.role]}`}>
                {u.role}
              </span>
            </span>

            <div className="w-48 flex items-center justify-end gap-2">
              <Link
                href={`/users/${u.id}`}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full border hover:bg-muted/40 transition-colors"
              >
                <Users className="h-3 w-3" /> View Profile
              </Link>
              <button
                onClick={() => setRemoveUser(u)}
                className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        {filtered.length} user{filtered.length !== 1 ? "s" : ""}
      </div>

      <RemoveUserModal
        user={removeUser}
        open={removeUser !== null}
        onClose={() => setRemoveUser(null)}
        onConfirm={handleRemove}
      />
    </>
  )
}

// ── Request badge ─────────────────────────────────────────────────────────────

function RequestBadge({ status }: { status: RequestStatus }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        Pending Request
      </span>
    )
  }
  if (status === "expired") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
        Expired
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/90 text-white">
      Invite Sent
    </span>
  )
}

// ── Requests tab ──────────────────────────────────────────────────────────────

function RequestsTab() {
  const [requests,     setRequests]     = useState<AccessRequest[]>(SEED_REQUESTS)
  const [search,       setSearch]       = useState("")
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "">("")
  const [filterRole,   setFilterRole]   = useState<UserRole | "">("")
  const [delId,        setDelId]        = useState<string | null>(null)
  const [editRequest,  setEditRequest]  = useState<AccessRequest | null>(null)
  const [editEmail,    setEditEmail]    = useState("")
  const [editRole,     setEditRole]     = useState<UserRole>("General User")

  const filtered = requests.filter(r => {
    if (search && !r.email.toLowerCase().includes(search.toLowerCase()) && !r.role.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus && r.status !== filterStatus) return false
    if (filterRole   && r.role   !== filterRole)   return false
    return true
  })

  function openEdit(r: AccessRequest) { setEditRequest(r); setEditEmail(r.email); setEditRole(r.role) }

  function handleEditSave() {
    if (!editEmail.trim() || !editRequest) return
    setRequests(prev => prev.map(r => r.id === editRequest.id ? { ...r, email: editEmail.trim(), role: editRole } : r))
    toast("Invite updated", `Invite for ${editEmail.trim()} has been updated.`)
    setEditRequest(null)
  }

  function approveRequest(r: AccessRequest) {
    setRequests(prev => prev.filter(x => x.id !== r.id))
    toast("Request approved", `${r.email} has been granted ${r.role} access.`)
  }

  function withdrawInvite(r: AccessRequest) {
    setRequests(prev => prev.filter(x => x.id !== r.id))
    toast("Invite withdrawn", `The invite to ${r.email} has been withdrawn.`, "error")
  }

  function resendInvite(r: AccessRequest) {
    setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: "invite-sent" } : x))
    toast("Invite re-sent", `A new invite has been sent to ${r.email}.`)
  }

  function handleDelete() {
    const r = requests.find(x => x.id === delId)
    setRequests(prev => prev.filter(x => x.id !== delId))
    setDelId(null)
    if (r) toast("Request removed", `Request from ${r.email} has been removed.`, "error")
  }

  const STATUS_FILTER_OPTIONS: { value: RequestStatus | ""; label: string }[] = [
    { value: "",            label: "All"              },
    { value: "pending",     label: "Pending Request"  },
    { value: "invite-sent", label: "Invite Sent"      },
    { value: "expired",     label: "Expired"          },
  ]

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none ${filterStatus ? "border-primary text-primary" : ""}`}>
                {STATUS_FILTER_OPTIONS.find(o => o.value === filterStatus)?.label ?? "Status"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {STATUS_FILTER_OPTIONS.map(({ value, label }) => (
                <DropdownMenuItem key={value} onClick={() => setFilterStatus(value)} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center shrink-0 ${filterStatus === value ? "border-primary bg-primary" : "border-border"}`}>
                    {filterStatus === value && <div className="h-1 w-1 rounded-full bg-white" />}
                  </div>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none ${filterRole ? "border-primary text-primary" : ""}`}>
                {filterRole || "Role"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {(["", ...ROLE_OPTIONS] as const).map(r => (
                <DropdownMenuItem key={r} onClick={() => setFilterRole(r as UserRole | "")} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center shrink-0 ${filterRole === r ? "border-primary bg-primary" : "border-border"}`}>
                    {filterRole === r && <div className="h-1 w-1 rounded-full bg-white" />}
                  </div>
                  {r === "" ? "All" : r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1.5 border rounded-full px-4 py-1.5 bg-background min-w-56 hover:bg-muted/30 transition-colors">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground" />
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span className="w-8 shrink-0"><input type="checkbox" className="h-3.5 w-3.5 accent-primary" /></span>
          <span className="flex-1">User</span>
          <span className="w-44">Status</span>
          <span className="w-44">Role</span>
          <span className="w-56 text-right">Actions</span>
        </div>
        {filtered.length === 0 && <div className="px-5 py-10 text-center text-sm text-muted-foreground">No requests found.</div>}
        {filtered.map((r, idx) => (
          <div key={r.id} className={`flex items-center px-5 py-3.5 hover:bg-muted/20 transition-colors ${idx < filtered.length - 1 ? "border-b border-border" : ""}`}>
            <span className="w-8 shrink-0"><input type="checkbox" className="h-3.5 w-3.5 accent-primary" /></span>
            <span className="flex-1 text-sm">{r.email}</span>
            <span className="w-44"><RequestBadge status={r.status} /></span>
            <span className="w-44 text-sm text-primary underline underline-offset-2">{r.role}</span>
            <div className="w-56 flex items-center justify-end gap-2">
              {r.status === "pending" && (
                <>
                  <button onClick={() => approveRequest(r)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors">
                    <Check className="h-3 w-3" /> Approve
                  </button>
                  <button onClick={() => setDelId(r.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              {r.status === "invite-sent" && (
                <>
                  <button onClick={() => withdrawInvite(r)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors">
                    Withdraw
                  </button>
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              {r.status === "expired" && (
                <>
                  <button onClick={() => resendInvite(r)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors">
                    <RefreshCw className="h-3 w-3" /> Re-send
                  </button>
                  <button onClick={() => setDelId(r.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={delId !== null} onOpenChange={() => setDelId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove Request</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">Are you sure you want to remove this request?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editRequest !== null} onOpenChange={() => setEditRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Invite</DialogTitle></DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email Address <span className="text-destructive">*</span></label>
              <Input type="email" placeholder="user@telekom.de" value={editEmail} onChange={e => setEditEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEditSave()} autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</label>
              <div className="flex flex-col gap-2">
                {ROLE_OPTIONS.map(r => (
                  <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                    <div onClick={() => setEditRole(r)} className={`h-4 w-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${editRole === r ? "border-primary bg-primary" : "border-border"}`}>
                      {editRole === r && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm">{r}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRequest(null)}>Cancel</Button>
            <Button disabled={!editEmail.trim()} onClick={handleEditSave} className="bg-primary text-primary-foreground hover:bg-primary/90">Update Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Roles tab ─────────────────────────────────────────────────────────────────

function RolesTab() {
  const [roles,        setRoles]        = useState<Role[]>(SEED_ROLES)
  const [search,       setSearch]       = useState("")
  const [filterAccess, setFilterAccess] = useState<AccessType | "">("")
  const [membersRole,  setMembersRole]  = useState<Role | null>(null)
  const [editingRole,  setEditingRole]  = useState<Role | null>(null)
  const [editName,     setEditName]     = useState("")
  const [editPerms,    setEditPerms]    = useState<string[]>([])
  const [editAccess,   setEditAccess]   = useState<AccessType>("invite-only")

  const filtered = roles.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterAccess && r.access !== filterAccess) return false
    return true
  })

  function openEditRole(r: Role) { setEditingRole(r); setEditName(r.name); setEditPerms([...r.permissions]); setEditAccess(r.access) }
  function toggleEditPerm(key: string) { setEditPerms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]) }

  function handleEditRole() {
    if (!editName.trim() || !editingRole) return
    setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, name: editName.trim(), permissions: editPerms, access: editAccess } : r))
    toast("Role updated", `"${editName.trim()}" has been updated.`)
    setEditingRole(null)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors outline-none ${filterAccess ? "border-primary text-primary" : ""}`}>
                {filterAccess === "open" ? "Open" : filterAccess === "invite-only" ? "Invite Only" : "Access type"}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {(["", "open", "invite-only"] as const).map(a => (
                <DropdownMenuItem key={a} onClick={() => setFilterAccess(a)} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full border-2 flex items-center justify-center shrink-0 ${filterAccess === a ? "border-primary bg-primary" : "border-border"}`}>
                    {filterAccess === a && <div className="h-1 w-1 rounded-full bg-white" />}
                  </div>
                  {a === "" ? "All" : a === "open" ? "Open" : "Invite Only"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1.5 border rounded-full px-4 py-1.5 bg-background min-w-56 hover:bg-muted/30 transition-colors">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles" className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground" />
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span className="w-8 shrink-0"><input type="checkbox" className="h-3.5 w-3.5 accent-primary" /></span>
          <span className="w-56">Role</span>
          <span className="flex-1">Members</span>
          <span className="w-56 text-right">Actions</span>
        </div>
        {filtered.length === 0 && <div className="px-5 py-10 text-center text-sm text-muted-foreground">No roles found.</div>}
        {filtered.map((role, idx) => (
          <div key={role.id} className={`flex items-center px-5 py-3.5 hover:bg-muted/20 transition-colors ${idx < filtered.length - 1 ? "border-b border-border" : ""}`}>
            <span className="w-8 shrink-0"><input type="checkbox" className="h-3.5 w-3.5 accent-primary" /></span>
            <span className="w-56 text-sm font-medium">{role.name}</span>
            <div className="flex-1">
              <button onClick={() => setMembersRole(role)} className="rounded-full hover:opacity-80 transition-opacity">
                <AvatarStack members={role.members} />
              </button>
            </div>
            <div className="w-56 flex items-center justify-end gap-2">
              <button onClick={() => setMembersRole(role)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors">
                <Check className="h-3 w-3" /> Manage Members
              </button>
              <button onClick={() => openEditRole(role)} className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={editingRole !== null} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Role</DialogTitle></DialogHeader>
          <div className="py-2 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role Name <span className="text-destructive">*</span></label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none bg-background focus:ring-1 focus:ring-primary" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEditRole()} autoFocus />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Permissions</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map(p => {
                  const checked = editPerms.includes(p.key)
                  return (
                    <label key={p.key} className="flex items-center gap-2 cursor-pointer select-none">
                      <div onClick={() => toggleEditPerm(p.key)} className={`h-4 w-4 rounded border-2 flex items-center justify-center cursor-pointer shrink-0 ${checked ? "border-primary bg-primary" : "border-border"}`}>
                        {checked && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className="text-xs">{p.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Access Type</label>
              <div className="flex gap-4">
                {(["open", "invite-only"] as AccessType[]).map(a => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setEditAccess(a)} className={`h-4 w-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${editAccess === a ? "border-primary bg-primary" : "border-border"}`}>
                      {editAccess === a && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm capitalize">{a.replace("-", " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
            <Button disabled={!editName.trim()} onClick={handleEditRole} className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={membersRole !== null} onOpenChange={() => setMembersRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Manage Members — {membersRole?.name}</DialogTitle></DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-xs text-muted-foreground">
              Access: <span className="font-medium text-foreground capitalize">{membersRole?.access.replace("-", " ")}</span>
              &nbsp;·&nbsp; Permissions: <span className="font-medium text-foreground">{membersRole?.permissions.length} granted</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {membersRole?.permissions.map(p => (
                <span key={p} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {ALL_PERMISSIONS.find(x => x.key === p)?.label ?? p}
                </span>
              ))}
            </div>
            <div className="border border-border rounded-lg overflow-hidden mt-2">
              <div className="px-4 py-2.5 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                Members ({membersRole?.members.length})
              </div>
              <div className="max-h-52 overflow-y-auto divide-y divide-border">
                {membersRole?.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`h-7 w-7 rounded-full ${m.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>{m.initials}</div>
                    <span className="text-sm">{m.initials} Member</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMembersRole(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Invite User modal ─────────────────────────────────────────────────────────

function InviteUserModal({ open, onClose, onInvite }: { open: boolean; onClose: () => void; onInvite: (email: string, role: UserRole) => void }) {
  const [email, setEmail] = useState("")
  const [role,  setRole]  = useState<UserRole>("General User")

  const emailTrimmed    = email.trim().toLowerCase()
  const alreadyExists   = emailTrimmed !== "" && USERS.some(u => u.email.toLowerCase() === emailTrimmed)

  function handleSubmit() {
    if (!email.trim() || alreadyExists) return
    onInvite(email.trim(), role)
    setEmail(""); setRole("General User")
  }

  function handleClose() {
    setEmail(""); setRole("General User")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Invite User</DialogTitle></DialogHeader>
        <div className="py-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email Address <span className="text-destructive">*</span></label>
            <Input
              type="email"
              placeholder="user@telekom.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              autoFocus
              className={alreadyExists ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {alreadyExists && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <Info className="h-3.5 w-3.5 shrink-0" />
                User already exists.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">User Group</label>
            <div className="flex flex-col gap-2">
              {ROLE_OPTIONS.map(r => (
                <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                  <div onClick={() => setRole(r)} className={`h-4 w-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${role === r ? "border-primary bg-primary" : "border-border"}`}>
                    {role === r && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button disabled={!email.trim() || alreadyExists} onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Create Role modal ─────────────────────────────────────────────────────────

function CreateRoleModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string, permissions: string[], access: AccessType) => void }) {
  const [name, setName]               = useState("")
  const [permissions, setPermissions] = useState<string[]>([])
  const [access, setAccess]           = useState<AccessType>("invite-only")

  function togglePerm(key: string) { setPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]) }

  function handleSubmit() {
    if (!name.trim()) return
    onCreate(name.trim(), permissions, access)
    setName(""); setPermissions([]); setAccess("invite-only")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create New Role</DialogTitle></DialogHeader>
        <div className="py-2 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role Name <span className="text-destructive">*</span></label>
            <Input placeholder="e.g. Project Viewer" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map(p => {
                const checked = permissions.includes(p.key)
                return (
                  <label key={p.key} className="flex items-center gap-2 cursor-pointer select-none">
                    <div onClick={() => togglePerm(p.key)} className={`h-4 w-4 rounded border-2 flex items-center justify-center cursor-pointer shrink-0 ${checked ? "border-primary bg-primary" : "border-border"}`}>
                      {checked && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                    <span className="text-xs">{p.label}</span>
                  </label>
                )
              })}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Access Type</label>
            <div className="flex gap-4">
              {(["open", "invite-only"] as AccessType[]).map(a => (
                <label key={a} className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setAccess(a)} className={`h-4 w-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${access === a ? "border-primary bg-primary" : "border-border"}`}>
                    {access === a && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm capitalize">{a.replace("-", " ")}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!name.trim()} onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">Create Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const ADMIN_TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "users",    label: "Users",               icon: <Users  className="h-3.5 w-3.5" /> },
  { id: "roles",    label: "Roles & Permissions", icon: <Shield className="h-3.5 w-3.5" /> },
  { id: "requests", label: "Requests",            icon: <Inbox  className="h-3.5 w-3.5" /> },
]

export default function UserManagementPage() {
  const { role } = useRole()
  const [tab,        setTab]        = useState<Tab>("users")
  const [showInvite, setShowInvite] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [requests,   setRequests]   = useState<AccessRequest[]>(SEED_REQUESTS)
  const [roles,      setRoles]      = useState<Role[]>(SEED_ROLES)

  const pendingCount = requests.filter(r => r.status === "pending").length

  function handleInvite(email: string, userRole: UserRole) {
    setRequests(prev => [...prev, { id: nextId(prev), email, status: "invite-sent", role: userRole }])
    setShowInvite(false)
    toast("Invite sent", `An invitation has been sent to ${email} as ${userRole}.`)
  }

  function handleCreateRole(name: string, permissions: string[], access: AccessType) {
    setRoles(prev => [...prev, { id: nextId(prev), name, permissions, access, members: [] }])
    setShowCreate(false)
    toast("Role created", `"${name}" has been created successfully.`)
  }

  // Project Manager gets a simplified scoped view
  if (role === "Project Manager") {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage users assigned to your project(s).</p>
        </div>
        <PMUsersTab />
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage users, roles, and access requests for the portal.</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "roles" && (
            <Button onClick={() => setShowCreate(true)} className="rounded-full gap-2 px-5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" /> Create Role
            </Button>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {ADMIN_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
              {t.id === "requests" && pendingCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {tab === "users"    && <UsersTab onInvite={() => setShowInvite(true)} />}
        {tab === "roles"    && <RolesTab />}
        {tab === "requests" && <RequestsTab />}
      </div>

      <InviteUserModal open={showInvite} onClose={() => setShowInvite(false)} onInvite={handleInvite} />
      <CreateRoleModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreateRole} />
    </div>
  )
}
