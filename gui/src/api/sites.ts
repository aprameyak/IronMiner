import { api } from './client'
import type { Site, Zone, TimelineEntry } from '../types'

interface CreateSiteData {
  name: string
  address?: string
  [key: string]: unknown
}

interface BriefingResponse {
  text: string
}

export const fetchSites = (): Promise<Site[]> => api<Site[]>('/api/sites')
export const fetchSite = (id: string): Promise<Site> => api<Site>(`/api/sites/${id}`)
export const createSite = (data: CreateSiteData): Promise<Site> =>
  api<Site>('/api/sites', { method: 'POST', body: JSON.stringify(data) })
export const fetchFrames = (id: string, limit = 50): Promise<unknown[]> =>
  api<unknown[]>(`/api/sites/${id}/frames?limit=${limit}`)
export const fetchBriefing = (id: string): Promise<BriefingResponse> =>
  api<BriefingResponse>(`/api/sites/${id}/briefing`)
export const fetchTimeline = (id: string): Promise<TimelineEntry[]> =>
  api<TimelineEntry[]>(`/api/sites/${id}/timeline`)
