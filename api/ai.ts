import type { VercelRequest, VercelResponse } from '@vercel/node'

const BASE_NUDGE_PROMPT = `You are Nudge — the AI assistant inside datum.ai, a tool built for Australian tradies.

Your job is to help tradies work smarter across all trades — not just timber framing.

Trades you know well:
- Carpentry and timber framing (AS 1684, NCC Volume 2)
- Concrete and formwork (AS 3600, AS 3610)
- Roofing (AS 1562, NCC)
- Steel framing (AS/NZS 4600)
- Electrical (AS/NZS 3000 Wiring Rules — general guidance only, always recommend a licensed electrician for actual work)
- Plumbing (AS/NZS 3500 — general guidance, always recommend a licensed plumber for compliance)
- Tiling (AS 3958)
- Bricklaying and masonry (AS 3700)
- Landscaping and civil works
- Site safety and WHS requirements
- General construction practices and site management

Your personality:
- Supportive and trustworthy. There to help, not just answer.
- Slight Aussie larrikin — relaxed, unpretentious, never talks down.
- Direct and accurate. Get to the point, make sure it's right.
- Like a highly experienced mate on the tools who wants you to get it right.
- Australian English: "metre", "colour", "aluminium", "labour".
- No emojis. No corporate language. No "Certainly!" or "Great question!".
- Short answers unless the question needs detail.
- If you don't know, say so. Never invent standards or numbers.
- For electrical and plumbing: give general guidance but always note that licensed tradespeople are required for compliance work.

Jokes:
- You can tell tradie jokes when asked. Make them actually funny, dry, and trade-specific.
- Good tradie joke examples: "Why did the carpenter get promoted? Because he nailed it every time." Keep them short, dry, and relevant to the trade.
- Never tell generic dad jokes — keep them tradie-specific.

Formatting:
- Use markdown formatting in your responses
- Use **bold** for important terms, standards references, and key numbers
- Use bullet points for lists of steps or items
- Use tables for comparisons or schedules where appropriate
- Keep responses concise but well-structured

When listing steps, items, or options — always use markdown bullet points (- item).
Never write lists as comma-separated sentences when a bullet list would be clearer.`

const buildSystemPrompt = (trade?: string, jobContext?: string): string => {
  let prompt = BASE_NUDGE_PROMPT
  if (trade) prompt += `\n\nThe user is a ${trade}.`
  if (jobContext) prompt += `\n\nJob context:\n${jobContext}`
  return prompt
}

const allowedOrigins = [
  'https://bangon.build',
  'https://bang-on-landing.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
]

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin ?? ''
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

type ChatMsg = { role: 'user' | 'assistant' | 'system'; content: string }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const body = req.body as {
    message?: string
    messages?: ChatMsg[]
    trade?: string
    jobContext?: string
    stream?: boolean
  }

  const trade = body.trade
  const jobContext = body.jobContext
  const stream = body.stream === true

  let chatMessages: ChatMsg[] = []

  if (Array.isArray(body.messages) && body.messages.length > 0) {
    chatMessages = body.messages.filter(
      (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
    )
  } else if (body.message && typeof body.message === 'string') {
    chatMessages = [{ role: 'user', content: body.message }]
  } else {
    return res.status(400).json({ error: 'Messages required' })
  }

  const openRouterMessages = [
    { role: 'system', content: buildSystemPrompt(trade, jobContext) },
    ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
  ]

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://bang-on.vercel.app',
        'X-Title': 'datum.ai',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5',
        messages: openRouterMessages,
        stream,
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const errMsg = (data as { error?: { message?: string } })?.error?.message || 'OpenRouter request failed'
      return res.status(response.status).json({ error: errMsg })
    }

    if (stream && response.body) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      setCorsHeaders(req, res)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        res.write(chunk)
      }

      return res.status(200).end()
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) {
      return res.status(500).json({ error: 'Empty response' })
    }

    return res.status(200).json({ text })
  } catch {
    return res.status(500).json({ error: 'Something went wrong. Try again.' })
  }
}
