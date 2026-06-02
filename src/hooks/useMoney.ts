import { useCallback, useEffect, useMemo, useState } from 'react'
import type { GeneratedDocument, MoneyRecord, QuoteLineItem } from '../types'
import { docToMoneyRecord, isInvoiceOverdue, recalcMoneyRecord } from '../utils/moneyHelpers'
import { generateId, loadJson, saveJson, STORAGE_KEYS } from '../utils/storage'

function withOverdueStatus(records: MoneyRecord[]): MoneyRecord[] {
  return records.map((r) => {
    if (r.type === 'invoice' && r.status !== 'paid' && isInvoiceOverdue(r)) {
      return { ...r, status: 'overdue' }
    }
    return r
  })
}

export function useMoney() {
  const [records, setRecords] = useState<MoneyRecord[]>(() =>
    withOverdueStatus(loadJson<MoneyRecord[]>(STORAGE_KEYS.money, [])),
  )

  useEffect(() => {
    saveJson(STORAGE_KEYS.money, records)
  }, [records])

  const stats = useMemo(() => {
    const invoices = records.filter((r) => r.type === 'invoice')
    const outstanding = invoices
      .filter((r) => r.status === 'sent' || r.status === 'draft')
      .reduce((s, r) => s + r.total, 0)
    const overdue = invoices
      .filter((r) => r.status === 'overdue')
      .reduce((s, r) => s + r.total, 0)
    const now = new Date()
    const paidThisMonth = invoices
      .filter((r) => {
        if (r.status !== 'paid') return false
        const d = new Date(r.updatedAt)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((s, r) => s + r.total, 0)
    return { outstanding, overdue, paidThisMonth }
  }, [records])

  const addFromDocument = useCallback(
    (doc: GeneratedDocument, opts?: { jobId?: string; jobName?: string; client?: string }) => {
      const record = docToMoneyRecord(doc, {
        jobId: opts?.jobId,
        jobName: opts?.jobName,
        client: opts?.client ?? doc.clientName,
        status: doc.type === 'invoice' ? 'draft' : 'draft',
      })
      setRecords((prev) => withOverdueStatus([record, ...prev]))
      return record
    },
    [],
  )

  const updateRecord = useCallback((id: string, updates: Partial<MoneyRecord>) => {
    setRecords((prev) =>
      withOverdueStatus(
        prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r)),
      ),
    )
  }, [])

  const updateFromDocument = useCallback((id: string, doc: GeneratedDocument) => {
    setRecords((prev) =>
      withOverdueStatus(
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                lineItems: doc.lineItems,
                subtotal: doc.subtotal,
                gstAmount: doc.gst,
                total: doc.total,
                includeGst: doc.includeGst,
                dueDate: doc.dueDate,
                updatedAt: Date.now(),
              }
            : r,
        ),
      ),
    )
  }, [])

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const markPaid = useCallback((id: string) => {
    updateRecord(id, { status: 'paid' })
  }, [updateRecord])

  const convertQuoteToInvoice = useCallback((quoteId: string) => {
    const quote = records.find((r) => r.id === quoteId && r.type === 'quote')
    if (!quote) return null
    const invoice: MoneyRecord = {
      ...quote,
      id: generateId(),
      type: 'invoice',
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      status: 'draft',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setRecords((prev) => withOverdueStatus([invoice, ...prev]))
    return invoice
  }, [records])

  const getRecord = useCallback((id: string) => records.find((r) => r.id === id), [records])

  const invoices = useMemo(
    () =>
      [...records]
        .filter((r) => r.type === 'invoice')
        .sort((a, b) => b.createdAt - a.createdAt),
    [records],
  )

  const quotes = useMemo(
    () =>
      [...records]
        .filter((r) => r.type === 'quote')
        .sort((a, b) => b.createdAt - a.createdAt),
    [records],
  )

  return {
    records,
    stats,
    invoices,
    quotes,
    addFromDocument,
    updateRecord,
    updateFromDocument,
    updateLineItems: (id: string, lineItems: QuoteLineItem[]) => {
      setRecords((prev) =>
        withOverdueStatus(
          prev.map((r) => (r.id === id ? recalcMoneyRecord(r, lineItems) : r)),
        ),
      )
    },
    deleteRecord,
    markPaid,
    convertQuoteToInvoice,
    getRecord,
  }
}
