import { api } from './client'
import type { ProductivityReport, Zone, TradeOverlap, Team, Benchmark, EvaluationResult } from '../types'

// ── Existing site-based endpoints ───────────────────────────────────────────
export const runProductivityAnalysis = (siteId: string, videoJobId: string): Promise<ProductivityReport> =>
  api<ProductivityReport>('/api/productivity/analyze', {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, video_job_id: videoJobId }),
    signal: AbortSignal.timeout(60_000),
  })

export const fetchProductivityReport = (siteId: string): Promise<ProductivityReport> =>
  api<ProductivityReport>(`/api/productivity/report/${siteId}`)
export const fetchZones = (siteId: string): Promise<Zone[]> =>
  api<Zone[]>(`/api/productivity/report/${siteId}/zones`)
export const fetchOverlaps = (siteId: string): Promise<TradeOverlap[]> =>
  api<TradeOverlap[]>(`/api/productivity/report/${siteId}/overlaps`)
export const fetchSuggestions = (siteId: string): Promise<string[]> =>
  api<string[]>(`/api/productivity/report/${siteId}/suggestions`)
export const fetchTrend = (siteId: string, hours = 24): Promise<unknown> =>
  api(`/api/productivity/trend/${siteId}?hours=${hours}`)

// ── Teams ───────────────────────────────────────────────────────────────────
export const fetchTeams = (siteId?: string | null): Promise<Team[]> =>
  api<Team[]>(`/api/productivity/teams${siteId ? `?site_id=${siteId}` : ''}`)
export const fetchTeam = (teamId: string): Promise<Team> =>
  api<Team>(`/api/productivity/teams/${teamId}`)

// ── Benchmarks ──────────────────────────────────────────────────────────────
export const fetchBenchmark = (teamId: string, date: string): Promise<Benchmark> =>
  api<Benchmark>(`/api/productivity/teams/${teamId}/benchmark?date=${date}`)

export const fetchBenchmarkVersions = (teamId: string, date: string): Promise<Benchmark[]> =>
  api<Benchmark[]>(`/api/productivity/teams/${teamId}/benchmark/versions?date=${date}`)

export const saveBenchmark = (teamId: string, body: unknown): Promise<Benchmark> =>
  api<Benchmark>(`/api/productivity/teams/${teamId}/benchmark`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

// ── Evaluation (longer timeout — embedding model may take time) ─────────────
export const runEvaluation = (teamId: string, body: unknown): Promise<EvaluationResult> =>
  api<EvaluationResult>(`/api/productivity/teams/${teamId}/evaluate`, {
    method: 'POST',
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  })
