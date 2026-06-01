export type JobStatus = 'active' | 'on-hold' | 'complete'

export type TimelineEntryType = 'note' | 'photo' | 'quote' | 'invoice' | 'nudge'

export interface TimelineEntry {
  id: string
  type: TimelineEntryType
  content: string
  polishedContent?: string
  imageUrl?: string
  amount?: number
  timestamp: number
}

export interface Job {
  id: string
  name: string
  client: string
  phone: string
  address: string
  status: JobStatus
  attention?: string
  timeline: TimelineEntry[]
  createdAt: number
  updatedAt: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  jobId?: string
  updatedAt: number
}

export interface Profile {
  name: string
  phone: string
  trade: string
}

export interface PaymentDetails {
  businessName: string
  abn: string
  bsb: string
  account: string
  logo: string
}

export type SnapMode = 'identify' | 'spot-issues' | 'scan-drawing' | 'measure'

export type TabId = 'home' | 'jobs' | 'toolbox' | 'settings'

export type JobFilter = 'all' | 'active' | 'on-hold' | 'complete'

export interface PendingChat {
  analysis: string
  suggestion: string
  mode: SnapMode
}

export interface QuoteLineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface GeneratedDocument {
  type: 'quote' | 'invoice'
  number: string
  date: string
  dueDate?: string
  clientName?: string
  clientAddress?: string
  lineItems: QuoteLineItem[]
  subtotal: number
  gst: number
  total: number
  includeGst: boolean
  rawContent?: string
}

export interface PhotoReportPhoto {
  imageUrl: string
  caption: string
}

export interface PhotoReport {
  title: string
  date: string
  jobName?: string
  photos: PhotoReportPhoto[]
  summary: string
}
