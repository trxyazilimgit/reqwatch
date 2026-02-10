'use client'

import React, { useEffect, useState, useCallback } from 'react'
import type { DockPosition, RequestLog, ReqWatchProps } from './types'
import { useFetchInterceptor } from './use-fetch-interceptor'
import { useServerLogs } from './use-server-logs'
import { readStorage, writeStorage, toCurl, copyText } from './utils'
import {
  IconX, IconTrash, IconChevronDown, IconChevronRight,
  IconCopy, IconCheck, IconTerminal,
  IconPanelBottom, IconPanelLeft, IconPanelRight,
} from './icons'
import {
  DEFAULT_SIZE, getPanelStyle, getHandleStyle,
  headerWrapperStyle, headerTopStyle, headerBottomStyle,
  titleStyle, countStyle, filterInputStyle,
  dockGroupStyle, dockBtnStyle, iconBtnStyle,
  logListStyle, emptyStyle, logItemStyle, logBtnStyle,
  expandedStyle, endpointRowStyle, curlBtnStyle,
  errorBoxStyle, bodyLabelStyle, preStyle,
  statusColor, methodBadgeStyle, urlTextStyle,
  durationStyle, timeStyle, chevronStyle, copyBtnSmallStyle,
  sourceBadgeStyle, serverDotStyle,
  tabGroupStyle, tabBtnStyle,
  colors,
} from './styles'

type SourceTab = 'all' | 'client' | 'server'

const SPACER_ID = '__reqwatch-spacer-style'

function parseHotkey(hotkey: string) {
  const parts = hotkey.toLowerCase().split('+').map(s => s.trim())
  return {
    ctrl: parts.includes('ctrl'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
    meta: parts.includes('meta') || parts.includes('cmd'),
    key: parts.filter(p => !['ctrl', 'alt', 'shift', 'meta', 'cmd'].includes(p))[0] || 'd',
  }
}

export function ReqWatch({
  hotkey = 'ctrl+d',
  defaultDock = 'bottom',
  maxLogs = 100,
  defaultOpen = false,
  storageKey = '__reqwatch',
  serverPort = 4819,
  serverUrl,
  serverToken,
}: ReqWatchProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [dock, setDock] = useState<DockPosition>(defaultDock)
  const [size, setSize] = useState(DEFAULT_SIZE[defaultDock])
  const [mounted, setMounted] = useState(false)
  const [logs, setLogs] = useState<RequestLog[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [handleHovered, setHandleHovered] = useState(false)
  const [activeTab, setActiveTab] = useState<SourceTab>('all')

  // Log handler shared by both interceptors
  const handleLog = useCallback((log: RequestLog) => {
    setLogs(prev => [log, ...prev].slice(0, maxLogs))
  }, [maxLogs])

  // Client-side fetch interceptor
  useFetchInterceptor(maxLogs, handleLog)

  // Server-side SSE connection
  const serverConnected = useServerLogs(serverPort, handleLog, serverUrl, serverToken)

  // Restore state from localStorage
  useEffect(() => {
    const saved = readStorage(storageKey)
    if (saved?.isOpen !== undefined) setIsOpen(saved.isOpen)
    if (saved?.dock) setDock(saved.dock)
    if (saved?.size) setSize(saved.size)
    setMounted(true)
  }, [storageKey])

  // Persist state
  useEffect(() => {
    if (mounted) writeStorage(storageKey, { isOpen, dock, size })
  }, [isOpen, dock, size, mounted, storageKey])

  // Dock change
  const changeDock = (d: DockPosition) => {
    setDock(d)
    setSize(DEFAULT_SIZE[d])
  }

  // Resize drag
  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      if (dock === 'bottom') setSize(Math.max(150, window.innerHeight - e.clientY))
      else if (dock === 'left') setSize(Math.max(250, e.clientX))
      else setSize(Math.max(250, window.innerWidth - e.clientX))
    }
    const onUp = () => setIsDragging(false)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.cursor = dock === 'bottom' ? 'row-resize' : 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, dock])

  // Viewport adjustment
  useEffect(() => {
    let style = document.getElementById(SPACER_ID) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement('style')
      style.id = SPACER_ID
      document.head.appendChild(style)
    }
    if (!isOpen) {
      style.textContent = ''
      return
    }
    const remaining = window.innerHeight - size
    const css = dock === 'bottom' ? `
      html {
        height: ${remaining}px !important;
        overflow-y: auto !important;
      }
      .min-h-screen, .min-h-svh {
        min-height: calc(100vh - ${size}px) !important;
      }
      header.fixed, nav.fixed, .fixed[class*="top-0"] {
        max-height: ${remaining}px !important;
      }
    ` : dock === 'left' ? `
      html { margin-left: ${size}px !important; }
      header.fixed, nav.fixed, .fixed[class*="top-0"] {
        left: ${size}px !important;
      }
    ` : `
      html { margin-right: ${size}px !important; }
      header.fixed, nav.fixed, .fixed[class*="top-0"] {
        right: ${size}px !important;
      }
    `
    style.textContent = css
    return () => { if (style) style.textContent = '' }
  }, [isOpen, dock, size])

  // Keyboard shortcut
  useEffect(() => {
    const parsed = parseHotkey(hotkey)
    const handler = (e: KeyboardEvent) => {
      if (
        e.ctrlKey === parsed.ctrl &&
        e.altKey === parsed.alt &&
        e.shiftKey === parsed.shift &&
        e.metaKey === parsed.meta &&
        e.key.toLowerCase() === parsed.key
      ) {
        e.preventDefault()
        setIsOpen(p => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hotkey])

  // Copy helpers
  const handleCopy = (text: string, id: string) => {
    copyText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleCopyJson = (data: unknown, id: string) => {
    handleCopy(JSON.stringify(data, null, 2), id)
  }

  if (!mounted || !isOpen) return null

  const tabFiltered = activeTab === 'all' ? logs : logs.filter(l => l.source === activeTab)
  const filtered = filter
    ? tabFiltered.filter(l =>
        l.url.toLowerCase().includes(filter.toLowerCase()) ||
        l.method.toLowerCase().includes(filter.toLowerCase()) ||
        String(l.status).includes(filter)
      )
    : tabFiltered

  const clientCount = logs.filter(l => l.source === 'client').length
  const serverCount = logs.filter(l => l.source === 'server').length

  return (
    <div style={getPanelStyle(dock, size)}>
      {/* Resize handle */}
      <div
        style={{
          ...getHandleStyle(dock),
          backgroundColor: handleHovered || isDragging ? 'rgba(137,180,250,0.4)' : 'transparent',
        }}
        onMouseDown={() => setIsDragging(true)}
        onMouseEnter={() => setHandleHovered(true)}
        onMouseLeave={() => setHandleHovered(false)}
      />

      {/* Header */}
      <div style={headerWrapperStyle}>
        {/* Top row: title, server dot, dock, clear, close */}
        <div style={headerTopStyle}>
          <span style={titleStyle}>ReqWatch</span>
          <span style={countStyle}>({filtered.length})</span>

          {serverPort !== 0 && (
            <span
              style={serverDotStyle(serverConnected)}
              title={serverConnected ? 'Server connected' : 'Server disconnected'}
            />
          )}

          <div style={{ flex: 1 }} />

          <div style={dockGroupStyle}>
            <button
              onClick={() => changeDock('left')}
              style={dockBtnStyle(dock === 'left')}
              title="Dock left"
            >
              <IconPanelLeft />
            </button>
            <button
              onClick={() => changeDock('bottom')}
              style={dockBtnStyle(dock === 'bottom')}
              title="Dock bottom"
            >
              <IconPanelBottom />
            </button>
            <button
              onClick={() => changeDock('right')}
              style={dockBtnStyle(dock === 'right')}
              title="Dock right"
            >
              <IconPanelRight />
            </button>
          </div>

          <button
            onClick={() => setLogs([])}
            style={iconBtnStyle}
            title="Clear"
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.surface0 }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <IconTrash />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={iconBtnStyle}
            title={`Close (${hotkey})`}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.surface0 }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <IconX />
          </button>
        </div>

        {/* Bottom row: source tabs + filter */}
        <div style={headerBottomStyle}>
          <div style={tabGroupStyle}>
            <button onClick={() => setActiveTab('all')} style={tabBtnStyle(activeTab === 'all')}>
              All ({logs.length})
            </button>
            <button onClick={() => setActiveTab('client')} style={tabBtnStyle(activeTab === 'client')}>
              CLI ({clientCount})
            </button>
            <button onClick={() => setActiveTab('server')} style={tabBtnStyle(activeTab === 'server')}>
              SSR ({serverCount})
            </button>
          </div>

          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter..."
            style={filterInputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = colors.blue }}
            onBlur={e => { e.currentTarget.style.borderColor = colors.surface1 }}
          />
        </div>
      </div>

      {/* Log list */}
      <div style={logListStyle}>
        {filtered.length === 0 && (
          <div style={emptyStyle}>
            {logs.length === 0 ? 'No requests yet' : 'No matching requests'}
          </div>
        )}
        {filtered.map(log => {
          const isExpanded = expandedId === log.id
          return (
            <div key={log.id} style={logItemStyle}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                style={logBtnStyle}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(49,50,68,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={chevronStyle}>
                  {isExpanded ? <IconChevronDown /> : <IconChevronRight />}
                </span>
                <span style={sourceBadgeStyle(log.source)}>
                  {log.source === 'server' ? 'SSR' : 'CLI'}
                </span>
                <span style={methodBadgeStyle(log.method)}>{log.method}</span>
                <span style={{ fontWeight: 700, flexShrink: 0, fontVariantNumeric: 'tabular-nums', color: statusColor(log.status, log.success) }}>
                  {log.status || 'ERR'}
                </span>
                <span style={urlTextStyle}>{log.url}</span>
                <span style={durationStyle}>{log.duration}ms</span>
                <span style={timeStyle}>
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </button>

              {isExpanded && (
                <div style={expandedStyle}>
                  {/* Endpoint + cURL */}
                  <div style={endpointRowStyle}>
                    <span style={{ color: colors.subtext0 }}>Endpoint: </span>
                    <span style={{ color: colors.blue }}>{log.method} {log.url}</span>
                    <button
                      onClick={() => handleCopy(toCurl(log), `curl-${log.id}`)}
                      style={curlBtnStyle}
                      title="Copy as cURL"
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.surface0; e.currentTarget.style.color = colors.text }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.subtext0 }}
                    >
                      {copiedId === `curl-${log.id}`
                        ? <><IconCheck style={{ color: colors.green }} /> Copied</>
                        : <><IconTerminal /> cURL</>
                      }
                    </button>
                  </div>

                  {/* Error */}
                  {log.error && (
                    <div style={errorBoxStyle}>
                      <span style={{ fontWeight: 700 }}>Error: </span>{log.error}
                    </div>
                  )}

                  {/* Request body */}
                  {log.requestBody != null && (
                    <div>
                      <div style={bodyLabelStyle(colors.peach)}>
                        <span>Request Body</span>
                        <button
                          onClick={() => handleCopyJson(log.requestBody, `req-${log.id}`)}
                          style={copyBtnSmallStyle}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.surface0 }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          {copiedId === `req-${log.id}`
                            ? <IconCheck style={{ color: colors.green }} />
                            : <IconCopy />
                          }
                        </button>
                      </div>
                      <pre style={preStyle}>
                        {typeof log.requestBody === 'string'
                          ? log.requestBody
                          : JSON.stringify(log.requestBody, null, 2)
                        }
                      </pre>
                    </div>
                  )}

                  {/* Response body */}
                  {log.responseBody != null && (
                    <div>
                      <div style={bodyLabelStyle(colors.blue)}>
                        <span>Response Body</span>
                        <button
                          onClick={() => handleCopyJson(log.responseBody, `res-${log.id}`)}
                          style={copyBtnSmallStyle}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.surface0 }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          {copiedId === `res-${log.id}`
                            ? <IconCheck style={{ color: colors.green }} />
                            : <IconCopy />
                          }
                        </button>
                      </div>
                      <pre style={preStyle}>
                        {typeof log.responseBody === 'string'
                          ? log.responseBody
                          : JSON.stringify(log.responseBody, null, 2)
                        }
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
