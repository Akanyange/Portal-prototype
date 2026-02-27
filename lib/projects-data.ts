export type ProjectStatus  = "on-track" | "at-risk" | "paused" | "off-track"
export type TaskStatus     = "not-started" | "in-progress" | "completed"
export type MilestoneStatus = "completed" | "not-started"
export type Visibility     = "Public" | "Private"

export interface GanttTask {
  label: string
  start: number
  end: number
  status: TaskStatus
}

export interface GanttMilestone {
  label: string
  position: number
  status: MilestoneStatus
}

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  lead: string
  pe: string
  tribe: string
  startDate: string
  endDate: string
  boardUrl: string
  visibility: Visibility
  progress: number          // 0–100
  tasks: GanttTask[]
  milestones: GanttMilestone[]
}

/** month 1–12, day 1–31 → 0–1 year fraction */
export function f(month: number, day = 1): number {
  return (month - 1 + (day - 1) / 30) / 12
}

export const STATUS_DOT: Record<ProjectStatus, string> = {
  "on-track":  "bg-emerald-500",
  "at-risk":   "bg-orange-500",
  "paused":    "bg-gray-400",
  "off-track": "bg-red-500",
}

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  "on-track":  "On Track",
  "at-risk":   "At Risk",
  "paused":    "Paused",
  "off-track": "Off Track",
}

export const STATUS_BADGE: Record<ProjectStatus, string> = {
  "on-track":  "bg-emerald-100 text-emerald-700",
  "at-risk":   "bg-orange-100 text-orange-700",
  "paused":    "bg-gray-100 text-gray-600",
  "off-track": "bg-red-100 text-red-700",
}

export const projects: Project[] = [
  {
    id: "fach-cab",
    name: "Fach CAB & Change Mgmt Agent",
    status: "on-track",
    lead: "a.mueller@example.com",
    pe: "AI Network Foundations",
    tribe: "AI for Networks",
    startDate: "1 Jan 2026",
    endDate: "30 Sep 2026",
    boardUrl: "#",
    visibility: "Private",
    progress: 28,
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1),    end: f(3, 8),  status: "completed"   },
      { label: "Establish API access for ChaCo",      start: f(3, 8), end: f(7),     status: "not-started" },
      { label: "Establish API access for ChaCo",      start: f(7, 5), end: f(9, 12), status: "not-started" },
    ],
    milestones: [
      { label: "MVP\n1", position: f(3, 8), status: "completed"   },
      { label: "MVP\n2", position: f(7, 5), status: "completed"   },
      { label: "MVP\n3", position: f(9, 8), status: "completed"   },
    ],
  },
  {
    id: "incident-perceptor",
    name: "Incident Perceptor",
    status: "paused",
    lead: "b.schmidt@example.com",
    pe: "Service Observability",
    tribe: "AI for Networks",
    startDate: "1 Jan 2026",
    endDate: "31 Oct 2026",
    boardUrl: "#",
    visibility: "Public",
    progress: 45,
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1),    end: f(2, 15),  status: "completed"   },
      { label: "Establish CASM-Connection via Kafka", start: f(4),    end: f(6, 28),  status: "in-progress" },
      { label: "Establish CASM-Connection via Kafka", start: f(7, 8), end: f(10, 15), status: "not-started" },
    ],
    milestones: [
      { label: "", position: f(2, 15), status: "completed"   },
      { label: "", position: f(7, 8),  status: "not-started" },
    ],
  },
  {
    id: "mbfd",
    name: "MBfD",
    status: "off-track",
    lead: "c.weber@example.com",
    pe: "Use case for AN L4",
    tribe: "AI for Networks",
    startDate: "1 Jan 2026",
    endDate: "31 Dec 2026",
    boardUrl: "#",
    visibility: "Public",
    progress: 55,
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1), end: f(8, 20),  status: "in-progress" },
      { label: "Establish CASM-Connection via Kafka", start: f(9), end: f(12, 31), status: "not-started" },
    ],
    milestones: [
      { label: "", position: f(8, 20),  status: "completed"   },
      { label: "", position: f(12, 25), status: "not-started" },
    ],
  },
  {
    id: "mndr",
    name: "MNDR",
    status: "at-risk",
    lead: "d.bauer@example.com",
    pe: "AI Network Foundations",
    tribe: "AI for Networks",
    startDate: "1 Jan 2026",
    endDate: "30 Apr 2026",
    boardUrl: "#",
    visibility: "Private",
    progress: 62,
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1), end: f(3, 28), status: "in-progress" },
    ],
    milestones: [
      { label: "", position: f(4, 12), status: "not-started" },
    ],
  },
  {
    id: "netinsights",
    name: "NetInsights",
    status: "at-risk",
    lead: "e.klein@example.com",
    pe: "Service Observability",
    tribe: "AI for Networks",
    startDate: "1 Jan 2026",
    endDate: "31 Mar 2026",
    boardUrl: "#",
    visibility: "Public",
    progress: 80,
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1), end: f(3, 25), status: "completed" },
    ],
    milestones: [],
  },
  {
    id: "ran-guardian",
    name: "RAN Guardian CZ",
    status: "on-track",
    lead: "f.richter@example.com",
    pe: "Use case for AN L4",
    tribe: "AI for Networks",
    startDate: "1 Jan 2026",
    endDate: "30 Apr 2026",
    boardUrl: "#",
    visibility: "Private",
    progress: 72,
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1), end: f(4, 25), status: "completed" },
    ],
    milestones: [],
  },
  {
    id: "ai-ops",
    name: "AI ops",
    status: "at-risk",
    lead: "g.wolf@example.com",
    pe: "AI Network Foundations",
    tribe: "AI for Networks",
    startDate: "1 Mar 2026",
    endDate: "31 Aug 2026",
    boardUrl: "#",
    visibility: "Public",
    progress: 35,
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(3, 20), end: f(8, 28), status: "in-progress" },
    ],
    milestones: [],
  },
  {
    id: "olt-swap",
    name: "OLT Swap",
    status: "at-risk",
    lead: "h.braun@example.com",
    pe: "Service Observability",
    tribe: "AI for Networks",
    startDate: "1 Jan 2026",
    endDate: "31 Aug 2026",
    boardUrl: "#",
    visibility: "Public",
    progress: 60,
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1), end: f(8, 28), status: "in-progress" },
    ],
    milestones: [],
  },
]
