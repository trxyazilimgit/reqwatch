import { useEffect, useRef, useState } from 'react'
import type { RequestLog } from './types'

function getOrCreateSessionId(): string {
  const COOKIE_NAME = '__reqwatch_id'

  // Check existing cookie
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`))
  if (match) return match[1]

  // Generate new ID
  const id = crypto.randomUUID()

  // Set cookie (session cookie + 30 days for persistence)
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${COOKIE_NAME}=${id}; path=/; expires=${expires}; SameSite=Lax`

  return id
}

export function useServerLogs(
  port: number,
  onLog: (log: RequestLog) => void,
  serverUrl?: string,
): boolean {
  const onLogRef = useRef(onLog)
  onLogRef.current = onLog
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const sessionId = getOrCreateSessionId()

    // Build SSE URL with session ID and optional token
    let baseUrl = serverUrl || (port === 0 ? null : `http://127.0.0.1:${port}/events`)
    if (!baseUrl) return

    const url = new URL(baseUrl, window.location.origin)
    url.searchParams.set('id', sessionId)

    let es: EventSource | null = null
    let retries = 0
    const MAX_RETRIES = 5
    let retryTimeout: ReturnType<typeof setTimeout>
    let disposed = false

    function connect() {
      if (disposed) return

      es = new EventSource(url.toString())

      es.onopen = () => {
        retries = 0
        setConnected(true)
      }

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onLogRef.current({
            ...data,
            timestamp: new Date(data.timestamp),
            source: 'server',
          })
        } catch { /* malformed data */ }
      }

      es.onerror = () => {
        es?.close()
        setConnected(false)
        retries++
        if (retries <= MAX_RETRIES && !disposed) {
          retryTimeout = setTimeout(connect, 2000 * retries)
        }
      }
    }

    connect()

    return () => {
      disposed = true
      es?.close()
      clearTimeout(retryTimeout)
      setConnected(false)
    }
  }, [port, serverUrl])

  return connected
}