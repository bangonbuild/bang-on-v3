import type { MoneyRecord } from '../types'
import { isInvoiceOverdue } from './moneyHelpers'

function isOverdueInvoice(record: MoneyRecord): boolean {
  return record.type === 'invoice' && (isInvoiceOverdue(record) || record.status === 'overdue')
}

function isPaidOrDraft(record: MoneyRecord): boolean {
  return record.status === 'paid' || record.status === 'draft'
}

/** Sort: overdue → due soon → no due date → paid/draft */
export function sortInvoices(records: MoneyRecord[]): MoneyRecord[] {
  return [...records].sort((a, b) => {
    const groupA = invoiceSortGroup(a)
    const groupB = invoiceSortGroup(b)
    if (groupA !== groupB) return groupA - groupB

    if (groupA === 0) {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : 0
      const db = b.dueDate ? new Date(b.dueDate).getTime() : 0
      return da - db
    }
    if (groupA === 1) {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      return da - db
    }
    if (groupA === 3) {
      return b.updatedAt - a.updatedAt
    }
    return b.updatedAt - a.updatedAt
  })
}

function invoiceSortGroup(record: MoneyRecord): number {
  if (isOverdueInvoice(record)) return 0
  if (record.dueDate && !isPaidOrDraft(record)) return 1
  if (!record.dueDate && !isPaidOrDraft(record)) return 2
  return 3
}
