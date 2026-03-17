/**
 * JIRA Integration Service
 *
 * In production this would call the real JIRA REST API:
 *   GET https://{domain}/rest/api/3/search
 *       ?jql=project={key} AND issuetype=Epic
 *       &fields=summary,status,duedate,created,customfield_10015
 *
 * The Authorization header would be:
 *   Basic base64("{email}:{apiToken}")
 *
 * Here we simulate the network call and return realistic mock data
 * mapped straight to the MilestoneRow schema the Gantt chart already expects.
 */

import type { MilestoneRow, MilestoneSegment, MilestoneMarker, TaskStatus } from "./projects-data"

// ── Public types ─────────────────────────────────────────────────────────────

export interface JiraConfig {
  domain:     string   // e.g. "yourteam.atlassian.net"
  email:      string   // Atlassian account email
  apiToken:   string   // JIRA API token (generated in Atlassian account settings)
  projectKey: string   // e.g. "RGC", "MNDR"
}

export type JiraConnectionStatus =
  | { state: "idle" }
  | { state: "connecting" }
  | { state: "connected"; syncedAt: string; config: JiraConfig }
  | { state: "error"; message: string }

// ── Schema mapping helpers ────────────────────────────────────────────────────

/** Maps JIRA issue status category to our TaskStatus */
function mapStatus(jiraStatusCategory: string): TaskStatus {
  switch (jiraStatusCategory) {
    case "Done":        return "completed"
    case "In Progress": return "in-progress"
    default:            return "not-started"
  }
}

/** Maps JIRA sprint state to MilestoneRow status */
function mapMilestoneStatus(dueDate: string): "on-track" | "at-risk" {
  const due  = new Date(dueDate)
  const now  = new Date()
  const daysLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return daysLeft < 14 && daysLeft > 0 ? "at-risk" : "on-track"
}

// ── Mock JIRA data (keyed by projectKey) ─────────────────────────────────────

interface MockJiraEpic {
  key:        string
  summary:    string
  statusCat:  string
  startDate:  string
  dueDate:    string
  segments:   Array<{ label: string; start: string; end: string; statusCat: string }>
  markerDate: string
  markerDone: boolean
}

const MOCK_DATA: Record<string, MockJiraEpic[]> = {
  // Generic fallback — used for any projectKey not explicitly listed
  DEFAULT: [
    {
      key: "PROJ-1", summary: "Infrastructure Setup",
      statusCat: "Done", startDate: "2026-01-07", dueDate: "2026-01-30", markerDate: "2026-01-30", markerDone: true,
      segments: [{ label: "Provision cloud resources", start: "2026-01-07", end: "2026-01-30", statusCat: "Done" }],
    },
    {
      key: "PROJ-2", summary: "Core Feature Development",
      statusCat: "In Progress", startDate: "2026-01-21", dueDate: "2026-02-28", markerDate: "2026-02-28", markerDone: false,
      segments: [
        { label: "Backend API implementation", start: "2026-01-21", end: "2026-02-15", statusCat: "In Progress" },
        { label: "Frontend integration",       start: "2026-02-15", end: "2026-02-28", statusCat: "To Do"       },
      ],
    },
    {
      key: "PROJ-3", summary: "Testing & QA",
      statusCat: "To Do", startDate: "2026-03-01", dueDate: "2026-03-21", markerDate: "2026-03-21", markerDone: false,
      segments: [{ label: "Integration tests + UAT", start: "2026-03-01", end: "2026-03-21", statusCat: "To Do" }],
    },
    {
      key: "PROJ-4", summary: "Production Release",
      statusCat: "To Do", startDate: "2026-03-25", dueDate: "2026-04-10", markerDate: "2026-04-10", markerDone: false,
      segments: [{ label: "Staging deploy + smoke tests", start: "2026-03-25", end: "2026-04-10", statusCat: "To Do" }],
    },
  ],
  RGC: [
    {
      key: "RGC-1", summary: "RAN Data Pipeline",
      statusCat: "Done", startDate: "2026-01-07", dueDate: "2026-01-30", markerDate: "2026-01-30", markerDone: true,
      segments: [{ label: "Ingest RAN KPI feeds", start: "2026-01-07", end: "2026-01-30", statusCat: "Done" }],
    },
    {
      key: "RGC-2", summary: "Anomaly Detection Model",
      statusCat: "In Progress", startDate: "2026-01-21", dueDate: "2026-02-18", markerDate: "2026-02-18", markerDone: false,
      segments: [
        { label: "Feature engineering",  start: "2026-01-21", end: "2026-02-05", statusCat: "Done"        },
        { label: "Model training + eval", start: "2026-02-05", end: "2026-02-18", statusCat: "In Progress" },
      ],
    },
    {
      key: "RGC-3", summary: "Alert Engine Integration",
      statusCat: "To Do", startDate: "2026-02-25", dueDate: "2026-03-18", markerDate: "2026-03-18", markerDone: false,
      segments: [{ label: "CASM alert routing", start: "2026-02-25", end: "2026-03-18", statusCat: "To Do" }],
    },
    {
      key: "RGC-4", summary: "Dashboard & Reporting",
      statusCat: "To Do", startDate: "2026-03-18", dueDate: "2026-04-08", markerDate: "2026-04-08", markerDone: false,
      segments: [{ label: "Live KPI dashboard", start: "2026-03-18", end: "2026-04-08", statusCat: "To Do" }],
    },
    {
      key: "RGC-5", summary: "Hardening & Go-Live",
      statusCat: "To Do", startDate: "2026-04-01", dueDate: "2026-04-25", markerDate: "2026-04-25", markerDone: false,
      segments: [{ label: "Load testing + production cutover", start: "2026-04-01", end: "2026-04-25", statusCat: "To Do" }],
    },
  ],
}

// ── Schema transformer ────────────────────────────────────────────────────────

function epicToMilestoneRow(epic: MockJiraEpic): MilestoneRow {
  const segments: MilestoneSegment[] = epic.segments.map(s => ({
    label:     s.label,
    startDate: s.start,
    endDate:   s.end,
    type:      mapStatus(s.statusCat),
  }))

  const markers: MilestoneMarker[] = [{
    date:      epic.markerDate,
    status:    epic.markerDone ? "completed" : "not-started",
    updatedAt: epic.markerDone ? "via JIRA" : undefined,
  }]

  // Format due date as "18th Feb" style
  const due = new Date(epic.dueDate)
  const day = due.getDate()
  const suffix =
    day === 1 || day === 21 || day === 31 ? "st"
    : day === 2 || day === 22 ? "nd"
    : day === 3 || day === 23 ? "rd"
    : "th"
  const monthName = due.toLocaleString("en-US", { month: "short" })
  const dueDateFormatted = `${day}${suffix} ${monthName}`

  return {
    id:      epic.key,
    name:    epic.summary,
    dueDate: dueDateFormatted,
    status:  mapMilestoneStatus(epic.dueDate),
    segments,
    markers,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Simulates a JIRA API call and returns MilestoneRows.
 *
 * Real implementation would be:
 *   const creds = btoa(`${config.email}:${config.apiToken}`)
 *   const res = await fetch(
 *     `https://${config.domain}/rest/api/3/search?jql=project=${config.projectKey}+AND+issuetype=Epic&fields=summary,status,duedate,customfield_10015`,
 *     { headers: { Authorization: `Basic ${creds}`, Accept: "application/json" } }
 *   )
 *   const body = await res.json()
 *   return body.issues.map(epicToMilestoneRow)
 */
export async function fetchJiraMilestones(config: JiraConfig): Promise<MilestoneRow[]> {
  // Validate inputs
  if (!config.domain || !config.email || !config.apiToken || !config.projectKey) {
    throw new Error("All fields are required.")
  }
  if (!config.domain.includes(".")) {
    throw new Error("Enter a valid JIRA domain (e.g. yourteam.atlassian.net).")
  }
  if (!config.email.includes("@")) {
    throw new Error("Enter a valid email address.")
  }
  if (config.apiToken.length < 8) {
    throw new Error("API token appears too short. Check your Atlassian account settings.")
  }

  // Simulate network latency
  await new Promise(res => setTimeout(res, 1800))

  // Simulate occasional auth error (demo: token starting with "bad")
  if (config.apiToken.toLowerCase().startsWith("bad")) {
    throw new Error("Authentication failed. Check your email and API token.")
  }

  const key    = config.projectKey.toUpperCase()
  const epics  = MOCK_DATA[key] ?? MOCK_DATA.DEFAULT
  return epics.map(epicToMilestoneRow)
}
