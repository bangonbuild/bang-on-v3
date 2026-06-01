import type { GeneratedDocument, QuoteLineItem } from '../types'
import { formatDate } from './storage'

export function parseQuoteFromAi(
  text: string,
  type: 'quote' | 'invoice',
  includeGst: boolean,
  clientName?: string,
  clientAddress?: string,
  dueDate?: string,
): GeneratedDocument {
  const lineItems: QuoteLineItem[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    const match = line.match(/^[-•*]?\s*(.+?)\s*[—–-]\s*(\d+(?:\.\d+)?)\s*(?:x|@)\s*\$?(\d+(?:\.\d+)?)/i)
    if (match) {
      const qty = parseFloat(match[2])
      const unitPrice = parseFloat(match[3])
      lineItems.push({
        description: match[1].trim(),
        quantity: qty,
        unitPrice,
        total: qty * unitPrice,
      })
    }
  }

  if (lineItems.length === 0) {
    lineItems.push({
      description: 'Works as described',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    })
  }

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0)
  const gst = includeGst ? subtotal * 0.1 : 0
  const total = subtotal + gst

  return {
    type,
    number: `${type === 'quote' ? 'Q' : 'INV'}-${Date.now().toString().slice(-6)}`,
    date: formatDate(),
    dueDate,
    clientName,
    clientAddress,
    lineItems,
    subtotal,
    gst,
    total,
    includeGst,
    rawContent: text,
  }
}
