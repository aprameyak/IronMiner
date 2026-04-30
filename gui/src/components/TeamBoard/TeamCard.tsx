import { useState, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Team, SiteWorker, Zone } from '../../types'

const TEAM_COLORS = [
  '#F97316', '#3B82F6', '#8B5CF6', '#10B981',
  '#F59E0B', '#EC4899', '#06B6D4', '#84CC16',
]

const TRADE_TEXT: Record<string, string> = {
  'Concrete': '#93c5fd', 'Electrical': '#fde047', 'Plumbing': '#6ee7b7',
  'Framing': '#fdba74', 'HVAC': '#c4b5fd', 'Crane Ops': '#fcd34d',
  'Delivery': '#cbd5e1', 'Steel Erection': '#fca5a5', 'Staging': '#d1d5db',
  'Cladding': '#5eead4',
}

interface TeamCardProps {
  team: Team
  workers: SiteWorker[]
  zones: Zone[]
  onUpdate: (patch: Partial<Team>) => void
  onDelete: () => void
  onRemoveWorker: (workerId: string) => void
  onWorkerClick?: (worker: SiteWorker) => void
  onAutoAssign?: () => void
  autoAssigning: boolean
}

export default function TeamCard({ team, workers, zones, onUpdate, onDelete, onRemoveWorker, onWorkerClick, onAutoAssign, autoAssigning }: TeamCardProps) {
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(team.name)
  const [taskVal, setTaskVal] = useState(team.task || '')
  const nameInputRef = useRef<HTMLInputElement>(null)

  const { setNodeRef, isOver } = useDroppable({ id: `team-${team.id}` })

  const color = TEAM_COLORS[team.color_index % TEAM_COLORS.length]

  const saveName = () => {
    setEditingName(false)
    if (nameVal.trim() && nameVal !== team.name) onUpdate({ name: nameVal.trim() })
  }

  const saveTask = () => {
    if (taskVal !== team.task) onUpdate({ task: taskVal })
  }

  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.07)',
      borderLeft: `4px solid ${color}`,
      background: 'rgba(255,255,255,0.02)',
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      {/* ── Card header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: color, boxShadow: `0 0 8px ${color}88` }} />

        {editingName ? (
          <input
            ref={nameInputRef}
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            autoFocus
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: `1px solid ${color}66`, borderRadius: 6, padding: '4px 8px', fontSize: 15, fontWeight: 700, color: '#f1f5f9', outline: 'none', fontFamily: 'inherit' }}
          />
        ) : (
          <div
            onClick={() => { setEditingName(true); setTimeout(() => nameInputRef.current?.focus(), 0) }}
            title="Click to rename"
            style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#f1f5f9', cursor: 'text', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            {team.name}
          </div>
        )}

        <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 4, flexShrink: 0 }}>
          {workers.length} {workers.length === 1 ? 'worker' : 'workers'}
        </span>

        {onAutoAssign && (
          <button
            type="button"
            onClick={onAutoAssign}
            disabled={autoAssigning}
            title="Suggest workers for this team"
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.12)', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: autoAssigning ? 'not-allowed' : 'pointer', opacity: autoAssigning ? 0.6 : 1, transition: 'opacity 0.15s' }}
          >
            {autoAssigning ? '…' : '✦'} Suggest
          </button>
        )}

        <button
          onClick={onDelete}
          title="Remove this team"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 16, padding: '4px 6px', borderRadius: 6, lineHeight: 1, transition: 'color 0.15s' }}
          onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
          onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.color = '#475569'}
        >
          ✕
        </button>
      </div>

      {/* ── Task + Zone fields ───────────────────────────────────────────── */}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)', display: 'block', marginBottom: 4 }}>
            Task
          </label>
          <textarea
            value={taskVal}
            onChange={e => setTaskVal(e.target.value)}
            onBlur={saveTask}
            placeholder="What is this team doing today?"
            rows={2}
            style={{ width: '100%', resize: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#e2e8f0', lineHeight: 1.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
            onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = `${color}55`}
            onBlurCapture={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        <div style={{ flex: '0 1 220px' }}>
          <label style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)', display: 'block', marginBottom: 4 }}>
            Zone
          </label>
          <select
            value={team.zone || ''}
            onChange={e => onUpdate({ zone: e.target.value })}
            style={{ width: '100%', background: '#141924', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: team.zone ? '#e2e8f0' : '#64748b', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', colorScheme: 'dark' }}
          >
            <option value="">— Pick a zone —</option>
            {zones.map(z => <option key={z.zone} value={z.zone}>{z.zone}</option>)}
          </select>
        </div>
      </div>

      {/* ── Drop zone + worker chips ─────────────────────────────────────── */}
      <div
        ref={setNodeRef}
        style={{
          margin: 12, minHeight: 60, borderRadius: 8,
          border: isOver ? `2px solid ${color}` : '1.5px dashed rgba(255,255,255,0.08)',
          background: isOver ? `${color}0f` : 'rgba(255,255,255,0.01)',
          padding: '10px 12px',
          transition: 'border-color 0.15s, background 0.15s',
          display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
        }}
      >
        {workers.length === 0 ? (
          <span style={{ width: '100%', textAlign: 'center', fontSize: 12, color: '#334155', fontStyle: 'italic' }}>
            Drop workers here ↓
          </span>
        ) : (
          workers.map(w => (
            <WorkerChip
              key={w.id}
              worker={w}
              color={color}
              onRemove={() => onRemoveWorker(w.id)}
              onWorkerClick={onWorkerClick ? () => onWorkerClick(w) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface WorkerChipProps {
  worker: SiteWorker
  color: string
  onRemove: () => void
  onWorkerClick?: () => void
}

function WorkerChip({ worker, onRemove, onWorkerClick }: WorkerChipProps) {
  const dotColor = TRADE_TEXT[worker.trade] || '#94a3b8'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px 5px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', fontSize: 12, fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      <span
        onClick={onWorkerClick}
        style={{ cursor: onWorkerClick ? 'pointer' : 'default', transition: 'color 0.1s' }}
        onMouseOver={e => { if (onWorkerClick) (e.currentTarget as HTMLSpanElement).style.color = '#fb923c' }}
        onMouseOut={e => { if (onWorkerClick) (e.currentTarget as HTMLSpanElement).style.color = '#e2e8f0' }}
      >
        {worker.name}
      </span>
      <button
        onClick={onRemove}
        title="Return to unassigned"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 13, padding: 0, lineHeight: 1, marginLeft: 2, transition: 'color 0.1s' }}
        onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
        onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.color = '#475569'}
      >
        ✕
      </button>
    </div>
  )
}
