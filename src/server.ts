import { createServer, type ServerResponse, type IncomingMessage } from 'node:http'
import type { RequestLog } from './types'
import { extractHeaders, parseBody, safeParseResponse, generateId } from './utils'

// Symbols to survive hot-reloads (same symbol registry across reloads)
const PATCHED = Symbol.for('reqwatch.patched')
const CLIENTS = Symbol.for('reqwatch.clients')
const SERVER = Symbol.for('reqwatch.server')

interface SSEClient {
  res: ServerResponse
  sessionId: string
  heartbeat: ReturnType<typeof setInterval>
}

const g = globalThis as Record<symbol, unknown>

if (!g[PATCHED]) {
  g[PATCHED] = true

  const SECRET = process.env.REQWATCH_SECRET || ''
  const clients = new Map<string, SSEClient>() // sessionId → client
  g[CLIENTS] = clients

  // ── Patch global.fetch ──────────────────────────────────────────────
  const originalFetch = globalThis.fetch

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // Zero overhead when no one is watching
    if (clients.size === 0) {
      return originalFetch(input, init)
    }

    const start = performance.now()
    const method = init?.method?.toUpperCase() || 'GET'

    let url: string
    if (typeof input === 'string') url = input
    else if (input instanceof URL) url = input.toString()
    else if (input instanceof Request) url = input.url
    else url = String(input)

    const headers = extractHeaders(init?.headers)
    const requestBody = parseBody(init?.body)

    // Try to read reqwatch session from current request context (Next.js)
    const sessionId = await getSessionFromContext()

    try {
      const response = await originalFetch(input, init)
      const duration = Math.round(performance.now() - start)

      // Skip binary/non-text responses for performance
      const contentType = response.headers.get('content-type') || ''
      const isReadable = contentType.includes('json') || contentType.includes('text') || contentType.includes('xml')
      let responseBody: unknown
      if (isReadable) {
        const clone = response.clone()
        responseBody = await safeParseResponse(clone)
      } else if (contentType) {
        responseBody = `[${contentType}]`
      }

      broadcast(clients, {
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
        source: 'server',
      }, sessionId)

      return response
    } catch (error) {
      const duration = Math.round(performance.now() - start)

      broadcast(clients, {
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
        source: 'server',
      }, sessionId)

      throw error
    }
  }

  // ── SSE Server ──────────────────────────────────────────────────────
  const PORT = parseInt(process.env.REQWATCH_PORT || '4819', 10)

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', '*')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const reqUrl = new URL(req.url || '/', `http://127.0.0.1:${PORT}`)

    if (reqUrl.pathname === '/events') {
      // Auth check: REQWATCH_SECRET
      if (SECRET && reqUrl.searchParams.get('token') !== SECRET) {
        res.writeHead(401)
        res.end('Unauthorized')
        return
      }

      const sessionId = reqUrl.searchParams.get('id') || ''
      if (!sessionId) {
        res.writeHead(400)
        res.end('Missing session id')
        return
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      })

      const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n')
      }, 30000)

      // Remove old connection with same sessionId (reconnect)
      const existing = clients.get(sessionId)
      if (existing) {
        clearInterval(existing.heartbeat)
        try { existing.res.end() } catch { /* already closed */ }
      }

      clients.set(sessionId, { res, sessionId, heartbeat })

      req.on('close', () => {
        const client = clients.get(sessionId)
        if (client?.res === res) {
          clearInterval(heartbeat)
          clients.delete(sessionId)
        }
      })
    } else {
      res.writeHead(404)
      res.end('Not found')
    }
  })

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[reqwatch] Server interceptor active — SSE on http://127.0.0.1:${PORT}/events`)
    if (SECRET) console.log(`[reqwatch] Secret token required for SSE access`)
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[reqwatch] Port ${PORT} in use — server logs won't be available`)
    } else {
      console.error('[reqwatch] Server error:', err)
    }
  })

  g[SERVER] = server
}

// ── Helpers ─────────────────────────────────────────────────────────────

/** Try to read __reqwatch_id cookie from Next.js request context */
async function getSessionFromContext(): Promise<string | undefined> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await (cookies as () => Promise<{ get: (name: string) => { value: string } | undefined }>)()
    return cookieStore.get('__reqwatch_id')?.value
  } catch {
    // Not in Next.js or not in request context
    return undefined
  }
}

/** Broadcast log to matching SSE client(s) */
function broadcast(clients: Map<string, SSEClient>, log: RequestLog, sessionId?: string) {
  const data = `data: ${JSON.stringify({ ...log, timestamp: log.timestamp.toISOString() })}\n\n`

  if (sessionId) {
    // Send only to the matching session
    const client = clients.get(sessionId)
    if (client) {
      try { client.res.write(data) } catch { clients.delete(sessionId) }
    }
  } else {
    // No session context (e.g. background job, cron) — send to all
    for (const [id, client] of clients) {
      try { client.res.write(data) } catch { clients.delete(id) }
    }
  }
}