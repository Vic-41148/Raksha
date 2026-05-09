import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Raksha, your safety assistant. How can I help you prepare or stay safe today?" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
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
        body: JSON.stringify({ messages: newMessages })
      })

      if (!res.ok) throw new Error('API Error')
      
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the network right now." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '8px' }}>
      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            gap: '12px', 
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%'
          }}>
            {msg.role === 'assistant' && (
              <div className="md-avatar" style={{ width: 32, height: 32, backgroundColor: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)' }}>
                <Bot size={18} />
              </div>
            )}
            
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              backgroundColor: msg.role === 'user' ? 'var(--md-primary)' : 'var(--md-surface-container-high)',
              color: msg.role === 'user' ? 'var(--md-on-primary)' : 'var(--md-on-surface)',
              borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
              borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
              lineHeight: '1.5',
              fontSize: '15px'
            }}>
              {msg.content}
            </div>
            
            {msg.role === 'user' && (
              <div className="md-avatar" style={{ width: 32, height: 32, backgroundColor: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)' }}>
                <User size={18} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div className="md-avatar" style={{ width: 32, height: 32, backgroundColor: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)' }}>
              <Bot size={18} />
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '16px', backgroundColor: 'var(--md-surface-container-high)', display: 'flex', alignItems: 'center' }}>
              <Loader2 size={18} className="spin" style={{ color: 'var(--md-on-surface-variant)' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} style={{ 
        padding: '12px 16px', 
        backgroundColor: 'var(--md-surface)',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Raksha..."
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '28px',
            border: 'none',
            backgroundColor: 'var(--md-surface-container-highest)',
            color: 'var(--md-on-surface)',
            outline: 'none',
            fontSize: '15px'
          }}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          style={{ 
            borderRadius: '50%', 
            width: '48px', 
            height: '48px', 
            padding: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'var(--md-primary)',
            color: 'var(--md-on-primary)',
            border: 'none',
            opacity: (!input.trim() || isLoading) ? 0.5 : 1,
            cursor: (!input.trim() || isLoading) ? 'default' : 'pointer'
          }}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
