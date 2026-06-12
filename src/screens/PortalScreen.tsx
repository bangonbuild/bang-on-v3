import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { GeneratedDocument, PhotoReportResult } from '../types'
import { formatDate } from '../utils/storage'

interface PortalData {
  type: 'quote' | 'invoice' | 'photo-report'
  document: GeneratedDocument | PhotoReportResult | null
  jobName: string
  message: string
  sentAt: number
}

function QuoteDocView({ doc }: { doc: GeneratedDocument }) {
  const title = doc.type === 'quote' ? 'Quote' : 'Invoice'
  return (
    <div>
      <h1 className="text-[20px] font-bold text-black">{title}</h1>
      <p className="mt-2 text-sm text-black">#{doc.number} · {doc.date}</p>
      {doc.clientName && <p className="mt-4 text-sm text-black">Client: {doc.clientName}</p>}
      <div className="mt-6 space-y-2">
        {doc.lineItems.map((item, i) => (
          <div key={i} className="flex justify-between border-b border-[#eee] py-2 text-sm text-black">
            <span>{item.description}</span>
            <span>${item.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-1 text-right text-sm text-black">
        <p>Subtotal: ${doc.subtotal.toFixed(2)}</p>
        {doc.includeGst && <p>GST: ${doc.gst.toFixed(2)}</p>}
        <p className="text-lg font-bold">Total: ${doc.total.toFixed(2)}</p>
      </div>
    </div>
  )
}

function PhotoReportView({ report }: { report: PhotoReportResult }) {
  return (
    <div>
      <h1 className="text-[20px] font-bold text-black">{report.title}</h1>
      <p className="mt-2 text-sm text-black">{report.date}</p>
      <div className="mt-6 flex flex-col gap-4">
        {report.photos.map((p, i) => (
          <div key={i}>
            <img src={p.imageUrl} alt="" className="w-full rounded-lg object-cover" />
            {p.caption && <p className="mt-2 text-sm text-black">{p.caption}</p>}
          </div>
        ))}
      </div>
      <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-black">{report.summary}</p>
    </div>
  )
}

export function PortalScreen() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState<PortalData | null>(null)

  useEffect(() => {
    const jobId = window.location.pathname.split('/portal/')[1]?.split('/')[0]
    if (!jobId) {
      setError(true)
      setLoading(false)
      return
    }

    fetch(`/api/portal/${jobId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((portalData: PortalData) => {
        setData(portalData)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  const doc = data?.document as GeneratedDocument | PhotoReportResult | null

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-lg px-4 py-8">
        <p className="font-display text-[18px] font-bold text-black">datum.ai</p>

        {loading && (
          <div className="mt-24 flex flex-col items-center gap-4">
            <Loader2 size={28} className="animate-spin text-[#666666]" />
          </div>
        )}

        {error && !loading && (
          <div className="mt-12">
            <p className="text-[16px] leading-relaxed text-black">
              This link has expired or is no longer available.
            </p>
            <p className="mt-2 text-[15px] text-[#666666]">Contact your tradie for a new update.</p>
          </div>
        )}

        {data && !loading && (
          <>
            <h1 className="mt-8 text-[24px] font-semibold text-black">{data.jobName}</h1>
            <p className="mt-2 text-[13px] text-[#666666]">Sent: {formatDate(data.sentAt)}</p>

            <hr className="my-6 border-[#EEEEEE]" />

            <p className="text-[16px] leading-[28px] text-black">{data.message}</p>

            {doc && (
              <>
                <hr className="my-6 border-[#EEEEEE]" />
                {data.type === 'photo-report' ? (
                  <PhotoReportView report={doc as PhotoReportResult} />
                ) : (
                  <QuoteDocView doc={doc as GeneratedDocument} />
                )}
              </>
            )}

            <p className="mt-12 text-center text-[12px] text-[#666666]">
              Powered by{' '}
              <a href="https://datum-app.vercel.app" className="underline">
                datum.ai
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
