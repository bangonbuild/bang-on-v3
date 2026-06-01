import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { QuoteOverlay } from './QuoteOverlay'
import { generateDocument, mapFetchError } from '../services/aiService'
import type { GeneratedDocument, Job, PaymentDetails, Profile } from '../types'
import { parseQuoteFromAi } from '../utils/documentParser'
import { buildJobContext } from '../utils/jobHelpers'
import { formatDate } from '../utils/storage'

interface QuoteGeneratorProps {
  type: 'quote' | 'invoice'
  job?: Job
  profile: Profile
  payment: PaymentDetails
  onClose: () => void
  onSaveToJob?: (doc: GeneratedDocument) => void
  showToast: (msg: string) => void
}

export function QuoteGenerator({
  type,
  job,
  profile,
  payment,
  onClose,
  onSaveToJob,
  showToast,
}: QuoteGeneratorProps) {
  const [scope, setScope] = useState('')
  const [includeGst, setIncludeGst] = useState(true)
  const [dueDate, setDueDate] = useState('')
  const [invoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`)
  const [loading, setLoading] = useState(false)
  const [doc, setDoc] = useState<GeneratedDocument | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
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
    <div className="fixed inset-0 z-[85] flex flex-col bg-[var(--color-bg)] px-4 pt-6">
      <button type="button" onClick={onClose} className="self-start font-body text-[var(--color-text-secondary)]">
        Cancel
      </button>
      <h2 className="font-display mt-4 text-xl font-bold text-white">
        Generate {type === 'quote' ? 'a quote' : 'an invoice'}
      </h2>
      <textarea
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        placeholder="Describe the scope of work..."
        rows={5}
        className="mt-4 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-body text-white placeholder:text-[var(--color-text-tertiary)]"
      />
      <label className="mt-4 flex items-center gap-2 font-body text-white">
        <input
          type="checkbox"
          checked={includeGst}
          onChange={(e) => setIncludeGst(e.target.checked)}
          className="h-5 w-5"
        />
        Include GST
      </label>
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
        disabled={loading || !scope.trim()}
        onClick={() => void handleGenerate()}
        className="mt-6 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white font-body font-medium text-black disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Nudge is writing your {type}...
          </>
        ) : (
          'Generate'
        )}
      </button>
    </div>
  )
}
