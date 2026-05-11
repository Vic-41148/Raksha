import { useState } from 'react'
import { Shield, MapPin } from 'lucide-react'
import type { UserConfig, GoogleUser } from '../App'

interface Props { user: GoogleUser; onComplete: (config: UserConfig) => void }

export function OnboardingScreen({ user, onComplete }: Props) {
  const [displayName, setDisplayName] = useState(user.name || '')
  const [kids, setKids]       = useState(false)
  const [elderly, setElderly] = useState(false)

  const firstName = user.name?.split(' ')[0] ?? 'there'

  return (
    <div className="auth-page">
      <div className="auth-card anim-fade-up" style={{ maxWidth: 480 }}>
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--md-primary-container)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
        }}>
          <Shield size={28} color="var(--md-on-primary-container)" />
        </div>

        <h1 className="md-headline-medium" style={{ margin: '0 0 8px', fontWeight: 400 }}>
          Welcome, {firstName}!
        </h1>
        <p className="md-body-medium" style={{ color: 'var(--md-on-surface-variant)', margin: '0 0 32px' }}>
          Just a couple of things to personalise your safety alerts.
        </p>

        {/* Name field */}
        <div className="anim-fade-up d-100" style={{ width: '100%', marginBottom: 24 }}>
          <label className="md-field-label">Your name</label>
          <input
            className="md-field-input"
            type="text"
            placeholder="How should we call you?"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            autoComplete="given-name"
          />
        </div>

        {/* Location note */}
        <div className="anim-fade-up d-150" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 12,
          background: 'var(--md-surface-container)',
          marginBottom: 28, width: '100%', boxSizing: 'border-box',
        }}>
          <MapPin size={18} color="var(--md-primary)" style={{ flexShrink: 0 }} />
          <p className="md-body-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>
            Your <strong style={{ color: 'var(--md-on-surface)' }}>city &amp; country</strong> are detected automatically from your GPS — no need to type them.
          </p>
        </div>

        {/* Household toggles */}
        <div className="anim-fade-up d-200" style={{ width: '100%', marginBottom: 32 }}>
          <p className="md-label-large" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 12 }}>
            Who's in your household?
          </p>
          <div className="md-card-outlined" style={{ overflow: 'hidden' }}>
            {[
              { label: 'Children present', sub: 'Under 12 years old', val: kids,    set: setKids },
              { label: 'Elderly present',  sub: '65 years and above', val: elderly, set: setElderly },
            ].map(({ label, sub, val, set }, i) => (
              <div key={label}>
                {i > 0 && <div className="md-divider" />}
                <label className="md-list-item" style={{ cursor: 'pointer' }}>
                  <div style={{ flex: 1 }}>
                    <p className="md-body-large" style={{ margin: 0 }}>{label}</p>
                    <p className="md-body-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>{sub}</p>
                  </div>
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

        <div className="anim-fade-up d-300" style={{ width: '100%' }}>
          <button
            className="md-btn md-btn-filled md-btn-lg"
            style={{ width: '100%' }}
            disabled={!displayName.trim()}
            onClick={() => onComplete({
              city: '',
              country: '',
              kids_present: kids,
              elderly_present: elderly,
            })}
          >
            <Shield size={18} />
            Protect My Family
          </button>
        </div>
      </div>
    </div>
  )
}
