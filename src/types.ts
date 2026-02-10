export type DockPosition = 'bottom' | 'left' | 'right'

export interface RequestLog {
  id: string
  method: string
  url: string
  status: number
  duration: number
  headers: Record<string, string>
  requestBody?: unknown
  responseBody?: unknown
  error?: string
  success: boolean
  timestamp: Date
  source: 'client' | 'server'
}

export interface ReqWatchProps {
  /** Keyboard shortcut to toggle panel. Default: "ctrl+d" */
  hotkey?: string
  /** Default dock position. Default: "bottom" */
  defaultDock?: DockPosition
  /** Maximum number of logs to keep. Default: 100 */
  maxLogs?: number
  /** Whether the panel starts open. Default: false (reads from localStorage) */
  defaultOpen?: boolean
  /** localStorage key prefix. Default: "__reqwatch" */
  storageKey?: string
  /** Port for server-side log SSE connection (local dev). Default: 4819. Set to 0 to disable. */
  serverPort?: number
  /** Full SSE URL for production (e.g. "https://api.example.com/_reqwatch/events"). Overrides serverPort when set. */
  serverUrl?: string
}

export interface StoredState {
  isOpen?: boolean
  dock?: DockPosition
  size?: number
}
