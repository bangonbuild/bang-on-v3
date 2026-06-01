import type { LucideIcon } from 'lucide-react'

interface ToolCardProps {
  title: string
  subtitle: string
  icon: LucideIcon
  onClick: () => void
}

export function ToolCard({ title, subtitle, icon: Icon, onClick }: ToolCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[120px] flex-col rounded-xl bg-white p-5 text-left active:bg-[#F0F0F0]"
    >
      <Icon size={24} className="text-black" />
      <p className="font-display mt-3 text-lg font-bold text-black">{title}</p>
      <p className="mt-1 font-body text-[13px] text-black/60">{subtitle}</p>
    </button>
  )
}
