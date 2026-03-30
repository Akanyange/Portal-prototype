export type ProjectStatus  = "planned" | "ongoing" | "completed"
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
  description?: string
  updatedAt?: string
}

export interface MilestoneSegment {
  label: string
  startDate: string   // "YYYY-MM-DD"
  endDate: string
  type: TaskStatus
}

export interface MilestoneMarker {
  date: string
  status: MilestoneStatus
  description?: string
  updatedAt?: string
}

export interface MilestoneRow {
  id: string
  name: string
  dueDate: string
  status: "on-track" | "at-risk"
  segments: MilestoneSegment[]
  markers: MilestoneMarker[]
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
  // Detail page fields
  tags?: string[]
  createdDate?: string
  projectLead?: string
  links?: string[]
  description?: string
  milestoneRows?: MilestoneRow[]
  nextUpdateDue?: string   // "YYYY-MM-DD" — when the next status update is due
}

/** month 1–12, day 1–31 → 0–1 year fraction */
export function f(month: number, day = 1): number {
  return (month - 1 + (day - 1) / 30) / 12
}

export const STATUS_DOT: Record<ProjectStatus, string> = {
  "planned":   "bg-blue-500",
  "ongoing":   "bg-amber-500",
  "completed": "bg-emerald-500",
}

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  "planned":   "Planned",
  "ongoing":   "Ongoing",
  "completed": "Completed",
}

export const STATUS_BADGE: Record<ProjectStatus, string> = {
  "planned":   "bg-blue-500/15 text-blue-300",
  "ongoing":   "bg-amber-500/15 text-amber-300",
  "completed": "bg-emerald-500/15 text-emerald-300",
}

export const projects: Project[] = [
  {
    id: "fach-cab",
    name: "Fach CAB & Change Mgmt Agent",
    status: "ongoing",
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
      { label: "Kafka Connect",  position: f(3, 8), status: "completed",   description: "Establish the Kafka connection to CASM and validate message flow between systems. Confirm message schema, throughput targets, and error handling before sign-off.", updatedAt: "2w ago" },
      { label: "API Access",     position: f(7, 5), status: "completed",   description: "Set up API access credentials for ChaCo and complete integration testing against the staging environment.", updatedAt: "1w ago" },
      { label: "Full Deploy",    position: f(9, 8), status: "completed",   description: "Full production deployment of all components with monitoring and alerting in place. Includes smoke tests and rollback plan sign-off.", updatedAt: "3d ago" },
    ],
  },
  {
    id: "incident-perceptor",
    name: "Incident Perceptor",
    status: "planned",
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
      { label: "PoC Ready",   position: f(2, 15), status: "completed",   description: "Proof of concept demonstrating core incident detection capabilities on sample data. Presented to stakeholders for initial feedback.", updatedAt: "1w ago" },
      { label: "UAT Release", position: f(7, 8),  status: "not-started", description: "User acceptance testing release with full feature set for stakeholder validation. Requires sign-off from QA lead and product owner.", updatedAt: "5d ago" },
    ],
  },
  {
    id: "mbfd",
    name: "MBfD",
    status: "ongoing",
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
      { label: "Model Ready",  position: f(8, 20),  status: "completed"   },
      { label: "Production",   position: f(12, 25), status: "not-started" },
    ],
  },
  {
    id: "mndr",
    name: "MNDR",
    status: "completed",
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
      { label: "v1 Release", position: f(4, 12), status: "not-started" },
    ],
  },
  {
    id: "netinsights",
    name: "NetInsights",
    status: "completed",
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
    status: "ongoing",
    lead: "f.richter@example.com",
    pe: "Use case for AN L4",
    tribe: "AI for Networks",
    startDate: "1 Jan 2026",
    endDate: "30 Apr 2026",
    boardUrl: "#",
    visibility: "Public",
    progress: 72,
    tasks: [
      { label: "Establish CASM-Connection via Kafka", start: f(1), end: f(4, 25), status: "completed" },
    ],
    milestones: [],
    // Detail page data
    tags: ["AI for Networks", "AI Network Foundation"],
    createdDate: "1 Mar 2024",
    projectLead: "Alycia Smith",
    links: ["https://www.atlassian.com/software/confluence"],
    description:
      "This project aims to design and implement a scalable digital solution that addresses a clearly identified user and business need. It begins with research and requirement gathering to understand target users, stakeholder expectations, and technical constraints. Insights from this phase inform concept development, information architecture, and experience design. The project follows an iterative approach, including prototyping, validation, development, and continuous feedback loops to ensure usability, performance, and alignment with defined success metrics.",
    nextUpdateDue: "2026-04-02",
    milestoneRows: [
      {
        id: "ms1",
        name: "Milestone 2",
        dueDate: "18th Feb",
        status: "on-track",
        segments: [
          { label: "Establish CASM-Connection via Kafka", startDate: "2026-01-07", endDate: "2026-01-30", type: "completed" },
        ],
        markers: [{ date: "2026-01-30", status: "completed", description: "Collect and document project requirements by engaging stakeholders to understand business goals, user needs, and system expectations. Define functional and non-functional requirements, clarify scope and constraints, and produce a structured requirements document to guide design and development.", updatedAt: "1w ago" }],
      },
      {
        id: "ms2",
        name: "Milestone 2",
        dueDate: "18th Feb",
        status: "on-track",
        segments: [
          { label: "Establish CASM-Connection via Kafka", startDate: "2026-01-21", endDate: "2026-02-18", type: "in-progress" },
          { label: "Establish CASM-Connection via Kafka", startDate: "2026-02-25", endDate: "2026-04-08", type: "not-started" },
        ],
        markers: [
          { date: "2026-02-18", status: "completed" },
          { date: "2026-04-08", status: "not-started" },
        ],
      },
      {
        id: "ms3",
        name: "Milestone 3",
        dueDate: "18th Feb",
        status: "at-risk",
        segments: [
          { label: "Establish CASM-Connection via Kafka", startDate: "2026-01-07", endDate: "2026-03-18", type: "in-progress" },
        ],
        markers: [{ date: "2026-03-18", status: "completed" }],
      },
      {
        id: "ms4",
        name: "Milestone 4",
        dueDate: "18th Feb",
        status: "on-track",
        segments: [
          { label: "Establish CASM-Connection via Kafka", startDate: "2026-02-25", endDate: "2026-03-25", type: "not-started" },
        ],
        markers: [{ date: "2026-03-25", status: "not-started" }],
      },
      {
        id: "ms5",
        name: "Milestone 5",
        dueDate: "18th Feb",
        status: "on-track",
        segments: [
          { label: "Establish CASM-Connection via Kafka", startDate: "2026-03-18", endDate: "2026-04-08", type: "in-progress" },
        ],
        markers: [{ date: "2026-04-08", status: "completed" }],
      },
      {
        id: "ms6",
        name: "Milestone 6",
        dueDate: "18th Feb",
        status: "on-track",
        segments: [
          { label: "Establish CASM-Connection via Kafka", startDate: "2026-04-01", endDate: "2026-04-25", type: "in-progress" },
        ],
        markers: [],
      },
      {
        id: "ms7",
        name: "Milestone 7",
        dueDate: "18th Feb",
        status: "on-track",
        segments: [
          { label: "Establish CASM-Connection via Kafka", startDate: "2026-02-25", endDate: "2026-03-25", type: "in-progress" },
          { label: "Establish CASM-Connection via Kafka", startDate: "2026-04-01", endDate: "2026-04-15", type: "not-started" },
        ],
        markers: [{ date: "2026-04-01", status: "not-started" }],
      },
      {
        id: "ms8",
        name: "Milestone 8",
        dueDate: "18th Feb",
        status: "on-track",
        segments: [
          { label: "Establish CASM-Connection via Kafka", startDate: "2026-03-18", endDate: "2026-04-08", type: "in-progress" },
          { label: "Establish CASM-Connection via Kafka", startDate: "2026-04-08", endDate: "2026-04-22", type: "not-started" },
        ],
        markers: [],
      },
    ],
  },
  {
    id: "ai-ops",
    name: "AI ops",
    status: "planned",
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
    status: "ongoing",
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
