# reqwatch

Drop-in React DevTools panel for monitoring HTTP requests. Zero configuration — just add the component to your app and it automatically intercepts all `fetch` calls.

## Install

```bash
npm install reqwatch
# or
bun add reqwatch
# or
yarn add reqwatch
```

## Usage

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

Toggle the panel with **Ctrl+D** (configurable).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hotkey` | `string` | `"ctrl+d"` | Keyboard shortcut to toggle panel |
| `defaultDock` | `"bottom" \| "left" \| "right"` | `"bottom"` | Default dock position |
| `maxLogs` | `number` | `100` | Maximum number of logs to keep |
| `defaultOpen` | `boolean` | `false` | Whether panel starts open |
| `storageKey` | `string` | `"__reqwatch"` | localStorage key prefix |

## Features

- **Automatic fetch interception** — overrides `window.fetch` to capture all HTTP requests
- **Dock positions** — bottom, left, right with toggle buttons
- **Resizable** — drag the panel edge to resize
- **Filter** — search by URL, method, or status code
- **cURL copy** — copy any request as a cURL command
- **JSON copy** — copy request/response bodies
- **localStorage persistence** — remembers panel state across reloads
- **Viewport adjustment** — page content shifts so it's never hidden behind the panel
- **Dark theme** — Catppuccin Mocha color scheme
- **Zero dependencies** — only requires React 18+

## How It Works

ReqWatch overrides `window.fetch` when mounted and restores the original when unmounted. It clones responses before reading them, so your application code is unaffected.

## Conditional Rendering

Only include ReqWatch in development:

```tsx
{process.env.NODE_ENV === 'development' && <ReqWatch />}
```

## License

MIT
