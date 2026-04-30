import { api } from './client'
import type { SiteWorker, Team, AutoAssignPlan } from '../types'

export const fetchSiteWorkers = (siteId: string): Promise<SiteWorker[]> =>
  api<SiteWorker[]>(`/api/teams/workers?site_id=${siteId}`)

export const fetchTeams = (siteId: string, date: string): Promise<Team[]> =>
  api<Team[]>(`/api/teams?site_id=${siteId}&date=${date}`)

/** Create a team. Pass date (ISO string) so it's stored under the same day you're viewing. */
export const createTeam = (data: Partial<Team>, date?: string): Promise<Team> =>
  api<Team>(
    `/api/teams?date=${date || new Date().toISOString().split('T')[0]}`,
    { method: 'POST', body: JSON.stringify(data) },
  )

export const updateTeam = (teamId: string, patch: Partial<Team>): Promise<Team> =>
  api<Team>(`/api/teams/${teamId}`, { method: 'PUT', body: JSON.stringify(patch) })

export const deleteTeam = (teamId: string): Promise<null> =>
  api<null>(`/api/teams/${teamId}`, { method: 'DELETE' })

export const fetchWorkerHistory = (
  workerId: string,
  siteId: string,
  days = 7,
): Promise<unknown> =>
  api(`/api/teams/workers/${workerId}/history?site_id=${siteId}&days=${days}`)

// Auto-assign can call the LLM — use a long timeout (default api is 10s)
export const autoAssignWorkers = (
  siteId: string,
  date: string,
  teamId?: string | null,
): Promise<AutoAssignPlan> => {
  const params = new URLSearchParams({ site_id: siteId, date })
  if (teamId) params.set('team_id', teamId)
  return api<AutoAssignPlan>(`/api/teams/auto-assign?${params}`, {
    method: 'POST',
    signal: AbortSignal.timeout(60_000),
  })
}
