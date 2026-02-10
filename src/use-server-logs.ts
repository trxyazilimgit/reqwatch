import { useEffect, useRef, useState } from 'react'
import type { RequestLog } from './types'

export function useServerLogs(
  port: number,
  onLog: (log: RequestLog) => void,
): boolean {
  const onLogRef = useRef(onLog)
  onLogRef.current = onLog
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || port === 0) return

    const url = `http://127.0.0.1:${port}/events`
    let es: EventSource | null = null
    let retries = 0
    const MAX_RETRIES = 5
    let retryTimeout: ReturnType<typeof setTimeout>
    let disposed = false

    function connect() {
      if (disposed) return

      es = new EventSource(url)

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
  }, [port])

  return connected
}
