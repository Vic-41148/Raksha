import { useState } from 'react'
import { Moon, Sun, LogOut, Save } from 'lucide-react'
import type { UserConfig, GoogleUser, Theme } from '../App'

interface Props {
  user: GoogleUser; config: UserConfig; theme: Theme;
  onUpdate: (c: UserConfig) => void; onLogout: () => void; onToggleTheme: () => void;
}

export function SettingsTab({ user, config, theme, onUpdate, onLogout, onToggleTheme }: Props) {
  const [city, setCity] = useState(config.city)
  const [country, setCountry] = useState(config.country)
  const [kids, setKids] = useState(config.kids_present)
  const [elderly, setElderly] = useState(config.elderly_present)
  const [saved, setSaved] = useState(false)

  const dirty = city !== config.city || country !== config.country
    || kids !== config.kids_present || elderly !== config.elderly_present

  const handleSave = () => {
    onUpdate({ city, country, kids_present: kids, elderly_present: elderly })
    setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* User card */}
      <div className="md-card-filled anim-fade-up" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        {user.picture
          ? <img src={user.picture} alt={user.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
          : <div className="md-avatar">{user.name?.[0]}</div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="md-title-medium" style={{ margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
          <p className="md-body-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
        </div>
      </div>

      {/* Appearance */}
      <div>
        <p className="md-label-large" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Appearance</p>
        <div className="md-card-outlined" style={{ overflow: 'hidden' }}>
          <div className="md-list-item">
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--md-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === 'dark' ? <Moon size={20} color="var(--md-primary)" /> : <Sun size={20} color="var(--md-primary)" />}
            </div>
            <div style={{ flex: 1 }}>
              <p className="md-body-large" style={{ margin: '0 0 2px' }}>Dark Mode</p>
              <p className="md-body-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>
                {theme === 'dark' ? 'Currently on' : 'Currently off'}
              </p>
            </div>
            <label className="md-switch">
              <input type="checkbox" checked={theme === 'dark'} onChange={onToggleTheme} />
              <div className="md-switch-track" />
              <div className="md-switch-thumb" />
            </label>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="md-label-large" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Location</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="md-field-label">City</label>
            <input className="md-field-input" type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai" />
          </div>
          <div>
            <label className="md-field-label">Country</label>
            <input className="md-field-input" type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. India" />
          </div>
        </div>
      </div>

      {/* Household */}
      <div>
        <p className="md-label-large" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Household</p>
        <div className="md-card-outlined" style={{ overflow: 'hidden' }}>
          {[
            { label: 'Children present', sub: 'Increases caution threshold', val: kids, set: setKids },
            { label: 'Elderly present',  sub: 'Increases caution threshold', val: elderly, set: setElderly },
          ].map(({ label, sub, val, set }, i) => (
            <div key={label}>
              {i > 0 && <div className="md-divider" />}
              <div className="md-list-item">
                <div style={{ flex: 1 }}>
                  <p className="md-body-large" style={{ margin: '0 0 2px' }}>{label}</p>
                  <p className="md-body-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>{sub}</p>
                </div>
                <label className="md-switch">
                  <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
                  <div className="md-switch-track" />
                  <div className="md-switch-thumb" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      {dirty && (
        <button className="md-btn md-btn-filled md-btn-lg" style={{ width: '100%' }} onClick={handleSave}>
          <Save size={18} /> {saved ? 'Saved & refreshed ✓' : 'Save & Refresh'}
        </button>
      )}

      {/* Sign out */}
      <div>
        <div className="md-divider" style={{ margin: '0 0 16px' }} />
        <button
          className="md-btn md-btn-text"
          style={{ width: '100%', color: 'var(--md-error)', minHeight: 48, justifyContent: 'flex-start', padding: '10px 16px' }}
          onClick={onLogout}
        >
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  )
}
