import { api, wsUrl } from './client'
import type { FeedConfig, TokenResponse } from '../types'

export const fetchFeeds = (siteId?: string | null): Promise<FeedConfig[]> => {
  const params = siteId ? `?site_id=${siteId}` : ''
  return api<FeedConfig[]>(`/api/streaming/feeds${params}`)
}

export const registerFeed = (data: Partial<FeedConfig>): Promise<FeedConfig> =>
  api<FeedConfig>('/api/streaming/feeds', { method: 'POST', body: JSON.stringify(data) })

export const scanFeed = (feedId: string): Promise<unknown> =>
  api(`/api/streaming/feeds/${feedId}/scan`, { method: 'POST' })

export const toggleAutoScan = (
  feedId: string,
  enabled: boolean,
  intervalSeconds = 30,
): Promise<unknown> =>
  api(`/api/streaming/feeds/${feedId}/auto-scan`, {
    method: 'POST',
    body: JSON.stringify({ enabled, interval_seconds: intervalSeconds }),
  })

export const connectLiveFeed = (feedId: string): WebSocket =>
  new WebSocket(wsUrl(`/api/streaming/ws/live/${feedId}`))
export const connectAlerts = (): WebSocket =>
  new WebSocket(wsUrl('/api/streaming/ws/alerts'))
export const connectComms = (feedId: string): WebSocket =>
  new WebSocket(wsUrl(`/api/streaming/ws/comms/${feedId}`))
export const connectPipeline = (siteId: string): WebSocket =>
  new WebSocket(wsUrl(`/api/streaming/ws/pipeline/${siteId}`))

// ── LiveKit API calls ─────────────────────────────────────────────────────────

export const fetchManagerToken = (
  roomName: string,
  identity: string,
  displayName = '',
): Promise<TokenResponse> =>
  api<TokenResponse>('/api/streaming/livekit/token/manager', {
    method: 'POST',
    body: JSON.stringify({ room_name: roomName, identity, display_name: displayName }),
  })

export const fetchWorkerToken = (
  roomName: string,
  identity: string,
  displayName = '',
): Promise<TokenResponse> =>
  api<TokenResponse>('/api/streaming/livekit/token/worker', {
    method: 'POST',
    body: JSON.stringify({ room_name: roomName, identity, display_name: displayName }),
  })

export const fetchWorkers = (siteId?: string | null): Promise<unknown[]> => {
  const params = siteId ? `?site_id=${siteId}` : ''
  return api<unknown[]>(`/api/workers${params}`)
}
