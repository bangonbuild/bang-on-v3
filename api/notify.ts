import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { kv } from '@vercel/kv'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = 'https://datum-app.vercel.app'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { job, message, clientEmail, clientName, notificationType, document } = req.body

    if (!job || !clientEmail || !message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const portalKey = `portal:${job.id}`
    const payload = {
      type: notificationType || 'quote',
      document: document ?? null,
      jobName: job.name,
      message,
      sentAt: Date.now(),
    }

    await kv.set(portalKey, payload, { ex: 60 * 60 * 24 * 30 })

    const portalUrl = `${APP_URL}/portal/${job.id}`

    await resend.emails.send({
      from: 'datum.ai <onboarding@resend.dev>',
      to: clientEmail,
      subject: `Update on ${job.name}`,
      html: buildEmailTemplate({
        jobName: job.name,
        clientName: clientName || 'there',
        message,
        portalUrl,
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
}: {
  jobName: string
  clientName: string
  message: string
  portalUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Update on ${jobName}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Courier New',Courier,monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border:1px solid #000000;">
          <tr>
            <td style="background:#000000;padding:24px 32px;">
              <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:18px;font-weight:700;color:#ffffff;">datum.ai</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:12px;color:#666666;text-transform:uppercase;letter-spacing:1px;font-family:'Courier New',Courier,monospace;">Job update</p>
              <h1 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#000000;font-family:'Courier New',Courier,monospace;">${jobName}</h1>
              <p style="margin:0 0 16px;font-size:15px;color:#000000;line-height:1.6;font-family:'Courier New',Courier,monospace;">G'day ${clientName},</p>
              <p style="margin:0 0 32px;font-size:15px;color:#000000;line-height:1.6;font-family:'Courier New',Courier,monospace;">${message}</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#000000;border-radius:4px;padding:14px 28px;">
                    <a href="${portalUrl}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;font-family:'Courier New',Courier,monospace;">View job update →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#666666;line-height:1.5;font-family:'Courier New',Courier,monospace;">
                This update was sent via datum.ai — the AI-powered site toolbox for Australian tradies.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#999999;font-family:'Courier New',Courier,monospace;">
                Powered by <a href="https://datum-app.vercel.app" style="color:#999999;">datum.ai</a>
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
