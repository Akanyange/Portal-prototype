type Listener = (message: string, type: "success" | "error") => void

let _listener: Listener | null = null

export function toast(message: string, type: "success" | "error" = "success") {
  _listener?.(message, type)
}

export function _registerToastListener(fn: Listener) {
  _listener = fn
  return () => { _listener = null }
}
