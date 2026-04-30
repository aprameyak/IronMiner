import { api } from './client'
import type { SafetyReport, SafetyViolation } from '../types'

export const runSafetyAnalysis = (siteId: string, videoJobId: string): Promise<SafetyReport> =>
  api<SafetyReport>('/api/safety/analyze', {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, video_job_id: videoJobId }),
    signal: AbortSignal.timeout(60_000),
  })

export const fetchSafetyReport = (siteId: string): Promise<SafetyReport> =>
  api<SafetyReport>(`/api/safety/report/${siteId}`)

export const fetchViolations = (siteId: string, severity?: string): Promise<SafetyViolation[]> => {
  const params = severity ? `?severity=${severity}` : ''
  return api<SafetyViolation[]>(`/api/safety/report/${siteId}/violations${params}`)
}
