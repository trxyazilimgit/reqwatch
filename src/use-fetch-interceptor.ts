import { useEffect, useRef } from 'react'
import type { RequestLog } from './types'
import { extractHeaders, parseBody, safeParseResponse, generateId } from './utils'

const REQWATCH_EVENT = 'reqwatch:log'

export function useFetchInterceptor(maxLogs: number, onLog: (log: RequestLog) => void) {
  const onLogRef = useRef(onLog)
  onLogRef.current = onLog

  useEffect(() => {
    if (typeof window === 'undefined') return

    const originalFetch = window.fetch.bind(window)

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const start = performance.now()
      const method = init?.method?.toUpperCase() || 'GET'

      let url: string
      if (typeof input === 'string') {
        url = input
      } else if (input instanceof URL) {
        url = input.toString()
      } else if (input instanceof Request) {
        url = input.url
      } else {
        url = String(input)
      }

      const headers = extractHeaders(init?.headers)
      const requestBody = parseBody(init?.body)

      try {
        const response = await originalFetch(input, init)
        const duration = Math.round(performance.now() - start)
        const clone = response.clone()
        const responseBody = await safeParseResponse(clone)

        const log: RequestLog = {
          id: generateId(),
          method,
          url,
          status: response.status,
          duration,
          headers,
          requestBody,
          responseBody,
          success: response.ok,
          timestamp: new Date(),
        }

        window.dispatchEvent(new CustomEvent(REQWATCH_EVENT, { detail: log }))
        return response
      } catch (error) {
        const duration = Math.round(performance.now() - start)

        const log: RequestLog = {
          id: generateId(),
          method,
          url,
          status: 0,
          duration,
          headers,
          requestBody,
          error: error instanceof Error ? error.message : String(error),
          success: false,
          timestamp: new Date(),
        }

        window.dispatchEvent(new CustomEvent(REQWATCH_EVENT, { detail: log }))
        throw error
      }
    }

    const handleEvent = (e: Event) => {
      const log = (e as CustomEvent<RequestLog>).detail
      if (log) onLogRef.current(log)
    }

    window.addEventListener(REQWATCH_EVENT, handleEvent)

    return () => {
      window.fetch = originalFetch
      window.removeEventListener(REQWATCH_EVENT, handleEvent)
    }
  }, [maxLogs])
}
