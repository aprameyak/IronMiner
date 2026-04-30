import { api } from './client'
import type { VideoJob } from '../types'

export const uploadVideo = async (
  file: File,
  siteId: string | null,
  uploadedBy: string | null,
  frameInterval = 5.0,
): Promise<VideoJob> => {
  const form = new FormData()
  form.append('file', file)
  if (siteId) form.append('site_id', siteId)
  if (uploadedBy) form.append('uploaded_by', uploadedBy)
  form.append('frame_interval', frameInterval.toString())
  const res = await fetch('/api/video/upload', { method: 'POST', body: form })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json() as Promise<VideoJob>
}

export const fetchJobs = (siteId?: string | null, status?: string | null): Promise<VideoJob[]> => {
  const params = new URLSearchParams()
  if (siteId) params.set('site_id', siteId)
  if (status) params.set('status', status)
  return api<VideoJob[]>(`/api/video/jobs?${params}`)
}

export const fetchJob = (jobId: string): Promise<VideoJob> =>
  api<VideoJob>(`/api/video/jobs/${jobId}`)
export const fetchJobResult = (jobId: string): Promise<VideoJob> =>
  api<VideoJob>(`/api/video/jobs/${jobId}/result`)
