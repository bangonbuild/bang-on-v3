import { useCallback, useEffect, useState } from 'react'
import type { Job, TimelineEntry } from '../types'
import { generateId, loadJson, saveJson, STORAGE_KEYS } from '../utils/storage'

const MAX_JOBS = 20

const EXAMPLE_JOB: Job = {
  id: 'example-1',
  name: 'Riverside Rd Reno',
  client: 'Sarah Mitchell',
  phone: '',
  address: '',
  status: 'active',
  attention: 'Plumbing done — ready for pour',
  timeline: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

function initJobs(): Job[] {
  const stored = loadJson<Job[]>(STORAGE_KEYS.jobs, [])
  if (stored.length === 0) return [EXAMPLE_JOB]
  return stored
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(initJobs)

  useEffect(() => {
    saveJson(STORAGE_KEYS.jobs, jobs.slice(0, MAX_JOBS))
  }, [jobs])

  const addJob = useCallback((job: Omit<Job, 'id' | 'timeline' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now()
    const newJob: Job = {
      ...job,
      id: generateId(),
      timeline: [],
      createdAt: now,
      updatedAt: now,
    }
    setJobs((prev) => [newJob, ...prev].slice(0, MAX_JOBS))
    return newJob
  }, [])

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, ...updates, updatedAt: Date.now() } : j,
      ),
    )
  }, [])

  const deleteJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  const addTimelineEntry = useCallback((jobId: string, entry: Omit<TimelineEntry, 'id' | 'timestamp'>) => {
    const entryFull: TimelineEntry = {
      ...entry,
      id: generateId(),
      timestamp: Date.now(),
    }
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              timeline: [entryFull, ...j.timeline],
              updatedAt: Date.now(),
            }
          : j,
      ),
    )
    return entryFull
  }, [])

  const updateTimelineEntry = useCallback(
    (jobId: string, entryId: string, updates: Partial<TimelineEntry>) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                timeline: j.timeline.map((e) =>
                  e.id === entryId ? { ...e, ...updates } : e,
                ),
                updatedAt: Date.now(),
              }
            : j,
        ),
      )
    },
    [],
  )

  const getJob = useCallback(
    (id: string) => jobs.find((j) => j.id === id),
    [jobs],
  )

  return {
    jobs,
    addJob,
    updateJob,
    deleteJob,
    addTimelineEntry,
    updateTimelineEntry,
    getJob,
  }
}
