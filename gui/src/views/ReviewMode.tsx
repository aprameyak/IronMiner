import { useState, useEffect } from 'react'
import SiteCard from '../components/SiteCard'
import ZoneRow from '../components/ZoneRow'
import AlertCard from '../components/AlertCard'
import BriefingView from '../components/BriefingView'
import MediaGallery from '../components/MediaGallery'
import SafetyPanel from '../components/SafetyPanel'
import ProductivityPanel from '../components/ProductivityPanel'
import AddProjectModal from '../components/AddProjectModal'
import SiteBIMView from '../components/SiteBIMView'
import { fetchSites, fetchBriefing } from '../api/sites'
import { fetchAlerts } from '../api/alerts'
import { fetchZones, fetchProductivityReport } from '../api/productivity'
import { connectPipeline } from '../api/streaming'
import { MOCK_SITES, MOCK_ALERTS, MOCK_BRIEFINGS, MOCK_ZONES } from '../utils/mockData'
import type { Site, Zone, Alert } from '../types'

export default function ReviewMode() {
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSite, setSelectedSite] = useState<string | null>(null)
  const [tab, setTab] = useState<string>('briefing')
  const [briefing, setBriefing] = useState<string | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  const [expandedZone, setExpandedZone] = useState<number | null>(null)
  const [usingMock, setUsingMock] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // ── Load sites (API → mock fallback) ──────────────────────────────────────
  useEffect(() => {
    fetchSites()
      .then(data => {
        setSites(data)
        if (data.length && !selectedSite) setSelectedSite(data[0].id)
      })
      .catch(() => {
        setUsingMock(true)
        setSites(MOCK_SITES)
        setSelectedSite(MOCK_SITES[0].id)
      })
  }, [])

  // ── Load site detail data when selection changes ──────────────────────────
  useEffect(() => {
    if (!selectedSite) return

    if (usingMock) {
      setBriefing(MOCK_BRIEFINGS[selectedSite] || null)
      setAlerts(MOCK_ALERTS.filter((a: Alert) => a.site_id === selectedSite))
      setZones(MOCK_ZONES[selectedSite] || [])
    } else {
      fetchBriefing(selectedSite).then((b: { text: string }) => setBriefing(b.text)).catch(() => setBriefing(null))
      fetchAlerts({ site_id: selectedSite }).then(setAlerts).catch(() => setAlerts([]))
      const currentSite = sites.find(s => s.id === selectedSite)
      if (currentSite && currentSite.frames === 0 && (!currentSite.zones || currentSite.zones.length === 0)) {
        setZones([])
      } else {
        fetchProductivityReport(selectedSite)
          .then((report: { zones?: Zone[] }) => { if (report?.zones?.length) setZones(report.zones); else throw new Error('no zones') })
          .catch(() => {
            fetchZones(selectedSite).then(setZones).catch(() => {
              setZones(currentSite?.zones || [])
            })
          })
      }
    }
  }, [selectedSite, usingMock, sites])

  // ── Listen for pipeline WebSocket updates → refresh data ──────────────────
  useEffect(() => {
    if (!selectedSite || usingMock) return
    let ws: WebSocket | undefined
    try {
      ws = connectPipeline(selectedSite)
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.stage === 'video_complete') {
            fetchBriefing(selectedSite).then((b: { text: string }) => setBriefing(b.text)).catch(() => {})
          }
          if (msg.stage === 'productivity_complete') {
            fetchProductivityReport(selectedSite)
              .then((report: { zones?: Zone[] }) => { if (report?.zones) setZones(report.zones) })
              .catch(() => {})
          }
          if (msg.stage === 'pipeline_complete') {
            fetchSites().then(data => setSites(data)).catch(() => {})
          }
        } catch {}
      }
    } catch {}
    return () => { ws?.close() }
  }, [selectedSite, usingMock])

  const site = sites.find(s => s.id === selectedSite)

  const handleJobComplete = () => {
    if (!selectedSite || usingMock) return
    fetchBriefing(selectedSite).then((b: { text: string }) => setBriefing(b.text)).catch(() => {})
    fetchProductivityReport(selectedSite)
      .then((report: { zones?: Zone[] }) => { if (report?.zones?.length) setZones(report.zones) })
      .catch(() => fetchZones(selectedSite).then(setZones).catch(() => {}))
    fetchSites().then(setSites).catch(() => {})
  }

  const handleModalSuccess = (newSite: Site) => {
    fetchSites()
      .then(data => { setSites(data); setSelectedSite(newSite.id) })
      .catch(() => { setSites(prev => [...prev, newSite]); setSelectedSite(newSite.id) })
    setModalOpen(false)
    setTab('briefing')
  }

  return (
    <>
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
      <div>
        <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12, paddingLeft: 4 }}>
          Job Sites ({sites.length})
          {usingMock && <span style={{ marginLeft: 8, color: '#F59E0B', fontSize: 9, letterSpacing: '0.05em' }}>DEMO DATA</span>}
        </div>
        {sites.map((s, i) => (
          <div key={s.id} className={`anim-in anim-d${Math.min(i + 1, 3)}`}>
            <SiteCard site={s} selected={selectedSite === s.id} onClick={() => { setSelectedSite(s.id); setExpandedAlert(null) }} />
          </div>
        ))}
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              width: '100%', padding: '14px 20px', borderRadius: 12,
              border: '1.5px dashed rgba(249,115,22,0.35)',
              background: 'rgba(249,115,22,0.04)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, color: '#FB923C', fontSize: 14, fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Project
          </button>
        </div>
      </div>

      <div className="anim-in anim-d2">
        {site && (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: '#F8FAFC' }}>{site.name}</h2>
              </div>
              <nav style={{ display: 'flex', alignItems: 'flex-end', gap: 0 }}>
                {['briefing', 'zones', 'alerts', 'media', 'bim', 'safety', 'productivity'].map(t => {
                  const active = tab === t
                  const label = t === 'alerts' ? 'Alerts' : t === 'bim' ? '3D' : t === 'safety' ? 'Safety' : t
                  return (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      style={{
                        padding: '10px 14px 12px', marginBottom: -1, border: 'none',
                        background: 'none', cursor: 'pointer', position: 'relative',
                        font: 'inherit', fontSize: 13,
                        fontWeight: active ? 600 : 400,
                        color: active ? '#F8FAFC' : '#64748B', transition: 'color 0.2s',
                        textTransform: (t === 'bim' || t === 'safety') ? 'none' : 'capitalize',
                      }}
                    >
                      {label}
                      {active && (
                        <span style={{
                          position: 'absolute', bottom: 0, left: '50%',
                          transform: 'translateX(-50%)', width: 'calc(100% - 12px)',
                          maxWidth: 72, height: 2, background: '#D97706', borderRadius: 1,
                        }} />
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            {tab === 'briefing' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Today's Briefing</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: '#475569', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 4 }}>
                    AI-generated from {site.frames} frames
                  </span>
                </div>
                <BriefingView text={briefing} siteId={selectedSite!} usingMock={usingMock} onJobComplete={handleJobComplete} />
              </div>
            )}

            {tab === 'zones' && (
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Zone Congestion Map</span>
                <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5, marginBottom: 14, marginTop: 6, padding: '10px 14px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.12)', borderRadius: 8, borderLeft: '3px solid rgba(249,115,22,0.4)' }}>
                  Real-time worker density by zone.
                </div>
                {zones.length > 0
                  ? zones.map((z, i) => <ZoneRow key={i} zone={z} expanded={expandedZone === i} onToggle={() => setExpandedZone(expandedZone === i ? null : i)} />)
                  : <div style={{ textAlign: 'center', padding: 40, color: '#475569', fontSize: 14 }}>No zone data available for this site yet.</div>
                }
              </div>
            )}

            {tab === 'alerts' && (
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Spatial Alerts</span>
                {alerts.length === 0
                  ? <div style={{ textAlign: 'center', padding: 40, color: '#475569', fontSize: 14 }}>No alerts for this site.</div>
                  : alerts.map(a => (
                    <AlertCard key={a.id} alert={a} expanded={expandedAlert === a.id} onToggle={() => setExpandedAlert(expandedAlert === a.id ? null : a.id)} />
                  ))
                }
              </div>
            )}

            {tab === 'media' && (
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Uploaded Media</span>
                <MediaGallery siteId={selectedSite!} usingMock={usingMock} />
              </div>
            )}

            {tab === 'bim' && (
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>3D Site Model</span>
                <SiteBIMView zones={zones} siteId={selectedSite!} />
              </div>
            )}

            {tab === 'safety' && (
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Safety Analysis</span>
                <SafetyPanel siteId={selectedSite!} />
              </div>
            )}

            {tab === 'productivity' && (
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Productivity Analysis</span>
                <ProductivityPanel siteId={selectedSite!} hasFootage={(site?.frames ?? 0) > 0} />
              </div>
            )}
          </>
        )}
      </div>
    </div>

    <AddProjectModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      onSuccess={handleModalSuccess}
    />
    </>
  )
}
