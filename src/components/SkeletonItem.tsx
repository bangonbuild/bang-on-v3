interface SkeletonItemProps {
  className?: string
  height?: number
}

export function SkeletonItem({ className = '', height = 48 }: SkeletonItemProps) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${className}`}
      style={{ height, minHeight: height }}
      aria-hidden
    />
  )
}
