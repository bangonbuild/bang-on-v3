import { ChevronRight } from 'lucide-react'
import { ScreenTitle } from '../components/ScreenTitle'
import type { MoneyRecord } from '../types'
import { isInvoiceOverdue } from '../utils/moneyHelpers'
import { NAV_PB } from '../utils/layout'

interface MoneyScreenProps {
  stats: { outstanding: number; overdue: number; paidThisMonth: number }
  invoices: MoneyRecord[]
  quotes: MoneyRecord[]
  onOpenRecord: (record: MoneyRecord) => void
}

function formatMoney(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatDue(date?: string) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const invoiceBadge: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.5)' },
  sent: { bg: 'rgba(255,149,0,0.15)', text: '#FF9500' },
  paid: { bg: 'rgba(52,199,89,0.15)', text: '#34C759' },
  overdue: { bg: 'rgba(255,59,48,0.15)', text: '#FF3B30' },
}

const quoteBadge: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.5)' },
  sent: { bg: 'rgba(255,149,0,0.15)', text: '#FF9500' },
}

function StatusPill({ status, type }: { status: string; type: 'quote' | 'invoice' }) {
  const styles = type === 'invoice' ? invoiceBadge[status] ?? invoiceBadge.draft : quoteBadge[status] ?? quoteBadge.draft
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span
      className="rounded-full px-2 py-0.5 font-body text-[11px] font-medium capitalize"
      style={{ background: styles.bg, color: styles.text }}
    >
      {label}
    </span>
  )
}

const DASHBOARD_COLUMNS = [
  { key: 'outstanding' as const, label: 'OUTSTANDING', color: 'var(--color-text-primary)' },
  { key: 'overdue' as const, label: 'OVERDUE', color: '#FF3B30' },
  { key: 'paid' as const, label: 'PAID / MONTH', color: '#34C759' },
]

function MoneyDashboard({ stats }: { stats: MoneyScreenProps['stats'] }) {
  const values = {
    outstanding: stats.outstanding,
    overdue: stats.overdue,
    paid: stats.paidThisMonth,
  }

  return (
    <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5">
      <div className="flex items-stretch">
        {DASHBOARD_COLUMNS.map((col, index) => (
          <div
            key={col.key}
            className={`flex min-w-0 flex-1 flex-col ${
              index > 0 ? 'border-l border-[var(--color-border-2)] pl-3' : ''
            } ${index < DASHBOARD_COLUMNS.length - 1 ? 'pr-3' : ''}`}
          >
            <p className="font-display text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
              {col.label}
            </p>
            <p
              className="font-display mt-1 truncate text-[22px] font-bold leading-none"
              style={{ color: col.color }}
            >
              {formatMoney(values[col.key])}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MoneyScreen({ stats, invoices, quotes, onOpenRecord }: MoneyScreenProps) {
  return (
    <div className={`px-4 pt-6 ${NAV_PB}`}>
      <ScreenTitle>Money</ScreenTitle>

      <MoneyDashboard stats={stats} />

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        Invoices
      </p>
      {invoices.length === 0 ? (
        <p className="mt-4 text-center font-body text-[13px] text-[var(--color-text-tertiary)]">
          No invoices yet. Generate one from a job or the Toolbox.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {invoices.map((inv) => (
            <MoneyRow key={inv.id} record={inv} type="invoice" onOpen={() => onOpenRecord(inv)} />
          ))}
        </div>
      )}

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        Quotes
      </p>
      {quotes.length === 0 ? (
        <p className="mt-4 text-center font-body text-[13px] text-[var(--color-text-tertiary)]">
          No quotes yet. Generate one from a job or the Toolbox.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {quotes.map((q) => (
            <MoneyRow key={q.id} record={q} type="quote" onOpen={() => onOpenRecord(q)} />
          ))}
        </div>
      )}
    </div>
  )
}

function MoneyRow({
  record,
  type,
  onOpen,
}: {
  record: MoneyRecord
  type: 'quote' | 'invoice'
  onOpen: () => void
}) {
  const overdue = type === 'invoice' && isInvoiceOverdue(record)
  const title = `${record.invoiceNumber ?? (type === 'quote' ? 'Quote' : 'Invoice')} · ${record.client ?? 'Client'}`

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-[15px] font-medium text-[var(--color-text-primary)]">{title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="font-display text-[15px] text-[var(--color-text-primary)]">
            ${record.total.toLocaleString()}
          </p>
          <StatusPill status={record.status} type={type} />
        </div>
        {type === 'invoice' && record.dueDate && (
          <p
            className="mt-1 font-body text-[12px]"
            style={{ color: overdue ? '#FF3B30' : undefined }}
          >
            Due {formatDue(record.dueDate)}
          </p>
        )}
      </div>
      <ChevronRight size={18} className="shrink-0 text-[var(--color-text-tertiary)]" />
    </button>
  )
}
