import { FileText, ImageIcon, ReceiptText, Ruler } from 'lucide-react'
import { FeaturePlaceholder } from '../components/FeaturePlaceholder'
import { ToolCard } from '../components/ToolCard'
import { ClipboardList, AlertTriangle } from 'lucide-react'

interface ToolboxScreenProps {
  onQuote: () => void
  onInvoice: () => void
  onMeasure: () => void
  onPhotoReport: () => void
  onComingSoon: () => void
  onSuggest: () => void
}

export function ToolboxScreen({
  onQuote,
  onInvoice,
  onMeasure,
  onPhotoReport,
  onComingSoon,
  onSuggest,
}: ToolboxScreenProps) {
  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl font-bold text-white">Toolbox</h1>

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        Tools
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <ToolCard title="Quote" subtitle="Fast quote, no job needed" icon={ReceiptText} onClick={onQuote} />
        <ToolCard title="Invoice" subtitle="Bill your client" icon={FileText} onClick={onInvoice} />
        <ToolCard title="Measure & calculate" subtitle="Numbers sorted, fast" icon={Ruler} onClick={onMeasure} />
        <ToolCard title="Photo report" subtitle="Snap, write, share" icon={ImageIcon} onClick={onPhotoReport} />
      </div>

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        Upcoming tools
      </p>
      <div className="mt-2 flex flex-col gap-2">
        <FeaturePlaceholder
          icon={ClipboardList}
          title="SWMS generator"
          description="Draft safe work method statements"
          onTap={onComingSoon}
        />
        <FeaturePlaceholder
          icon={AlertTriangle}
          title="Defect report"
          description="Document and report site defects"
          onTap={onComingSoon}
        />
      </div>

      <div className="mt-6">
        <p className="font-body text-[15px] text-white">Got a tool idea?</p>
        <p className="mt-1 font-body text-[13px] text-[var(--color-text-secondary)]">
          We&apos;re building Bang On with tradies. Suggest a tool and we&apos;ll add it to the backlog.
        </p>
        <button
          type="button"
          onClick={onSuggest}
          className="mt-4 min-h-[48px] w-full rounded-xl bg-white font-body font-medium text-black"
        >
          Suggest a tool →
        </button>
      </div>
    </div>
  )
}
