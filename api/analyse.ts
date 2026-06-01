import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

const getModePrompt = (mode: string): string => {
  const modes: Record<string, string> = {
    identify:
      'The user wants to know what they are looking at. Identify the materials, components, or elements visible in the image.',
    'spot-issues':
      'The user wants to know if something looks wrong. Look for defects, non-compliance, safety issues, or anything that needs attention.',
    'scan-drawing':
      'The user has photographed a plan or technical drawing. Explain what it shows, identify key dimensions or details, and flag anything that needs clarification.',
    measure:
      'The user wants measurements or calculations from this image. Estimate dimensions where possible and provide relevant calculations.',
  }
  return modes[mode] || modes.identify
}

const VISION_SYSTEM = `You are Nudge — the vision assistant inside Bang On, built for Australian tradies on site.
Analyse construction site photos with practical, accurate, Aussie-tradie language. No emojis.
Respond in this JSON format only:
{
  "analysis": "2-4 sentence site assessment.",
  "suggestions": ["Question 1?", "Question 2?", "Question 3?"]
}`

function parseVisionResponse(content: string): { analysis: string; suggestions: string[] } {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        analysis?: string
        suggestions?: string[]
      }
      return {
        analysis: parsed.analysis || content,
        suggestions: parsed.suggestions || [],
      }
    }
  } catch {
    /* fallback below */
  }
  return {
    analysis: content,
    suggestions: [
      'What should I check next on this?',
      'Is this compliant with standard practice?',
      'What would you do from here?',
    ],
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const { image, mimeType, mode, trade } = req.body as {
    image?: string
    mimeType?: string
    mode?: string
    trade?: string
  }

  if (!image || !mimeType) {
    return res.status(400).json({ error: 'Image required' })
  }

  const modePrompt = getModePrompt(mode || 'identify')
  let systemContent = `${VISION_SYSTEM}\n\n${modePrompt}`
  if (trade) systemContent += `\n\nThe user is a ${trade}.`

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
        model: 'anthropic/claude-opus-4',
        messages: [
          { role: 'system', content: systemContent },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${image.trim()}`,
                },
              },
              { type: 'text', text: 'Analyse this site photo.' },
            ],
          },
        ],
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      const errMsg = data?.error?.message || 'OpenRouter request failed'
      return res.status(response.status).json({ error: errMsg })
    }

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return res.status(500).json({ error: 'Empty response' })
    }

    const parsed = parseVisionResponse(content)
    return res.status(200).json(parsed)
  } catch {
    return res.status(500).json({ error: 'Something went wrong. Try again.' })
  }
}
