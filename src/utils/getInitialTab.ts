import type { TabId } from '../types'
import { STORAGE_KEYS } from './storage'

export function getInitialTab(): TabId {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.jobs) ?? '[]'
    const jobs = JSON.parse(raw) as unknown[]
    if (Array.isArray(jobs) && jobs.length > 0) return 'jobs'
  } catch {
    // ignore parse errors
  }
  return 'home'
}
