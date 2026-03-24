export type NotifCategory = "bi-weekly" | "milestone" | "deadline" | "system"

export interface AppNotification {
  id: string
  category: NotifCategory
  message: string
  projectName: string
  projectId: string
  timestamp: Date
  read: boolean
}

// Dates relative to 2026-03-24 (today)
const TODAY     = new Date(2026, 2, 24)  // Mar 24
const YESTERDAY = new Date(2026, 2, 23)
const LAST_WEEK = new Date(2026, 2, 18)
const LAST_WEEK2 = new Date(2026, 2, 17)
const OLDER     = new Date(2026, 2, 10)

function t(base: Date, h: number, m: number) {
  const d = new Date(base)
  d.setHours(h, m, 0, 0)
  return d
}

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    category: "bi-weekly",
    message: "Project Bi-weekly update coming up in 4 days",
    projectName: "Ran Guardian CZ",
    projectId: "ran-guardian-cz",
    timestamp: t(TODAY, 9, 14),
    read: false,
  },
  {
    id: "n2",
    category: "milestone",
    message: 'Milestone "Phase 2 Delivery" is due in 2 days',
    projectName: "AI Network Foundation",
    projectId: "ai-network-foundation",
    timestamp: t(TODAY, 8, 30),
    read: false,
  },
  {
    id: "n3",
    category: "bi-weekly",
    message: "Project Bi-weekly update was not submitted",
    projectName: "MBfD",
    projectId: "mbfd",
    timestamp: t(YESTERDAY, 15, 0),
    read: false,
  },
  {
    id: "n4",
    category: "deadline",
    message: "Project deadline updated to 30th April 2026",
    projectName: "NetInsights",
    projectId: "netinsights",
    timestamp: t(YESTERDAY, 10, 45),
    read: true,
  },
  {
    id: "n5",
    category: "bi-weekly",
    message: "Project Bi-weekly update coming up in 4 days",
    projectName: "MNDR",
    projectId: "mndr",
    timestamp: t(LAST_WEEK, 9, 0),
    read: true,
  },
  {
    id: "n6",
    category: "milestone",
    message: 'Milestone "Requirements Gathering" marked as Completed',
    projectName: "Incident Perceptor",
    projectId: "incident-perceptor",
    timestamp: t(LAST_WEEK2, 14, 20),
    read: true,
  },
  {
    id: "n7",
    category: "system",
    message: "You were added as Project Lead on a new project",
    projectName: "OLT Swap",
    projectId: "olt-swap",
    timestamp: t(OLDER, 11, 0),
    read: true,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function groupNotifications(notifications: AppNotification[]) {
  const now   = new Date(2026, 2, 24)   // today (fixed for demo)
  const todayStr     = now.toDateString()
  const yesterdayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toDateString()
  const weekAgo      = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)

  const groups: { label: string; items: AppNotification[] }[] = [
    { label: "Today",     items: [] },
    { label: "Yesterday", items: [] },
    { label: "Last week", items: [] },
    { label: "Older",     items: [] },
  ]

  for (const n of notifications) {
    const ds = n.timestamp.toDateString()
    if (ds === todayStr)          groups[0].items.push(n)
    else if (ds === yesterdayStr) groups[1].items.push(n)
    else if (n.timestamp >= weekAgo) groups[2].items.push(n)
    else                          groups[3].items.push(n)
  }

  return groups.filter(g => g.items.length > 0)
}

export function formatNotifTime(ts: Date): string {
  const now      = new Date(2026, 2, 24, 12, 0)
  const diffMs   = now.getTime() - ts.getTime()
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins < 60)  return `${diffMins}m ago`
  const diffHrs  = Math.round(diffMins / 60)
  if (diffHrs < 24)   return `${diffHrs} hrs ago`
  const diffDays = Math.round(diffHrs / 24)
  return `${diffDays}d ago`
}
