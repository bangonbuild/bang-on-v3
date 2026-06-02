import { ArrowLeft, ChevronRight, Loader2, MessageCircle, ScanLine } from 'lucide-react'
import { useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { analyseImage, mapFetchError } from '../services/aiService'
import type { Profile, SnapMode } from '../types'
import type { ShowToastFn } from '../hooks/useToast'
import { NAV_PB } from '../utils/layout'
import { encodeImage, saveJson, STORAGE_KEYS } from '../utils/storage'

type SnapStep = 'capture' | 'preview' | 'loading' | 'results'

interface SnapScreenProps {
  mode: SnapMode
  jobId?: string
  profile: Profile
  showToast: ShowToastFn
  onBack: () => void
  onNavigateToNudge: () => void
  onAddToJob?: (analysis: string, imageUrl: string) => void
}

const modeLabels: Record<SnapMode, string> = {
  identify: 'Identify',
  'scan-drawing': 'Scan drawing',
  measure: 'Measure & calculate',
}

const MAX_SIZE = 5 * 1024 * 1024

export function SnapScreen({
  mode,
  jobId,
  profile,
  showToast,
  onBack,
  onNavigateToNudge,
  onAddToJob,
}: SnapScreenProps) {
  const [step, setStep] = useState<SnapStep>('capture')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [imageBase64, setImageBase64] = useState('')
  const [imageMimeType, setImageMimeType] = useState('image/jpeg')
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
      const encoded = await encodeImage(file)
      setImageBase64(encoded.base64)
      setImageMimeType(encoded.mimeType)
      const result = await analyseImage({
        image: encoded.base64,
        mimeType: encoded.mimeType,
        mode,
        trade: profile.trade,
      })
      setAnalysis(result.analysis)
      setSuggestions(result.suggestions)
      setStep('results')
    } catch (err) {
      const msg = mapFetchError(err)
      setError(msg)
      showToast(msg, 'error')
      setStep('preview')
    }
  }

  const handleSuggestion = (suggestion: string) => {
    saveJson(STORAGE_KEYS.pendingChat, { analysis, suggestion, mode })
    onNavigateToNudge()
  }

  const handleAskNudgeWithPhoto = () => {
    saveJson(STORAGE_KEYS.pendingChat, {
      analysis,
      imageBase64,
      imageMimeType,
      freeText: true,
      mode,
    })
    onNavigateToNudge()
  }

  const handleAddToJob = () => {
    if (previewUrl && onAddToJob) {
      onAddToJob(analysis, previewUrl)
      onBack()
    }
  }

  return (
    <div className={`flex h-full flex-col overflow-y-auto px-4 pt-6 ${NAV_PB}`}>
      <header className="flex items-center gap-3 pt-6">
        <button type="button" onClick={onBack} className="min-h-[48px] min-w-[48px]">
          <Icon icon={ArrowLeft} size={22} className="text-white" />
        </button>
        <h1 className="font-display text-base text-white">{modeLabels[mode]}</h1>
      </header>

      {step === 'capture' && (
        <div className="mt-6 flex flex-1 flex-col">
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-[var(--color-surface)]">
            <Icon icon={ScanLine} size={48} muted />
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
                <Loader2 size={32} className="animate-spin text-white" />
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
        <div className="mt-6 flex flex-1 flex-col overflow-y-auto pb-4">
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
                <Icon icon={ChevronRight} size={18} muted />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAskNudgeWithPhoto}
            className="mt-3 flex min-h-[48px] w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4"
          >
            <Icon icon={MessageCircle} size={20} className="text-white" />
            <span className="flex-1 text-left font-body text-[15px] text-white">
              Ask Nudge about this photo →
            </span>
          </button>
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
