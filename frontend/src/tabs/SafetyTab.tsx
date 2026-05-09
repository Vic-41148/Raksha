import { useState, useCallback } from 'react'
import { RefreshCw, ChevronDown, CheckCircle, AlertTriangle, Phone, Share2, Droplets, Wind, Thermometer, Gauge, Clock, MapPin } from 'lucide-react'
import type { RiskData, RiskLevel, HelplineData, UserConfig } from '../App'
import axios from 'axios'

function ScoreRing({ score, level }: { score: number; level: RiskLevel }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 10) * circ
  const color = level === 'SAFE' ? 'var(--md-primary)' : level === 'CAUTION' ? 'var(--md-caution)' : 'var(--md-error)'
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" strokeWidth="6" className="score-ring-bg" />
        <circle cx="48" cy="48" r={r} fill="none" strokeWidth="6"
          stroke={color} className="score-ring-fill"
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="md-title-large" style={{ fontWeight: 700, lineHeight: 1 }}>{score.toFixed(1)}</span>
        <span className="md-label-small" style={{ color: 'var(--md-on-surface-variant)' }}>/10</span>
      </div>
    </div>
  )
}

function HelplineSheet({ data, onClose }: { data: HelplineData; onClose: () => void }) {
  const lines = [
    { label: 'Emergency', num: data.emergency, emoji: '🚨' },
    { label: data.disaster_name || 'Disaster', num: data.disaster, emoji: '🌊' },
    ...(data.ambulance ? [{ label: 'Ambulance', num: data.ambulance, emoji: '🚑' }] : []),
    ...(data.police   ? [{ label: 'Police',    num: data.police,    emoji: '🚔' }] : []),
    ...(data.fire     ? [{ label: 'Fire',      num: data.fire,      emoji: '🚒' }] : []),
  ]
  return (
    <div className="md-scrim-overlay" onClick={onClose}>
      <div className="md-bottom-sheet" onClick={e => e.stopPropagation()}>
        <div className="md-drag-handle" />
        <p className="md-title-large" style={{ margin: '0 0 4px' }}>Emergency Helplines</p>
        <p className="md-body-medium" style={{ color: 'var(--md-on-surface-variant)', margin: '0 0 20px' }}>{data.country}</p>
        {lines.map((l, i) => (
          <div key={l.label}>
            {i > 0 && <div className="md-divider" />}
            <a href={`tel:${l.num}`} className="md-list-item" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{l.emoji}</span>
              <div style={{ flex: 1 }}>
                <p className="md-body-large" style={{ margin: 0 }}>{l.label}</p>
                <p className="md-body-medium" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>{l.num}</p>
              </div>
              <Phone size={18} color="var(--md-on-surface-variant)" />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  config: UserConfig; riskData: RiskData | null; loading: boolean;
  error: string | null; lastUpdated: Date | null; onRefresh: () => void;
}

export function SafetyTab({ config, riskData, loading, error, lastUpdated, onRefresh }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [helplineData, setHelplineData] = useState<HelplineData | null>(null)
  const [showSheet, setShowSheet] = useState(false)

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true); onRefresh(); setTimeout(() => setRefreshing(false), 2000)
  }

  const handleSafe = useCallback(async () => {
    if (confirmed) return
    setConfirmed(true)
    navigator.geolocation.getCurrentPosition(
      pos => axios.post('/api/safe-confirm', { lat: pos.coords.latitude, lon: pos.coords.longitude, city: config.city }),
      ()  => axios.post('/api/safe-confirm', { lat: 0, lon: 0, city: config.city })
    )
  }, [confirmed, config.city])

  const handleHelpline = async () => {
    if (!helplineData) {
      try {
        const r = await fetch(`/api/helplines?country=${encodeURIComponent(config.country)}`)
        setHelplineData(await r.json())
      } catch { /* show default */ }
    }
    setShowSheet(true)
  }

  const handleShare = async () => {
    if (!riskData) return
    const text = `🛡️ Raksha: ${riskData.decision}`
    if (navigator.share) { try { await navigator.share({ title: 'Raksha', text }) } catch { /**/ } }
    else { try { await navigator.clipboard.writeText(text) } catch { /**/ } }
  }

  const level = riskData?.risk_level
  const riskClass = level === 'DANGER' ? 'risk-danger' : level === 'CAUTION' ? 'risk-caution' : 'risk-safe'
  const riskTitle = level === 'DANGER' ? 'High Risk' : level === 'CAUTION' ? 'Moderate Risk' : 'All Clear'
  const riskSub   = level === 'DANGER' ? 'Stay indoors. Avoid flooded areas.' : level === 'CAUTION' ? 'Be prepared. Monitor conditions.' : 'Conditions are safe today.'

  if (loading && !riskData) return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="md-skeleton" style={{ height: 180 }} />
      <div className="md-skeleton" style={{ height: 80 }} />
      <div className="md-skeleton" style={{ height: 56 }} />
    </div>
  )

  if (error && error !== 'offline' && !riskData) return (
    <div style={{ padding: 24, textAlign: 'center', paddingTop: 80 }}>
      <AlertTriangle size={48} color="var(--md-error)" style={{ marginBottom: 16 }} />
      <p className="md-title-medium" style={{ marginBottom: 8 }}>Something went wrong</p>
      <p className="md-body-medium" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 24 }}>{error}</p>
      <button className="md-btn md-btn-tonal" onClick={onRefresh}>Try again</button>
    </div>
  )

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Location + refresh row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
        <MapPin size={16} color="var(--md-primary)" />
        <span className="md-body-medium" style={{ color: 'var(--md-on-surface-variant)', flex: 1 }}>
          {config.city}, {config.country}
        </span>
        {lastUpdated && (
          <span className="md-label-small" style={{ color: 'var(--md-outline)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <button className="md-icon-btn" onClick={handleRefresh} aria-label="Refresh">
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {riskData && (
        <>
          {/* Risk card — M3 container color */}
          <div className={`${riskClass} anim-fade-up`} style={{ borderRadius: 28, padding: '24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p className="md-label-large" style={{ margin: '0 0 4px', opacity: 0.8 }}>{riskSub}</p>
                <h2 className="md-headline-medium" style={{ margin: 0, fontWeight: 500 }}>{riskTitle}</h2>
              </div>
              <ScoreRing score={riskData.score} level={riskData.risk_level} />
            </div>
            <span className="md-chip md-label-medium" style={{
              background: 'rgba(0,0,0,0.08)', border: 'none', color: 'currentColor'
            }}>
              {riskData.risk_level}
            </span>
          </div>

          {/* AI decision */}
          <div className="md-card-filled anim-fade-up d-100" style={{ padding: 20 }}>
            <p className="md-label-medium" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Today's Recommendation
            </p>
            <p className="md-body-large" style={{ margin: 0 }}>{riskData.decision}</p>
          </div>

          {/* Why? Expandable */}
          <div className="md-card-outlined anim-fade-up d-150" style={{ overflow: 'hidden' }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--md-on-surface)' }}
            >
              <span className="md-title-small">Why this recommendation?</span>
              <ChevronDown size={20} color="var(--md-on-surface-variant)" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            </button>

            {expanded && (
              <div style={{ padding: '0 20px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  {[
                    { icon: <Droplets size={16} color="var(--md-tertiary)" />, label: 'Rainfall', val: `${riskData.weather.rainfall_mm} mm` },
                    { icon: <Wind size={16} color="var(--md-tertiary)" />,     label: 'Wind',     val: `${riskData.weather.wind_speed_kmh.toFixed(1)} km/h` },
                    { icon: <Thermometer size={16} color="var(--md-error)" />, label: 'Temp',     val: `${riskData.weather.temp_c}°C` },
                    { icon: <Gauge size={16} color="var(--md-secondary)" />,   label: 'Humidity', val: `${riskData.weather.humidity_pct}%` },
                  ].map(({ icon, label, val }) => (
                    <div key={label} style={{ background: 'var(--md-surface-container)', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>{icon}<span className="md-label-medium" style={{ color: 'var(--md-on-surface-variant)' }}>{label}</span></div>
                      <span className="md-title-medium">{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--md-surface-container)', borderRadius: 8, padding: '12px 14px' }}>
                  <p className="md-label-medium" style={{ color: 'var(--md-on-surface-variant)', margin: '0 0 4px' }}>Elevation</p>
                  <p className="md-body-large" style={{ margin: 0 }}>{riskData.elevation_m} m above sea level</p>
                </div>
                {riskData.historical_risk && riskData.historical_details?.zone_name && (
                  <div style={{ background: 'var(--md-caution-container)', borderRadius: 8, padding: '12px 14px', marginTop: 12 }}>
                    <p className="md-label-medium" style={{ color: 'var(--md-caution)', margin: '0 0 2px' }}>Historical Risk Zone</p>
                    <p className="md-body-medium" style={{ margin: 0 }}>{riskData.historical_details.zone_name}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="anim-fade-up d-200" style={{ display: 'flex', gap: 12 }}>
            <button
              className={`md-btn ${confirmed ? 'md-btn-tonal anim-success' : 'md-btn-filled'}`}
              style={{ flex: 1, minHeight: 52 }}
              onClick={handleSafe}
            >
              <CheckCircle size={18} />
              {confirmed ? 'Confirmed' : "I'm Safe"}
            </button>
            <button className="md-btn md-btn-tonal" style={{ flex: 1, minHeight: 52 }} onClick={handleHelpline}>
              <Phone size={18} /> Helplines
            </button>
          </div>

          <button
            onClick={handleShare}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--md-on-surface-variant)' }}
          >
            <Share2 size={16} />
            <span className="md-label-large">Share safety status</span>
          </button>
        </>
      )}

      {!riskData && !loading && (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <p className="md-body-large" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 20 }}>Tap to get your safety status.</p>
          <button className="md-btn md-btn-filled md-btn-lg" onClick={onRefresh}>Get Safety Status</button>
        </div>
      )}

      {showSheet && (
        <HelplineSheet
          data={helplineData ?? { country: 'International', emergency: '112', disaster: '112', disaster_name: 'Emergency Services' }}
          onClose={() => setShowSheet(false)}
        />
      )}
    </div>
  )
}
