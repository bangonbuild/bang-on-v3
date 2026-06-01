const AI_TIMEOUT = 30000

export async function sendChatMessage(params: {
  message: string
  trade?: string
  jobContext?: string
  signal?: AbortSignal
}): Promise<string> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), AI_TIMEOUT)
  const signal = params.signal ?? controller.signal

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: params.message,
        trade: params.trade,
        jobContext: params.jobContext,
      }),
      signal,
    })
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error || 'Request failed')
    return data.text as string
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function analyseImage(params: {
  image: string
  mimeType: string
  mode: string
  trade?: string
  signal?: AbortSignal
}): Promise<{ analysis: string; suggestions: string[] }> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), AI_TIMEOUT)
  const signal = params.signal ?? controller.signal

  try {
    const res = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal,
    })
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error || 'Request failed')
    return {
      analysis: data.analysis as string,
      suggestions: (data.suggestions as string[]) || [],
    }
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function generateDocument(params: {
  message: string
  trade?: string
  jobContext?: string
}): Promise<string> {
  return sendChatMessage({
    message: params.message,
    trade: params.trade,
    jobContext: params.jobContext,
  })
}

export function mapFetchError(err: unknown): string {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return 'Took too long. Check your signal and try again.'
  }
  if (err instanceof TypeError) {
    return 'No signal. Check your connection and try again.'
  }
  return 'Something went wrong. Try again.'
}
