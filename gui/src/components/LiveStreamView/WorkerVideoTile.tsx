import { useRef, useEffect } from 'react'
import { C } from '../../utils/colors'

interface WorkerVideoTileProps {
  identity: string
  participant: any
  videoTrack: any
  audioTrack: any
  isSelected: boolean
  onClick: () => void
}

export default function WorkerVideoTile({ identity, participant, videoTrack, audioTrack, isSelected, onClick }: WorkerVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el || !videoTrack) return
    videoTrack.attach(el)
    return () => { videoTrack.detach(el) }
  }, [videoTrack])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !audioTrack) return
    audioTrack.attach(el)
    const p = el.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
    return () => { audioTrack.detach(el) }
  }, [audioTrack])

  const displayName = participant?.name || identity
  const isMuted = participant?.isMicrophoneEnabled === false

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', borderRadius: 10, overflow: 'hidden',
        border: `2px solid ${isSelected ? C.orange : C.border}`,
        background: C.surface, cursor: 'pointer',
        transition: 'border-color 0.2s', aspectRatio: '16/9',
      }}
    >
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: videoTrack ? 'block' : 'none' }} />
      <audio ref={audioRef} className="worker-audio" autoPlay playsInline style={{ display: 'none' }} />

      {!videoTrack && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 28 }}>⛑️</div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: 'var(--mono)' }}>CONNECTING...</div>
        </div>
      )}

      <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: 4 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: videoTrack ? C.red : C.muted, animation: videoTrack ? 'pulse 1.5s infinite' : 'none' }} />
        <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--mono)', color: videoTrack ? '#FCA5A5' : C.muted, letterSpacing: '0.08em' }}>
          {videoTrack ? 'LIVE' : 'WAIT'}
        </span>
      </div>

      {isMuted && (
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', padding: '3px 6px', borderRadius: 4, fontSize: 11 }}>
          🔇
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{displayName}</div>
        <div style={{ fontSize: 10, color: C.muted }}>Helmet Cam</div>
      </div>
    </div>
  )
}
