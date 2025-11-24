'use client'

import { useState } from 'react'
import { Sparkles, X, Send } from 'lucide-react'

export default function AskOpsChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    const userMessage = question.trim()
    setQuestion('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer || data.error || 'Sorry, I could not generate a response.' 
      }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your question. Make sure the OpenAI API key is configured.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 backdrop-blur-sm transition-all duration-300"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat bubble button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover-lift z-50"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--info) 100%)',
          }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 rounded-lg border shadow-2xl z-50 flex flex-col"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            width: '480px',
            height: '600px',
            maxHeight: 'calc(100vh - 3rem)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderBottomColor: 'var(--border-primary)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--info) 100%)',
              }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Ask OpAtlas</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI-powered playbook assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover-subtle transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ask me anything about your playbooks</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[80%] px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-tertiary)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    }}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t" style={{ borderTopColor: 'var(--border-primary)' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: question.trim() && !isLoading ? 'var(--accent)' : 'var(--bg-quaternary)',
                  color: 'white',
                  opacity: question.trim() && !isLoading ? 1 : 0.5,
                  cursor: question.trim() && !isLoading ? 'pointer' : 'not-allowed'
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
