import { ArrowLeft, ChevronRight, Loader2, ScanLine } from 'lucide-react'
import { useRef, useState } from 'react'
import { analyseImage, mapFetchError } from '../services/aiService'
import type { Profile, SnapMode } from '../types'
import { encodeImage, saveJson, STORAGE_KEYS } from '../utils/storage'

type SnapStep = 'capture' | 'preview' | 'loading' | 'results'

interface SnapScreenProps {
  mode: SnapMode
  jobId?: string
  profile: Profile
  onBack: () => void
  onNavigateToNudge: () => void
  onAddToJob?: (analysis: string, imageUrl: string) => void
}

const modeLabels: Record<SnapMode, string> = {
  identify: 'Identify',
  'spot-issues': 'Spot issues',
  'scan-drawing': 'Scan drawing',
  measure: 'Measure & calculate',
}

const MAX_SIZE = 5 * 1024 * 1024

export function SnapScreen({
  mode,
  jobId,
  profile,
  onBack,
  onNavigateToNudge,
  onAddToJob,
}: SnapScreenProps) {
  const [step, setStep] = useState<SnapStep>('capture')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | undefined) => {
    if (!f) return
    if (f.size > MAX_SIZE) {
      setError('Photo too large. Try a lower resolution shot.')
      return
    }
    setError(null)
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setStep('preview')
  }

  const runAnalyse = async () => {
    if (!file) return
    setStep('loading')
    setError(null)
    try {
      const { base64, mimeType } = await encodeImage(file)
      const result = await analyseImage({
        image: base64,
        mimeType,
        mode,
        trade: profile.trade,
      })
      setAnalysis(result.analysis)
      setSuggestions(result.suggestions)
      setStep('results')
    } catch (err) {
      setError(mapFetchError(err))
      setStep('preview')
    }
  }

  const handleSuggestion = (suggestion: string) => {
    saveJson(STORAGE_KEYS.pendingChat, { analysis, suggestion, mode })
    onNavigateToNudge()
  }

  const handleAddToJob = () => {
    if (previewUrl && onAddToJob) {
      onAddToJob(analysis, previewUrl)
      onBack()
    }
  }

  return (
    <div className="flex h-full flex-col px-4 pb-4">
      <header className="flex items-center gap-3 pt-6">
        <button type="button" onClick={onBack} className="min-h-[48px] min-w-[48px]">
          <ArrowLeft size={22} className="text-white" />
        </button>
        <h1 className="font-display text-base text-white">{modeLabels[mode]}</h1>
      </header>

      {step === 'capture' && (
        <div className="mt-6 flex flex-1 flex-col">
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-[var(--color-surface)]">
            <ScanLine size={48} className="text-[var(--color-text-tertiary)]" />
          </div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={libraryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="mt-6 min-h-[48px] rounded-xl bg-white font-body font-medium text-black active:bg-[#F0F0F0]"
          >
            Snap a photo
          </button>
          <button
            type="button"
            onClick={() => libraryRef.current?.click()}
            className="mt-2 min-h-[48px] rounded-xl border border-[var(--color-border)] font-body text-white"
          >
            Choose from library
          </button>
        </div>
      )}

      {(step === 'preview' || step === 'loading') && previewUrl && (
        <div className="mt-6 flex flex-1 flex-col">
          <div className={`relative ${step === 'loading' ? 'opacity-50' : ''}`}>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-[280px] w-full rounded-xl object-cover"
            />
            {step === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-white" size={32} />
                <p className="mt-2 font-body text-sm text-white">Reading the site...</p>
              </div>
            )}
          </div>
          {error && (
            <p className="mt-2 font-body text-sm text-[var(--color-danger)]">{error}</p>
          )}
          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => void runAnalyse()}
                className="mt-6 min-h-[48px] rounded-xl bg-white font-body font-medium text-black"
              >
                Analyse
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('capture')
                  setPreviewUrl(null)
                  setFile(null)
                }}
                className="mt-2 min-h-[48px] rounded-xl border border-[var(--color-border)] font-body text-white"
              >
                Retake
              </button>
            </>
          )}
        </div>
      )}

      {step === 'results' && previewUrl && (
        <div className="mt-6 flex flex-1 flex-col overflow-y-auto">
          <img
            src={previewUrl}
            alt="Result"
            className="max-h-[180px] w-full rounded-xl object-cover"
          />
          <p className="font-display mt-4 text-[11px] tracking-wide text-[var(--color-text-tertiary)]">
            Site read
          </p>
          <p className="mt-2 font-body text-[15px] leading-relaxed text-white">{analysis}</p>
          <hr className="my-6 border-[var(--color-border)]" />
          <p className="font-display text-[11px] tracking-wide text-[var(--color-text-tertiary)]">
            Ask more
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestion(s)}
                className="flex min-h-[48px] items-center justify-between rounded-xl border border-[var(--color-border)] border-l-4 border-l-white bg-[var(--color-surface)] px-4 text-left"
              >
                <span className="font-body text-[15px] text-white">{s}</span>
                <ChevronRight size={18} className="text-[var(--color-text-tertiary)]" />
              </button>
            ))}
          </div>
          {jobId && onAddToJob && (
            <button
              type="button"
              onClick={handleAddToJob}
              className="mt-4 min-h-[48px] rounded-xl bg-white font-body font-medium text-black"
            >
              Add to job
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setStep('capture')
              setPreviewUrl(null)
              setFile(null)
              setAnalysis('')
            }}
            className="mt-2 min-h-[48px] rounded-xl border border-[var(--color-border)] font-body text-white"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  )
}
