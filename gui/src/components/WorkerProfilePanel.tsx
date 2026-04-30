import { useState, useEffect, useCallback } from 'react'
import { fetchWorkerHistory } from '../api/teams'
import { MOCK_WORKER_HISTORY } from '../utils/mockData'
import type { SiteWorker } from '../types'

const TRADE_COLORS: Record<string, { bg: string; text: string }> = {
  'Concrete':       { bg: 'rgba(96,165,250,0.14)',  text: '#93c5fd' },
  'Electrical':     { bg: 'rgba(250,204,21,0.14)',  text: '#fde047' },
  'Plumbing':       { bg: 'rgba(52,211,153,0.14)',  text: '#6ee7b7' },
  'Framing':        { bg: 'rgba(251,146,60,0.14)',  text: '#fdba74' },
  'HVAC':           { bg: 'rgba(167,139,250,0.14)', text: '#c4b5fd' },
  'Crane Ops':      { bg: 'rgba(251,191,36,0.14)',  text: '#fcd34d' },
  'Delivery':       { bg: 'rgba(148,163,184,0.14)', text: '#cbd5e1' },
  'Steel Erection': { bg: 'rgba(239,68,68,0.14)',   text: '#fca5a5' },
  'Staging':        { bg: 'rgba(156,163,175,0.14)', text: '#d1d5db' },
  'Cladding':       { bg: 'rgba(20,184,166,0.14)',  text: '#5eead4' },
}

const SEVERITY_COLOR: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#60a5fa' }

const FLAG_CONFIG: Record<string, { icon: string | null; label: string; color: string; bg: string; border: string }> = {
  reward:         { icon: '🏆', label: 'Reward',         color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.2)'  },
  needs_training: { icon: '⚠',  label: 'Needs Training', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' },
  neutral:        { icon: null,  label: 'Clean record',   color: '#475569', bg: 'rgba(71,85,105,0.12)',  border: 'rgba(71,85,105,0.2)'  },
}

interface WorkerHistoryAlert {
  id: string
  severity: string
  title: string
}

interface WorkerHistoryDay {
  date: string
  team_name: string
  zone: string
  task: string
  alert_count: number
  alerts: WorkerHistoryAlert[]
}

interface WorkerSignals {
  days_assigned: number
  total_alerts: number
  safety_alerts: number
  productivity_alerts: number
  flag: string
}

interface WorkerHistoryData {
  worker: SiteWorker
  history: WorkerHistoryDay[]
  signals: WorkerSignals
}

function shortDate(isoStr: string): string {
  return new Date(isoStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function synthNeutral(worker: SiteWorker): WorkerHistoryData {
  return {
    worker,
    history: Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i)
      return { date: d.toISOString().split('T')[0], team_name: '', zone: '', task: '', alert_count: 0, alerts: [] }
    }),
    signals: { days_assigned: 0, total_alerts: 0, safety_alerts: 0, productivity_alerts: 0, flag: 'neutral' },
  }
}

interface WorkerProfilePanelProps {
  worker: SiteWorker
  siteId: string
  onClose: () => void
}

export default function WorkerProfilePanel({ worker, siteId, onClose }: WorkerProfilePanelProps) {
  const [data, setData]       = useState<WorkerHistoryData | null>(null)
  const [loading, setLoading] = useState(true)

  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (!worker || !siteId) return
    setLoading(true)
    setData(null)
    fetchWorkerHistory(worker.id, siteId)
      .then(d => { setData(d as WorkerHistoryData); setLoading(false) })
      .catch(() => {
        const fallback = (MOCK_WORKER_HISTORY as Record<string, WorkerHistoryData>)[worker.id] || synthNeutral(worker)
        setData(fallback)
        setLoading(false)
      })
  }, [worker?.id, siteId])

  const tradeColor = TRADE_COLORS[worker.trade] || { bg: 'rgba(255,255,255,0.08)', text: '#94a3b8' }
  const today      = data?.history?.[0]
  const signals    = data?.signals
  const flagCfg    = FLAG_CONFIG[signals?.flag ?? 'neutral'] || FLAG_CONFIG.neutral
  const initials   = worker.name.split('.')[0]

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 100,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: 420, height: '100vh',
        background: '#0B0E13',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        zIndex: 101,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
        animation: 'panelSlideIn 0.22s ease-out',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            background: tradeColor.bg,
            border: `1px solid ${tradeColor.text}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: tradeColor.text,
          }}>
            {initials}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>{worker.name}</div>
            <div style={{
              display: 'inline-block', marginTop: 3,
              fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 4,
              background: tradeColor.bg, color: tradeColor.text,
              fontFamily: 'var(--mono)', letterSpacing: '0.04em',
            }}>
              {worker.trade}
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close (Esc)"
            style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', color: '#94a3b8', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
            onMouseOut={e =>  { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#475569', fontSize: 13 }}>
              Loading history…
            </div>
          )}

          {!loading && data && (
            <>
              {/* Today */}
              <div style={{ marginTop: 20 }}>
                <SectionLabel>Today</SectionLabel>
                {today?.team_name ? (
                  <div style={{
                    padding: '14px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
                      {today.team_name}
                    </div>
                    {today.zone && <MetaRow label="Zone" value={today.zone} />}
                    {today.task && <MetaRow label="Task" value={today.task} />}
                    {today.alerts.map(a => <AlertPill key={a.id} alert={a} />)}
                  </div>
                ) : (
                  <div style={{
                    padding: '14px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.06)',
                    fontSize: 13, color: '#334155', fontStyle: 'italic',
                  }}>
                    Not assigned today
                  </div>
                )}
              </div>

              {/* Signal */}
              {signals && (
                <div style={{ marginTop: 24 }}>
                  <SectionLabel>7-Day Signal</SectionLabel>
                  <div style={{
                    padding: '14px 16px', borderRadius: 10,
                    background: flagCfg.bg, border: `1px solid ${flagCfg.border}`,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    {flagCfg.icon && <div style={{ fontSize: 22, lineHeight: 1 }}>{flagCfg.icon}</div>}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: flagCfg.color }}>
                        {flagCfg.label}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                        {signals.days_assigned} days assigned · {signals.total_alerts} alert{signals.total_alerts !== 1 ? 's' : ''}
                        {signals.safety_alerts > 0 ? ` (${signals.safety_alerts} safety)` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 7-day history */}
              <div style={{ marginTop: 24 }}>
                <SectionLabel>Last 7 Days</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.history.map((h, i) => <HistoryRow key={h.date} day={h} isToday={i === 0} />)}
                </div>
              </div>
            </>
          )}
        </div>

        <style>{`
          @keyframes panelSlideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>
      </div>
    </>
  )
}

interface SectionLabelProps {
  children: React.ReactNode
}

function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div style={{
      fontSize: 9, color: '#475569', textTransform: 'uppercase',
      letterSpacing: '0.1em', fontFamily: 'var(--mono)', marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

interface MetaRowProps {
  label: string
  value: string
}

function MetaRow({ label, value }: MetaRowProps) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'baseline' }}>
      <span style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--mono)', flexShrink: 0, width: 38 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{value}</span>
    </div>
  )
}

interface AlertPillProps {
  alert: WorkerHistoryAlert
}

function AlertPill({ alert }: AlertPillProps) {
  const color = SEVERITY_COLOR[alert.severity] || '#94a3b8'
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 6,
      padding: '6px 8px', borderRadius: 6, marginTop: 8,
      background: `${color}11`, border: `1px solid ${color}33`,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginTop: 4, flexShrink: 0 }} />
      <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
        <span style={{ color, fontWeight: 600 }}>{alert.severity} · </span>
        {alert.title}
      </div>
    </div>
  )
}

interface HistoryRowProps {
  day: WorkerHistoryDay
  isToday: boolean
}

function HistoryRow({ day, isToday }: HistoryRowProps) {
  const assigned = Boolean(day.team_name)
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '90px 1fr auto',
      gap: 10, alignItems: 'center',
      padding: '8px 10px', borderRadius: 8,
      background: isToday ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)',
      border:     isToday ? '1px solid rgba(249,115,22,0.15)' : '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        fontSize: 11, fontFamily: 'var(--mono)',
        color: isToday ? '#fb923c' : '#64748b',
        fontWeight: isToday ? 700 : 400,
      }}>
        {shortDate(day.date)}
      </div>

      <div style={{ minWidth: 0 }}>
        {assigned ? (
          <>
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#e2e8f0',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {day.team_name}
            </div>
            {day.zone && (
              <div style={{
                fontSize: 10, color: '#475569', fontFamily: 'var(--mono)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {day.zone.split('—')[0].trim()}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 12, color: '#334155', fontStyle: 'italic' }}>—</div>
        )}
      </div>

      {day.alert_count > 0 ? (
        <div style={{
          fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 700,
          color: '#fca5a5', background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.2)',
          padding: '2px 7px', borderRadius: 4, flexShrink: 0,
        }}>
          {day.alert_count} alert{day.alert_count !== 1 ? 's' : ''}
        </div>
      ) : assigned ? (
        <div style={{
          fontSize: 10, fontFamily: 'var(--mono)',
          color: '#22c55e', background: 'rgba(34,197,94,0.08)',
          padding: '2px 7px', borderRadius: 4, flexShrink: 0,
        }}>
          clear
        </div>
      ) : (
        <div style={{ width: 50 }} />
      )}
    </div>
  )
}
