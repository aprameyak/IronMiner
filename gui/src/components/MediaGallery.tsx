import { useState, useEffect } from 'react'
import { fetchJobs } from '../api/video'
import { C } from '../utils/colors'
import { MOCK_TIMELINE } from '../utils/mockData'
import type { VideoJob, TimelineEntry } from '../types'

const fmt = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
    ' \u00b7 ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

type MediaItem = VideoJob | (TimelineEntry & { filename?: string; uploaded_by?: string; created_at?: string })

interface MediaCardProps {
  item: MediaItem
  isLive: boolean
}

function MediaCard({ item, isLive }: MediaCardProps) {
  const filePath = (item as VideoJob).file_path
  const videoUrl = isLive && filePath ? `/${filePath}` : null

  const filename = (item as VideoJob).filename || (item as TimelineEntry).video || null
  const uploadedBy = (item as VideoJob).uploaded_by || (item as TimelineEntry).who || 'Unknown'
  const createdAt = (item as VideoJob).created_at || (item as TimelineEntry).timestamp
  const jobId = (item as VideoJob).job_id || (item as TimelineEntry).id
  const aiSummary = (item as VideoJob).ai_summary || (item as TimelineEntry).ai_summary

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Video / placeholder area */}
      <div style={{
        aspectRatio: '16/9', background: C.surface2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {videoUrl ? (
          <video
            controls
            preload="metadata"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            src={videoUrl}
          />
        ) : (
          <div style={{ textAlign: 'center', color: C.muted }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>&#9654;</div>
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)' }}>
              {filename || 'video'}
            </div>
          </div>
        )}
      </div>

      {/* Info area */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{
          fontSize: 13, color: C.text, fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {filename || jobId || 'Untitled'}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 4,
          fontSize: 11, fontFamily: 'var(--mono)', color: C.muted,
        }}>
          <span>{uploadedBy}</span>
          <span>{createdAt ? fmt(createdAt) : ''}</span>
        </div>

        {aiSummary && (
          <div style={{
            marginTop: 8, paddingTop: 8,
            borderTop: `1px solid ${C.border}`,
            fontSize: 12, color: C.subtle, lineHeight: 1.5,
          }}>
            {aiSummary}
          </div>
        )}
      </div>
    </div>
  )
}

interface MediaGalleryProps {
  siteId: string
  usingMock: boolean
}

export default function MediaGallery({ siteId, usingMock }: MediaGalleryProps) {
  const [items, setItems] = useState<MediaItem[]>([])

  useEffect(() => {
    if (!siteId) return

    if (usingMock) {
      const entries = (MOCK_TIMELINE[siteId] || []).filter(e => e.source === 'upload')
      setItems(entries)
    } else {
      fetchJobs(siteId)
        .then(jobs => setItems(jobs.filter(j => j.filename)))
        .catch(() => setItems([]))
    }
  }, [siteId, usingMock])

  if (items.length === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`,
        borderRadius: 12, padding: '28px 24px', textAlign: 'center',
        color: C.muted, fontSize: 14,
      }}>
        No media uploaded yet — upload footage from the Briefing tab to see it here.
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 16,
    }}>
      {items.map((item, i) => (
        <MediaCard key={(item as VideoJob).job_id || (item as TimelineEntry).id || i} item={item} isLive={!usingMock} />
      ))}
    </div>
  )
}
