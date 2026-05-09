import { Shield, Zap, CloudRain, Thermometer, Wind } from 'lucide-react'
import type { GoogleUser, Theme } from '../App'

interface Props { onLogin: (user: GoogleUser) => void; theme: Theme }

export function LoginScreen({ onLogin }: Props) {
  const hasClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

  const demoLogin = () => onLogin({
    name: 'Demo User', email: 'demo@raksha.app', picture: '', sub: 'demo_' + Date.now()
  })

  const features = [
    { icon: <CloudRain size={16} />, label: 'Flood & rain risk' },
    { icon: <Thermometer size={16} />, label: 'Heat alerts' },
    { icon: <Wind size={16} />, label: 'Storm warnings' },
    { icon: <Zap size={16} />, label: 'AI decisions' },
  ]

  return (
    <div className="app-shell" style={{ justifyContent: 'space-between', padding: '0 24px', minHeight: '100dvh' }}>
      {/* Top section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 64, paddingBottom: 32 }}>
        {/* Product icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--md-primary-container)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24
        }}>
          <Shield size={36} color="var(--md-on-primary-container)" />
        </div>

        <h1 className="md-display-small anim-fade-up" style={{ margin: '0 0 12px', fontWeight: 400 }}>
          Raksha
        </h1>
        <p className="md-body-large anim-fade-up d-100" style={{ color: 'var(--md-on-surface-variant)', margin: '0 0 32px', maxWidth: 280 }}>
          One daily safety decision for your family — based on real weather and local risk data.
        </p>

        {/* Feature chips */}
        <div className="anim-fade-up d-200" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {features.map(f => (
            <span key={f.label} className="md-chip md-chip-assist md-label-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {f.icon}{f.label}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="anim-slide-up d-300" style={{ paddingBottom: 48, width: '100%' }}>
        <div className="md-card-filled" style={{ padding: 24, marginBottom: 16 }}>
          {hasClientId ? (
            <button
              className="md-btn md-btn-filled md-btn-lg"
              style={{ width: '100%' }}
              onClick={() => { /* Google login handled by hook when env is set */ }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          ) : (
            <button className="md-btn md-btn-filled md-btn-lg" style={{ width: '100%' }} onClick={demoLogin}>
              Get Started
            </button>
          )}

          {hasClientId && (
            <button className="md-btn md-btn-text" style={{ width: '100%', marginTop: 8 }} onClick={demoLogin}>
              Continue without account
            </button>
          )}

          <p className="md-body-small" style={{ color: 'var(--md-on-surface-variant)', marginTop: 16, textAlign: 'center' }}>
            Your data stays on your device.
          </p>
        </div>

        <p className="md-label-small" style={{ color: 'var(--md-outline)', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Made for WeatherWise Hack · Team XXX-523
        </p>
      </div>
    </div>
  )
}
