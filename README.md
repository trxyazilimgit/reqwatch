# reqwatch

Drop-in React DevTools panel for monitoring HTTP requests — both **client-side and server-side**. Zero configuration for client requests. Add one file to also capture server-side fetch calls.

## Install

```bash
npm install reqwatch
# or
bun add reqwatch
# or
yarn add reqwatch
```

## Quick Start (Client Only)

```tsx
import { ReqWatch } from 'reqwatch'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ReqWatch />
    </>
  )
}
```

This captures all **client-side** `fetch` calls automatically.

## Full Setup (Client + Server)

To also capture **server-side** fetch calls (Server Actions, API routes, SSR data fetching), add an instrumentation file:

```ts
// instrumentation.ts (project root)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('reqwatch/server')
  }
}
```

That's it. The server module patches `global.fetch` and streams logs to the client via SSE. Each log shows an **SSR** or **CLI** badge so you can tell where the request originated.

Toggle the panel with **Ctrl+D** (configurable).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hotkey` | `string` | `"ctrl+d"` | Keyboard shortcut to toggle panel |
| `defaultDock` | `"bottom" \| "left" \| "right"` | `"bottom"` | Default dock position |
| `maxLogs` | `number` | `100` | Maximum number of logs to keep |
| `defaultOpen` | `boolean` | `false` | Whether panel starts open |
| `storageKey` | `string` | `"__reqwatch"` | localStorage key prefix |
| `serverPort` | `number` | `4819` | SSE port for server logs. Set to `0` to disable |

## Features

- **Client + Server interception** — captures both `window.fetch` and `global.fetch`
- **SSE transport** — server logs stream to the browser in real-time
- **Source badges** — SSR (server) and CLI (client) labels on each request
- **Connection indicator** — green dot when server SSE is connected
- **Dock positions** — bottom, left, right with toggle buttons
- **Resizable** — drag the panel edge to resize
- **Filter** — search by URL, method, status code, or source
- **cURL copy** — copy any request as a cURL command
- **JSON copy** — copy request/response bodies
- **localStorage persistence** — remembers panel state across reloads
- **Viewport adjustment** — page content shifts so it's never hidden behind the panel
- **Dark theme** — Catppuccin Mocha color scheme
- **Zero dependencies** — only requires React 18+

## How It Works

**Client side**: Overrides `window.fetch` when mounted, restores original on unmount. Clones responses before reading.

**Server side**: `reqwatch/server` patches `global.fetch` and starts an SSE server on port 4819 (configurable via `REQWATCH_PORT` env). The client component connects to this SSE stream and merges server logs with client logs.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REQWATCH_PORT` | `4819` | Port for the server-side SSE server |

## Conditional Rendering

Only include ReqWatch in development:

```tsx
{process.env.NODE_ENV === 'development' && <ReqWatch />}
```

## License

MIT
