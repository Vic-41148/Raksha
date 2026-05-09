import { Shield, Zap, Cloud, Code2, Brain, Award, Heart, GitBranch } from 'lucide-react'

const TECH = [
  { icon: <Brain size={20} color="var(--md-primary)" />, name: 'Groq LLaMA 3.3-70b', desc: 'AI-powered daily decisions' },
  { icon: <Cloud size={20} color="var(--md-tertiary)" />, name: 'OpenWeatherMap', desc: 'Real-time hyperlocal weather' },
  { icon: <Zap size={20} color="var(--md-caution)" />, name: 'scikit-learn RF', desc: 'ML risk score prediction' },
  { icon: <Code2 size={20} color="var(--md-secondary)" />, name: 'FastAPI + React', desc: 'Backend & frontend stack' },
]

export function CreditsTab() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 32 }}>

      {/* Hackathon card */}
      <div className="hackathon-card anim-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Award size={18} />
          <span className="md-label-medium" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>
            Official Entry
          </span>
        </div>
        <h2 className="md-headline-small" style={{ margin: '0 0 4px', fontWeight: 500 }}>WeatherWise Hack</h2>
        <p className="md-body-medium" style={{ margin: '0 0 16px', opacity: 0.75 }}>
          Team Code: <strong>XXX-523</strong>
        </p>
        <span className="md-chip md-label-medium" style={{
          background: 'rgba(0,0,0,0.12)', border: 'none', color: 'currentColor'
        }}>
          <Shield size={14} /> Made for WeatherWise Hack
        </span>
      </div>

      {/* About */}
      <div>
        <p className="md-label-large" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>About</p>
        <div className="md-card-outlined" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--md-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={24} color="var(--md-on-primary-container)" />
            </div>
            <div>
              <p className="md-title-medium" style={{ margin: '0 0 2px' }}>Raksha</p>
              <p className="md-body-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>Safe Daily Decision</p>
            </div>
          </div>
          <p className="md-body-medium" style={{ color: 'var(--md-on-surface-variant)', margin: 0, lineHeight: 1.7 }}>
            Raksha (रक्षा) means <em>protection</em> in Sanskrit. We built this app to
            give families one clear, AI-powered safety decision every day — based on
            hyperlocal flood, heat, and storm risk — so you never have to guess
            whether it's safe to step outside.
          </p>
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <p className="md-label-large" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Built With</p>
        <div className="md-card-outlined" style={{ overflow: 'hidden' }}>
          {TECH.map(({ icon, name, desc }, i) => (
            <div key={name}>
              {i > 0 && <div className="md-divider" />}
              <div className="md-list-item">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--md-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <p className="md-body-large" style={{ margin: '0 0 2px' }}>{name}</p>
                  <p className="md-body-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub */}
      <div>
        <p className="md-label-large" style={{ color: 'var(--md-on-surface-variant)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Source</p>
        <div className="md-card-outlined" style={{ overflow: 'hidden' }}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div className="md-list-item">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--md-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GitBranch size={20} color="var(--md-on-surface-variant)" />
              </div>
              <div>
                <p className="md-body-large" style={{ margin: '0 0 2px' }}>View on GitHub</p>
                <p className="md-body-small" style={{ margin: 0, color: 'var(--md-on-surface-variant)' }}>Open source — MIT License</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <p className="md-body-small" style={{ color: 'var(--md-outline)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          Made with <Heart size={12} color="var(--md-error)" /> for WeatherWise Hack
        </p>
        <p className="md-label-small" style={{ color: 'var(--md-outline-variant)', marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Raksha v1.0 · Team XXX-523
        </p>
      </div>
    </div>
  )
}
