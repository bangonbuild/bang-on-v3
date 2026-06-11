import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { kv } from '@vercel/kv'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { job, message, clientEmail, clientName } = req.body

    if (!job || !clientEmail || !message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const portalKey = `portal:${job.id}`
    await kv.set(
      portalKey,
      {
        job,
        message,
        sentAt: Date.now(),
      },
      { ex: 60 * 60 * 24 * 30 },
    )

    const portalUrl = `${APP_URL}/portal/${job.id}`

    await resend.emails.send({
      from: 'datum.ai <notifications@getdatum.ai>',
      to: clientEmail,
      subject: `Update on ${job.name}`,
      html: buildEmailTemplate({
        jobName: job.name,
        clientName: clientName || 'there',
        message,
        portalUrl,
        status: job.status,
      }),
    })

    return res.status(200).json({ success: true, portalUrl })
  } catch (error) {
    console.error('[api/notify]', error)
    return res.status(500).json({ error: 'Failed to send notification' })
  }
}

function buildEmailTemplate({
  jobName,
  clientName,
  message,
  portalUrl,
  status,
}: {
  jobName: string
  clientName: string
  message: string
  portalUrl: string
  status: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Update on ${jobName}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#14120a;padding:28px 32px;">
              <p style="margin:0;font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">datum.ai</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Job update</p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#111;">${jobName}</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#333;line-height:1.6;">G'day ${clientName},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#333;line-height:1.6;">${message}</p>
              <p style="margin:0 0 24px;">
                <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:#f0f0f0;font-size:12px;color:#555;text-transform:capitalize;">${status}</span>
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#14120a;border-radius:8px;padding:14px 28px;">
                    <a href="${portalUrl}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">View job update →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#aaa;line-height:1.5;">
                This update was sent via datum.ai — the AI-powered site toolbox for Australian tradies.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#bbb;">
                Powered by <a href="https://datum-app.vercel.app" style="color:#bbb;">datum.ai</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
