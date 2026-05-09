import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react'
import type { RiskData, UserConfig } from '../App'

interface Props { riskData: RiskData | null; config: UserConfig }

export function ZonesTab({ riskData, config }: Props) {
  const zones = riskData?.nearby_zones ?? []

  const chipClass = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes('flood') || t.includes('cyclone')) return 'risk-chip-danger'
    if (t.includes('drought') || t.includes('heat') || t.includes('wind')) return 'risk-chip-caution'
    return 'risk-chip-safe'
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="md-headline-small" style={{ margin: '0 0 4px', fontWeight: 400 }}>Risk Zones</h2>
        <p className="md-body-medium" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>
          Historical disaster zones near {config.city}
        </p>
      </div>

      {/* Location summary */}
      {riskData && (
        <div className="md-card-filled anim-fade-up" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--md-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={20} color="var(--md-on-primary-container)" />
            </div>
            <div>
              <p className="md-title-medium" style={{ margin: 0 }}>Your Location</p>
              <p className="md-body-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>
                {config.city}, {config.country}
              </p>
            </div>
            <span className={`md-chip md-label-medium ${chipClass(riskData.risk_level)}`} style={{ marginLeft: 'auto' }}>
              {riskData.risk_level}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--md-outline-variant)', borderRadius: 8, overflow: 'hidden' }}>
            {[
              { val: riskData.score.toFixed(1), label: 'Risk Score' },
              { val: `${riskData.elevation_m}m`, label: 'Elevation' },
              { val: `${riskData.weather.rainfall_mm}mm`, label: 'Rainfall' },
            ].map(({ val, label }) => (
              <div key={label} style={{ background: 'var(--md-surface-container-low)', padding: '14px 12px', textAlign: 'center' }}>
                <p className="md-title-large" style={{ margin: '0 0 2px', fontWeight: 600 }}>{val}</p>
                <p className="md-label-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zones list */}
      <p className="md-label-large" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Nearby Zones
      </p>

      {zones.length > 0 ? (
        <div className="md-card-outlined" style={{ overflow: 'hidden' }}>
          {zones.map((zone, i) => (
            <div key={i}>
              {i > 0 && <div className="md-divider" />}
              <div className="md-list-item anim-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--md-error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={20} color="var(--md-on-error-container)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="md-body-large" style={{ margin: '0 0 2px' }}>{zone.zone_name}</p>
                  <p className="md-body-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>
                    {zone.distance_km.toFixed(1)} km away
                  </p>
                </div>
                <span className={`md-chip md-label-small ${chipClass(zone.risk_type)}`} style={{ padding: '4px 10px' }}>
                  {zone.risk_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="md-card-outlined" style={{ padding: 32, textAlign: 'center' }}>
          <CheckCircle size={40} color="var(--md-primary)" style={{ marginBottom: 12 }} />
          <p className="md-title-medium" style={{ margin: '0 0 8px' }}>No nearby high-risk zones</p>
          <p className="md-body-medium" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>
            No historical disaster zones were found in your area.
          </p>
        </div>
      )}

      {!riskData && (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <MapPin size={40} color="var(--md-outline)" style={{ marginBottom: 16 }} />
          <p className="md-body-large" style={{ color: 'var(--md-on-surface-variant)' }}>
            Go to Safety tab to load zone data.
          </p>
        </div>
      )}
    </div>
  )
}
