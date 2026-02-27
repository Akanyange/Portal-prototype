"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

const NAV = [
  { href: "/",         label: "Overview" },
  { href: "/projects", label: "Projects" },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-14 items-stretch px-6">
        {/* T-Mobile logo square */}
        <div className="flex items-center pr-5">
          <div className="h-11 w-11 bg-primary rounded flex items-center justify-center text-primary-foreground font-extrabold text-2xl select-none">
            T
          </div>
        </div>

        {/* App name — magenta */}
        <div className="flex items-center pr-8">
          <span className="text-sm text-primary font-medium">Application name</span>
        </div>

        {/* Tab navigation */}
        <nav className="flex items-stretch gap-1">
          {NAV.map(({ href, label }) => {
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

        {/* Right side: user avatar + hamburger menu */}
        <div className="ml-auto flex items-center gap-5">
          {/* User */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-muted-foreground">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5 text-white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            </div>
            <span className="text-sm font-medium">Label</span>
          </div>

          {/* Hamburger menu */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
            <Menu className="h-5 w-5 text-foreground" />
            <span className="text-sm font-medium">Label</span>
          </div>
        </div>
      </div>
    </header>
  )
}
