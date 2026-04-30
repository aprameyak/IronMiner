import { useState, useEffect } from 'react'
import { C } from '../../utils/colors'
import { fetchWorkers } from '../../api/streaming'
import type { WorkerStream } from '../../hooks/useLiveStream'

interface WorkerEntry {
  identity: string
  display_name: string
  status: string
}

const STATUS_COLOR: Record<string, string> = {
  online: C.green,
  streaming: C.orange,
  offline: C.muted,
}

interface WorkerSelectorProps {
  siteId: string | null
  selectedIdentity: string | null
  workerStreams: Map<string, WorkerStream>
  onSelectWorker: (identity: string) => void
}

export default function WorkerSelector({ siteId, selectedIdentity, workerStreams, onSelectWorker }: WorkerSelectorProps) {
  const [workers, setWorkers] = useState<WorkerEntry[]>([])

  useEffect(() => {
    if (!siteId) return
    const load = () => fetchWorkers(siteId).then(setWorkers).catch(() => {})
    load()
    const interval = setInterval(load, 10_000)
    return () => clearInterval(interval)
  }, [siteId])

  if (workers.length === 0) return null

  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 4 }}>
        Workers ({workers.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {workers.map(worker => {
          const isLive = workerStreams.has(worker.identity)
          const isSelected = selectedIdentity === worker.identity
          return (
            <button
              key={worker.identity}
              onClick={() => onSelectWorker(worker.identity)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8,
                border: `1px solid ${isSelected ? C.orange : C.border}`,
                background: isSelected ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: isLive ? C.orange : (STATUS_COLOR[worker.status] || C.muted),
                animation: isLive ? 'pulse 1.5s infinite' : 'none',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {worker.display_name}
                </div>
                <div style={{ fontSize: 10, color: C.muted }}>{isLive ? 'Live now' : worker.status}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
