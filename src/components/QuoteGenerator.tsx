import { Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { Icon } from './Icon'
import { QuoteOverlay } from './QuoteOverlay'
import { Toggle } from './Toggle'
import { generateDocument, mapFetchError } from '../services/aiService'
import type { GeneratedDocument, Job, PaymentDetails, Profile, QuoteLineItem } from '../types'
import { parseQuoteFromAi } from '../utils/documentParser'
import { buildJobContext } from '../utils/jobHelpers'
import { formatDate } from '../utils/storage'

type InputMode = 'describe' | 'build'

interface QuoteGeneratorProps {
  type: 'quote' | 'invoice'
  job?: Job
  profile: Profile
  payment: PaymentDetails
  onClose: () => void
  onSaveToJob?: (doc: GeneratedDocument) => void
  showToast: (msg: string) => void
}

const emptyLine = (): QuoteLineItem => ({
  description: '',
  quantity: 1,
  unitPrice: 0,
  total: 0,
})

export function QuoteGenerator({
  type,
  job,
  profile,
  payment,
  onClose,
  onSaveToJob,
  showToast,
}: QuoteGeneratorProps) {
  const [inputMode, setInputMode] = useState<InputMode>('describe')
  const [scope, setScope] = useState('')
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([emptyLine()])
  const [includeGst, setIncludeGst] = useState(true)
  const [dueDate, setDueDate] = useState('')
  const [invoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`)
  const [loading, setLoading] = useState(false)
  const [doc, setDoc] = useState<GeneratedDocument | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateLine = (index: number, field: keyof QuoteLineItem, value: string | number) => {
    setLineItems((items) =>
      items.map((item, i) => {
        if (i !== index) return item
        const next = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          next.total = Number(next.quantity) * Number(next.unitPrice)
        }
        return next
      }),
    )
  }

  const buildSubtotal = lineItems.reduce((s, i) => s + i.total, 0)
  const buildGst = includeGst ? buildSubtotal * 0.1 : 0
  const buildTotal = buildSubtotal + buildGst

  const handleBuildGenerate = () => {
    const valid = lineItems.filter((l) => l.description.trim())
    if (valid.length === 0) return
    setDoc({
      type,
      number: `${type === 'quote' ? 'Q' : 'INV'}-${Date.now().toString().slice(-6)}`,
      date: formatDate(),
      dueDate: type === 'invoice' ? dueDate || formatDate() : undefined,
      clientName: job?.client,
      clientAddress: job?.address,
      lineItems: valid,
      subtotal: valid.reduce((s, i) => s + i.total, 0),
      gst: includeGst ? valid.reduce((s, i) => s + i.total, 0) * 0.1 : 0,
      total: includeGst
        ? valid.reduce((s, i) => s + i.total, 0) * 1.1
        : valid.reduce((s, i) => s + i.total, 0),
      includeGst,
    })
  }

  const handleDescribeGenerate = async () => {
    if (!scope.trim()) return
    setLoading(true)
    setError(null)
    const prompt = `Generate a professional Australian ${type} with line items (description, quantity, unit price).
Format each line as: Description — qty x $price
Scope: ${scope}
${includeGst ? 'Include 10% GST.' : 'No GST.'}
${type === 'invoice' ? `Invoice number: ${invoiceNumber}. Due date: ${dueDate || formatDate()}.` : ''}
Keep it practical for a tradie. Australian English.`

    try {
      const text = await generateDocument({
        message: prompt,
        trade: profile.trade,
        jobContext: job ? buildJobContext(job) : undefined,
      })
      const parsed = parseQuoteFromAi(
        text,
        type,
        includeGst,
        job?.client,
        job?.address,
        dueDate || formatDate(),
      )
      if (type === 'invoice') parsed.number = invoiceNumber
      setDoc(parsed)
    } catch (err) {
      setError(mapFetchError(err))
    } finally {
      setLoading(false)
    }
  }

  if (doc) {
    return (
      <QuoteOverlay
        doc={doc}
        payment={payment}
        onClose={onClose}
        onShare={() => showToast('Coming soon — sharing is on the way.')}
        onSave={() => {
          onSaveToJob?.(doc)
          onClose()
        }}
        showSave={!!job && !!onSaveToJob}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[85] flex flex-col overflow-y-auto bg-[var(--color-bg)] px-4 pt-6 pb-8">
      <button type="button" onClick={onClose} className="self-start font-body text-[var(--color-text-secondary)]">
        Cancel
      </button>
      <h2 className="font-display mt-4 text-xl font-bold text-white">
        Generate {type === 'quote' ? 'a quote' : 'an invoice'}
      </h2>

      <div className="mt-4 flex rounded bg-[var(--color-surface-2)] p-1">
        {(['describe', 'build'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setInputMode(mode)}
            className={`min-h-[36px] flex-1 rounded font-body text-sm capitalize ${
              inputMode === mode
                ? 'bg-white text-black'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {mode === 'describe' ? 'Describe it' : 'Build it'}
          </button>
        ))}
      </div>

      {inputMode === 'describe' ? (
        <textarea
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          placeholder="e.g. Supply and fix 180lm of 90x45 pine framing, single storey, includes noggins and top plates"
          rows={6}
          className="mt-4 min-h-[120px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-body text-white placeholder:text-[var(--color-text-tertiary)]"
        />
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {lineItems.map((line, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
            >
              <div className="flex justify-end">
                {lineItems.length > 1 && (
                  <button type="button" onClick={() => setLineItems((items) => items.filter((_, j) => j !== i))}>
                    <Icon icon={X} size={18} muted />
                  </button>
                )}
              </div>
              <input
                value={line.description}
                onChange={(e) => updateLine(i, 'description', e.target.value)}
                placeholder="Description"
                className="mb-2 w-full bg-transparent font-body text-sm text-white outline-none"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={line.quantity || ''}
                  onChange={(e) => updateLine(i, 'quantity', parseFloat(e.target.value) || 0)}
                  placeholder="Qty"
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-2 font-body text-sm text-white"
                />
                <input
                  type="number"
                  value={line.unitPrice || ''}
                  onChange={(e) => updateLine(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                  placeholder="$ Price"
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-2 font-body text-sm text-white"
                />
                <div className="flex items-center justify-end font-body text-sm text-white">
                  ${line.total.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLineItems((items) => [...items, emptyLine()])}
            className="font-body text-sm text-[var(--color-text-secondary)]"
          >
            + Add line item
          </button>
          <div className="mt-2 space-y-1 font-body text-sm text-right text-white">
            <p>Subtotal: ${buildSubtotal.toFixed(2)}</p>
            {includeGst && <p>GST: ${buildGst.toFixed(2)}</p>}
            <p className="font-display font-bold">Total: ${buildTotal.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Toggle checked={includeGst} onChange={setIncludeGst} label="Include GST" />
      </div>

      {type === 'invoice' && (
        <>
          <label className="mt-4 font-body text-[13px] text-[var(--color-text-secondary)]">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-white"
            />
          </label>
          <p className="mt-2 font-body text-[13px] text-[var(--color-text-tertiary)]">
            Invoice #{invoiceNumber}
          </p>
        </>
      )}

      {error && <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>}
      <button
        type="button"
        disabled={loading || (inputMode === 'describe' ? !scope.trim() : lineItems.every((l) => !l.description.trim()))}
        onClick={() => void (inputMode === 'describe' ? handleDescribeGenerate() : handleBuildGenerate())}
        className="mt-6 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white font-body font-medium text-black disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin text-black" />
            Nudge is writing your {type}...
          </>
        ) : (
          'Generate'
        )}
      </button>
    </div>
  )
}
