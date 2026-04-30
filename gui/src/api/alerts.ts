import { api } from './client'
import type { Alert } from '../types'

interface AlertFilters {
  site_id?: string
  severity?: string
  acknowledged?: boolean
  limit?: number
}

export const fetchAlerts = (filters: AlertFilters = {}): Promise<Alert[]> => {
  const params = new URLSearchParams()
  if (filters.site_id) params.set('site_id', filters.site_id)
  if (filters.severity) params.set('severity', filters.severity)
  if (filters.acknowledged !== undefined) params.set('acknowledged', String(filters.acknowledged))
  if (filters.limit) params.set('limit', String(filters.limit))
  return api<Alert[]>(`/api/alerts?${params}`)
}

export const fetchAlert = (id: string): Promise<Alert> => api<Alert>(`/api/alerts/${id}`)
export const acknowledgeAlert = (id: string): Promise<Alert> =>
  api<Alert>(`/api/alerts/${id}/acknowledge`, { method: 'PATCH' })
