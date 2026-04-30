import { useState, useEffect, useRef, useCallback } from 'react'
import { Room, RoomEvent, ConnectionState, Track } from 'livekit-client'
import { fetchManagerToken } from '../api/streaming'

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880'

/** Use localhost for LiveKit when we're on localhost (web-to-web dev); else use API's URL (e.g. phone). */
function getLiveKitWsUrl(apiUrl: string | undefined): string {
  if (typeof window === 'undefined') return apiUrl || LIVEKIT_URL
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  return isLocal ? 'ws://localhost:7880' : (apiUrl || LIVEKIT_URL)
}

export interface WorkerStream {
  participant: any
  videoTrack: any
  audioTrack: any
}

/**
 * useLiveStream — manages a LiveKit Room as a manager participant.
 *
 * @param roomName  e.g. "site-s1". Pass null to skip connecting.
 * @param identity  e.g. "manager-1"
 */
export default function useLiveStream(roomName: string | null, identity = 'manager-1') {
  const roomRef = useRef<Room | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected)
  const [workerStreams, setWorkerStreams] = useState<Map<string, WorkerStream>>(new Map())
  const [error, setError] = useState<string | null>(null)

  // Rebuild workerStreams from current room participants.
  const rebuildStreams = useCallback(() => {
    const room = roomRef.current
    if (!room) return
    const newMap = new Map<string, WorkerStream>()
    for (const [pid, participant] of room.remoteParticipants) {
      let videoTrack: any = null
      let audioTrack: any = null
      for (const pub of participant.trackPublications.values()) {
        if (!pub.track) continue
        if (pub.track.kind === Track.Kind.Video) videoTrack = pub.track
        if (pub.track.kind === Track.Kind.Audio) audioTrack = pub.track
      }
      newMap.set(pid, { participant, videoTrack, audioTrack })
    }
    setWorkerStreams(newMap)
  }, [])

  const connect = useCallback(async () => {
    if (!roomName) return
    setError(null)

    // Clean up any existing room first
    if (roomRef.current) {
      roomRef.current.disconnect()
      roomRef.current = null
    }

    try {
      const { token, livekit_url } = await fetchManagerToken(roomName, identity, 'Site Manager')
      const wsTarget = getLiveKitWsUrl(livekit_url)

      const room = new Room({ adaptiveStream: true, dynacast: true })
      roomRef.current = room

      room.on(RoomEvent.ConnectionStateChanged, setConnectionState)
      room.on(RoomEvent.TrackSubscribed, rebuildStreams)
      room.on(RoomEvent.TrackUnsubscribed, rebuildStreams)
      room.on(RoomEvent.ParticipantConnected, rebuildStreams)
      room.on(RoomEvent.ParticipantDisconnected, rebuildStreams)
      room.on(RoomEvent.TrackMuted, rebuildStreams)
      room.on(RoomEvent.TrackUnmuted, rebuildStreams)
      room.on(RoomEvent.Disconnected, () => {
        setConnectionState(ConnectionState.Disconnected)
        setWorkerStreams(new Map())
      })

      await room.connect(wsTarget, token)
      rebuildStreams()
    } catch (err) {
      setError((err as Error).message || 'Failed to connect to LiveKit')
      setConnectionState(ConnectionState.Disconnected)
    }
  }, [roomName, identity, rebuildStreams])

  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect()
      roomRef.current = null
    }
    setWorkerStreams(new Map())
    setConnectionState(ConnectionState.Disconnected)
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => { roomRef.current?.disconnect() }
  }, [])

  return {
    connect,
    disconnect,
    workerStreams,
    isConnected: connectionState === ConnectionState.Connected,
    connectionState,
    room: roomRef.current,
    error,
  }
}
