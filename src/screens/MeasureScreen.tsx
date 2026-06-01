import { ArrowLeft, ChevronDown, MessageCircle } from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface MeasureScreenProps {
  onBack: () => void
  onNudge: () => void
}

type CalcId = 'concrete' | 'roof' | 'stud' | 'wall' | null

export function MeasureScreen({ onBack, onNudge }: MeasureScreenProps) {
  const [expanded, setExpanded] = useState<CalcId>(null)

  return (
    <div className="px-4 pb-24 pt-6">
      <header className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="min-h-[48px] min-w-[48px]">
          <ArrowLeft size={22} className="text-white" />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Measure & calculate</h1>
      </header>

      <button
        type="button"
        onClick={onNudge}
        className="mt-6 flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-left"
      >
        <MessageCircle size={22} className="text-white" />
        <div>
          <p className="font-display text-white">Ask Nudge to calculate</p>
          <p className="font-body text-[13px] text-[var(--color-text-secondary)]">
            Describe what you need
          </p>
        </div>
      </button>

      <p className="font-display mt-6 text-[11px] tracking-[0.12em] text-[var(--color-text-tertiary)]">
        Calculators
      </p>

      <ConcreteCalc expanded={expanded === 'concrete'} onToggle={() => setExpanded(expanded === 'concrete' ? null : 'concrete')} />
      <RoofCalc expanded={expanded === 'roof'} onToggle={() => setExpanded(expanded === 'roof' ? null : 'roof')} />
      <StudCalc expanded={expanded === 'stud'} onToggle={() => setExpanded(expanded === 'stud' ? null : 'stud')} />
      <WallCalc expanded={expanded === 'wall'} onToggle={() => setExpanded(expanded === 'wall' ? null : 'wall')} />
    </div>
  )
}

function CalcShell({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="mt-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[48px] w-full items-center justify-between px-4"
      >
        <span className="font-body text-white">{title}</span>
        <ChevronDown
          size={18}
          className={`text-[var(--color-text-tertiary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && <div className="border-t border-[var(--color-border)] px-4 pb-4">{children}</div>}
    </div>
  )
}

function ConcreteCalc({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [depth, setDepth] = useState('')
  const l = parseFloat(length) || 0
  const w = parseFloat(width) || 0
  const d = (parseFloat(depth) || 0) / 1000
  const volume = l * w * d
  const bags = Math.ceil(volume * 1000 / 20)

  return (
    <CalcShell title="Concrete volume" expanded={expanded} onToggle={onToggle}>
      <Field label="Length (m)" value={length} onChange={setLength} />
      <Field label="Width (m)" value={width} onChange={setWidth} />
      <Field label="Depth (mm)" value={depth} onChange={setDepth} />
      <p className="mt-3 font-body text-white">
        {volume.toFixed(2)} m³ · ~{bags} × 20kg bags
      </p>
    </CalcShell>
  )
}

function RoofCalc({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const [rise, setRise] = useState('')
  const [run, setRun] = useState('')
  const r = parseFloat(rise) || 0
  const ru = parseFloat(run) || 0
  const angle = ru > 0 ? (Math.atan(r / ru) * 180) / Math.PI : 0
  const rafter = Math.sqrt(r * r + ru * ru)

  return (
    <CalcShell title="Roof pitch" expanded={expanded} onToggle={onToggle}>
      <Field label="Rise (mm)" value={rise} onChange={setRise} />
      <Field label="Run (mm)" value={run} onChange={setRun} />
      <p className="mt-3 font-body text-white">
        {angle.toFixed(1)}° pitch · Rafter {rafter.toFixed(0)} mm
      </p>
    </CalcShell>
  )
}

function StudCalc({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const [wallLen, setWallLen] = useState('')
  const [spacing, setSpacing] = useState<450 | 600>(450)
  const len = parseFloat(wallLen) || 0
  const count = Math.floor(len / spacing) + 1
  const positions = Array.from({ length: count }, (_, i) => i * spacing)

  return (
    <CalcShell title="Stud spacing" expanded={expanded} onToggle={onToggle}>
      <Field label="Wall length (mm)" value={wallLen} onChange={setWallLen} />
      <div className="mt-2 flex gap-2">
        {([450, 600] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSpacing(s)}
            className={`flex-1 min-h-[40px] rounded-lg font-body text-sm ${
              spacing === s ? 'bg-white text-black' : 'border border-[var(--color-border)] text-white'
            }`}
          >
            {s} mm
          </button>
        ))}
      </div>
      <p className="mt-3 font-body text-white">
        {count} studs · Layout: {positions.slice(0, 8).join(', ')}
        {positions.length > 8 ? '…' : ''} mm
      </p>
    </CalcShell>
  )
}

function WallCalc({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [doors, setDoors] = useState('0')
  const [windows, setWindows] = useState('0')
  const w = parseFloat(width) || 0
  const h = parseFloat(height) || 0
  const gross = w * h
  const openings = parseInt(doors, 10) * 2.04 + parseInt(windows, 10) * 1.2
  const net = Math.max(0, gross - openings)

  return (
    <CalcShell title="Wall area" expanded={expanded} onToggle={onToggle}>
      <Field label="Width (m)" value={width} onChange={setWidth} />
      <Field label="Height (m)" value={height} onChange={setHeight} />
      <Field label="Doors" value={doors} onChange={setDoors} />
      <Field label="Windows" value={windows} onChange={setWindows} />
      <p className="mt-3 font-body text-white">
        Gross {gross.toFixed(2)} m² · Net {net.toFixed(2)} m²
      </p>
    </CalcShell>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="mt-2 block font-body text-[13px] text-[var(--color-text-secondary)]">
      {label}
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full min-h-[44px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-white"
      />
    </label>
  )
}
