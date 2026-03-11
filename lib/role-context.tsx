"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type AppRole = "Admin" | "Project Manager" | "General User"

interface RoleContextValue {
  role: AppRole
  setRole: (r: AppRole) => void
}

const RoleContext = createContext<RoleContextValue>({ role: "Admin", setRole: () => {} })

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>("Admin")
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  return useContext(RoleContext)
}
