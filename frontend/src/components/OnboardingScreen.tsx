import { useState } from 'react'
import { Shield } from 'lucide-react'
import type { UserConfig, GoogleUser } from '../App'

interface Props { user: GoogleUser; onComplete: (config: UserConfig) => void }

export function OnboardingScreen({ user, onComplete }: Props) {
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [kids, setKids] = useState(false)
  const [elderly, setElderly] = useState(false)

  return (
    <div className="app-shell" style={{ padding: '0 24px', minHeight: '100dvh', justifyContent: 'space-between' }}>
      <div style={{ paddingTop: 72, paddingBottom: 24 }}>
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--md-primary-container)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
        }}>
          <Shield size={28} color="var(--md-on-primary-container)" />
        </div>

        <h1 className="md-headline-medium anim-fade-up" style={{ margin: '0 0 8px', fontWeight: 400 }}>
          Welcome, {user.name.split(' ')[0]}
        </h1>
        <p className="md-body-medium anim-fade-up d-50" style={{ color: 'var(--md-on-surface-variant)', margin: '0 0 36px' }}>
          Tell us about your location and household so we can personalise your safety alerts.
        </p>

        {/* Location fields */}
        <div className="anim-fade-up d-100" style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
          <div>
            <label className="md-field-label">City</label>
            <input className="md-field-input" type="text" placeholder="e.g. Mumbai"
              value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div>
            <label className="md-field-label">Country</label>
            <input className="md-field-input" type="text" placeholder="e.g. India"
              value={country} onChange={e => setCountry(e.target.value)} />
          </div>
        </div>

        {/* Household toggles */}
        <div className="anim-fade-up d-200">
          <p className="md-label-large" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 12 }}>
            Household members
          </p>
          <div className="md-card-outlined" style={{ overflow: 'hidden' }}>
            {[
              { label: 'Children present', sub: 'Under 12 years old', val: kids, set: setKids },
              { label: 'Elderly present',  sub: '65 years and above', val: elderly, set: setElderly },
            ].map(({ label, sub, val, set }, i) => (
              <div key={label}>
                {i > 0 && <div className="md-divider" />}
                <label className="md-list-item" style={{ cursor: 'pointer' }}>
                  <div style={{ flex: 1 }}>
                    <p className="md-body-large" style={{ margin: 0 }}>{label}</p>
                    <p className="md-body-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>{sub}</p>
                  </div>
                  {/* M3 Switch */}
                  <label className="md-switch">
                    <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
                    <div className="md-switch-track" />
                    <div className="md-switch-thumb" />
                  </label>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="anim-fade-up d-300" style={{ paddingBottom: 40 }}>
        <button
          className="md-btn md-btn-filled md-btn-lg"
          style={{ width: '100%' }}
          disabled={!city.trim() || !country.trim()}
          onClick={() => onComplete({ city, country, kids_present: kids, elderly_present: elderly })}
        >
          <Shield size={18} />
          Protect My Family
        </button>
      </div>
    </div>
  )
}
