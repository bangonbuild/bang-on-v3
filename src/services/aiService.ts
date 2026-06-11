const AI_TIMEOUT = 30000

export type ChatHistoryMessage = { role: 'user' | 'assistant'; content: string }

export async function sendChatMessage(params: {
  messages: ChatHistoryMessage[]
  trade?: string
  jobContext?: string
  userName?: string
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
        messages: params.messages,
        trade: params.trade,
        jobContext: params.jobContext,
        userName: params.userName,
        stream: false,
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

export async function streamChatMessage(params: {
  messages: ChatHistoryMessage[]
  trade?: string
  jobContext?: string
  userName?: string
  onToken: (token: string) => void
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
        messages: params.messages,
        trade: params.trade,
        jobContext: params.jobContext,
        userName: params.userName,
        stream: true,
      }),
      signal,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error || 'Request failed')
    }

    const reader = res.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter((line) => line.startsWith('data: '))
      for (const line of lines) {
        const data = line.slice(6).trim()
        if (data === '[DONE]') break
        try {
          const parsed = JSON.parse(data) as {
            choices?: { delta?: { content?: string } }[]
          }
          const token = parsed.choices?.[0]?.delta?.content ?? ''
          if (token) {
            fullText += token
            params.onToken(token)
          }
        } catch {
          /* skip malformed SSE chunks */
        }
      }
    }

    return fullText
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
    messages: [{ role: 'user', content: params.message }],
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
