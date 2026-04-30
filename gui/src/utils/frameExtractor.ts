/**
 * Extract frames from a video file at regular intervals using Canvas API.
 * Ported from index.html extractVideoFrames().
 */

export interface ExtractedFrame {
  id: string
  timestamp: number
  image_data: string
  filename: string
}

export function extractVideoFrames(
  file: File,
  intervalSeconds = 5,
  onProgress?: (progress: number) => void,
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'auto'
    const url = URL.createObjectURL(file)
    video.src = url

    video.onloadedmetadata = () => {
      const duration = video.duration
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const frames: ExtractedFrame[] = []
      let currentTime = 0

      const captureFrame = () => {
        if (currentTime > duration) {
          URL.revokeObjectURL(url)
          resolve(frames)
          return
        }
        video.currentTime = currentTime
      }

      video.onseeked = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        frames.push({
          id: `f_${Date.now()}_${frames.length}`,
          timestamp: currentTime,
          image_data: dataUrl,
          filename: `${file.name} @${Math.round(currentTime)}s`,
        })
        onProgress?.(currentTime / duration)
        currentTime += intervalSeconds
        captureFrame()
      }

      captureFrame()
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video'))
    }
  })
}

export function readImageFile(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
