import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { GeneratedDocument, PaymentDetails, QuoteLineItem } from '../types'
import { NAV_PB } from '../utils/layout'

interface QuoteOverlayProps {
  doc: GeneratedDocument
  payment: PaymentDetails
  onClose: () => void
  onShare: () => void
  onDownload: () => void
  onSave?: () => void
  showSave: boolean
  editMode?: boolean
  viewMode?: boolean
  onDocChange?: (doc: GeneratedDocument) => void
  onSaveChanges?: () => void
  onCancelEdit?: () => void
  onDelete?: () => void
  onEdit?: () => void
  onMarkPaid?: () => void
  onConvertToInvoice?: () => void
  firstGenMode?: boolean
  onBackToEdit?: () => void
}

function recalcDoc(doc: GeneratedDocument, lineItems: QuoteLineItem[]): GeneratedDocument {
  const subtotal = lineItems.reduce((s, i) => s + i.total, 0)
  const gst = doc.includeGst ? subtotal * 0.1 : 0
  return { ...doc, lineItems, subtotal, gst, total: subtotal + gst }
}

const btnBase = 'min-h-[48px] rounded-xl font-body text-sm'
const surfaceBtn = `${btnBase} border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)]`
const rowClass = 'flex gap-2'

export function QuoteOverlay({
  doc,
  payment,
  onClose,
  onShare,
  onDownload,
  onSave,
  showSave,
  editMode = false,
  viewMode = false,
  onDocChange,
  onSaveChanges,
  onCancelEdit,
  onDelete,
  onEdit,
  onMarkPaid,
  onConvertToInvoice,
  firstGenMode = false,
  onBackToEdit,
}: QuoteOverlayProps) {
  const title = doc.type === 'quote' ? 'Quote' : 'Invoice'

  const updateLine = (index: number, field: keyof QuoteLineItem, value: string | number) => {
    if (!onDocChange) return
    const items = doc.lineItems.map((item, i) => {
      if (i !== index) return item
      const next = { ...item, [field]: value }
      if (field === 'quantity' || field === 'unitPrice') {
        next.total = Number(next.quantity) * Number(next.unitPrice)
      }
      return next
    })
    onDocChange(recalcDoc(doc, items))
  }

  const inputClass =
    'w-full rounded border border-black/15 bg-white px-2 py-1 font-body text-sm text-black'

  const renderViewButtons = () => {
    if (doc.type === 'invoice') {
      return (
        <div className="flex flex-col gap-2">
          {onEdit && (
            <button type="button" onClick={onEdit} className={`${surfaceBtn} w-full`}>
              Edit
            </button>
          )}
          <div className={rowClass}>
            {onMarkPaid && (
              <button
                type="button"
                onClick={onMarkPaid}
                className={`${btnBase} flex-1`}
                style={{ background: 'rgba(52,199,89,0.15)', color: '#34C759' }}
              >
                Mark as paid
              </button>
            )}
            <button type="button" onClick={onShare} className={`${surfaceBtn} flex-1`}>
              Share with client
            </button>
          </div>
          <div className={rowClass}>
            <button type="button" onClick={onDownload} className={`${surfaceBtn} flex-1`}>
              Download
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className={`${btnBase} flex-1`}
                style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-2">
        {onEdit && (
          <button type="button" onClick={onEdit} className={`${surfaceBtn} w-full`}>
            Edit
          </button>
        )}
        <button type="button" onClick={onShare} className={`${surfaceBtn} w-full`}>
          Share with client
        </button>
        <div className={rowClass}>
          {onConvertToInvoice && (
            <button type="button" onClick={onConvertToInvoice} className={`${surfaceBtn} flex-1`}>
              Convert to invoice
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className={`${btnBase} flex-1`}
              style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      className="fixed inset-0 z-[90] flex flex-col bg-white text-black"
    >
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <span className="font-display text-sm text-black/50">
          {editMode ? `Edit ${title.toLowerCase()}` : title}
        </span>
        <button type="button" onClick={onClose} className="min-h-[48px] min-w-[48px]">
          <X size={22} className="text-black" />
        </button>
      </div>
      <div className={`flex-1 overflow-y-auto px-4 pt-4 ${NAV_PB}`}>
        <div className="flex justify-between gap-4">
          {payment.logo ? (
            <img src={payment.logo} alt="Logo" className="h-12 w-auto object-contain" />
          ) : (
            <span className="font-display text-lg font-bold">datum.ai</span>
          )}
          <div className="text-right font-body text-xs">
            {payment.businessName && <p className="font-medium">{payment.businessName}</p>}
            {payment.abn && <p>ABN {payment.abn}</p>}
          </div>
        </div>
        <hr className="my-4 border-black/10" />
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mt-2 font-body text-sm">#{doc.number} · {doc.date}</p>
        {doc.clientName && (
          <p className="mt-4 font-body text-sm">
            <span className="font-medium">Client:</span> {doc.clientName}
            {doc.clientAddress && ` · ${doc.clientAddress}`}
          </p>
        )}
        {doc.dueDate && (
          <p className="mt-1 font-body text-sm">
            <span className="font-medium">Due:</span> {doc.dueDate}
          </p>
        )}

        {editMode && onDocChange && (
          <div className="mt-4">
            <label className="flex min-h-[48px] cursor-pointer items-center justify-between gap-3">
              <span className="font-body text-sm text-black">Include GST</span>
              <button
                type="button"
                role="switch"
                aria-checked={doc.includeGst}
                onClick={() =>
                  onDocChange(recalcDoc({ ...doc, includeGst: !doc.includeGst }, doc.lineItems))
                }
                className={`relative h-4 w-7 shrink-0 rounded-full border ${
                  doc.includeGst ? 'border-transparent bg-[#34C759]' : 'border-black/20 bg-black/5'
                }`}
              >
                <span
                  className="absolute top-[2px] block h-3 w-3 rounded-full bg-white transition-[left]"
                  style={{ left: doc.includeGst ? 14 : 2 }}
                />
              </button>
            </label>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {doc.lineItems.map((item, i) =>
            editMode && onDocChange ? (
              <div key={i} className="rounded-lg border border-black/10 p-3">
                <input
                  value={item.description}
                  onChange={(e) => updateLine(i, 'description', e.target.value)}
                  placeholder="Description"
                  className={inputClass}
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => updateLine(i, 'quantity', parseFloat(e.target.value) || 0)}
                    placeholder="Qty"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateLine(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="Unit price ($)"
                    className={inputClass}
                  />
                </div>
                <p className="mt-2 text-right font-body text-sm">Total: ${item.total.toFixed(2)}</p>
              </div>
            ) : (
              <div key={i} className="flex justify-between border-b border-black/5 py-2 font-body text-sm">
                <span>{item.description}</span>
                <span>
                  {item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}
                </span>
              </div>
            ),
          )}
          {editMode && onDocChange && (
            <button
              type="button"
              onClick={() =>
                onDocChange(
                  recalcDoc(doc, [
                    ...doc.lineItems,
                    { description: '', quantity: 1, unitPrice: 0, total: 0 },
                  ]),
                )
              }
              className="font-body text-sm text-black/70"
            >
              + Add line item
            </button>
          )}
        </div>

        <div className="mt-4 space-y-1 text-right font-body text-sm">
          <p>Subtotal: ${doc.subtotal.toFixed(2)}</p>
          {doc.includeGst && <p>GST: ${doc.gst.toFixed(2)}</p>}
          <p className="font-display text-lg font-bold">Total: ${doc.total.toFixed(2)}</p>
        </div>
        {doc.type === 'invoice' && payment.bsb && (
          <p className="mt-6 font-body text-xs text-black/60">
            Pay to BSB {payment.bsb} · Acc {payment.account}
          </p>
        )}
        <p className="mt-8 font-body text-xs text-black/40">Generated by datum.ai</p>
      </div>
      <div className="flex flex-col gap-2 border-t border-black/10 bg-white p-4">
        {editMode ? (
          <>
            <button
              type="button"
              onClick={onSaveChanges}
              className="min-h-[48px] w-full rounded-xl bg-black font-body text-sm text-white"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={onCancelEdit ?? onClose}
              className={`${surfaceBtn} w-full`}
            >
              Cancel
            </button>
          </>
        ) : firstGenMode ? (
          <>
            {onBackToEdit && (
              <button
                type="button"
                onClick={onBackToEdit}
                className={`${surfaceBtn} w-full`}
              >
                Edit
              </button>
            )}
            <button type="button" onClick={onShare} className={`${surfaceBtn} w-full`}>
              Share with client
            </button>
            <button type="button" onClick={onDownload} className={`${surfaceBtn} w-full`}>
              Download
            </button>
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="min-h-[48px] w-full rounded-xl bg-black font-body text-sm text-white"
              >
                Save
              </button>
            )}
          </>
        ) : viewMode ? (
          renderViewButtons()
        ) : (
          <>
            <div className={rowClass}>
              <button type="button" onClick={onShare} className={`${surfaceBtn} flex-1`}>
                Share with client
              </button>
              <button type="button" onClick={onDownload} className={`${surfaceBtn} flex-1`}>
                Download
              </button>
            </div>
            {showSave && onSave ? (
              <button
                type="button"
                onClick={onSave}
                className="min-h-[48px] w-full rounded-xl bg-black font-body text-sm text-white"
              >
                Save to job
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] w-full rounded-xl bg-black font-body text-sm text-white"
              >
                Done
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
