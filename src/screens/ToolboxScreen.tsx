import { BookOpen, ChevronRight, ClipboardList, FileText, ImageIcon, ReceiptText, Ruler } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'
import { FeaturePlaceholder } from '../components/FeaturePlaceholder'
import { ScreenTitle } from '../components/ScreenTitle'
import { ToolCard } from '../components/ToolCard'
import { useDesktop } from '../hooks/useDesktop'
import type { SavedPhotoReport } from '../types'
import { DESKTOP_PB, NAV_PB } from '../utils/layout'
import { formatDate } from '../utils/storage'

interface ToolboxScreenProps {
  photoReports: SavedPhotoReport[]
  onQuote: () => void
  onInvoice: () => void
  onMeasure: () => void
  onPhotoReport: () => void
  onOpenPhotoReport: (id: string) => void
  onComingSoon: () => void
  onSuggest: () => void
}

export function ToolboxScreen({
  photoReports,
  onQuote,
  onInvoice,
  onMeasure,
  onPhotoReport,
  onOpenPhotoReport,
  onComingSoon,
  onSuggest,
}: ToolboxScreenProps) {
  const isDesktop = useDesktop()
  const padClass = isDesktop ? DESKTOP_PB : NAV_PB
  const containerClass = isDesktop ? `overflow-y-auto px-10 pt-8 ${padClass}` : `overflow-y-auto px-4 pt-6 ${padClass}`

  const toolsSection = (
    <>
      <p className="section-label section-gap">Tools</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <ToolCard title="Measure & calculate" subtitle="Numbers sorted, fast" icon={Ruler} onClick={onMeasure} />
        <ToolCard title="Photo report" subtitle="Snap, write, share" icon={ImageIcon} onClick={onPhotoReport} />
      </div>
    </>
  )

  const paperworkSection = (
    <>
      <p className="section-label section-gap">Paperwork</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <ToolCard title="Quote" subtitle="Fast quote, no job needed" icon={ReceiptText} onClick={onQuote} />
        <ToolCard title="Invoice" subtitle="Bill your client" icon={FileText} onClick={onInvoice} />
      </div>
    </>
  )

  const comingSoonSection = (
    <>
      <p className={`section-label ${isDesktop ? 'mt-0' : 'section-gap'}`}>Coming soon</p>
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
        <FeaturePlaceholder
          icon={BookOpen}
          title="Building codes"
          description="State-by-state building code library"
          onTap={onComingSoon}
        />
      </div>
    </>
  )

  const suggestSection = (
    <div className="section-gap">
      <p className="font-body text-[15px] text-[var(--color-text-primary)]">Got a tool idea?</p>
      <p className="mt-1 font-body text-[13px] text-[var(--color-text-secondary)]">
        We&apos;re building datum.ai with tradies. Suggest a tool and we&apos;ll add it to the backlog.
      </p>
      <button
        type="button"
        onClick={onSuggest}
        className="mt-4 min-h-[48px] w-full rounded-xl btn-primary font-body font-medium"
      >
        Suggest a tool →
      </button>
    </div>
  )

  const reportsSection = (
    <>
      <p className="section-label section-gap">Recent photo reports</p>
      {photoReports.length === 0 ? (
        <p className="mt-4 text-center font-body text-[13px] text-[var(--color-text-tertiary)]">
          No photo reports yet.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {photoReports.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => onOpenPhotoReport(report.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-[13px] text-[var(--color-text-secondary)]">
                  {formatDate(report.createdAt)}
                </p>
                <p className="font-body text-[15px] text-[var(--color-text-primary)]">
                  {report.jobName ?? 'Standalone'}
                </p>
                <p className="font-body text-[12px] text-[var(--color-text-tertiary)]">
                  {report.photos.length} photo{report.photos.length === 1 ? '' : 's'}
                </p>
              </div>
              <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-[var(--color-text-tertiary)]" />
            </button>
          ))}
        </div>
      )}
    </>
  )

  if (isDesktop) {
    return (
      <div className={containerClass}>
        <ScreenTitle>Toolbox</ScreenTitle>
        <div className="mx-auto mt-6 flex max-w-[960px] gap-10">
          <div className="w-[360px] shrink-0">
            {toolsSection}
            {paperworkSection}
          </div>
          <div className="min-w-0 flex-1">
            {comingSoonSection}
            {reportsSection}
            {suggestSection}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <ScreenTitle>Toolbox</ScreenTitle>
      {toolsSection}
      {paperworkSection}
      {comingSoonSection}
      {suggestSection}
      {reportsSection}
    </div>
  )
}
