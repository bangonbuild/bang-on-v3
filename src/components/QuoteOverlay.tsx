import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Toggle } from './Toggle'
import type { GeneratedDocument, PaymentDetails, QuoteLineItem } from '../types'
import { NAV_PB } from '../utils/layout'

interface QuoteOverlayProps {
  doc: GeneratedDocument
  payment: PaymentDetails
  onClose: () => void
  onShare: () => void
  onSave?: () => void
  showSave: boolean
  editMode?: boolean
  onDocChange?: (doc: GeneratedDocument) => void
  onSaveChanges?: () => void
  onDelete?: () => void
}

function recalcDoc(doc: GeneratedDocument, lineItems: QuoteLineItem[]): GeneratedDocument {
  const subtotal = lineItems.reduce((s, i) => s + i.total, 0)
  const gst = doc.includeGst ? subtotal * 0.1 : 0
  return { ...doc, lineItems, subtotal, gst, total: subtotal + gst }
}

export function QuoteOverlay({
  doc,
  payment,
  onClose,
  onShare,
  onSave,
  showSave,
  editMode = false,
  onDocChange,
  onSaveChanges,
  onDelete,
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
            <span className="font-display text-lg font-bold">Bangon</span>
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
            <Toggle
              checked={doc.includeGst}
              onChange={(checked) => onDocChange(recalcDoc({ ...doc, includeGst: checked }, doc.lineItems))}
              label="Include GST"
            />
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
        </div>

        <div className="mt-4 space-y-1 font-body text-sm text-right">
          <p>Subtotal: ${doc.subtotal.toFixed(2)}</p>
          {doc.includeGst && <p>GST: ${doc.gst.toFixed(2)}</p>}
          <p className="font-display text-lg font-bold">Total: ${doc.total.toFixed(2)}</p>
        </div>
        {doc.type === 'invoice' && payment.bsb && (
          <p className="mt-6 font-body text-xs text-black/60">
            Pay to BSB {payment.bsb} · Acc {payment.account}
          </p>
        )}
        <p className="mt-8 font-body text-xs text-black/40">Generated by Bangon</p>
      </div>
      <div className={`flex flex-col gap-2 border-t border-black/10 bg-white p-4 ${editMode ? '' : ''}`}>
        {editMode ? (
          <>
            <button
              type="button"
              onClick={onSaveChanges}
              className="min-h-[48px] w-full rounded-xl bg-black font-body text-sm text-white"
            >
              Save changes
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onShare}
                className="min-h-[48px] flex-1 rounded-xl border border-black/20 font-body text-sm"
              >
                Share with client
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="min-h-[48px] flex-1 rounded-xl border border-black/20 font-body text-sm text-red-600"
              >
                Delete {title.toLowerCase()}
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onShare}
              className="min-h-[48px] flex-1 rounded-xl border border-black/20 font-body text-sm"
            >
              Share with client
            </button>
            {showSave && onSave ? (
              <button
                type="button"
                onClick={onSave}
                className="min-h-[48px] flex-1 rounded-xl bg-black font-body text-sm text-white"
              >
                Save to job
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] flex-1 rounded-xl bg-black font-body text-sm text-white"
              >
                Done
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
