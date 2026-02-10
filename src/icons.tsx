import React from 'react'

const svgProps: React.SVGProps<SVGSVGElement> = {
  width: 14,
  height: 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

export function IconChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} width={12} height={12} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function IconChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} width={12} height={12} {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function IconCopy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} width={12} height={12} {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

export function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} width={12} height={12} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function IconTerminal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} width={12} height={12} {...props}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  )
}

export function IconPanelBottom(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 15h18" />
    </svg>
  )
}

export function IconPanelLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </svg>
  )
}

export function IconPanelRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps} {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M15 3v18" />
    </svg>
  )
}
