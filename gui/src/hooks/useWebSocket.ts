import { useEffect, useRef, useState, useCallback } from 'react'

interface UseWebSocketOptions {
  onMessage?: (data: unknown) => void
  autoConnect?: boolean
}

export default function useWebSocket(url: string, { onMessage, autoConnect = true }: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)

  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close()
    const ws = new WebSocket(url)
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data as string)
        onMessage?.(data)
      } catch {}
    }
    wsRef.current = ws
  }, [url, onMessage])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    if (autoConnect) connect()
    return () => wsRef.current?.close()
  }, [autoConnect, connect])

  return { connected, send, connect }
}
