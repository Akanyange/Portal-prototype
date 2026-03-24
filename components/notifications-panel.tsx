"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Settings, X } from "lucide-react"
import {
  NOTIFICATIONS,
  groupNotifications,
  formatNotifTime,
  type AppNotification,
} from "@/lib/notifications-data"

// ── Category dot colour ───────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<AppNotification["category"], string> = {
  "bi-weekly": "bg-primary",
  "milestone": "bg-amber-400",
  "deadline":  "bg-orange-500",
  "system":    "bg-blue-400",
}

// ── Panel ─────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
}

export function NotificationsPanel({ onClose }: Props) {
  const router  = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  function toggleRead(id: string) {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
    )
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const groups  = groupNotifications(notifications)
  const unread  = notifications.filter(n => !n.read).length

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-[400px] rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl z-50 overflow-hidden text-white"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Notifications</span>
          {unread > 0 && (
            <span className="text-[10px] font-medium bg-primary text-white rounded-full px-1.5 py-0.5 leading-none">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] text-zinc-400 hover:text-white transition-colors mr-2"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={() => { onClose(); router.push("/notifications/settings") }}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors"
            title="Notification settings"
          >
            <Settings className="h-3.5 w-3.5 text-zinc-400" />
          </button>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* ── Grouped list ────────────────────────────────────────────────────── */}
      <div className="max-h-[420px] overflow-y-auto">
        {groups.map(group => (
          <div key={group.label}>
            {/* Group label */}
            <div className="px-4 pt-3 pb-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                {group.label}
              </span>
            </div>

            {group.items.map(notif => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-zinc-800/60 ${
                  notif.read ? "opacity-60" : ""
                }`}
              >
                {/* Coloured dot */}
                <span
                  className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                    notif.read ? "bg-zinc-600" : CATEGORY_COLOR[notif.category]
                  }`}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] leading-snug">{notif.message}</p>
                  <button
                    className="text-[11px] text-primary underline underline-offset-2 hover:opacity-80 transition-opacity mt-0.5 block text-left"
                    onClick={() => { onClose(); router.push(`/projects/${notif.projectId}`) }}
                  >
                    {notif.projectName}
                  </button>
                </div>

                {/* Right side: time + mark-as-read radio */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] text-zinc-500 whitespace-nowrap">
                    {formatNotifTime(notif.timestamp)}
                  </span>
                  {/* Radio-style read toggle */}
                  <button
                    onClick={() => toggleRead(notif.id)}
                    title={notif.read ? "Mark as unread" : "Mark as read"}
                    className={`h-3.5 w-3.5 rounded-full border-2 transition-colors shrink-0 ${
                      notif.read
                        ? "border-zinc-600 bg-transparent"
                        : "border-primary bg-primary"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-zinc-500">
            No notifications
          </div>
        )}
      </div>
    </div>
  )
}
