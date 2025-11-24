'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'

interface PlaybookFormProps {
  workspaceId: string
  initialData?: {
    title: string
    description: string
    contentMd: string
    tags: string[]
    triggers?: string[]
    relatedPlaybooks?: string[]
  }
  playbookId?: string
}

export default function PlaybookForm({ workspaceId, initialData, playbookId }: PlaybookFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    contentMd: initialData?.contentMd || '',
    tags: initialData?.tags?.join(', ') || '',
    triggers: initialData?.triggers?.join(', ') || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = playbookId ? `/api/playbooks/${playbookId}` : '/api/playbooks'
      const method = playbookId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          title: formData.title,
          description: formData.description,
          contentMd: formData.contentMd,
          tags: formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          triggers: formData.triggers
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save playbook')
      }

      const playbook = await response.json()
      router.push(`/app/playbooks/${playbook.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg border" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'var(--error)',
          color: 'var(--error)'
        }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Title *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
          placeholder="e.g., Customer Onboarding Process"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Description
        </label>
        <input
          type="text"
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
          placeholder="Brief summary of this playbook"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Tags
        </label>
        <input
          type="text"
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full px-4 py-3 border rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
          placeholder="onboarding, customer-success, setup (comma-separated)"
        />
      </div>

      <div>
        <label htmlFor="triggers" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          When to use this playbook
          <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
            (Helps with smart recommendations)
          </span>
        </label>
        <input
          type="text"
          id="triggers"
          value={formData.triggers}
          onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
          className="w-full px-4 py-3 border rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
          placeholder="new customer signed, contract closed, onboarding started (comma-separated)"
        />
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          Describe situations or triggers when this playbook should be used. This helps OpAtlas recommend the right playbook at the right time.
        </p>
      </div>

      <div>
        <label htmlFor="contentMd" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Content (Markdown) *
        </label>
        <textarea
          id="contentMd"
          required
          value={formData.contentMd}
          onChange={(e) => setFormData({ ...formData, contentMd: e.target.value })}
          rows={20}
          className="w-full px-4 py-3 border rounded-lg font-mono text-sm transition-colors"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
          placeholder="# Step 1: Introduction&#10;&#10;Describe the first step...&#10;&#10;## Substep 1.1&#10;&#10;Details here..."
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white'
          }}
        >
          <Save className="w-5 h-5" />
          {isLoading ? 'Saving...' : playbookId ? 'Update Playbook' : 'Create Playbook'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover-subtle"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
      </div>
    </form>
  )
}
