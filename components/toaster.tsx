"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, X } from "lucide-react"
import { _registerToastListener, type ToastPayload } from "@/lib/toast"

interface ToastItem {
  id: number
  title: string
  description?: string
  type: "success" | "error"
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    return _registerToastListener((payload: ToastPayload) => {
      const id = Date.now()
      setToasts(prev => [...prev, {
        id,
        title: payload.title,
        description: payload.description,
        type: payload.type ?? "success",
      }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 4000)
    })
  }, [])

  if (!toasts.length) return null

  return (
    <div className="fixed top-6 right-6 z-9999 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-card border border-border min-w-75 max-w-95"
        >
          {/* Colored circle icon */}
          <div className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
            t.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`}>
            {t.type === "success"
              ? <CheckCircle2 className="h-4 w-4 text-white" />
              : <AlertCircle className="h-4 w-4 text-white" />
            }
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">{t.title}</p>
            {t.description && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.description}</p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
