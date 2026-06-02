interface ScreenTitleProps {
  children: string
}

export function ScreenTitle({ children }: ScreenTitleProps) {
  return (
    <h1 className="font-display text-[28px] font-bold text-[var(--color-text-primary)]">
      {children}
    </h1>
  )
}
