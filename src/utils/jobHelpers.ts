import type { Job } from '../types'

export function buildJobContext(job: Job): string {
  const recentNotes = job.timeline
    .filter((e) => e.type === 'note')
    .slice(0, 3)
    .map((e) => e.content)
    .join(', ')

  return `
Job: ${job.name}
Client: ${job.client}
Address: ${job.address || 'Not set'}
Status: ${job.status}
Recent notes: ${recentNotes || 'None'}
`.trim()
}
