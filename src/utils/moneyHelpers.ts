import type { GeneratedDocument, MoneyRecord, QuoteLineItem } from '../types'
import { formatDate, generateId } from './storage'

export function docToMoneyRecord(
  doc: GeneratedDocument,
  opts: {
    jobId?: string
    jobName?: string
    client?: string
    status?: MoneyRecord['status']
    recordId?: string
  } = {},
): MoneyRecord {
  const now = Date.now()
  return {
    id: opts.recordId ?? generateId(),
    type: doc.type,
    invoiceNumber: doc.number,
    client: doc.clientName ?? opts.client,
    jobId: opts.jobId,
    jobName: opts.jobName,
    lineItems: doc.lineItems,
    includeGst: doc.includeGst,
    subtotal: doc.subtotal,
    gstAmount: doc.gst,
    total: doc.total,
    status: opts.status ?? (doc.type === 'invoice' ? 'draft' : 'draft'),
    dueDate: doc.dueDate,
    createdAt: now,
    updatedAt: now,
  }
}

export function moneyRecordToDoc(record: MoneyRecord): GeneratedDocument {
  return {
    type: record.type,
    number: record.invoiceNumber ?? `${record.type === 'quote' ? 'Q' : 'INV'}-${record.id.slice(-6)}`,
    date: formatDate(record.createdAt),
    dueDate: record.dueDate,
    clientName: record.client,
    lineItems: record.lineItems,
    subtotal: record.subtotal,
    gst: record.gstAmount,
    total: record.total,
    includeGst: record.includeGst,
  }
}

export function isInvoiceOverdue(record: MoneyRecord): boolean {
  if (record.type !== 'invoice' || record.status === 'paid') return false
  if (!record.dueDate) return false
  const due = new Date(record.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

export function recalcMoneyRecord(record: MoneyRecord, lineItems: QuoteLineItem[]): MoneyRecord {
  const subtotal = lineItems.reduce((s, i) => s + i.total, 0)
  const gstAmount = record.includeGst ? subtotal * 0.1 : 0
  return {
    ...record,
    lineItems,
    subtotal,
    gstAmount,
    total: subtotal + gstAmount,
    updatedAt: Date.now(),
  }
}
