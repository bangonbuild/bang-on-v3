import { motion } from 'framer-motion'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex min-h-[48px] cursor-pointer items-center justify-between gap-3">
      <span className="font-body text-sm text-[var(--color-text-primary)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-4 w-7 shrink-0 rounded-full border ${
          checked ? 'border-transparent' : 'border-[var(--color-border-2)]'
        }`}
        style={{ background: checked ? '#34C759' : 'var(--color-surface-2)' }}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-[2px] block h-3 w-3 rounded-full bg-[var(--color-bg)]"
          animate={{ left: checked ? 14 : 2 }}
        />
      </button>
    </label>
  )
}
