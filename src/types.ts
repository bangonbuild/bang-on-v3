export type JobStatus = 'active' | 'on-hold' | 'complete'

export type TimelineEntryType = 'note' | 'photo' | 'quote' | 'invoice' | 'nudge' | 'photo-report'

export interface TimelineEntry {
  id: string
  type: TimelineEntryType
  content: string
  polishedContent?: string
  imageUrl?: string
  amount?: number
  timestamp: number
  clientVisible?: boolean
}

export interface Job {
  id: string
  name: string
  client: string
  email?: string
  phone: string
  address: string
  status: JobStatus
  attention?: string
  timeline: TimelineEntry[]
  crew?: { name: string; phone: string }[]
  createdAt: number
  updatedAt: number
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  imageUrl?: string
  imageBase64?: string
  imageMimeType?: string
  isError?: boolean
  streaming?: boolean
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
  email?: string
  trade: string
}

export interface PaymentDetails {
  businessName: string
  abn: string
  bsb: string
  account: string
  logo: string
}

export type SnapMode = 'identify' | 'scan-drawing' | 'measure'

export type TabId = 'home' | 'jobs' | 'money' | 'toolbox'

export type JobFilter = 'all' | 'active' | 'on-hold' | 'complete'

export type MoneyStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface QuoteLineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface MoneyRecord {
  id: string
  type: 'quote' | 'invoice'
  invoiceNumber?: string
  client?: string
  jobId?: string
  jobName?: string
  lineItems: QuoteLineItem[]
  includeGst: boolean
  subtotal: number
  gstAmount: number
  total: number
  status: MoneyStatus
  dueDate?: string
  createdAt: number
  updatedAt: number
}

export interface PendingChat {
  analysis: string
  suggestion?: string
  mode?: SnapMode
  imageBase64?: string
  imageMimeType?: string
  freeText?: boolean
}

export interface Teammate {
  id: string
  name: string
  phone: string
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

export interface PhotoReportResult {
  title: string
  date: string
  jobName?: string
  photos: PhotoReportPhoto[]
  summary: string
}

export interface SavedPhotoReport {
  id: string
  jobId?: string
  jobName?: string
  client?: string
  photos: string[]
  captions: string[]
  reportText: string
  createdAt: number
}
