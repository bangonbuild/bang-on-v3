import { ArrowLeft, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { Icon } from './Icon'
import { QuoteOverlay } from './QuoteOverlay'
import { ShareUpdateModal } from './ShareUpdateModal'
import { Toggle } from './Toggle'
import { generateDocument, mapFetchError } from '../services/aiService'
import type { GeneratedDocument, Job, MoneyRecord, PaymentDetails, Profile, QuoteLineItem } from '../types'
import { moneyRecordToDoc } from '../utils/moneyHelpers'
import { parseQuoteFromAi } from '../utils/documentParser'
import { buildJobContext } from '../utils/jobHelpers'
import { BACK_BTN, NAV_PB } from '../utils/layout'
import { formatDate } from '../utils/storage'
import type { ShowToastFn } from '../hooks/useToast'

type InputMode = 'describe' | 'build'

interface QuoteGeneratorProps {
  type: 'quote' | 'invoice'
  job?: Job
  profile: Profile
  payment: PaymentDetails
  onClose: () => void
  onSaveToJob?: (doc: GeneratedDocument) => void
  showToast: ShowToastFn
  editEntryId?: string
  initialDoc?: GeneratedDocument
  onUpdateEntry?: (entryId: string, doc: GeneratedDocument) => void
  onDeleteEntry?: (entryId: string) => void
  moneyRecord?: MoneyRecord
  onSaveMoney?: (doc: GeneratedDocument) => void
  onUpdateMoney?: (id: string, doc: GeneratedDocument) => void
  onDeleteMoney?: (id: string) => void
  onMarkPaid?: (id: string) => void
  onConvertToInvoice?: (id: string) => void
  onShareDocument?: (
    doc: GeneratedDocument,
    opts: { entryId?: string; moneyRecordId?: string; jobId?: string },
  ) => void
}

const emptyLine = (): QuoteLineItem => ({
  description: '',
  quantity: 1,
  unitPrice: 0,
  total: 0,
})

const fieldInputClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 font-body text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]'

export function QuoteGenerator({
  type,
  job,
  profile,
  payment,
  onClose,
  onSaveToJob,
  showToast,
  editEntryId,
  initialDoc,
  onUpdateEntry,
  onDeleteEntry,
  moneyRecord,
  onSaveMoney,
  onUpdateMoney,
  onDeleteMoney,
  onMarkPaid,
  onConvertToInvoice,
  onShareDocument,
}: QuoteGeneratorProps) {
  const [moneyEdit, setMoneyEdit] = useState(false)
  const [timelineEditMode, setTimelineEditMode] = useState(false)
  const isTimelineView = Boolean(editEntryId && initialDoc)
  const isMoneyView = Boolean(moneyRecord && !isTimelineView)
  const [inputMode, setInputMode] = useState<InputMode>('describe')
  const [scope, setScope] = useState('')
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(
    initialDoc?.lineItems?.length ? initialDoc.lineItems : [emptyLine()],
  )
  const [includeGst, setIncludeGst] = useState(initialDoc?.includeGst ?? true)
  const [dueDate, setDueDate] = useState(initialDoc?.dueDate ?? '')
  const [invoiceNumber] = useState(
    initialDoc?.number ?? `INV-${Date.now().toString().slice(-6)}`,
  )
  const [loading, setLoading] = useState(false)
  const [doc, setDoc] = useState<GeneratedDocument | null>(
    initialDoc ?? (moneyRecord ? moneyRecordToDoc(moneyRecord) : null),
  )
  const [error, setError] = useState<string | null>(null)
  const [fromGeneration, setFromGeneration] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

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

  const buildDocFromLines = (): GeneratedDocument | null => {
    const valid = lineItems.filter((l) => l.description.trim())
    if (valid.length === 0) return null
    const subtotal = valid.reduce((s, i) => s + i.total, 0)
    const gst = includeGst ? subtotal * 0.1 : 0
    return {
      type,
      number: initialDoc?.number ?? `${type === 'quote' ? 'Q' : 'INV'}-${Date.now().toString().slice(-6)}`,
      date: initialDoc?.date ?? formatDate(),
      dueDate: type === 'invoice' ? dueDate || formatDate() : undefined,
      clientName: job?.client ?? initialDoc?.clientName,
      clientAddress: job?.address ?? initialDoc?.clientAddress,
      lineItems: valid,
      subtotal,
      gst,
      total: subtotal + gst,
      includeGst,
    }
  }

  const handleBuildGenerate = () => {
    const built = buildDocFromLines()
    if (built) {
      setDoc(built)
      setFromGeneration(true)
    }
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
      setFromGeneration(true)
    } catch (err) {
      const msg = mapFetchError(err)
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = () => {
    if (!doc) return
    if (editEntryId && onUpdateEntry) {
      onUpdateEntry(editEntryId, doc)
      showToast('Changes saved.', 'success')
      setTimelineEditMode(false)
      onClose()
      return
    }
    if (moneyRecord && onUpdateMoney) {
      onUpdateMoney(moneyRecord.id, doc)
      showToast('Changes saved.', 'success')
      setMoneyEdit(false)
    }
  }

  const handleCancelEdit = () => {
    if (initialDoc) setDoc({ ...initialDoc, lineItems: [...initialDoc.lineItems] })
    setTimelineEditMode(false)
    setMoneyEdit(false)
  }

  const handleDelete = () => {
    if (!window.confirm("Are you sure? This can't be undone.")) return
    if (editEntryId && onDeleteEntry) {
      onDeleteEntry(editEntryId)
      onClose()
      return
    }
    if (moneyRecord && onDeleteMoney) {
      onDeleteMoney(moneyRecord.id)
      onClose()
    }
  }

  const isFirstGen = Boolean(doc && !isTimelineView && !isMoneyView && fromGeneration)

  const handleBackToEdit = () => {
    if (!doc) return
    setLineItems(doc.lineItems.length ? [...doc.lineItems] : [emptyLine()])
    setIncludeGst(doc.includeGst)
    if (doc.dueDate) setDueDate(doc.dueDate)
    setInputMode('build')
    setDoc(null)
  }

  const handleFirstGenSave = () => {
    if (!doc) return
    if (onSaveToJob) {
      onSaveToJob(doc)
    } else {
      onSaveMoney?.(doc)
      showToast(doc.type === 'quote' ? 'Quote saved.' : 'Invoice saved.', 'success')
    }
    setFromGeneration(false)
    onClose()
  }

  if (doc) {
    const editing = (isTimelineView && timelineEditMode) || (isMoneyView && moneyEdit)
    const inViewMode = (isTimelineView && !timelineEditMode) || (isMoneyView && !moneyEdit)
    const sharePrefill =
      job && doc
        ? doc.type === 'quote'
          ? `Your quote for ${job.name} is ready. Total: $${doc.total.toLocaleString()}. Click below to view.`
          : `Your invoice for ${job.name} is ready. Total: $${doc.total.toLocaleString()}. Click below to view.`
        : undefined

    return (
      <>
      <QuoteOverlay
        doc={doc}
        payment={payment}
        onClose={onClose}
        onShare={() => setShareOpen(true)}
        onDownload={() => showToast('Download coming soon.', 'info')}
        onSave={isFirstGen ? handleFirstGenSave : undefined}
        showSave={false}
        editMode={editing}
        viewMode={inViewMode && !isFirstGen}
        firstGenMode={isFirstGen}
        onBackToEdit={isFirstGen ? handleBackToEdit : undefined}
        onDocChange={editing ? setDoc : undefined}
        onSaveChanges={handleSaveChanges}
        onCancelEdit={handleCancelEdit}
        onDelete={inViewMode || editing ? handleDelete : undefined}
        onEdit={
          inViewMode
            ? () => (isTimelineView ? setTimelineEditMode(true) : setMoneyEdit(true))
            : undefined
        }
        onMarkPaid={
          inViewMode && moneyRecord?.type === 'invoice' && onMarkPaid
            ? () => {
                onMarkPaid(moneyRecord.id)
                showToast('Marked as paid.', 'success')
                onClose()
              }
            : undefined
        }
        onConvertToInvoice={
          inViewMode && moneyRecord?.type === 'quote' && onConvertToInvoice
            ? () => onConvertToInvoice(moneyRecord.id)
            : undefined
        }
      />
      <ShareUpdateModal
        job={job ?? null}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        prefillMessage={sharePrefill}
        notificationType={doc?.type}
        document={doc ?? undefined}
        showToast={showToast}
        onShareSuccess={
          job && doc
            ? () =>
                onShareDocument?.(doc, {
                  entryId: editEntryId,
                  moneyRecordId: moneyRecord?.id,
                  jobId: job.id,
                })
            : undefined
        }
      />
      </>
    )
  }

  return (
    <div className={`fixed inset-0 z-[85] flex flex-col overflow-y-auto bg-[var(--color-bg)] px-4 pt-6 ${NAV_PB}`}>
      <button type="button" onClick={onClose} className={`${BACK_BTN} self-start`}>
        <ArrowLeft size={22} strokeWidth={1.5} className="text-[var(--color-text-primary)]" />
      </button>
      <h2 className="font-display mt-4 text-xl font-bold text-[var(--color-text-primary)]">
        {`Generate ${type === 'quote' ? 'a quote' : 'an invoice'}`}
      </h2>

      {!isTimelineView && (
        <div className="tab-pills mt-4">
          {(['describe', 'build'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setInputMode(mode)}
              className={`tab-pill capitalize ${inputMode === mode ? 'tab-pill-active' : ''}`}
            >
              {mode === 'describe' ? 'Describe it' : 'Build it'}
            </button>
          ))}
        </div>
      )}

      {inputMode === 'describe' && !isTimelineView ? (
        <>
          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="e.g. Supply and fix 180lm of 90x45 pine framing, single storey, includes noggins and top plates"
            rows={6}
            className="mt-4 min-h-[120px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-body text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <div className="mt-4">
            <Toggle checked={includeGst} onChange={setIncludeGst} label="Include GST" />
          </div>
        </>
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
                className={`${fieldInputClass} mb-2`}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={line.quantity || ''}
                  onChange={(e) => updateLine(i, 'quantity', parseFloat(e.target.value) || 0)}
                  placeholder="Qty"
                  className={fieldInputClass}
                />
                <input
                  type="number"
                  value={line.unitPrice || ''}
                  onChange={(e) => updateLine(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                  placeholder="Unit price ($)"
                  className={fieldInputClass}
                />
              </div>
              <p className="mt-2 text-right font-body text-sm text-[var(--color-text-primary)]">
                Total: ${line.total.toFixed(2)}
              </p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLineItems((items) => [...items, emptyLine()])}
            className="font-body text-sm text-[var(--color-text-secondary)]"
          >
            + Add line item
          </button>
          <Toggle checked={includeGst} onChange={setIncludeGst} label="Include GST" />
          <div className="space-y-1 font-body text-sm text-right text-[var(--color-text-primary)]">
            <p>Subtotal: ${buildSubtotal.toFixed(2)}</p>
            {includeGst && <p>GST: ${buildGst.toFixed(2)}</p>}
            <p className="font-display font-bold">Total: ${buildTotal.toFixed(2)}</p>
          </div>
        </div>
      )}

      {type === 'invoice' && !isTimelineView && inputMode === 'describe' && (
        <>
          <label className="mt-4 font-body text-[13px] text-[var(--color-text-secondary)]">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[var(--color-text-primary)]"
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
        disabled={
          loading ||
          (inputMode === 'describe' && !isTimelineView
            ? !scope.trim()
            : lineItems.every((l) => !l.description.trim()))
        }
        onClick={() =>
          void (inputMode === 'describe' && !isTimelineView ? handleDescribeGenerate() : handleBuildGenerate())
        }
        className="mt-6 flex min-h-[48px] items-center justify-center gap-2 rounded-xl btn-primary font-body font-medium disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin text-[var(--color-bg)]" />
            Nudge is writing your {type}...
          </>
        ) : (
          'Generate'
        )}
      </button>
    </div>
  )
}
