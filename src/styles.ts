import type { CSSProperties } from 'react'
import type { DockPosition } from './types'

// Catppuccin Mocha palette
const c = {
  base: '#1e1e2e',
  mantle: '#181825',
  crust: '#11111b',
  surface0: '#313244',
  surface1: '#45475a',
  overlay0: '#6c7086',
  subtext0: '#a6adc8',
  text: '#cdd6f4',
  red: '#f38ba8',
  green: '#a6e3a1',
  yellow: '#f9e2af',
  blue: '#89b4fa',
  peach: '#fab387',
  mauve: '#cba6f7',
} as const

export const DEFAULT_SIZE: Record<DockPosition, number> = {
  bottom: 350,
  left: 420,
  right: 420,
}

export function getPanelStyle(dock: DockPosition, size: number): CSSProperties {
  const base: CSSProperties = {
    position: 'fixed',
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: c.base,
    color: c.text,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    fontSize: '12px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
  }
  if (dock === 'bottom') {
    return { ...base, bottom: 0, left: 0, right: 0, height: size, borderTop: `2px solid ${c.surface1}` }
  }
  if (dock === 'left') {
    return { ...base, top: 0, left: 0, bottom: 0, width: size, borderRight: `2px solid ${c.surface1}` }
  }
  return { ...base, top: 0, right: 0, bottom: 0, width: size, borderLeft: `2px solid ${c.surface1}` }
}

export function getHandleStyle(dock: DockPosition): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    transition: 'background-color 0.15s',
  }
  if (dock === 'bottom') {
    return { ...base, top: 0, left: 0, right: 0, height: 6, cursor: 'row-resize' }
  }
  if (dock === 'left') {
    return { ...base, top: 0, right: 0, bottom: 0, width: 6, cursor: 'col-resize' }
  }
  return { ...base, top: 0, left: 0, bottom: 0, width: 6, cursor: 'ew-resize' }
}

export const headerWrapperStyle: CSSProperties = {
  backgroundColor: c.mantle,
  borderBottom: `1px solid ${c.surface1}`,
  flexShrink: 0,
}

export const headerTopStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  gap: 8,
}

export const headerBottomStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px 6px',
  gap: 8,
}

export const titleStyle: CSSProperties = {
  color: c.red,
  fontWeight: 700,
  fontSize: '13px',
}

export const countStyle: CSSProperties = {
  color: c.overlay0,
}

export const filterInputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  backgroundColor: c.surface0,
  border: `1px solid ${c.surface1}`,
  borderRadius: 4,
  padding: '4px 8px',
  fontSize: '12px',
  color: c.text,
  outline: 'none',
  fontFamily: 'inherit',
}

export const dockGroupStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${c.surface1}`,
  borderRadius: 4,
  overflow: 'hidden',
  flexShrink: 0,
}

export function dockBtnStyle(active: boolean): CSSProperties {
  return {
    padding: 5,
    background: active ? c.surface1 : 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: c.text,
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.15s',
  }
}

export const iconBtnStyle: CSSProperties = {
  padding: 5,
  background: 'transparent',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  color: c.overlay0,
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  transition: 'background-color 0.15s',
}

export const logListStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
}

export const emptyStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: c.overlay0,
}

export const logItemStyle: CSSProperties = {
  borderBottom: `1px solid ${c.surface0}`,
}

export const logBtnStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: c.text,
  textAlign: 'left' as const,
  fontFamily: 'inherit',
  fontSize: '12px',
  transition: 'background-color 0.15s',
}

export const expandedStyle: CSSProperties = {
  padding: '0 16px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  backgroundColor: c.crust,
}

export const endpointRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: c.overlay0,
  wordBreak: 'break-all' as const,
}

export const curlBtnStyle: CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 6px',
  background: 'transparent',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '10px',
  color: c.subtext0,
  fontFamily: 'inherit',
  transition: 'background-color 0.15s, color 0.15s',
}

export const errorBoxStyle: CSSProperties = {
  color: c.red,
  backgroundColor: 'rgba(243,139,168,0.1)',
  borderRadius: 4,
  padding: '4px 8px',
}

export const bodyLabelStyle = (color: string): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 4,
  fontWeight: 700,
  color,
})

export const preStyle: CSSProperties = {
  backgroundColor: c.base,
  borderRadius: 4,
  padding: 8,
  overflowX: 'auto',
  maxHeight: 160,
  fontSize: '11px',
  lineHeight: 1.6,
  margin: 0,
  fontFamily: 'inherit',
}

export function statusColor(status: number, success: boolean): string {
  if (!success) return c.red
  if (status === 0) return c.yellow
  if (status < 300) return c.green
  if (status < 400) return c.blue
  return c.red
}

export function methodBadgeStyle(method: string): CSSProperties {
  const colors: Record<string, { bg: string; fg: string }> = {
    GET:    { bg: 'rgba(137,180,250,0.2)', fg: c.blue },
    POST:   { bg: 'rgba(166,227,161,0.2)', fg: c.green },
    PUT:    { bg: 'rgba(249,226,175,0.2)', fg: c.yellow },
    PATCH:  { bg: 'rgba(250,179,135,0.2)', fg: c.peach },
    DELETE: { bg: 'rgba(243,139,168,0.2)', fg: c.red },
  }
  const color = colors[method] || { bg: 'rgba(108,112,134,0.2)', fg: c.overlay0 }
  return {
    padding: '1px 4px',
    borderRadius: 3,
    fontSize: '10px',
    fontWeight: 700,
    flexShrink: 0,
    backgroundColor: color.bg,
    color: color.fg,
  }
}

export const urlTextStyle: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
  color: c.overlay0,
}

export const durationStyle: CSSProperties = {
  marginLeft: 'auto',
  flexShrink: 0,
  color: c.overlay0,
  fontVariantNumeric: 'tabular-nums',
}

export const timeStyle: CSSProperties = {
  flexShrink: 0,
  color: c.overlay0,
  fontVariantNumeric: 'tabular-nums',
}

export const chevronStyle: CSSProperties = {
  flexShrink: 0,
  color: c.overlay0,
}

export const copyBtnSmallStyle: CSSProperties = {
  padding: 2,
  background: 'transparent',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  color: c.overlay0,
  display: 'flex',
  alignItems: 'center',
}

export function sourceBadgeStyle(source: 'client' | 'server'): CSSProperties {
  const isServer = source === 'server'
  return {
    padding: '1px 4px',
    borderRadius: 3,
    fontSize: '9px',
    fontWeight: 700,
    flexShrink: 0,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    backgroundColor: isServer ? 'rgba(203,166,247,0.2)' : 'rgba(166,227,161,0.15)',
    color: isServer ? c.mauve : c.green,
  }
}

export const serverDotStyle = (connected: boolean): CSSProperties => ({
  width: 7,
  height: 7,
  borderRadius: '50%',
  backgroundColor: connected ? c.green : c.overlay0,
  flexShrink: 0,
  transition: 'background-color 0.3s',
})

export const tabGroupStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${c.surface1}`,
  borderRadius: 4,
  overflow: 'hidden',
  flexShrink: 0,
}

export function tabBtnStyle(active: boolean): CSSProperties {
  return {
    padding: '3px 8px',
    background: active ? c.surface1 : 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: active ? c.text : c.overlay0,
    fontSize: '10px',
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'background-color 0.15s, color 0.15s',
  }
}

export const colors = c
