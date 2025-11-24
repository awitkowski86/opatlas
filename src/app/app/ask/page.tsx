'use client'

import { useState, useEffect } from 'react'
import { Sparkles, FileText, ArrowRight, Zap } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

interface Answer {
  answer: string
  summary: string
  steps: string[]
  caveats: string[]
  referencedPlaybooks: Array<{
    id: string
    title: string
  }>
}

export default function AskOpsPage() {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [suggestedPlaybooks, setSuggestedPlaybooks] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Get contextual suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (question.trim().length < 5) {
        setSuggestedPlaybooks([])
        return
      }

      setLoadingSuggestions(true)
      try {
        const response = await fetch(`/api/recommendations?workspaceId=1&context=${encodeURIComponent(question)}`)
        if (response.ok) {
          const data = await response.json()
          setSuggestedPlaybooks(data.slice(0, 3)) // Top 3 suggestions
        }
      } catch (error) {
        console.error('Failed to load suggestions:', error)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 500)
    return () => clearTimeout(debounce)
  }, [question])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setError(null)
    setAnswer(null)

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to get answer')
      }

      const data = await response.json()
      setAnswer(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Ask Ops</h1>
        </div>
        <p className="text-slate-400">
          Ask questions about your team&apos;s processes and get AI-powered answers from your playbooks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Describe your situation... (e.g., 'customer is unhappy with service')"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {loadingSuggestions && question.length >= 5 && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            {isLoading ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        {/* Suggested Playbooks */}
        {suggestedPlaybooks.length > 0 && !answer && (
          <div className="mt-4 p-4 rounded-lg border border-slate-700 bg-slate-900/50">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-slate-300">Relevant Playbooks</span>
            </div>
            <div className="space-y-2">
              {suggestedPlaybooks.map((playbook: any) => (
                <Link
                  key={playbook.id}
                  href={`/app/playbooks/${playbook.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                      {playbook.title}
                    </h4>
                    {playbook.recommendationReasons && playbook.recommendationReasons.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        {playbook.recommendationReasons[0]}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </form>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 mb-8">
          {error}
        </div>
      )}

      {answer && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-3">Summary</h2>
            <p className="text-slate-200">{answer.summary}</p>
          </div>

          {/* Steps */}
          {answer.steps.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Steps</h2>
              <ol className="space-y-3">
                {answer.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-medium flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300 flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Caveats */}
          {answer.caveats.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Important Notes</h2>
              <ul className="space-y-2">
                {answer.caveats.map((caveat, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-yellow-400 flex-shrink-0">⚠</span>
                    <span className="text-slate-300 flex-1">{caveat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Answer */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Full Answer</h2>
            <article className="document-content">
              <ReactMarkdown>{answer.answer}</ReactMarkdown>
            </article>
          </div>

          {/* Referenced Playbooks */}
          {answer.referencedPlaybooks.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Referenced Playbooks
              </h2>
              <ul className="space-y-2">
                {answer.referencedPlaybooks.map((playbook) => (
                  <li key={playbook.id}>
                    <Link
                      href={`/app/playbooks/${playbook.id}`}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {playbook.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
