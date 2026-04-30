import { ConnectionState } from 'livekit-client'
import { C } from '../../utils/colors'

interface StateConfig {
  color: string
  label: string
  pulse: boolean
}

const STATE_CONFIG: Record<string, StateConfig> = {
  [ConnectionState.Connecting]:   { color: C.yellow, label: 'Connecting...',    pulse: true },
  [ConnectionState.Connected]:    { color: C.green,  label: 'Connected',        pulse: false },
  [ConnectionState.Reconnecting]: { color: C.yellow, label: 'Reconnecting...', pulse: true },
  [ConnectionState.Disconnected]: { color: C.muted,  label: 'Disconnected',     pulse: false },
}

interface ConnectionStatusProps {
  connectionState: ConnectionState
  participantCount: number
}

export default function ConnectionStatus({ connectionState, participantCount }: ConnectionStatusProps) {
  const config = STATE_CONFIG[connectionState] || STATE_CONFIG[ConnectionState.Disconnected]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'rgba(0,0,0,0.6)', padding: '4px 10px',
      borderRadius: 6, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: config.color,
        animation: config.pulse ? 'pulse 1.5s infinite' : 'none',
      }} />
      <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'var(--mono)', color: config.color, letterSpacing: '0.06em' }}>
        {config.label}
      </span>
      {connectionState === ConnectionState.Connected && participantCount > 0 && (
        <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: C.muted }}>
          · {participantCount} worker{participantCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
