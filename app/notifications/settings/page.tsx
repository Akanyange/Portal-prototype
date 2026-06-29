"use client"

import { useState } from "react"
import { Monitor, Mail, ChevronDown, ChevronUp } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface NotifType {
  id: string
  label: string
  description: string
  enabled: boolean
}

interface Channel {
  id: string
  label: string
  icon: React.ReactNode
  notifTypes: NotifType[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function channelStatus(ch: Channel): { label: string; dotClass: string } {
  const anyOn = ch.notifTypes.some(t => t.enabled)
  const allOn = ch.notifTypes.every(t => t.enabled)
  if (!anyOn) return { label: "Disabled",                     dotClass: "bg-zinc-500" }
  if (allOn)  return { label: "Enabled for all notifications", dotClass: "bg-emerald-500" }
  return       { label: "Enabled for some notifications",      dotClass: "bg-amber-400" }
}

// ── Static data ───────────────────────────────────────────────────────────────

const NOTIF_TYPES: NotifType[] = [
  { id: "updates",   label: "Regular projects updates",  description: "Get notified to update projects and their milestones", enabled: true },
  { id: "reminders", label: "Reminders and deadlines",   description: "Reminders, due dates, and SLA updates",                enabled: true },
]


// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationsSettingsPage() {
  const [channels, setChannels] = useState<Channel[]>([
    { id: "desktop", label: "Desktop", icon: <Monitor className="h-4 w-4" />, notifTypes: NOTIF_TYPES.map(t => ({ ...t, enabled: false })) },
    { id: "email",   label: "Email",   icon: <Mail className="h-4 w-4" />,    notifTypes: NOTIF_TYPES.map(t => ({ ...t, enabled: true  })) },
  ])
  const [expanded,       setExpanded]       = useState<string | null>("desktop")
  const [inviteAccepted, setInviteAccepted] = useState(true)
  const [privacyUpdates, setPrivacyUpdates] = useState(true)

  function toggleExpand(id: string) {
    setExpanded(prev => prev === id ? null : id)
  }

  function toggleNotifType(channelId: string, typeId: string) {
    setChannels(prev => prev.map(ch =>
      ch.id !== channelId ? ch : {
        ...ch,
        notifTypes: ch.notifTypes.map(t =>
          t.id !== typeId ? t : { ...t, enabled: !t.enabled }
        ),
      }
    ))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-2">
      <h1 className="text-2xl font-bold tracking-tight">Notifications settings</h1>

      {/* ── Notification channels ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Notification channels</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose how to be notified for projects updates activities. Notifications will always be in the system&apos;s inbox.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
          {channels.map(ch => {
            const { label: statusLabel, dotClass } = channelStatus(ch)
            const isOpen = expanded === ch.id
            return (
              <div key={ch.id}>
                <button
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors text-left"
                  onClick={() => toggleExpand(ch.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{ch.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{ch.label}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                        <span className="text-xs text-muted-foreground">{statusLabel}</span>
                      </div>
                    </div>
                  </div>
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="divide-y divide-border/50">
                    {ch.notifTypes.map(t => (
                      <div key={t.id} className="flex items-center justify-between px-5 py-4 bg-muted/10">
                        <div>
                          <p className="text-sm font-medium">{t.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                        </div>
                        <Toggle value={t.enabled} onChange={() => toggleNotifType(ch.id, t.id)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Other Updates ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Other Updates</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium">Invite accepted</p>
              <p className="text-xs text-muted-foreground mt-0.5">Email when invitees accept an invite</p>
            </div>
            <Toggle value={inviteAccepted} onChange={() => setInviteAccepted(v => !v)} />
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium">Privacy and legal updates</p>
              <p className="text-xs text-muted-foreground mt-0.5">Email when privacy policies or terms of service change</p>
            </div>
            <Toggle value={privacyUpdates} onChange={() => setPrivacyUpdates(v => !v)} />
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        value ? "bg-primary" : "bg-gray-300 dark:bg-zinc-600"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform flex items-center justify-center ${
          value ? "translate-x-5" : "translate-x-0.5"
        }`}
      >
        {value && (
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-none stroke-primary" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M1.5 5.5 3.5 7.5 8.5 2.5"/>
          </svg>
        )}
      </span>
    </button>
  )
}
