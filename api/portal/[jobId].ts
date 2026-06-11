import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { jobId } = req.query

  if (!jobId || typeof jobId !== 'string') {
    return res.status(400).json({ error: 'Missing job ID' })
  }

  try {
    const data = await kv.get(`portal:${jobId}`)

    if (!data) {
      return res.status(404).json({ error: 'Job not found or link has expired.' })
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('[api/portal]', error)
    return res.status(500).json({ error: 'Failed to load job.' })
  }
}
