import { motion } from 'framer-motion'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex min-h-[48px] cursor-pointer items-center justify-between gap-3">
      <span className="font-body text-sm text-white">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-[14px] w-6 shrink-0 rounded-full"
        style={{ background: checked ? '#34C759' : 'var(--color-surface-2)' }}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-[2px] block h-[10px] w-[10px] rounded-full bg-white"
          style={{ left: checked ? 12 : 2 }}
        />
      </button>
    </label>
  )
}
