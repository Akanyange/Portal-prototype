"use client"

import { useState } from "react"
import { Check, ChevronDown, MoreHorizontal, Pencil, Plus, Search, Trash2, UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/lib/toast"

// ── Types ─────────────────────────────────────────────────────────────────────

type RequestStatus = "pending" | "invite-sent"
type UserRole      = "Admin" | "Project Manager" | "General User"
type AccessType    = "open" | "invite-only"

interface AccessRequest {
  id: string
  email: string
  status: RequestStatus
  role: UserRole
}

interface RoleMember {
  initials: string
  color: string
}

interface Role {
  id: string
  name: string
  permissions: string[]
  access: AccessType
  members: RoleMember[]
}

type Tab = "requests" | "roles"

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_REQUESTS: AccessRequest[] = [
  { id: "1", email: "thomas.butler@telekom.de",  status: "pending",     role: "Project Manager" },
  { id: "2", email: "anna.schmidt@telekom.de",   status: "pending",     role: "Project Manager" },
  { id: "3", email: "max.meier@telekom.de",      status: "pending",     role: "General User"    },
  { id: "4", email: "lisa.wagner@telekom.de",    status: "pending",     role: "Project Manager" },
  { id: "5", email: "peter.mueller@telekom.de",  status: "invite-sent", role: "Admin"           },
]

const MEMBER_POOL: RoleMember[] = [
  { initials: "AU", color: "bg-primary"    },
  { initials: "WK", color: "bg-blue-500"   },
  { initials: "YM", color: "bg-emerald-500"},
  { initials: "LW", color: "bg-amber-500"  },
  { initials: "PB", color: "bg-violet-500" },
  { initials: "RS", color: "bg-pink-500"   },
  { initials: "TN", color: "bg-cyan-500"   },
  { initials: "HK", color: "bg-orange-500" },
]

const SEED_ROLES: Role[] = [
  {
    id: "1", name: "Administrator",
    permissions: ["view_projects","create_projects","edit_projects","delete_projects","manage_users","admin_access"],
    access: "invite-only",
    members: [MEMBER_POOL[0]],
  },
  {
    id: "2", name: "Project Managers",
    permissions: ["view_projects","create_projects","edit_projects"],
    access: "invite-only",
    members: MEMBER_POOL.slice(0, 7),
  },
  {
    id: "3", name: "Users",
    permissions: ["view_projects"],
    access: "open",
    members: MEMBER_POOL,
  },
]

const ALL_PERMISSIONS = [
  { key: "view_projects",    label: "View Projects"    },
  { key: "create_projects",  label: "Create Projects"  },
  { key: "edit_projects",    label: "Edit Projects"    },
  { key: "delete_projects",  label: "Delete Projects"  },
  { key: "manage_users",     label: "Manage Users"     },
  { key: "admin_access",     label: "Admin Access"     },
]

const ROLE_OPTIONS: UserRole[] = ["Admin", "Project Manager", "General User"]

// ── Helpers ───────────────────────────────────────────────────────────────────

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
        <div
          key={i}
          title={m.initials}
          className={`h-7 w-7 rounded-full ${m.color} flex items-center justify-center text-[10px] font-bold text-white border-2 border-background ${i > 0 ? "-ml-2" : ""}`}
        >
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

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
      status === "pending" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-primary/90 text-white"
    }`}>
      {status === "pending" ? "Pending Request" : "Invite Sent"}
    </span>
  )
}

// ── Requests tab ──────────────────────────────────────────────────────────────

function RequestsTab() {
  const [requests,     setRequests]     = useState<AccessRequest[]>(SEED_REQUESTS)
  const [search,       setSearch]       = useState("")
  const [delId,        setDelId]        = useState<string | null>(null)
  const [editRequest,  setEditRequest]  = useState<AccessRequest | null>(null)
  const [editEmail,    setEditEmail]    = useState("")
  const [editRole,     setEditRole]     = useState<UserRole>("General User")

  function openEdit(r: AccessRequest) {
    setEditRequest(r)
    setEditEmail(r.email)
    setEditRole(r.role)
  }

  function handleEditSave() {
    if (!editEmail.trim() || !editRequest) return
    setRequests(prev => prev.map(r =>
      r.id === editRequest.id ? { ...r, email: editEmail.trim(), role: editRole } : r
    ))
    toast("Invite updated", `Invite for ${editEmail.trim()} has been updated.`)
    setEditRequest(null)
  }

  const filtered = requests.filter(r =>
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase())
  )

  function approveRequest(r: AccessRequest) {
    setRequests(prev => prev.filter(x => x.id !== r.id))
    toast("Request approved", `${r.email} has been granted ${r.role} access.`)
  }

  function withdrawInvite(r: AccessRequest) {
    setRequests(prev => prev.filter(x => x.id !== r.id))
    toast("Invite withdrawn", `The invite to ${r.email} has been withdrawn.`, "error")
  }

  function handleDelete() {
    const r = requests.find(x => x.id === delId)
    setRequests(prev => prev.filter(x => x.id !== delId))
    setDelId(null)
    if (r) toast("Request removed", `Request from ${r.email} has been removed.`, "error")
  }

  return (
    <>
      {/* Section bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">Requests</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 bg-background min-w-52">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            />
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
          <button className="flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors">
            Filter <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span className="w-8 shrink-0"><input type="checkbox" className="h-3.5 w-3.5 accent-primary" /></span>
          <span className="flex-1">User</span>
          <span className="w-48">Status</span>
          <span className="w-44">User Role</span>
          <span className="w-56 text-right">Actions</span>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">No requests found.</div>
        )}

        {filtered.map((r, idx) => (
          <div
            key={r.id}
            className={`flex items-center px-5 py-3.5 hover:bg-muted/20 transition-colors ${idx < filtered.length - 1 ? "border-b border-border" : ""}`}
          >
            <span className="w-8 shrink-0"><input type="checkbox" className="h-3.5 w-3.5 accent-primary" /></span>
            <span className="flex-1 text-sm">{r.email}</span>
            <span className="w-48"><StatusBadge status={r.status} /></span>
            <span className="w-44 text-sm text-primary underline underline-offset-2 cursor-default">{r.role}</span>
            <div className="w-56 flex items-center justify-end gap-2">
              {r.status === "pending" ? (
                <>
                  <button
                    onClick={() => approveRequest(r)}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                  >
                    <Check className="h-3 w-3" /> Approve Request
                  </button>
                  <button
                    onClick={() => setDelId(r.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => withdrawInvite(r)}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => openEdit(r)}
                    className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      <Dialog open={delId !== null} onOpenChange={() => setDelId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove Request</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to remove this request? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Invite modal */}
      <Dialog open={editRequest !== null} onOpenChange={() => setEditRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Invite</DialogTitle></DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Email Address <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="user@telekom.de"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleEditSave()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</label>
              <div className="flex flex-col gap-2">
                {ROLE_OPTIONS.map(r => (
                  <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                    <div
                      onClick={() => setEditRole(r)}
                      className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        editRole === r ? "border-primary bg-primary" : "border-border"
                      }`}
                    >
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
            <Button
              disabled={!editEmail.trim()}
              onClick={handleEditSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Update Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Roles tab ─────────────────────────────────────────────────────────────────

function RolesTab({ onCreateRole }: { onCreateRole: () => void }) {
  const [roles,   setRoles]   = useState<Role[]>(SEED_ROLES)
  const [search,  setSearch]  = useState("")
  const [delId,   setDelId]   = useState<string | null>(null)
  const [membersRole, setMembersRole] = useState<Role | null>(null)

  const filtered = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleDelete() {
    const r = roles.find(x => x.id === delId)
    setRoles(prev => prev.filter(x => x.id !== delId))
    setDelId(null)
    if (r) toast("Role deleted", `"${r.name}" has been removed.`, "error")
  }

  return (
    <>
      {/* Section bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">User groups &amp; Roles</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 bg-background min-w-52">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            />
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
          <button className="flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-sm bg-background hover:bg-muted/50 transition-colors">
            Filter <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span className="w-8 shrink-0"><input type="checkbox" className="h-3.5 w-3.5 accent-primary" /></span>
          <span className="w-56">Roles</span>
          <span className="flex-1">Users</span>
          <span className="w-56 text-right">Actions</span>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">No roles found.</div>
        )}

        {filtered.map((role, idx) => (
          <div
            key={role.id}
            className={`flex items-center px-5 py-3.5 hover:bg-muted/20 transition-colors ${idx < filtered.length - 1 ? "border-b border-border" : ""}`}
          >
            <span className="w-8 shrink-0"><input type="checkbox" className="h-3.5 w-3.5 accent-primary" /></span>
            <span className="w-56 text-sm font-medium">{role.name}</span>
            <div className="flex-1">
              <button
                onClick={() => setMembersRole(role)}
                className="rounded-full hover:opacity-80 transition-opacity focus:outline-none"
                title="View members"
              >
                <AvatarStack members={role.members} />
              </button>
            </div>
            <div className="w-56 flex items-center justify-end gap-2">
              <button
                onClick={() => setMembersRole(role)}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
              >
                <Check className="h-3 w-3" /> Manage Members
              </button>
              {role.name === "Administrator" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setMembersRole(role)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Role
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => setDelId(role.id)}
                  className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      <Dialog open={delId !== null} onOpenChange={() => setDelId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Role</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <span className="text-foreground font-medium">&ldquo;{roles.find(r => r.id === delId)?.name}&rdquo;</span>? All members will lose their associated permissions.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage members modal */}
      <Dialog open={membersRole !== null} onOpenChange={() => setMembersRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Members — {membersRole?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-xs text-muted-foreground">
              Access: <span className="font-medium text-foreground capitalize">{membersRole?.access.replace("-"," ")}</span>
              &nbsp;·&nbsp;
              Permissions: <span className="font-medium text-foreground">{membersRole?.permissions.length} granted</span>
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
                    <div className={`h-7 w-7 rounded-full ${m.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                      {m.initials}
                    </div>
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

function InviteUserModal({ open, onClose, onInvite }: {
  open: boolean
  onClose: () => void
  onInvite: (email: string, role: UserRole) => void
}) {
  const [email, setEmail] = useState("")
  const [role,  setRole]  = useState<UserRole>("General User")

  function handleSubmit() {
    if (!email.trim()) return
    onInvite(email.trim(), role)
    setEmail("")
    setRole("General User")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Invite User</DialogTitle></DialogHeader>
        <div className="py-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Email Address <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              placeholder="user@telekom.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</label>
            <div className="flex flex-col gap-2">
              {ROLE_OPTIONS.map(r => (
                <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setRole(r)}
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      role === r ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {role === r && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!email.trim()}
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Create Role modal ─────────────────────────────────────────────────────────

function CreateRoleModal({ open, onClose, onCreate }: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, permissions: string[], access: AccessType) => void
}) {
  const [name,        setName]        = useState("")
  const [permissions, setPermissions] = useState<string[]>([])
  const [access,      setAccess]      = useState<AccessType>("invite-only")

  function togglePerm(key: string) {
    setPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    )
  }

  function handleSubmit() {
    if (!name.trim()) return
    onCreate(name.trim(), permissions, access)
    setName("")
    setPermissions([])
    setAccess("invite-only")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create New Role</DialogTitle></DialogHeader>
        <div className="py-2 space-y-5">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Role Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Project Viewer"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map(p => {
                const checked = permissions.includes(p.key)
                return (
                  <label key={p.key} className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => togglePerm(p.key)}
                      className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        checked ? "border-primary bg-primary" : "border-border"
                      }`}
                    >
                      {checked && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                    <span className="text-xs">{p.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Access type */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Access Type</label>
            <div className="flex gap-4">
              {(["open", "invite-only"] as AccessType[]).map(a => (
                <label key={a} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setAccess(a)}
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      access === a ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {access === a && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm capitalize">{a.replace("-", " ")}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {access === "open"
                ? "Anyone can request to join this role."
                : "Members can only be added by an administrator."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!name.trim()}
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RolesPermissionsPage() {
  const [tab,          setTab]          = useState<Tab>("requests")
  const [showInvite,   setShowInvite]   = useState(false)
  const [showCreate,   setShowCreate]   = useState(false)
  const [requests,     setRequests]     = useState<AccessRequest[]>(SEED_REQUESTS)
  const [roles,        setRoles]        = useState<Role[]>(SEED_ROLES)

  const pendingCount = requests.filter(r => r.status === "pending").length

  function handleInvite(email: string, role: UserRole) {
    setRequests(prev => [
      ...prev,
      { id: nextId(prev), email, status: "invite-sent", role },
    ])
    setShowInvite(false)
    toast("Invite sent", `An invitation has been sent to ${email} as ${role}.`)
  }

  function handleCreateRole(name: string, permissions: string[], access: AccessType) {
    setRoles(prev => [
      ...prev,
      { id: nextId(prev), name, permissions, access, members: [] },
    ])
    setShowCreate(false)
    toast("Role created", `"${name}" has been created successfully.`)
  }

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Roles &amp; Permissions</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInvite(true)}
            className="rounded-full gap-2 px-5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite User
          </Button>
          <Button
            onClick={() => setShowCreate(true)}
            className="rounded-full gap-2 px-5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {(["requests", "roles"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "requests" ? "Requests" : "Roles"}
              {t === "requests" && pendingCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content — pass state down so both tabs share requests/roles */}
      <div>
        {tab === "requests" && <RequestsTab />}
        {tab === "roles"    && <RolesTab onCreateRole={() => setShowCreate(true)} />}
      </div>

      {/* Global modals */}
      <InviteUserModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onInvite={handleInvite}
      />
      <CreateRoleModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreateRole}
      />
    </div>
  )
}
