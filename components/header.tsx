"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef, useEffect, useState } from "react"
import { Bell, User, ChevronDown, Check, Moon, Sun, LogOut } from "lucide-react"
import { useRole, type AppRole } from "@/lib/role-context"
import { NotificationsPanel } from "@/components/notifications-panel"
import { NOTIFICATIONS } from "@/lib/notifications-data"

const ALL_NAV = [
  { href: "/",                  label: "Overview",             roles: ["Admin", "Project Manager", "General User"] },
  { href: "/projects",          label: "Projects",             roles: ["Admin", "Project Manager", "General User"] },
  { href: "/configurations",    label: "Configurations",       roles: ["Admin"] },
  { href: "/user-management",   label: "User Management",       roles: ["Admin"] },
]

const USER_INFO = {
  name:  "Alycia Smith",
  email: "alycia.smith@telekom.de",
}

const ROLE_META: Record<AppRole, string> = {
  "Admin":           "Full system access",
  "Project Manager": "Create & manage projects",
  "General User":    "View public projects only",
}

export function Header() {
  const pathname      = usePathname()
  const { role, setRole } = useRole()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [isDark,      setIsDark]      = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef   = useRef<HTMLDivElement>(null)

  const nav         = ALL_NAV.filter(n => n.roles.includes(role))
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length

  // Sync dark state on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"))
  }, [])

  // Close profile on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function toggleDark() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-14 items-stretch px-6">

        {/* T-Mobile logo square */}
        <div className="flex items-center pr-5">
          <div className="h-11 w-11 bg-primary rounded flex items-center justify-center text-primary-foreground font-extrabold text-2xl select-none">
            T
          </div>
        </div>

        {/* Tab navigation — filtered by role */}
        <nav className="flex items-stretch gap-1">
          {nav.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-4 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground hover:text-primary"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">

          {/* Notifications bell — Admin & Project Manager only */}
          {role !== "General User" && <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <Bell className="h-4.5 w-4.5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white px-0.5 border-2 border-background leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <NotificationsPanel onClose={() => setNotifOpen(false)} />
            )}
          </div>}

          {/* Profile button + dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{role}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* ── Profile dropdown ─────────────────────────────────────────── */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden">

                {/* User info — click to view profile */}
                <Link
                  href="/users/1"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-5 pt-5 pb-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-base leading-tight">{USER_INFO.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{USER_INFO.email}</p>
                  </div>
                </Link>

                <div className="border-t border-border" />

                {/* Role switcher */}
                <div className="px-5 py-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Switch Role
                  </p>
                  {(["Admin", "Project Manager", "General User"] as AppRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className="w-full flex items-center gap-3 py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{r}</p>
                        <p className="text-[11px] text-muted-foreground">{ROLE_META[r]}</p>
                      </div>
                      {role === r && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-border" />

                {/* Dark mode toggle */}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    {isDark
                      ? <Moon className="h-4 w-4 text-muted-foreground" />
                      : <Sun  className="h-4 w-4 text-muted-foreground" />
                    }
                    <span className="text-sm">Dark Mode</span>
                  </div>
                  <button
                    role="switch"
                    aria-checked={isDark}
                    onClick={toggleDark}
                    className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isDark ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        isDark ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="border-t border-border" />

                {/* Log Out */}
                <div className="px-5 py-4">
                  <button className="flex items-center gap-2 bg-foreground text-background rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-foreground/85 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
