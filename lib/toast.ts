export interface ToastPayload {
  title: string
  description?: string
  type?: "success" | "error"
}

type Listener = (payload: ToastPayload) => void

let _listener: Listener | null = null

export function toast(title: string, description?: string, type: "success" | "error" = "success") {
  _listener?.({ title, description, type })
}

export function _registerToastListener(fn: Listener) {
  _listener = fn
  return () => { _listener = null }
}
