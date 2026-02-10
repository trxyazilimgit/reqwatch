import { createServer, type ServerResponse } from 'node:http'
import type { RequestLog } from './types'
import { extractHeaders, parseBody, safeParseResponse, generateId } from './utils'

// Symbols to survive hot-reloads (same symbol registry across reloads)
const PATCHED = Symbol.for('reqwatch.patched')
const CLIENTS = Symbol.for('reqwatch.clients')
const SERVER = Symbol.for('reqwatch.server')

const g = globalThis as Record<symbol, unknown>

if (!g[PATCHED]) {
  g[PATCHED] = true

  const clients = new Set<ServerResponse>()
  g[CLIENTS] = clients

  // ── Patch global.fetch ──────────────────────────────────────────────
  const originalFetch = globalThis.fetch

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const start = performance.now()
    const method = init?.method?.toUpperCase() || 'GET'

    let url: string
    if (typeof input === 'string') url = input
    else if (input instanceof URL) url = input.toString()
    else if (input instanceof Request) url = input.url
    else url = String(input)

    const headers = extractHeaders(init?.headers)
    const requestBody = parseBody(init?.body)

    try {
      const response = await originalFetch(input, init)
      const duration = Math.round(performance.now() - start)
      const clone = response.clone()
      const responseBody = await safeParseResponse(clone)

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
      })

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
      })

      throw error
    }
  }

  // ── SSE Server ──────────────────────────────────────────────────────
  const PORT = parseInt(process.env.REQWATCH_PORT || '4819', 10)

  const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', '*')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    if (req.url === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      })

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n')
      }, 30000)

      clients.add(res)
      req.on('close', () => {
        clients.delete(res)
        clearInterval(heartbeat)
      })
    } else {
      res.writeHead(404)
      res.end('Not found')
    }
  })

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[reqwatch] Server interceptor active — SSE on http://127.0.0.1:${PORT}/events`)
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
function broadcast(clients: Set<ServerResponse>, log: RequestLog) {
  const data = `data: ${JSON.stringify({ ...log, timestamp: log.timestamp.toISOString() })}\n\n`
  for (const client of clients) {
    try {
      client.write(data)
    } catch {
      clients.delete(client)
    }
  }
}
