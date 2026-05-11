import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, Loader2 } from 'lucide-react'
import type { RiskData, UserConfig, GoogleUser } from '../App'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  riskData: RiskData | null
  config: UserConfig | null
  user: GoogleUser | null
}

function buildContext(riskData: RiskData | null, config: UserConfig | null, user: GoogleUser | null): string {
  const lines: string[] = []

  if (user?.name) lines.push(`User's name: ${user.name}`)
  if (config?.kids_present)    lines.push('Household: children present (under 12)')
  if (config?.elderly_present) lines.push('Household: elderly present (65+)')

  if (riskData) {
    lines.push(`Current risk level: ${riskData.risk_level} (score ${riskData.score}/10)`)
    lines.push(`AI recommendation: ${riskData.decision}`)
    lines.push(`Location: ${config?.city && config?.country ? `${config.city}, ${config.country}` : 'GPS-detected location'}`)
    const w = riskData.weather
    lines.push(`Weather: ${w.condition}${w.description ? ` (${w.description})` : ''}, ${w.temp_c}°C, feels like ${w.feels_like ?? w.temp_c}°C`)
    lines.push(`Rainfall: ${w.rainfall_mm} mm, Wind: ${w.wind_speed_kmh} km/h, Humidity: ${w.humidity_pct}%`)
    lines.push(`Elevation: ${riskData.elevation_m} m above sea level`)
    if (riskData.historical_risk && riskData.historical_details?.zone_name) {
      lines.push(`Historical risk zone: ${riskData.historical_details.zone_name}`)
    }
    if (riskData.nearby_zones?.length) {
      const zones = riskData.nearby_zones.map(z => `${z.zone_name} (${z.distance_km.toFixed(1)} km, ${z.risk_type})`).join('; ')
      lines.push(`Nearby disaster zones: ${zones}`)
    }
  } else {
    lines.push('Risk data: not yet loaded — user may ask to check the Safety tab first.')
  }

  return lines.join('\n')
}

export function ChatTab({ riskData, config, user }: Props) {
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi ${firstName}! I'm Raksha, your safety assistant.${
        riskData
          ? ` Your area is currently showing a **${riskData.risk_level}** risk (${riskData.score}/10). How can I help?`
          : ' How can I help you prepare or stay safe today?'
      }`,
    },
  ])
  const [input, setInput]       = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const newMessages = [...messages, { role: 'user', content: input.trim() } as Message]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: buildContext(riskData, config, user),
        }),
      })

      if (!res.ok) throw new Error('API Error')
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.response }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }])
    } finally {
      setIsLoading(false)
    }
  }

  // User avatar — Google picture or initial
  const UserAvatar = () => (
    user?.picture
      ? <img src={user.picture} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      : <div className="md-avatar" style={{ width: 32, height: 32, fontSize: 13, background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)', flexShrink: 0 }}>
          {user?.name?.[0] ?? 'U'}
        </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 32px)', minHeight: 0 }}>

      {/* Risk context banner */}
      {riskData && (
        <div style={{
          padding: '8px 16px',
          background: riskData.risk_level === 'DANGER'
            ? 'var(--md-error-container)'
            : riskData.risk_level === 'CAUTION'
              ? 'var(--md-caution-container)'
              : 'var(--md-primary-container)',
          color: riskData.risk_level === 'DANGER'
            ? 'var(--md-on-error-container)'
            : riskData.risk_level === 'CAUTION'
              ? 'var(--md-on-caution-container)'
              : 'var(--md-on-primary-container)',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: 0.3,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid var(--md-outline-variant)',
        }}>
          <span>{riskData.risk_level === 'DANGER' ? '🚨' : riskData.risk_level === 'CAUTION' ? '⚠️' : '✅'}</span>
          <span>
            {riskData.risk_level} · {riskData.score}/10 · {riskData.weather.condition}, {riskData.weather.temp_c}°C
            {config?.city ? ` · ${config.city}` : ' · Current location'}
          </span>
        </div>
      )}

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '10px',
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
          }}>
            {msg.role === 'assistant'
              ? <div className="md-avatar" style={{ width: 32, height: 32, background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)', flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              : <UserAvatar />
            }
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              backgroundColor: msg.role === 'user' ? 'var(--md-primary)' : 'var(--md-surface-container-high)',
              color: msg.role === 'user' ? 'var(--md-on-primary)' : 'var(--md-on-surface)',
              borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
              borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
              lineHeight: 1.55,
              fontSize: '15px',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
            <div className="md-avatar" style={{ width: 32, height: 32, background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)' }}>
              <Bot size={18} />
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '16px', background: 'var(--md-surface-container-high)', display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0, 1, 2].map(n => (
                <span key={n} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--md-on-surface-variant)',
                  animation: 'pulse 1.2s ease-in-out infinite',
                  animationDelay: `${n * 0.2}s`,
                  display: 'inline-block',
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} style={{
        padding: '12px 16px 16px',
        background: 'var(--md-surface)',
        borderTop: '1px solid var(--md-outline-variant)',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Raksha about your area..."
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '28px',
            border: 'none',
            background: 'var(--md-surface-container-highest)',
            color: 'var(--md-on-surface)',
            outline: 'none',
            fontSize: '15px',
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{
            borderRadius: '50%', width: '48px', height: '48px',
            padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--md-primary)', color: 'var(--md-on-primary)',
            border: 'none', cursor: (!input.trim() || isLoading) ? 'default' : 'pointer',
            opacity: (!input.trim() || isLoading) ? 0.5 : 1,
            transition: 'opacity 0.15s',
            flexShrink: 0,
          }}
        >
          {isLoading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  )
}
