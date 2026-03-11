"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef, useEffect, useState } from "react"
import { Bell, User, ChevronDown, Check } from "lucide-react"
import { useRole, type AppRole } from "@/lib/role-context"

const ALL_NAV = [
  { href: "/",                  label: "Overview",             roles: ["Admin", "Project Manager", "General User"] },
  { href: "/projects",          label: "Projects",             roles: ["Admin", "Project Manager", "General User"] },
  { href: "/configurations",    label: "Configurations",       roles: ["Admin"] },
  { href: "/roles-permissions", label: "Roles & Permissions",  roles: ["Admin"] },
]

const ROLE_META: Record<AppRole, { description: string }> = {
  "Admin":           { description: "Full system access" },
  "Project Manager": { description: "Create & manage projects" },
  "General User":    { description: "View public projects only" },
}

export function Header() {
  const pathname   = usePathname()
  const { role, setRole } = useRole()
  const [open, setOpen]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const nav = ALL_NAV.filter(n => n.roles.includes(role))

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function switchRole(r: AppRole) {
    setRole(r)
    setOpen(false)
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

        {/* App name */}
        <div className="flex items-center pr-8">
          <span className="text-sm text-primary font-medium">Application name</span>
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

          {/* Notifications */}
          <button className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <Bell className="h-4.5 w-4.5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-background" />
          </button>

          {/* Profile + role switcher */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{role}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Switch role</p>
                </div>
                <div className="py-1.5">
                  {(["Admin", "Project Manager", "General User"] as AppRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => switchRole(r)}
                      className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{r}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{ROLE_META[r].description}</p>
                      </div>
                      {role === r && <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-1" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
