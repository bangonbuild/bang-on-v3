import type { LucideIcon } from 'lucide-react'

interface IconProps {
  icon: LucideIcon
  size?: number
  className?: string
  muted?: boolean
  strokeWidth?: number
}

export function Icon({
  icon: IconComp,
  size = 22,
  className = '',
  muted = false,
  strokeWidth = 2,
}: IconProps) {
  return (
    <IconComp
      size={size}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth
      className={`shrink-0 ${
        muted ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'
      } ${className}`}
      style={{ shapeRendering: 'geometricPrecision' }}
    />
  )
}
