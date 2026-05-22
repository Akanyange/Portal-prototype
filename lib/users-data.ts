export type UserStatus = "active" | "inactive"
export type UserRole   = "Admin" | "Project Manager" | "General User"

export interface AppUser {
  id: string
  name: string
  initials: string
  email: string
  role: UserRole
  status: UserStatus
  department: string
  joined: string
  about?: string
  projectIds: string[]
}

export const USERS: AppUser[] = [
  {
    id: "1", name: "Alycia Smith", initials: "AS",
    email: "alycia.smith@telekom.de", role: "Admin", status: "active",
    department: "Platform Engineering", joined: "Jan 2023",
    about: "System administrator and platform lead. Oversees user access, system configurations, and ensures smooth operation of the project portal.",
    projectIds: ["fach-cab", "ran-guardian"],
  },
  {
    id: "2", name: "Anna Mueller", initials: "AM",
    email: "a.mueller@telekom.de", role: "Project Manager", status: "active",
    department: "AI for Networks", joined: "Aug 2023",
    about: "Project manager specialising in AI-driven network automation initiatives. Leads cross-functional teams across multiple portfolio elements.",
    projectIds: ["fach-cab", "netinsights", "ai-ops"],
  },
  {
    id: "3", name: "Ben Schmidt", initials: "BS",
    email: "b.schmidt@telekom.de", role: "Project Manager", status: "active",
    department: "Service Observability", joined: "Mar 2024",
    about: "Leading the Incident Perceptor and AI-Ops projects. Focused on improving fault detection and automated root cause analysis.",
    projectIds: ["incident-perceptor", "ai-ops"],
  },
  {
    id: "4", name: "Thomas Butler", initials: "TB",
    email: "thomas.butler@telekom.de", role: "Project Manager", status: "active",
    department: "AI for Networks", joined: "Jan 2024",
    about: "Responsible for CAB, change management and network insights delivery. Works closely with the observability and automation tribes.",
    projectIds: ["fach-cab", "mbfd", "netinsights"],
  },
  {
    id: "5", name: "Lisa Wagner", initials: "LW",
    email: "l.wagner@telekom.de", role: "General User", status: "active",
    department: "AI for Networks", joined: "Jun 2024",
    projectIds: ["netinsights"],
  },
  {
    id: "6", name: "Max Meier", initials: "MM",
    email: "m.meier@telekom.de", role: "General User", status: "active",
    department: "Use Case AN L4", joined: "Feb 2025",
    projectIds: ["mndr"],
  },
  {
    id: "7", name: "Sophie Klein", initials: "SK",
    email: "s.klein@telekom.de", role: "Project Manager", status: "active",
    department: "Service Observability", joined: "Nov 2023",
    about: "Focused on RAN monitoring reliability and OLT swap automation. Brings deep expertise in network operations.",
    projectIds: ["ran-guardian", "olt-swap"],
  },
  {
    id: "8", name: "Robert Neumann", initials: "RN",
    email: "r.neumann@telekom.de", role: "Admin", status: "active",
    department: "Platform Engineering", joined: "Jan 2023",
    about: "Co-administrator responsible for access control, audit logging, and overall system health of the portal.",
    projectIds: [],
  },
  {
    id: "9", name: "Peter Mueller", initials: "PM",
    email: "p.mueller@telekom.de", role: "General User", status: "inactive",
    department: "AI for Networks", joined: "Sep 2024",
    projectIds: [],
  },
]

export const AVATAR_COLOR: Record<string, string> = {
  AS: "bg-primary",
  AM: "bg-blue-500",
  BS: "bg-emerald-500",
  TB: "bg-amber-500",
  LW: "bg-violet-500",
  MM: "bg-cyan-500",
  SK: "bg-pink-500",
  RN: "bg-orange-500",
  PM: "bg-zinc-500",
}

export function avatarColor(initials: string): string {
  return AVATAR_COLOR[initials] ?? "bg-muted"
}

export const ROLE_BADGE: Record<UserRole, string> = {
  "Admin":           "bg-primary/10 text-primary border border-primary/25",
  "Project Manager": "bg-amber-500/15 text-amber-500 border border-amber-500/25",
  "General User":    "bg-muted text-muted-foreground border border-border",
}

export const STATUS_BADGE: Record<UserStatus, string> = {
  active:   "bg-emerald-500/15 text-emerald-500",
  inactive: "bg-zinc-500/15 text-zinc-400",
}
