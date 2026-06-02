import { useCallback, useEffect, useState } from 'react'
import type { PhotoReportResult, SavedPhotoReport } from '../types'
import { generateId, loadJson, saveJson, STORAGE_KEYS } from '../utils/storage'

export function usePhotoReports() {
  const [reports, setReports] = useState<SavedPhotoReport[]>(() =>
    loadJson<SavedPhotoReport[]>(STORAGE_KEYS.photoReports, []),
  )

  useEffect(() => {
    saveJson(STORAGE_KEYS.photoReports, reports)
  }, [reports])

  const addFromResult = useCallback(
    (
      result: PhotoReportResult,
      opts?: { jobId?: string; jobName?: string; client?: string; photoData?: string[] },
    ) => {
      const report: SavedPhotoReport = {
        id: generateId(),
        jobId: opts?.jobId,
        jobName: opts?.jobName ?? result.jobName,
        client: opts?.client,
        photos: opts?.photoData ?? result.photos.map((p) => p.imageUrl),
        captions: result.photos.map((p) => p.caption),
        reportText: result.summary,
        createdAt: Date.now(),
      }
      setReports((prev) => [report, ...prev])
      return report
    },
    [],
  )

  const deleteReport = useCallback((id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const getReport = useCallback((id: string) => reports.find((r) => r.id === id), [reports])

  return {
    reports,
    addFromResult,
    deleteReport,
    getReport,
  }
}
