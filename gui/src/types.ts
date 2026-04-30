// ── Site & Zone ────────────────────────────────────────────────────────
export type ZoneStatus = 'ok' | 'warning' | 'critical'
export type CongestionLevel = 'low' | 'medium' | 'high'

export interface Zone {
  zone: string
  congestion: number
  trades: string[]
  workers: number
  status: ZoneStatus
}

export interface Site {
  id: string
  name: string
  address: string
  status: string
  progress: number
  congestion: CongestionLevel
  trades: number
  workers: number
  frames: number
  last_scan: string
  zones: Zone[]
}

// ── Alerts ─────────────────────────────────────────────────────────────
export type Severity = 'high' | 'medium' | 'low'

export interface Alert {
  id: string
  site_id: string
  site_name: string
  severity: Severity
  title: string
  detail: string
  source_agent: string
  acknowledged: boolean
  created_at: string
}

// ── Streaming / Feeds ──────────────────────────────────────────────────
export interface FeedConfig {
  id: string
  label: string
  site_id: string
  site_name: string
  worker?: string
  type: string
  auto_scan: boolean
  scan_interval: number
}

// ── Video ──────────────────────────────────────────────────────────────
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface FrameData {
  id: string
  site_id: string
  timestamp: number
  image_data: string
  filename: string
}

export interface VideoJob {
  job_id: string
  status: JobStatus
  site_id: string
  filename?: string
  uploaded_by?: string
  file_path?: string
  total_frames?: number
  processed_frames: number
  frames: FrameData[]
  created_at: string
  error?: string
}

// ── Safety ─────────────────────────────────────────────────────────────
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

export interface SafetyViolation {
  zone: string
  type: string
  severity: Severity
  description: string
  workers_affected: number
}

export interface SafetyReport {
  site_id: string
  violations: SafetyViolation[]
  ppe_compliance: Record<string, boolean>
  zone_adherence: Record<string, boolean>
  overall_risk: RiskLevel
  summary: string
  generated_at: string
}

// ── Productivity ───────────────────────────────────────────────────────
export interface TradeOverlap {
  zone: string
  trades: string[]
  overlap_score: number
  description: string
}

export interface ProductivityReport {
  site_id: string
  zones: Zone[]
  trade_overlaps: TradeOverlap[]
  congestion_trend: string
  resource_suggestions: string[]
  summary: string
  generated_at: string
}

// ── Teams ──────────────────────────────────────────────────────────────
export type WorkerFlag = 'reward' | 'needs_training' | 'standard' | null

export interface SiteWorker {
  id: string
  name: string
  trade: string
  flag: WorkerFlag
  site_id: string
  days_assigned: number
  total_alerts: number
}

export interface Team {
  id: string
  site_id: string
  date: string
  name: string
  task: string
  zone: string
  worker_ids: string[]
  color_index: number
}

// ── Benchmarks & Evaluation ────────────────────────────────────────────
export interface BenchmarkGoal {
  id: string
  description: string
  category: string
}

export interface Benchmark {
  team_id: string
  date: string
  version: number
  goals: BenchmarkGoal[]
  created_at: string
  updated_at: string
}

export interface GoalResult {
  goal_id: string
  goal_text: string
  passed: boolean
  score: number
  best_evidence: string
}

export interface EvaluationResult {
  team_id: string
  date: string
  benchmark_version: number
  overall_score: number
  completed_count: number
  incomplete_count: number
  total_goals: number
  goal_results: GoalResult[]
  gap_summary: string
  evaluated_at: string
}

// ── Auto-assign ────────────────────────────────────────────────────────
export interface AutoAssignEntry {
  worker_id: string
  team_id: string
  reason: string
  worker_name: string
  team_name: string
}

export interface AutoAssignPlan {
  assignments: AutoAssignEntry[]
  unassigned_worker_ids: string[]
  summary: string
  used_ai: boolean
}

// ── Timeline ───────────────────────────────────────────────────────────
export interface TimelineEntry {
  id: string
  who: string
  timestamp: string
  source: 'manual' | 'upload' | 'agent'
  video: string | null
  action: string
  ai_summary: string | null
}

// ── Token ──────────────────────────────────────────────────────────────
export interface TokenResponse {
  token: string
  room_name: string
  livekit_url: string
}
