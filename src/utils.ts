import type { RequestLog, StoredState } from './types'

export function readStorage(key: string): StoredState | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

export function writeStorage(key: string, state: StoredState) {
  try { localStorage.setItem(key, JSON.stringify(state)) } catch { /* ignore */ }
}

export function toCurl(log: RequestLog): string {
  const parts = [`curl -X ${log.method} '${log.url}'`]
  if (log.headers) {
    for (const [key, val] of Object.entries(log.headers)) {
      parts.push(`  -H '${key}: ${val}'`)
    }
  }
  if (log.requestBody != null) {
    parts.push(`  -d '${JSON.stringify(log.requestBody)}'`)
  }
  return parts.join(' \\\n')
}

export function copyText(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function extractHeaders(headers?: HeadersInit): Record<string, string> {
  const result: Record<string, string> = {}
  if (!headers) return result

  if (headers instanceof Headers) {
    headers.forEach((val, key) => { result[key] = val })
  } else if (Array.isArray(headers)) {
    for (const [key, val] of headers) {
      result[key] = val
    }
  } else {
    Object.assign(result, headers)
  }
  return result
}

export async function safeParseResponse(response: Response): Promise<unknown> {
  try {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return await response.json()
    }
    const text = await response.text()
    // Try to parse as JSON anyway
    try { return JSON.parse(text) } catch { /* not json */ }
    // If the text is too long, truncate it
    if (text.length > 10000) {
      return text.slice(0, 10000) + '... [truncated]'
    }
    return text
  } catch {
    return '[Could not read response body]'
  }
}

export function parseBody(body?: BodyInit | null): unknown {
  if (body == null) return undefined
  if (typeof body === 'string') {
    try { return JSON.parse(body) } catch { return body }
  }
  if (body instanceof URLSearchParams) {
    return Object.fromEntries(body.entries())
  }
  if (body instanceof FormData) {
    const obj: Record<string, unknown> = {}
    body.forEach((val, key) => { obj[key] = val instanceof File ? `[File: ${val.name}]` : val })
    return obj
  }
  return '[Binary body]'
}
