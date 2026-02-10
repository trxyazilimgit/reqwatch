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
}

export interface StoredState {
  isOpen?: boolean
  dock?: DockPosition
  size?: number
}
