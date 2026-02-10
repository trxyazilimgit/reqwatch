# @trxyazilim/reqwatch

Drop-in React DevTools panel for monitoring HTTP requests — both **client-side and server-side**. Zero configuration for client requests. Add one file to also capture server-side fetch calls.

<img width="836" height="1606" alt="8d44ae46-b663-41a6-a6c2-011223007626" src="https://github.com/user-attachments/assets/a9025607-f58c-477a-8bce-83bf16b1190b" />

## Install

```bash
npm install @trxyazilim/reqwatch
# or
bun add @trxyazilim/reqwatch
# or
yarn add @trxyazilim/reqwatch
```

## Quick Start (Client Only)

```tsx
// components/reqwatch-client.tsx
'use client'

import { ReqWatch } from '@trxyazilim/reqwatch'

export function ReqWatchClient() {
  return <ReqWatch />
}
```

```tsx
// app/layout.tsx
import { ReqWatchClient } from '@/components/reqwatch-client'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ReqWatchClient />
    </>
  )
}
```

This captures all **client-side** `fetch` calls automatically.

> **Note:** ReqWatch is a client component (`'use client'`). If your layout is a Server Component (Next.js App Router), wrap it in a separate client component as shown above.

## Full Setup (Client + Server)

To also capture **server-side** fetch calls (Server Actions, API routes, SSR data fetching), add an instrumentation file:

```ts
// instrumentation.ts (project root)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('@trxyazilim/reqwatch/server')
  }
}
```

That's it. The server module patches `global.fetch` and streams logs to the client via SSE. Each log shows an **SSR** or **CLI** badge so you can tell where the request originated.

Toggle the panel with **Ctrl+D** (configurable).

## Production Setup

For production, you need a custom SSE URL since the default `127.0.0.1:4819` is only accessible locally:

```tsx
<ReqWatch serverUrl="https://api.example.com/_reqwatch/events" />
```

Restrict which origins can connect to the SSE endpoint:

```env
REQWATCH_ORIGINS=https://example.com,https://admin.example.com
```

When `REQWATCH_ORIGINS` is not set, all origins are allowed (convenient for local dev). When set, only listed origins can connect — others get a `403 Forbidden` response.

### Session Isolation

Each browser session gets a unique ID stored as a cookie (`__reqwatch_id`). Server logs are only sent to the matching session — users never see each other's requests. When no session context is available (e.g. background jobs, cron), logs are broadcast to all connected clients.

### Security

- **Origin restriction**: `REQWATCH_ORIGINS` env controls which domains can connect to the SSE endpoint. Server-side check — cannot be bypassed from the browser.
- **Cookie isolation**: Server reads the `__reqwatch_id` cookie from the request context (via `next/headers`) and only sends logs to the matching SSE client.
- **Zero overhead**: When no SSE clients are connected, the fetch patch does nothing — it calls the original `fetch` directly with no interception.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hotkey` | `string` | `"ctrl+d"` | Keyboard shortcut to toggle panel |
| `defaultDock` | `"bottom" \| "left" \| "right"` | `"bottom"` | Default dock position |
| `maxLogs` | `number` | `100` | Maximum number of logs to keep |
| `defaultOpen` | `boolean` | `false` | Whether panel starts open |
| `storageKey` | `string` | `"__reqwatch"` | localStorage key prefix |
| `serverPort` | `number` | `4819` | SSE port for server logs (local dev). Set to `0` to disable |
| `serverUrl` | `string` | — | Full SSE URL for production. Overrides `serverPort` when set |

## Features

- **Client + Server interception** — captures both `window.fetch` and `global.fetch`
- **SSE transport** — server logs stream to the browser in real-time
- **Source tabs** — filter by All, CLI (client), or SSR (server) requests
- **Source badges** — SSR and CLI labels on each request
- **Connection indicator** — green dot when server SSE is connected
- **Session isolation** — cookie-based, each user only sees their own server logs
- **Origin restriction** — server-side `REQWATCH_ORIGINS` env to whitelist domains
- **Dock positions** — bottom, left, right with toggle buttons
- **Resizable** — drag the panel edge to resize
- **Filter** — search by URL, method, or status code
- **cURL copy** — copy any request as a cURL command
- **JSON copy** — copy request/response bodies
- **localStorage persistence** — remembers panel state across reloads
- **Viewport adjustment** — page content shifts so it's never hidden behind the panel
- **Dark theme** — Catppuccin Mocha color scheme
- **Zero dependencies** — only requires React 18+
- **Zero overhead** — no performance impact when no SSE clients are connected

## How It Works

**Client side**: Overrides `window.fetch` when mounted, restores original on unmount. Clones responses before reading so your app is unaffected.

**Server side**: `@trxyazilim/reqwatch/server` patches `global.fetch` and starts an SSE server on port 4819 (configurable via `REQWATCH_PORT` env). Uses `Symbol.for()` to survive hot-reloads. The client component connects to this SSE stream and merges server logs with client logs. Binary/non-text responses are skipped for performance.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REQWATCH_PORT` | `4819` | Port for the server-side SSE server |
| `REQWATCH_ORIGINS` | — | Comma-separated list of allowed origins (e.g. `https://example.com,https://admin.example.com`). When not set, all origins are allowed |

## Conditional Rendering

Only include ReqWatch in development:

```tsx
{process.env.NODE_ENV === 'development' && <ReqWatchClient />}
```

## License

MIT
