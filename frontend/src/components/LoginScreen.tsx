import { Shield, Zap, CloudRain, Thermometer, Wind } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import type { GoogleUser, Theme } from '../App'

interface Props { onLogin: (user: GoogleUser) => void; theme: Theme }

// Separate component so the hook only mounts when clientId exists
function GoogleLoginButton({ onLogin }: { onLogin: (u: GoogleUser) => void }) {
  const googleLogin = useGoogleLogin({
    onSuccess: token => {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      })
        .then(r => r.json())
        .then((info: { name?: string; email?: string; picture?: string; sub?: string }) =>
          onLogin({ name: info.name ?? 'User', email: info.email ?? '', picture: info.picture ?? '', sub: info.sub ?? String(Date.now()) })
        )
        .catch(() => onLogin({ name: 'User', email: '', picture: '', sub: String(Date.now()) }))
    },
    onError: () => onLogin({ name: 'User', email: '', picture: '', sub: String(Date.now()) }),
    flow: 'implicit',
  })

  return (
    <button className="md-btn md-btn-filled md-btn-lg" style={{ width: '100%' }} onClick={() => googleLogin()}>
      {/* Google G */}
      <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Sign in with Google
    </button>
  )
}

export function LoginScreen({ onLogin }: Props) {
  const hasClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

  const guestLogin = () => onLogin({ name: 'User', email: '', picture: '', sub: 'guest_' + Date.now() })

  const features = [
    { icon: <CloudRain size={16} />, label: 'Flood & rain risk' },
    { icon: <Thermometer size={16} />, label: 'Heat alerts' },
    { icon: <Wind size={16} />, label: 'Storm warnings' },
    { icon: <Zap size={16} />, label: 'AI decisions' },
  ]

  return (
    <div className="auth-page">
      <div className="auth-card anim-fade-up">
        {/* App icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--md-primary-container)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Shield size={36} color="var(--md-on-primary-container)" />
        </div>

        <h1 className="md-display-small" style={{ margin: '0 0 12px', fontWeight: 400 }}>Raksha</h1>
        <p className="md-body-large" style={{ color: 'var(--md-on-surface-variant)', margin: '0 0 32px', maxWidth: 300 }}>
          One daily safety decision for your family — based on real weather and local risk data.
        </p>

        {/* Feature chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
          {features.map(f => (
            <span key={f.label} className="md-chip md-chip-assist md-label-medium"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {f.icon}{f.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="md-card-filled" style={{ padding: 24, width: '100%', boxSizing: 'border-box' }}>
          {hasClientId ? (
            <>
              <GoogleLoginButton onLogin={onLogin} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--md-outline-variant)' }} />
                <span className="md-body-small" style={{ color: 'var(--md-on-surface-variant)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--md-outline-variant)' }} />
              </div>
              <button className="md-btn md-btn-tonal" style={{ width: '100%' }} onClick={guestLogin}>
                Continue as guest
              </button>
            </>
          ) : (
            <button className="md-btn md-btn-filled md-btn-lg" style={{ width: '100%' }} onClick={guestLogin}>
              Get Started
            </button>
          )}

          <p className="md-body-small" style={{ color: 'var(--md-on-surface-variant)', marginTop: 16, textAlign: 'center' }}>
            Your data stays on your device.
          </p>
        </div>

        <p className="md-label-small" style={{ color: 'var(--md-outline)', marginTop: 24, textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Made for WeatherWise Hack · WWH-RHV8D6
        </p>
      </div>
    </div>
  )
}
