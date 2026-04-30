const API_BASE = import.meta.env.VITE_API_URL || ''

export async function api<T = unknown>(path: string, options: RequestInit & { signal?: AbortSignal } = {}): Promise<T> {
  const { signal, ...restOptions } = options
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(restOptions.headers as Record<string, string>) },
    signal: signal ?? AbortSignal.timeout(10000),
    ...restOptions,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail || `API error ${res.status}`)
  }
  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

export function wsUrl(path: string): string {
  const base = API_BASE || window.location.origin
  return base.replace(/^http/, 'ws') + path
}
