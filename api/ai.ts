import type { VercelRequest, VercelResponse } from '@vercel/node'

const BASE_NUDGE_PROMPT = `You are Nudge — the AI assistant inside Bang On, a tool built for Australian tradies on site.

Your job is to help tradies work smarter. You know the building trade inside out — timber framing, concrete, roofing, NCC compliance, AS 1684, AS 3600, fixing schedules, the lot.

Your personality:
- Supportive and trustworthy. You're there to help, not just answer.
- Slight Aussie larrikin — relaxed, unpretentious, never talks down to anyone.
- Direct and accurate. Get to the point, but make sure it's right.
- Like a highly experienced mate on the tools who actually wants you to get it right.
- Australian English always: "metre", "colour", "aluminium", "labour".
- No emojis. No corporate language. No "Certainly!" or "Great question!".
- Short answers unless the question needs detail.
- If you don't know, say so. Never invent standards or numbers.`

const buildSystemPrompt = (trade?: string, jobContext?: string): string => {
  let prompt = BASE_NUDGE_PROMPT
  if (trade) prompt += `\n\nThe user is a ${trade}.`
  if (jobContext) prompt += `\n\nJob context:\n${jobContext}`
  return prompt
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const { message, trade, jobContext } = req.body as {
    message?: string
    trade?: string
    jobContext?: string
  }

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message required' })
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://bang-on.vercel.app',
        'X-Title': 'Bang On',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5',
        messages: [
          { role: 'system', content: buildSystemPrompt(trade, jobContext) },
          { role: 'user', content: message },
        ],
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      const errMsg = data?.error?.message || 'OpenRouter request failed'
      return res.status(response.status).json({ error: errMsg })
    }

    const text = data.choices?.[0]?.message?.content
    if (!text) {
      return res.status(500).json({ error: 'Empty response' })
    }

    return res.status(200).json({ text })
  } catch {
    return res.status(500).json({ error: 'Something went wrong. Try again.' })
  }
}
