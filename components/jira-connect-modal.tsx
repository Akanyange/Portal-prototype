"use client"

import { useState } from "react"
import { Check, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { fetchJiraMilestones, type JiraConfig } from "@/lib/jira-service"
import type { MilestoneRow } from "@/lib/projects-data"

// ── Jira logo (inline SVG) ────────────────────────────────────────────────────

function JiraLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#0052CC" />
      <path
        d="M20.5 8.5L12 17.5l4.5 4.5L20.5 18l4 4 4.5-4.5L20.5 8.5z"
        fill="white" opacity="0.6"
      />
      <path
        d="M20.5 13.5L16 18.5l4.5 4.5 4.5-4.5L20.5 13.5z"
        fill="white"
      />
      <path
        d="M20.5 22L16.5 26l4 4 4-4-4-4z"
        fill="white" opacity="0.7"
      />
    </svg>
  )
}

// ── T-Mobile logo ─────────────────────────────────────────────────────────────

function TMobileLogo({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="bg-primary rounded-lg flex items-center justify-center text-white font-black text-lg shrink-0"
    >
      T
    </div>
  )
}

// ── Permission list items ─────────────────────────────────────────────────────

const JIRA_PERMISSIONS = [
  "Read Epics and milestones from your JIRA board",
  "Read sprint dates and deadline fields",
  "Read issue statuses to populate Gantt bar states",
  "No write access — this integration is read-only",
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open:        boolean
  onClose:     () => void
  projectName: string
  projectKey?: string   // pre-fill if known
  onConnected: (rows: MilestoneRow[], config: JiraConfig) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function JiraConnectModal({ open, onClose, projectName, projectKey = "", onConnected }: Props) {
  const [domain,   setDomain]   = useState("")
  const [email,    setEmail]    = useState("")
  const [token,    setToken]    = useState("")
  const [pKey,     setPKey]     = useState(projectKey)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)

  async function handleConnect() {
    setError(null)
    setLoading(true)
    try {
      const config: JiraConfig = {
        domain:     domain.trim().replace(/^https?:\/\//, ""),
        email:      email.trim(),
        apiToken:   token.trim(),
        projectKey: pKey.trim().toUpperCase(),
      }
      const rows = await fetchJiraMilestones(config)
      setSuccess(true)
      // Small pause to show success state before closing
      setTimeout(() => {
        onConnected(rows, config)
        onClose()
        setSuccess(false)
        setLoading(false)
      }, 900)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed. Please try again.")
      setLoading(false)
    }
  }

  function handleClose() {
    if (loading) return
    setError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md p-0 overflow-hidden" showCloseButton={!loading}>

        {/* ── Header band ────────────────────────────────────────────────────── */}
        <div className="bg-muted/40 border-b px-6 pt-6 pb-5 text-center space-y-3">
          {/* Logos */}
          <div className="flex items-center justify-center gap-3">
            <TMobileLogo />
            <div className="flex items-center gap-1">
              <div className="w-4 h-px bg-border" />
              <div className="text-muted-foreground text-xs">⇌</div>
              <div className="w-4 h-px bg-border" />
            </div>
            <JiraLogo />
          </div>
          {/* Title + description */}
          <div>
            <DialogTitle className="text-base font-semibold">
              Connect JIRA to {projectName}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-relaxed">
              Pull milestones and deadlines directly from your JIRA board into the Gantt chart — always in sync with your team's actual work.
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* ── Credentials form ─────────────────────────────────────────────── */}
          <div className="space-y-3">
            <Field
              label="JIRA Site URL"
              placeholder="yourteam.atlassian.net"
              value={domain}
              onChange={setDomain}
              disabled={loading}
              hint="Your Atlassian domain — no https:// needed"
            />
            <Field
              label="Email"
              placeholder="you@company.com"
              type="email"
              value={email}
              onChange={setEmail}
              disabled={loading}
            />
            <Field
              label="API Token"
              placeholder="••••••••••••••••••••"
              type="password"
              value={token}
              onChange={setToken}
              disabled={loading}
              hint={
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-primary hover:underline"
                >
                  Generate token in Atlassian settings
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              }
            />
            <Field
              label="Project Key"
              placeholder="e.g. RGC"
              value={pKey}
              onChange={setPKey}
              disabled={loading}
              hint="Found at the start of your issue IDs (e.g. RGC-123)"
            />
          </div>

          {/* ── Permissions list ─────────────────────────────────────────────── */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <p className="text-xs font-medium text-foreground">JIRA will allow:</p>
            {JIRA_PERMISSIONS.map(p => (
              <div key={p} className="flex items-start gap-2">
                <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground">{p}</span>
              </div>
            ))}
          </div>

          {/* ── Error message ─────────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* ── Actions ──────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 pt-1 pb-1">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={loading || success}
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {success ? (
                <>
                  <Check className="h-4 w-4" />
                  Connected!
                </>
              ) : loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                "Connect"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Field helper ──────────────────────────────────────────────────────────────

interface FieldProps {
  label:    string
  value:    string
  onChange: (v: string) => void
  placeholder?: string
  type?:    string
  disabled?: boolean
  hint?:    React.ReactNode
}

function Field({ label, value, onChange, placeholder, type = "text", disabled, hint }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 placeholder:text-muted-foreground"
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
