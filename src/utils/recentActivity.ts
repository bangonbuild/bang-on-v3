import type { Job, TimelineEntryType } from '../types'
import { formatRelativeTime } from './storage'

export interface RecentActivityItem {
  id: string
  jobId: string
  jobName: string
  type: TimelineEntryType
  timestamp: number
  description: string
  timeLabel: string
}

function activityDescription(type: TimelineEntryType, jobName: string): string {
  switch (type) {
    case 'note':
      return `Note added to ${jobName}`
    case 'photo':
      return `Photo added to ${jobName}`
    case 'quote':
      return `Quote generated for ${jobName}`
    case 'invoice':
      return `Invoice generated for ${jobName}`
    case 'photo-report':
      return `Photo report for ${jobName}`
    default:
      return `Activity on ${jobName}`
  }
}

export function formatActivityTime(ts: number): string {
  const date = new Date(ts)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  if (date.toDateString() === now.toDateString()) return formatRelativeTime(ts)

  const days = Math.floor((now.getTime() - ts) / 86400000)
  return `${days}d ago`
}

export function getRecentActivity(jobs: Job[], limit = 4): RecentActivityItem[] {
  const items: RecentActivityItem[] = []

  for (const job of jobs) {
    for (const entry of job.timeline) {
      items.push({
        id: entry.id,
        jobId: job.id,
        jobName: job.name,
        type: entry.type,
        timestamp: entry.timestamp,
        description: activityDescription(entry.type, job.name),
        timeLabel: formatActivityTime(entry.timestamp),
      })
    }
  }

  return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
}
