import { useDesktop } from '../hooks/useDesktop'

interface ScreenTitleProps {
  children: string
}

export function ScreenTitle({ children }: ScreenTitleProps) {
  const isDesktop = useDesktop()
  return (
    <h1
      className={`font-display font-bold text-[var(--color-text-primary)] ${
        isDesktop ? 'text-[32px]' : 'text-[28px]'
      }`}
    >
      {children}
    </h1>
  )
}
