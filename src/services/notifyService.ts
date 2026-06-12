import type { GeneratedDocument, PhotoReportResult } from '../types'

export interface NotifyPayload {
  job: { id: string; name: string; client?: string }
  message: string
  clientEmail: string
  clientName?: string
  notificationType?: 'quote' | 'invoice' | 'photo-report'
  document?: GeneratedDocument | PhotoReportResult | Record<string, unknown>
}

export async function sendClientUpdate(payload: NotifyPayload): Promise<{ portalUrl: string }> {
  const res = await fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to send notification')
  }

  return { portalUrl: data.portalUrl }
}
